"use client";

import { useState } from "react";

interface YearPoint {
  year: number;
  total: number;
}

interface YearlyActivityProps {
  years: YearPoint[];
}

export default function YearlyActivity({ years }: YearlyActivityProps) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(1, ...years.map((y) => y.total));

  return (
    <div className="relative">
      <div className="h-44 flex items-end gap-2 pt-6">
        {years.map((y, i) => {
          const h = Math.max(3, (y.total / max) * 100);
          const active = hover === i;
          return (
            <div
              key={y.year}
              className="flex-1 flex flex-col items-center h-full justify-end relative"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className={`w-full rounded-t transition-all cursor-pointer ${
                  active
                    ? "bg-primary progress-glow"
                    : "bg-secondary/70 hover:bg-secondary"
                }`}
                style={{ height: `${h}%` }}
              />
            </div>
          );
        })}
      </div>
      <div
        className="grid gap-2 mt-2"
        style={{ gridTemplateColumns: `repeat(${years.length},minmax(0,1fr))` }}
      >
        {years.map((y) => (
          <div
            key={y.year}
            className="font-mono text-[10px] text-tertiary text-center uppercase tracking-widest"
          >
            {String(y.year).slice(2)}
          </div>
        ))}
      </div>
      {hover !== null ? (
        <p className="mt-3 font-mono text-code-sm text-on-surface-variant text-center">
          <span className="text-on-surface">{years[hover].year}</span>
          <span className="text-tertiary mx-2">·</span>
          <span className="text-secondary">
            {years[hover].total.toLocaleString()} contributions
          </span>
        </p>
      ) : (
        <p className="mt-3 font-mono text-code-sm text-tertiary text-center">
          Hover a bar for the exact number
        </p>
      )}
    </div>
  );
}
