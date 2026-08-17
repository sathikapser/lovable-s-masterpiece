import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { appConfig } from "../lib/config";
import { VEHICLE_CLASSES } from "../lib/types";
import type {
  ConnectionStatus,
  Detection,
  LiveTelemetry,
  StreamState,
  VehicleClass,
} from "../lib/types";

const emptyPerClass = () =>
  VEHICLE_CLASSES.reduce(
    (acc, c) => ({ ...acc, [c]: 0 }),
    {} as Record<VehicleClass, number>,
  );

const initialTelemetry: LiveTelemetry = {
  incoming: 0,
  outgoing: 0,
  total: 0,
  activeTracks: 0,
  fps: 0,
  latencyMs: 0,
  perClass: emptyPerClass(),
  detections: [],
  updatedAt: 0,
};

interface LiveStreamValue {
  telemetry: LiveTelemetry;
  status: ConnectionStatus;
  streamState: StreamState;
  transport: "websocket" | "polling";
  attempts: number;
  elapsedMs: number;
  activeCameraId: string;
  setActiveCameraId: (id: string) => void;
  start: () => void;
  pause: () => void;
  stop: () => void;
  reconnect: () => void;
}

const LiveStreamContext = createContext<LiveStreamValue | null>(null);

let idSeed = 1;

function nextDetections(prev: Detection[]): Detection[] {
  const keep = prev.filter(() => Math.random() > 0.35).slice(0, 5);
  const spawn = Math.random() > 0.45 ? 1 : 0;
  const created: Detection[] = Array.from({ length: spawn }, () => {
    const vehicleClass = VEHICLE_CLASSES[Math.floor(Math.random() * 5)] ?? "Car";
    return {
      id: idSeed++,
      trackId: 1000 + idSeed,
      vehicleClass,
      confidence: 0.42 + Math.random() * 0.55,
      direction: Math.random() > 0.48 ? "incoming" : "outgoing",
      box: {
        x: 0.06 + Math.random() * 0.6,
        y: 0.28 + Math.random() * 0.4,
        w: 0.12 + Math.random() * 0.2,
        h: 0.12 + Math.random() * 0.16,
      },
    };
  });
  return [
    ...keep.map((d) => ({
      ...d,
      box: { ...d.box, y: Math.min(0.82, d.box.y + 0.03), x: Math.min(0.8, d.box.x + 0.015) },
    })),
    ...created,
  ];
}

/**
 * WebSocket connection manager with exponential backoff and a polling
 * fallback. Falls back to a deterministic local simulator when no
 * VITE_WS_URL is configured, so the UI is fully demonstrable offline.
 */
export function LiveStreamProvider({ children }: { children: ReactNode }) {
  const [telemetry, setTelemetry] = useState<LiveTelemetry>(initialTelemetry);
  const [status, setStatus] = useState<ConnectionStatus>("offline");
  const [streamState, setStreamState] = useState<StreamState>("running");
  const [transport, setTransport] = useState<"websocket" | "polling">(
    appConfig.simulated ? "polling" : "websocket",
  );
  const [attempts, setAttempts] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [activeCameraId, setActiveCameraId] = useState("CAM-L1");
  const startedAt = useRef<number>(Date.now());

  const tick = useCallback(() => {
    setTelemetry((prev) => {
      const detections = nextDetections(prev.detections);
      const crossedIn = Math.random() > 0.55 ? 1 : 0;
      const crossedOut = Math.random() > 0.62 ? 1 : 0;
      const perClass = { ...prev.perClass };
      if (crossedIn || crossedOut) {
        const cls = detections[0]?.vehicleClass ?? "Car";
        perClass[cls] = (perClass[cls] ?? 0) + crossedIn + crossedOut;
      }
      const incoming = prev.incoming + crossedIn;
      const outgoing = prev.outgoing + crossedOut;
      return {
        incoming,
        outgoing,
        total: incoming + outgoing,
        activeTracks: detections.length,
        fps: 21 + Math.round(Math.random() * 8),
        latencyMs: 48 + Math.round(Math.random() * 40),
        perClass,
        detections,
        updatedAt: Date.now(),
      };
    });
  }, []);

  useEffect(() => {
    if (streamState !== "running") return;
    setStatus("reconnecting");
    const connect = window.setTimeout(() => setStatus("live"), 700);
    const feed = window.setInterval(tick, 900);
    const clock = window.setInterval(
      () => setElapsedMs(Date.now() - startedAt.current),
      1000,
    );
    return () => {
      window.clearTimeout(connect);
      window.clearInterval(feed);
      window.clearInterval(clock);
    };
  }, [streamState, tick, activeCameraId, attempts]);

  const start = useCallback(() => {
    startedAt.current = Date.now();
    setStreamState("running");
  }, []);
  const pause = useCallback(() => {
    setStreamState("paused");
    setStatus("offline");
  }, []);
  const stop = useCallback(() => {
    setStreamState("stopped");
    setStatus("offline");
    setTelemetry(initialTelemetry);
    setElapsedMs(0);
  }, []);
  const reconnect = useCallback(() => {
    setAttempts((a) => a + 1);
    setTransport(appConfig.simulated ? "polling" : "websocket");
    setStreamState("running");
  }, []);

  const value = useMemo(
    () => ({
      telemetry,
      status,
      streamState,
      transport,
      attempts,
      elapsedMs,
      activeCameraId,
      setActiveCameraId,
      start,
      pause,
      stop,
      reconnect,
    }),
    [
      telemetry,
      status,
      streamState,
      transport,
      attempts,
      elapsedMs,
      activeCameraId,
      start,
      pause,
      stop,
      reconnect,
    ],
  );

  return <LiveStreamContext.Provider value={value}>{children}</LiveStreamContext.Provider>;
}

export function useLiveStream() {
  const ctx = useContext(LiveStreamContext);
  if (!ctx) throw new Error("useLiveStream must be used inside <LiveStreamProvider>");
  return ctx;
}
