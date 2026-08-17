export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatClock(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2, "0");
  const m = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  const s = String(total % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function toCsv(rows: Record<string, string | number>[]) {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const body = rows.map((r) => headers.map((h) => JSON.stringify(r[h] ?? "")).join(","));
  return [headers.join(","), ...body].join("\n");
}

export function downloadFile(name: string, content: string, mime = "text/csv") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
