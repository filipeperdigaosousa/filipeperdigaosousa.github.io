"use client";

import { useEffect, useMemo, useState } from "react";
import CopyButton from "@/components/ui/CopyButton";

const STORAGE_KEY = "tools:leave-planner";
const DAY_MS = 24 * 60 * 60 * 1000;

const LEAVE_COLORS = [
  "#adc6ff",
  "#42e355",
  "#f5c26b",
  "#ff9ab0",
  "#a5f0f5",
  "#c8a5f5",
];

interface Settings {
  weekendDays: number[];
  hoursPerDay: number;
  holidays: string;
}

interface Leave {
  id: string;
  label: string;
  color: string;
  startISO: string;
  amount: number;
  unit: "days" | "hours";
  countWeekends: boolean;
  countHolidays: boolean;
}

interface State {
  settings: Settings;
  leaves: Leave[];
}

const DAYS = [
  { key: 1, label: "Mon" },
  { key: 2, label: "Tue" },
  { key: 3, label: "Wed" },
  { key: 4, label: "Thu" },
  { key: 5, label: "Fri" },
  { key: 6, label: "Sat" },
  { key: 0, label: "Sun" },
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

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

function parseHolidays(input: string): Set<string> {
  const out = new Set<string>();
  for (const line of input.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const m = trimmed.match(/(\d{4}-\d{2}-\d{2})/);
    if (m) out.add(m[1]);
  }
  return out;
}

interface DayEntry {
  iso: string;
  leaveId: string;
  color: string;
  hours: number;
  fraction: number;
  isPartial: boolean;
}

interface LeaveResult {
  leave: Leave;
  endISO: string | null;
  totalHours: number;
  workingDaysUsed: number;
  entries: DayEntry[];
}

function computeLeave(
  leave: Leave,
  settings: Settings,
  holidays: Set<string>,
): LeaveResult {
  const weekend = new Set(settings.weekendDays);
  const hoursPerDay = Math.max(1, settings.hoursPerDay);
  const totalHours =
    leave.unit === "hours" ? leave.amount : leave.amount * hoursPerDay;

  const entries: DayEntry[] = [];
  if (!leave.startISO || totalHours <= 0) {
    return {
      leave,
      endISO: leave.startISO || null,
      totalHours,
      workingDaysUsed: 0,
      entries,
    };
  }

  let remaining = totalHours;
  const cursor = new Date(`${leave.startISO}T00:00:00`);
  let iterations = 0;
  let endISO: string | null = null;
  while (remaining > 0.0001 && iterations < 730) {
    const dow = cursor.getDay();
    const iso = toISO(cursor);
    const isWeekend = weekend.has(dow);
    const isHoliday = holidays.has(iso);
    const skip =
      (isWeekend && !leave.countWeekends) ||
      (isHoliday && !leave.countHolidays);
    if (!skip) {
      const use = Math.min(hoursPerDay, remaining);
      entries.push({
        iso,
        leaveId: leave.id,
        color: leave.color,
        hours: use,
        fraction: use / hoursPerDay,
        isPartial: use < hoursPerDay - 0.0001,
      });
      remaining -= use;
      if (remaining <= 0.0001) endISO = iso;
    }
    cursor.setDate(cursor.getDate() + 1);
    iterations += 1;
  }
  return {
    leave,
    endISO,
    totalHours,
    workingDaysUsed: entries.length,
    entries,
  };
}

function todayISO(): string {
  return toISO(startOfDay(new Date()));
}

function icsDate(iso: string): string {
  return iso.replace(/-/g, "");
}

function foldIcsLine(line: string): string {
  if (line.length <= 74) return line;
  const chunks: string[] = [];
  let rest = line;
  chunks.push(rest.slice(0, 74));
  rest = rest.slice(74);
  while (rest.length > 73) {
    chunks.push(` ${rest.slice(0, 73)}`);
    rest = rest.slice(73);
  }
  if (rest.length > 0) chunks.push(` ${rest}`);
  return chunks.join("\r\n");
}

function icsEscape(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/,/g, "\\,").replace(/;/g, "\\;").replace(/\n/g, "\\n");
}

