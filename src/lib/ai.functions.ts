// Server functions for schemes/profile/eligibility/documents. Client-safe path.
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

// Public: list schemes (any authenticated or anon)
export const listSchemes = createServerFn({ method: "GET" }).handler(async () => {
  const { createClient } = await import("@supabase/supabase-js");
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  const supa = createClient(process.env.SUPABASE_URL!, key, { auth: { persistSession: false } });
  const { data, error } = await supa.from("schemes").select("*").eq("is_active", true).order("name");
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getScheme = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ slug: z.string().min(1).max(100) }).parse(d))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const supa = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, { auth: { persistSession: false } });
    const { data: row, error } = await supa.from("schemes").select("*").eq("slug", data.slug).maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

type SchemeMatch = {
  slug: string;
  score: number;
  reason: string;
  confidence: "low" | "medium" | "high";
  scheme: {
    name: string;
    category: string;
    short_description: string | null;
  };
};

// Authenticated: run eligibility scoring with AI
export const runEligibility = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    const [profileR, familyR, schemesR] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("family_members").select("*").eq("user_id", userId),
      supabase.from("schemes").select("id,slug,name,category,eligibility_criteria,benefits,short_description").eq("is_active", true),
    ]);
    if (profileR.error) throw new Error(profileR.error.message);
    const profile = profileR.data;
    if (!profile) return { matches: [], score: 0 };

    const { createAI, REASONING_MODEL } = await import("./ai-gateway.server");
    const { generateText, Output, NoObjectGeneratedError } = await import("ai");
    const gateway = createAI(false);

    const schemes = schemesR.data ?? [];
    const prompt = `You are an eligibility engine for Indian government welfare schemes.
Score each scheme from 0-100 based on how well the citizen profile matches its eligibility criteria.
Return AT MOST the top 15 matches with score >= 30. Ignore schemes below that threshold.
Give a short "reason" (max 140 chars, plain English) and a "confidence" (low/medium/high).

CITIZEN PROFILE:
${JSON.stringify({
  age: profile.date_of_birth ? Math.floor((Date.now() - new Date(profile.date_of_birth).getTime()) / (365.25 * 86400000)) : null,
  gender: profile.gender, state: profile.state, city: profile.city,
  category: profile.category, annual_income: profile.annual_income,
  occupation: profile.occupation, education: profile.education,
  marital_status: profile.marital_status, disability: profile.disability_status,
  family_size: (familyR.data?.length ?? 0) + 1,
}, null, 2)}

SCHEMES:
${schemes.map((s) => `- ${s.slug}: ${s.name} | ${s.category} | criteria=${JSON.stringify(s.eligibility_criteria)}`).join("\n")}

Return JSON: { "matches": [{"slug": "...", "score": 0-100, "reason": "...", "confidence": "low|medium|high"}] }`;

    try {
      const { output } = await generateText({
        model: gateway(REASONING_MODEL),
        output: Output.object({
          schema: z.object({
            matches: z.array(z.object({
              slug: z.string(),
              score: z.number(),
              reason: z.string(),
              confidence: z.enum(["low", "medium", "high"]),
            })),
          }),
        }),
        prompt,
      });

      // Enrich with scheme details
      const enriched = output.matches
        .map((m) => {
          const s = schemes.find((x) => x.slug === m.slug);
          if (!s) return null;
          return { ...m, scheme: s };
        })
        .filter(Boolean)
        .sort((a, b) => (b!.score - a!.score));

      const topScore = enriched[0]?.score ?? 0;
      const avg = enriched.length ? Math.round(enriched.reduce((a, b) => a + b!.score, 0) / enriched.length) : 0;

      // Update profile eligibility score
      await supabase.from("profiles").update({ eligibility_score: Math.max(topScore, avg) }).eq("id", userId);
      const { notifyNewEligibleSchemes } = await import("@/integrations/notifications");
      await notifyNewEligibleSchemes(supabase, userId, enriched as SchemeMatch[]);

      return { matches: enriched, score: Math.max(topScore, avg) };
    } catch (e) {
      if (NoObjectGeneratedError.isInstance(e)) return { matches: [], score: 0 };
      throw e;
    }
  });

