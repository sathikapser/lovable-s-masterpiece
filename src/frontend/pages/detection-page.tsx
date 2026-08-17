import { useState } from "react";
import { Cpu, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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
import { defaultDetectionSettings } from "../lib/mock-data";
import { VEHICLE_CLASSES } from "../lib/types";
import type { DetectionSettings, VehicleClass } from "../lib/types";
import { PageHeader } from "../components/common/page-header";
import { Field } from "../components/common/field";
import { SliderInput } from "../components/common/slider-input";
import { StatusBadge } from "../components/common/status-badge";

const MODELS = ["YOLOv8n", "YOLOv8s", "YOLOv8m", "YOLOv8l", "YOLOv11s", "YOLOv11m"];
const TRACKERS: DetectionSettings["tracker"][] = ["ByteTrack", "DeepSORT", "SORT"];

export function DetectionPage() {
  const [draft, setDraft] = useState<DetectionSettings>(defaultDetectionSettings);
  const [applied, setApplied] = useState<DetectionSettings>(defaultDetectionSettings);

  const dirty = JSON.stringify(draft) !== JSON.stringify(applied);

  function toggleClass(c: VehicleClass) {
    setDraft((d) => ({
      ...d,
      classes: d.classes.includes(c) ? d.classes.filter((x) => x !== c) : [...d.classes, c],
    }));
  }

  return (
    <div>
      <PageHeader
        eyebrow="03 / Inference"
        title="Detection & tracking settings"
        description="Model, class filter, thresholds, tracker and device — applied by restarting the pipeline."
        actions={
          <StatusBadge tone={dirty ? "warning" : "live"}>
            {dirty ? "Unapplied changes" : "In sync with pipeline"}
          </StatusBadge>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
        <section className="panel-hard space-y-5 p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Model" hint="Weights loaded on the edge device">
              {(p) => (
                <Select value={draft.model} onValueChange={(v) => setDraft((d) => ({ ...d, model: v }))}>
                  <SelectTrigger id={p.id} className="w-full border-2 bg-surface-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MODELS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
            <Field label="Tracker" hint="Association algorithm">
              {(p) => (
                <Select
                  value={draft.tracker}
                  onValueChange={(v) => setDraft((d) => ({ ...d, tracker: v as DetectionSettings["tracker"] }))}
                >
                  <SelectTrigger id={p.id} className="w-full border-2 bg-surface-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TRACKERS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          </div>

          <fieldset className="space-y-2">
            <legend className="mono-caps text-muted-foreground">Vehicle classes</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {VEHICLE_CLASSES.map((c) => (
                <Label
                  key={c}
                  className="flex cursor-pointer items-center gap-2 border-2 border-border bg-surface-2 px-3 py-2 text-sm has-[[data-state=checked]]:border-signal"
                >
                  <Checkbox checked={draft.classes.includes(c)} onCheckedChange={() => toggleClass(c)} />
                  {c === "Auto" ? "Auto / 3-wheeler" : c}
                </Label>
              ))}
            </div>
          </fieldset>

          <div className="grid gap-5 sm:grid-cols-2">
            <SliderInput
              id="conf"
              label="Confidence threshold"
              value={draft.confidence}
              min={0.05}
              max={0.95}
              step={0.01}
              onChange={(v) => setDraft((d) => ({ ...d, confidence: v }))}
            />
            <SliderInput
              id="iou"
              label="IoU / NMS threshold"
              value={draft.iou}
              min={0.1}
              max={0.9}
              step={0.01}
              onChange={(v) => setDraft((d) => ({ ...d, iou: v }))}
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Max track age / re-ID window" hint="Frames before a lost track is dropped">
              {(p) => (
                <Input
                  {...p}
                  type="number"
                  min={5}
                  max={300}
                  value={draft.maxTrackAge}
                  onChange={(e) => setDraft((d) => ({ ...d, maxTrackAge: Number(e.target.value) }))}
                  className="border-2 bg-surface-2 font-mono"
                />
              )}
            </Field>
            <div className="space-y-1.5">
              <p className="mono-caps text-muted-foreground">Inference device</p>
              <div className="flex items-center gap-3 border-2 border-border bg-surface-2 px-3 py-2">
                <Cpu className="size-4 text-signal" aria-hidden />
                <Label htmlFor="device" className="text-sm">
                  {draft.device}
                </Label>
                <Switch
                  id="device"
                  className="ml-auto"
                  checked={draft.device === "GPU"}
                  onCheckedChange={(v) => setDraft((d) => ({ ...d, device: v ? "GPU" : "CPU" }))}
                  aria-label="Toggle GPU inference"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 border-t-2 border-border pt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button disabled={!dirty}>
                  <RefreshCw className="size-4" aria-hidden /> Apply and restart pipeline
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="panel-hard">
                <AlertDialogHeader>
                  <AlertDialogTitle>Restart the inference pipeline?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All lanes pause for roughly 4–8 seconds while weights reload. In-flight tracks
                    are lost; committed counts are preserved.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      setApplied(draft);
                      toast.success("Pipeline restarted", {
                        description: `${draft.model} · ${draft.tracker} · conf ${draft.confidence.toFixed(2)}`,
                      });
                    }}
                  >
                    Apply and restart
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button variant="outline" onClick={() => setDraft(applied)} disabled={!dirty}>
              Discard changes
            </Button>
          </div>
        </section>

        <section className="panel-hard space-y-3 p-5">
          <h2 className="text-base">Active configuration</h2>
          <dl className="space-y-2 font-mono text-xs">
            {[
              ["Model", applied.model],
              ["Tracker", applied.tracker],
              ["Confidence", applied.confidence.toFixed(2)],
              ["IoU / NMS", applied.iou.toFixed(2)],
              ["Max track age", `${applied.maxTrackAge} frames`],
              ["Device", applied.device],
              ["Classes", applied.classes.join(", ") || "none"],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 border-2 border-border bg-surface-2 p-2">
                <dt className="mono-caps text-muted-foreground">{k}</dt>
                <dd className="text-right">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="text-xs text-muted-foreground">
            Changes stage locally and are pushed to the edge worker only when you apply — an
            optimistic save is rolled back automatically if the worker rejects the config.
          </p>
        </section>
      </div>
    </div>
  );
}
