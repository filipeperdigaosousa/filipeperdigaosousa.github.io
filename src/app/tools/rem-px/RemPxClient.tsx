"use client";

import { useState } from "react";

const COMMON_PX = [12, 14, 16, 18, 20, 24, 32, 40, 48, 64];

function fmt(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(4).replace(/0+$/, "").replace(/\.$/, "");
}

export default function RemPxClient() {
  const [rootPx, setRootPx] = useState(16);
  const [px, setPx] = useState<number>(16);
  const [rem, setRem] = useState<number>(1);

  function setFromPx(value: number) {
    setPx(value);
    setRem(value / rootPx);
  }

  function setFromRem(value: number) {
    setRem(value);
    setPx(value * rootPx);
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap justify-between">
        <div className="flex items-center gap-3">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Root font-size
          </p>
          <input
            type="range"
            min={8}
            max={32}
            value={rootPx}
            onChange={(e) => {
              const r = Number(e.target.value);
              setRootPx(r);
              setPx(rem * r);
            }}
            className="accent-primary w-40"
          />
        </div>
        <p className="font-mono text-code-sm">
          <span className="text-primary text-headline-md">{rootPx}px</span>
          <span className="text-tertiary text-code-sm">
            {" "}(browser default is 16)
          </span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <ConvField
          label="pixels"
          unit="px"
          value={px}
          onChange={setFromPx}
        />
        <ConvField
          label="rem"
          unit="rem"
          value={rem}
          onChange={setFromRem}
          step={0.125}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <StatTile label="em (same context)" value={`${fmt(rem)}em`} />
        <StatTile label="% of root" value={`${fmt(rem * 100)}%`} />
        <StatTile label="pt (~)" value={`${fmt(px * 0.75)}pt`} />
      </div>

      <div className="glass-card rounded-xl p-5">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
          / Common sizes
        </p>
        <div className="flex flex-wrap gap-2">
          {COMMON_PX.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setFromPx(p)}
              className={`px-3 py-2 rounded-lg border font-mono text-code-sm ${
                px === p
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-on-surface-variant hover:text-primary hover:border-primary/40"
              }`}
            >
              <span className="block text-primary">{p}px</span>
              <span className="block text-[10px] text-tertiary">
                {fmt(p / rootPx)}rem
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ConvField({
  label,
  unit,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  unit: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
        / {label}
      </p>
      <div className="flex items-baseline gap-2">
        <input
          type="number"
          step={step}
          value={fmt(value)}
          onChange={(e) => onChange(Number(e.target.value) || 0)}
          className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-headline-md text-primary focus:outline-none focus:border-primary/50"
        />
        <span className="font-mono text-headline-md text-tertiary">{unit}</span>
      </div>
    </div>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="font-mono text-headline-md text-primary">{value}</p>
    </div>
  );
}
