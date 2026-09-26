import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listSchemes } from "@/lib/ai.functions";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Building2 } from "lucide-react";

export const Route = createFileRoute("/_authenticated/schemes/")({
  head: () => ({ meta: [{ title: "All Schemes — SchemeSync AI" }] }),
  component: SchemesPage,
});

type Scheme = {
  id: string; slug: string; name: string; short_description: string | null;
  category: string; level: "central" | "state"; state: string | null; ministry: string | null;
  tags: string[] | null; benefits: string | null;
};

function SchemesPage() {
  const list = useServerFn(listSchemes);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const data = useQuery({ queryKey: ["schemes"], queryFn: () => list({ data: undefined as never }) });

  const schemes = (data.data ?? []) as Scheme[];
  const categories = useMemo(() => Array.from(new Set(schemes.map((s) => s.category))).sort(), [schemes]);
  const filtered = schemes.filter((s) => {
    if (cat !== "all" && s.category !== cat) return false;
    if (!q.trim()) return true;
    const hay = `${s.name} ${s.short_description} ${s.category} ${(s.tags ?? []).join(" ")}`.toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div>
      <div className="flex items-end justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Government schemes</h1>
          <p className="mt-1 text-muted-foreground">{schemes.length} schemes indexed · Central + State</p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search schemes, tags, ministry..." className="pl-9 h-11" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterPill active={cat === "all"} onClick={() => setCat("all")}>All</FilterPill>
          {categories.map((c) => (
            <FilterPill key={c} active={cat === c} onClick={() => setCat(c)}>{c}</FilterPill>
          ))}
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s) => (
          <Link key={s.id} to="/schemes/$slug" params={{ slug: s.slug }} className="group rounded-2xl border border-border bg-card p-5 shadow-soft hover:shadow-elegant hover:-translate-y-0.5 transition-all">
            <div className="flex items-start justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-primary">{s.category}</span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground uppercase">{s.level}</span>
            </div>
            <h3 className="mt-2 font-semibold leading-snug group-hover:text-primary transition-colors">{s.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{s.short_description}</p>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted-foreground">
              {s.ministry && <span className="flex items-center gap-1"><Building2 className="h-3 w-3" /> {s.ministry.replace("Ministry of ", "")}</span>}
              {s.state && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.state}</span>}
            </div>
          </Link>
        ))}
        {filtered.length === 0 && !data.isLoading && (
          <div className="col-span-full text-center py-16 text-muted-foreground">No schemes match your search.</div>
        )}
      </div>
    </div>
  );
}

function FilterPill({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3.5 py-2 rounded-full text-sm font-medium border transition-colors ${
        active ? "bg-primary text-primary-foreground border-primary shadow-soft" : "bg-card border-border text-foreground hover:bg-accent"
      }`}
    >{children}</button>
  );
}
