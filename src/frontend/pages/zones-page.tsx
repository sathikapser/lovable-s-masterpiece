import { useState } from "react";
import { Eye, Minus, Pencil, PenTool, Redo2, RotateCcw, Save, Trash2, Undo2 } from "lucide-react";
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
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cameras, defaultZones } from "../lib/mock-data";
import type { Zone } from "../lib/types";
import { PageHeader } from "../components/common/page-header";
import { StatusBadge } from "../components/common/status-badge";
import { EmptyState } from "../components/common/empty-state";
import { ZoneCanvas } from "../components/zones/zone-canvas";

export function ZonesPage() {
  const [cameraId, setCameraId] = useState(cameras[0]!.id);
  const [tool, setTool] = useState<"line" | "polygon">("line");
  const [zones, setZones] = useState<Zone[]>(defaultZones);
  const [history, setHistory] = useState<Zone[][]>([]);
  const [future, setFuture] = useState<Zone[][]>([]);
  const [draft, setDraft] = useState<{ x: number; y: number }[]>([]);
  const [label, setLabel] = useState("");
  const [direction, setDirection] = useState<"incoming" | "outgoing">("incoming");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  function commit(next: Zone[]) {
    setHistory((h) => [...h, zones]);
    setFuture([]);
    setZones(next);
  }

  function addPoint(p: { x: number; y: number }) {
    const next = [...draft, p];
    if (tool === "line" && next.length === 2) {
      commit([
        ...zones,
        {
          id: `z-${Date.now()}`,
          label: label || `Line ${zones.length + 1}`,
          kind: "line",
          points: next,
          direction,
        },
      ]);
      setDraft([]);
      setLabel("");
      toast.success("Counting line added");
      return;
    }
    setDraft(next);
  }

  function finishPolygon() {
    if (draft.length < 3) {
      toast.error("A polygon needs at least 3 points");
      return;
    }
    commit([
      ...zones,
      {
        id: `z-${Date.now()}`,
        label: label || `Zone ${zones.length + 1}`,
        kind: "polygon",
        points: draft,
        direction,
      },
    ]);
    setDraft([]);
    setLabel("");
    toast.success("Polygon zone added");
  }

  return (
    <div>
      <PageHeader
        eyebrow="04 / Geometry"
        title="Zone & counting-line setup"
        description="Draw lines and polygons on the camera frame, assign crossing direction, then save the layout per camera."
        actions={
          <>
            <Select value={cameraId} onValueChange={setCameraId}>
              <SelectTrigger className="w-[200px] border-2 bg-surface-2" aria-label="Camera">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.id} — {c.lane}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <StatusBadge tone="neutral">{zones.length} zones</StatusBadge>
          </>
        }
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <div className="space-y-3">
          <div className="panel flex flex-wrap items-center gap-2 p-3">
            <ToggleGroup
              type="single"
              value={tool}
              onValueChange={(v) => v && setTool(v as "line" | "polygon")}
              className="border-2 border-border"
            >
              <ToggleGroupItem value="line" aria-label="Draw line tool" className="gap-2 px-3">
                <Minus className="size-4" aria-hidden /> Line
              </ToggleGroupItem>
              <ToggleGroupItem value="polygon" aria-label="Draw polygon tool" className="gap-2 px-3">
                <PenTool className="size-4" aria-hidden /> Polygon
              </ToggleGroupItem>
            </ToggleGroup>

            <Button
              variant="outline"
              size="icon"
              aria-label="Undo"
              disabled={history.length === 0}
              onClick={() => {
                const prev = history[history.length - 1];
                if (!prev) return;
                setHistory((h) => h.slice(0, -1));
                setFuture((f) => [zones, ...f]);
                setZones(prev);
              }}
            >
              <Undo2 className="size-4" aria-hidden />
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label="Redo"
              disabled={future.length === 0}
              onClick={() => {
                const next = future[0];
                if (!next) return;
                setFuture((f) => f.slice(1));
                setHistory((h) => [...h, zones]);
                setZones(next);
              }}
            >
              <Redo2 className="size-4" aria-hidden />
            </Button>

            {tool === "polygon" && (
              <Button variant="secondary" onClick={finishPolygon} disabled={draft.length < 3}>
                Close polygon ({draft.length})
              </Button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <Eye className="size-4 text-muted-foreground" aria-hidden />
              <Label htmlFor="preview" className="mono-caps">
                Preview mode
              </Label>
              <Switch
                id="preview"
                checked={preview}
                onCheckedChange={setPreview}
                aria-label="Toggle live detection preview against saved zones"
              />
            </div>
          </div>

          <ZoneCanvas
            zones={zones}
            draft={draft}
            tool={tool}
            selectedId={selectedId}
            showDetections={preview}
            onAddPoint={addPoint}
          />

          <div className="panel flex flex-wrap items-center gap-2 p-3">
            <Button
              onClick={() => toast.success(`Layout saved for ${cameraId}`, { description: `${zones.length} zones persisted` })}
            >
              <Save className="size-4" aria-hidden /> Save layout
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                commit(defaultZones);
                setDraft([]);
                toast.info("Layout reset to default");
              }}
            >
              <RotateCcw className="size-4" aria-hidden /> Reset to default
            </Button>
            <p className="mono-caps ml-auto text-muted-foreground">
              Click the frame to place points
            </p>
          </div>
        </div>

        <section className="panel-hard space-y-4 p-5">
          <h2 className="text-base">Zone properties</h2>

          <div className="space-y-1.5">
            <Label htmlFor="zone-label" className="mono-caps text-muted-foreground">
              Lane label for next zone
            </Label>
            <Input
              id="zone-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Lane 2 counting line"
              className="border-2 bg-surface-2"
            />
          </div>

          <fieldset className="space-y-1.5">
            <legend className="mono-caps text-muted-foreground">Direction assignment</legend>
            <ToggleGroup
              type="single"
              value={direction}
              onValueChange={(v) => v && setDirection(v as "incoming" | "outgoing")}
              className="w-full border-2 border-border"
            >
              <ToggleGroupItem value="incoming" className="flex-1">
                Crossing A→B = Incoming
              </ToggleGroupItem>
              <ToggleGroupItem value="outgoing" className="flex-1">
                Crossing A→B = Outgoing
              </ToggleGroupItem>
            </ToggleGroup>
          </fieldset>

          <div className="space-y-2 border-t-2 border-border pt-3">
            <h3 className="text-sm">Zone list</h3>
            {zones.length === 0 ? (
              <EmptyState
                title="No zones drawn"
                description="Use the line or polygon tool to define counting geometry for this camera."
              />
            ) : (
              <ul className="space-y-2">
                {zones.map((z) => (
                  <li
                    key={z.id}
                    className={`flex items-center gap-2 border-2 bg-surface-2 p-2 ${
                      selectedId === z.id ? "border-signal" : "border-border"
                    }`}
                  >
                    <button
                      type="button"
                      className="min-w-0 flex-1 text-left"
                      onClick={() => setSelectedId(z.id)}
                    >
                      <p className="slab truncate text-xs">{z.label}</p>
                      <p className="mono-caps text-muted-foreground">
                        {z.kind} · {z.points.length} pts · {z.direction}
                      </p>
                    </button>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={`Rename ${z.label}`}
                      onClick={() => {
                        const name = window.prompt("Rename zone", z.label);
                        if (name) commit(zones.map((x) => (x.id === z.id ? { ...x, label: name } : x)));
                      }}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      aria-label={`Delete ${z.label}`}
                      onClick={() => commit(zones.filter((x) => x.id !== z.id))}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
