export function formatMonthYear(iso: string): string {
  const [y, m] = iso.split("-").map((n) => Number.parseInt(n, 10));
  const d = new Date(Date.UTC(y, (m ?? 1) - 1, 1));
  return d.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function formatRange(start: string, end: string | null): string {
  const startLabel = formatMonthYear(start);
  const endLabel = end ? formatMonthYear(end) : "Present";
  return `${startLabel} — ${endLabel}`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-GB");
}
