import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Zone } from "../../lib/types";

/**
 * Drawing canvas widget: click to add points on a still camera frame.
 * Line tool = 2 points, polygon tool = n points closed on finish.
 */
export function ZoneCanvas({
  zones,
  draft,
  tool,
  selectedId,
  showDetections,
  onAddPoint,
  className,
}: {
  zones: Zone[];
  draft: { x: number; y: number }[];
  tool: "line" | "polygon";
  selectedId: string | null;
  showDetections: boolean;
  onAddPoint: (p: { x: number; y: number }) => void;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const box = ref.current?.getBoundingClientRect();
      if (!box) return;
      onAddPoint({
        x: (e.clientX - box.left) / box.width,
        y: (e.clientY - box.top) / box.height,
      });
    },
    [onAddPoint],
  );

  return (
    <div
      ref={ref}
      onClick={handleClick}
      role="application"
      aria-label={`Zone drawing canvas, ${tool} tool active`}
      tabIndex={0}
      className={cn(
        "panel-hard scanlines relative aspect-video w-full cursor-crosshair overflow-hidden bg-surface-2",
        className,
      )}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,color-mix(in_oklab,var(--color-info)_25%,transparent),transparent_60%)]" />
      <svg viewBox="0 0 100 56.25" className="absolute inset-0 size-full" aria-hidden>
        <polygon points="10,56 40,16 62,16 96,56" fill="oklch(0.26 0.02 260)" />
        <line x1="52" y1="17" x2="56" y2="56" stroke="white" strokeOpacity="0.25" strokeDasharray="2 3" />
        {zones.map((z) => {
          const pts = z.points.map((p) => `${p.x * 100},${p.y * 56.25}`).join(" ");
          const stroke = z.direction === "incoming" ? "var(--color-signal)" : "var(--color-info)";
          const active = selectedId === z.id;
          return z.kind === "line" ? (
            <polyline
              key={z.id}
              points={pts}
              fill="none"
              stroke={stroke}
              strokeWidth={active ? 1.4 : 0.9}
            />
          ) : (
            <polygon
              key={z.id}
              points={pts}
              fill={stroke}
              fillOpacity={active ? 0.3 : 0.15}
              stroke={stroke}
              strokeWidth={active ? 1.2 : 0.7}
            />
          );
        })}
        {draft.length > 0 && (
          <polyline
            points={draft.map((p) => `${p.x * 100},${p.y * 56.25}`).join(" ")}
            fill="none"
            stroke="var(--color-warning)"
            strokeWidth="1"
            strokeDasharray="2 2"
          />
        )}
        {draft.map((p, i) => (
          <circle key={i} cx={p.x * 100} cy={p.y * 56.25} r="0.9" fill="var(--color-warning)" />
        ))}
        {showDetections && (
          <>
            <rect x="22" y="30" width="14" height="10" fill="none" stroke="#a3e635" strokeWidth="0.6" />
            <rect x="58" y="26" width="11" height="8" fill="none" stroke="#38bdf8" strokeWidth="0.6" />
          </>
        )}
      </svg>
      {zones.map((z) => {
        const first = z.points[0];
        if (!first) return null;
        return (
          <span
            key={z.id}
            className="mono-caps pointer-events-none absolute -translate-y-full border-2 border-border bg-background/85 px-1.5 py-0.5"
            style={{ left: `${first.x * 100}%`, top: `${first.y * 100}%` }}
          >
            {z.label}
          </span>
        );
      })}
    </div>
  );
}