function addOneDayISO(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + 1);
  return toISO(d);
}

function toICS(results: LeaveResult[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//filipeperdigaosousa.github.io//Leave Planner//EN",
    "CALSCALE:GREGORIAN",
  ];
  for (const r of results) {
    if (!r.leave.startISO || !r.endISO) continue;
    const partials = r.entries.filter((e) => e.isPartial);
    const desc = [
      `${r.totalHours.toFixed(1)}h total`,
      `${r.workingDaysUsed} working day(s)`,
      partials.length
        ? `partial: ${partials.map((p) => `${p.iso} (${p.hours.toFixed(1)}h)`).join("; ")}`
        : "",
    ]
      .filter(Boolean)
      .join(" — ");
    const eventLines = [
      "BEGIN:VEVENT",
      `UID:${r.leave.id}@filipeperdigaosousa.github.io`,
      `DTSTAMP:${icsDate(todayISO())}T000000Z`,
      `DTSTART;VALUE=DATE:${icsDate(r.leave.startISO)}`,
      `DTEND;VALUE=DATE:${icsDate(addOneDayISO(r.endISO))}`,
      `SUMMARY:${icsEscape(r.leave.label)}`,
      `DESCRIPTION:${icsEscape(desc)}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    ];
    for (const l of eventLines) lines.push(foldIcsLine(l));
  }
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

function toCSV(results: LeaveResult[]): string {
  const header = "date,leave,hours,partial";
  const rows: string[] = [header];
  for (const r of results) {
    for (const e of r.entries) {
      const label = r.leave.label.replace(/"/g, '""');
      rows.push(`${e.iso},"${label}",${e.hours.toFixed(2)},${e.isPartial ? "yes" : "no"}`);
    }
  }
  return rows.join("\n");
}

function toMarkdown(results: LeaveResult[]): string {
  const lines: string[] = ["# Leave plan", ""];
  for (const r of results) {
    lines.push(`## ${r.leave.label}`);
    lines.push("");
    lines.push(`- **Start:** ${r.leave.startISO}`);
    lines.push(`- **End:** ${r.endISO ?? "—"}`);
    lines.push(`- **Amount:** ${r.leave.amount} ${r.leave.unit}`);
    lines.push(`- **Total hours:** ${r.totalHours.toFixed(1)}`);
    lines.push(`- **Working days used:** ${r.workingDaysUsed}`);
    const partials = r.entries.filter((e) => e.isPartial);
    if (partials.length) {
      lines.push(
        `- **Partial days:** ${partials.map((p) => `${p.iso} (${p.hours.toFixed(1)}h)`).join(", ")}`,
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function defaultSettings(): Settings {
  return {
    weekendDays: [0, 6],
    hoursPerDay: 8,
    holidays: "",
  };
}

function defaultLeaves(): Leave[] {
  return [
    {
      id: uid(),
      label: "Summer leave",
      color: LEAVE_COLORS[0],
      startISO: todayISO(),
      amount: 10,
      unit: "days",
      countWeekends: false,
      countHolidays: false,
    },
  ];
}

export default function LeavePlannerClient() {
  const [state, setState] = useState<State>({
    settings: defaultSettings(),
    leaves: defaultLeaves(),
  });
  const [month, setMonth] = useState<Date>(() =>
    startOfDay(new Date(new Date().getFullYear(), new Date().getMonth(), 1)),
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<State>;
        setState({
          settings: { ...defaultSettings(), ...(saved.settings ?? {}) },
          leaves: saved.leaves?.length ? saved.leaves : defaultLeaves(),
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const holidays = useMemo(
    () => parseHolidays(state.settings.holidays),
    [state.settings.holidays],
  );

  const results = useMemo(
    () => state.leaves.map((l) => computeLeave(l, state.settings, holidays)),
    [state.leaves, state.settings, holidays],
  );

  const dayMap = useMemo(() => {
    const map = new Map<string, DayEntry[]>();
    for (const r of results) {
      for (const e of r.entries) {
        const list = map.get(e.iso) ?? [];
        list.push(e);
        map.set(e.iso, list);
      }
    }
    return map;
  }, [results]);

  function updateSettings(patch: Partial<Settings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  }

  function toggleWeekend(k: number) {
    setState((s) => {
      const set = new Set(s.settings.weekendDays);
      if (set.has(k)) set.delete(k);
      else set.add(k);
      return {
        ...s,
        settings: { ...s.settings, weekendDays: Array.from(set) },
      };
    });
  }

  function updateLeave(id: string, patch: Partial<Leave>) {
    setState((s) => ({
      ...s,
      leaves: s.leaves.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  }

  function addLeave() {
    setState((s) => ({
      ...s,
      leaves: [
        ...s.leaves,
        {
          id: uid(),
          label: `Leave ${s.leaves.length + 1}`,
          color: LEAVE_COLORS[s.leaves.length % LEAVE_COLORS.length],
          startISO: todayISO(),
          amount: 5,
          unit: "days",
          countWeekends: false,
          countHolidays: false,
        },
      ],
    }));
  }

  function removeLeave(id: string) {
    setState((s) => ({ ...s, leaves: s.leaves.filter((l) => l.id !== id) }));
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Settings
          </p>
          <p className="font-mono text-code-sm text-tertiary">
            {results.length} plan{results.length === 1 ? "" : "s"}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1.5">
            Non-working days (won't consume leave)
          </p>
          <div className="flex flex-wrap gap-2">
            {DAYS.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => toggleWeekend(d.key)}
                className={`px-3 py-1.5 rounded-lg border font-mono text-code-sm ${
                  state.settings.weekendDays.includes(d.key)
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-white/10 bg-white/5 text-on-surface-variant hover:text-primary"
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Hours per workday
            </span>
            <input
              type="number"
              min={1}
              max={24}
              value={state.settings.hoursPerDay}
              onChange={(e) =>
                updateSettings({
                  hoursPerDay: Math.max(1, Math.min(24, Number(e.target.value) || 8)),
                })
              }
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
            />
          </label>
          <label className="block">
            <span className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
              Public holidays (YYYY-MM-DD per line)
            </span>
            <textarea
              value={state.settings.holidays}
              onChange={(e) => updateSettings({ holidays: e.target.value })}
              rows={3}
              spellCheck={false}
              placeholder={`# example\n2026-12-25`}
              className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
            />
          </label>
        </div>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Leave periods
          </h3>
          <button
            type="button"
            onClick={addLeave}
            className="font-mono text-code-sm text-primary hover:underline"
          >
            + add leave
          </button>
        </div>
        {results.map((r) => (
          <LeaveCard
            key={r.leave.id}
            result={r}
            onChange={(patch) => updateLeave(r.leave.id, patch)}
            onRemove={
              state.leaves.length > 1 ? () => removeLeave(r.leave.id) : undefined
            }
            hoursPerDay={state.settings.hoursPerDay}
          />
        ))}
      </section>

      <section>
        <MonthCalendar
          month={month}
          setMonth={setMonth}
          dayMap={dayMap}
          weekend={new Set(state.settings.weekendDays)}
          holidays={holidays}
          leaves={state.leaves}
        />
      </section>

      <ExportSection results={results} />
    </div>
  );
}

function ExportSection({ results }: { results: LeaveResult[] }) {
  const usable = results.filter((r) => r.leave.startISO && r.endISO);
  const ics = useMemo(() => toICS(usable), [usable]);
  const csv = useMemo(() => toCSV(usable), [usable]);
  const md = useMemo(() => toMarkdown(usable), [usable]);
  const disabled = usable.length === 0;

  return (
    <section className="glass-card rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="font-mono text-label-caps text-secondary uppercase tracking-widest">
          / Export
        </p>
        <p className="font-mono text-code-sm text-tertiary">
          {usable.length} plan{usable.length === 1 ? "" : "s"} · nothing sent anywhere
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ExportCard
          format="ICS"
          hint="import into Google/Outlook/Apple Calendar"
          onDownload={() => downloadFile("leave-plan.ics", ics, "text/calendar")}
          copyValue={ics}
          disabled={disabled}
        />
        <ExportCard
          format="CSV"
          hint="one row per day of leave — for spreadsheets"
          onDownload={() => downloadFile("leave-plan.csv", csv, "text/csv")}
          copyValue={csv}
          disabled={disabled}
        />
        <ExportCard
          format="Markdown"
          hint="drop into Notion, Slack, docs"
          onDownload={() => downloadFile("leave-plan.md", md, "text/markdown")}
          copyValue={md}
          disabled={disabled}
        />
      </div>
    </section>
  );
}

function ExportCard({
  format,
  hint,
  onDownload,
  copyValue,
  disabled,
}: {
  format: string;
  hint: string;
  onDownload: () => void;
  copyValue: string;
  disabled: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col gap-3">
      <div>
        <p className="font-mono text-headline-md text-primary">{format}</p>
        <p className="font-mono text-code-sm text-on-surface-variant/85 mt-1">
          {hint}
        </p>
      </div>
      <div className="flex items-center gap-2 mt-auto">
        <button
          type="button"
          onClick={onDownload}
          disabled={disabled}
          className="flex-1 px-3 py-2 rounded-lg border border-primary/40 bg-primary/10 text-primary font-mono text-code-sm hover:bg-primary/20 disabled:opacity-40 inline-flex items-center justify-center gap-1"
        >
          <span className="material-symbols-outlined text-base">download</span>
          download
        </button>
        <CopyButton value={disabled ? "" : copyValue} variant="chip" />
      </div>
    </div>
  );
}

function LeaveCard({
  result,
  onChange,
  onRemove,
  hoursPerDay,
}: {
  result: LeaveResult;
  onChange: (patch: Partial<Leave>) => void;
  onRemove?: () => void;
  hoursPerDay: number;
}) {
  const { leave, endISO, workingDaysUsed, totalHours } = result;
  const daysEquivalent = totalHours / Math.max(1, hoursPerDay);
  return (
    <div
      className="glass-card rounded-xl p-5 space-y-3"
      style={{ borderLeft: `4px solid ${leave.color}` }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <input
          type="color"
          value={leave.color}
          onChange={(e) => onChange({ color: e.target.value })}
          className="w-8 h-8 rounded-md cursor-pointer bg-transparent border border-white/10"
          aria-label="Colour"
        />
        <input
          type="text"
          value={leave.label}
          onChange={(e) => onChange({ label: e.target.value })}
          className="flex-1 min-w-40 bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-primary focus:outline-none focus:border-primary/50"
        />
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            className="text-tertiary hover:text-primary p-2"
            aria-label="Remove leave"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        ) : null}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] gap-3 items-end">
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Start date
          </span>
          <input
            type="date"
            value={leave.startISO}
            onChange={(e) => onChange({ startISO: e.target.value })}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          />
        </label>
        <label className="block">
          <span className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
            Amount
          </span>
          <input
            type="number"
            min={0}
            step={leave.unit === "hours" ? 1 : 0.5}
            value={leave.amount}
            onChange={(e) =>
              onChange({ amount: Math.max(0, Number(e.target.value) || 0) })
            }
            className="w-28 bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-primary focus:outline-none focus:border-primary/50"
          />
        </label>
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
          {(["days", "hours"] as const).map((u) => (
            <button
              key={u}
              type="button"
              onClick={() => onChange({ unit: u })}
              className={`px-3 py-1.5 rounded-md font-mono text-code-sm capitalize ${
                leave.unit === u
                  ? "bg-primary/20 text-primary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <label className="inline-flex items-center gap-2 font-mono text-code-sm text-tertiary cursor-pointer">
          <input
            type="checkbox"
            checked={leave.countWeekends}
            onChange={(e) => onChange({ countWeekends: e.target.checked })}
            className="accent-primary"
          />
          count weekends
        </label>
        <label className="inline-flex items-center gap-2 font-mono text-code-sm text-tertiary cursor-pointer">
          <input
            type="checkbox"
            checked={leave.countHolidays}
            onChange={(e) => onChange({ countHolidays: e.target.checked })}
            className="accent-primary"
          />
          count holidays
        </label>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-3 border-t border-white/5">
        <ResultRow label="End date" value={endISO ?? "—"} highlight />
        <ResultRow
          label="Working days used"
          value={workingDaysUsed.toString()}
        />
        <ResultRow label="Total hours" value={totalHours.toFixed(1)} />
        <ResultRow
          label="≈ full days"
          value={daysEquivalent.toFixed(daysEquivalent % 1 === 0 ? 0 : 1)}
        />
      </div>
    </div>
  );
}

function ResultRow({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">
        {label}
      </p>
      <p
        className={`font-mono text-code-sm ${
          highlight ? "text-primary" : "text-on-surface"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function MonthCalendar({
  month,
  setMonth,
  dayMap,
  weekend,
  holidays,
  leaves,
}: {
  month: Date;
  setMonth: (d: Date) => void;
  dayMap: Map<string, DayEntry[]>;
  weekend: Set<number>;
  holidays: Set<string>;
  leaves: Leave[];
}) {
  const firstOfMonth = new Date(month);
  const firstWeekday = (firstOfMonth.getDay() + 6) % 7;
  const daysInMonth = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0,
  ).getDate();

  const cells: (Date | null)[] = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const todayIso = todayISO();
  const monthLabel = month.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="glass-card rounded-xl p-5">
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
            className="p-1.5 rounded-lg border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/40"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined text-base">
              chevron_left
            </span>
          </button>
          <p className="font-mono text-headline-md text-primary min-w-40 text-center">
            {monthLabel}
          </p>
          <button
            type="button"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
            className="p-1.5 rounded-lg border border-white/10 text-on-surface-variant hover:text-primary hover:border-primary/40"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined text-base">
              chevron_right
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
            }}
            className="ml-2 font-mono text-code-sm text-tertiary hover:text-primary"
          >
            today
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {leaves.map((l) => (
            <span
              key={l.id}
              className="inline-flex items-center gap-2 font-mono text-code-sm text-on-surface-variant"
            >
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: l.color }}
              />
              {l.label}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 font-mono text-[10px] uppercase tracking-widest text-tertiary mb-1">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="text-center py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (!c) return <div key={i} className="min-h-16" />;
          const iso = toISO(c);
          const dow = c.getDay();
          const isWeekend = weekend.has(dow);
          const isHoliday = holidays.has(iso);
          const isToday = iso === todayIso;
          const entries = dayMap.get(iso) ?? [];
          return (
            <div
              key={iso}
              className={`min-h-16 rounded-lg p-1.5 border font-mono flex flex-col gap-1 ${
                isToday
                  ? "border-primary/60 bg-primary/5"
                  : isWeekend
                    ? "border-white/5 bg-white/[0.02]"
                    : "border-white/10 bg-white/[0.03]"
              }`}
            >
              <div className="flex items-center justify-between text-[10px]">
                <span
                  className={
                    isWeekend
                      ? "text-tertiary"
                      : isToday
                        ? "text-primary"
                        : "text-on-surface"
                  }
                >
                  {c.getDate()}
                </span>
                {isHoliday ? (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-[#ff6b6b]"
                    title="Holiday"
                  />
                ) : null}
              </div>
              <div className="flex flex-col gap-0.5 min-h-2">
                {entries.map((e, j) => (
                  <div
                    key={j}
                    className="h-1.5 rounded-full"
                    style={{
                      background: e.color,
                      width: `${Math.max(20, e.fraction * 100)}%`,
                      opacity: e.isPartial ? 0.6 : 1,
                    }}
                    title={`${e.hours.toFixed(1)}h${e.isPartial ? " (partial)" : ""}`}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
