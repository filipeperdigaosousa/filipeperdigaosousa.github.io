"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

type Mode = "format" | "minify";

interface Location {
  line: number;
  col: number;
  offset: number;
}

function findErrorOffset(msg: string, input: string): Location | null {
  const posMatch = msg.match(/position\s+(\d+)/i);
  if (posMatch) {
    const offset = Number(posMatch[1]);
    return offsetToLineCol(input, offset);
  }
  const lineMatch = msg.match(/line\s+(\d+).*column\s+(\d+)/i);
  if (lineMatch) {
    return {
      line: Number(lineMatch[1]),
      col: Number(lineMatch[2]),
      offset: 0,
    };
  }
  return null;
}

function offsetToLineCol(input: string, offset: number): Location {
  let line = 1;
  let col = 1;
  for (let i = 0; i < Math.min(offset, input.length); i++) {
    if (input[i] === "\n") {
      line += 1;
      col = 1;
    } else {
      col += 1;
    }
  }
  return { line, col, offset };
}

interface Result {
  ok: boolean;
  output: string;
  size?: number;
  savings?: number;
  keys?: number;
  error?: string;
  errorLoc?: Location | null;
}

function process(input: string, mode: Mode, indent: number): Result {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, output: "" };
  try {
    const parsed = JSON.parse(trimmed);
    const out = mode === "format" ? JSON.stringify(parsed, null, indent) : JSON.stringify(parsed);
    const originalBytes = new Blob([trimmed]).size;
    const outBytes = new Blob([out]).size;
    return {
      ok: true,
      output: out,
      size: outBytes,
      savings:
        mode === "minify" && originalBytes > 0
          ? 1 - outBytes / originalBytes
          : undefined,
      keys: countKeys(parsed),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Parse error";
    return { ok: false, output: "", error: msg, errorLoc: findErrorOffset(msg, trimmed) };
  }
}

function countKeys(v: unknown): number {
  if (v === null || typeof v !== "object") return 0;
  if (Array.isArray(v)) return v.reduce<number>((n, x) => n + countKeys(x), 0);
  let n = 0;
  for (const k in v as Record<string, unknown>) {
    n += 1;
    n += countKeys((v as Record<string, unknown>)[k]);
  }
  return n;
}

function getByPath(obj: unknown, path: string): { ok: boolean; value?: unknown; error?: string } {
  if (!path.trim()) return { ok: true, value: obj };
  const segments = path
    .replace(/^\$/, "")
    .split(/[.[\]]/)
    .map((s) => s.trim())
    .filter(Boolean);
  let cur: unknown = obj;
  for (const seg of segments) {
    if (cur == null || (typeof cur !== "object" && !Array.isArray(cur))) {
      return { ok: false, error: `Cannot descend into non-object at "${seg}"` };
    }
    if (Array.isArray(cur)) {
      const idx = Number(seg);
      if (!Number.isInteger(idx)) {
        return { ok: false, error: `Expected array index at "${seg}"` };
      }
      cur = cur[idx];
    } else {
      cur = (cur as Record<string, unknown>)[seg.replace(/^["']|["']$/g, "")];
    }
    if (cur === undefined) return { ok: false, error: `No value at "${seg}"` };
  }
  return { ok: true, value: cur };
}

const SAMPLE = `{
  "user": { "id": 42, "name": "Ada", "roles": ["admin", "editor"] },
  "features": { "beta": true, "limit": 100 }
}`;

export default function JsonClient() {
  const [input, setInput] = useState("");
  const [mode, setMode] = useState<Mode>("format");
  const [indent, setIndent] = useState(2);
  const [path, setPath] = useState("");

  const result = useMemo(() => process(input, mode, indent), [input, mode, indent]);

  const pathResult = useMemo(() => {
    if (!result.ok || !input.trim()) return null;
    try {
      const obj = JSON.parse(input);
      return getByPath(obj, path);
    } catch {
      return null;
    }
  }, [result.ok, input, path]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {(["format", "minify"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`px-3 py-1.5 rounded-md font-mono text-code-sm capitalize ${
                mode === m
                  ? "bg-primary/20 text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {mode === "format" ? (
            <label className="inline-flex items-center gap-2 font-mono text-code-sm text-tertiary">
              indent
              <input
                type="number"
                min={2}
                max={8}
                value={indent}
                onChange={(e) =>
                  setIndent(Math.max(2, Math.min(8, Number(e.target.value) || 2)))
                }
                className="w-14 bg-black/30 border border-white/10 rounded p-1 text-center text-on-surface"
              />
            </label>
          ) : null}
          <button
            type="button"
            onClick={() => setInput(SAMPLE)}
            className="font-mono text-code-sm text-tertiary hover:text-primary"
          >
            sample
          </button>
          <button
            type="button"
            onClick={() => setInput("")}
            className="font-mono text-code-sm text-tertiary hover:text-primary"
          >
            clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="glass-card rounded-xl p-4">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
            / Input
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={14}
            spellCheck={false}
            placeholder='{ "foo": "bar" }'
            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
          />
        </div>
        <div
          className={`glass-card rounded-xl p-4 ${
            !result.ok ? "border border-tertiary/40" : ""
          }`}
        >
          <div className="flex justify-between items-center mb-2">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              / Output
            </p>
            <CopyButton value={result.output} />
          </div>
          {result.ok ? (
            <pre className="bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface min-h-[calc(1.5rem*14)] max-h-[500px] overflow-auto whitespace-pre-wrap break-words">
              {result.output || " "}
            </pre>
          ) : (
            <div className="bg-black/30 border border-tertiary/40 rounded-lg p-3">
              <p className="font-mono text-code-sm text-tertiary uppercase tracking-widest mb-1">
                / Parse error
              </p>
              <p className="font-mono text-code-sm text-on-surface/85">
                {result.error}
              </p>
              {result.errorLoc ? (
                <p className="font-mono text-[10px] text-tertiary mt-1">
                  line {result.errorLoc.line}, col {result.errorLoc.col}
                </p>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {result.ok && result.output ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <StatTile
            label="Bytes"
            value={result.size !== undefined ? result.size.toLocaleString() : "—"}
          />
          <StatTile
            label="Keys"
            value={result.keys !== undefined ? result.keys.toLocaleString() : "—"}
          />
          <StatTile
            label={mode === "minify" ? "Saved" : "Indent"}
            value={
              mode === "minify" && result.savings !== undefined
                ? `${(result.savings * 100).toFixed(1)}%`
                : `${indent} sp`
            }
          />
        </div>
      ) : null}

      {result.ok && result.output ? (
        <div className="glass-card rounded-xl p-4">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
            / Path lookup
          </p>
          <input
            type="text"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="user.roles[0]"
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-primary focus:outline-none focus:border-primary/50 mb-2"
          />
          {path && pathResult ? (
            pathResult.ok ? (
              <pre className="bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface whitespace-pre-wrap break-words">
                {JSON.stringify(pathResult.value, null, 2)}
              </pre>
            ) : (
              <p className="font-mono text-code-sm text-tertiary">
                {pathResult.error}
              </p>
            )
          ) : (
            <p className="font-mono text-code-sm text-tertiary">
              Type a dot-path, e.g. <code className="text-primary">user.name</code>{" "}
              or <code className="text-primary">features.limit</code>
            </p>
          )}
        </div>
      ) : null}
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

