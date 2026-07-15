"use client";

import { useMemo, useState, useRef } from "react";

interface Day {
  date: string;
  count: number;
}

interface HeatmapProps {
  days: Day[];
  compact?: boolean;
}

function intensityClass(count: number, max: number) {
  if (count === 0) return "bg-white/5";
  const ratio = count / max;
  if (ratio > 0.75) return "bg-secondary";
  if (ratio > 0.5) return "bg-secondary/70";
  if (ratio > 0.25) return "bg-secondary/40";
  return "bg-secondary/20";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

interface HoverState {
  day: Day;
  x: number;
  y: number;
}

export default function Heatmap({ days, compact = false }: HeatmapProps) {
  const [hover, setHover] = useState<HoverState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { columns, max } = useMemo(() => {
    if (!days.length) return { columns: [] as (Day | null)[][], max: 1 };
    const first = new Date(days[0].date);
    const firstDow = first.getUTCDay();
    const padded: (Day | null)[] = [
      ...Array<Day | null>(firstDow).fill(null),
      ...days,
    ];
    while (padded.length % 7) padded.push(null);
    const cols: (Day | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      cols.push(padded.slice(i, i + 7));
    }
    return {
      columns: cols,
      max: days.reduce((m, d) => Math.max(m, d.count), 1),
    };
  }, [days]);

  const cellSize = compact ? "w-2.5 h-2.5" : "w-3 h-3";

  const onEnter = (e: React.MouseEvent<HTMLDivElement>, day: Day) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const cellRect = e.currentTarget.getBoundingClientRect();
    setHover({
      day,
      x: cellRect.left + cellRect.width / 2 - rect.left,
      y: cellRect.top - rect.top,
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((day, di) => (
                <div
                  key={di}
                  onMouseEnter={(e) => day && onEnter(e, day)}
                  onMouseLeave={() => setHover(null)}
                  className={`${cellSize} rounded-[2px] ${
                    day ? intensityClass(day.count, max) : "bg-transparent"
                  } transition-transform duration-200 hover:scale-[1.6] hover:z-10 hover:ring-1 hover:ring-primary/50 cursor-pointer`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {hover ? (
        <div
          className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-full mb-2"
          style={{ left: hover.x, top: hover.y - 8 }}
        >
          <div className="bg-surface-container-high border border-white/10 rounded px-3 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.5)] whitespace-nowrap">
            <div className="font-mono text-code-sm text-primary">
              {hover.day.count} contribution
              {hover.day.count === 1 ? "" : "s"}
            </div>
            <div className="font-mono text-code-sm text-on-surface-variant">
              {formatDate(hover.day.date)}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
