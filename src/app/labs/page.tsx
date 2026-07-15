import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labs — Filipe Sousa",
  description: "Experiments, side projects, and write-ups.",
};

export default function LabsPage() {
  return (
    <div className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-content mx-auto min-h-[60vh]">
      <div className="flex items-center gap-2 mb-4">
        <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
        <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
          system.log: labs
        </span>
      </div>
      <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-6">
        Labs
      </h1>
      <div className="glass-card rounded-xl p-8 max-w-2xl">
        <p className="font-mono text-code-sm text-tertiary mb-3">
          $ ls posts/
        </p>
        <p className="font-mono text-code-sm text-on-surface-variant">
          → no posts yet · check back soon
        </p>
      </div>
    </div>
  );
}
