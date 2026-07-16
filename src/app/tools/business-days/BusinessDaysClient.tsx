"use client";

import { useMemo, useState } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

interface DayName {
  key: number;
  label: string;
}

const DAYS: DayName[] = [
  { key: 1, label: "Mon" },
  { key: 2, label: "Tue" },
  { key: 3, label: "Wed" },
  { key: 4, label: "Thu" },
  { key: 5, label: "Fri" },
  { key: 6, label: "Sat" },
  { key: 0, label: "Sun" },
];

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

function parseHolidayList(input: string): Set<string> {
  const out = new Set<string>();
  for (const line of input.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) out.add(m[1]);
  }
  return out;
}

function todayISO(): string {
  const d = startOfDay(new Date());
  return toISO(d);
}

function addDaysISO(iso: string, n: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + n);
  return toISO(d);
}

interface Result {
  totalDays: number;
  weekdays: number;
  weekends: number;
  holidays: number;
  business: number;
}

function compute(
  startISO: string,
  endISO: string,
  weekendKeys: Set<number>,
  holidays: Set<string>,
): Result | null {
  if (!startISO || !endISO) return null;
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  const [lo, hi] = start <= end ? [start, end] : [end, start];
  let cursor = new Date(lo);
  let totalDays = 0;
  let weekdays = 0;
  let weekends = 0;
  let holidaysCount = 0;
  let business = 0;
  while (cursor.getTime() <= hi.getTime()) {
    totalDays += 1;
    const dow = cursor.getDay();
    const iso = toISO(cursor);
    const isWeekend = weekendKeys.has(dow);
    const isHoliday = holidays.has(iso);
    if (isWeekend) weekends += 1;
    else weekdays += 1;
    if (isHoliday && !isWeekend) holidaysCount += 1;
    if (!isWeekend && !isHoliday) business += 1;
    cursor = new Date(cursor.getTime() + DAY_MS);
  }
  return {
    totalDays,
    weekdays,
    weekends,
    holidays: holidaysCount,
    business,
  };
}

export default function BusinessDaysClient() {
  const today = todayISO();
  const [start, setStart] = useState(today);
  const [end, setEnd] = useState(addDaysISO(today, 30));
  const [weekend, setWeekend] = useState<Set<number>>(new Set([0, 6]));
  const [holidayInput, setHolidayInput] = useState("");

  const holidays = useMemo(() => parseHolidayList(holidayInput), [holidayInput]);
  const result = useMemo(
    () => compute(start, end, weekend, holidays),
    [start, end, weekend, holidays],
  );

  function toggleWeekend(k: number) {
    setWeekend((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k);
      else next.add(k);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
        <DateField label="Start" value={start} onChange={setStart} />
        <DateField label="End" value={end} onChange={setEnd} />
      </div>

      <div className="glass-card rounded-xl p-4">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
          / Weekend days
        </p>
        <div className="flex flex-wrap gap-2">
          {DAYS.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => toggleWeekend(d.key)}
              className={`px-3 py-1.5 rounded-lg border font-mono text-code-sm ${
                weekend.has(d.key)
                  ? "border-primary/60 bg-primary/10 text-primary"
                  : "border-white/10 bg-white/5 text-on-surface-variant hover:text-primary"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-xl p-4">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
          / Holidays (YYYY-MM-DD per line, # for comments)
        </p>
        <textarea
          value={holidayInput}
          onChange={(e) => setHolidayInput(e.target.value)}
          rows={5}
          spellCheck={false}
          placeholder={`# Portugal 2026\n2026-12-25\n2026-12-26`}
          className="w-full bg-black/30 border border-white/10 rounded-lg p-3 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
        />
      </div>

      {result ? (
        <>
          <div className="glass-card rounded-xl p-6 border border-primary/40 bg-primary/5">
            <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
              / Business days
            </p>
            <p className="font-mono text-[64px] leading-none text-primary">
              {result.business}
            </p>
            <p className="font-mono text-code-sm text-on-surface-variant mt-2">
              between {start} and {end}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
            <StatTile label="Total days" value={result.totalDays.toString()} />
            <StatTile label="Weekdays" value={result.weekdays.toString()} />
            <StatTile label="Weekend days" value={result.weekends.toString()} />
            <StatTile label="Holidays" value={result.holidays.toString()} />
          </div>
        </>
      ) : (
        <p className="font-mono text-code-sm text-tertiary">Pick valid dates.</p>
      )}
    </div>
  );
}

function DateField({
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
      <p className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-2">
        / {label}
      </p>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-headline-md text-primary focus:outline-none focus:border-primary/50"
      />
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
