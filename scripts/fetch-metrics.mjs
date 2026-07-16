#!/usr/bin/env node
import { graphql } from "@octokit/graphql";
import { writeFile, mkdir, readFile } from "node:fs/promises";
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

async function fetchCareerYears(firstYear = 2016) {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const years = [];
  for (let y = firstYear; y <= currentYear; y++) {
    const from = new Date(Date.UTC(y, 0, 1)).toISOString();
    const to = new Date(Date.UTC(y, 11, 31, 23, 59, 59)).toISOString();
    const query = `
      query($user:String!, $from:DateTime!, $to:DateTime!) {
        user(login:$user) {
          contributionsCollection(from:$from, to:$to) {
            contributionCalendar { totalContributions }
          }
        }
      }`;
    const res = await gql(query, { user: USER, from, to });
    years.push({
      year: y,
      total: res.user.contributionsCollection.contributionCalendar.totalContributions,
    });
  }
  return years;
}

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
            repository { nameWithOwner }
            commits(first:30) {
              nodes {
                commit {
                  authoredDate
                  messageHeadline
                  authors(first:5) { nodes { user { login } email } }
                }
              }
            }
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

async function fetchReviewedAuthors(maxPages = 3) {
  const query = `
    query($q:String!) {
      search(type:ISSUE, query:$q, first:100) {
        edges {
          node {
            ... on PullRequest {
              author { login }
              repository { nameWithOwner }
            }
          }
        }
      }
    }`;
  const now = new Date();
  const from = new Date(now);
  from.setUTCFullYear(from.getUTCFullYear() - 1);
  const fromDate = from.toISOString().slice(0, 10);

  const authors = new Map();
  const repos = new Map();
  const q = `is:pr reviewed-by:${USER} -author:${USER} created:>=${fromDate}`;
  const res = await gql(query, { q });
  for (const e of res.search.edges) {
    const login = e.node?.author?.login;
    if (login) authors.set(login, (authors.get(login) ?? 0) + 1);
    const repo = e.node?.repository?.nameWithOwner;
    if (repo) repos.set(repo, (repos.get(repo) ?? 0) + 1);
  }
  return {
    distinct: authors.size,
    top: [...authors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
    repos,
  };
}

function computeCycleFromPRs(prs) {
  const now = Date.now();
  const yearAgo = now - 365 * 24 * 60 * 60 * 1000;
  const hours = prs
    .filter((p) => p.mergedAt && new Date(p.mergedAt).getTime() >= yearAgo)
    .map((p) => (new Date(p.mergedAt) - new Date(p.createdAt)) / (1000 * 60 * 60))
    .filter((h) => h >= 0)
    .sort((a, b) => a - b);
  if (!hours.length) return { p50: 0, mean: 0, p90: 0, sameDayPct: 0 };
  const p = (q) => hours[Math.max(0, Math.floor(hours.length * q) - 1)];
  const mean = hours.reduce((a, b) => a + b, 0) / hours.length;
  const sameDay = hours.filter((h) => h < 24).length;
  return {
    p50: Math.round(p(0.5) * 10) / 10,
    mean: Math.round(mean * 10) / 10,
    p90: Math.round(p(0.9) * 10) / 10,
    sameDayPct: Math.round((sameDay / hours.length) * 100),
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

const CONV_TYPES = ["feat", "fix", "refactor", "test", "chore", "docs", "perf", "style", "build", "ci"];

function classifyHeadline(headline) {
  if (!headline) return "other";
  const m = headline.trim().toLowerCase().match(/^([a-z]+)(?:\([^)]+\))?!?:/);
  if (m && CONV_TYPES.includes(m[1])) return m[1];
  return "other";
}

function computeCommitTypes(prs) {
  const counts = {};
  for (const t of [...CONV_TYPES, "other"]) counts[t] = 0;
  for (const p of prs) {
    for (const c of p.commits?.nodes ?? []) {
      const authors = c.commit?.authors?.nodes ?? [];
      const isMine = authors.some(
        (a) =>
          a.user?.login === USER ||
          (typeof a.email === "string" && a.email.includes(USER)),
      );
      if (!isMine) continue;
      const t = classifyHeadline(c.commit?.messageHeadline);
      counts[t] = (counts[t] ?? 0) + 1;
    }
  }
  return counts;
}

function countDistinctRepos(prs, extraRepos = new Map()) {
  const merged = new Map(extraRepos);
  for (const p of prs) {
    const name = p.repository?.nameWithOwner;
    if (!name) continue;
    merged.set(name, (merged.get(name) ?? 0) + 1);
  }
  return { distinctCount: merged.size };
}

async function loadPrevious() {
  try {
    const raw = await readFile(path.join(OUT_DIR, "stats.json"), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

const DEGRADE_THRESHOLD = 0.4;
const DEGRADE_ABS_MIN = 40;

function isDegraded(newVal, prevVal, absMin = DEGRADE_ABS_MIN) {
  if (!prevVal || prevVal < absMin) return false;
  return newVal < prevVal * DEGRADE_THRESHOLD;
}

function pickHigher(newVal, prevVal) {
  const a = typeof newVal === "number" ? newVal : 0;
  const b = typeof prevVal === "number" ? prevVal : 0;
  return Math.max(a, b);
}

function reconcile(fresh, prev) {
  if (!prev) return { stats: fresh, staleFields: [] };

  const staleFields = [];
  const stats = JSON.parse(JSON.stringify(fresh));

  const rescueSet = (field, getter, setter) => {
    if (isDegraded(getter(fresh), getter(prev))) {
      setter(stats, getter(prev));
      staleFields.push(field);
    }
  };

  rescueSet(
    "prsMerged",
    (s) => s.totals.prsMerged,
    (s, v) => (s.totals.prsMerged = v),
  );
  rescueSet(
    "prsOpened",
    (s) => s.totals.prsOpened,
    (s, v) => (s.totals.prsOpened = v),
  );
  rescueSet(
    "prsReviewed",
    (s) => s.totals.prsReviewed,
    (s, v) => (s.totals.prsReviewed = v),
  );

  if (staleFields.includes("prsMerged")) {
    stats.cycle = prev.cycle;
    stats.sizeHistogram = prev.sizeHistogram;
    stats.ttfrHistogram = prev.ttfrHistogram;
    stats.commitTypes = prev.commitTypes;
    stats.prSampleSize = prev.prSampleSize;
    staleFields.push("cycle", "sizeHistogram", "ttfrHistogram", "commitTypes");
  }

  const mono = [
    "prsMergedAllTime",
    "careerTotal",
    "distinctAuthorsReviewed",
    "reposTouched",
    "peakYearTotal",
    "publicRepos",
  ];
  for (const key of mono) {
    stats.totals[key] = pickHigher(stats.totals[key], prev.totals?.[key]);
  }
  if (prev.totals?.peakYear && stats.totals.peakYearTotal === prev.totals.peakYearTotal) {
    stats.totals.peakYear = prev.totals.peakYear;
  }
  stats.totals.yearsShipping = pickHigher(
    stats.totals.yearsShipping,
    prev.totals?.yearsShipping,
  );

  if (prev.careerYears?.length) {
    const prevMap = new Map(prev.careerYears.map((y) => [y.year, y.total]));
    stats.careerYears = stats.careerYears.map((y) => ({
      year: y.year,
      total: pickHigher(y.total, prevMap.get(y.year) ?? 0),
    }));
  }

  stats.totals.contributionsLastYear = pickHigher(
    stats.totals.contributionsLastYear,
    prev.totals?.contributionsLastYear,
  );

  if (staleFields.length) {
    stats.snapshot = {
      hasStale: true,
      snapshotAt: prev.generatedAt,
      staleFields,
    };
    console.log(
      `[fetch-metrics] detected data loss, falling back to previous values for: ${staleFields.join(", ")}`,
    );
  } else {
    stats.snapshot = { hasStale: false };
  }
  return { stats, staleFields };
}

async function main() {
  console.log(`[fetch-metrics] user=${USER}`);
  await mkdir(OUT_DIR, { recursive: true });

  const previous = await loadPrevious();

  const [contributions, prof, prs, langs, reviewedInfo, careerYears] =
    await Promise.all([
      fetchContributions(),
      fetchProfile(),
      fetchMergedPRDetail(5),
      fetchTopLanguages(),
      fetchReviewedAuthors(),
      fetchCareerYears(2016),
    ]);
  const careerTotal = careerYears.reduce((a, b) => a + b.total, 0);
  const firstActiveYear =
    careerYears.find((y) => y.total > 0)?.year ?? 2016;
  const peakYear = careerYears.reduce(
    (m, y) => (y.total > m.total ? y : m),
    careerYears[0],
  );

  const { currentStreak, longestStreak } = computeStreaks(contributions.days);
  const topLanguage = langs[0]?.name ?? "TypeScript";
  const cycle = computeCycleFromPRs(prs);
  const sizeHistogram = computeSizeHistogram(prs);
  const ttfrHistogram = computeTTFRHistogram(prs);
  const commitTypes = computeCommitTypes(prs);
  const repoInfo = countDistinctRepos(prs, reviewedInfo.repos);

  const fresh = {
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
      distinctAuthorsReviewed: reviewedInfo.distinct,
      reposTouched: repoInfo.distinctCount,
      careerTotal,
      firstActiveYear,
      yearsShipping: new Date().getUTCFullYear() - firstActiveYear + 1,
      peakYear: peakYear.year,
      peakYearTotal: peakYear.total,
    },
    careerYears,
    cycle,
    topLanguages: langs,
    sizeHistogram,
    ttfrHistogram,
    commitTypes,
    prSampleSize: prs.length,
  };

  const { stats, staleFields } = reconcile(fresh, previous);

  await writeFile(
    path.join(OUT_DIR, "contributions.json"),
    JSON.stringify({ weeks: 52, days: contributions.days }, null, 2),
  );
  await writeFile(
    path.join(OUT_DIR, "stats.json"),
    JSON.stringify(stats, null, 2),
  );

  console.log(
    `[fetch-metrics] wrote ${contributions.days.length} days · ${contributions.total} contributions · ${stats.totals.prsMerged} merged · ${stats.totals.prsReviewed} reviewed · sampled ${prs.length} PRs${staleFields.length ? ` · fallback: ${staleFields.join(",")}` : ""}`,
  );
}

main().catch((err) => {
  console.error("[fetch-metrics] failed:", err.message);
  process.exit(1);
});