// Authenticated: chat with SchemeSync assistant
export const chatWithAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ message: z.string().min(1).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const [profileR, schemesR, historyR] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
      supabase.from("schemes").select("name,slug,short_description,category,benefits,eligibility_criteria").eq("is_active", true).limit(30),
      supabase.from("chat_messages").select("role,content").eq("user_id", userId).order("created_at", { ascending: false }).limit(10),
    ]);

    const { createAI, CHAT_MODEL } = await import("./ai-gateway.server");
    const { generateText } = await import("ai");
    const gateway = createAI(false);

    const system = `You are SchemeSync, an assistant helping Indian citizens find and apply for government welfare schemes.
Always be concise, factual, and cite scheme names. If you don't know, say so. Never invent scheme details.
The user's profile: ${JSON.stringify(profileR.data ?? {})}
Available schemes (context for grounding):
${(schemesR.data ?? []).map((s) => `- ${s.name} (${s.slug}): ${s.short_description}. Benefits: ${s.benefits}`).join("\n")}`;

    const history = (historyR.data ?? []).reverse();
    const messages = [
      { role: "system" as const, content: system },
      ...history.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user" as const, content: data.message },
    ];

    const { text } = await generateText({ model: gateway(CHAT_MODEL), messages });

    await supabase.from("chat_messages").insert([
      { user_id: userId, role: "user", content: data.message },
      { user_id: userId, role: "assistant", content: text },
    ]);

    return { reply: text };
  });

// Authenticated: OCR + verify a document
export const analyzeResume = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    profileSummary: z.string().optional(),
    resumeDraft: z.object({
      fullName: z.string().optional(),
      headline: z.string().optional(),
      summary: z.string().optional(),
      skills: z.array(z.string()).optional(),
      atsScore: z.number().optional(),
      suggestions: z.array(z.string()).optional(),
    }).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { createAI, REASONING_MODEL } = await import("./ai-gateway.server");
    const { generateText, Output, NoObjectGeneratedError } = await import("ai");
    const gateway = createAI(true);

    const prompt = `You are an expert resume coach for job seekers. Review the candidate profile and resume draft, then return a concise assessment.

PROFILE:
${data.profileSummary ?? "No profile information provided."}

RESUME DRAFT:
${JSON.stringify(data.resumeDraft ?? {}, null, 2)}

Return JSON:
{
  "atsScore": 0-100,
  "headline": "string",
  "summary": "string",
  "suggestions": ["string"],
  "keywords": ["string"]
}`;

    try {
      const { output } = await generateText({
        model: gateway(REASONING_MODEL),
        output: Output.object({
          schema: z.object({
            atsScore: z.number().min(0).max(100),
            headline: z.string(),
            summary: z.string(),
            suggestions: z.array(z.string()),
            keywords: z.array(z.string()),
          }),
        }),
        prompt,
      });

      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return {
          atsScore: 72,
          headline: data.resumeDraft?.headline ?? "Professional with strong problem-solving skills",
          summary: data.resumeDraft?.summary ?? "Focused on delivering clear outcomes through collaboration, execution, and continuous learning.",
          suggestions: ["Add a quantified achievement to strengthen your impact statement.", "Include 3 more skills that match your target role."],
          keywords: data.resumeDraft?.skills ?? [],
        };
      }
      throw error;
    }
  });

