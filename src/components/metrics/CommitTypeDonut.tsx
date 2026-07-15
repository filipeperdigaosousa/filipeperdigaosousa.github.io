"use client";

import { useMemo, useState } from "react";

interface CommitTypeDonutProps {
  data: Record<string, number>;
}

const TYPE_ORDER = [
  "feat",
  "refactor",
  "fix",
  "test",
  "chore",
  "perf",
  "docs",
  "ci",
  "build",
  "style",
  "other",
];

const COLORS: Record<string, string> = {
  feat: "#42e355",
  refactor: "#adc6ff",
  fix: "#d29922",
  test: "#a371f7",
  chore: "#8b90a0",
  perf: "#39c5cf",
  docs: "#79c0ff",
  ci: "#db6d28",
  build: "#7ee787",
  style: "#ffa657",
  other: "#414755",
};

export default function CommitTypeDonut({ data }: CommitTypeDonutProps) {
  const [hover, setHover] = useState<string | null>(null);

  const entries = useMemo(() => {
    const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
    return TYPE_ORDER.filter((t) => (data[t] ?? 0) > 0)
      .map((t) => ({
        name: t,
        count: data[t],
        percent: (data[t] / total) * 100,
      }))
      .filter((e) => e.percent >= 1);
  }, [data]);

  const size = 200;
  const radius = 80;
  const stroke = 28;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let offset = 0;

  const highlighted = hover ?? entries[0]?.name;
  const highlightedItem =
    entries.find((e) => e.name === highlighted) ?? entries[0];

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={cx}
            cy={cy}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />
          {entries.map((e) => {
            const len = (e.percent / 100) * circumference;
            const dash = `${len} ${circumference - len}`;
            const seg = (
              <circle
                key={e.name}
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={COLORS[e.name] ?? "#414755"}
                strokeWidth={
                  hover === e.name ? stroke + 6 : stroke
                }
                strokeDasharray={dash}
                strokeDashoffset={-offset}
                style={{ transition: "stroke-width 0.15s" }}
                onMouseEnter={() => setHover(e.name)}
                onMouseLeave={() => setHover(null)}
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        {highlightedItem ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div
              className="font-mono text-headline-md"
              style={{ color: COLORS[highlightedItem.name] }}
            >
              {Math.round(highlightedItem.percent)}%
            </div>
            <div className="font-mono text-label-caps uppercase text-tertiary tracking-widest">
              {highlightedItem.name}
            </div>
            <div className="font-mono text-code-sm text-on-surface-variant">
              {highlightedItem.count} commits
            </div>
          </div>
        ) : null}
      </div>
      <ul className="flex-1 space-y-2 min-w-0">
        {entries.map((e) => (
          <li
            key={e.name}
            className="flex items-center gap-3 font-mono text-code-sm cursor-pointer"
            onMouseEnter={() => setHover(e.name)}
            onMouseLeave={() => setHover(null)}
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{ backgroundColor: COLORS[e.name] }}
            />
            <span className="text-on-surface min-w-16">{e.name}</span>
            <span className="text-tertiary">·</span>
            <span className="text-on-surface-variant">{e.count}</span>
            <span className="text-tertiary">·</span>
            <span className="text-on-surface-variant">
              {Math.round(e.percent)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
