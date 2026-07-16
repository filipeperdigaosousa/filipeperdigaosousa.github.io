import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PostLayout from "@/components/labs/PostLayout";
import Content from "./content.mdx";
import { isDev } from "@/data/posts";

export const metadata: Metadata = {
  title: "Ten Years, One Consultancy, Three Clients",
  description:
    "Notes on the unusual CV shape: one employer for a decade, three deep client engagements underneath. Private draft — only visible in local development.",
  robots: { index: false, follow: false },
};

export default function Page() {
  if (!isDev) notFound();
  return (
    <PostLayout slug="ten-years-one-consultancy">
      <div className="mb-6">
        <span className="inline-flex items-center gap-2 px-3 py-1 rounded border border-warn/40 bg-warn/10 text-warn font-mono text-label-caps uppercase tracking-widest">
          <span className="material-symbols-outlined text-sm">lock</span>
          Private draft · local only
        </span>
      </div>
      <Content />
    </PostLayout>
  );
}
