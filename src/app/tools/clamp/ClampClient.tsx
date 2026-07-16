"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

function round(n: number, dp: number): number {
  const p = 10 ** dp;
  return Math.round(n * p) / p;
}

export default function ClampClient() {
  const [minSize, setMinSize] = useState(16);
  const [maxSize, setMaxSize] = useState(24);
  const [minVw, setMinVw] = useState(320);
  const [maxVw, setMaxVw] = useState(1440);
  const [rootPx, setRootPx] = useState(16);

  const clampExpr = useMemo(() => {
    if (maxVw <= minVw)
      return { css: "clamp(?, ?, ?)", ok: false, error: "max viewport must exceed min viewport" };
    const slope = (maxSize - minSize) / (maxVw - minVw);
    const intercept = minSize - slope * minVw;
    const slopeVw = round(slope * 100, 4);
    const interceptRem = round(intercept / rootPx, 4);
    const minRem = round(minSize / rootPx, 4);
    const maxRem = round(maxSize / rootPx, 4);
    const preferred = `${interceptRem}rem + ${slopeVw}vw`;
    return {
      css: `clamp(${minRem}rem, ${preferred}, ${maxRem}rem)`,
      ok: true,
      slope,
      intercept,
    };
  }, [minSize, maxSize, minVw, maxVw, rootPx]);

  const [previewVw, setPreviewVw] = useState(768);
  const previewSize = useMemo(() => {
    if (!clampExpr.ok) return 0;
    if (previewVw <= minVw) return minSize;
    if (previewVw >= maxVw) return maxSize;
    return (clampExpr.slope ?? 0) * previewVw + (clampExpr.intercept ?? 0);
  }, [previewVw, clampExpr, minVw, maxVw, minSize, maxSize]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <NumField label="Min size (px)" value={minSize} onChange={setMinSize} min={1} />
        <NumField label="Max size (px)" value={maxSize} onChange={setMaxSize} min={1} />
        <NumField label="Min viewport (px)" value={minVw} onChange={setMinVw} min={0} />
        <NumField label="Max viewport (px)" value={maxVw} onChange={setMaxVw} min={0} />
      </div>

      <div className="glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <label className="font-mono text-code-sm text-tertiary inline-flex items-center gap-2">
          root font-size
          <input
            type="number"
            min={8}
            max={32}
            value={rootPx}
            onChange={(e) => setRootPx(Math.max(1, Number(e.target.value) || 16))}
            className="w-16 bg-black/30 border border-white/10 rounded p-1 text-center text-on-surface"
          />
          px
        </label>
      </div>

      <div
        className={`glass-card rounded-xl p-5 border ${
          clampExpr.ok ? "border-primary/40 bg-primary/5" : "border-tertiary/40"
        }`}
      >
        <div className="flex justify-between items-center mb-2">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / CSS
          </p>
          <CopyButton value={clampExpr.ok ? clampExpr.css : ""} />
        </div>
        <pre className="font-mono text-headline-md text-primary whitespace-pre-wrap break-words">
          font-size: {clampExpr.css};
        </pre>
        {!clampExpr.ok ? (
          <p className="font-mono text-code-sm text-tertiary mt-2">{clampExpr.error}</p>
        ) : null}
      </div>

      <div className="glass-card rounded-xl p-5">
        <div className="flex justify-between items-center mb-3">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Preview at viewport
          </p>
          <p className="font-mono text-code-sm text-primary">
            {previewVw}px → {previewSize.toFixed(2)}px
          </p>
        </div>
        <input
          type="range"
          min={minVw}
          max={maxVw}
          value={previewVw}
          onChange={(e) => setPreviewVw(Number(e.target.value))}
          className="w-full accent-primary mb-4"
        />
        <p
          className="text-primary leading-tight"
          style={{ fontSize: `${previewSize}px` }}
        >
          The quick brown fox jumps over the lazy dog.
        </p>
      </div>
    </div>
  );
}

function NumField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
        / {label}
      </p>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || min)}
        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-headline-md text-primary focus:outline-none focus:border-primary/50"
      />
    </div>
  );
}

