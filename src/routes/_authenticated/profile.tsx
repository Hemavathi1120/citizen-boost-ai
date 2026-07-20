import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

export const Route = createFileRoute("/_authenticated/profile")({
  head: () => ({ meta: [{ title: "Profile — SchemeSync AI" }] }),
  component: ProfilePage,
});

const STATES = ["Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh","Puducherry","Chandigarh","Andaman and Nicobar","Dadra and Nagar Haveli and Daman and Diu","Lakshadweep"];

type Profile = {
  full_name: string | null; phone: string | null; date_of_birth: string | null;
  gender: string | null; state: string | null; city: string | null; pincode: string | null;
  category: string | null; annual_income: number | null; occupation: string | null;
  education: string | null; marital_status: string | null; disability_status: boolean | null;
  aadhaar_last4: string | null;
};

function ProfilePage() {
  const qc = useQueryClient();
  const [form, setForm] = useState<Profile | null>(null);

  const q = useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("profiles").select("*").eq("id", u.user!.id).maybeSingle();
      return data as Profile;
    },
  });

  useEffect(() => { if (q.data && !form) setForm(q.data); }, [q.data, form]);

  const save = useMutation({
    mutationFn: async (p: Profile) => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("profiles").update({
        ...p,
        annual_income: p.annual_income ? Number(p.annual_income) : null,
        onboarding_complete: true,
      }).eq("id", u.user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Profile saved"); qc.invalidateQueries({ queryKey: ["my-profile"] }); qc.invalidateQueries({ queryKey: ["profile"] }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to save"),
  });

  if (!form) return <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => setForm({ ...form, [k]: v });

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
      <p className="mt-1 text-muted-foreground">The more we know, the better AI matches you to benefits.</p>

      <form className="mt-8 space-y-8" onSubmit={(e) => { e.preventDefault(); save.mutate(form); }}>
        <Section title="Personal">
          <Field label="Full name"><Input value={form.full_name ?? ""} onChange={(e) => set("full_name", e.target.value)} maxLength={100} /></Field>
          <Field label="Phone"><Input value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} placeholder="+91 ..." maxLength={20} /></Field>
          <Field label="Date of birth"><Input type="date" value={form.date_of_birth ?? ""} onChange={(e) => set("date_of_birth", e.target.value)} /></Field>
          <Field label="Gender">
            <Select value={form.gender ?? ""} onValueChange={(v) => set("gender", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Marital status">
            <Select value={form.marital_status ?? ""} onValueChange={(v) => set("marital_status", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single</SelectItem>
                <SelectItem value="married">Married</SelectItem>
                <SelectItem value="widow">Widowed</SelectItem>
                <SelectItem value="divorced">Divorced</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Aadhaar (last 4)"><Input value={form.aadhaar_last4 ?? ""} onChange={(e) => set("aadhaar_last4", e.target.value.replace(/\D/g, "").slice(0, 4))} placeholder="1234" maxLength={4} /></Field>
        </Section>

        <Section title="Location">
          <Field label="State">
            <Select value={form.state ?? ""} onValueChange={(v) => set("state", v)}>
              <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
              <SelectContent className="max-h-72">{STATES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Field label="City / district"><Input value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} maxLength={100} /></Field>
          <Field label="PIN code"><Input value={form.pincode ?? ""} onChange={(e) => set("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))} maxLength={6} /></Field>
        </Section>

        <Section title="Socio-economic">
          <Field label="Category">
            <Select value={form.category ?? ""} onValueChange={(v) => set("category", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="General">General</SelectItem>
                <SelectItem value="OBC">OBC</SelectItem>
                <SelectItem value="SC">SC</SelectItem>
                <SelectItem value="ST">ST</SelectItem>
                <SelectItem value="EWS">EWS</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Annual household income (₹)"><Input type="number" value={form.annual_income ?? ""} onChange={(e) => set("annual_income", e.target.value ? Number(e.target.value) : null)} /></Field>
          <Field label="Occupation">
            <Select value={form.occupation ?? ""} onValueChange={(v) => set("occupation", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="farmer">Farmer</SelectItem>
                <SelectItem value="salaried">Salaried</SelectItem>
                <SelectItem value="self_employed">Self-employed</SelectItem>
                <SelectItem value="entrepreneur">Entrepreneur</SelectItem>
                <SelectItem value="unorganized_worker">Unorganized worker</SelectItem>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="unemployed">Unemployed</SelectItem>
                <SelectItem value="retired">Retired</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Education">
            <Select value={form.education ?? ""} onValueChange={(v) => set("education", v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="higher_secondary">Higher secondary</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
                <SelectItem value="post_matric">Post-matric</SelectItem>
                <SelectItem value="postgraduate">Postgraduate</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <div>
              <div className="font-medium text-sm">Disability status</div>
              <div className="text-xs text-muted-foreground">Enable if you hold a valid disability certificate</div>
            </div>
            <Switch checked={!!form.disability_status} onCheckedChange={(v) => set("disability_status", v)} />
          </div>
        </Section>

        <div className="flex justify-end">
          <Button type="submit" disabled={save.isPending} className="bg-gradient-primary shadow-elegant">
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="h-4 w-4 mr-2" /> Save profile</>}
          </Button>
        </div>
      </form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
      <h2 className="text-lg font-semibold">{title}</h2>
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><Label>{label}</Label><div className="mt-1.5">{children}</div></div>;
}
