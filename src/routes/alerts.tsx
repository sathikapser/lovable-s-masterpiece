import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { AlertsPage } from "@/frontend/pages/alerts-page";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts center — TollGrid" },
      {
        name: "description",
        content: "Severity-ranked camera, FPS and threshold alerts with acknowledgement and channels.",
      },
      { property: "og:title", content: "Alerts center — TollGrid" },
      { property: "og:description", content: "Notification center for toll plaza vision alerts." },
    ],
  }),
  component: () => (
    <AppShell>
      <AlertsPage />
    </AppShell>
  ),
});
