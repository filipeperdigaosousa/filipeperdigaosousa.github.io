"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Typewriter from "@/components/ui/Typewriter";
import {
  categoryLabels,
  categoryOrder,
  tools,
  type Tool,
  type ToolCategory,
} from "@/data/tools";

type Filter = ToolCategory | "all";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "ALL" },
  { key: "workflow", label: "WORKFLOW" },
  { key: "data", label: "DATA" },
  { key: "time", label: "TIME" },
  { key: "web", label: "WEB" },
  { key: "security", label: "SECURITY" },
];

export default function ToolsClient() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tools.filter((t) => {
      if (filter !== "all" && t.category !== filter) return false;
      if (!q) return true;
      return (
        t.name.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    });
  }, [query, filter]);

  const grouped = useMemo(() => {
    const map = new Map<ToolCategory, Tool[]>();
    for (const t of filtered) {
      const arr = map.get(t.category) ?? [];
      arr.push(t);
      map.set(t.category, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <header className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-secondary/10 border border-secondary/30 rounded mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
          <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            / Tools
          </span>
        </div>
        <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-4 tracking-tight">
          <Typewriter text="STATIC_HELPERS.BIN" />
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl leading-relaxed">
          Small in-browser utilities. Some drawn from my own workflow, others
          just useful. Everything computes locally — no server, nothing sent
          anywhere.
        </p>
      </header>

      <div className="mb-10 space-y-4">
        <div className="relative group">
          <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-secondary font-bold font-mono">
            &gt;
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="filter --search [query]..."
            className="w-full bg-surface-container border border-white/10 rounded-lg py-3 pl-10 pr-4 font-mono text-code-sm md:text-body-md text-on-surface focus:outline-none focus:border-secondary/60 transition-colors placeholder:text-on-surface-variant/40"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest mr-1">
            Categories:
          </span>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={`px-2.5 py-1 rounded font-mono text-[10px] uppercase tracking-widest border transition-colors ${
                filter === f.key
                  ? "bg-secondary/20 border-secondary text-secondary"
                  : "bg-secondary/5 border-secondary/20 text-secondary/70 hover:bg-secondary/10 hover:border-secondary/40"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="font-mono text-code-sm text-tertiary py-12 text-center">
          &gt; no matches. Try a different filter or query.
        </p>
      ) : (
        <div className="space-y-14">
          {categoryOrder.map((cat) => {
            const list = grouped.get(cat);
            if (!list || list.length === 0) return null;
            return (
              <section key={cat}>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-mono text-label-caps text-secondary uppercase tracking-widest whitespace-nowrap">
                    / {categoryLabels[cat]}
                  </h2>
                  <div className="h-px flex-1 bg-gradient-to-r from-white/15 to-transparent" />
                  <span className="font-mono text-[10px] text-on-surface-variant/60 uppercase tracking-widest">
                    {list.length.toString().padStart(2, "0")}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
                  {list.map((t) => (
                    <ToolCard key={t.slug} tool={t} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <footer className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/70">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-secondary" />
            system_stable
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-secondary" />
            client_only
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-secondary" />
            {tools.length.toString().padStart(2, "0")}_utilities
          </span>
        </div>
        <span className="text-on-surface-variant/50">
          designed_for_precision
        </span>
      </footer>
    </div>
  );
}

function ToolCard({ tool }: { tool: Tool }) {
  return (
    <Link
      href={`/tools/${tool.slug}`}
      className="glass-card rounded-xl p-5 group flex flex-col gap-3 transition-all hover:-translate-y-0.5 hover:border-secondary/60"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-11 h-11 rounded-lg bg-surface-container-highest/60 border border-white/10 flex items-center justify-center text-secondary shrink-0">
          <span
            className="material-symbols-outlined text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {tool.icon}
          </span>
        </div>
        {tool.featured ? (
          <span className="font-mono text-[9px] tracking-widest uppercase px-2 py-0.5 rounded border border-primary/40 bg-primary/10 text-primary">
            featured
          </span>
        ) : null}
      </div>
      <div className="flex-1">
        <h3 className="font-mono text-headline-md text-on-surface mb-1 group-hover:text-secondary transition-colors">
          {tool.name}
        </h3>
        <p className="text-body-md text-on-surface-variant/85 leading-relaxed">
          {tool.summary}
        </p>
      </div>
      <div className="mt-2 pt-3 flex justify-between items-center border-t border-white/5">
        <div className="flex flex-wrap gap-1.5">
          {tool.tags.map((tag) => (
            <span
              key={tag}
              className="font-mono text-[10px] uppercase tracking-widest text-on-surface-variant/80 bg-white/5 px-2 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-secondary inline-flex items-center gap-1 group-hover:gap-2 transition-all">
          open
          <span className="material-symbols-outlined text-sm">
            arrow_right_alt
          </span>
        </span>
      </div>
    </Link>
  );
}
