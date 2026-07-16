"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CopyButton from "@/components/ui/CopyButton";

const STORAGE_KEY = "tools:cycle-doc";
const VIEW_KEY = "tools:cycle-view";

type ViewMode = "preview" | "source" | "split";

type Status = "Uphill" | "Downhill" | "Closed";

interface Scope {
  id: string;
  name: string;
  code: string;
  epicLink: string;
  status: Status;
  goal: string;
  userFlow: string;
  dependencies: string;
  dod: string;
  risks: string;
}

interface Decision {
  id: string;
  date: string;
  scopes: string;
  owner: string;
  body: string;
}

interface Doc {
  title: string;
  weeks: number;
  scopes: Scope[];
  decisions: Decision[];
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function emptyScope(letter: string): Scope {
  return {
    id: uid(),
    name: `Scope ${letter}`,
    code: `SCOPE ${letter}`,
    epicLink: "",
    status: "Uphill",
    goal: "",
    userFlow: "",
    dependencies: "",
    dod: "",
    risks: "",
  };
}

function emptyDecision(): Decision {
  return {
    id: uid(),
    date: "",
    scopes: "",
    owner: "",
    body: "",
  };
}

const DEFAULT_DOC: Doc = {
  title: "Cycle 01",
  weeks: 6,
  scopes: [emptyScope("A"), emptyScope("B")],
  decisions: [],
};

function bulletsFrom(input: string): string[] {
  return input
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function renderList(items: string[], placeholder: string): string {
  if (!items.length) return `- ${placeholder}`;
  return items.map((i) => `- ${i}`).join("\n");
}

function renderNumbered(items: string[], placeholder: string): string {
  if (!items.length) return `1. ${placeholder}`;
  return items.map((i, idx) => `${idx + 1}. ${i}`).join("\n");
}

function renderScope(s: Scope): string {
  const flow = renderNumbered(bulletsFrom(s.userFlow), "<TBD>");
  const deps = renderList(bulletsFrom(s.dependencies), "<TBD>");
  const dod = renderList(bulletsFrom(s.dod), "<TBD>");
  const risks = renderList(bulletsFrom(s.risks), "<TBD>");

  return `- **${s.name} (\`${s.code}\`)**

    #### Goal

    ${s.goal || "<TBD>"}

    #### User Flow

    ${flow.split("\n").join("\n    ")}

    #### Dependencies

    ${deps.split("\n").join("\n    ")}

    #### Definition of Done

    ${dod.split("\n").join("\n    ")}

    #### Risks / Unknowns & Open Questions

    ${risks.split("\n").join("\n    ")}

---`;
}

function renderTemplateBlock(): string {
  return `- 🧱 Template

    #### Goal

    <TBD>

    #### User Flow

    1. <TBD>
    2. <TBD>

    #### Dependencies

    - <TBD>

    #### Definition of Done

    <TBD>

    #### Risks / Unknowns & Open Questions

    - <TBD>`;
}

function renderControlPanel(scopes: Scope[]): string {
  const rows = scopes.length
    ? scopes
        .map(
          (s) =>
            `| **\`${s.code}\`** | **\`${s.status}\`** | ${
              s.epicLink ? `[Epic](${s.epicLink})` : "<Github Link>"
            } |`,
        )
        .join("\n")
    : "| **`SCOPE A`** | **`Uphill`** | <Github Link> |";
  return `| **Scope** | **Status** | **Epic** |
| --- | --- | --- |
${rows}`;
}

function renderDecisionLog(decisions: Decision[]): string {
  if (!decisions.length) {
    return `| **Date** | **Scope(s)** | **Decision** |
| --- | --- | --- |
| **<DATE>** | **\`SCOPE A\`** | (Owner @person) <TBD> |`;
  }
  const rows = decisions
    .map((d) => {
      const owner = d.owner ? `(Owner: ${d.owner}) ` : "";
      const body = d.body.replace(/\n+/g, "<br>");
      return `| **${d.date || "<DATE>"}** | **\`${
        d.scopes || "<SCOPE>"
      }\`** | ${owner}${body || "<TBD>"} |`;
    })
    .join("\n");
  return `| **Date** | **Scope(s)** | **Decision** |
| --- | --- | --- |
${rows}`;
}

function renderProgressReview(scopes: Scope[], weeks: number): string {
  const list: string[] = [];
  for (let w = 1; w <= weeks; w++) {
    list.push(`- Week ${w}`);
    for (const s of scopes) {
      list.push(`    - **\`${s.code}\`**`);
      list.push(`        - <Details>`);
    }
  }
  return list.join("\n");
}

function renderRoadBlocks(weeks: number): string {
  const list: string[] = [];
  for (let w = 1; w <= weeks; w++) {
    list.push(`- [Week ${w}]: <Details>`);
  }
  return list.join("\n");
}

function renderConfidence(weeks: number): string {
  const list: string[] = [];
  for (let w = 1; w <= weeks; w++) {
    list.push(`- Week ${w}:`);
  }
  return list.join("\n");
}

function renderDoc(doc: Doc): string {
  const scopeBlocks = doc.scopes.map(renderScope).join("\n\n");
  return `# ${doc.title}

# **Scopes**

${scopeBlocks}

${renderTemplateBlock()}

# 🚦Control Panel

${renderControlPanel(doc.scopes)}

# 🎗️ Decision Log

${renderDecisionLog(doc.decisions)}

# 💪 Progress Review

*[List of high-level work completed - organised by scope]*

${renderProgressReview(doc.scopes, doc.weeks)}

# 🚧 Road Blocks

*[List any issues, side-quests, unexpected work, blockers, or relevant details that have affected the cycle's delivery - e.g. Week 2: CI Down causing delays in merging code]*

${renderRoadBlocks(doc.weeks)}

# 🎯 Confidence Level

*[Define a value between 1 and 10 that signifies the confidence that we will ship on target - the ideal confidence value is something that trends upward as the weeks go by]*

${renderConfidence(doc.weeks)}
`;
}

function nextLetter(scopes: Scope[]): string {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  for (const ch of letters) {
    if (!scopes.some((s) => s.code.endsWith(ch))) return ch;
  }
  return String(scopes.length + 1);
}

function slugify(s: string): string {
  return (
    s
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "cycle"
  );
}

export default function CycleClient() {
  const [doc, setDoc] = useState<Doc>(DEFAULT_DOC);
  const [view, setView] = useState<ViewMode>("preview");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setDoc({ ...DEFAULT_DOC, ...JSON.parse(raw) });
      const v = localStorage.getItem(VIEW_KEY) as ViewMode | null;
      if (v === "preview" || v === "source" || v === "split") setView(v);
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {}
  }, [doc]);

