import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { AdminPage } from "@/frontend/pages/admin-page";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin & system — TollGrid" },
      {
        name: "description",
        content: "Manage operators, database, retention, notifications, model weights, health and audit log.",
      },
      { property: "og:title", content: "Admin & system — TollGrid" },
      { property: "og:description", content: "Administrative controls for the toll vision platform." },
    ],
  }),
  component: () => (
    <AppShell>
      <AdminPage />
    </AppShell>
  ),
});
