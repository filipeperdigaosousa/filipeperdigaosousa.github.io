import Link from "next/link";
import type { ReactNode } from "react";

interface ToolShellProps {
  slug: string;
  name: string;
  summary: string;
  icon?: string;
  tags?: string[];
  children: ReactNode;
}

export default function ToolShell({
  name,
  summary,
  icon,
  tags,
  children,
}: ToolShellProps) {
  return (
    <div className="pt-24 pb-24 px-margin-mobile md:px-margin-desktop max-w-4xl mx-auto">
      <Link
        href="/tools"
        className="font-mono text-code-sm text-tertiary hover:text-primary inline-flex items-center gap-2 mb-6"
      >
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Back to Tools
      </Link>

      <header className="mb-10 flex items-start gap-4">
        {icon ? (
          <div className="w-14 h-14 rounded-lg glass-card flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-3xl">
              {icon}
            </span>
          </div>
        ) : null}
        <div className="flex-1">
          <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary leading-tight mb-3">
            {name}
          </h1>
          <p className="text-body-md md:text-body-lg text-on-surface-variant max-w-3xl leading-relaxed">
            {summary}
          </p>
          {tags?.length ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded font-mono text-[10px] uppercase tracking-widest bg-white/5 border border-white/10 text-on-surface-variant"
                >
                  {t}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </header>

      {children}

      <p className="mt-10 font-mono text-code-sm text-tertiary">
        Runs entirely in your browser. Nothing is sent anywhere.
      </p>
    </div>
  );
}
