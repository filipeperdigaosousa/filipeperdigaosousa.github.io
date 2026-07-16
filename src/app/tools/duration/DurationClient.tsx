"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

const UNIT_MS: Record<string, number> = {
  y: 365 * 24 * 60 * 60 * 1000,
  w: 7 * 24 * 60 * 60 * 1000,
  d: 24 * 60 * 60 * 1000,
  h: 60 * 60 * 1000,
  m: 60 * 1000,
  s: 1000,
  ms: 1,
};

interface Parsed {
  ok: boolean;
  totalMs: number;
  breakdown: { unit: string; value: number }[];
  error?: string;
}

function parseHuman(input: string): Parsed {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return { ok: true, totalMs: 0, breakdown: [] };
  const digitsOnly = /^-?\d+(\.\d+)?$/.test(trimmed);
  if (digitsOnly) {
    const ms = Number(trimmed);
    return { ok: true, totalMs: ms, breakdown: breakdownFromMs(ms) };
  }
  const iso = trimmed.match(
    /^p(?:(\d+)y)?(?:(\d+)w)?(?:(\d+)d)?(?:t(?:(\d+)h)?(?:(\d+)m)?(?:(\d+(?:\.\d+)?)s)?)?$/,
  );
  if (iso) {
    const [, y, w, d, h, mi, se] = iso;
    const ms =
      (Number(y) || 0) * UNIT_MS.y +
      (Number(w) || 0) * UNIT_MS.w +
      (Number(d) || 0) * UNIT_MS.d +
      (Number(h) || 0) * UNIT_MS.h +
      (Number(mi) || 0) * UNIT_MS.m +
      (Number(se) || 0) * UNIT_MS.s;
    return { ok: true, totalMs: ms, breakdown: breakdownFromMs(ms) };
  }
  const parts = trimmed.match(/(\d+(?:\.\d+)?)(ms|s|m|h|d|w|y)/g);
  if (!parts) {
    return {
      ok: false,
      totalMs: 0,
      breakdown: [],
      error: "Unrecognised format. Try 1h30m, 90s, PT1H, or 5000 (ms).",
    };
  }
  let total = 0;
  for (const p of parts) {
    const match = p.match(/^(\d+(?:\.\d+)?)(ms|s|m|h|d|w|y)$/);
    if (!match) continue;
    const value = Number(match[1]);
    const unit = match[2];
    total += value * (UNIT_MS[unit] ?? 0);
  }
  return { ok: true, totalMs: total, breakdown: breakdownFromMs(total) };
}

function breakdownFromMs(ms: number): { unit: string; value: number }[] {
  const abs = Math.abs(ms);
  const sign = ms < 0 ? -1 : 1;
  const order: [string, number][] = [
    ["y", UNIT_MS.y],
    ["w", UNIT_MS.w],
    ["d", UNIT_MS.d],
    ["h", UNIT_MS.h],
    ["m", UNIT_MS.m],
    ["s", UNIT_MS.s],
    ["ms", UNIT_MS.ms],
  ];
  const out: { unit: string; value: number }[] = [];
  let rem = abs;
  for (const [unit, size] of order) {
    if (rem >= size) {
      const v = Math.floor(rem / size);
      out.push({ unit, value: v * sign });
      rem -= v * size;
    }
  }
  return out;
}

function toIso8601(ms: number): string {
  if (ms === 0) return "PT0S";
  const b = breakdownFromMs(Math.abs(ms));
  const bag: Record<string, number> = {};
  for (const { unit, value } of b) bag[unit] = value;
  let date = "";
  if (bag.y) date += `${bag.y}Y`;
  if (bag.w) date += `${bag.w}W`;
  if (bag.d) date += `${bag.d}D`;
  let time = "";
  if (bag.h) time += `${bag.h}H`;
  if (bag.m) time += `${bag.m}M`;
  if (bag.s || bag.ms) {
    const s = (bag.s ?? 0) + (bag.ms ?? 0) / 1000;
    time += `${s}S`;
  }
  const sign = ms < 0 ? "-" : "";
  return `${sign}P${date}${time ? `T${time}` : ""}`;
}

function toHuman(ms: number): string {
  if (ms === 0) return "0s";
  const b = breakdownFromMs(ms).filter((p) => p.value !== 0);
  return b.map(({ unit, value }) => `${value}${unit}`).join(" ");
}

export default function DurationClient() {
  const [input, setInput] = useState("1h30m");
  const parsed = useMemo(() => parseHuman(input), [input]);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-4">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
          / Input
        </p>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          placeholder="1h30m · 90s · PT1H30M · 5400000"
          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-headline-md text-primary focus:outline-none focus:border-primary/50"
        />
      </div>

      {!parsed.ok ? (
        <div className="glass-card rounded-xl p-5 border border-tertiary/40">
          <p className="font-mono text-code-sm text-tertiary">{parsed.error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
            <OutRow label="Milliseconds" value={parsed.totalMs.toString()} />
            <OutRow label="Seconds" value={(parsed.totalMs / 1000).toString()} />
            <OutRow
              label="Minutes"
              value={(parsed.totalMs / UNIT_MS.m).toString()}
            />
            <OutRow
              label="Hours"
              value={(parsed.totalMs / UNIT_MS.h).toString()}
            />
            <OutRow label="ISO 8601" value={toIso8601(parsed.totalMs)} />
            <OutRow label="Human" value={toHuman(parsed.totalMs)} />
          </div>

          <div className="glass-card rounded-xl p-5">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
              / Breakdown
            </p>
            {parsed.breakdown.length === 0 ? (
              <p className="font-mono text-code-sm text-tertiary">Zero.</p>
            ) : (
              <ul className="grid grid-cols-2 md:grid-cols-4 gap-2 font-mono text-code-sm">
                {parsed.breakdown.map((b) => (
                  <li
                    key={b.unit}
                    className="p-3 rounded-lg bg-white/5 border border-white/5"
                  >
                    <span className="text-primary text-headline-md">
                      {b.value}
                    </span>{" "}
                    <span className="text-tertiary">{b.unit}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function OutRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center justify-between mb-1">
        <p className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant">
          {label}
        </p>
        <CopyButton value={value} />
      </div>
      <p className="font-mono text-code-sm text-primary break-all">{value}</p>
    </div>
  );
}
