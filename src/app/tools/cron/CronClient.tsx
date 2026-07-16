"use client";

import cronstrue from "cronstrue";
import { useMemo, useState } from "react";

interface Preset {
  label: string;
  expr: string;
}

const PRESETS: Preset[] = [
  { label: "Every minute", expr: "* * * * *" },
  { label: "Every 5 minutes", expr: "*/5 * * * *" },
  { label: "Every 15 minutes", expr: "*/15 * * * *" },
  { label: "Every hour", expr: "0 * * * *" },
  { label: "Every day 03:00", expr: "0 3 * * *" },
  { label: "Every Mon 09:00", expr: "0 9 * * 1" },
  { label: "First of month 00:00", expr: "0 0 1 * *" },
  { label: "Weekdays 08:30", expr: "30 8 * * 1-5" },
];

const FIELDS = ["minute", "hour", "day of month", "month", "day of week"] as const;

function safeExplain(expr: string, verbose: boolean): { text: string; ok: boolean } {
  try {
    const trimmed = expr.trim();
    if (!trimmed) return { text: "", ok: true };
    const text = cronstrue.toString(trimmed, {
      throwExceptionOnParseError: true,
      verbose,
      use24HourTimeFormat: true,
    });
    return { text, ok: true };
  } catch (err) {
    return {
      text: err instanceof Error ? err.message : "Invalid expression",
      ok: false,
    };
  }
}

export default function CronClient() {
  const [expr, setExpr] = useState("0 3 * * *");
  const [verbose, setVerbose] = useState(true);

  const explanation = useMemo(() => safeExplain(expr, verbose), [expr, verbose]);
  const parts = expr.trim().split(/\s+/);
  const isFive = parts.length === 5;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <label
            htmlFor="cron-input"
            className="font-mono text-label-caps text-secondary uppercase tracking-widest"
          >
            / Cron expression
          </label>
          <label className="font-mono text-code-sm text-tertiary inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={verbose}
              onChange={(e) => setVerbose(e.target.checked)}
              className="accent-primary"
            />
            verbose
          </label>
        </div>
        <input
          id="cron-input"
          value={expr}
          onChange={(e) => setExpr(e.target.value)}
          spellCheck={false}
          placeholder="* * * * *"
          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-headline-md text-primary focus:outline-none focus:border-primary/50"
        />
        <div className="mt-3 grid grid-cols-5 gap-2 font-mono text-[10px] uppercase tracking-widest text-tertiary">
          {FIELDS.map((f, i) => (
            <div key={f}>
              <span className="block text-on-surface-variant">{f}</span>
              <span className="block text-primary mt-0.5">
                {isFive ? parts[i] : "—"}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div
        className={`glass-card rounded-xl p-5 ${
          explanation.ok ? "" : "border-tertiary/40"
        }`}
      >
        <p className="font-mono text-label-caps uppercase tracking-widest mb-2 text-secondary">
          / {explanation.ok ? "In plain English" : "Parse error"}
        </p>
        <p
          className={`text-body-lg leading-relaxed ${
            explanation.ok ? "text-on-surface" : "text-tertiary"
          }`}
        >
          {explanation.text || "…"}
        </p>
      </div>

      <div>
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
          / Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.expr}
              type="button"
              onClick={() => setExpr(p.expr)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-code-sm transition-colors ${
                expr === p.expr
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-on-surface-variant hover:text-primary hover:border-primary/40"
              }`}
            >
              <span className="block text-[10px] uppercase tracking-widest opacity-70">
                {p.label}
              </span>
              <span className="block">{p.expr}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
          / Cheatsheet
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 font-mono text-code-sm text-on-surface-variant">
          <li>
            <span className="text-primary">*</span> — any value
          </li>
          <li>
            <span className="text-primary">,</span> — value list (1,3,5)
          </li>
          <li>
            <span className="text-primary">-</span> — range (1-5)
          </li>
          <li>
            <span className="text-primary">/</span> — step (*/15)
          </li>
          <li>
            5 fields: min hour dom month dow
          </li>
          <li>
            dow: 0 or 7 = Sunday
          </li>
        </ul>
      </div>
    </div>
  );
}
