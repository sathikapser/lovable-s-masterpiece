import { memo } from "react";
import { cn } from "@/lib/utils";
import { formatNumber } from "../../lib/format";

export interface StatCardProps {
  label: string;
  value: number | string;
  unit?: string;
  hint?: string;
  tone?: "signal" | "info" | "warning" | "destructive" | "neutral";
  icon?: React.ReactNode;
  className?: string;
}

const accents = {
  signal: "before:bg-signal",
  info: "before:bg-info",
  warning: "before:bg-warning",
  destructive: "before:bg-destructive",
  neutral: "before:bg-border",
};

/** Memoized so live-count updates don't re-render sibling panels. */
export const StatCard = memo(function StatCard({
  label,
  value,
  unit,
  hint,
  tone = "neutral",
  icon,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "panel-hard relative overflow-hidden px-4 py-3 pl-5",
        "before:absolute before:inset-y-0 before:left-0 before:w-2 before:content-['']",
        accents[tone],
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="mono-caps text-muted-foreground">{label}</p>
        {icon ? <span className="text-muted-foreground">{icon}</span> : null}
      </div>
      <p className="slab mt-1 text-3xl leading-none tabular-nums">
        {typeof value === "number" ? formatNumber(value) : value}
        {unit ? <span className="ml-1 text-base text-muted-foreground">{unit}</span> : null}
      </p>
      {hint ? <p className="mt-1 font-mono text-[11px] text-muted-foreground">{hint}</p> : null}
    </div>
  );
});
