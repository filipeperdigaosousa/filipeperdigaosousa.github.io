"use client";

import { diffLines, diffWordsWithSpace } from "diff";
import { useMemo, useState } from "react";

type Mode = "split" | "unified";

interface SplitRow {
  left: { line?: number; text: string; kind: "same" | "removed" | "empty" };
  right: { line?: number; text: string; kind: "same" | "added" | "empty" };
}

function buildSplit(a: string, b: string): SplitRow[] {
  const parts = diffLines(a, b);
  const rows: SplitRow[] = [];
  let lLine = 0;
  let rLine = 0;
  let i = 0;
  while (i < parts.length) {
    const p = parts[i];
    if (p.removed && parts[i + 1]?.added) {
      const removedLines = p.value.replace(/\n$/, "").split("\n");
      const addedLines = parts[i + 1].value.replace(/\n$/, "").split("\n");
      const max = Math.max(removedLines.length, addedLines.length);
      for (let k = 0; k < max; k++) {
        rows.push({
          left:
            k < removedLines.length
              ? { line: ++lLine, text: removedLines[k], kind: "removed" }
              : { text: "", kind: "empty" },
          right:
            k < addedLines.length
              ? { line: ++rLine, text: addedLines[k], kind: "added" }
              : { text: "", kind: "empty" },
        });
      }
      i += 2;
      continue;
    }
    const lines = p.value.replace(/\n$/, "").split("\n");
    for (const line of lines) {
      if (p.removed) {
        rows.push({
          left: { line: ++lLine, text: line, kind: "removed" },
          right: { text: "", kind: "empty" },
        });
      } else if (p.added) {
        rows.push({
          left: { text: "", kind: "empty" },
          right: { line: ++rLine, text: line, kind: "added" },
        });
      } else {
        rows.push({
          left: { line: ++lLine, text: line, kind: "same" },
          right: { line: ++rLine, text: line, kind: "same" },
        });
      }
    }
    i += 1;
  }
  return rows;
}

interface Stats {
  added: number;
  removed: number;
  unchanged: number;
}

function computeStats(rows: SplitRow[]): Stats {
  let added = 0;
  let removed = 0;
  let unchanged = 0;
  for (const r of rows) {
    if (r.left.kind === "same") unchanged += 1;
    if (r.left.kind === "removed") removed += 1;
    if (r.right.kind === "added") added += 1;
  }
  return { added, removed, unchanged };
}

export default function DiffClient() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [mode, setMode] = useState<Mode>("split");
  const [wordLevel, setWordLevel] = useState(true);

  const rows = useMemo(() => buildSplit(a, b), [a, b]);
  const stats = useMemo(() => computeStats(rows), [rows]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <TextInput label="Original (A)" value={a} onChange={setA} />
        <TextInput label="Changed (B)" value={b} onChange={setB} />
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
            {(["split", "unified"] as Mode[]).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-md font-mono text-code-sm capitalize ${
                  mode === m
                    ? "bg-primary/20 text-primary"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 font-mono text-code-sm text-tertiary cursor-pointer">
            <input
              type="checkbox"
              checked={wordLevel}
              onChange={(e) => setWordLevel(e.target.checked)}
              className="accent-primary"
            />
            word-level highlights
          </label>
        </div>
        <p className="font-mono text-code-sm">
          <span className="text-secondary">+{stats.added}</span>
          <span className="text-tertiary mx-2">·</span>
          <span className="text-[#ff6b6b]">−{stats.removed}</span>
          <span className="text-tertiary mx-2">·</span>
          <span className="text-on-surface-variant">{stats.unchanged} unchanged</span>
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="font-mono text-code-sm text-tertiary">
          Paste text into both sides to compare.
        </p>
      ) : mode === "split" ? (
        <SplitView rows={rows} wordLevel={wordLevel} />
      ) : (
        <UnifiedView rows={rows} wordLevel={wordLevel} />
      )}
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
          / {label}
        </p>
        <button
          type="button"
          onClick={() => onChange("")}
          className="font-mono text-code-sm text-tertiary hover:text-primary"
        >
          clear
        </button>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={10}
        spellCheck={false}
        placeholder="Paste text here…"
        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
      />
    </div>
  );
}

function renderInline(a: string, b: string, side: "left" | "right"): React.ReactNode {
  const parts = diffWordsWithSpace(a, b);
  return parts.map((p, i) => {
    if (side === "left") {
      if (p.added) return null;
      if (p.removed)
        return (
          <span key={i} className="bg-[#ff6b6b]/25 text-[#ffb4b4]">
            {p.value}
          </span>
        );
      return <span key={i}>{p.value}</span>;
    }
    if (p.removed) return null;
    if (p.added)
      return (
        <span key={i} className="bg-secondary/25 text-secondary">
          {p.value}
        </span>
      );
    return <span key={i}>{p.value}</span>;
  });
}

