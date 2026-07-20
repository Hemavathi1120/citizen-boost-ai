import { createFileRoute, Outlet, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  Sparkles, Search, BarChart3, Users, Settings, LogOut,
  Menu, X,
} from "lucide-react";

export const Route = createFileRoute("/jobs/_authenticated")({
  component: JobsAuthenticatedLayout,
});

function JobsAuthenticatedLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);

      if (!data.user) {
        navigate({ to: "/jobs/login" });
      }
    };

    getUser();

    const { data } = supabase.auth.onAuthStateChange((_, session) => {
      if (!session) {
        navigate({ to: "/jobs/login" });
      }
    });

    return () => {
      if (typeof data?.subscription?.unsubscribe === "function") {
        data.subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const navItems = [
    { label: "Dashboard", icon: BarChart3, href: "/jobs/dashboard" },
    { label: "Search Jobs", icon: Search, href: "/jobs/search" },
    { label: "Saved Jobs", icon: Users, href: "/jobs/saved" },
    { label: "Applications", icon: BarChart3, href: "/jobs/applications" },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <motion.aside
        className={`w-64 border-r border-border bg-card flex flex-col fixed md:relative h-full z-50 md:z-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        } transition-transform`}
      >
        <div className="p-6 border-b border-border">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="h-8 w-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <div>SchemeSync</div>
              <div className="text-[10px] text-muted-foreground font-normal">Jobs</div>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                to={item.href}
                className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-2">
          <Link
            to="/jobs/profile"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Users className="h-4 w-4" />
            Profile
          </Link>
          <Link
            to="/jobs/settings"
            className="flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <Settings className="h-4 w-4" />
            Settings
          </Link>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </motion.aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-4 md:px-6 h-16 flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-4">
              {user && (
                <div className="text-right text-sm">
                  <p className="font-medium">{user.email?.split("@")[0]}</p>
                  <p className="text-xs text-muted-foreground">Job seeker</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 md:px-6 py-8 max-w-7xl mx-auto w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
