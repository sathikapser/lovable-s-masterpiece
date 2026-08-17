import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  description,
  action,
  icon,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="panel flex flex-col items-center justify-center gap-3 border-dashed px-6 py-12 text-center">
      <div
        className="flex size-14 items-center justify-center border-2 border-border bg-surface-2 text-signal"
        aria-hidden
      >
        {icon ?? <Inbox className="size-6" />}
      </div>
      <h3 className="text-base">{title}</h3>
      <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      {action}
    </div>
  );
}
