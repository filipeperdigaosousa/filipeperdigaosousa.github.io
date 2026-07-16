"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

interface Layer {
  id: string;
  x: number;
  y: number;
  blur: number;
  spread: number;
  color: string;
  alpha: number;
  inset: boolean;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function newLayer(): Layer {
  return {
    id: uid(),
    x: 0,
    y: 8,
    blur: 24,
    spread: -4,
    color: "#000000",
    alpha: 0.35,
    inset: false,
  };
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace(/^#/, "");
  const n = parseInt(
    clean.length === 3
      ? clean.split("").map((c) => c + c).join("")
      : clean,
    16,
  );
  return { r: (n >> 16) & 0xff, g: (n >> 8) & 0xff, b: n & 0xff };
}

function toCss(l: Layer): string {
  const { r, g, b } = hexToRgb(l.color);
  const rgba = `rgba(${r}, ${g}, ${b}, ${l.alpha})`;
  return `${l.inset ? "inset " : ""}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${rgba}`;
}

export default function ShadowClient() {
  const [layers, setLayers] = useState<Layer[]>([newLayer()]);
  const [bgColor, setBgColor] = useState("#1c2028");

  const cssValue = useMemo(() => layers.map(toCss).join(",\n  "), [layers]);

  function update(id: string, patch: Partial<Layer>) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function addLayer() {
    setLayers((prev) => [...prev, newLayer()]);
  }

  function removeLayer(id: string) {
    setLayers((prev) => (prev.length > 1 ? prev.filter((l) => l.id !== id) : prev));
  }

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-16 flex items-center justify-center"
        style={{ background: bgColor }}
      >
        <div
          className="w-40 h-40 rounded-xl bg-primary flex items-center justify-center font-mono text-code-sm text-on-primary"
          style={{ boxShadow: cssValue }}
        >
          preview
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
          / Backdrop
        </p>
        <input
          type="color"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
        />
        <input
          type="text"
          value={bgColor}
          onChange={(e) => setBgColor(e.target.value)}
          className="w-32 bg-black/30 border border-white/10 rounded p-1 font-mono text-code-sm text-on-surface"
        />
      </div>

      {layers.map((l, i) => (
        <div key={l.id} className="glass-card rounded-xl p-5 space-y-3">
          <div className="flex justify-between items-center">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              / Layer {i + 1}
            </p>
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 font-mono text-code-sm text-tertiary cursor-pointer">
                <input
                  type="checkbox"
                  checked={l.inset}
                  onChange={(e) => update(l.id, { inset: e.target.checked })}
                  className="accent-primary"
                />
                inset
              </label>
              {layers.length > 1 ? (
                <button
                  type="button"
                  onClick={() => removeLayer(l.id)}
                  className="text-tertiary hover:text-primary"
                  aria-label="Remove layer"
                >
                  <span className="material-symbols-outlined text-lg">
                    delete
                  </span>
                </button>
              ) : null}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <SliderRow
              label="Offset X"
              value={l.x}
              min={-64}
              max={64}
              onChange={(v) => update(l.id, { x: v })}
              suffix="px"
            />
            <SliderRow
              label="Offset Y"
              value={l.y}
              min={-64}
              max={64}
              onChange={(v) => update(l.id, { y: v })}
              suffix="px"
            />
            <SliderRow
              label="Blur"
              value={l.blur}
              min={0}
              max={100}
              onChange={(v) => update(l.id, { blur: v })}
              suffix="px"
            />
            <SliderRow
              label="Spread"
              value={l.spread}
              min={-40}
              max={40}
              onChange={(v) => update(l.id, { spread: v })}
              suffix="px"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr_140px] gap-3 items-center">
            <input
              type="color"
              value={l.color}
              onChange={(e) => update(l.id, { color: e.target.value })}
              className="w-12 h-10 rounded-lg cursor-pointer bg-transparent border border-white/10"
              aria-label="Shadow colour"
            />
            <input
              type="text"
              value={l.color}
              onChange={(e) => update(l.id, { color: e.target.value })}
              className="bg-black/30 border border-white/10 rounded p-2 font-mono text-code-sm text-on-surface"
            />
            <SliderRow
              label="Alpha"
              value={l.alpha}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => update(l.id, { alpha: v })}
              suffix=""
              display={l.alpha.toFixed(2)}
            />
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addLayer}
        className="font-mono text-code-sm text-primary hover:underline"
      >
        + add layer
      </button>

      <div className="glass-card rounded-xl p-5">
        <div className="flex justify-between items-center mb-2">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / CSS
          </p>
          <CopyButton value={`box-shadow: ${cssValue};`} />
        </div>
        <pre className="font-mono text-code-sm text-primary bg-black/30 rounded-lg p-3 whitespace-pre-wrap break-words overflow-x-auto">
          {`box-shadow:\n  ${cssValue};`}
        </pre>
      </div>
    </div>
  );
}

function SliderRow({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
  display,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix: string;
  display?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="font-mono text-code-sm text-on-surface-variant">
          {label}
        </span>
        <span className="font-mono text-code-sm text-primary">
          {display ?? value}
          {suffix}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
