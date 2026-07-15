"use client";

import { useState } from "react";

interface DayHourHeatmapProps {
  grid: number[][];
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function intensityClass(count: number, max: number) {
  if (count === 0) return "bg-white/5";
  const r = count / max;
  if (r > 0.75) return "bg-secondary";
  if (r > 0.5) return "bg-secondary/70";
  if (r > 0.25) return "bg-secondary/40";
  return "bg-secondary/20";
}

export default function DayHourHeatmap({ grid }: DayHourHeatmapProps) {
  const [hover, setHover] = useState<{ d: number; h: number } | null>(null);
  const max = Math.max(1, ...grid.flat());

  return (
    <div className="relative">
      <div className="overflow-x-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-[auto_repeat(24,minmax(0,1fr))] gap-1 items-center">
            <div />
            {Array.from({ length: 24 }, (_, h) => (
              <div
                key={h}
                className="font-mono text-[9px] text-tertiary text-center"
              >
                {h % 3 === 0 ? h : ""}
              </div>
            ))}
            {grid.map((row, d) => (
              <div key={d} className="contents">
                <div className="font-mono text-[10px] text-tertiary pr-2 text-right">
                  {DAYS[d]}
                </div>
                {row.map((v, h) => (
                  <div
                    key={h}
                    onMouseEnter={() => setHover({ d, h })}
                    onMouseLeave={() => setHover(null)}
                    className={`aspect-square min-w-3 min-h-3 rounded-[2px] ${intensityClass(v, max)} transition-transform hover:scale-125 hover:ring-1 hover:ring-primary/50 cursor-pointer`}
                    style={{ maxHeight: 14 }}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {hover ? (
        <div className="mt-3 font-mono text-code-sm text-on-surface-variant">
          <span className="text-on-surface">{DAYS[hover.d]}</span>{" "}
          <span className="text-tertiary">·</span>{" "}
          <span className="text-on-surface">
            {String(hover.h).padStart(2, "0")}:00 UTC
          </span>{" "}
          <span className="text-tertiary">·</span>{" "}
          <span className="text-secondary">
            {grid[hover.d][hover.h]} commit
            {grid[hover.d][hover.h] === 1 ? "" : "s"}
          </span>
        </div>
      ) : (
        <div className="mt-3 font-mono text-code-sm text-tertiary">
          UTC hour · from sampled recent PR commits
        </div>
      )}
    </div>
  );
}
