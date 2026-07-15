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
  const fromDate = from.toISOString().slice(0, 10);

  const query = `
    query($user:String!, $mergedQ:String!, $reviewedQ:String!, $openedQ:String!) {
      user(login:$user) {
        login
        name
        publicRepos: repositories(privacy:PUBLIC) { totalCount }
        pullRequests(states:[MERGED]) { totalCount }
      }
      mergedLastYear: search(type:ISSUE, query:$mergedQ) { issueCount }
      reviewedLastYear: search(type:ISSUE, query:$reviewedQ) { issueCount }
      openedLastYear: search(type:ISSUE, query:$openedQ) { issueCount }
    }`;

  const res = await gql(query, {
    user: USER,
    mergedQ: `is:pr author:${USER} is:merged merged:>=${fromDate}`,
    reviewedQ: `is:pr reviewed-by:${USER} -author:${USER} created:>=${fromDate}`,
    openedQ: `is:pr author:${USER} created:>=${fromDate}`,
  });

  return {
    publicRepos: res.user.publicRepos.totalCount,
    prsMergedTotal: res.user.pullRequests.totalCount,
    prsMergedLastYear: res.mergedLastYear.issueCount,
    prsOpenedLastYear: res.openedLastYear.issueCount,
    prsReviewedLastYear: res.reviewedLastYear.issueCount,
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

async function fetchMergedPRDetail(maxPages = 5) {
  const query = `
    query($user:String!, $cursor:String) {
      user(login:$user) {
        pullRequests(states:[MERGED], first:100, after:$cursor, orderBy:{field:UPDATED_AT, direction:DESC}) {
          pageInfo { hasNextPage endCursor }
          nodes {
            createdAt mergedAt additions deletions
            commits(first:20) { nodes { commit { authoredDate } } }
            reviews(first:20, states:[APPROVED, CHANGES_REQUESTED, COMMENTED]) {
              nodes { submittedAt author { login } }
            }
          }
        }
      }
    }`;
  const nodes = [];
  let cursor = null;
  for (let i = 0; i < maxPages; i++) {
    const res = await gql(query, { user: USER, cursor });
    nodes.push(...res.user.pullRequests.nodes);
    if (!res.user.pullRequests.pageInfo.hasNextPage) break;
    cursor = res.user.pullRequests.pageInfo.endCursor;
  }
  return nodes;
}

async function fetchReviewedByMonth(months) {
  const query = `query($q:String!) { search(type:ISSUE, query:$q) { issueCount } }`;
  const results = await Promise.all(
    months.map(async (m) => {
      const q = `is:pr reviewed-by:${USER} -author:${USER} created:${m.from}..${m.to}`;
      const res = await gql(query, { q });
      return { month: m.key, count: res.search.issueCount };
    }),
  );
  return results;
}

async function fetchMergedByMonth(months) {
  const query = `query($q:String!) { search(type:ISSUE, query:$q) { issueCount } }`;
  const results = await Promise.all(
    months.map(async (m) => {
      const q = `is:pr author:${USER} is:merged merged:${m.from}..${m.to}`;
      const res = await gql(query, { q });
      return { month: m.key, count: res.search.issueCount };
    }),
  );
  return results;
}

function computeCycleFromPRs(prs) {
  const now = Date.now();
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const hours = prs
    .filter((p) => p.mergedAt && new Date(p.mergedAt).getTime() >= yearAgo)
    .map((p) => (new Date(p.mergedAt) - new Date(p.createdAt)) / (1000 * 60 * 60))
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

function computeSizeHistogram(prs) {
  const buckets = { S: 0, M: 0, L: 0, XL: 0 };
  const now = Date.now();
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
  for (const p of prs) {
    if (!p.mergedAt || new Date(p.mergedAt).getTime() < yearAgo) continue;
    const size = (p.additions ?? 0) + (p.deletions ?? 0);
    if (size < 200) buckets.S++;
    else if (size < 500) buckets.M++;
    else if (size < 1000) buckets.L++;
    else buckets.XL++;
  }
  return buckets;
}

function computeTTFRHistogram(prs) {
  const buckets = { "<1h": 0, "1-4h": 0, "4-24h": 0, "1-3d": 0, ">3d": 0 };
  const now = Date.now();
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
  for (const p of prs) {
    if (!p.mergedAt || new Date(p.mergedAt).getTime() < yearAgo) continue;
    const reviews = (p.reviews?.nodes ?? []).filter(
      (r) => r.submittedAt && r.author?.login && r.author.login !== USER,
    );
    if (!reviews.length) continue;
    const first = reviews.reduce(
      (min, r) =>
        !min || new Date(r.submittedAt) < new Date(min.submittedAt) ? r : min,
      null,
    );
    const h = (new Date(first.submittedAt) - new Date(p.createdAt)) / (1000 * 60 * 60);
    if (h < 0) continue;
    if (h < 1) buckets["<1h"]++;
    else if (h < 4) buckets["1-4h"]++;
    else if (h < 24) buckets["4-24h"]++;
    else if (h < 72) buckets["1-3d"]++;
    else buckets[">3d"]++;
  }
  return buckets;
}

function computeDayHourHeatmap(prs) {
  const grid = Array.from({ length: 7 }, () => Array(24).fill(0));
  const seen = new Set();
  for (const p of prs) {
    for (const c of p.commits?.nodes ?? []) {
      const iso = c.commit?.authoredDate;
      if (!iso) continue;
      const key = iso;
      if (seen.has(key)) continue;
      seen.add(key);
      const d = new Date(iso);
      const dow = d.getUTCDay();
      const hour = d.getUTCHours();
      grid[dow][hour] += 1;
    }
  }
  return grid;
}

function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1));
    const end = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0));
    months.push({
      key: `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`,
      from: start.toISOString().slice(0, 10),
      to: end.toISOString().slice(0, 10),
    });
  }
  return months;
}

