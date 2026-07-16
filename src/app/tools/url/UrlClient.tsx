"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

type Mode = "encode" | "decode" | "parse";

interface Param {
  id: string;
  key: string;
  value: string;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

interface ParsedUrl {
  ok: boolean;
  url?: URL;
  raw: string;
  error?: string;
}

function safeParse(input: string): ParsedUrl {
  const trimmed = input.trim();
  if (!trimmed) return { ok: false, raw: trimmed, error: "" };
  try {
    return { ok: true, url: new URL(trimmed), raw: trimmed };
  } catch {
    try {
      const u = new URL(`https://${trimmed}`);
      return { ok: true, url: u, raw: trimmed };
    } catch (err) {
      return {
        ok: false,
        raw: trimmed,
        error: err instanceof Error ? err.message : "Invalid URL",
      };
    }
  }
}

export default function UrlClient() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [params, setParams] = useState<Param[]>([]);
  const [pathBase, setPathBase] = useState("");

  const encoded = useMemo(() => encodeURIComponent(input), [input]);
  const decoded = useMemo(() => {
    try {
      return { ok: true, value: decodeURIComponent(input) };
    } catch (err) {
      return {
        ok: false,
        value: "",
        error: err instanceof Error ? err.message : "Malformed sequence",
      };
    }
  }, [input]);

  function onParse() {
    const parsed = safeParse(urlInput);
    if (!parsed.ok || !parsed.url) return;
    const u = parsed.url;
    setPathBase(`${u.origin}${u.pathname}`);
    const next: Param[] = [];
    u.searchParams.forEach((v, k) => next.push({ id: uid(), key: k, value: v }));
    setParams(next);
  }

  const rebuilt = useMemo(() => {
    if (!pathBase) return "";
    const search = new URLSearchParams();
    for (const p of params) if (p.key) search.append(p.key, p.value);
    const qs = search.toString();
    return qs ? `${pathBase}?${qs}` : pathBase;
  }, [pathBase, params]);

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
        {(
          [
            ["encode", "Encode"],
            ["decode", "Decode"],
            ["parse", "Query parser"],
          ] as [Mode, string][]
        ).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setMode(key)}
            className={`px-3 py-1.5 rounded-md font-mono text-code-sm ${
              mode === key
                ? "bg-primary/20 text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode !== "parse" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          <div className="glass-card rounded-xl p-4">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
              / Input
            </p>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={8}
              spellCheck={false}
              placeholder={
                mode === "encode"
                  ? "hello world & foo=bar?"
                  : "hello%20world%20%26%20foo%3Dbar%3F"
              }
              className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
            />
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex justify-between items-center mb-2">
              <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
                / Output
              </p>
              <CopyButton value={mode === "encode" ? encoded : decoded.value} />
            </div>
            {mode === "decode" && !decoded.ok ? (
              <div className="bg-black/30 border border-tertiary/40 rounded-lg p-3">
                <p className="font-mono text-code-sm text-tertiary">
                  {decoded.error}
                </p>
              </div>
            ) : (
              <pre className="bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface min-h-[calc(1.5rem*8)] whitespace-pre-wrap break-words overflow-x-auto">
                {(mode === "encode" ? encoded : decoded.value) || " "}
              </pre>
            )}
          </div>
        </div>
      ) : (
        <QueryParser
          urlInput={urlInput}
          setUrlInput={setUrlInput}
          onParse={onParse}
          pathBase={pathBase}
          setPathBase={setPathBase}
          params={params}
          setParams={setParams}
          rebuilt={rebuilt}
        />
      )}
    </div>
  );
}

function QueryParser({
  urlInput,
  setUrlInput,
  onParse,
  pathBase,
  setPathBase,
  params,
  setParams,
  rebuilt,
}: {
  urlInput: string;
  setUrlInput: (v: string) => void;
  onParse: () => void;
  pathBase: string;
  setPathBase: (v: string) => void;
  params: Param[];
  setParams: React.Dispatch<React.SetStateAction<Param[]>>;
  rebuilt: string;
}) {
  return (
    <div className="space-y-4">
      <div className="glass-card rounded-xl p-4">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
          / Paste URL
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://example.com/path?foo=bar&baz=1"
            className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          />
          <button
            type="button"
            onClick={onParse}
            className="px-4 py-2 rounded-lg bg-primary/15 border border-primary/40 text-primary font-mono text-code-sm hover:bg-primary/25"
          >
            parse
          </button>
        </div>
      </div>

      {pathBase ? (
        <>
          <div className="glass-card rounded-xl p-4">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
              / Base
            </p>
            <input
              type="text"
              value={pathBase}
              onChange={(e) => setPathBase(e.target.value)}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-primary focus:outline-none focus:border-primary/50"
            />
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
                / Parameters ({params.length})
              </p>
              <button
                type="button"
                onClick={() =>
                  setParams((prev) => [
                    ...prev,
                    { id: uid(), key: "", value: "" },
                  ])
                }
                className="font-mono text-code-sm text-primary hover:underline"
              >
                + add
              </button>
            </div>
            <ul className="space-y-2">
              {params.map((p) => (
                <li key={p.id} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                  <input
                    type="text"
                    value={p.key}
                    onChange={(e) =>
                      setParams((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, key: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="key"
                    className="bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-primary focus:outline-none focus:border-primary/50"
                  />
                  <input
                    type="text"
                    value={p.value}
                    onChange={(e) =>
                      setParams((prev) =>
                        prev.map((x) =>
                          x.id === p.id ? { ...x, value: e.target.value } : x,
                        ),
                      )
                    }
                    placeholder="value (decoded)"
                    className="bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setParams((prev) => prev.filter((x) => x.id !== p.id))
                    }
                    className="p-2 text-tertiary hover:text-primary"
                    aria-label="Remove parameter"
                  >
                    <span className="material-symbols-outlined text-lg">
                      delete
                    </span>
                  </button>
                </li>
              ))}
              {params.length === 0 ? (
                <li className="font-mono text-code-sm text-tertiary">
                  No parameters.
                </li>
              ) : null}
            </ul>
          </div>

          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
                / Rebuilt URL
              </p>
              <CopyButton value={rebuilt} />
            </div>
            <pre className="bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-primary whitespace-pre-wrap break-words overflow-x-auto">
              {rebuilt || " "}
            </pre>
          </div>
        </>
      ) : (
        <p className="font-mono text-code-sm text-tertiary">
          Paste a URL then press parse.
        </p>
      )}
    </div>
  );
}

