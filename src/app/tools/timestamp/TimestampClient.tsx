"use client";

import { useEffect, useMemo, useState } from "react";

type Unit = "s" | "ms";

const TZ_PRESETS = [
  "UTC",
  "Europe/Lisbon",
  "Europe/London",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "Asia/Tokyo",
];

function toDate(value: number, unit: Unit): Date {
  return new Date(unit === "s" ? value * 1000 : value);
}

function formatIn(date: Date, tz: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone: tz,
      dateStyle: "full",
      timeStyle: "long",
    }).format(date);
  } catch {
    return date.toString();
  }
}

function relative(date: Date, now: Date): string {
  const diff = (date.getTime() - now.getTime()) / 1000;
  const abs = Math.abs(diff);
  const units: [number, string][] = [
    [60, "s"],
    [60, "min"],
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

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function toLocalInputValue(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function TimestampClient() {
  const [epochInput, setEpochInput] = useState("");
  const [unit, setUnit] = useState<Unit>("s");
  const [tz, setTz] = useState("UTC");
  const [datetimeInput, setDatetimeInput] = useState("");
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const guess = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (guess) setTz(guess);
    const d = new Date();
    setNow(d);
    setEpochInput(String(Math.floor(d.getTime() / 1000)));
    setDatetimeInput(toLocalInputValue(d));
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const parsedEpoch = useMemo(() => {
    const n = Number(epochInput);
    if (!Number.isFinite(n) || epochInput.trim() === "") return null;
    const u = unit === "s" && Math.abs(n) > 1e12 ? "ms" : unit;
    return { date: toDate(n, u), effectiveUnit: u };
  }, [epochInput, unit]);

  const parsedDatetime = useMemo(() => {
    if (!datetimeInput) return null;
    const d = new Date(datetimeInput);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [datetimeInput]);

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-4 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <p className="font-mono text-code-sm text-tertiary">Timezone</p>
          <select
            value={tz}
            onChange={(e) => setTz(e.target.value)}
            className="bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          >
            {TZ_PRESETS.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
            {!TZ_PRESETS.includes(tz) ? (
              <option value={tz}>{tz} (local)</option>
            ) : null}
          </select>
        </div>
        {now ? (
          <p className="font-mono text-code-sm text-on-surface-variant">
            Now:{" "}
            <span className="text-primary">
              {Math.floor(now.getTime() / 1000)}
            </span>{" "}
            · {formatIn(now, tz)}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <div className="glass-card rounded-xl p-5">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
            / Epoch → date
          </p>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              inputMode="numeric"
              value={epochInput}
              onChange={(e) => setEpochInput(e.target.value.trim())}
              placeholder="1710000000"
              className="flex-1 bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
            />
            <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
              {(["s", "ms"] as Unit[]).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => setUnit(u)}
                  className={`px-3 py-1 rounded-md font-mono text-code-sm ${
                    unit === u
                      ? "bg-primary/20 text-primary"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </div>
          {parsedEpoch && now ? (
            <ResultRows date={parsedEpoch.date} tz={tz} now={now} note={
              parsedEpoch.effectiveUnit !== unit
                ? `Detected ${parsedEpoch.effectiveUnit} — value too large for ${unit}.`
                : undefined
            } />
          ) : (
            <p className="font-mono text-code-sm text-tertiary">
              Enter a Unix timestamp.
            </p>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {now ? (
              <PresetChip
                label="now"
                onClick={() =>
                  setEpochInput(
                    String(
                      unit === "s"
                        ? Math.floor(now.getTime() / 1000)
                        : now.getTime(),
                    ),
                  )
                }
              />
            ) : null}
            <PresetChip label="0 (epoch)" onClick={() => setEpochInput("0")} />
            <PresetChip
              label="1e9 (Sep 2001)"
              onClick={() => setEpochInput("1000000000")}
            />
          </div>
        </div>

        <div className="glass-card rounded-xl p-5">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
            / Date → epoch
          </p>
          <input
            type="datetime-local"
            value={datetimeInput}
            onChange={(e) => setDatetimeInput(e.target.value)}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 mb-3"
          />
          {parsedDatetime && now ? (
            <ul className="space-y-2 font-mono text-code-sm">
              <li className="flex justify-between gap-3">
                <span className="text-on-surface-variant">seconds</span>
                <CopyableValue
                  value={String(Math.floor(parsedDatetime.getTime() / 1000))}
                />
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-on-surface-variant">milliseconds</span>
                <CopyableValue value={String(parsedDatetime.getTime())} />
              </li>
              <li className="flex justify-between gap-3">
                <span className="text-on-surface-variant">ISO 8601</span>
                <CopyableValue value={parsedDatetime.toISOString()} />
              </li>
              <li className="text-on-surface-variant">
                {relative(parsedDatetime, now)}
              </li>
            </ul>
          ) : (
            <p className="font-mono text-code-sm text-tertiary">
              Pick a date and time.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

function ResultRows({
  date,
  tz,
  now,
  note,
}: {
  date: Date;
  tz: string;
  now: Date;
  note?: string;
}) {
  return (
    <ul className="space-y-2 font-mono text-code-sm">
      <li className="flex justify-between gap-3">
        <span className="text-on-surface-variant">in {tz}</span>
        <span className="text-primary text-right">{formatIn(date, tz)}</span>
      </li>
      <li className="flex justify-between gap-3">
        <span className="text-on-surface-variant">local</span>
        <span className="text-on-surface text-right">
          {date.toLocaleString()}
        </span>
      </li>
      <li className="flex justify-between gap-3">
        <span className="text-on-surface-variant">ISO 8601</span>
        <CopyableValue value={date.toISOString()} />
      </li>
      <li className="text-on-surface-variant">{relative(date, now)}</li>
      {note ? <li className="text-tertiary text-[11px]">{note}</li> : null}
    </ul>
  );
}

function CopyableValue({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function onClick() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-right truncate max-w-[70%] transition-colors ${
        copied ? "text-secondary" : "text-on-surface hover:text-primary"
      }`}
      title={copied ? "Copied!" : "Copy"}
    >
      {copied ? "✓ copied" : value}
    </button>
  );
}

function PresetChip({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-1 rounded font-mono text-code-sm bg-white/5 border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/40"
    >
      {label}
    </button>
  );
}
