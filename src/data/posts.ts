export interface Post {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
}

export const posts: Post[] = [
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
    title: "Staged Migration to Expo Router without breaking releases",
    summary:
      "How I moved a React Native app off react-navigation onto Expo Router across four staged PRs — sessions, tabs, full app, cleanup. Rollback strategy included.",
    date: "2026-07-16",
    tags: ["react-native", "expo-router", "migrations"],
  },
];
