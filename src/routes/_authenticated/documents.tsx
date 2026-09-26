import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { processDocument } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Upload, FileText, Loader2, Trash2, CheckCircle2, XCircle, Clock, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/documents")({
  head: () => ({ meta: [{ title: "Document Vault — SchemeSync AI" }] }),
  component: DocumentsPage,
});

const DOC_TYPES = ["aadhaar","pan","income_certificate","caste_certificate","ration_card","domicile","bank_passbook","disability_certificate","birth_certificate","marksheet","photo","other"] as const;

function DocumentsPage() {
  const qc = useQueryClient();
  const process = useServerFn(processDocument);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<typeof DOC_TYPES[number]>("aadhaar");
  const [uploading, setUploading] = useState(false);

  const docs = useQuery({
    queryKey: ["docs"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("documents").select("*").eq("user_id", u.user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const doUpload = async () => {
    if (!file) return toast.error("Choose a file");
    setUploading(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      const uid = u.user!.id;
      const path = `${uid}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const { error: upErr } = await supabase.storage.from("documents").upload(path, file);
      if (upErr) throw upErr;
      const { data: doc, error } = await supabase.from("documents").insert({
        user_id: uid, name: name || file.name, doc_type: type, file_path: path,
        mime_type: file.type, size_bytes: file.size, status: "pending",
      }).select().single();
      if (error) throw error;
      toast.success("Uploaded — AI is analyzing...");
      setOpen(false); setFile(null); setName(""); setType("aadhaar");
      qc.invalidateQueries({ queryKey: ["docs"] });
      // Trigger OCR
      process({ data: { documentId: doc.id } })
        .then(() => qc.invalidateQueries({ queryKey: ["docs"] }))
        .catch(() => toast.error("AI analysis failed"));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally { setUploading(false); }
  };

  const del = useMutation({
    mutationFn: async (d: { id: string; file_path: string }) => {
      await supabase.storage.from("documents").remove([d.file_path]);
      await supabase.from("documents").delete().eq("id", d.id);
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["docs"] }); toast.success("Deleted"); },
  });

  const reanalyze = async (id: string) => {
    toast.info("Re-analyzing...");
    await process({ data: { documentId: id } });
    qc.invalidateQueries({ queryKey: ["docs"] });
    toast.success("Analysis complete");
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Document vault</h1>
          <p className="mt-1 text-muted-foreground">Encrypted storage · AI-verified · Only you can see</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-elegant"><Upload className="h-4 w-4 mr-2" /> Upload document</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Upload a document</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Document type</Label>
                <Select value={type} onValueChange={(v) => setType(v as typeof DOC_TYPES[number])}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Display name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Aadhaar card" className="mt-1.5" maxLength={120} />
              </div>
              <div>
                <Label>File (PDF, JPG, PNG, HEIC, DOCX)</Label>
                <Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} accept=".pdf,.jpg,.jpeg,.png,.heic,.docx,image/*,application/pdf" className="mt-1.5" />
              </div>
              <Button onClick={doUpload} disabled={uploading || !file} className="w-full bg-gradient-primary">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Upload & analyze"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8">
        {docs.isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin" /></div>
        ) : (docs.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="mt-3 text-muted-foreground">No documents yet. Upload your first one.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(docs.data ?? []).map((d) => (
              <div key={d.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-gradient-primary/10 flex items-center justify-center border border-primary/20">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <StatusBadge status={d.status} />
                </div>
                <div className="mt-3 font-medium truncate">{d.name}</div>
                <div className="text-xs text-muted-foreground capitalize">{d.doc_type.replace(/_/g, " ")}</div>
                {d.ai_confidence != null && d.ai_confidence > 0 && (
                  <div className="mt-3 text-xs text-muted-foreground">AI confidence: <span className="font-medium text-foreground">{Math.round(Number(d.ai_confidence) * 100)}%</span></div>
                )}
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => reanalyze(d.id)} className="flex-1">
                    <Sparkles className="h-3.5 w-3.5 mr-1" /> Re-scan
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate({ id: d.id, file_path: d.file_path })} className="text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { c: string; i: React.ComponentType<{ className?: string }>; l: string }> = {
    pending: { c: "bg-muted text-muted-foreground", i: Clock, l: "Pending" },
    processing: { c: "bg-warning/20 text-warning-foreground", i: Loader2, l: "Analyzing" },
    verified: { c: "bg-success/20 text-success-foreground", i: CheckCircle2, l: "Verified" },
    failed: { c: "bg-destructive/15 text-destructive", i: XCircle, l: "Failed" },
  };
  const s = map[status] ?? map.pending;
  const I = s.i;
  return <span className={`inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded-full ${s.c}`}><I className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />{s.l}</span>;
}
