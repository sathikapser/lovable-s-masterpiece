import type {
  AlertItem,
  AuditEntry,
  Camera,
  DetectionSettings,
  SessionRecord,
  Site,
  User,
  VehicleClass,
  Zone,
} from "./types";

export const sites: Site[] = [
  { id: "plaza-01", name: "NH-44 Krishnagiri Plaza" },
  { id: "plaza-02", name: "NH-48 Vellore Plaza" },
  { id: "plaza-03", name: "ORR Bengaluru East" },
];

export const cameras: Camera[] = [
  {
    id: "CAM-L1",
    name: "Lane 1 — Northbound",
    sourceType: "rtsp",
    url: "rtsp://10.20.4.11:554/stream1",
    resolution: "1920x1080",
    targetFps: 30,
    lane: "Lane 1",
    status: "online",
  },
  {
    id: "CAM-L2",
    name: "Lane 2 — Northbound",
    sourceType: "rtsp",
    url: "rtsp://10.20.4.12:554/stream1",
    resolution: "1280x720",
    targetFps: 25,
    lane: "Lane 2",
    status: "online",
  },
  {
    id: "CAM-L3",
    name: "Lane 3 — Southbound",
    sourceType: "ip",
    url: "http://10.20.4.13/mjpg/video.mjpg",
    resolution: "1280x720",
    targetFps: 20,
    lane: "Lane 3",
    status: "degraded",
  },
  {
    id: "CAM-L4",
    name: "Lane 4 — Exit Ramp",
    sourceType: "file",
    url: "/media/recordings/ramp-2026-08-16.mp4",
    resolution: "1920x1080",
    targetFps: 30,
    lane: "Lane 4",
    status: "offline",
  },
];

export const users: User[] = [
  {
    id: "u-1",
    username: "admin",
    role: "admin",
    siteId: "plaza-01",
    displayName: "S. Sathik",
    status: "active",
    lastLogin: "2026-08-17T08:12:00Z",
  },
  {
    id: "u-2",
    username: "operator1",
    role: "operator",
    siteId: "plaza-01",
    displayName: "R. Meena",
    status: "active",
    lastLogin: "2026-08-17T06:40:00Z",
  },
  {
    id: "u-3",
    username: "viewer1",
    role: "viewer",
    siteId: "plaza-02",
    displayName: "K. Arun",
    status: "active",
    lastLogin: "2026-08-16T21:05:00Z",
  },
  {
    id: "u-4",
    username: "operator2",
    role: "operator",
    siteId: "plaza-03",
    displayName: "P. Divya",
    status: "deactivated",
    lastLogin: "2026-07-29T11:31:00Z",
  },
];

export const defaultDetectionSettings: DetectionSettings = {
  model: "YOLOv8s",
  classes: ["Car", "Bus", "Truck", "Motorcycle", "Auto"],
  confidence: 0.4,
  iou: 0.5,
  tracker: "ByteTrack",
  maxTrackAge: 30,
  device: "GPU",
};

export const defaultZones: Zone[] = [
  {
    id: "z-1",
    label: "Lane 1 counting line",
    kind: "line",
    points: [
      { x: 0.12, y: 0.62 },
      { x: 0.88, y: 0.58 },
    ],
    direction: "incoming",
  },
  {
    id: "z-2",
    label: "Lane 1 exit polygon",
    kind: "polygon",
    points: [
      { x: 0.2, y: 0.72 },
      { x: 0.55, y: 0.68 },
      { x: 0.6, y: 0.9 },
      { x: 0.18, y: 0.92 },
    ],
    direction: "outgoing",
  },
];

function classSplit(total: number): Record<VehicleClass, number> {
  return {
    Car: Math.round(total * 0.54),
    Bus: Math.round(total * 0.08),
    Truck: Math.round(total * 0.18),
    Motorcycle: Math.round(total * 0.12),
    Auto: Math.round(total * 0.06),
    Other: Math.round(total * 0.02),
  };
}

export const sessions: SessionRecord[] = Array.from({ length: 42 }, (_, i) => {
  const day = 17 - (i % 14);
  const cam = cameras[i % cameras.length]!;
  const incoming = 480 + ((i * 137) % 620);
  const outgoing = 430 + ((i * 91) % 540);
  return {
    id: `SES-${String(2600 + i)}`,
    date: `2026-08-${String(Math.max(day, 1)).padStart(2, "0")}`,
    cameraId: cam.id,
    lane: cam.lane,
    durationMin: 45 + ((i * 13) % 300),
    incoming,
    outgoing,
    perClass: classSplit(incoming + outgoing),
  };
});

export const timeSeries = Array.from({ length: 24 }, (_, h) => {
  const base = 40 + Math.round(70 * Math.sin((h / 24) * Math.PI * 2 - 1.2) + 60);
  return {
    hour: `${String(h).padStart(2, "0")}:00`,
    incoming: base + ((h * 7) % 25),
    outgoing: Math.max(10, base - 12 + ((h * 11) % 30)),
    previous: Math.max(8, base - 20 + ((h * 5) % 35)),
  };
});

export const alerts: AlertItem[] = [
  {
    id: "AL-901",
    severity: "critical",
    type: "Camera disconnect",
    cameraId: "CAM-L4",
    message: "Stream CAM-L4 dropped — 4 reconnect attempts failed.",
    createdAt: "2026-08-17T14:41:00Z",
    acknowledged: false,
  },
  {
    id: "AL-900",
    severity: "warning",
    type: "Low FPS",
    cameraId: "CAM-L3",
    message: "Inference FPS fell to 11.4 (target 20).",
    createdAt: "2026-08-17T13:58:00Z",
    acknowledged: false,
  },
  {
    id: "AL-899",
    severity: "warning",
    type: "Low confidence",
    cameraId: "CAM-L2",
    message: "38% of detections below 0.40 confidence in last 10 min.",
    createdAt: "2026-08-17T12:20:00Z",
    acknowledged: true,
  },
  {
    id: "AL-898",
    severity: "info",
    type: "Threshold breach",
    cameraId: "CAM-L1",
    message: "Hourly truck count crossed configured limit of 180.",
    createdAt: "2026-08-17T11:02:00Z",
    acknowledged: true,
  },
  {
    id: "AL-897",
    severity: "info",
    type: "Config applied",
    cameraId: "CAM-L1",
    message: "Pipeline restarted with YOLOv8s @ conf 0.40.",
    createdAt: "2026-08-17T09:15:00Z",
    acknowledged: true,
  },
];

export const auditLog: AuditEntry[] = [
  {
    id: "A-51",
    actor: "admin",
    action: "Updated confidence threshold 0.35 → 0.40",
    target: "Detection settings",
    at: "2026-08-17T09:14:00Z",
  },
  {
    id: "A-50",
    actor: "operator1",
    action: "Saved zone layout (2 zones)",
    target: "CAM-L1",
    at: "2026-08-17T08:52:00Z",
  },
  {
    id: "A-49",
    actor: "admin",
    action: "Deactivated operator account",
    target: "operator2",
    at: "2026-08-16T18:30:00Z",
  },
  {
    id: "A-48",
    actor: "admin",
    action: "Rotated integration API key",
    target: "api-key-prod",
    at: "2026-08-15T15:10:00Z",
  },
];

export const apiKeys = [
  { id: "k-1", label: "Highway ops ERP", key: "tg_live_9f2c…a41d", created: "2026-06-02", scope: "read" },
  { id: "k-2", label: "State ITS gateway", key: "tg_live_71ba…c093", created: "2026-07-19", scope: "read/write" },
];
