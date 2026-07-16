export interface Post {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  /**
   * If true, the post is only visible in development (localhost).
   * In production builds the route returns 404 and the index hides it.
   */
  private?: boolean;
}

export const isDev = process.env.NODE_ENV === "development";

export const posts: Post[] = [
  {
    slug: "leading-a-pod-while-still-coding",
    title: "Leading a Pod While Still Coding",
    summary:
      "The Pod Lead role in a product-engineering org: what you own, what you delegate, and how to stay hands-on without dropping the ball on cycle delivery.",
    date: "2026-07-15",
    tags: ["leadership", "process", "senior"],
  },
  {
    slug: "reviewing-600-prs-a-year",
    title: "Reviewing 600+ PRs a Year: the patterns I actually use",
    summary:
      "Six years of reviewing more PRs than I author. Triage rules, the 30-second first pass, when to comment vs pair, and how the AI bot fits in.",
    date: "2026-06-19",
    tags: ["code-review", "engineering-practice", "senior"],
  },
  {
    slug: "staged-migration-to-expo-router",
    title: "Migrating React Native from React Navigation to Expo Router",
    summary:
      "An incremental migration from react-navigation to Expo Router — one screen-tree at a time, over four weeks, without a feature-freeze window.",
    date: "2026-05-23",
    tags: ["react-native", "expo-router", "migrations"],
  },
  {
    slug: "react-native-to-web",
    title: "Bringing a React Native App to the Web",
    summary:
      "Cross-platform playbook: page-by-page redesigns, static-asset infrastructure on GCS, stale-chunk recovery, and Playwright e2e coverage. All without disrupting mobile releases.",
    date: "2026-04-28",
    tags: ["react-native", "expo-router", "web", "migrations"],
  },
  {
    slug: "workspace-scoped-urls",
    title: "Scoping the Workspace ID into the URL",
    summary:
      "One tenant. Many workspaces. How I refactored routing to make the workspace ID part of the URL — deep-links, tab-per-workspace, and no ambiguity about \"where am I?\".",
    date: "2026-04-02",
    tags: ["react-native", "expo-router", "multi-tenant", "routing"],
  },
  {
    slug: "first-user-setup-flow",
    title: "Designing a First-User Setup Flow Across Web and Mobile",
    summary:
      "Onboarding a new customer from zero — step-based navigation, CSV import, hardware-to-user assignment, feature-flag rollout, and shared primitives.",
    date: "2026-02-24",
    tags: ["onboarding", "react-native", "product-engineering"],
  },
  {
    slug: "org-admin-panel",
    title: "Building Bulk-Action Frameworks in Multi-Tenant Products",
    summary:
      "One reusable mutation shape on the API. One wizard shell on the client. How treating bulk-actions as infrastructure lets a small team ship dozens of user-facing operations in weeks.",
    date: "2026-01-18",
    tags: ["multi-tenant", "graphql", "architecture"],
  },
  {
    slug: "ten-years-one-consultancy",
    title: "Ten Years, One Consultancy, Three Clients",
    summary:
      "The unusual CV shape: one employer for a decade, three deep client engagements underneath. Trade-offs of the umbrella-consultancy model, in plain terms.",
    date: "2026-06-04",
    tags: ["career", "contracting", "personal"],
    private: true,
  },
];

export function visiblePosts(all: Post[] = posts): Post[] {
  return all.filter((p) => !p.private || isDev);
}
