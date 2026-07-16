import Link from "next/link";
import type { Post } from "@/data/posts";

interface PostCardProps {
  post: Post;
  variant?: "featured" | "medium" | "small";
}

function formatDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    })
    .toUpperCase()
    .replace(/ /g, " ");
}

const tone = (idx: number) =>
  idx % 2 === 0 ? "primary" : "secondary";

export default function PostCard({ post, variant = "small" }: PostCardProps) {
  const primaryTag = post.tags[0] ?? "post";
  const colorClass =
    tone(post.slug.length) === "primary"
      ? { text: "text-primary", border: "border-primary/40", hover: "hover:border-primary/60" }
      : { text: "text-secondary", border: "border-secondary/40", hover: "hover:border-secondary/60" };

  if (variant === "featured") {
    return (
      <Link
        href={`/labs/${post.slug}`}
        className={`glass-card rounded-xl p-6 md:p-8 group relative overflow-hidden flex flex-col justify-between min-h-[320px] md:min-h-[380px] transition-all ${colorClass.hover}`}
      >
        <div className="absolute top-4 right-4 opacity-15 group-hover:opacity-30 transition-opacity pointer-events-none">
          <span
            className="material-symbols-outlined text-6xl"
            style={{ color: "var(--color-primary)" }}
          >
            terminal
          </span>
        </div>
        <div>
          <div className={`flex items-center gap-3 mb-4 font-mono text-label-caps ${colorClass.text} uppercase tracking-widest`}>
            <span>[FEATURED]</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span>[{primaryTag}]</span>
            <span className="w-1 h-1 rounded-full bg-outline-variant" />
            <span className="text-tertiary">{formatDate(post.date)}</span>
          </div>
          <h2 className="font-mono text-headline-md md:text-headline-xl-mobile mb-4 leading-tight text-on-surface group-hover:text-primary transition-colors">
            {post.title}
          </h2>
          <p className="text-body-md md:text-body-lg text-on-surface-variant/85 max-w-2xl">
            {post.summary}
          </p>
        </div>
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          <div className="flex flex-wrap items-center gap-2">
            {post.tags.slice(0, 4).map((t) => (
              <span
                key={t}
                className="px-2 py-1 bg-white/5 rounded font-mono text-[10px] uppercase tracking-widest text-on-surface-variant border border-white/5"
              >
                {t}
              </span>
            ))}
          </div>
          <span className={`inline-flex items-center gap-2 font-mono text-label-caps uppercase tracking-widest ${colorClass.text} group-hover:gap-3 transition-all`}>
            Read Post
            <span className="material-symbols-outlined">arrow_forward</span>
          </span>
        </div>
      </Link>
    );
  }

  if (variant === "medium") {
    return (
      <Link
        href={`/labs/${post.slug}`}
        className={`glass-card rounded-xl p-6 group flex flex-col border-t-2 ${colorClass.border} transition-all hover:border-t-2 min-h-[240px]`}
      >
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="bg-white/5 px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-widest text-on-surface-variant"
            >
              [{t}]
            </span>
          ))}
        </div>
        <h3 className={`font-mono text-headline-md mb-3 leading-snug text-on-surface group-hover:${colorClass.text} transition-colors`}>
          {post.title}
        </h3>
        <p className="text-body-md text-on-surface-variant/80 line-clamp-3">
          {post.summary}
        </p>
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <span className="font-mono text-code-sm text-tertiary uppercase tracking-widest">
            {formatDate(post.date)}
          </span>
          <span className={`${colorClass.text} font-mono text-label-caps uppercase tracking-widest inline-flex items-center gap-1`}>
            Read
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </span>
        </div>
      </Link>
    );
  }

  // small variant
  return (
    <Link
      href={`/labs/${post.slug}`}
      className={`glass-card rounded-xl p-6 group flex flex-col border-l-2 ${colorClass.border} transition-all min-h-[220px]`}
    >
      <div className={`font-mono text-label-caps ${colorClass.text} uppercase tracking-widest mb-3`}>
        [{primaryTag}]
      </div>
      <h3 className={`font-mono text-headline-md mb-2 leading-snug text-on-surface group-hover:${colorClass.text} transition-colors`}>
        {post.title}
      </h3>
      <p className="text-body-md text-on-surface-variant/70 line-clamp-3 mt-2">
        {post.summary}
      </p>
      <div className="mt-auto pt-4 flex items-center justify-between">
        <span className="font-mono text-code-sm text-tertiary">
          {formatDate(post.date)}
        </span>
        <span className="material-symbols-outlined text-on-surface-variant group-hover:translate-x-1 transition-transform">
          north_east
        </span>
      </div>
    </Link>
  );
}
