"use client";

import { useState } from "react";

interface Percent {
  commits: number;
  pullRequests: number;
  codeReviews: number;
  issues: number;
}

interface ContributionDiamondProps {
  percent: Percent;
  raw?: {
    commits: number;
    pullRequests: number;
    codeReviews: number;
    issues: number;
  };
}

const SIZE = 260;
const CENTER = SIZE / 2;
const RADIUS = 90;

function axisPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return {
    x: CENTER + Math.cos(rad) * radius,
    y: CENTER + Math.sin(rad) * radius,
  };
}

const AXES = [
  { key: "codeReviews", label: "Code review", angle: 0 },
  { key: "issues", label: "Issues", angle: 90 },
  { key: "pullRequests", label: "Pull requests", angle: 180 },
  { key: "commits", label: "Commits", angle: 270 },
] as const;

const COLOR = "#42e355";

export default function ContributionDiamond({
  percent,
  raw,
}: ContributionDiamondProps) {
  const [hover, setHover] = useState<keyof Percent | null>(null);
  const maxPct = Math.max(1, ...Object.values(percent));

  const polygonPoints = AXES.map((a) => {
    const pct = percent[a.key];
    const scale = pct / Math.max(maxPct, 1);
    const p = axisPoint(a.angle, RADIUS * scale);
    return `${p.x},${p.y}`;
  }).join(" ");

  return (
    <div className="flex flex-col md:flex-row items-center gap-6">
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        className="shrink-0"
      >
        {AXES.map((a) => {
          const end = axisPoint(a.angle, RADIUS);
          return (
            <line
              key={a.key}
              x1={CENTER}
              y1={CENTER}
              x2={end.x}
              y2={end.y}
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={1}
            />
          );
        })}
        <polygon
          points={polygonPoints}
          fill={`${COLOR}`}
          fillOpacity={0.28}
          stroke={COLOR}
          strokeWidth={1.5}
        />
        {AXES.map((a) => {
          const pct = percent[a.key];
          const scale = pct / Math.max(maxPct, 1);
          const p = axisPoint(a.angle, RADIUS * scale);
          const isHover = hover === a.key;
          return (
            <circle
              key={a.key}
              cx={p.x}
              cy={p.y}
              r={isHover ? 6 : 4}
              fill={COLOR}
              stroke="#0f1116"
              strokeWidth={2}
              onMouseEnter={() => setHover(a.key)}
              onMouseLeave={() => setHover(null)}
              style={{ cursor: "pointer", transition: "r 0.15s" }}
            />
          );
        })}
        {AXES.map((a) => {
          const labelPos = axisPoint(a.angle, RADIUS + 26);
          const pct = percent[a.key];
          return (
            <g key={a.key}>
              <text
                x={labelPos.x}
                y={labelPos.y - 6}
                textAnchor="middle"
                className="font-mono"
                fontSize="12"
                fill="#c1c6d7"
              >
                {pct}%
              </text>
              <text
                x={labelPos.x}
                y={labelPos.y + 8}
                textAnchor="middle"
                className="font-mono"
                fontSize="10"
                fill="#8b90a0"
              >
                {a.label}
              </text>
            </g>
          );
        })}
      </svg>

      <ul className="flex-1 space-y-2 font-mono text-code-sm w-full min-w-0">
        {AXES.map((a) => (
          <li
            key={a.key}
            onMouseEnter={() => setHover(a.key)}
            onMouseLeave={() => setHover(null)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <span
              className="w-3 h-3 rounded-sm shrink-0"
              style={{
                backgroundColor: COLOR,
                opacity: hover && hover !== a.key ? 0.3 : 0.85,
              }}
            />
            <span className="text-on-surface min-w-28">{a.label}</span>
            <span className="text-tertiary">·</span>
            <span className="text-secondary">{percent[a.key]}%</span>
            {raw ? (
              <>
                <span className="text-tertiary">·</span>
                <span className="text-on-surface-variant">
                  {raw[a.key].toLocaleString()}
                </span>
              </>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
