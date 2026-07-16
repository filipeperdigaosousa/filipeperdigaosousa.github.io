# filipeperdigaosousa.github.io

Personal portfolio + live engineering metrics dashboard.

Static site. Next.js App Router (`output: 'export'`) → deployed to GitHub Pages via GitHub Actions. Metrics refreshed daily from the GitHub GraphQL API.

## Stack

- Next.js 16 (App Router, static export)
- React 19 + TypeScript
- Tailwind CSS v4 (CSS-based `@theme` config)
- `next/font/google` — Inter + JetBrains Mono
- Material Symbols icons
- `@octokit/graphql` (build-time only)
- pnpm

## Local dev

```bash
pnpm install
pnpm dev                 # http://localhost:3000
pnpm build && pnpm exec serve out   # preview static export
```

## Metrics

`scripts/fetch-metrics.mjs` runs during CI, writes JSON to `src/data/generated/`:

- `contributions.json` — daily contribution count for last 365 days
- `stats.json` — totals, streaks, PR cycle percentiles, top languages

Locally, provide a token to hit the real API:

```bash
GH_TOKEN=$(gh auth token) node scripts/fetch-metrics.mjs
```

If no token, existing stubs in `src/data/generated/` are kept.

## Deployment

Workflow: `.github/workflows/build.yml`. Triggers:
- `push` to `main`
- `schedule` cron once daily (03:17 UTC)
- manual `workflow_dispatch`

Setup checklist:
1. Push repo to GitHub as `<username>.github.io`.
2. Settings → Pages → Source: GitHub Actions.
3. Optional: add `METRICS_TOKEN` secret with a fine-grained PAT (`read:user`, `public_repo` only). Falls back to workflow `github.token` if unset.

## Content

- `src/data/profile.ts` — headline info, socials, availability
- `src/data/experience.ts` — timeline entries
- `src/data/skills.ts` — tech stack
- `src/app/labs/` — MDX post area (empty for now)

## Structure

```
src/
  app/            App Router pages
  components/     UI + layout + metrics + home + work
  data/           Hand-authored content + generated JSON
  lib/            Formatters
scripts/          Build-time GitHub fetch
public/           Static assets
```
