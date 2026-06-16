import { Outlet, Link, useLocation } from "react-router-dom";
import { Flame, Home, PenTool, Search, Archive, Sparkles, CheckCircle2, Target, Map } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { path: "/", label: "Dashboard", icon: Home },
  { path: "/extract", label: "Extract", icon: PenTool },
  { path: "/workspace", label: "Workspace", icon: Archive },
  { path: "/penfires", label: "Penfires", icon: Flame },
  { path: "/outcomes", label: "Outcomes", icon: CheckCircle2 },
  { path: "/search", label: "Search", icon: Search },
  { path: "/mission", label: "Mission", icon: Target },
  { path: "/journey", label: "Journey", icon: Map },
];

export default function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="p-6 border-b border-border/30">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-xl text-foreground tracking-tight">SignalWriter</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Continuity Engine</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/30">
          <div className="px-3 py-3 rounded-lg bg-muted/30 border border-border/30">
            <p className="text-xs text-muted-foreground italic font-body leading-relaxed">
              "A writer doesn't need another AI that talks. A writer needs an AI that remembers what mattered."
            </p>
          </div>
        </div>
      </aside>

      {/* Mobile nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50">
        <nav className="flex justify-around py-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pb-20 md:pb-0">
        <Outlet />
      </main>
    </div>
  );
}