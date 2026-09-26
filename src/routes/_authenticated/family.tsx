import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export const Route = createFileRoute("/_authenticated/family")({
  head: () => ({ meta: [{ title: "Family — SchemeSync AI" }] }),
  component: FamilyPage,
});

function FamilyPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", relation: "spouse", date_of_birth: "", gender: "", occupation: "", annual_income: "" });

  const list = useQuery({
    queryKey: ["family"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("family_members").select("*").eq("user_id", u.user!.id).order("created_at");
      return data ?? [];
    },
  });

  const add = useMutation({
    mutationFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { error } = await supabase.from("family_members").insert({
        user_id: u.user!.id, ...form,
        date_of_birth: form.date_of_birth || null,
        annual_income: form.annual_income ? Number(form.annual_income) : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Added");
      setOpen(false);
      setForm({ name: "", relation: "spouse", date_of_birth: "", gender: "", occupation: "", annual_income: "" });
      qc.invalidateQueries({ queryKey: ["family"] });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { await supabase.from("family_members").delete().eq("id", id); },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family"] }),
  });

  return (
    <div>
      <div className="flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Family members</h1>
          <p className="mt-1 text-muted-foreground">Add dependents to find benefits for them too</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary shadow-elegant"><Plus className="h-4 w-4 mr-2" /> Add member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Add a family member</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} maxLength={100} className="mt-1.5" /></div>
              <div><Label>Relation</Label>
                <Select value={form.relation} onValueChange={(v) => setForm({ ...form, relation: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["spouse","son","daughter","father","mother","sibling","other"].map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Date of birth</Label><Input type="date" value={form.date_of_birth} onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })} className="mt-1.5" /></div>
              <div><Label>Gender</Label>
                <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label>Occupation</Label><Input value={form.occupation} onChange={(e) => setForm({ ...form, occupation: e.target.value })} maxLength={60} className="mt-1.5" /></div>
              <div><Label>Annual income (₹)</Label><Input type="number" value={form.annual_income} onChange={(e) => setForm({ ...form, annual_income: e.target.value })} className="mt-1.5" /></div>
              <Button onClick={() => add.mutate()} disabled={add.isPending || !form.name.trim()} className="w-full bg-gradient-primary">Add</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mt-8">
        {(list.data ?? []).length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center bg-card/50">
            <Users className="h-10 w-10 text-muted-foreground mx-auto" />
            <p className="mt-3 text-muted-foreground">No family members added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {list.data!.map((m) => (
              <div key={m.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-primary font-medium">{m.relation}</div>
                    <div className="mt-1 font-semibold">{m.name}</div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => del.mutate(m.id)} className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                  {m.date_of_birth && <div>DOB: {m.date_of_birth}</div>}
                  {m.occupation && <div>Occupation: {m.occupation}</div>}
                  {m.annual_income != null && <div>Income: ₹{Number(m.annual_income).toLocaleString("en-IN")}/yr</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
