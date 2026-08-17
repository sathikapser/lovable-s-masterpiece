/**
 * Environment-based configuration for API + WebSocket endpoints.
 * Override with VITE_API_BASE_URL / VITE_WS_URL at build time.
 */
const env = import.meta.env as Record<string, string | undefined>;

export const appConfig = {
  appName: "TollGrid",
  appTagline: "AI-Powered Toll Booth Vision Control",
  apiBaseUrl: env["VITE_API_BASE_URL"] ?? "/api",
  wsUrl: env["VITE_WS_URL"] ?? "",
  /** When no backend is configured the UI runs on a deterministic simulator. */
  get simulated() {
    return !this.wsUrl;
  },
  pollingIntervalMs: 2000,
  reconnectBaseMs: 800,
  reconnectMaxMs: 15000,
  sessionTimeoutMs: 1000 * 60 * 30,
} as const;

export type AppConfig = typeof appConfig;
