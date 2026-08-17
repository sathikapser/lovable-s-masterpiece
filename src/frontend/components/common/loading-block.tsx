import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function LoadingBlock({ label = "Loading", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div className="panel space-y-2 p-4" role="status" aria-live="polite" aria-busy="true">
      <p className="mono-caps flex items-center gap-2 text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden /> {label}
      </p>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-full bg-surface-3" />
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="panel p-4" role="status" aria-busy="true">
      <Skeleton className="h-[240px] w-full bg-surface-3" />
    </div>
  );
}
