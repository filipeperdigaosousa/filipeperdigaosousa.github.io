"use client";

import { useMemo, useState } from "react";

interface RGB {
  r: number;
  g: number;
  b: number;
}

function parseHex(input: string): RGB | null {
  const s = input.trim().replace(/^#/, "");
  if (![3, 4, 6, 8].includes(s.length)) return null;
  if (!/^[0-9a-fA-F]+$/.test(s)) return null;
  const expand = (h: string) =>
    h.length <= 4 ? h.split("").map((c) => c + c).join("") : h;
  const full = expand(s).slice(0, 6);
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

function toHex({ r, g, b }: RGB): string {
  const h = (n: number) => n.toString(16).padStart(2, "0");
  return `#${h(r)}${h(g)}${h(b)}`;
}

function channel(c: number): number {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
}

function luminance({ r, g, b }: RGB): number {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function ratio(a: RGB, b: RGB): number {
  const la = luminance(a);
  const lb = luminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

interface Verdict {
  level: string;
  passes: boolean;
  threshold: number;
}

function verdicts(r: number): Verdict[] {
  return [
    { level: "AA · normal text", threshold: 4.5, passes: r >= 4.5 },
    { level: "AA · large text (18pt+ / 14pt bold)", threshold: 3, passes: r >= 3 },
    { level: "AAA · normal text", threshold: 7, passes: r >= 7 },
    { level: "AAA · large text", threshold: 4.5, passes: r >= 4.5 },
    { level: "UI components / graphical", threshold: 3, passes: r >= 3 },
  ];
}

interface Pair {
  fg: string;
  bg: string;
  label: string;
}

const PAIRS: Pair[] = [
  { fg: "#adc6ff", bg: "#0a0e1a", label: "Site primary on background" },
  { fg: "#42e355", bg: "#0a0e1a", label: "Site secondary on background" },
  { fg: "#ffffff", bg: "#0a0e1a", label: "White on background" },
  { fg: "#000000", bg: "#ffffff", label: "Ink on paper" },
];

export default function ContrastClient() {
  const [fg, setFg] = useState("#adc6ff");
  const [bg, setBg] = useState("#0a0e1a");

  const fgRgb = parseHex(fg);
  const bgRgb = parseHex(bg);
  const contrast = fgRgb && bgRgb ? ratio(fgRgb, bgRgb) : null;
  const list = useMemo(() => (contrast ? verdicts(contrast) : []), [contrast]);

  function swap() {
    setFg(bg);
    setBg(fg);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <ColorPicker label="Foreground" value={fg} onChange={setFg} />
        <ColorPicker label="Background" value={bg} onChange={setBg} />
      </div>

      <div className="flex justify-center">
        <button
          type="button"
          onClick={swap}
          className="font-mono text-code-sm text-tertiary hover:text-primary inline-flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-base">swap_vert</span>
          swap
        </button>
      </div>

      {fgRgb && bgRgb && contrast ? (
        <>
          <ResultHeadline ratio={contrast} />
          <LivePreview fg={fg} bg={bg} />
          <VerdictsList list={list} />
        </>
      ) : (
        <p className="font-mono text-code-sm text-tertiary text-center">
          Enter valid hex colours.
        </p>
      )}

      <div className="glass-card rounded-xl p-5">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
          / Try these pairs
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {PAIRS.map((p) => {
            const r = parseHex(p.fg);
            const bb = parseHex(p.bg);
            const c = r && bb ? ratio(r, bb) : null;
            return (
              <button
                key={p.label}
                type="button"
                onClick={() => {
                  setFg(p.fg);
                  setBg(p.bg);
                }}
                className="flex items-center gap-3 p-3 rounded-lg border border-white/10 bg-white/5 hover:border-primary/40 text-left"
              >
                <span
                  className="w-12 h-12 rounded-md border border-white/10 flex items-center justify-center font-mono text-code-sm shrink-0"
                  style={{ background: p.bg, color: p.fg }}
                >
                  Aa
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-mono text-code-sm text-on-surface truncate">
                    {p.label}
                  </span>
                  <span className="block font-mono text-[11px] text-tertiary mt-0.5">
                    {p.fg} on {p.bg}
                    {c ? ` — ${c.toFixed(2)}:1` : ""}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ColorPicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const valid = parseHex(value);
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
        / {label}
      </p>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={valid ? toHex(valid) : "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-14 h-14 rounded-lg cursor-pointer bg-transparent border border-white/10"
          aria-label={`${label} colour picker`}
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className={`flex-1 bg-black/30 border rounded-lg p-2 font-mono text-code-sm focus:outline-none ${
            valid
              ? "border-white/10 text-on-surface focus:border-primary/50"
              : "border-tertiary/40 text-tertiary"
          }`}
        />
      </div>
    </div>
  );
}

function ResultHeadline({ ratio }: { ratio: number }) {
  const tone =
    ratio >= 7
      ? { text: "text-secondary", border: "border-secondary/40", bg: "bg-secondary/5" }
      : ratio >= 4.5
        ? { text: "text-primary", border: "border-primary/40", bg: "bg-primary/5" }
        : ratio >= 3
          ? {
              text: "text-[#f5c26b]",
              border: "border-[#f5c26b]/40",
              bg: "bg-[#f5c26b]/10",
            }
          : {
              text: "text-[#ff6b6b]",
              border: "border-[#ff6b6b]/50",
              bg: "bg-[#ff6b6b]/10",
            };
  const label =
    ratio >= 7
      ? "Excellent"
      : ratio >= 4.5
        ? "Passes AA"
        : ratio >= 3
          ? "Large text only"
          : "Fails";
  return (
    <div className={`glass-card rounded-xl p-6 border ${tone.border} ${tone.bg}`}>
      <div className="flex items-baseline gap-4 flex-wrap">
        <p className={`font-mono text-[56px] leading-none ${tone.text}`}>
          {ratio.toFixed(2)}:1
        </p>
        <p className={`font-mono text-headline-md ${tone.text}`}>{label}</p>
      </div>
    </div>
  );
}

function LivePreview({ fg, bg }: { fg: string; bg: string }) {
  return (
    <div
      className="rounded-xl p-6 border border-white/10"
      style={{ background: bg, color: fg }}
    >
      <p className="font-mono text-code-sm opacity-80 mb-1">Preview</p>
      <p className="text-headline-md mb-2">The quick brown fox</p>
      <p className="text-body-md leading-relaxed">
        Small body text, jumping over the lazy dog — the sort of sentence a
        reader would encounter mid-page. If this feels harsh to read, the ratio
        is not passing for you.
      </p>
      <p className="mt-3 font-mono text-code-sm">
        code · variable_name · 42
      </p>
    </div>
  );
}

function VerdictsList({ list }: { list: Verdict[] }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
        / WCAG verdicts
      </p>
      <ul className="space-y-1.5 font-mono text-code-sm">
        {list.map((v) => {
          const rowBg = v.passes
            ? "bg-secondary/5 border-secondary/20"
            : "bg-[#ff6b6b]/10 border-[#ff6b6b]/30";
          const statusColor = v.passes ? "text-secondary" : "text-[#ff6b6b]";
          return (
            <li
              key={v.level}
              className={`flex items-center justify-between gap-3 px-3 py-2 rounded-lg border ${rowBg}`}
            >
              <span className="text-on-surface">{v.level}</span>
              <span className={`inline-flex items-center gap-1 ${statusColor}`}>
                <span className="material-symbols-outlined text-base">
                  {v.passes ? "check_circle" : "cancel"}
                </span>
                {v.passes ? "pass" : "fail"} (≥ {v.threshold})
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
