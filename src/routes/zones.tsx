import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { ZonesPage } from "@/frontend/pages/zones-page";

export const Route = createFileRoute("/zones")({
  head: () => ({
    meta: [
      { title: "Zones & counting lines — TollGrid" },
      {
        name: "description",
        content: "Draw counting lines and polygon zones per camera and assign incoming/outgoing direction.",
      },
      { property: "og:title", content: "Zones & counting lines — TollGrid" },
      { property: "og:description", content: "Interactive zone geometry editor for lane counting." },
    ],
  }),
  component: () => (
    <AppShell>
      <ZonesPage />
    </AppShell>
  ),
});