  useEffect(() => {
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch {}
  }, [view]);

  const markdown = useMemo(() => renderDoc(doc), [doc]);

  function updateScope(id: string, patch: Partial<Scope>) {
    setDoc((d) => ({
      ...d,
      scopes: d.scopes.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    }));
  }

  function addScope() {
    setDoc((d) => ({ ...d, scopes: [...d.scopes, emptyScope(nextLetter(d.scopes))] }));
  }

  function removeScope(id: string) {
    setDoc((d) => ({ ...d, scopes: d.scopes.filter((s) => s.id !== id) }));
  }

  function updateDecision(id: string, patch: Partial<Decision>) {
    setDoc((d) => ({
      ...d,
      decisions: d.decisions.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    }));
  }

  function addDecision() {
    setDoc((d) => ({ ...d, decisions: [...d.decisions, emptyDecision()] }));
  }

  function removeDecision(id: string) {
    setDoc((d) => ({ ...d, decisions: d.decisions.filter((x) => x.id !== id) }));
  }

  function download() {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${slugify(doc.title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setDoc(DEFAULT_DOC);
  }

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-xl p-5 grid grid-cols-1 md:grid-cols-[1fr_140px] gap-4">
        <Field label="Cycle title">
          <input
            type="text"
            value={doc.title}
            onChange={(e) => setDoc((d) => ({ ...d, title: e.target.value }))}
            placeholder="Cycle 01"
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          />
        </Field>
        <Field label="Weeks">
          <input
            type="number"
            min={1}
            max={12}
            value={doc.weeks}
            onChange={(e) =>
              setDoc((d) => ({
                ...d,
                weeks: Math.max(1, Math.min(12, Number(e.target.value) || 1)),
              }))
            }
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          />
        </Field>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Scopes
          </h3>
          <button
            type="button"
            onClick={addScope}
            className="font-mono text-code-sm text-primary hover:underline"
          >
            + add scope
          </button>
        </div>
        {doc.scopes.map((s) => (
          <ScopeEditor
            key={s.id}
            scope={s}
            onChange={(patch) => updateScope(s.id, patch)}
            onRemove={() => removeScope(s.id)}
          />
        ))}
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Decision log
          </h3>
          <button
            type="button"
            onClick={addDecision}
            className="font-mono text-code-sm text-primary hover:underline"
          >
            + add decision
          </button>
        </div>
        {doc.decisions.length === 0 ? (
          <p className="font-mono text-code-sm text-tertiary">
            No decisions yet. Template row will show in output.
          </p>
        ) : (
          doc.decisions.map((d) => (
            <DecisionEditor
              key={d.id}
              decision={d}
              onChange={(patch) => updateDecision(d.id, patch)}
              onRemove={() => removeDecision(d.id)}
            />
          ))
        )}
      </section>

      <section>
        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              / Output
            </h3>
            <ViewToggle value={view} onChange={setView} />
          </div>
          <div className="flex items-center gap-3">
            <CopyButton value={markdown} />
            <span className="text-tertiary">·</span>
            <button
              type="button"
              onClick={reset}
              className="font-mono text-code-sm text-tertiary hover:text-primary"
            >
              reset
            </button>
            <button
              type="button"
              onClick={download}
              className="px-4 py-2 rounded-lg bg-primary/15 border border-primary/40 text-primary font-mono text-code-sm hover:bg-primary/25 transition-colors inline-flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-base">download</span>
              download .md
            </button>
          </div>
        </div>
        <OutputPanes view={view} markdown={markdown} />
      </section>
    </div>
  );
}

function ViewToggle({
  value,
  onChange,
}: {
  value: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const items: { key: ViewMode; label: string; icon: string }[] = [
    { key: "preview", label: "Rendered", icon: "visibility" },
    { key: "source", label: "Source", icon: "code" },
    { key: "split", label: "Split", icon: "vertical_split" },
  ];
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-0.5">
      {items.map((it) => {
        const active = value === it.key;
        return (
          <button
            key={it.key}
            type="button"
            onClick={() => onChange(it.key)}
            className={`px-3 py-1 rounded-md font-mono text-code-sm inline-flex items-center gap-1.5 transition-colors ${
              active
                ? "bg-primary/20 text-primary"
                : "text-on-surface-variant hover:text-on-surface"
            } ${it.key === "split" ? "hidden md:inline-flex" : ""}`}
            aria-pressed={active}
          >
            <span className="material-symbols-outlined text-base">{it.icon}</span>
            {it.label}
          </button>
        );
      })}
    </div>
  );
}

function OutputPanes({
  view,
  markdown,
}: {
  view: ViewMode;
  markdown: string;
}) {
  if (view === "split") {
    return (
      <div className="hidden md:grid grid-cols-2 gap-3">
        <SourcePane markdown={markdown} />
        <RenderedPane markdown={markdown} />
      </div>
    );
  }
  if (view === "source") return <SourcePane markdown={markdown} />;
  return <RenderedPane markdown={markdown} />;
}

function SourcePane({ markdown }: { markdown: string }) {
  return (
    <pre className="glass-card rounded-xl p-4 font-mono text-code-sm text-on-surface bg-black/30 overflow-x-auto max-h-[600px] overflow-y-auto whitespace-pre-wrap break-words min-w-0">
      {markdown}
    </pre>
  );
}

function RenderedPane({ markdown }: { markdown: string }) {
  return (
    <div className="glass-card rounded-xl p-6 bg-black/20 overflow-x-auto max-h-[600px] overflow-y-auto min-w-0">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}

const mdComponents = {
  h1: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className="font-mono text-headline-lg text-primary mt-6 first:mt-0 mb-3 border-b border-white/10 pb-2"
      {...p}
    />
  ),
  h2: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="font-mono text-headline-md text-primary mt-5 mb-2" {...p} />
  ),
  h3: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="font-mono text-code-sm text-secondary uppercase tracking-widest mt-4 mb-1" {...p} />
  ),
  h4: (p: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h4 className="font-mono text-[10px] text-secondary uppercase tracking-widest mt-3 mb-1" {...p} />
  ),
  p: (p: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-body-md text-on-surface/85 leading-relaxed my-2" {...p} />
  ),
  ul: (p: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc pl-5 space-y-1 my-2 text-body-md text-on-surface/85" {...p} />
  ),
  ol: (p: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal pl-5 space-y-1 my-2 text-body-md text-on-surface/85" {...p} />
  ),
  li: (p: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="marker:text-primary/60" {...p} />
  ),
  code: (p: React.HTMLAttributes<HTMLElement>) => (
    <code
      className="font-mono text-code-sm bg-white/5 px-1.5 py-0.5 rounded text-primary"
      {...p}
    />
  ),
  hr: () => <hr className="my-4 border-white/10" />,
  a: (p: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="text-primary underline hover:text-primary/80"
      target="_blank"
      rel="noreferrer"
      {...p}
    />
  ),
  table: (p: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="overflow-x-auto my-3">
      <table className="w-full text-body-md border-collapse" {...p} />
    </div>
  ),
  th: (p: React.ThHTMLAttributes<HTMLTableCellElement>) => (
    <th
      className="text-left font-mono text-[10px] uppercase tracking-widest text-secondary border-b border-white/10 pb-2 pr-3 align-bottom"
      {...p}
    />
  ),
  td: (p: React.TdHTMLAttributes<HTMLTableCellElement>) => (
    <td
      className="py-2 pr-3 border-b border-white/5 text-on-surface/85 align-top"
      {...p}
    />
  ),
  blockquote: (p: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote
      className="border-l-2 border-primary/40 pl-3 my-3 text-on-surface-variant italic"
      {...p}
    />
  ),
  strong: (p: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-on-surface font-semibold" {...p} />
  ),
  em: (p: React.HTMLAttributes<HTMLElement>) => (
    <em className="text-on-surface-variant italic" {...p} />
  ),
  input: (p: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...p} className="accent-primary mr-2" />
  ),
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block font-mono text-[10px] uppercase tracking-widest text-on-surface-variant mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

