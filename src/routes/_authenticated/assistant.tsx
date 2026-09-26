import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { chatWithAssistant } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Sparkles, User, Loader2 } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — SchemeSync AI" }] }),
  component: AssistantPage,
});

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTED = [
  "Which schemes am I eligible for right now?",
  "How do I apply for Ayushman Bharat?",
  "What documents do I need for PM-KISAN?",
  "Explain PMAY in simple language",
];

function AssistantPage() {
  const chat = useServerFn(chatWithAssistant);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  const history = useQuery({
    queryKey: ["chat-history"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      const { data } = await supabase.from("chat_messages")
        .select("role, content").eq("user_id", u.user!.id)
        .order("created_at", { ascending: true }).limit(50);
      return (data ?? []) as Msg[];
    },
  });

  useEffect(() => { if (history.data && messages.length === 0) setMessages(history.data); }, [history.data]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || busy) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: msg }]);
    setBusy(true);
    try {
      const r = await chat({ data: { message: msg } });
      setMessages((prev) => [...prev, { role: "assistant", content: r.reply }]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 pb-4 border-b border-border">
        <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
          <Sparkles className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <div className="font-semibold">SchemeSync Assistant</div>
          <div className="text-xs text-muted-foreground">Gemini · Grounded on 20+ Indian schemes</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6 space-y-6">
        {messages.length === 0 && (
          <div className="text-center py-10">
            <Sparkles className="h-10 w-10 text-primary mx-auto" />
            <h2 className="mt-3 text-xl font-semibold">How can I help?</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ask anything about government schemes.</p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
              {SUGGESTED.map((s) => (
                <button key={s} onClick={() => send(s)} className="text-left rounded-xl border border-border bg-card p-3 text-sm hover:bg-accent transition-colors">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-secondary" : "bg-gradient-primary"}`}>
              {m.role === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary-foreground" />}
            </div>
            <div className={`rounded-2xl px-4 py-3 max-w-[80%] shadow-soft ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-card border border-border"}`}>
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {busy && (
          <div className="flex gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center"><Loader2 className="h-4 w-4 text-primary-foreground animate-spin" /></div>
            <div className="rounded-2xl px-4 py-3 bg-card border border-border text-sm text-muted-foreground">Thinking...</div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="pt-4 border-t border-border">
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about any scheme, eligibility, or application..."
            rows={1}
            maxLength={2000}
            className="resize-none min-h-11"
          />
          <Button type="submit" disabled={busy || !input.trim()} className="bg-gradient-primary shadow-elegant h-11 px-4">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
