#!/usr/bin/env node
import { graphql } from "@octokit/graphql";
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const USER = process.env.GH_USER || "filipeperdigaosousa";
const TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;
const OUT_DIR = path.resolve("src/data/generated");

if (!TOKEN) {
  console.error(
    "[fetch-metrics] Missing GH_TOKEN or GITHUB_TOKEN env var. Skipping fetch — using existing stubs.",
  );
  process.exit(0);
}

const gql = graphql.defaults({
  headers: { authorization: `token ${TOKEN}` },
});

async function fetchContributions() {
  const now = new Date();
  const from = new Date(now);
  from.setUTCFullYear(from.getUTCFullYear() - 1);

  const query = `
    query($user:String!, $from:DateTime!, $to:DateTime!) {
      user(login:$user) {
        contributionsCollection(from:$from, to:$to) {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays { date contributionCount }
            }
          }
        }
      }
    }`;

  const res = await gql(query, {
    user: USER,
    from: from.toISOString(),
    to: now.toISOString(),
  });
  const cal = res.user.contributionsCollection.contributionCalendar;
  const days = cal.weeks.flatMap((w) =>
    w.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
    })),
  );
  return { total: cal.totalContributions, days };
}

function computeStreaks(days) {
  const today = new Date().toISOString().slice(0, 10);
  const map = new Map(days.map((d) => [d.date, d.count]));
  const sorted = [...map.keys()].sort();

  let longest = 0;
  let cur = 0;
  for (const d of sorted) {
    if ((map.get(d) ?? 0) > 0) {
      cur += 1;
      longest = Math.max(longest, cur);
    } else {
      cur = 0;
    }
  }

  let currentStreak = 0;
  const cursor = new Date(today);
  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    const c = map.get(iso);
    if (c && c > 0) {
      currentStreak += 1;
    } else if (iso !== today) {
      break;
    } else {
      cursor.setUTCDate(cursor.getUTCDate() - 1);
      continue;
    }
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return { currentStreak, longestStreak: longest };
}

async function fetchProfile() {
  const now = new Date();
  const from = new Date(now);
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  const query = `
    query($user:String!, $from:DateTime!, $to:DateTime!) {
      user(login:$user) {
        login
        name
        publicRepos: repositories(privacy:PUBLIC) { totalCount }
        pullRequests(states:[MERGED]) { totalCount }
        contributionsCollection(from:$from, to:$to) {
          totalPullRequestReviewContributions
          totalCommitContributions
          totalPullRequestContributions
        }
      }
    }`;
  const res = await gql(query, {
    user: USER,
    from: from.toISOString(),
    to: now.toISOString(),
  });
  return {
    publicRepos: res.user.publicRepos.totalCount,
    prsMerged: res.user.pullRequests.totalCount,
    prsMergedLastYear: res.user.contributionsCollection.totalPullRequestContributions,
    prsReviewed:
      res.user.contributionsCollection.totalPullRequestReviewContributions,
    commitsLastYear:
      res.user.contributionsCollection.totalCommitContributions,
  };
}

async function fetchTopLanguages() {
  const query = `
    query($user:String!) {
      user(login:$user) {
        repositories(first:100, privacy:PUBLIC, isFork:false, ownerAffiliations:[OWNER]) {
          nodes {
            languages(first:10, orderBy:{field:SIZE, direction:DESC}) {
              edges { size node { name } }
            }
          }
        }
      }
    }`;
  const res = await gql(query, { user: USER });
  const totals = new Map();
  for (const repo of res.user.repositories.nodes) {
    for (const edge of repo.languages.edges) {
      totals.set(edge.node.name, (totals.get(edge.node.name) ?? 0) + edge.size);
    }
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  const list = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, size]) => ({ name, percent: Math.round((size / sum) * 100) }));
  return list;
}

async function fetchCycleTimes() {
  const query = `
    query($user:String!) {
      user(login:$user) {
        pullRequests(states:[MERGED], first:100, orderBy:{field:UPDATED_AT, direction:DESC}) {
          nodes { createdAt mergedAt }
        }
      }
    }`;
  const res = await gql(query, { user: USER });
  const hours = res.user.pullRequests.nodes
    .filter((p) => p.mergedAt)
    .map(
      (p) => (new Date(p.mergedAt) - new Date(p.createdAt)) / (1000 * 60 * 60),
    )
    .filter((h) => h >= 0)
    .sort((a, b) => a - b);
  if (!hours.length) return { p50: 0, mean: 0, p90: 0 };
  const p = (q) => hours[Math.max(0, Math.floor(hours.length * q) - 1)];
  const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
  return {
    p50: Math.round(p(0.5) * 10) / 10,
    mean: Math.round(mean * 10) / 10,
    p90: Math.round(p(0.9) * 10) / 10,
  };
}

async function main() {
  console.log(`[fetch-metrics] user=${USER}`);
  await mkdir(OUT_DIR, { recursive: true });

  const [contributions, prof, cycle, langs] = await Promise.all([
    fetchContributions(),
    fetchProfile(),
    fetchCycleTimes(),
    fetchTopLanguages(),
  ]);

  const { currentStreak, longestStreak } = computeStreaks(contributions.days);
  const topLanguage = langs[0]?.name ?? "TypeScript";

  const stats = {
    generatedAt: new Date().toISOString(),
    totals: {
      contributionsLastYear: contributions.total,
      currentStreak,
      longestStreak,
      topLanguage,
      prsMerged: prof.prsMerged,
      prsReviewed: prof.prsReviewed,
      publicRepos: prof.publicRepos,
    },
    cycle,
    topLanguages: langs,
  };

  await writeFile(
    path.join(OUT_DIR, "contributions.json"),
    JSON.stringify({ weeks: 52, days: contributions.days }, null, 2),
  );
  await writeFile(
    path.join(OUT_DIR, "stats.json"),
    JSON.stringify(stats, null, 2),
  );

  console.log(
    `[fetch-metrics] wrote ${contributions.days.length} days · ${contributions.total} contributions · ${prof.prsMerged} PRs merged · ${prof.prsReviewed} reviewed`,
  );
}

main().catch((err) => {
  console.error("[fetch-metrics] failed:", err.message);
  process.exit(1);
});
