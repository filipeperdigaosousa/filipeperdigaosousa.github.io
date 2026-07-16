import type { Metadata } from "next";
import Link from "next/link";
import Typewriter from "@/components/ui/Typewriter";
import { posts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Technical write-ups on migrations, code review, and engineering practice.",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function LabsPage() {
  const sorted = [...posts].sort((a, b) => (a.date < b.date ? 1 : -1));
  return (
    <div className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-content mx-auto min-h-[60vh]">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-6">
          <Typewriter text="Labs" />
        </h1>
        <p className="text-on-surface-variant text-body-lg">
          Write-ups on migrations, code-review practice, and architecture
          patterns from real production work.
        </p>
      </header>

      <ul className="space-y-4">
        {sorted.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/labs/${p.slug}`}
              className="glass-card rounded-xl p-6 block group hover:border-primary/40 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-3">
                <h2 className="font-mono text-headline-md text-on-surface group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                <time
                  dateTime={p.date}
                  className="font-mono text-code-sm text-tertiary shrink-0"
                >
                  {formatDate(p.date)}
                </time>
              </div>
              <p className="text-on-surface-variant text-body-md mb-4">
                {p.summary}
              </p>
              <div className="flex flex-wrap gap-2">
                {p.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-1 rounded font-mono text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 text-on-surface-variant"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
