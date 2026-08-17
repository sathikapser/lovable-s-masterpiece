export type Role = "admin" | "operator" | "viewer";

export type VehicleClass = "Car" | "Bus" | "Truck" | "Motorcycle" | "Auto" | "Other";

export const VEHICLE_CLASSES: VehicleClass[] = [
  "Car",
  "Bus",
  "Truck",
  "Motorcycle",
  "Auto",
  "Other",
];

export type ConnectionStatus = "live" | "reconnecting" | "offline";
export type StreamState = "running" | "paused" | "stopped";

export interface Site {
  id: string;
  name: string;
}

export interface User {
  id: string;
  username: string;
  role: Role;
  siteId: string;
  displayName: string;
  status: "active" | "deactivated";
  lastLogin: string;
}

export interface Camera {
  id: string;
  name: string;
  sourceType: "rtsp" | "ip" | "webcam" | "file";
  url: string;
  resolution: string;
  targetFps: number;
  lane: string;
  status: "online" | "offline" | "degraded";
}

export interface Detection {
  id: number;
  trackId: number;
  vehicleClass: VehicleClass;
  confidence: number;
  direction: "incoming" | "outgoing";
  box: { x: number; y: number; w: number; h: number };
}

export interface LiveTelemetry {
  incoming: number;
  outgoing: number;
  total: number;
  activeTracks: number;
  fps: number;
  latencyMs: number;
  perClass: Record<VehicleClass, number>;
  detections: Detection[];
  updatedAt: number;
}

export interface Zone {
  id: string;
  label: string;
  kind: "line" | "polygon";
  points: { x: number; y: number }[];
  direction: "incoming" | "outgoing";
}

export interface SessionRecord {
  id: string;
  date: string;
  cameraId: string;
  lane: string;
  durationMin: number;
  incoming: number;
  outgoing: number;
  perClass: Record<VehicleClass, number>;
}

export type AlertSeverity = "info" | "warning" | "critical";

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  type: string;
  cameraId: string;
  message: string;
  createdAt: string;
  acknowledged: boolean;
}

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  at: string;
}

export interface DetectionSettings {
  model: string;
  classes: VehicleClass[];
  confidence: number;
  iou: number;
  tracker: "ByteTrack" | "DeepSORT" | "SORT";
  maxTrackAge: number;
  device: "GPU" | "CPU";
}
