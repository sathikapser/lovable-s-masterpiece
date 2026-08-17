import { useState } from "react";
import { Loader2, Pencil, Plus, Trash2, Wifi } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cameras as seedCameras } from "../lib/mock-data";
import type { Camera } from "../lib/types";
import { PageHeader } from "../components/common/page-header";
import { Field } from "../components/common/field";
import { StatusBadge } from "../components/common/status-badge";
import { DataTable, type Column } from "../components/common/data-table";

const SOURCE_TYPES = [
  { value: "rtsp", label: "RTSP stream" },
  { value: "ip", label: "IP camera (MJPEG)" },
  { value: "webcam", label: "Local webcam" },
  { value: "file", label: "Uploaded file" },
] as const;

export function CamerasPage() {
  const [list, setList] = useState<Camera[]>(seedCameras);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    id: "CAM-L5",
    name: "",
    lane: "",
    sourceType: "rtsp" as Camera["sourceType"],
    url: "",
    resolution: "1920x1080",
    targetFps: 30,
  });
  const [urlError, setUrlError] = useState<string>();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"idle" | "ok" | "fail">("idle");

  function reset() {
    setEditingId(null);
    setForm({
      id: `CAM-L${list.length + 1}`,
      name: "",
      lane: "",
      sourceType: "rtsp",
      url: "",
      resolution: "1920x1080",
      targetFps: 30,
    });
    setTestResult("idle");
    setUrlError(undefined);
  }

  function validate() {
    if (!form.url.trim()) {
      setUrlError("Stream URL or file path is required.");
      return false;
    }
    if (form.sourceType === "rtsp" && !form.url.startsWith("rtsp://")) {
      setUrlError("RTSP sources must start with rtsp://");
      return false;
    }
    setUrlError(undefined);
    return true;
  }

  function save() {
    if (!validate()) return;
    const next: Camera = {
      id: form.id,
      name: form.name || `${form.lane || "Lane"} camera`,
      lane: form.lane || "Lane ?",
      sourceType: form.sourceType,
      url: form.url,
      resolution: form.resolution,
      targetFps: form.targetFps,
      status: "online",
    };
    setList((prev) =>
      editingId ? prev.map((c) => (c.id === editingId ? next : c)) : [...prev, next],
    );
    toast.success(editingId ? "Camera updated" : "Camera added", { description: next.id });
    reset();
  }

  const columns: Column<Camera>[] = [
    {
      key: "id",
      header: "ID",
      sortable: true,
      sortValue: (r) => r.id,
      render: (r) => <span className="font-mono text-xs">{r.id}</span>,
    },
    { key: "name", header: "Name", sortable: true, sortValue: (r) => r.name, render: (r) => r.name },
    { key: "lane", header: "Lane", render: (r) => r.lane },
    {
      key: "source",
      header: "Source",
      render: (r) => <span className="font-mono text-[11px] break-all">{r.url}</span>,
    },
    { key: "res", header: "Res / FPS", render: (r) => `${r.resolution} @ ${r.targetFps}` },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <StatusBadge tone={r.status === "online" ? "live" : r.status === "degraded" ? "warning" : "offline"}>
          {r.status}
        </StatusBadge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      align: "right",
      render: (r) => (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="outline"
            aria-label={`Edit ${r.id}`}
            onClick={() => {
              setEditingId(r.id);
              setForm({
                id: r.id,
                name: r.name,
                lane: r.lane,
                sourceType: r.sourceType,
                url: r.url,
                resolution: r.resolution,
                targetFps: r.targetFps,
              });
            }}
          >
            <Pencil className="size-4" aria-hidden />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button size="icon" variant="destructive" aria-label={`Delete ${r.id}`}>
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="panel-hard">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete {r.id}?</AlertDialogTitle>
                <AlertDialogDescription>
                  Removing this source stops counting for {r.lane} and deletes its saved zone layout.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    setList((prev) => prev.filter((c) => c.id !== r.id));
                    toast.success(`${r.id} deleted`);
                  }}
                >
                  Delete camera
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="02 / Configuration"
        title="Camera & source setup"
        description="Register RTSP, IP, webcam or file sources per lane, test connectivity and preview frames."
        actions={
          <Button variant="outline" onClick={reset}>
            <Plus className="size-4" aria-hidden /> New source
          </Button>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <section className="panel-hard space-y-4 p-5">
          <h2 className="text-base">{editingId ? `Edit ${editingId}` : "Add source"}</h2>

          <fieldset className="space-y-2">
            <legend className="mono-caps text-muted-foreground">Source type</legend>
            <RadioGroup
              value={form.sourceType}
              onValueChange={(v) => setForm((f) => ({ ...f, sourceType: v as Camera["sourceType"] }))}
              className="grid grid-cols-2 gap-2"
            >
              {SOURCE_TYPES.map((s) => (
                <Label
                  key={s.value}
                  className="flex cursor-pointer items-center gap-2 border-2 border-border bg-surface-2 px-3 py-2 text-sm has-[[data-state=checked]]:border-signal"
                >
                  <RadioGroupItem value={s.value} /> {s.label}
                </Label>
              ))}
            </RadioGroup>
          </fieldset>

          <Field
            label="Stream URL / file path"
            required
            error={urlError}
            hint="rtsp://host:554/stream1 or /media/clip.mp4"
          >
            {(p) => (
              <Input
                {...p}
                value={form.url}
                onChange={(e) => setForm((f) => ({ ...f, url: e.target.value }))}
                className="border-2 bg-surface-2 font-mono text-xs"
              />
            )}
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Camera / lane name">
              {(p) => (
                <Input
                  {...p}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="border-2 bg-surface-2"
                />
              )}
            </Field>
            <Field label="Camera / lane ID" hint="Auto-generated, editable">
              {(p) => (
                <Input
                  {...p}
                  value={form.id}
                  onChange={(e) => setForm((f) => ({ ...f, id: e.target.value }))}
                  className="border-2 bg-surface-2 font-mono"
                />
              )}
            </Field>
            <Field label="Lane label">
              {(p) => (
                <Input
                  {...p}
                  value={form.lane}
                  onChange={(e) => setForm((f) => ({ ...f, lane: e.target.value }))}
                  className="border-2 bg-surface-2"
                />
              )}
            </Field>
            <Field label="Resolution">
              {(p) => (
                <Select
                  value={form.resolution}
                  onValueChange={(v) => setForm((f) => ({ ...f, resolution: v }))}
                >
                  <SelectTrigger id={p.id} className="w-full border-2 bg-surface-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["3840x2160", "1920x1080", "1280x720", "854x480"].map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
            <Field label="Target FPS">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  min={1}
                  max={60}
                  value={form.targetFps}
                  onChange={(e) => setForm((f) => ({ ...f, targetFps: Number(e.target.value) }))}
                  className="border-2 bg-surface-2 font-mono"
                />
              )}
            </Field>
          </div>

          <div className="flex flex-wrap items-center gap-2 border-t-2 border-border pt-3">
            <Button
              variant="secondary"
              onClick={() => {
                if (!validate()) return;
                setTesting(true);
                setTestResult("idle");
                setTimeout(() => {
                  setTesting(false);
                  const ok = form.url.length > 8;
                  setTestResult(ok ? "ok" : "fail");
                  ok ? toast.success("Connection established") : toast.error("Connection failed");
                }, 900);
              }}
            >
              {testing ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Wifi className="size-4" aria-hidden />
              )}
              Test connection
            </Button>
            {testResult !== "idle" && (
              <StatusBadge tone={testResult === "ok" ? "live" : "critical"}>
                {testResult === "ok" ? "Stream reachable" : "No response"}
              </StatusBadge>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" onClick={reset}>
                Cancel
              </Button>
              <Button onClick={save}>Save source</Button>
            </div>
          </div>
        </section>

        <section className="panel-hard space-y-3 p-5">
          <h2 className="text-base">Frame preview</h2>
          <div className="scanlines relative aspect-video border-2 border-border bg-[linear-gradient(160deg,oklch(0.2_0.02_260),oklch(0.3_0.03_230))]">
            {testing ? (
              <div className="absolute inset-0 grid place-items-center">
                <p className="mono-caps flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" aria-hidden /> Grabbing frame…
                </p>
              </div>
            ) : testResult === "ok" ? (
              <div className="absolute inset-0 grid place-items-center">
                <StatusBadge tone="live" dot>
                  {form.id} · {form.resolution}
                </StatusBadge>
              </div>
            ) : (
              <div className="absolute inset-0 grid place-items-center px-4 text-center">
                <p className="mono-caps text-muted-foreground">
                  Run a connection test to fetch a preview frame
                </p>
              </div>
            )}
          </div>
          <dl className="grid grid-cols-2 gap-2 font-mono text-[11px]">
            <div className="border-2 border-border bg-surface-2 p-2">
              <dt className="text-muted-foreground">TYPE</dt>
              <dd>{form.sourceType}</dd>
            </div>
            <div className="border-2 border-border bg-surface-2 p-2">
              <dt className="text-muted-foreground">TARGET FPS</dt>
              <dd>{form.targetFps}</dd>
            </div>
          </dl>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-base">Existing cameras</h2>
        <DataTable
          columns={columns}
          rows={list}
          pageSize={6}
          caption="Configured camera sources"
          emptyTitle="No cameras configured"
          emptyDescription="Add an RTSP, IP, webcam or file source to start counting vehicles."
        />
      </section>
    </div>
  );
}