function SplitView({
  rows,
  wordLevel,
}: {
  rows: SplitRow[];
  wordLevel: boolean;
}) {
  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <div className="grid grid-cols-2 font-mono text-code-sm">
        <div className="border-r border-white/10">
          {rows.map((r, i) => (
            <DiffLine
              key={`l-${i}`}
              line={r.left.line}
              text={r.left.text}
              kind={r.left.kind}
              side="left"
              pairedText={r.right.text}
              wordLevel={wordLevel && r.left.kind === "removed" && r.right.kind === "added"}
            />
          ))}
        </div>
        <div>
          {rows.map((r, i) => (
            <DiffLine
              key={`r-${i}`}
              line={r.right.line}
              text={r.right.text}
              kind={r.right.kind}
              side="right"
              pairedText={r.left.text}
              wordLevel={wordLevel && r.left.kind === "removed" && r.right.kind === "added"}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DiffLine({
  line,
  text,
  kind,
  side,
  pairedText,
  wordLevel,
}: {
  line?: number;
  text: string;
  kind: "same" | "added" | "removed" | "empty";
  side: "left" | "right";
  pairedText: string;
  wordLevel: boolean;
}) {
  const bg =
    kind === "added"
      ? "bg-secondary/10"
      : kind === "removed"
        ? "bg-[#ff6b6b]/10"
        : kind === "empty"
          ? "bg-white/[0.02]"
          : "";
  const gutterColor =
    kind === "added"
      ? "text-secondary"
      : kind === "removed"
        ? "text-[#ff6b6b]"
        : "text-tertiary";
  return (
    <div className={`flex ${bg} min-h-[1.5rem]`}>
      <span
        className={`w-10 px-2 py-0.5 text-right shrink-0 select-none border-r border-white/5 ${gutterColor}`}
      >
        {line ?? ""}
      </span>
      <span className="flex-1 px-3 py-0.5 whitespace-pre-wrap break-words text-on-surface">
        {wordLevel && kind !== "empty" && kind !== "same"
          ? renderInline(
              side === "left" ? text : pairedText,
              side === "left" ? pairedText : text,
              side,
            )
          : text || " "}
      </span>
    </div>
  );
}

function UnifiedView({
  rows,
  wordLevel,
}: {
  rows: SplitRow[];
  wordLevel: boolean;
}) {
  const flat: {
    sign: " " | "-" | "+";
    leftLine?: number;
    rightLine?: number;
    text: string;
    pair?: string;
  }[] = [];
  for (const r of rows) {
    if (r.left.kind === "removed") {
      flat.push({
        sign: "-",
        leftLine: r.left.line,
        text: r.left.text,
        pair: r.right.kind === "empty" ? undefined : r.right.text,
      });
    }
    if (r.right.kind === "added") {
      flat.push({
        sign: "+",
        rightLine: r.right.line,
        text: r.right.text,
        pair: r.left.kind === "empty" ? undefined : r.left.text,
      });
    }
    if (r.left.kind === "same") {
      flat.push({
        sign: " ",
        leftLine: r.left.line,
        rightLine: r.right.line,
        text: r.left.text,
      });
    }
  }
  return (
    <div className="glass-card rounded-xl overflow-hidden font-mono text-code-sm">
      {flat.map((row, i) => {
        const bg =
          row.sign === "+"
            ? "bg-secondary/10"
            : row.sign === "-"
              ? "bg-[#ff6b6b]/10"
              : "";
        const signColor =
          row.sign === "+"
            ? "text-secondary"
            : row.sign === "-"
              ? "text-[#ff6b6b]"
              : "text-tertiary";
        return (
          <div key={i} className={`flex ${bg} min-h-[1.5rem]`}>
            <span className="w-10 px-2 py-0.5 text-right select-none border-r border-white/5 text-tertiary">
              {row.leftLine ?? ""}
            </span>
            <span className="w-10 px-2 py-0.5 text-right select-none border-r border-white/5 text-tertiary">
              {row.rightLine ?? ""}
            </span>
            <span className={`w-6 text-center select-none ${signColor}`}>
              {row.sign}
            </span>
            <span className="flex-1 px-3 py-0.5 whitespace-pre-wrap break-words text-on-surface">
              {wordLevel && row.pair !== undefined && row.sign !== " "
                ? renderInline(
                    row.sign === "-" ? row.text : row.pair,
                    row.sign === "-" ? row.pair : row.text,
                    row.sign === "-" ? "left" : "right",
                  )
                : row.text || " "}
            </span>
          </div>
        );
      })}
    </div>
  );
}
