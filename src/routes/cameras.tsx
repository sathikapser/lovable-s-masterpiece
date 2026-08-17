import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { CamerasPage } from "@/frontend/pages/cameras-page";

export const Route = createFileRoute("/cameras")({
  head: () => ({
    meta: [
      { title: "Camera sources — TollGrid" },
      {
        name: "description",
        content: "Register and test RTSP, IP, webcam and file video sources for each toll lane.",
      },
      { property: "og:title", content: "Camera sources — TollGrid" },
      { property: "og:description", content: "Configure lane cameras, resolution and target FPS." },
    ],
  }),
  component: () => (
    <AppShell>
      <CamerasPage />
    </AppShell>
  ),
});
