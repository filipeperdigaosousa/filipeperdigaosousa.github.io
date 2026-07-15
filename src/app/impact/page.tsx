import type { Metadata } from "next";
import Heatmap from "@/components/metrics/Heatmap";
import TechStackBar from "@/components/ui/TechStackBar";
import stats from "@/data/generated/stats.json";
import contributions from "@/data/generated/contributions.json";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Impact — Filipe Sousa",
  description:
    "Live engineering metrics — contribution activity, PR throughput, cycle time, tech stack density. Refreshed every six hours from public GitHub data.",
};

export default function ImpactPage() {
  const { totals, cycle, topLanguages } = stats;
  return (
    <div className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-[0_0_15px_currentColor]" />
          <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            System Online
          </span>
        </div>
        <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl mb-4">
          Metrics Log
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-body-lg">
          Live engineering telemetry. Refreshed every 6 hours from public
          GitHub data via a scheduled GitHub Action.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <section className="md:col-span-12 glass-card p-6 rounded-xl">
          <div className="flex justify-between items-end mb-6">
            <div>
              <h3 className="font-mono text-headline-md mb-1">
                Contribution Activity
              </h3>
              <p className="text-tertiary font-mono text-code-sm">
                {formatNumber(totals.contributionsLastYear)} contributions in
                the last year
              </p>
            </div>
            <div className="flex gap-2 items-center text-tertiary font-mono text-code-sm">
              <span>Less</span>
              <div className="w-3 h-3 bg-white/5 rounded-[2px]" />
              <div className="w-3 h-3 bg-secondary/20 rounded-[2px]" />
              <div className="w-3 h-3 bg-secondary/40 rounded-[2px]" />
              <div className="w-3 h-3 bg-secondary/70 rounded-[2px]" />
              <div className="w-3 h-3 bg-secondary rounded-[2px]" />
              <span>More</span>
            </div>
          </div>
          <Heatmap days={contributions.days} />
        </section>

        <div className="md:col-span-4 glass-card p-6 rounded-xl flex flex-col justify-between">
          <span className="font-mono text-label-caps text-primary uppercase tracking-widest mb-4 block">
            Total Contributions
          </span>
          <div>
            <span className="font-mono text-headline-xl block">
              {formatNumber(totals.contributionsLastYear)}
            </span>
            <span className="text-tertiary font-mono text-code-sm">
              last 12 months
            </span>
          </div>
        </div>

        <div className="md:col-span-4 glass-card p-6 rounded-xl flex flex-col justify-between">
          <span className="font-mono text-label-caps text-primary uppercase tracking-widest mb-4 block">
            Current Streak
          </span>
          <div>
            <span className="font-mono text-headline-xl block">
              {totals.currentStreak}{" "}
              <span className="text-headline-md text-on-surface-variant">
                days
              </span>
            </span>
            <span className="text-tertiary font-mono text-code-sm">
              record: {totals.longestStreak} days
            </span>
          </div>
        </div>

        <div className="md:col-span-4 glass-card p-6 rounded-xl flex flex-col justify-between relative overflow-hidden">
          <span className="font-mono text-label-caps text-primary uppercase tracking-widest mb-4 block">
            PRs Reviewed
          </span>
          <div>
            <span className="font-mono text-headline-xl block">
              {formatNumber(totals.prsReviewed)}
            </span>
            <span className="text-tertiary font-mono text-code-sm">
              reviewed &gt; authored ({totals.prsMerged} merged)
            </span>
          </div>
          <div className="absolute -bottom-6 -right-4 opacity-10 text-primary">
            <span
              className="material-symbols-outlined text-[120px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
              fact_check
            </span>
          </div>
        </div>

        <section className="md:col-span-8 glass-card p-8 rounded-xl">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="font-mono text-headline-md mb-1">
                PR Cycle Time
              </h3>
              <p className="text-tertiary font-mono text-code-sm">
                Median hours from PR opened to merged
              </p>
            </div>
            <div className="text-right">
              <div className="text-headline-md font-mono text-secondary">
                {cycle.p50}h
              </div>
              <div className="font-mono text-label-caps text-tertiary uppercase tracking-widest">
                p50
              </div>
            </div>
          </div>
          <div className="h-48 w-full flex items-end gap-6 px-2">
            {[
              { label: "p50", value: cycle.p50, color: "bg-secondary" },
              { label: "mean", value: cycle.mean, color: "bg-primary/60" },
              { label: "p90", value: cycle.p90, color: "bg-primary/30" },
            ].map((b) => {
              const max = cycle.p90 * 1.1;
              const h = Math.max(8, (b.value / max) * 100);
              return (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className={`w-full rounded-t ${b.color} transition-all`}
                    style={{ height: `${h}%` }}
                  />
                  <div className="text-code-sm font-mono text-tertiary uppercase">
                    {b.label}
                  </div>
                  <div className="font-mono text-body-md">{b.value}h</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="md:col-span-4 glass-card p-8 rounded-xl">
          <h3 className="font-mono text-label-caps uppercase tracking-widest text-on-surface-variant mb-6">
            Top Languages
          </h3>
          <div className="space-y-6">
            {topLanguages.map((l) => (
              <TechStackBar key={l.name} label={l.name} percent={l.percent} />
            ))}
          </div>
        </section>

        <section className="md:col-span-12 glass-card p-6 rounded-xl">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <p className="font-mono text-code-sm text-tertiary">
              Generated at{" "}
              <span className="text-on-surface">
                {new Date(stats.generatedAt).toUTCString()}
              </span>{" "}
              — Source: public GitHub API
            </p>
            <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              build:auto · cron:6h
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}
