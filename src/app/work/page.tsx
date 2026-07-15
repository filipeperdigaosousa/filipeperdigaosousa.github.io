import type { Metadata } from "next";
import TimelineItem from "@/components/work/TimelineItem";
import Typewriter from "@/components/ui/Typewriter";
import { experience } from "@/data/experience";

export const metadata: Metadata = {
  title: "Experience",
  description:
    "10 years of production web and mobile engineering — PlayerData, Pasabi, Glazed, WeChangers, Manolo Blahnik, Deloitte Digital.",
};

export default function WorkPage() {
  const yearsExperience = new Date().getFullYear() - 2015;
  const currentRole = experience.find((e) => e.end === null);

  return (
    <div className="pt-32 pb-24 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <section className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-3xl">
          <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-6">
            <Typewriter text="Career Architecture" />
          </h1>
          <p className="text-on-surface-variant text-body-lg max-w-2xl">
            A structural timeline of shipped web and mobile products, from
            early insurance tooling through luxury commerce, social-impact
            platforms, fraud-detection systems, and today&apos;s sports
            performance analytics.
          </p>
        </div>
        <div className="flex gap-4 mb-2">
          <div className="flex flex-col items-start md:items-end">
            <span className="text-secondary font-mono text-headline-md leading-none">
              {yearsExperience}+
            </span>
            <span className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest mt-1">
              Years_Exp
            </span>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="flex flex-col items-start md:items-end">
            <span className="text-primary font-mono text-headline-md leading-none">
              {experience.length}
            </span>
            <span className="font-mono text-label-caps text-on-surface-variant uppercase tracking-widest mt-1">
              Companies
            </span>
          </div>
        </div>
      </section>

      <div className="relative">
        <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px timeline-line -translate-x-1/2 md:block" />
        <div className="space-y-16">
          {experience.map((entry, i) => (
            <TimelineItem
              key={entry.company + entry.start}
              entry={entry}
              side={i % 2 === 0 ? "left" : "right"}
              active={entry === currentRole}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
