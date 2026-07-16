"use client";

import { useMemo, useState } from "react";

const CURRENCIES = [
  { code: "EUR", symbol: "€" },
  { code: "USD", symbol: "$" },
  { code: "GBP", symbol: "£" },
];

const HOURS_PER_YEAR = 1800;

function formatCurrency(value: number, code: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 0,
    }).format(Math.round(value));
  } catch {
    return `${code} ${Math.round(value)}`;
  }
}

function formatInt(value: number): string {
  try {
    return new Intl.NumberFormat().format(value);
  } catch {
    return String(value);
  }
}

export default function MeetingCostClient() {
  const [people, setPeople] = useState(6);
  const [minutes, setMinutes] = useState(30);
  const [salary, setSalary] = useState(90000);
  const [currency, setCurrency] = useState(CURRENCIES[0]);
  const [overheadPct, setOverheadPct] = useState(30);
  const [perWeek, setPerWeek] = useState(1);

  const hourlyBase = salary / HOURS_PER_YEAR;
  const hourly = hourlyBase * (1 + overheadPct / 100);
  const cost = useMemo(
    () => (hourly * minutes * people) / 60,
    [hourly, minutes, people],
  );

  const perHour = cost * (60 / minutes);
  const weekly = cost * perWeek;
  const yearly = weekly * 52;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <Slider
          label="Headcount"
          value={people}
          min={1}
          max={40}
          onChange={setPeople}
          suffix=" people"
        />
        <Slider
          label="Duration"
          value={minutes}
          min={5}
          max={240}
          step={5}
          onChange={setMinutes}
          suffix=" min"
        />
        <div className="glass-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              / Avg. yearly salary
            </p>
            <select
              value={currency.code}
              onChange={(e) =>
                setCurrency(
                  CURRENCIES.find((c) => c.code === e.target.value) ??
                    CURRENCIES[0],
                )
              }
              className="bg-black/30 border border-white/10 rounded p-1 font-mono text-code-sm text-on-surface"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
          <input
            type="number"
            min={0}
            step={1000}
            value={salary}
            onChange={(e) => setSalary(Math.max(0, Number(e.target.value) || 0))}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-headline-md text-primary focus:outline-none focus:border-primary/50"
          />
          <p className="font-mono text-[10px] text-tertiary mt-2">
            Assumes {HOURS_PER_YEAR} billable hours / year.
          </p>
        </div>
        <Slider
          label="Overhead (benefits, taxes, tools)"
          value={overheadPct}
          min={0}
          max={100}
          onChange={setOverheadPct}
          suffix="%"
        />
        <Slider
          label="Recurrence"
          value={perWeek}
          min={0}
          max={10}
          onChange={setPerWeek}
          suffix={perWeek === 1 ? "×/week" : "×/week"}
        />
      </div>

      <div className="glass-card rounded-xl p-6 border border-primary/40 bg-primary/5">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
          / Cost of this meeting
        </p>
        <p className="font-mono text-[64px] leading-none text-primary">
          {formatCurrency(cost, currency.code)}
        </p>
        <p className="font-mono text-code-sm text-on-surface-variant mt-2">
          ~ {formatCurrency(hourly, currency.code)}/hr per person · {formatInt(people)} × {formatInt(minutes)}min
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
        <StatTile
          label="Normalized to 1h"
          value={formatCurrency(perHour, currency.code)}
          hint="same room, 60min"
        />
        <StatTile
          label={`Weekly (${perWeek}×/wk)`}
          value={formatCurrency(weekly, currency.code)}
          hint={
            perWeek === 0
              ? "not recurring"
              : `${formatInt(perWeek)} occurrence${perWeek === 1 ? "" : "s"}`
          }
        />
        <StatTile
          label="Yearly"
          value={formatCurrency(yearly, currency.code)}
          hint={
            perWeek === 0
              ? "0 recurrences"
              : `${formatInt(perWeek * 52)} occurrences`
          }
        />
      </div>

      <div className="glass-card rounded-xl p-5">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3">
          / Would you rather
        </p>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-code-sm text-on-surface/85">
          <li className="p-3 rounded-lg bg-white/5 border border-white/5">
            Async post + written comments
          </li>
          {people > 3 ? (
            <li className="p-3 rounded-lg bg-white/5 border border-white/5">
              15-min sync with 3 people, not {people}
            </li>
          ) : minutes > 15 ? (
            <li className="p-3 rounded-lg bg-white/5 border border-white/5">
              15-min sync instead of {minutes}
            </li>
          ) : (
            <li className="p-3 rounded-lg bg-white/5 border border-white/5">
              Written decision doc, no sync
            </li>
          )}
          <li className="p-3 rounded-lg bg-white/5 border border-white/5">
            Loom + follow-up thread
          </li>
          <li className="p-3 rounded-lg bg-white/5 border border-white/5">
            Skip it — nobody dies
          </li>
        </ul>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  suffix,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  suffix?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
          / {label}
        </p>
        <p className="font-mono text-headline-md text-primary">
          {value}
          {suffix ?? ""}
        </p>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-primary"
      />
      <div className="flex justify-between font-mono text-[10px] text-tertiary uppercase tracking-widest mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="glass-card rounded-xl p-4">
      <p className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </p>
      <p className="font-mono text-headline-md text-primary">{value}</p>
      {hint ? (
        <p className="font-mono text-[10px] text-tertiary mt-1">{hint}</p>
      ) : null}
    </div>
  );
}
