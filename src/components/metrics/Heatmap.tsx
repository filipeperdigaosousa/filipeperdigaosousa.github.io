"use client";

import { useMemo, useState } from "react";

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

export default function Heatmap({ days, compact = false }: HeatmapProps) {
  const [hover, setHover] = useState<Day | null>(null);

  const { columns, max } = useMemo(() => {
    if (!days.length) return { columns: [] as Day[][], max: 1 };
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
      columns: cols as Day[][],
      max: days.reduce((m, d) => Math.max(m, d.count), 1),
    };
  }, [days]);

  const cellSize = compact ? "w-2.5 h-2.5" : "w-3 h-3";

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((day, di) => (
                <div
                  key={di}
                  onMouseEnter={() => day && setHover(day)}
                  onMouseLeave={() => setHover(null)}
                  className={`${cellSize} rounded-[2px] ${
                    day ? intensityClass(day.count, max) : "bg-transparent"
                  } transition-all duration-500 hover:scale-125 cursor-pointer`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      {hover && !compact ? (
        <p className="mt-3 font-mono text-code-sm text-on-surface-variant">
          {hover.date} — {hover.count} contribution{hover.count === 1 ? "" : "s"}
        </p>
      ) : null}
    </div>
  );
}
