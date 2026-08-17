import { useState } from "react";
import { HardDrive, KeyRound, ShieldCheck, Upload, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiKeys, auditLog, users as seedUsers } from "../lib/mock-data";
import { formatDateTime } from "../lib/format";
import type { Role, User } from "../lib/types";
import { PageHeader } from "../components/common/page-header";
import { Field } from "../components/common/field";
import { SliderInput } from "../components/common/slider-input";
import { StatusBadge } from "../components/common/status-badge";
import { DataTable, type Column } from "../components/common/data-table";

export function AdminPage() {
  const [users, setUsers] = useState<User[]>(seedUsers);
  const [retention, setRetention] = useState(90);
  const [db, setDb] = useState({ host: "10.20.1.5", port: "5432", name: "tollgrid", user: "tg_app", password: "" });
  const [notify, setNotify] = useState({ email: "ops@plaza.in", sms: "+91 90000 00000", threshold: 180 });

  const columns: Column<User>[] = [
    { key: "user", header: "Operator", sortable: true, sortValue: (r) => r.username, render: (r) => (
        <div>
          <p className="text-sm">{r.displayName}</p>
          <p className="mono-caps text-muted-foreground">{r.username}</p>
        </div>
      ) },
    {
      key: "role",
      header: "Role",
      render: (r) => (
        <Select
          value={r.role}
          onValueChange={(v) =>
            setUsers((prev) => prev.map((u) => (u.id === r.id ? { ...u, role: v as Role } : u)))
          }
        >
          <SelectTrigger className="w-[130px] border-2 bg-surface-2" aria-label={`Role for ${r.username}`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(["admin", "operator", "viewer"] as Role[]).map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    { key: "last", header: "Last login", render: (r) => formatDateTime(r.lastLogin) },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge tone={r.status === "active" ? "live" : "offline"}>{r.status}</StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <Button
          size="sm"
          variant={r.status === "active" ? "destructive" : "secondary"}
          onClick={() => {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === r.id
                  ? { ...u, status: u.status === "active" ? "deactivated" : "active" }
                  : u,
              ),
            );
            toast.success(`${r.username} ${r.status === "active" ? "deactivated" : "reactivated"}`);
          }}
        >
          {r.status === "active" ? "Deactivate" : "Reactivate"}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="07 / Administration"
        title="Admin & system settings"
        description="Operators, database, retention, notifications, model weights, health and audit trail."
        actions={
          <Button onClick={() => toast.info("Invite sent to new operator")}>
            <UserPlus className="size-4" aria-hidden /> Add operator
          </Button>
        }
      />

      <section className="mb-6">
        <h2 className="mb-3 text-base">User management</h2>
        <DataTable columns={columns} rows={users} pageSize={6} caption="Operator accounts" />
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="panel-hard space-y-3 p-5">
          <h2 className="text-base">Database connection</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Host">
              {(p) => (
                <Input {...p} value={db.host} onChange={(e) => setDb({ ...db, host: e.target.value })} className="border-2 bg-surface-2 font-mono" />
              )}
            </Field>
            <Field label="Port">
              {(p) => (
                <Input {...p} value={db.port} onChange={(e) => setDb({ ...db, port: e.target.value })} className="border-2 bg-surface-2 font-mono" />
              )}
            </Field>
            <Field label="Database name">
              {(p) => (
                <Input {...p} value={db.name} onChange={(e) => setDb({ ...db, name: e.target.value })} className="border-2 bg-surface-2 font-mono" />
              )}
            </Field>
            <Field label="Username">
              {(p) => (
                <Input {...p} value={db.user} onChange={(e) => setDb({ ...db, user: e.target.value })} className="border-2 bg-surface-2 font-mono" />
              )}
            </Field>
            <Field label="Password" hint="Masked, stored server-side only" className="sm:col-span-2">
              {(p) => (
                <Input
                  {...p}
                  type="password"
                  value={db.password}
                  onChange={(e) => setDb({ ...db, password: e.target.value })}
                  className="border-2 bg-surface-2 font-mono"
                />
              )}
            </Field>
          </div>
          <SliderInput
            id="retention"
            label="Data retention period"
            value={retention}
            min={7}
            max={365}
            step={1}
            suffix="days"
            onChange={setRetention}
          />
          <Button onClick={() => toast.success("System settings saved")}>Save settings</Button>
        </section>

        <div className="space-y-4">
          <section className="panel-hard space-y-3 p-5">
            <h2 className="text-base">Notifications</h2>
            <Field label="Email recipients">
              {(p) => (
                <Input {...p} value={notify.email} onChange={(e) => setNotify({ ...notify, email: e.target.value })} className="border-2 bg-surface-2 font-mono" />
              )}
            </Field>
            <Field label="SMS recipients">
              {(p) => (
                <Input {...p} value={notify.sms} onChange={(e) => setNotify({ ...notify, sms: e.target.value })} className="border-2 bg-surface-2 font-mono" />
              )}
            </Field>
            <SliderInput
              id="threshold"
              label="Hourly count breach rule"
              value={notify.threshold}
              min={20}
              max={600}
              step={10}
              suffix="veh/h"
              onChange={(v) => setNotify({ ...notify, threshold: v })}
            />
          </section>

          <section className="panel-hard space-y-3 p-5">
            <h2 className="text-base">Model weights</h2>
            <div className="flex flex-wrap items-center gap-2">
              <Label
                htmlFor="weights"
                className="flex cursor-pointer items-center gap-2 border-2 border-border bg-surface-2 px-3 py-2 text-sm"
              >
                <Upload className="size-4" aria-hidden /> Upload .pt file
              </Label>
              <Input id="weights" type="file" className="sr-only" onChange={() => toast.success("Weights uploaded")} />
              <Select defaultValue="v4.2.0">
                <SelectTrigger className="w-[150px] border-2 bg-surface-2" aria-label="Weight version">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["v4.2.0", "v4.1.3", "v3.9.7"].map((v) => (
                    <SelectItem key={v} value={v}>
                      {v}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section className="panel-hard space-y-3 p-5">
            <h2 className="text-base">System health</h2>
            {[
              { label: "GPU load", value: 68 },
              { label: "CPU load", value: 41 },
              { label: "Storage used", value: 76 },
              { label: "Stream uptime (30d)", value: 99 },
            ].map((m) => (
              <div key={m.label}>
                <div className="flex justify-between">
                  <span className="mono-caps text-muted-foreground">{m.label}</span>
                  <span className="font-mono text-xs">{m.value}%</span>
                </div>
                <Progress value={m.value} className="mt-1 h-2 border-2 border-border bg-surface-3" />
              </div>
            ))}
            <p className="mono-caps flex items-center gap-2 text-muted-foreground">
              <HardDrive className="size-3.5" aria-hidden /> 1.8 TB of 2.4 TB used
            </p>
          </section>
        </div>

        <section className="panel-hard space-y-3 p-5">
          <h2 className="text-base">API keys & integrations</h2>
          <ul className="space-y-2">
            {apiKeys.map((k) => (
              <li key={k.id} className="flex items-center gap-3 border-2 border-border bg-surface-2 p-2">
                <KeyRound className="size-4 text-signal" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{k.label}</p>
                  <p className="mono-caps text-muted-foreground">
                    {k.key} · {k.scope} · {k.created}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => toast.success(`${k.label} key rotated`)}>
                  Rotate
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel-hard space-y-3 p-5">
          <h2 className="text-base">Audit log</h2>
          <ul className="space-y-2">
            {auditLog.map((a) => (
              <li key={a.id} className="border-2 border-border bg-surface-2 p-2">
                <p className="mono-caps flex items-center gap-2 text-muted-foreground">
                  <ShieldCheck className="size-3.5" aria-hidden /> {a.actor} · {formatDateTime(a.at)}
                </p>
                <p className="text-sm">{a.action}</p>
                <p className="mono-caps text-muted-foreground">Target: {a.target}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
