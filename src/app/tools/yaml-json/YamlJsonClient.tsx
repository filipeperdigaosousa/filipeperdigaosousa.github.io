"use client";

import { useEffect, useMemo, useState } from "react";
import YAML from "yaml";

type Direction = "yaml-to-json" | "json-to-yaml";

interface Result {
  ok: boolean;
  output: string;
  error?: string;
}

function convert(input: string, dir: Direction, indent: number): Result {
  const trimmed = input.trim();
  if (!trimmed) return { ok: true, output: "" };
  try {
    if (dir === "yaml-to-json") {
      const value = YAML.parse(trimmed);
      return { ok: true, output: JSON.stringify(value, null, indent) };
    }
    const value = JSON.parse(trimmed);
    return { ok: true, output: YAML.stringify(value, { indent }) };
  } catch (err) {
    return {
      ok: false,
      output: "",
      error: err instanceof Error ? err.message : "Parse error",
    };
  }
}

const SAMPLE_YAML = `service: web
port: 8080
env:
  - name: NODE_ENV
    value: production
replicas: 3`;

const SAMPLE_JSON = `{
  "service": "web",
  "port": 8080,
  "env": [{ "name": "NODE_ENV", "value": "production" }],
  "replicas": 3
}`;

export default function YamlJsonClient() {
  const [dir, setDir] = useState<Direction>("yaml-to-json");
  const [input, setInput] = useState("");
  const [indent, setIndent] = useState(2);

  useEffect(() => {
    setInput("");
  }, [dir]);

  const result = useMemo(() => convert(input, dir, indent), [input, dir, indent]);

  const inputLang = dir === "yaml-to-json" ? "YAML" : "JSON";
  const outputLang = dir === "yaml-to-json" ? "JSON" : "YAML";

  async function copyOutput() {
    if (!result.ok) return;
    try {
      await navigator.clipboard.writeText(result.output);
    } catch {}
  }

  function swap() {
    if (result.ok && result.output) {
      setDir(dir === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json");
      setInput(result.output);
    } else {
      setDir(dir === "yaml-to-json" ? "json-to-yaml" : "yaml-to-json");
    }
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-4 flex items-center gap-4 flex-wrap justify-between">
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {(
            [
              ["yaml-to-json", "YAML → JSON"],
              ["json-to-yaml", "JSON → YAML"],
            ] as [Direction, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setDir(key)}
              className={`px-3 py-1 rounded-md font-mono text-code-sm ${
                dir === key
                  ? "bg-primary/20 text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 flex-wrap">
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
          <button
            type="button"
            onClick={swap}
            className="font-mono text-code-sm text-tertiary hover:text-primary inline-flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-base">
              swap_vert
            </span>
            swap
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="glass-card rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              / {inputLang} input
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() =>
                  setInput(dir === "yaml-to-json" ? SAMPLE_YAML : SAMPLE_JSON)
                }
                className="font-mono text-code-sm text-tertiary hover:text-primary"
              >
                sample
              </button>
              <span className="text-tertiary">·</span>
              <button
                type="button"
                onClick={() => setInput("")}
                className="font-mono text-code-sm text-tertiary hover:text-primary"
              >
                clear
              </button>
            </div>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={16}
            spellCheck={false}
            placeholder={dir === "yaml-to-json" ? SAMPLE_YAML : SAMPLE_JSON}
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
              / {outputLang} output
            </p>
            <button
              type="button"
              onClick={copyOutput}
              disabled={!result.ok || !result.output}
              className="font-mono text-code-sm text-tertiary hover:text-primary disabled:opacity-40"
            >
              copy
            </button>
          </div>
          {result.ok ? (
            <pre className="bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface min-h-[calc(1.5rem*16)] whitespace-pre-wrap break-words overflow-x-auto">
              {result.output || " "}
            </pre>
          ) : (
            <div className="bg-black/30 border border-tertiary/40 rounded-lg p-3">
              <p className="font-mono text-code-sm text-tertiary uppercase tracking-widest mb-1">
                / Parse error
              </p>
              <p className="font-mono text-code-sm text-on-surface/85 whitespace-pre-wrap">
                {result.error}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
