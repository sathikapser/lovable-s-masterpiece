import { cn } from "@/lib/utils";

type Tone = "live" | "offline" | "reconnecting" | "info" | "warning" | "critical" | "neutral";

const tones: Record<Tone, string> = {
  live: "bg-signal text-signal-foreground border-signal",
  offline: "bg-muted text-muted-foreground border-border",
  reconnecting: "bg-warning text-warning-foreground border-warning",
  info: "bg-info text-info-foreground border-info",
  warning: "bg-warning text-warning-foreground border-warning",
  critical: "bg-destructive text-destructive-foreground border-destructive",
  neutral: "bg-surface-3 text-foreground border-border",
};

export function StatusBadge({
  tone = "neutral",
  children,
  dot = false,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "mono-caps inline-flex items-center gap-1.5 border-2 px-2 py-0.5 font-bold",
        tones[tone],
        className,
      )}
    >
      {dot && <span className="pulse-dot size-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
