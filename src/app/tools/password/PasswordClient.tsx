"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

interface Options {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
}

const LOWER = "abcdefghijklmnopqrstuvwxyz";
const UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";
const SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/|~";
const AMBIGUOUS = "il1Lo0O";

function buildCharset(opts: Options): string {
  let s = "";
  if (opts.lower) s += LOWER;
  if (opts.upper) s += UPPER;
  if (opts.digits) s += DIGITS;
  if (opts.symbols) s += SYMBOLS;
  if (opts.excludeAmbiguous) {
    s = s
      .split("")
      .filter((c) => !AMBIGUOUS.includes(c))
      .join("");
  }
  return s;
}

function generate(opts: Options): string {
  const chars = buildCharset(opts);
  if (!chars) return "";
  const out = new Array(opts.length);
  const rand = new Uint32Array(opts.length);
  crypto.getRandomValues(rand);
  for (let i = 0; i < opts.length; i++) {
    out[i] = chars[rand[i] % chars.length];
  }
  const guaranteed: [boolean, string][] = [
    [opts.lower, LOWER],
    [opts.upper, UPPER],
    [opts.digits, DIGITS],
    [opts.symbols, SYMBOLS],
  ];
  const positions = new Set<number>();
  const posRand = new Uint32Array(guaranteed.length);
  crypto.getRandomValues(posRand);
  let idx = 0;
  for (const [on, set] of guaranteed) {
    if (!on) continue;
    let filtered = set;
    if (opts.excludeAmbiguous) {
      filtered = filtered
        .split("")
        .filter((c) => !AMBIGUOUS.includes(c))
        .join("");
    }
    if (!filtered) continue;
    let pos = posRand[idx] % opts.length;
    while (positions.has(pos)) pos = (pos + 1) % opts.length;
    positions.add(pos);
    const p = crypto.getRandomValues(new Uint32Array(1))[0] % filtered.length;
    out[pos] = filtered[p];
    idx += 1;
  }
  return out.join("");
}

interface Strength {
  label: string;
  score: number;
  entropyBits: number;
  color: string;
}

function assessStrength(pwd: string, opts: Options): Strength {
  const charset = buildCharset(opts);
  const alphabet = charset.length || 1;
  const entropy = Math.log2(alphabet) * pwd.length;
  let label: string;
  let color: string;
  let score: number;
  if (entropy < 40) {
    label = "Weak";
    color = "#ff6b6b";
    score = 1;
  } else if (entropy < 60) {
    label = "Fair";
    color = "#f5c26b";
    score = 2;
  } else if (entropy < 90) {
    label = "Strong";
    color = "#adc6ff";
    score = 3;
  } else {
    label = "Excellent";
    color = "#42e355";
    score = 4;
  }
  return { label, score, entropyBits: entropy, color };
}

export default function PasswordClient() {
  const [opts, setOpts] = useState<Options>({
    length: 20,
    lower: true,
    upper: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false,
  });
  const [password, setPassword] = useState("");

  const anySet = opts.lower || opts.upper || opts.digits || opts.symbols;

  const regen = useCallback(() => {
    if (!anySet) {
      setPassword("");
      return;
    }
    setPassword(generate(opts));
  }, [opts, anySet]);

  useEffect(() => {
    regen();
  }, [regen]);

  const strength = useMemo(
    () => (password ? assessStrength(password, opts) : null),
    [password, opts],
  );

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <div className="flex justify-between items-center mb-3 gap-3 flex-wrap">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Password
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={regen}
              disabled={!anySet}
              className="font-mono text-code-sm text-primary hover:underline inline-flex items-center gap-1 disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-base">
                refresh
              </span>
              regenerate
            </button>
            <span className="text-tertiary">·</span>
            <CopyButton value={password} />
          </div>
        </div>
        <div className="bg-black/30 border border-white/10 rounded-lg p-4 font-mono text-headline-md text-primary select-all break-all min-h-[3rem]">
          {password || (
            <span className="text-tertiary text-code-sm">
              enable at least one character class
            </span>
          )}
        </div>
        {strength ? <StrengthBar strength={strength} /> : null}
      </div>

      <div className="glass-card rounded-xl p-5 space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              / Length
            </p>
            <p className="font-mono text-headline-md text-primary">
              {opts.length}
            </p>
          </div>
          <input
            type="range"
            min={4}
            max={128}
            value={opts.length}
            onChange={(e) =>
              setOpts((o) => ({ ...o, length: Number(e.target.value) }))
            }
            className="w-full accent-primary"
          />
          <div className="flex justify-between font-mono text-[10px] text-tertiary uppercase tracking-widest mt-1">
            <span>4</span>
            <span>32</span>
            <span>64</span>
            <span>128</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          <Toggle
            label="Lowercase (a–z)"
            checked={opts.lower}
            onChange={(v) => setOpts((o) => ({ ...o, lower: v }))}
          />
          <Toggle
            label="Uppercase (A–Z)"
            checked={opts.upper}
            onChange={(v) => setOpts((o) => ({ ...o, upper: v }))}
          />
          <Toggle
            label="Numbers (0–9)"
            checked={opts.digits}
            onChange={(v) => setOpts((o) => ({ ...o, digits: v }))}
          />
          <Toggle
            label="Symbols (!@#…)"
            checked={opts.symbols}
            onChange={(v) => setOpts((o) => ({ ...o, symbols: v }))}
          />
          <Toggle
            label="Exclude look-alikes (il1Lo0O)"
            checked={opts.excludeAmbiguous}
            onChange={(v) => setOpts((o) => ({ ...o, excludeAmbiguous: v }))}
          />
        </div>
      </div>

      <div className="glass-card rounded-xl p-5">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
          / How this generator works
        </p>
        <ul className="space-y-1.5 font-mono text-code-sm text-on-surface-variant list-disc pl-5">
          <li>
            Uses <code className="text-primary">crypto.getRandomValues</code> —
            cryptographically strong, browser-native.
          </li>
          <li>
            Guarantees at least one character from each enabled class.
          </li>
          <li>
            Nothing is sent anywhere. Regenerate as many times as you want.
          </li>
        </ul>
      </div>
    </div>
  );
}

function StrengthBar({ strength }: { strength: Strength }) {
  const segments = 4;
  return (
    <div className="mt-3">
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full"
            style={{
              background: i < strength.score ? strength.color : "rgba(255,255,255,0.08)",
            }}
          />
        ))}
      </div>
      <div className="flex justify-between mt-2 font-mono text-code-sm">
        <span style={{ color: strength.color }}>{strength.label}</span>
        <span className="text-tertiary">
          ~ {strength.entropyBits.toFixed(0)} bits entropy
        </span>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer font-mono text-code-sm ${
        checked
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-white/10 bg-white/5 text-on-surface-variant"
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-primary"
      />
      {label}
    </label>
  );
}
