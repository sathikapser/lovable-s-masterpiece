import { useMemo, useState } from "react";
import { FileDown, FileSpreadsheet, FileText, Search } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { cameras, sessions, timeSeries } from "../lib/mock-data";
import { downloadFile, formatNumber, toCsv } from "../lib/format";
import { VEHICLE_CLASSES } from "../lib/types";
import type { SessionRecord, VehicleClass } from "../lib/types";
import { PageHeader } from "../components/common/page-header";
import { StatCard } from "../components/common/stat-card";
import { DataTable, type Column } from "../components/common/data-table";

const CHART_COLORS = [
  "var(--color-chart-1)",
  "var(--color-chart-2)",
  "var(--color-chart-3)",
  "var(--color-chart-4)",
  "var(--color-chart-5)",
  "var(--color-muted-foreground)",
];

export function ReportsPage() {
  const [from, setFrom] = useState("2026-08-04");
  const [to, setTo] = useState("2026-08-17");
  const [cameraId, setCameraId] = useState("all");
  const [classes, setClasses] = useState<VehicleClass[]>([...VEHICLE_CLASSES]);
  const [query, setQuery] = useState("");
  const [compare, setCompare] = useState(false);

  const rows = useMemo(
    () =>
      sessions.filter(
        (s) =>
          s.date >= from &&
          s.date <= to &&
          (cameraId === "all" || s.cameraId === cameraId) &&
          (query.trim() === "" ||
            s.id.toLowerCase().includes(query.trim().toLowerCase()) ||
            s.lane.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [from, to, cameraId, query],
  );

  const totals = useMemo(() => {
    const incoming = rows.reduce((a, r) => a + r.incoming, 0);
    const outgoing = rows.reduce((a, r) => a + r.outgoing, 0);
    const duration = rows.reduce((a, r) => a + r.durationMin, 0);
    return { incoming, outgoing, total: incoming + outgoing, duration };
  }, [rows]);

  const classDistribution = useMemo(
    () =>
      classes.map((c) => ({
        name: c,
        value: rows.reduce((a, r) => a + (r.perClass[c] ?? 0), 0),
      })),
    [rows, classes],
  );

  const laneBreakdown = useMemo(
    () =>
      cameras.map((c) => {
        const laneRows = rows.filter((r) => r.cameraId === c.id);
        return {
          id: c.id,
          lane: c.lane,
          sessions: laneRows.length,
          incoming: laneRows.reduce((a, r) => a + r.incoming, 0),
          outgoing: laneRows.reduce((a, r) => a + r.outgoing, 0),
        };
      }),
    [rows],
  );

  const columns: Column<SessionRecord>[] = [
    {
      key: "id",
      header: "Session",
      sortable: true,
      sortValue: (r) => r.id,
      render: (r) => <span className="font-mono text-xs">{r.id}</span>,
    },
    { key: "date", header: "Date", sortable: true, sortValue: (r) => r.date, render: (r) => r.date },
    { key: "lane", header: "Lane", sortable: true, sortValue: (r) => r.lane, render: (r) => r.lane },
    {
      key: "duration",
      header: "Duration",
      align: "right",
      sortable: true,
      sortValue: (r) => r.durationMin,
      render: (r) => `${r.durationMin}m`,
    },
    {
      key: "in",
      header: "In",
      align: "right",
      sortable: true,
      sortValue: (r) => r.incoming,
      render: (r) => formatNumber(r.incoming),
    },
    {
      key: "out",
      header: "Out",
      align: "right",
      sortable: true,
      sortValue: (r) => r.outgoing,
      render: (r) => formatNumber(r.outgoing),
    },
    {
      key: "total",
      header: "Total",
      align: "right",
      sortable: true,
      sortValue: (r) => r.incoming + r.outgoing,
      render: (r) => <strong>{formatNumber(r.incoming + r.outgoing)}</strong>,
    },
  ];

  function exportAs(kind: "CSV" | "PDF" | "Excel") {
    if (kind === "CSV") {
      downloadFile(
        `tollgrid-sessions-${from}_${to}.csv`,
        toCsv(
          rows.map((r) => ({
            session: r.id,
            date: r.date,
            lane: r.lane,
            duration_min: r.durationMin,
            incoming: r.incoming,
            outgoing: r.outgoing,
            total: r.incoming + r.outgoing,
          })),
        ),
      );
    }
    toast.success(`${kind} export queued`, { description: `${rows.length} sessions` });
  }

  return (
    <div>
      <PageHeader
        eyebrow="05 / Analytics"
        title="Session summary & reports"
        description="Filter by period, lane and vehicle class, then export the counted traffic record."
        actions={
          <>
            <Button variant="outline" onClick={() => exportAs("CSV")}>
              <FileDown className="size-4" aria-hidden /> CSV
            </Button>
            <Button variant="outline" onClick={() => exportAs("PDF")}>
              <FileText className="size-4" aria-hidden /> PDF
            </Button>
            <Button variant="outline" onClick={() => exportAs("Excel")}>
              <FileSpreadsheet className="size-4" aria-hidden /> Excel
            </Button>
          </>
        }
      />

      <section className="panel-hard mb-4 grid gap-3 p-4 lg:grid-cols-4">
        <div className="space-y-1.5">
          <Label htmlFor="from" className="mono-caps text-muted-foreground">
            From
          </Label>
          <Input
            id="from"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border-2 bg-surface-2 font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="to" className="mono-caps text-muted-foreground">
            To
          </Label>
          <Input
            id="to"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border-2 bg-surface-2 font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cam" className="mono-caps text-muted-foreground">
            Camera / lane
          </Label>
          <Select value={cameraId} onValueChange={setCameraId}>
            <SelectTrigger id="cam" className="w-full border-2 bg-surface-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All lanes</SelectItem>
              {cameras.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.id} — {c.lane}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="search" className="mono-caps text-muted-foreground">
            Search sessions / logs
          </Label>
          <div className="flex items-center gap-2 border-2 border-input bg-surface-2 px-2">
            <Search className="size-4 text-muted-foreground" aria-hidden />
            <Input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SES-2601 or Lane 2"
              className="border-0 bg-transparent px-0 font-mono focus-visible:ring-0"
            />
          </div>
        </div>

        <fieldset className="lg:col-span-3">
          <legend className="mono-caps text-muted-foreground">Vehicle classes</legend>
          <div className="mt-1.5 flex flex-wrap gap-2">
            {VEHICLE_CLASSES.map((c) => (
              <Label
                key={c}
                className="flex cursor-pointer items-center gap-2 border-2 border-border bg-surface-2 px-2.5 py-1.5 text-sm has-[[data-state=checked]]:border-signal"
              >
                <Checkbox
                  checked={classes.includes(c)}
                  onCheckedChange={() =>
                    setClasses((prev) =>
                      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
                    )
                  }
                />
                {c}
              </Label>
            ))}
          </div>
        </fieldset>
        <div className="flex items-end gap-2">
          <Switch
            id="compare"
            checked={compare}
            onCheckedChange={setCompare}
            aria-label="Compare with previous period"
          />
          <Label htmlFor="compare" className="mono-caps">
            Compare periods
          </Label>
        </div>
      </section>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Sessions" value={rows.length} tone="neutral" />
        <StatCard label="Incoming" value={totals.incoming} tone="signal" />
        <StatCard label="Outgoing" value={totals.outgoing} tone="info" />
        <StatCard label="Recorded minutes" value={totals.duration} tone="warning" />
      </div>

      <div className="mb-4 grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <section className="panel-hard p-4">
          <h2 className="mb-3 text-sm">Counts over selected period</h2>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeries}>
                <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" />
                <XAxis dataKey="hour" stroke="var(--color-muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--color-muted-foreground)" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "2px solid var(--color-border)",
                    fontFamily: "var(--font-mono)",
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11, textTransform: "uppercase" }} />
                <Line type="monotone" dataKey="incoming" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="outgoing" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
                {compare && (
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="var(--color-chart-3)"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel-hard p-4">
          <h2 className="mb-3 text-sm">Class distribution</h2>
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classDistribution}>
                <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={10} />
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "2px solid var(--color-border)",
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="value" fill="var(--color-chart-1)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={classDistribution} dataKey="value" nameKey="name" outerRadius={60}>
                  {classDistribution.map((_, i) => (
                    <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "var(--color-card)",
                    border: "2px solid var(--color-border)",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <section className="mb-4">
        <h2 className="mb-3 text-base">Session summary</h2>
        <DataTable
          columns={columns}
          rows={rows}
          pageSize={8}
          caption="Sessions in the selected range"
          emptyTitle="No sessions found"
          emptyDescription="Widen the date range or clear the lane filter to see recorded sessions."
        />
      </section>

      <section className="panel-hard overflow-x-auto p-4">
        <h2 className="mb-3 text-sm">Lane-wise breakdown</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-border">
              {["Lane", "Camera", "Sessions", "Incoming", "Outgoing", "Total"].map((h) => (
                <th key={h} className="mono-caps py-2 text-left text-muted-foreground">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {laneBreakdown.map((l) => (
              <tr key={l.id} className="border-b border-border/60">
                <td className="py-2">{l.lane}</td>
                <td className="font-mono text-xs">{l.id}</td>
                <td className="tabular-nums">{l.sessions}</td>
                <td className="tabular-nums">{formatNumber(l.incoming)}</td>
                <td className="tabular-nums">{formatNumber(l.outgoing)}</td>
                <td className="tabular-nums font-bold">{formatNumber(l.incoming + l.outgoing)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
