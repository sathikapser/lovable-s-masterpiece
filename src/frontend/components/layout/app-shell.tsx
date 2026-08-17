import { useEffect, useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, PanelLeftClose, Radio, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { appConfig } from "../../lib/config";
import { sites } from "../../lib/mock-data";
import { useAuth } from "../../store/auth";
import { useLiveStream } from "../../store/live-stream";
import { StatusBadge } from "../common/status-badge";
import { AppErrorBoundary } from "../common/error-boundary";
import { navItems } from "./nav-items";
import type { Role } from "../../lib/types";

function NavList({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="space-y-1" aria-label="Primary">
      {navItems
        .filter((item) => item.roles.includes(role))
        .map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 border-2 px-3 py-2 transition-colors",
                active
                  ? "border-signal bg-signal text-signal-foreground"
                  : "border-transparent text-sidebar-foreground hover:border-sidebar-border hover:bg-sidebar-accent",
              )}
            >
              <span className="mono-caps opacity-70">{item.code}</span>
              <item.icon className="size-4 shrink-0" aria-hidden />
              <span className="slab text-xs">{item.label}</span>
            </Link>
          );
        })}
    </nav>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { session, hydrated, signOut } = useAuth();
  const { status, telemetry } = useLiveStream();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Route guard: unauthenticated or expired session → login.
  useEffect(() => {
    if (hydrated && !session) navigate({ to: "/", replace: true });
  }, [hydrated, session, navigate]);

  if (!hydrated || !session) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="mono-caps text-muted-foreground">Verifying session…</p>
      </div>
    );
  }

  const site = sites.find((s) => s.id === session.siteId) ?? sites[0]!;

  return (
    <div className="flex min-h-screen">
      <aside
        className={cn(
          "sticky top-0 hidden h-screen shrink-0 flex-col border-r-2 border-sidebar-border bg-sidebar lg:flex",
          collapsed ? "w-[86px]" : "w-[260px]",
        )}
      >
        <div className="flex items-center gap-2 border-b-2 border-sidebar-border px-4 py-4">
          <span className="flex size-8 items-center justify-center border-2 border-signal bg-signal text-signal-foreground">
            <Radio className="size-4" aria-hidden />
          </span>
          {!collapsed && (
            <div>
              <p className="slab text-sm leading-none">{appConfig.appName}</p>
              <p className="mono-caps text-muted-foreground">Vision control</p>
            </div>
          )}
        </div>
        <div className={cn("flex-1 overflow-y-auto p-3", collapsed && "px-2")}>
          <NavList role={session.user.role} />
        </div>
        <div className="space-y-2 border-t-2 border-sidebar-border p-3">
          {!collapsed && (
            <div className="border-2 border-sidebar-border bg-sidebar-accent px-3 py-2">
              <p className="mono-caps text-muted-foreground">Operator</p>
              <p className="slab text-xs">{session.user.displayName}</p>
              <StatusBadge tone="info" className="mt-1.5">
                <ShieldCheck className="size-3" aria-hidden /> {session.user.role}
              </StatusBadge>
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <PanelLeftClose className={cn("size-4", collapsed && "rotate-180")} aria-hidden />
            {!collapsed && "Collapse"}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="w-full"
            onClick={() => {
              signOut();
              navigate({ to: "/" });
            }}
            aria-label="Sign out"
          >
            <LogOut className="size-4" aria-hidden />
            {!collapsed && "Sign out"}
          </Button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b-2 border-border bg-background/95 px-4 py-3 backdrop-blur">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open navigation">
                <Menu className="size-4" aria-hidden />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[260px] border-r-2 bg-sidebar p-4">
              <SheetTitle className="slab text-sm">{appConfig.appName}</SheetTitle>
              <div className="mt-4">
                <NavList role={session.user.role} onNavigate={() => setMobileOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <p className="mono-caps truncate text-muted-foreground">{site.name}</p>
            <p className="slab truncate text-sm">{appConfig.appTagline}</p>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <StatusBadge
              tone={status === "live" ? "live" : status === "reconnecting" ? "reconnecting" : "offline"}
              dot={status === "live"}
            >
              {status}
            </StatusBadge>
            <StatusBadge tone="neutral">{telemetry.fps || 0} fps</StatusBadge>
          </div>
        </header>

        <div className="overflow-hidden border-b-2 border-border bg-surface-2">
          <div className="ticker flex w-max gap-8 py-1.5">
            {[0, 1].map((k) => (
              <p key={k} className="mono-caps flex gap-8 whitespace-nowrap text-muted-foreground">
                <span>TOTAL {telemetry.total}</span>
                <span className="text-signal">IN {telemetry.incoming}</span>
                <span className="text-info">OUT {telemetry.outgoing}</span>
                <span>ACTIVE TRACKS {telemetry.activeTracks}</span>
                <span>LATENCY {telemetry.latencyMs}ms</span>
                <span>MODE {appConfig.simulated ? "SIMULATOR" : "WEBSOCKET"}</span>
                <span>PLAZA {site.id.toUpperCase()}</span>
              </p>
            ))}
          </div>
        </div>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <AppErrorBoundary>{children}</AppErrorBoundary>
        </main>

        <footer className="border-t-2 border-border px-4 py-3">
          <p className="mono-caps text-muted-foreground">
            {appConfig.appName} · build {import.meta.env.MODE} · api {appConfig.apiBaseUrl}
          </p>
        </footer>
      </div>
    </div>
  );
}