async function main() {
  console.log(`[fetch-metrics] user=${USER}`);
  await mkdir(OUT_DIR, { recursive: true });

  const months = lastNMonths(12);

  const [contributions, prof, prs, langs, mergedByMonth, reviewedByMonth] =
    await Promise.all([
      fetchContributions(),
      fetchProfile(),
      fetchMergedPRDetail(5),
      fetchTopLanguages(),
      fetchMergedByMonth(months),
      fetchReviewedByMonth(months),
    ]);

  const { currentStreak, longestStreak } = computeStreaks(contributions.days);
  const topLanguage = langs[0]?.name ?? "TypeScript";
  const cycle = computeCycleFromPRs(prs);
  const sizeHistogram = computeSizeHistogram(prs);
  const ttfrHistogram = computeTTFRHistogram(prs);
  const dayHourHeatmap = computeDayHourHeatmap(prs);

  const stats = {
    generatedAt: new Date().toISOString(),
    totals: {
      contributionsLastYear: contributions.total,
      currentStreak,
      longestStreak,
      topLanguage,
      prsMerged: prof.prsMergedLastYear,
      prsOpened: prof.prsOpenedLastYear,
      prsReviewed: prof.prsReviewedLastYear,
      publicRepos: prof.publicRepos,
      prsMergedAllTime: prof.prsMergedTotal,
    },
    cycle,
    topLanguages: langs,
    monthly: {
      merged: mergedByMonth,
      reviewed: reviewedByMonth,
    },
    sizeHistogram,
    ttfrHistogram,
    dayHourHeatmap,
    prSampleSize: prs.length,
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
    `[fetch-metrics] wrote ${contributions.days.length} days · ${contributions.total} contributions · ${prof.prsMergedLastYear} PRs merged (year) · ${prof.prsReviewedLastYear} reviewed (year) · sampled ${prs.length} PRs for histograms`,
  );
}

main().catch((err) => {
  console.error("[fetch-metrics] failed:", err.message);
  process.exit(1);
});
