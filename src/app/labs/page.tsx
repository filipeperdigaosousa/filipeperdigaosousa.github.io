import type { Metadata } from "next";
import Typewriter from "@/components/ui/Typewriter";
import PostCard from "@/components/labs/PostCard";
import { visiblePosts } from "@/data/posts";

export const metadata: Metadata = {
  title: "Labs",
  description:
    "Technical write-ups on migrations, code review, product-engineering practice, and multi-tenant architecture.",
};

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
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-block px-3 py-1 bg-secondary/10 border border-secondary/30 rounded font-mono text-label-caps text-secondary uppercase tracking-widest">
            V1.0 · Stable
          </span>
        </div>
        <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-4">
          <Typewriter text="Labs" />
        </h1>
        <p className="text-body-lg text-on-surface-variant max-w-2xl">
          Write-ups on migrations, code review, product-engineering practice,
          and the architecture patterns I reach for on multi-tenant products.
        </p>
      </header>

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
