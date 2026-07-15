import type { Metadata } from "next";
import Heatmap from "@/components/metrics/Heatmap";
import CommitTypeDonut from "@/components/metrics/CommitTypeDonut";
import Typewriter from "@/components/ui/Typewriter";
import stats from "@/data/generated/stats.json";
import contributions from "@/data/generated/contributions.json";
import { experience } from "@/data/experience";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = {
  title: "Impact",
  description:
    "Live engineering metrics — career output, merge rate, cycle time, code composition. Refreshed every six hours from GitHub data.",
};

interface TileProps {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "primary" | "secondary" | "default";
}

function Tile({ label, value, sub, tone = "default" }: TileProps) {
  const color =
    tone === "primary"
      ? "text-primary"
      : tone === "secondary"
        ? "text-secondary"
        : "text-on-surface";
  return (
    <div className="glass-card p-6 rounded-xl flex flex-col justify-between h-full">
      <span className="font-mono text-label-caps text-primary uppercase tracking-widest mb-4 block">
        {label}
      </span>
      <div>
        <span className={`font-mono text-headline-xl block ${color}`}>
          {value}
        </span>
        {sub ? (
          <span className="text-tertiary font-mono text-code-sm mt-1 block">
            {sub}
          </span>
        ) : null}
      </div>
    </div>
  );
}

export default function ImpactPage() {
  const { totals, cycle, sizeHistogram, commitTypes, prSampleSize } = stats;

  const yearsShipping = new Date().getUTCFullYear() - 2015;
  const mergeRate = Math.round((totals.prsMerged / totals.prsOpened) * 100);
  const reviewToAuthorRatio = (totals.prsReviewed / totals.prsMerged).toFixed(2);

  const sizeTotal = Object.values(sizeHistogram).reduce((a, b) => a + b, 0) || 1;
  const smallPRPct = Math.round(((sizeHistogram.S ?? 0) / sizeTotal) * 100);

  const commitTotal = Object.values(commitTypes).reduce((a, b) => a + b, 0) || 1;
  const refactorFixPct = Math.round(
    (((commitTypes.refactor ?? 0) + (commitTypes.fix ?? 0)) / commitTotal) * 100,
  );

  const activeDays = contributions.days.filter((d) => d.count > 0).length;

  return (
    <div className="pt-24 pb-32 px-margin-mobile md:px-margin-desktop max-w-content mx-auto">
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-2">
          <span className="w-3 h-3 bg-secondary rounded-full animate-pulse shadow-[0_0_15px_currentColor]" />
          <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
            System Online
          </span>
        </div>
        <h1 className="font-mono text-headline-xl-mobile md:text-headline-xl text-primary mb-4">
          <Typewriter text="Metrics Log" />
        </h1>
        <p className="text-on-surface-variant max-w-2xl text-body-lg">
          Live engineering telemetry. Refreshed every 6 hours from the GitHub
          API via a scheduled GitHub Action.
        </p>
      </header>

      <section className="mb-4">
        <p className="font-mono text-label-caps uppercase tracking-widest text-tertiary mb-3">
          / Career · all-time
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <Tile
            label="PRs Merged"
            value={formatNumber(totals.prsMergedAllTime)}
            sub="across all public and private PRs"
            tone="primary"
          />
          <Tile
            label="Years Shipping"
            value={`${yearsShipping}+`}
            sub="since 2015"
            tone="primary"
          />
          <Tile
            label="Companies"
            value={experience.length}
            sub="engagements listed on Work"
            tone="primary"
          />
        </div>
      </section>

      <section className="mt-8 mb-4">
        <p className="font-mono text-label-caps uppercase tracking-widest text-tertiary mb-3">
          / Last 12 months
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter">
          <Tile
            label="PRs Merged"
            value={formatNumber(totals.prsMerged)}
            sub={`${activeDays} active days · streak ${totals.currentStreak}d`}
          />
          <Tile
            label="Merge Rate"
            value={`${mergeRate}%`}
            sub={`${formatNumber(totals.prsMerged)} of ${formatNumber(totals.prsOpened)} opened`}
            tone="secondary"
          />
          <Tile
            label="PRs Reviewed"
            value={formatNumber(totals.prsReviewed)}
            sub={`${reviewToAuthorRatio}× ratio · reviewer-heavy`}
          />
          <Tile
            label="Same-Day Merge"
            value={`${cycle.sameDayPct}%`}
            sub="of PRs merge in under 24h"
            tone="secondary"
          />
        </div>
      </section>

      <section className="mt-8 mb-4">
        <div className="glass-card p-6 rounded-xl">
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
            <div className="hidden md:flex gap-2 items-center text-tertiary font-mono text-code-sm">
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
        </div>
      </section>

      <section className="mt-8 mb-4">
        <p className="font-mono text-label-caps uppercase tracking-widest text-tertiary mb-3">
          / Craft
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
          <Tile
            label="Cycle Time p50"
            value={`${cycle.p50}h`}
            sub={`mean ${cycle.mean}h · p90 ${cycle.p90}h`}
          />
          <Tile
            label="Refactor + Fix Share"
            value={`${refactorFixPct}%`}
            sub="of commits are refactor / fix"
          />
          <Tile
            label="Small-PR Share"
            value={`${smallPRPct}%`}
            sub={`${sizeHistogram.S} of ${sizeTotal} PRs under 200 LOC`}
          />
        </div>
      </section>

      <section className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-gutter">
        <section className="md:col-span-12 glass-card p-6 rounded-xl">
          <div className="mb-4">
            <h3 className="font-mono text-headline-md mb-1">
              Commit Composition
            </h3>
            <p className="text-tertiary font-mono text-code-sm">
              How my work splits between feature, refactor, fix, and infra —
              sampled across {prSampleSize} recent PRs
            </p>
          </div>
          <CommitTypeDonut data={commitTypes} />
        </section>

        <section className="md:col-span-12 glass-card p-6 rounded-xl">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <p className="font-mono text-code-sm text-tertiary">
              Generated at{" "}
              <span className="text-on-surface">
                {new Date(stats.generatedAt).toUTCString()}
              </span>{" "}
              — Source: GitHub API
            </p>
            <span className="font-mono text-label-caps text-secondary uppercase tracking-widest">
              build:auto · cron:6h
            </span>
          </div>
        </section>
      </section>
    </div>
  );
}
