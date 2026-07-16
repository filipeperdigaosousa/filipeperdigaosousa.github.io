export interface Post {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
}

export const posts: Post[] = [
  {
    slug: "leading-a-pod-while-still-coding",
    title: "Leading a Pod While Still Coding",
    summary:
      "The Pod Lead role in a product-engineering org: what you own, what you delegate, and how to stay hands-on without dropping the ball on cycle delivery.",
    date: "2026-07-16",
    tags: ["leadership", "process", "senior"],
  },
  {
    slug: "reviewing-600-prs-a-year",
    title: "Reviewing 600+ PRs a Year: the patterns I actually use",
    summary:
      "Six years of reviewing more PRs than I author. Triage rules, the 30-second first pass, when to comment vs pair, and how the AI bot fits in.",
    date: "2026-07-16",
    tags: ["code-review", "engineering-practice", "senior"],
  },
  {
    slug: "staged-migration-to-expo-router",
    title: "Migrating React Native from React Navigation to Expo Router",
    summary:
      "An incremental migration from react-navigation to Expo Router — one screen-tree at a time, over four weeks, without a feature-freeze window.",
    date: "2026-07-16",
    tags: ["react-native", "expo-router", "migrations"],
  },
  {
    slug: "react-native-to-web",
    title: "Bringing a React Native App to the Web",
    summary:
      "Cross-platform playbook: page-by-page redesigns, static-asset infrastructure on GCS, stale-chunk recovery, and Playwright e2e coverage. All without disrupting mobile releases.",
    date: "2026-07-16",
    tags: ["react-native", "expo-router", "web", "migrations"],
  },
  {
    slug: "workspace-scoped-urls",
    title: "Scoping the Workspace ID into the URL",
    summary:
      "One tenant. Many workspaces. How I refactored routing to make the workspace ID part of the URL — deep-links, tab-per-workspace, and no ambiguity about \"where am I?\".",
    date: "2026-07-16",
    tags: ["react-native", "expo-router", "multi-tenant", "routing"],
  },
  {
    slug: "first-user-setup-flow",
    title: "Designing a First-User Setup Flow Across Web and Mobile",
    summary:
      "Onboarding an entire team into a product from scratch: step-based navigation, CSV import, device-to-user assignment, feature-flag rollout, and a shared setup framework reused across surfaces.",
    date: "2026-07-16",
    tags: ["onboarding", "react-native", "product-engineering"],
  },
  {
    slug: "org-admin-panel",
    title: "Shipping a Multi-Tenant Admin Panel in Four Weeks",
    summary:
      "A cross-workspace admin panel: tenant-scoped routes, a reusable bulk-actions framework, a wizard shell that ships once and hosts every operation. Six-week cycle recap.",
    date: "2026-07-16",
    tags: ["multi-tenant", "graphql", "architecture"],
  },
];
