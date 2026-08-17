import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { DashboardPage } from "@/frontend/pages/dashboard-page";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Live monitoring — TollGrid" },
      {
        name: "description",
        content:
          "Annotated live stream, per-class vehicle counters, FPS and latency for every toll lane.",
      },
      { property: "og:title", content: "Live monitoring — TollGrid" },
      { property: "og:description", content: "Real-time lane vision dashboard for toll plazas." },
    ],
  }),
  component: () => (
    <AppShell>
      <DashboardPage />
    </AppShell>
  ),
});
