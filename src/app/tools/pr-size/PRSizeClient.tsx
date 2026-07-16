"use client";

import { useMemo, useState } from "react";

interface Parsed {
  filesChanged: number;
  insertions: number;
  deletions: number;
  source: "diffstat" | "manual" | "shortstat";
}

interface Bucket {
  label: "S" | "M" | "L" | "XL" | "XXL";
  headline: string;
  advice: string;
  tone: "secondary" | "primary" | "tertiary";
}

function parse(input: string): Parsed | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const shortstat = trimmed.match(
    /(\d+)\s+files?\s+changed(?:,\s*(\d+)\s+insertions?\(\+\))?(?:,\s*(\d+)\s+deletions?\(-\))?/i,
  );
  if (shortstat) {
    return {
      filesChanged: Number(shortstat[1] ?? 0),
      insertions: Number(shortstat[2] ?? 0),
      deletions: Number(shortstat[3] ?? 0),
      source: "shortstat",
    };
  }

  const lines = trimmed.split("\n").filter((l) => l.trim());
  let files = 0;
  let ins = 0;
  let del = 0;
  let anyDiffstat = false;
  for (const line of lines) {
    const m = line.match(/^\s*(\S.*?)\s*\|\s*(\d+|Bin)\s*([+\-]*)\s*$/);
    if (m) {
      anyDiffstat = true;
      files += 1;
      const counts = m[3] ?? "";
      ins += (counts.match(/\+/g) || []).length;
      del += (counts.match(/-/g) || []).length;
    }
  }
  if (anyDiffstat) {
    return { filesChanged: files, insertions: ins, deletions: del, source: "diffstat" };
  }

  return null;
}

function bucketFor(files: number, changed: number): Bucket {
  if (changed <= 60 && files <= 5) {
    return {
      label: "S",
      headline: "Small — review inline",
      advice:
        "Should take one reviewer <15 min. Ship it. If it can go in a single sitting, do so.",
      tone: "secondary",
    };
  }
  if (changed <= 250 && files <= 15) {
    return {
      label: "M",
      headline: "Medium — comfortable review",
      advice:
        "Roughly one focused sitting. Make sure the description spells out the why so the reviewer isn't reconstructing intent from the diff.",
      tone: "secondary",
    };
  }
  if (changed <= 600 && files <= 30) {
    return {
      label: "L",
      headline: "Large — expect friction",
      advice:
        "Review quality drops here. Consider carving this into 2–3 stacked PRs (setup / behavior / call-sites). At minimum, self-review before requesting.",
      tone: "primary",
    };
  }
  if (changed <= 1200 && files <= 60) {
    return {
      label: "XL",
      headline: "Extra large — split before merging",
      advice:
        "Reviewers rubber-stamp at this size. Split by concern, use a merge-later strategy, or pair-review synchronously to keep signal.",
      tone: "tertiary",
    };
  }
  return {
    label: "XXL",
    headline: "Huge — do not merge as one PR",
    advice:
      "Unless this is a scripted rename / codemod / generated file, break it up. Consider marking generated files as linguist-generated so they don't count against the diff.",
    tone: "tertiary",
  };
}

const SAMPLE = ` src/app/tools/pr-size/PRSizeClient.tsx | 210 +++++++++++++++++++
 src/data/tools.ts                       |  47 ++++
 src/components/tools/ToolShell.tsx      |  62 ++++++
 src/app/tools/page.tsx                  | 118 ++++++++++
 4 files changed, 437 insertions(+)`;

