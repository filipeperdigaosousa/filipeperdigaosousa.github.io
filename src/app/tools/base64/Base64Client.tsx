"use client";

import { useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

type Mode = "encode" | "decode";

function bytesToBase64(bytes: Uint8Array, urlSafe: boolean): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  const b64 = btoa(binary);
  if (!urlSafe) return b64;
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64ToBytes(input: string, urlSafe: boolean): Uint8Array {
  let str = input.trim();
  if (urlSafe) {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    while (str.length % 4) str += "=";
  }
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function encodeText(input: string, urlSafe: boolean): string {
  return bytesToBase64(new TextEncoder().encode(input), urlSafe);
}

interface DecodeResult {
  ok: boolean;
  text?: string;
  bytesLen?: number;
  error?: string;
}

function decodeText(input: string, urlSafe: boolean): DecodeResult {
  if (!input.trim()) return { ok: true, text: "", bytesLen: 0 };
  try {
    const bytes = base64ToBytes(input, urlSafe);
    const text = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    return { ok: true, text, bytesLen: bytes.length };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invalid base64",
    };
  }
}

export default function Base64Client() {
  const [mode, setMode] = useState<Mode>("encode");
  const [input, setInput] = useState("");
  const [urlSafe, setUrlSafe] = useState(false);
  const [fileResult, setFileResult] = useState<{
    name: string;
    dataUrl: string;
    b64: string;
    size: number;
  } | null>(null);

  const output = useMemo(() => {
    if (mode === "encode") return { ok: true, text: encodeText(input, urlSafe) };
    return decodeText(input, urlSafe);
  }, [input, mode, urlSafe]);

  async function onFile(f: File) {
    const buf = await f.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const b64 = bytesToBase64(bytes, urlSafe);
    const mime = f.type || "application/octet-stream";
    setFileResult({
      name: f.name,
      dataUrl: `data:${mime};base64,${b64}`,
      b64,
      size: bytes.length,
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {(["encode", "decode"] as Mode[]).map((m) => (
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
        <label className="inline-flex items-center gap-2 font-mono text-code-sm text-tertiary cursor-pointer">
          <input
            type="checkbox"
            checked={urlSafe}
            onChange={(e) => setUrlSafe(e.target.checked)}
            className="accent-primary"
          />
          URL-safe (base64url)
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="glass-card rounded-xl p-4">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
            / {mode === "encode" ? "Plain text" : "Base64"}
          </p>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={8}
            spellCheck={false}
            placeholder={
              mode === "encode" ? "Type or paste text…" : "SGVsbG8sIHdvcmxkIQ=="
            }
            className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
          />
        </div>
        <div
          className={`glass-card rounded-xl p-4 ${
            !output.ok ? "border border-tertiary/40" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              / {mode === "encode" ? "Base64" : "Plain text"}
            </p>
            <CopyButton value={output.text ?? ""} />
          </div>
          {output.ok ? (
            <pre className="bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface min-h-[calc(1.5rem*8)] whitespace-pre-wrap break-all overflow-x-auto">
              {output.text || " "}
            </pre>
          ) : (
            <div className="bg-black/30 border border-tertiary/40 rounded-lg p-3">
              <p className="font-mono text-code-sm text-tertiary">
                {output.error}
              </p>
            </div>
          )}
          {mode === "decode" && output.ok && output.bytesLen !== undefined ? (
            <p className="mt-2 font-mono text-[10px] text-tertiary">
              {output.bytesLen} bytes decoded
            </p>
          ) : null}
        </div>
      </div>

      {mode === "encode" ? (
        <div className="glass-card rounded-xl p-5">
          <div className="flex justify-between items-center mb-3 gap-3 flex-wrap">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              / File → data URL
            </p>
            <label className="px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary font-mono text-code-sm cursor-pointer hover:bg-primary/20">
              <input
                type="file"
                onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])}
                className="hidden"
              />
              upload file
            </label>
          </div>
          {!fileResult ? (
            <p className="font-mono text-code-sm text-tertiary">
              Pick any file (image, PDF, whatever). Everything stays in-browser.
            </p>
          ) : (
            <div className="space-y-3">
              <p className="font-mono text-code-sm text-on-surface">
                <span className="text-primary">{fileResult.name}</span> ·{" "}
                <span className="text-tertiary">{fileResult.size} bytes</span>
              </p>
              {fileResult.dataUrl.startsWith("data:image/") ? (
                <img
                  src={fileResult.dataUrl}
                  alt="preview"
                  className="max-h-48 rounded-lg border border-white/10"
                />
              ) : null}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FieldBox label="Base64" value={fileResult.b64} />
                <FieldBox label="Data URL" value={fileResult.dataUrl} />
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

function FieldBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-black/30 border border-white/10 rounded-lg p-3">
      <div className="flex justify-between items-center mb-1">
        <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
          {label}
        </p>
        <CopyButton value={value} />
      </div>
      <p className="font-mono text-code-sm text-on-surface break-all max-h-32 overflow-y-auto">
        {value}
      </p>
    </div>
  );
}

