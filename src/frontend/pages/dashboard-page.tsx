import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Camera as CameraIcon,
  Camera,
  Gauge,
  Pause,
  Play,
  RotateCw,
  Square,
  Sigma,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cameras, defaultDetectionSettings } from "../lib/mock-data";
import { formatClock } from "../lib/format";
import { VEHICLE_CLASSES } from "../lib/types";
import { useLiveStream } from "../store/live-stream";
import { PageHeader } from "../components/common/page-header";
import { StatCard } from "../components/common/stat-card";
import { StatusBadge } from "../components/common/status-badge";
import { VideoCanvas } from "../components/video/video-canvas";

export function DashboardPage() {
  const {
    telemetry,
    status,
    streamState,
    transport,
    elapsedMs,
    activeCameraId,
    setActiveCameraId,
    start,
    pause,
    stop,
    reconnect,
  } = useLiveStream();
  const [alerted, setAlerted] = useState(false);

  const camera = useMemo(
    () => cameras.find((c) => c.id === activeCameraId) ?? cameras[0]!,
    [activeCameraId],
  );

  // Toast area: camera disconnect / low FPS warnings.
  useEffect(() => {
    if (camera.status === "offline" && !alerted) {
      toast.error(`${camera.id} disconnected`, { description: "Reconnect attempts exhausted." });
      setAlerted(true);
    }
    if (streamState === "running" && telemetry.fps > 0 && telemetry.fps < 22) {
      toast.warning("Low FPS", { id: "low-fps", description: `Inference at ${telemetry.fps} fps.` });
    }
  }, [camera, alerted, telemetry.fps, streamState]);

  return (
    <div>
      <PageHeader
        eyebrow="01 / Live monitoring"
        title="Lane vision dashboard"
        description="Annotated stream, per-class counters and transport control for the active lane."
        actions={
          <>
            <StatusBadge tone={status === "live" ? "live" : status === "reconnecting" ? "reconnecting" : "offline"} dot={status === "live"}>
              {status}
            </StatusBadge>
            <StatusBadge tone="neutral">{transport}</StatusBadge>
            <StatusBadge tone="neutral">Session {formatClock(elapsedMs)}</StatusBadge>
          </>
        }
      />

      <Tabs value={activeCameraId} onValueChange={setActiveCameraId} className="mb-4">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 border-2 border-border bg-surface-2 p-1">
          {cameras.map((c) => (
            <TabsTrigger
              key={c.id}
              value={c.id}
              className="slab gap-2 border-2 border-transparent text-xs data-[state=active]:border-signal data-[state=active]:bg-signal data-[state=active]:text-signal-foreground"
            >
              {c.lane}
              <span className="mono-caps opacity-70">{c.id}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div className="space-y-4">
          <VideoCanvas
            detections={telemetry.detections}
            status={status}
            streamState={streamState}
            cameraLabel={camera.name}
            overlay={
              <div className="pointer-events-none absolute left-3 top-3 z-20 flex flex-wrap gap-2">
                <StatusBadge tone="live" dot={status === "live"}>
                  {camera.id} · {camera.resolution}
                </StatusBadge>
                <StatusBadge tone="neutral">{telemetry.latencyMs}ms</StatusBadge>
              </div>
            }
          />

          <div className="panel flex flex-wrap items-center gap-2 p-3">
            <Button onClick={start} aria-label="Start stream" disabled={streamState === "running"}>
              <Play className="size-4" aria-hidden /> Start
            </Button>
            <Button variant="outline" onClick={pause} aria-label="Pause stream">
              <Pause className="size-4" aria-hidden /> Pause
            </Button>
            <Button variant="outline" onClick={stop} aria-label="Stop stream">
              <Square className="size-4" aria-hidden /> Stop
            </Button>
            <Button variant="secondary" onClick={reconnect} aria-label="Reconnect stream">
              <RotateCw className="size-4" aria-hidden /> Reconnect
            </Button>
            <Button
              variant="outline"
              aria-label="Export current frame snapshot"
              onClick={() => toast.success("Snapshot exported", { description: `${camera.id}-frame.png` })}
            >
              <Camera className="size-4" aria-hidden /> Snapshot
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <StatusBadge tone="neutral">
                Conf ≥ {defaultDetectionSettings.confidence.toFixed(2)} (read-only)
              </StatusBadge>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              label="Incoming"
              value={telemetry.incoming}
              tone="signal"
              icon={<ArrowUpRight className="size-4" />}
            />
            <StatCard
              label="Outgoing"
              value={telemetry.outgoing}
              tone="info"
              icon={<ArrowDownRight className="size-4" />}
            />
            <StatCard label="Total" value={telemetry.total} tone="warning" icon={<Sigma className="size-4" />} />
            <StatCard
              label="Active tracks"
              value={telemetry.activeTracks}
              tone="destructive"
              icon={<Activity className="size-4" />}
            />
          </div>

          <div className="panel-hard p-4">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm">Per-class live counters</h2>
              <StatusBadge tone="neutral">
                <CameraIcon className="size-3" aria-hidden /> {camera.lane}
              </StatusBadge>
            </div>
            <ul className="space-y-2">
              {VEHICLE_CLASSES.map((c) => {
                const count = telemetry.perClass[c] ?? 0;
                const pct = telemetry.total ? (count / telemetry.total) * 100 : 0;
                return (
                  <li key={c}>
                    <div className="flex items-center justify-between">
                      <span className="mono-caps">{c}</span>
                      <span className="font-mono text-sm tabular-nums">{count}</span>
                    </div>
                    <Progress value={pct} className="mt-1 h-2 border-2 border-border bg-surface-3" />
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="panel-hard grid grid-cols-2 gap-3 p-4">
            <div>
              <p className="mono-caps text-muted-foreground">FPS</p>
              <p className="slab flex items-center gap-2 text-2xl">
                <Gauge className="size-5 text-signal" aria-hidden /> {telemetry.fps}
              </p>
            </div>
            <div>
              <p className="mono-caps text-muted-foreground">Latency</p>
              <p className="slab text-2xl">{telemetry.latencyMs}ms</p>
            </div>
            <div className="col-span-2 border-t-2 border-border pt-2">
              <p className="mono-caps text-muted-foreground">Session clock</p>
              <p className="slab text-2xl tabular-nums">{formatClock(elapsedMs)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