export default function PRSizeClient() {
  const [input, setInput] = useState("");
  const [manualFiles, setManualFiles] = useState("");
  const [manualLoc, setManualLoc] = useState("");

  const parsed = useMemo<Parsed | null>(() => {
    const p = parse(input);
    if (p) return p;
    const files = Number(manualFiles);
    const loc = Number(manualLoc);
    if (Number.isFinite(files) && Number.isFinite(loc) && (files > 0 || loc > 0)) {
      return { filesChanged: files, insertions: loc, deletions: 0, source: "manual" };
    }
    return null;
  }, [input, manualFiles, manualLoc]);

  const totalChanged = parsed ? parsed.insertions + parsed.deletions : 0;
  const bucket = parsed ? bucketFor(parsed.filesChanged, totalChanged) : null;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <label
            htmlFor="pr-input"
            className="font-mono text-label-caps text-secondary uppercase tracking-widest"
          >
            / Paste `git diff --stat` or `--shortstat`
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setInput(SAMPLE)}
              className="font-mono text-code-sm text-tertiary hover:text-primary"
            >
              load sample
            </button>
            <span className="text-tertiary">·</span>
            <button
              type="button"
              onClick={() => {
                setInput("");
                setManualFiles("");
                setManualLoc("");
              }}
              className="font-mono text-code-sm text-tertiary hover:text-primary"
            >
              clear
            </button>
          </div>
        </div>
        <textarea
          id="pr-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={6}
          spellCheck={false}
          placeholder=" file.ts | 42 ++++++++++--&#10; 3 files changed, 120 insertions(+), 5 deletions(-)"
          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
        />
        <p className="font-mono text-code-sm text-tertiary mt-3">or fill in manually:</p>
        <div className="mt-2 grid grid-cols-2 gap-3">
          <ManualField
            label="Files changed"
            value={manualFiles}
            onChange={setManualFiles}
          />
          <ManualField
            label="Lines changed (added + removed)"
            value={manualLoc}
            onChange={setManualLoc}
          />
        </div>
      </div>

      {parsed && bucket ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <MetricTile
              label="Files"
              value={parsed.filesChanged.toLocaleString()}
            />
            <MetricTile label="Lines +" value={parsed.insertions.toLocaleString()} />
            <MetricTile label="Lines −" value={parsed.deletions.toLocaleString()} />
          </div>
          <BucketCard bucket={bucket} totalChanged={totalChanged} />
          <ScaleBar totalChanged={totalChanged} />
        </>
      ) : (
        <p className="font-mono text-code-sm text-tertiary">
          Paste output from{" "}
          <code className="text-primary">git diff --stat main...</code> or fill in
          the fields above.
        </p>
      )}
    </div>
  );
}

function ManualField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
      />
    </label>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="font-mono text-headline-md text-primary">{value}</p>
    </div>
  );
}

function BucketCard({
  bucket,
  totalChanged,
}: {
  bucket: Bucket;
  totalChanged: number;
}) {
  const tone = {
    secondary: "text-secondary border-secondary/40",
    primary: "text-primary border-primary/40",
    tertiary: "text-tertiary border-tertiary/40",
  }[bucket.tone];
  return (
    <div className={`glass-card rounded-xl p-6 border ${tone}`}>
      <div className="flex items-baseline gap-4 flex-wrap">
        <p className={`font-mono text-[64px] leading-none ${tone}`}>{bucket.label}</p>
        <div>
          <p className="font-mono text-headline-md text-on-surface">{bucket.headline}</p>
          <p className="font-mono text-code-sm text-on-surface-variant mt-0.5">
            {totalChanged.toLocaleString()} lines changed
          </p>
        </div>
      </div>
      <p className="mt-4 text-body-md text-on-surface/85 leading-relaxed">
        {bucket.advice}
      </p>
    </div>
  );
}

function ScaleBar({ totalChanged }: { totalChanged: number }) {
  const stops: [string, number][] = [
    ["S", 60],
    ["M", 250],
    ["L", 600],
    ["XL", 1200],
    ["XXL", 2000],
  ];
  const max = 2000;
  const pct = Math.min(100, (totalChanged / max) * 100);
  return (
    <div className="glass-card rounded-xl p-5">
      <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-4">
        / Scale
      </p>
      <div className="relative h-2 bg-white/5 rounded-full">
        <div
          className="absolute top-0 left-0 h-full rounded-full bg-primary/70"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-2 grid grid-cols-5 font-mono text-[10px] uppercase tracking-widest text-tertiary">
        {stops.map(([label, upper]) => (
          <div key={label}>
            <span className="text-on-surface-variant">{label}</span>{" "}
            <span>≤{upper}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
