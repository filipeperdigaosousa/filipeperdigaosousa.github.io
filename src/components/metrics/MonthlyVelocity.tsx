"use client";

import { useMemo, useState } from "react";

interface MonthPoint {
  month: string;
  count: number;
}

interface MonthlyVelocityProps {
  merged: MonthPoint[];
  reviewed: MonthPoint[];
}

function shortMonth(iso: string) {
  const [y, m] = iso.split("-").map((s) => Number.parseInt(s, 10));
  const d = new Date(Date.UTC(y, m - 1, 1));
  return d.toLocaleDateString("en-GB", {
    month: "short",
    timeZone: "UTC",
  });
}

export default function MonthlyVelocity({
  merged,
  reviewed,
}: MonthlyVelocityProps) {
  const [hover, setHover] = useState<{ i: number; x: number } | null>(null);

  const { max, months } = useMemo(() => {
    const months = merged.map((m, i) => ({
      key: m.month,
      merged: m.count,
      reviewed: reviewed[i]?.count ?? 0,
    }));
    const max = Math.max(1, ...months.flatMap((m) => [m.merged, m.reviewed]));
    return { max, months };
  }, [merged, reviewed]);

  return (
    <div className="relative">
      <div className="h-48 flex items-end gap-2 pt-4">
        {months.map((m, i) => (
          <div
            key={m.key}
            className="flex-1 flex items-end gap-1 h-full relative"
            onMouseEnter={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const parent = e.currentTarget.parentElement?.getBoundingClientRect();
              setHover({
                i,
                x: rect.left + rect.width / 2 - (parent?.left ?? 0),
              });
            }}
            onMouseLeave={() => setHover(null)}
          >
            <div
              className="flex-1 bg-secondary rounded-t-sm transition-all hover:brightness-125"
              style={{ height: `${(m.merged / max) * 100}%` }}
            />
            <div
              className="flex-1 bg-primary rounded-t-sm transition-all hover:brightness-125"
              style={{ height: `${(m.reviewed / max) * 100}%` }}
            />
          </div>
        ))}
      </div>
      <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: `repeat(${months.length},1fr)` }}>
        {months.map((m) => (
          <div
            key={m.key}
            className="font-mono text-[10px] text-tertiary text-center uppercase tracking-widest"
          >
            {shortMonth(m.key)}
          </div>
        ))}
      </div>
      {hover ? (
        <div
          className="pointer-events-none absolute -top-2 -translate-x-1/2 -translate-y-full"
          style={{ left: hover.x }}
        >
          <div className="bg-surface-container-high border border-white/10 rounded px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] whitespace-nowrap font-mono text-code-sm">
            <div className="text-on-surface">
              {months[hover.i].key}
            </div>
            <div className="text-secondary">
              merged: {months[hover.i].merged}
            </div>
            <div className="text-primary">
              reviewed: {months[hover.i].reviewed}
            </div>
          </div>
        </div>
      ) : null}
      <div className="flex gap-6 mt-4 font-mono text-code-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-secondary rounded-sm" />
          <span className="text-on-surface-variant">merged</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-primary rounded-sm" />
          <span className="text-on-surface-variant">reviewed</span>
        </div>
      </div>
    </div>
  );
}
