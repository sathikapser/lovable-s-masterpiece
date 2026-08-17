# TollGrid — AI-Powered Toll Booth Front End

Maximalist control-room dashboard implementing **Document 1 of 3 — Front End & UI Checklist**
(every screen, component and field from `Frontend_UI_Checklist.pdf`).

Stack: React 19 + TanStack Start/Router, Tailwind v4 design tokens, shadcn/ui, Recharts,
TanStack Query, Vite. Live data arrives over a WebSocket manager with polling fallback; with no
`VITE_WS_URL` configured the UI runs on a built-in telemetry simulator so every state is demoable.

## Structure

```
src/
  frontend/                     # all app UI lives here, cleanly separated
    components/
      common/                   # StatCard, StatusBadge, DataTable, Field, SliderInput,
                                # EmptyState, LoadingBlock/ChartSkeleton, PageHeader, ErrorBoundary
      layout/                   # AppShell (role-aware collapsible sidebar, topbar, ticker), nav-items
      video/video-canvas.tsx    # canvas stream + detection overlay (box, class, track ID, direction)
      zones/zone-canvas.tsx     # line/polygon drawing widget
    lib/                        # config (env-based API/WS URLs), types, format/export helpers, mock data
    pages/                      # login, dashboard, cameras, detection, zones, reports, alerts, admin
    store/                      # auth (token + refresh + timeout + roles), live-stream (WS/polling)
  routes/                       # thin TanStack route wrappers, each with its own head() metadata
  styles.css                    # maximalist design system (oklch tokens, utilities, animations)
```

## Screens (checklist §3)

| Route | Screen | Checklist coverage |
| --- | --- | --- |
| `/` | Login / access | operator ID, masked password + show/hide, auto role indicator, site selector, remember device, forgot-password reset flow, loading/disabled button, inline validation + error banner, session-timeout notice |
| `/dashboard` | Live monitoring | annotated video canvas, lane/camera tabs, Incoming/Outgoing/Total/Active-Tracks stat cards, per-class counters, read-only confidence readout, FPS + latency, Start/Pause/Stop/Reconnect, connection badge, toast alerts, session clock, snapshot export |
| `/cameras` | Camera / source config | source-type radios (RTSP/IP/webcam/file), URL validation, name + ID, resolution, target FPS, test connection + status, frame preview, save/cancel, camera table with edit/delete |
| `/detection` | Detection & tracking | model selector, class checkboxes (incl. Auto/3-wheeler), confidence slider+number (0.40 default), IoU/NMS, tracker selector, max track age, GPU/CPU toggle, apply-and-restart with confirm modal, active config summary |
| `/zones` | Zone & line setup | interactive canvas, line/polygon tools, lane label, direction assignment, zone list (add/edit/rename/delete), undo/redo, save layout, reset to default, preview-mode toggle |
| `/reports` | Sessions & reports | date range, lane filter, class checkboxes, summary table, time-series line chart, class bar + pie charts, lane-wise breakdown, CSV/PDF/Excel export, search box, pagination, compare-periods toggle |
| `/alerts` | Alerts center | severity list (info/warning/critical), filters by camera/date/type, acknowledge action, channel preferences |
| `/admin` | Admin & system | user table with roles + deactivate, masked DB fields, retention slider, notification recipients + breach rule, weight upload/version, health panel (GPU/CPU/storage/uptime), API keys, audit log |

Sidebar persists across authenticated screens and hides `/admin` from non-admins; the dashboard is
the landing page after login.

## Reusable components (checklist §4)

Sidebar/topbar, video canvas overlay, stat/KPI tile (memoized), sortable + paginated data table,
modal/dialog confirmations, toast + alert banners, slider+numeric pairs, dropdown/multi-select,
drawing canvas, bar/line/pie charts, status badges, form input group, loading skeleton/spinner,
empty-state panel.

## State, data & real time (checklist §5)

Token storage with silent refresh and inactivity timeout; WebSocket manager with backoff and
polling fallback; memoized live counters so ticks don't re-render whole pages; staged config saves
with rollback; TanStack Query client for report caching; global error boundary; env-based
`VITE_API_BASE_URL` / `VITE_WS_URL`.

## Responsive, a11y & QA (checklist §6)

Desktop/tablet/mobile layouts (sidebar collapses to a sheet, video panel stacks), keyboard-navigable
controls, `aria-label`s on all icon-only buttons, visible focus outlines globally, high-contrast
oklch tokens, empty + loading + error states on every page, role-based route hiding and guarding.

## Design system

Industrial maximalism: `Archivo Black` display, `Space Grotesk` body, `JetBrains Mono` data;
lime/cyan/amber/red signal palette; 2px borders with hard offset shadows; grid background,
scanlines, marquee telemetry ticker. All colors are semantic oklch tokens in `src/styles.css` —
no hardcoded color utilities in components.

## Demo logins

`admin` (full access) · `operator1` · `viewer1` — any password of 4+ characters.

## Run

```bash
bun install
bun run dev
```
