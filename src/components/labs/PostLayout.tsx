import Link from "next/link";
import type { ReactNode } from "react";
import { posts } from "@/data/posts";
import PostTOC from "./PostTOC";
import ReadingProgress from "./ReadingProgress";

interface PostLayoutProps {
  slug: string;
  children: ReactNode;
}

function formatDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase();
}

function estimateReadTime(): number {
  // fallback estimate — MDX renders server-side, we don't have raw content here
  // caller may override in future; for now render "N MIN READ" that scales with tags count roughly
  return 8;
}

export default function PostLayout({ slug, children }: PostLayoutProps) {
  const post = posts.find((p) => p.slug === slug);
  const title = post?.title ?? "";
  const date = post?.date;
  const tags = post?.tags ?? [];
  const readMin = estimateReadTime();

  return (
    <>
      <ReadingProgress />
      <div className="pt-24 pb-24 px-margin-mobile md:px-margin-desktop max-w-content mx-auto grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        <aside className="hidden lg:block lg:col-span-2">
          <div className="sticky top-24">
            <PostTOC />
          </div>
        </aside>

        <div className="col-span-1 lg:col-span-7">
          <Link
            href="/labs"
            className="font-mono text-code-sm text-tertiary hover:text-primary inline-flex items-center gap-2 mb-6"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
            Back to Labs
          </Link>

          <header className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-2 py-1 border border-secondary/30 bg-secondary/10 text-secondary rounded font-mono text-[10px] tracking-widest font-bold uppercase">
                Labs · Notes
              </span>
              {date ? (
                <span className="font-mono text-code-sm text-tertiary uppercase">
                  {formatDate(date)}
                </span>
              ) : null}
              <span className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="font-mono text-code-sm text-tertiary uppercase inline-flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">
                  schedule
                </span>
                {readMin} min read
              </span>
            </div>
            <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary leading-tight">
              {title}
            </h1>
          </header>

          <article className="prose-post">{children}</article>

          <footer className="mt-16 pt-8 border-t border-white/5">
            <div className="flex flex-wrap gap-2 mb-6">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 bg-white/5 rounded-full font-mono text-[10px] uppercase tracking-widest text-on-surface-variant border border-white/10"
                >
                  #{t}
                </span>
              ))}
            </div>
            <div className="font-mono text-code-sm text-tertiary">
              Filipe Sousa · Senior Full-Stack Engineer
            </div>
          </footer>
        </div>

        <aside className="col-span-1 lg:col-span-3 space-y-4">
          <div className="glass-card rounded-lg overflow-hidden border border-secondary/20">
            <div className="bg-surface-container-high px-4 py-2 flex items-center justify-between border-b border-white/10">
              <span className="font-mono text-[10px] font-bold text-secondary uppercase tracking-widest inline-flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
                Post_Meta
              </span>
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-error/50" />
                <span className="w-2 h-2 rounded-full bg-warn/50" />
                <span className="w-2 h-2 rounded-full bg-secondary/50" />
              </div>
            </div>
            <div className="p-4 font-mono text-code-sm space-y-2">
              <div className="text-on-surface-variant">
                <span className="text-tertiary">slug</span> ·{" "}
                <span className="text-primary">/{slug}</span>
              </div>
              <div className="text-on-surface-variant">
                <span className="text-tertiary">date</span> ·{" "}
                <span className="text-on-surface">
                  {date ? formatDate(date) : "—"}
                </span>
              </div>
              <div className="text-on-surface-variant">
                <span className="text-tertiary">tags</span> ·{" "}
                <span className="text-on-surface">{tags.length}</span>
              </div>
              <div className="text-secondary">status · published</div>
            </div>
          </div>

          <Link
            href="/labs"
            className="glass-card rounded-lg p-4 block hover:border-primary/40 transition-colors"
          >
            <div className="font-mono text-label-caps text-primary uppercase tracking-widest mb-1">
              ← All entries
            </div>
            <div className="font-mono text-code-sm text-on-surface-variant">
              Return to the Labs index
            </div>
          </Link>
        </aside>
      </div>
    </>
  );
}