export const buildResume = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({
    profileSummary: z.string().optional(),
    targetRole: z.string().optional(),
    resumeDraft: z.object({
      fullName: z.string().optional(),
      headline: z.string().optional(),
      summary: z.string().optional(),
      skills: z.array(z.string()).optional(),
      experienceBullets: z.array(z.string()).optional(),
      coverLetterHook: z.string().optional(),
    }).optional(),
  }).parse(d))
  .handler(async ({ data }) => {
    const { createAI, REASONING_MODEL } = await import("./ai-gateway.server");
    const { generateText, Output, NoObjectGeneratedError } = await import("ai");
    const gateway = createAI(true);

    const prompt = `You are a smart resume builder and career coach. Use the profile details and the optional target role to generate a polished, recruiter-friendly resume draft, including a stronger headline, summary, skill set, and 3 experience bullet points. Also provide an ATS score and at least 3 suggestions for improvement.

TARGET ROLE:
${data.targetRole ?? "General professional role"}

PROFILE:
${data.profileSummary ?? "No profile information provided."}

CURRENT DRAFT:
${JSON.stringify(data.resumeDraft ?? {}, null, 2)}

Return JSON with these fields:
{
  "fullName": "string",
  "headline": "string",
  "summary": "string",
  "skills": ["string"],
  "experienceBullets": ["string"],
  "atsScore": 0-100,
  "suggestions": ["string"],
  "coverLetterHook": "string"
}`;

    try {
      const { output } = await generateText({
        model: gateway(REASONING_MODEL),
        output: Output.object({
          schema: z.object({
            fullName: z.string(),
            headline: z.string(),
            summary: z.string(),
            skills: z.array(z.string()),
            experienceBullets: z.array(z.string()),
            atsScore: z.number().min(0).max(100),
            suggestions: z.array(z.string()),
            coverLetterHook: z.string(),
          }),
        }),
        prompt,
      });

      return output;
    } catch (error) {
      if (NoObjectGeneratedError.isInstance(error)) {
        return {
          fullName: data.resumeDraft?.fullName ?? "Your Name",
          headline: data.resumeDraft?.headline ?? "Problem-solving professional",
          summary: data.resumeDraft?.summary ?? "Focused on turning complex work into clear outcomes with strong collaboration and execution.",
          skills: data.resumeDraft?.skills ?? [],
          experienceBullets: data.resumeDraft?.experienceBullets ?? ["Highlight a measurable achievement in your most recent role.", "Show a clear outcome from a difficult project.", "Emphasize team collaboration and delivery."],
          atsScore: 72,
          suggestions: ["Add a quantified achievement to strengthen your impact statement.", "Include more role-specific keywords from the target job description.", "Keep bullet points results-oriented and concise."],
          coverLetterHook: `I am excited to apply for ${data.targetRole ?? "this opportunity"} because my experience in ${data.resumeDraft?.skills?.slice(0, 3).join(", ") ?? "related areas"} aligns strongly with the role.`,
        };
      }
      throw error;
    }
  });

export const processDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({ documentId: z.string().uuid() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: doc, error } = await supabase.from("documents").select("*").eq("id", data.documentId).eq("user_id", userId).maybeSingle();
    if (error || !doc) throw new Error("Document not found");

    await supabase.from("documents").update({ status: "processing" }).eq("id", doc.id);

    // Create signed URL for the file
    const { data: signed } = await supabase.storage.from("documents").createSignedUrl(doc.file_path, 300);
    if (!signed?.signedUrl) throw new Error("Cannot access file");

    // Fetch and base64
    const res = await fetch(signed.signedUrl);
    const buf = await res.arrayBuffer();
    const b64 = Buffer.from(buf).toString("base64");
    const mime = doc.mime_type || "image/jpeg";

    const { createAI, VISION_MODEL } = await import("./ai-gateway.server");
    const { generateText, Output, NoObjectGeneratedError } = await import("ai");
    const gateway = createAI(false);

    try {
      const { output, text } = await generateText({
        model: gateway(VISION_MODEL),
        output: Output.object({
          schema: z.object({
            document_type: z.string(),
            extracted_fields: z.record(z.string(), z.string()),
            confidence: z.number(),
            issues: z.array(z.string()),
          }),
        }),
        messages: [{
          role: "user",
          content: [
            { type: "text", text: `Analyze this Indian government document. Detect its type (aadhaar/pan/income_certificate/caste_certificate/ration_card/other), extract every visible field (name, number, dob, address, etc.), give a confidence 0-1, and list any issues (blur, missing fields, watermark absent).` },
            mime.startsWith("image/")
              ? { type: "image", image: `data:${mime};base64,${b64}` } as const
              : { type: "file", data: `data:${mime};base64,${b64}`, mediaType: mime } as const,
          ],
        }],
      });

      const status = output.confidence >= 0.7 && output.issues.length === 0 ? "verified" : "failed";
      await supabase.from("documents").update({
        status,
        ocr_text: text.slice(0, 5000),
        extracted_data: output.extracted_fields,
        ai_confidence: output.confidence,
      }).eq("id", doc.id);

      return { ok: true, output };
    } catch (e) {
      await supabase.from("documents").update({ status: "failed" }).eq("id", doc.id);
      if (NoObjectGeneratedError.isInstance(e)) return { ok: false, error: "Could not parse document" };
      throw e;
    }
  });
