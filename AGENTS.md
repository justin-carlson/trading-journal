# Agent Instructions

## Project Overview

This is a front-end-heavy trading journal app for reviewing trades, sessions,
and AI coaching feedback. Prioritize fast UI iteration, clean information
hierarchy, and preserving existing behavior.

Default priorities:

- Preserve existing behavior before chasing polish.
- Prefer small, targeted diffs over broad rewrites.
- Keep the journal, calendar, trades, and reports flows feeling consistent.
- Optimize for scanability, review speed, and low-friction iteration.

## Tech Stack

- App framework: Next.js 16 App Router + React 19
- Styling system: Tailwind CSS v4 + app-level CSS variables in
  `src/app/globals.css`
- Database: Drizzle ORM over local SQLite/libSQL, with optional Turso remote DB
  via env vars
- Auth: no user auth layer; account selection is local and cookie-scoped
- Charts/data: TradingView Lightweight Charts, Massive candle fetches, local
  candle cache, execution-derived chart fallback
- Package manager: npm

## Important Directories

- `src/app/`: routes, layouts, server actions, and API route handlers
- `src/components/`: reusable UI building blocks and screen-level components
- `src/lib/`: utilities, data transforms, import parsers, account scope, DB
  access, candle fetching
- `src/lib/db/` and `drizzle/`: schema and migrations
- `docs/`: product specs, design system notes, analytics research, coach docs,
  and app map
- `data/`: local/private SQLite DB files and imported data fixtures

## Fast Working Loop

- Prefer narrow `rg` / `rg --files` searches over broad repo scans.
- Generated and reference-heavy paths are excluded in `.rgignore`. Only search
  them when the task explicitly needs them.
- Before editing, identify the specific files involved.
- For UI tasks, inspect the relevant component tree first, then patch only what
  is needed.
- For UI or visual polish work, read
  `docs/design/DESIGN_SYSTEM_ONE_SHEET.md` first and use
  `docs/design/DESIGN_SYSTEM.md` as the deeper reference when needed.
- Avoid touching `.env*`, `data/`, and private broker exports unless the task
  is specifically about local setup, parsing, or data repair.

## Working Rules

- Do not rewrite large parts of the app unless explicitly asked.
- Prefer small, targeted diffs.
- Preserve current styling patterns unless the task asks for a redesign.
- Do not introduce new dependencies without asking.
- Do not change the database schema unless the task explicitly requires it.
- Preserve existing account scoping, date filtering, and navigation behavior
  unless the task is about those flows.
- Be careful around ET date handling, `returnTo` links, import dedupe, and chart
  fallback behavior. Many screens depend on those assumptions.

## Validation Policy

For small UI, copy, CSS, and landing page changes:

- Prefer `npm run verify:quick`.
- Do not run a full production build after every small edit.

For local TypeScript/React logic changes that do not affect routing, database,
imports, charting, APIs, or shared contracts:

- Run `npm run verify:types`.

For routing, database, import, charting, API, or shared component changes:

- Run `npm run verify:full`.

For docs-only changes:

- No verification is required unless scripts or executable examples changed.

Before committing:

- Run the smallest relevant verification command.
- Mention any skipped verification in the final response.

Before pushing to `main` or deploying:

- Run `npm run verify:full`.

## Verification Notes

- `verify:quick` runs ESLint with a local cache under `.next/cache`.
- `verify:types` runs cached lint plus `tsc --noEmit`.
- `verify:full` runs cached lint and a production build.
- `npm run test` exists, but is not part of the default verification loop yet.

## Design Rules

- Prioritize typography, spacing, hierarchy, rhythm, and scanability.
- Trading screens should be dense but not cluttered.
- Use clear visual hierarchy for session verdicts, trade metrics,
  screenshots/charts, and review notes.
- Use type, spacing, and hairlines before adding more boxes or decoration.
- Give journal prose and review sections room to breathe.
- Avoid decorative UI that reduces speed or clarity.

## Response Style

- Start with a brief plan only when needed.
- Avoid long explanations unless asked.
- Summarize changed files and verification at the end.
- Call out anything intentionally not tested.
