import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Sparkles, Shield, FileCheck, Search, Bot, Bell, ArrowRight,
  CheckCircle2, Users, IndianRupee, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SchemeSync AI — Discover every government benefit you're eligible for" },
      { name: "description", content: "One profile. Every benefit. AI matches you to Indian government welfare schemes, verifies documents with OCR, and prepares your applications in minutes." },
    ],
  }),
  component: Landing,
});

const stats = [
  { label: "Central + State schemes", value: "950+", icon: Search },
  { label: "Beneficiaries potential", value: "₹1.2L Cr", icon: IndianRupee },
  { label: "Avg. discovery time", value: "< 2 min", icon: Clock },
];

const features = [
  { icon: Sparkles, title: "AI Eligibility Engine", desc: "Answer once. Our AI scores you across every scheme and ranks the ones you qualify for." },
  { icon: FileCheck, title: "Smart Document Vault", desc: "Upload Aadhaar, income certificates, PAN. Gemini Vision OCR extracts and verifies fields." },
  { icon: Bot, title: "Multilingual AI Guide", desc: "Ask anything in plain English or Hindi. RAG-grounded answers with confidence scores." },
  { icon: Shield, title: "Privacy by design", desc: "Row-level security, encrypted storage, no data sold. You control every document." },
  { icon: Bell, title: "Deadline Reminders", desc: "Never miss an application window, renewal, or verification date." },
  { icon: Users, title: "Family Profiles", desc: "Add family members and discover benefits for children, elders, and dependents too." },
];

const steps = [
  { n: "01", t: "Create your profile", d: "Age, state, income, category, education — takes 90 seconds." },
  { n: "02", t: "Upload documents", d: "Drop your Aadhaar or PAN. AI extracts, verifies, and stores securely." },
  { n: "03", t: "See matched schemes", d: "AI ranks every eligible scheme with a confidence score and reasoning." },
  { n: "04", t: "Apply with guidance", d: "AI prepares your application. Submit officially or download the packet." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
            <span className="h-8 w-8 rounded-xl bg-gradient-primary shadow-glow" />
            SchemeSync <span className="text-primary">AI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#faq" className="hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
            <Button asChild size="sm" className="bg-gradient-primary hover:opacity-90 shadow-elegant">
              <Link to="/auth">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-mesh pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
              <Sparkles className="h-3.5 w-3.5 text-saffron" />
              Powered by Gemini · RAG-grounded · Made for India
            </div>
            <h1 className="mt-6 text-5xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              One profile.<br />
              <span className="text-gradient">Every benefit.</span>
            </h1>
            <p className="mt-6 text-lg lg:text-xl text-muted-foreground max-w-2xl leading-relaxed">
              SchemeSync AI discovers the government welfare schemes you qualify for,
              verifies your documents with computer vision, and prepares your applications
              through official channels — all in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-gradient-primary hover:opacity-90 shadow-elegant text-base h-12 px-6">
                <Link to="/auth">
                  Check my eligibility <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6 text-base">
                <a href="#how">See how it works</a>
              </Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> No signup card needed</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Free to use</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success" /> Data stays yours</div>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {stats.map((s) => (
              <div key={s.label} className="glass rounded-2xl p-6 shadow-soft">
                <s.icon className="h-5 w-5 text-primary" />
                <div className="mt-4 text-3xl font-bold tracking-tight">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Platforms */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Platforms</p>
            <h2 className="mt-3 text-4xl lg:text-5xl font-bold tracking-tight">Choose your path</h2>
            <p className="mt-4 text-lg text-muted-foreground">One account, endless opportunities</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Benefits Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="group rounded-3xl border border-border bg-card p-8 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-gradient-primary group-hover:border-transparent transition-all mb-6">
                <Sparkles className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Government Benefits</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Discover every government welfare scheme you qualify for. AI matches, documents verified, applications guided.
              </p>
              <Button asChild className="bg-gradient-primary hover:opacity-90 w-full">
                <Link to="/auth">Explore Benefits <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </motion.div>

            {/* Jobs Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="group rounded-3xl border border-border bg-card p-8 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all"
            >
              <div className="h-12 w-12 rounded-2xl bg-gradient-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-gradient-primary group-hover:border-transparent transition-all mb-6">
                <Search className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-3">AI Jobs Matching</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Get matched with jobs that fit your skills. Resume optimized, cover letters generated, applications tracked.
              </p>
              <Button asChild variant="outline" className="w-full border-border hover:border-primary">
                <Link to="/jobs/login">Explore Jobs <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-secondary/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">Features</p>
            <h2 className="mt-3 text-4xl lg:text-5xl font-bold tracking-tight">Built for real Indian citizens</h2>
            <p className="mt-4 text-lg text-muted-foreground">Not a policy site. Not a search engine. A working AI agent that gets you your benefits.</p>
          </div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="group rounded-2xl border border-border bg-card p-6 shadow-soft hover:shadow-elegant hover:-translate-y-1 transition-all"
              >
                <div className="h-11 w-11 rounded-xl bg-gradient-primary/10 flex items-center justify-center border border-primary/20 group-hover:bg-gradient-primary group-hover:border-transparent transition-all">
                  <f.icon className="h-5 w-5 text-primary group-hover:text-primary-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider">How it works</p>
            <h2 className="mt-3 text-4xl lg:text-5xl font-bold tracking-tight">Four steps. That's it.</h2>
          </div>
          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-soft"
              >
                <div className="text-4xl font-bold text-gradient">{s.n}</div>
                <h3 className="mt-3 text-lg font-semibold">{s.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-hero p-12 lg:p-16 shadow-elegant">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight text-primary-foreground">
                Ready to claim what's yours?
              </h2>
              <p className="mt-4 text-lg text-primary-foreground/80">
                Thousands of eligible citizens miss out on benefits every year because they don't know they qualify. Not you. Not anymore.
              </p>
              <Button asChild size="lg" className="mt-8 bg-background text-foreground hover:bg-background/90 h-12 px-6 text-base shadow-glow">
                <Link to="/auth">Get started free <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 bg-secondary/30">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold tracking-tight">Questions</h2>
          <div className="mt-10 space-y-4">
            {[
              { q: "Is my data safe?", a: "Yes. Every row is protected by row-level security. Documents are encrypted at rest and only accessible to you. We never sell data." },
              { q: "Which schemes are covered?", a: "20+ central schemes at launch (PM-KISAN, Ayushman Bharat, PMAY, Ujjwala, and more), with state schemes rolling out weekly." },
              { q: "Can AI actually submit my application?", a: "For schemes with public APIs, yes. Otherwise we prepare a complete filing packet and guide you through the official portal." },
              { q: "Is it free?", a: "The citizen platform is free. Enterprise onboarding (CSC, NGO, government partnerships) is priced per seat." },
            ].map((f) => (
              <details key={f.q} className="group rounded-xl border border-border bg-card p-5 [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex items-center justify-between cursor-pointer font-medium">
                  {f.q}
                  <span className="text-muted-foreground group-open:rotate-45 transition-transform text-xl">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="h-6 w-6 rounded-lg bg-gradient-primary" />
            © {new Date().getFullYear()} SchemeSync AI. Built for Bharat.
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