const STATUSES: Status[] = ["Uphill", "Downhill", "Closed"];

function ScopeEditor({
  scope,
  onChange,
  onRemove,
}: {
  scope: Scope;
  onChange: (patch: Partial<Scope>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_160px_140px_auto] gap-3">
        <Field label="Name">
          <input
            type="text"
            value={scope.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          />
        </Field>
        <Field label="Code">
          <input
            type="text"
            value={scope.code}
            onChange={(e) => onChange({ code: e.target.value })}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-primary focus:outline-none focus:border-primary/50"
          />
        </Field>
        <Field label="Status">
          <select
            value={scope.status}
            onChange={(e) => onChange({ status: e.target.value as Status })}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            onClick={onRemove}
            className="font-mono text-code-sm text-tertiary hover:text-primary p-2"
            aria-label="Remove scope"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>

      <Field label="Epic link">
        <input
          type="url"
          value={scope.epicLink}
          onChange={(e) => onChange({ epicLink: e.target.value })}
          placeholder="https://github.com/org/repo/issues/123"
          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
        />
      </Field>

      <Field label="Goal">
        <textarea
          value={scope.goal}
          onChange={(e) => onChange({ goal: e.target.value })}
          rows={2}
          placeholder="We want to do X"
          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
        />
      </Field>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Field label="User flow (one per line)">
          <textarea
            value={scope.userFlow}
            onChange={(e) => onChange({ userFlow: e.target.value })}
            rows={4}
            placeholder={"Open Screen Y\nFill the form\nSuccess"}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
          />
        </Field>
        <Field label="Dependencies (one per line)">
          <textarea
            value={scope.dependencies}
            onChange={(e) => onChange({ dependencies: e.target.value })}
            rows={4}
            placeholder="Need X service deployed first"
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
          />
        </Field>
        <Field label="Definition of done (one per line)">
          <textarea
            value={scope.dod}
            onChange={(e) => onChange({ dod: e.target.value })}
            rows={4}
            placeholder={"Forms saved in DB\nUser never sees error"}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
          />
        </Field>
        <Field label="Risks / open questions (one per line)">
          <textarea
            value={scope.risks}
            onChange={(e) => onChange({ risks: e.target.value })}
            rows={4}
            placeholder="Pre-fill the form?"
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
          />
        </Field>
      </div>
    </div>
  );
}

function DecisionEditor({
  decision,
  onChange,
  onRemove,
}: {
  decision: Decision;
  onChange: (patch: Partial<Decision>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="glass-card rounded-xl p-5 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr_1fr_auto] gap-3">
        <Field label="Date">
          <input
            type="date"
            value={decision.date}
            onChange={(e) => onChange({ date: e.target.value })}
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          />
        </Field>
        <Field label="Scope(s)">
          <input
            type="text"
            value={decision.scopes}
            onChange={(e) => onChange({ scopes: e.target.value })}
            placeholder="SCOPE A, SCOPE B"
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          />
        </Field>
        <Field label="Owner">
          <input
            type="text"
            value={decision.owner}
            onChange={(e) => onChange({ owner: e.target.value })}
            placeholder="@person"
            className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50"
          />
        </Field>
        <div className="flex items-end">
          <button
            type="button"
            onClick={onRemove}
            className="font-mono text-code-sm text-tertiary hover:text-primary p-2"
            aria-label="Remove decision"
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        </div>
      </div>
      <Field label="Decision">
        <textarea
          value={decision.body}
          onChange={(e) => onChange({ body: e.target.value })}
          rows={3}
          placeholder={"Flow X: Use simplified version for now."}
          className="w-full bg-black/30 border border-white/10 rounded-lg p-2 font-mono text-code-sm text-on-surface focus:outline-none focus:border-primary/50 resize-y"
        />
      </Field>
    </div>
  );
}
