import { Fragment } from "react";
import type { ExperienceEntry } from "@/data/experience";
import { formatRange } from "@/lib/format";
import CompanyLogo from "./CompanyLogo";

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="text-primary font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

interface TimelineItemProps {
  entry: ExperienceEntry;
  active?: boolean;
}

export default function TimelineItem({
  entry,
  active = false,
}: TimelineItemProps) {
  return (
    <div className="relative grid grid-cols-[16px_1fr] md:grid-cols-[16px_240px_1fr] gap-x-6 md:gap-x-7 items-start">
      <div
        className={`w-4 h-4 mt-1 rounded-full border-2 z-10 ${
          active ? "border-primary bg-primary" : "border-outline bg-background"
        }`}
      />

      <div className="md:sticky md:top-24">
        <span className="font-mono text-label-caps text-secondary uppercase tracking-widest block opacity-80">
          {formatRange(entry.start, entry.end)}
        </span>
        <CompanyLogo
          company={entry.company}
          domain={entry.domain}
          logo={entry.logo}
          size={48}
          className="shrink-0 my-3"
        />
        <h2 className="font-mono text-headline-md text-primary leading-tight">
          {entry.company}
        </h2>
        <p className="font-mono text-code-sm text-on-surface-variant font-bold tracking-widest uppercase mt-1">
          {entry.role}
        </p>
      </div>

      <div className="col-start-2 md:col-start-3 mt-4 md:mt-0">
        <div className="glass-card p-6 md:p-8 rounded-lg max-w-3xl">
          <p className="text-body-md text-on-surface/80 mb-6">
            {entry.summary}
          </p>

          <ul className="space-y-3">
            {entry.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-sm mt-1">
                  subdirectory_arrow_right
                </span>
                <span className="text-on-surface/80">{renderInlineBold(h)}</span>
              </li>
            ))}
          </ul>

          {entry.note ? (
            <p className="mt-6 text-code-sm font-mono text-on-surface-variant/80 border-l-2 border-outline-variant pl-3 ">
              Note: {entry.note}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-white/5">
            {entry.stack.map((s) => (
              <span
                key={s}
                className="px-2 py-1 bg-white/5 rounded text-[12px] font-mono text-on-surface-variant uppercase tracking-wider"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
