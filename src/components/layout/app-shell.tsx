import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect, useState } from "react";
import {
  LayoutDashboard, User, Users, FileText, Search, Bookmark, Sparkles,
  ClipboardList, Bell, Settings, LogOut, Menu, X, Moon, Sun,
} from "lucide-react";
import { signOutFirebase } from "@/integrations/firebase/client";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/schemes", label: "Schemes", icon: Search },
  { to: "/eligibility", label: "Eligibility", icon: Sparkles },
  { to: "/saved", label: "Saved", icon: Bookmark },
  { to: "/applications", label: "Applications", icon: ClipboardList },
  { to: "/documents", label: "Documents", icon: FileText },
  { to: "/assistant", label: "AI Assistant", icon: Sparkles },
  { to: "/family", label: "Family", icon: Users },
  { to: "/profile", label: "Profile", icon: User },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = typeof window !== "undefined" && localStorage.getItem("ss-theme") === "dark";
    setDark(saved);
    document.documentElement.classList.toggle("dark", saved);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("ss-theme", next ? "dark" : "light");
  };

  const signOut = async () => {
    await Promise.allSettled([supabase.auth.signOut(), signOutFirebase()]);
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile top bar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between border-b border-border bg-background/80 backdrop-blur px-4 h-14">
        <Link to="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="h-7 w-7 rounded-lg bg-gradient-primary shadow-glow" />
          SchemeSync
        </Link>
        <button onClick={() => setOpen(!open)} className="p-2 rounded-md hover:bg-accent">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky top-0 z-40 h-screen w-72 shrink-0 border-r border-sidebar-border bg-sidebar transition-transform lg:translate-x-0",
            open ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            <div className="hidden lg:flex items-center gap-3 h-16 px-5 border-b border-sidebar-border">
              <div className="h-9 w-9 rounded-xl bg-gradient-primary shadow-glow" />
              <div>
                <div className="font-bold tracking-tight">SchemeSync AI</div>
                <div className="text-xs text-muted-foreground">One profile. Every benefit.</div>
              </div>
            </div>
            <nav className="flex-1 overflow-y-auto p-3 space-y-1">
              {nav.map((item) => {
                const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/60"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="p-3 border-t border-sidebar-border space-y-1">
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={toggleTheme}>
                {dark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
                {dark ? "Light mode" : "Dark mode"}
              </Button>
              <Button variant="ghost" size="sm" className="w-full justify-start text-destructive" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-2" /> Sign out
              </Button>
            </div>
          </div>
        </aside>

        {open && <div className="lg:hidden fixed inset-0 z-30 bg-black/40" onClick={() => setOpen(false)} />}

        <main className="flex-1 min-w-0">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
