import { memo, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { ConnectionStatus, Detection, StreamState } from "../../lib/types";

const CLASS_HUES: Record<string, string> = {
  Car: "#a3e635",
  Bus: "#38bdf8",
  Truck: "#fbbf24",
  Motorcycle: "#fb7185",
  Auto: "#c084fc",
  Other: "#94a3b8",
};

/**
 * Video canvas: renders the annotated stream frame plus a detection overlay
 * (box, class, track ID, direction tag). In a real deployment the base layer
 * consumes an MJPEG/WebSocket frame; here it draws a synthetic road scene so
 * overlay performance and error/loading states remain verifiable.
 */
export const VideoCanvas = memo(function VideoCanvas({
  detections,
  status,
  streamState,
  cameraLabel,
  className,
  overlay,
}: {
  detections: Detection[];
  status: ConnectionStatus;
  streamState: StreamState;
  cameraLabel: string;
  className?: string;
  overlay?: React.ReactNode;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width: w, height: h } = canvas;

    // base "frame"
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, "#111827");
    sky.addColorStop(0.45, "#1f2937");
    sky.addColorStop(1, "#0b1220");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    ctx.fillStyle = "#242c3a";
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h);
    ctx.lineTo(w * 0.4, h * 0.28);
    ctx.lineTo(w * 0.62, h * 0.28);
    ctx.lineTo(w * 0.96, h);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.setLineDash([14, 18]);
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.52, h * 0.3);
    ctx.lineTo(w * 0.56, h);
    ctx.stroke();
    ctx.setLineDash([]);

    // counting line
    ctx.strokeStyle = "#a3e635";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.12, h * 0.62);
    ctx.lineTo(w * 0.9, h * 0.58);
    ctx.stroke();

    if (streamState !== "running" || status === "offline") return;

    // detection overlay
    detections.forEach((d) => {
      const color = CLASS_HUES[d.vehicleClass] ?? "#a3e635";
      const x = d.box.x * w;
      const y = d.box.y * h;
      const bw = d.box.w * w;
      const bh = d.box.h * h;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(x, y, bw, bh);
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(x, y - 20, Math.max(bw, 132), 20);
      ctx.fillStyle = color;
      ctx.font = "bold 12px ui-monospace, monospace";
      ctx.fillText(
        `${d.vehicleClass} #${d.trackId} ${(d.confidence * 100).toFixed(0)}% ${
          d.direction === "incoming" ? "▲IN" : "▼OUT"
        }`,
        x + 6,
        y - 6,
      );
    });
  }, [detections, status, streamState]);

  return (
    <div className={cn("panel-hard scanlines relative overflow-hidden bg-black", className)}>
      <canvas
        ref={ref}
        width={960}
        height={540}
        className="block h-auto w-full"
        role="img"
        aria-label={`Annotated live stream for ${cameraLabel}`}
      />
      {(streamState !== "running" || status === "offline") && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-background/80 text-center">
          <p className="slab text-lg">
            {streamState === "paused"
              ? "Stream paused"
              : streamState === "stopped"
                ? "Stream stopped"
                : "Stream offline"}
          </p>
          <p className="mono-caps text-muted-foreground">Use the transport controls to resume</p>
        </div>
      )}
      {status === "reconnecting" && streamState === "running" && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/70">
          <p className="mono-caps text-warning">Reconnecting to encoder…</p>
        </div>
      )}
      {overlay}
    </div>
  );
});
