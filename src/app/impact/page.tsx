import type { Metadata } from "next";
import Heatmap from "@/components/metrics/Heatmap";
import YearlyActivity from "@/components/metrics/YearlyActivity";
import ContributionDiamond from "@/components/metrics/ContributionDiamond";
import Typewriter from "@/components/ui/Typewriter";
import stats from "@/data/generated/stats.json";
import contributions from "@/data/generated/contributions.json";
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
  const { totals, cycle, sizeHistogram, commitTypes, prSampleSize, careerYears } = stats;
  const contributionMix = (stats as { contributionMix?: {
    commits: number;
    pullRequests: number;
    codeReviews: number;
    issues: number;
    percent: { commits: number; pullRequests: number; codeReviews: number; issues: number };
  } }).contributionMix;

  const yearsShipping = totals.yearsShipping;
  const mergeRate = Math.round((totals.prsMerged / totals.prsOpened) * 100);
  const reviewToAuthorRatio = (totals.prsReviewed / totals.prsMerged).toFixed(2);

  const sizeTotal = Object.values(sizeHistogram).reduce((a, b) => a + b, 0) || 1;
  const smallPRPct = Math.round(((sizeHistogram.S ?? 0) / sizeTotal) * 100);

  const commitTotal = Object.values(commitTypes).reduce((a, b) => a + b, 0) || 1;
  const refactorFixPct = Math.round(
    (((commitTypes.refactor ?? 0) + (commitTypes.fix ?? 0)) / commitTotal) * 100,
  );

  const activeDays = contributions.days.filter((d) => d.count > 0).length;

  const snapshot = (stats as { snapshot?: { hasStale: boolean; snapshotAt?: string; staleFields?: string[] } }).snapshot;
  const isStale = snapshot?.hasStale;
  const snapshotDate = snapshot?.snapshotAt
    ? new Date(snapshot.snapshotAt).toUTCString()
    : null;

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
        {isStale && snapshotDate ? (
          <div className="mt-6 glass-card rounded-xl px-4 py-3 inline-flex items-center gap-3 border-primary/20">
            <span className="material-symbols-outlined text-primary text-lg">
              lock_clock
            </span>
            <span className="font-mono text-code-sm text-on-surface-variant">
              Last-12-month tiles are a snapshot from {snapshotDate}. Some
              private-org access was lost — values preserved from the last
              successful fetch.
            </span>
          </div>
        ) : null}
      </header>

      <section className="mb-4">
        <p className="font-mono text-label-caps uppercase tracking-widest text-tertiary mb-3">
          / Career · all-time
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mb-gutter">
          <Tile
            label="Years Shipping"
            value={`${yearsShipping}+`}
            sub={`since ${totals.firstActiveYear}`}
            tone="primary"
          />
          <Tile
            label="Total Contributions"
            value={formatNumber(totals.careerTotal)}
            sub="commits, PRs, reviews & issues"
            tone="primary"
          />
          <Tile
            label="Peak Year"
            value={formatNumber(totals.peakYearTotal)}
            sub={`most contributions · ${totals.peakYear}`}
            tone="primary"
          />
        </div>
        <div className="glass-card rounded-xl p-6">
          <div className="mb-4">
            <h3 className="font-mono text-headline-md mb-1">Career Activity</h3>
            <p className="text-tertiary font-mono text-code-sm">
              Contributions per year across my full GitHub-tracked career
            </p>
          </div>
          <YearlyActivity years={careerYears} />
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

        {contributionMix ? (
          <div className="glass-card rounded-xl p-6 mt-gutter">
            <div className="mb-4 text-center">
              <h3 className="font-mono text-headline-md mb-1">
                Contribution Mix
              </h3>
              <p className="text-tertiary font-mono text-code-sm">
                How my last-12-month contributions split across commits,
                reviews, PRs and issues
              </p>
            </div>
            <div className="flex justify-center">
              <ContributionDiamond
                percent={contributionMix.percent}
                raw={{
                  commits: contributionMix.commits,
                  pullRequests: contributionMix.pullRequests,
                  codeReviews: contributionMix.codeReviews,
                  issues: contributionMix.issues,
                }}
              />
            </div>
          </div>
        ) : null}
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

      <section className="mt-8 glass-card p-6 rounded-xl">
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
    </div>
  );
}
