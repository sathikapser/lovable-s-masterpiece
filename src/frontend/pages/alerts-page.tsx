import { useState } from "react";
import { BellRing, Check, Filter } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { alerts as seedAlerts, cameras } from "../lib/mock-data";
import { formatDateTime } from "../lib/format";
import type { AlertItem, AlertSeverity } from "../lib/types";
import { PageHeader } from "../components/common/page-header";
import { StatusBadge } from "../components/common/status-badge";
import { EmptyState } from "../components/common/empty-state";

export function AlertsPage() {
  const [list, setList] = useState<AlertItem[]>(seedAlerts);
  const [severity, setSeverity] = useState<AlertSeverity | "all">("all");
  const [cameraId, setCameraId] = useState("all");
  const [date, setDate] = useState("");
  const [channels, setChannels] = useState({ inApp: true, email: true, sms: false });

  const filtered = list.filter(
    (a) =>
      (severity === "all" || a.severity === severity) &&
      (cameraId === "all" || a.cameraId === cameraId) &&
      (date === "" || a.createdAt.startsWith(date)),
  );

  return (
    <div>
      <PageHeader
        eyebrow="06 / Notifications"
        title="Alerts & notifications center"
        description="Severity-ranked stream, camera and API alerts with acknowledgement and channel preferences."
        actions={
          <StatusBadge tone="warning">
            <BellRing className="size-3" aria-hidden /> {list.filter((a) => !a.acknowledged).length} unread
          </StatusBadge>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="panel flex flex-wrap items-end gap-3 p-3">
            <div className="space-y-1.5">
              <Label htmlFor="sev" className="mono-caps text-muted-foreground">
                Severity
              </Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as AlertSeverity | "all")}>
                <SelectTrigger id="sev" className="w-[150px] border-2 bg-surface-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["all", "info", "warning", "critical"].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="acam" className="mono-caps text-muted-foreground">
                Camera
              </Label>
              <Select value={cameraId} onValueChange={setCameraId}>
                <SelectTrigger id="acam" className="w-[170px] border-2 bg-surface-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All cameras</SelectItem>
                  {cameras.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="adate" className="mono-caps text-muted-foreground">
                Date
              </Label>
              <Input
                id="adate"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-2 bg-surface-2 font-mono"
              />
            </div>
            <Button
              variant="outline"
              className="ml-auto"
              onClick={() => {
                setSeverity("all");
                setCameraId("all");
                setDate("");
              }}
            >
              <Filter className="size-4" aria-hidden /> Clear filters
            </Button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No alerts match"
              description="Adjust the severity, camera or date filter to see historical alerts."
            />
          ) : (
            <ul className="space-y-2">
              {filtered.map((a) => (
                <li key={a.id} className="panel flex flex-wrap items-start gap-3 p-3">
                  <StatusBadge tone={a.severity}>{a.severity}</StatusBadge>
                  <div className="min-w-0 flex-1">
                    <p className="slab text-xs">
                      {a.type} · {a.cameraId}
                    </p>
                    <p className="text-sm text-muted-foreground">{a.message}</p>
                    <p className="mono-caps mt-1 text-muted-foreground">
                      {a.id} · {formatDateTime(a.createdAt)}
                    </p>
                  </div>
                  {a.acknowledged ? (
                    <StatusBadge tone="neutral">Acknowledged</StatusBadge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        setList((prev) =>
                          prev.map((x) => (x.id === a.id ? { ...x, acknowledged: true } : x)),
                        );
                        toast.success(`${a.id} acknowledged`);
                      }}
                    >
                      <Check className="size-4" aria-hidden /> Acknowledge
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        <section className="panel-hard space-y-3 p-5">
          <h2 className="text-base">Notification channels</h2>
          {(
            [
              ["inApp", "In-app toasts"],
              ["email", "Email digest"],
              ["sms", "SMS (critical only)"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between border-2 border-border bg-surface-2 px-3 py-2">
              <Label htmlFor={key} className="text-sm">
                {label}
              </Label>
              <Switch
                id={key}
                checked={channels[key]}
                onCheckedChange={(v) => setChannels((c) => ({ ...c, [key]: v }))}
              />
            </div>
          ))}
          <Button className="w-full" onClick={() => toast.success("Preferences saved")}>
            Save preferences
          </Button>
        </section>
      </div>
    </div>
  );
}
