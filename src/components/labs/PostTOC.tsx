"use client";

import { useEffect, useState } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function PostTOC() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const article = document.querySelector("article");
    if (!article) return;
    const nodes = article.querySelectorAll<HTMLHeadingElement>("h2, h3");
    const items: Heading[] = [];
    nodes.forEach((node) => {
      const text = node.textContent?.trim() ?? "";
      if (!text) return;
      let id = node.id;
      if (!id) {
        id = slugify(text);
        node.id = id;
      }
      items.push({ id, text, level: node.tagName === "H3" ? 3 : 2 });
    });
    setHeadings(items);
  }, []);

  useEffect(() => {
    if (!headings.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target instanceof HTMLElement) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-96px 0px -60% 0px" },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (!headings.length) return null;

  return (
    <nav className="glass-card rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="material-symbols-outlined text-secondary text-sm">
          list
        </span>
        <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
          Index
        </span>
      </div>
      <ol className="flex flex-col gap-1">
        {headings.map((h, i) => {
          const active = activeId === h.id;
          const pad = h.level === 3 ? "pl-6" : "pl-3";
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                className={`block ${pad} py-1 font-mono text-code-sm transition-colors border-l ${
                  active
                    ? "text-primary border-primary"
                    : "text-on-surface-variant border-outline-variant/30 hover:text-primary"
                }`}
              >
                <span className="text-tertiary mr-2">
                  {String(i + 1).padStart(2, "0")}.
                </span>
                {h.text}
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
