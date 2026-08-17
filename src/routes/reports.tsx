import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { ReportsPage } from "@/frontend/pages/reports-page";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Sessions & reports — TollGrid" },
      {
        name: "description",
        content: "Filter counted traffic sessions by period, lane and class, then export CSV, PDF or Excel.",
      },
      { property: "og:title", content: "Sessions & reports — TollGrid" },
      { property: "og:description", content: "Traffic-flow analytics and session exports." },
    ],
  }),
  component: () => (
    <AppShell>
      <ReportsPage />
    </AppShell>
  ),
});
