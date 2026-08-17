import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/frontend/components/layout/app-shell";
import { DetectionPage } from "@/frontend/pages/detection-page";

export const Route = createFileRoute("/detection")({
  head: () => ({
    meta: [
      { title: "Detection & tracking — TollGrid" },
      {
        name: "description",
        content: "Tune YOLO model, vehicle classes, confidence, IoU, tracker and inference device.",
      },
      { property: "og:title", content: "Detection & tracking — TollGrid" },
      { property: "og:description", content: "Inference and tracker configuration for the counting pipeline." },
    ],
  }),
  component: () => (
    <AppShell>
      <DetectionPage />
    </AppShell>
  ),
});
