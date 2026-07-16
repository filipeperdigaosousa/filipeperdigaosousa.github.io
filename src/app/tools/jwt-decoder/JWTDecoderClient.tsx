"use client";

import { useMemo, useState } from "react";

function base64UrlDecode(input: string): string {
  const normalised = input.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalised + "=".repeat((4 - (normalised.length % 4)) % 4);
  if (typeof atob !== "function") {
    throw new Error("Browser required");
  }
  const binary = atob(padded);
  try {
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  } catch {
    return binary;
  }
}

interface DecodedJWT {
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signature: string;
}

function decodeJWT(token: string): DecodedJWT {
  const trimmed = token.trim();
  const parts = trimmed.split(".");
  if (parts.length !== 3) {
    throw new Error("Expected 3 segments (header.payload.signature)");
  }
  const [h, p, s] = parts;
  const header = JSON.parse(base64UrlDecode(h));
  const payload = JSON.parse(base64UrlDecode(p));
  return { header, payload, signature: s };
}

function humanTime(epoch: number): string {
  const d = new Date(epoch * 1000);
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "medium",
  });
}

function relative(epoch: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = epoch - now;
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [60, "s"],
    [60, "m"],
    [24, "h"],
    [30, "d"],
    [12, "mo"],
    [Infinity, "y"],
  ];
  let value = abs;
  let unit = "s";
  for (const [step, u] of units) {
    if (value < step) {
      unit = u;
      break;
    }
    value = value / step;
    unit = u;
  }
  const rounded = value < 10 ? value.toFixed(1) : Math.round(value).toString();
  return diff >= 0 ? `in ${rounded}${unit}` : `${rounded}${unit} ago`;
}

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkYSBMb3ZlbGFjZSIsImlhdCI6MTUxNjIzOTAyMiwiZXhwIjozOTk5OTk5OTk5fQ.QsjMPszNwMxjcYtRQaZ7vX3TzbmMx5f1KMDLMJfUv9c";

export default function JWTDecoderClient() {
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    if (!token.trim()) return { kind: "empty" as const };
    try {
      const decoded = decodeJWT(token);
      return { kind: "ok" as const, decoded };
    } catch (err) {
      return {
        kind: "error" as const,
        message: err instanceof Error ? err.message : "Invalid token",
      };
    }
  }, [token]);

  const claims =
    result.kind === "ok" ? (result.decoded.payload as Record<string, unknown>) : null;
  const exp = typeof claims?.exp === "number" ? (claims.exp as number) : null;
  const iat = typeof claims?.iat === "number" ? (claims.iat as number) : null;
  const nbf = typeof claims?.nbf === "number" ? (claims.nbf as number) : null;
  const nowSec = Math.floor(Date.now() / 1000);
  const expired = exp !== null && exp < nowSec;
  const notYetValid = nbf !== null && nbf > nowSec;

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
          <label
            htmlFor="jwt-input"
            className="font-mono text-label-caps text-secondary uppercase tracking-widest"
          >
            / JWT input
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setToken(SAMPLE)}
              className="font-mono text-code-sm text-tertiary hover:text-primary"
            >
              load sample
            </button>
            <span className="text-tertiary">·</span>
            <button
              type="button"
              onClick={() => setToken("")}
              className="font-mono text-code-sm text-tertiary hover:text-primary"
            >
              clear
            </button>
          </div>
        </div>
        <textarea
          id="jwt-input"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          rows={5}
          spellCheck={false}
          placeholder="Paste JWT here (eyJ...)"
          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 break-all resize-y"
        />
      </div>

      {result.kind === "error" ? (
        <div className="glass-card rounded-xl p-5 border-tertiary/40">
          <p className="font-mono text-code-sm text-tertiary uppercase tracking-widest mb-1">
            / Invalid JWT
          </p>
          <p className="text-body-md text-on-surface/85">{result.message}</p>
        </div>
      ) : null}

      {result.kind === "ok" ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
            <StatusTile
              label="Signature"
              value={`${result.decoded.signature.slice(0, 8)}…`}
              hint="not verified — need secret/key"
              tone="tertiary"
            />
            <StatusTile
              label="Algorithm"
              value={
                typeof result.decoded.header.alg === "string"
                  ? (result.decoded.header.alg as string)
                  : "—"
              }
              tone="primary"
            />
            <StatusTile
              label="Status"
              value={
                expired ? "Expired" : notYetValid ? "Not yet valid" : "Active"
              }
              tone={expired || notYetValid ? "tertiary" : "secondary"}
            />
          </div>

          {(exp || iat || nbf) && (
            <div className="glass-card rounded-xl p-5">
              <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
                / Timeline
              </p>
              <ul className="space-y-2 font-mono text-code-sm">
                {iat !== null ? (
                  <TimeRow label="Issued (iat)" epoch={iat} />
                ) : null}
                {nbf !== null ? (
                  <TimeRow label="Not before (nbf)" epoch={nbf} />
                ) : null}
                {exp !== null ? (
                  <TimeRow
                    label="Expires (exp)"
                    epoch={exp}
                    tone={expired ? "tertiary" : "secondary"}
                  />
                ) : null}
              </ul>
            </div>
          )}

          <JSONBlock title="/ Header" value={result.decoded.header} />
          <JSONBlock title="/ Payload" value={result.decoded.payload} />
        </>
      ) : null}
    </div>
  );
}

function StatusTile({
  label,
  value,
  hint,
  tone,
}: {
  label: string;
  value: string;
  hint?: string;
  tone: "primary" | "secondary" | "tertiary";
}) {
  const color =
    tone === "primary"
      ? "text-primary"
      : tone === "secondary"
        ? "text-secondary"
        : "text-tertiary";
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </p>
      <p className={`font-mono text-headline-md ${color} truncate`}>{value}</p>
      {hint ? (
        <p className="mt-1 font-mono text-[10px] text-tertiary">{hint}</p>
      ) : null}
    </div>
  );
}

function TimeRow({
  label,
  epoch,
  tone,
}: {
  label: string;
  epoch: number;
  tone?: "secondary" | "tertiary";
}) {
  const color =
    tone === "tertiary"
      ? "text-tertiary"
      : tone === "secondary"
        ? "text-secondary"
        : "text-on-surface";
  return (
    <li className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span className="text-on-surface-variant uppercase tracking-widest text-[10px] w-32 shrink-0">
        {label}
      </span>
      <span className={color}>{humanTime(epoch)}</span>
      <span className="text-tertiary">·</span>
      <span className="text-on-surface-variant">{relative(epoch)}</span>
    </li>
  );
}

function JSONBlock({
  title,
  value,
}: {
  title: string;
  value: Record<string, unknown>;
}) {
  return (
    <div className="glass-card rounded-xl p-5">
      <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
        {title}
      </p>
      <pre className="font-mono text-code-sm text-on-surface bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-words">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
