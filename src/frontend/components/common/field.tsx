import { useId } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Consistent label + control + validation-error group used on every form page. */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; "aria-describedby": string; "aria-invalid": boolean }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const describedBy = `${id}-desc`;
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="mono-caps text-muted-foreground">
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": Boolean(error) })}
      <p
        id={describedBy}
        className={cn("font-mono text-[11px]", error ? "text-destructive" : "text-muted-foreground")}
      >
        {error ?? hint ?? "\u00a0"}
      </p>
    </div>
  );
}
