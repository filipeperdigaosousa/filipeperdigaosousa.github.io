import type { Metadata } from "next";
import Link from "next/link";
import Typewriter from "@/components/ui/Typewriter";
import PostCard from "@/components/labs/PostCard";
import { visiblePosts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Side projects and technical write-ups on migrations, code review, product-engineering practice, and architecture.",
};

const projects = [
  {
    name: "Portugal em Dados",
    url: "https://portugalemdados.pt",
    host: "portugalemdados.pt",
    since: "Oct 2026",
    summary:
      "Ask a question about Portugal in plain Portuguese and get an official number, a chart and its source. Built on INE, Eurostat and five other public sources.",
    stack: ["Python", "PostgreSQL", "Next.js", "AI"],
    post: "/labs/building-portugal-em-dados",
  },
  {
    name: "Leavelly",
    url: "https://leavelly.com",
    host: "leavelly.com",
    since: "Jul 2026",
    summary:
      "A leave planner for individuals and freelancers: multiple plans, partial days, public holidays, a bridge-day optimizer, and calendar export. No signup; everything stays on your device.",
    stack: ["Next.js", "TypeScript", "PWA"],
    post: "/labs/building-leavelly",
  },
];

function SectionHeading({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h2 className="font-mono text-headline-md text-primary">{children}</h2>
      <div className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export default function LabsPage() {
  const sorted = [...visiblePosts()].sort((a, b) => (a.date < b.date ? 1 : -1));
  const [featured, ...rest] = sorted;

  // bento pattern: featured (8) + 4 (4) — medium(6) medium(6) — small(4) small(4) small(4) — repeat
  const bentoSpans: Array<{ post: (typeof rest)[number]; variant: "featured" | "medium" | "small"; span: string }> = [];
  if (featured) {
    bentoSpans.push({ post: featured, variant: "featured", span: "md:col-span-8" });
  }
  const pattern = ["md:col-span-4", "md:col-span-6", "md:col-span-6", "md:col-span-4", "md:col-span-4", "md:col-span-4"];
  const variantForSpan: Record<string, "small" | "medium"> = {
    "md:col-span-4": "small",
    "md:col-span-6": "medium",
  };
  rest.forEach((post, i) => {
    const span = pattern[i % pattern.length];
    bentoSpans.push({ post, variant: variantForSpan[span] ?? "small", span });
  });

  return (
    <div className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <header className="mb-12 md:mb-16">
        <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-4">
          <Typewriter text="Labs" />
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Side projects I run, and write-ups on migrations, code review,
          product-engineering practice and the architecture patterns I reach
          for.
        </p>
      </header>

      <section className="mb-16">
        <SectionHeading>Side projects</SectionHeading>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter">
          {projects.map((p) => (
            <article key={p.name} className="glass-card rounded-xl p-6 md:p-8 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3 font-mono text-label-caps uppercase tracking-widest">
                <span className="inline-flex items-center gap-2 text-secondary">
                  <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(66,227,85,0.9)]" />
                  Live
                </span>
                <span className="text-tertiary">{p.since}</span>
              </div>
              <h3 className="font-mono text-headline-md text-on-surface leading-tight">{p.name}</h3>
              <p className="text-body-md text-on-surface-variant/85">{p.summary}</p>
              <div className="flex flex-wrap gap-2">
                {p.stack.map((t) => (
                  <span key={t} className="px-2 py-1 bg-white/5 rounded font-mono text-[12px] uppercase tracking-wider text-on-surface-variant">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-auto pt-4 border-t border-white/5 flex flex-wrap gap-6 font-mono text-label-caps uppercase tracking-widest">
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-primary hover:text-secondary transition-colors">
                  {p.host}
                  <span className="material-symbols-outlined text-base" aria-hidden="true">north_east</span>
                </a>
                {p.post ? (
                  <Link href={p.post} className="inline-flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors">
                    Read the build
                    <span className="material-symbols-outlined text-base" aria-hidden="true">arrow_forward</span>
                  </Link>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>

      <SectionHeading>Posts</SectionHeading>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        {bentoSpans.map(({ post, variant, span }) => (
          <div key={post.slug} className={span}>
            <PostCard post={post} variant={variant} />
          </div>
        ))}
      </div>

      <div className="mt-16 flex flex-col items-center gap-4">
        <div className="h-px w-full max-w-xs bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest">
          END_OF_ARCHIVE · {sorted.length} entries
        </span>
      </div>
    </div>
  );
}
