import type { ExperienceEntry } from "@/data/experience";
import { formatRange } from "@/lib/format";
import CompanyLogo from "./CompanyLogo";

interface TimelineItemProps {
  entry: ExperienceEntry;
  side: "left" | "right";
  active?: boolean;
}

export default function TimelineItem({
  entry,
  side,
  active = false,
}: TimelineItemProps) {
  const isLeft = side === "left";
  return (
    <div className="relative flex flex-col md:flex-row items-start md:items-center">
      {!isLeft && <div className="flex-1 hidden md:block" />}

      <div
        className={`absolute left-4 md:left-1/2 -translate-x-1/2 w-4 h-4 bg-background border-2 ${
          active ? "border-primary" : "border-outline"
        } rounded-full z-10 hidden md:block`}
      >
        {active ? (
          <div className="w-full h-full rounded-full bg-primary animate-ping opacity-25" />
        ) : null}
      </div>

      <div
        className={`flex-1 w-full pl-12 md:pl-0 ${
          isLeft ? "md:pr-16 md:text-right md:order-1" : "md:pl-16 order-2"
        } order-2 mt-4 md:mt-0`}
      >
        <div
          className={`glass-card p-6 md:p-8 rounded-lg text-left w-full max-w-2xl inline-block ${
            isLeft ? "md:ml-auto" : ""
          }`}
        >
          <span className="font-mono text-label-caps text-secondary uppercase tracking-widest mb-3 block opacity-80">
            {formatRange(entry.start, entry.end)}
          </span>
          <div className="flex items-center gap-4 mb-6">
            <CompanyLogo
              company={entry.company}
              domain={entry.domain}
              logo={entry.logo}
              size={48}
              className="shrink-0"
            />
            <div>
              <h3 className="font-mono text-headline-md text-primary leading-tight">
                {entry.company}
              </h3>
              <p className="font-mono text-code-sm text-on-surface-variant font-bold tracking-widest uppercase mt-1">
                {entry.role}
              </p>
            </div>
          </div>

          <p className="text-body-md text-on-surface/80 mb-6">
            {entry.summary}
          </p>

          <ul className="space-y-3">
            {entry.highlights.map((h) => (
              <li key={h} className="flex items-start gap-3 text-left">
                <span className="material-symbols-outlined text-primary text-sm mt-1">
                  subdirectory_arrow_right
                </span>
                <span className="text-on-surface/80">{h}</span>
              </li>
            ))}
          </ul>

          {entry.note ? (
            <p className="mt-6 text-code-sm font-mono text-on-surface-variant/60 border-l-2 border-outline-variant pl-3 text-left">
              Note: {entry.note}
            </p>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-2 pt-6 border-t border-white/5">
            {entry.stack.map((s) => (
              <span
                key={s}
                className="px-2 py-1 bg-white/5 rounded text-[10px] font-mono text-on-surface-variant uppercase tracking-widest"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {isLeft && <div className="flex-1 hidden md:block order-2" />}
    </div>
  );
}
