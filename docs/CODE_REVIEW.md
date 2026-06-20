# Code Review — Trading Journal

**Reviewer:** Engineering review (read-only pass, no code changed)
**Date:** 2026-06-18
**Scope:** Full `src/` tree, data layer, import pipeline, schema/migrations, repo hygiene
**Health at time of review:** Tests 7/7 passing · strict TypeScript · zero `any`-casts · zero `TODO`/`FIXME` in `src/`

---

## TL;DR

**Good and clean — clearly written by someone who knows the domain.** The data model is
correct, the genuinely hard parts (timezones, fee joins, round-trip matching, idempotent
imports) are handled with care and explained inline, and test coverage is aimed where the
risk actually is. This reads like a thoughtful real product, not a tutorial clone.

The weak spots are the kind you accumulate from iterating on the *product* faster than the
*schema*. None are alarming; they're normal early-stage debt on a solid foundation. In
priority order: the overloaded `journal_entries` table, mock/prototype routes shipping in
the production tree, and ~6 MB of design HTML committed to the repo.

---

## What the app does

A **local-first trading journal**. Core loop:

1. Import a broker CSV (ThinkorSwim account statement or DAS trade summary).
2. The importer parses individual **fills (executions)** and matches them into round-trip
   **trades**.
3. It fetches 1-minute OHLCV **candles** (Massive / Polygon-style API) for each traded
   symbol/day and caches them.
4. The user reviews journal-first — month/week/day chronology, daily recaps, per-trade
   notes, charts, a calendar, and reports.

The defining design choice (`src/lib/db/schema.ts:1-8`): **executions are the source of
truth; a trade is a *derived* round-trip grouping.** The right model for this domain, and
the codebase respects it consistently.

**Stack:** Next.js 16 App Router + React 19 (server components + server actions),
Drizzle ORM over SQLite (libsql client — local file *or* hosted Turso), Tailwind v4,
lightweight-charts, Vitest.

---

## Strengths

### The `lib/` layer is excellent
Business logic is pure, isolated, and tested.
- `src/lib/pnl.ts` — a tiny shared module so the trade table, detail view, and calendar
  cannot disagree on P&L math.
- `src/lib/import/match.ts` — `matchTrades` is a clean position-walking state machine that
  correctly handles scaling in/out and **flipping through zero** (a fill crossing zero
  splits into a close + a new opposite trade). Most hobby journals get this wrong.

### The hard problems are handled thoughtfully, with comments that explain *why*
- **DST-correct timezones** via an iterative solver against IANA zones
  (`src/lib/time.ts:49-74`) instead of naive offset math. TOS exports Pacific wall-clock;
  storage is UTC epoch; display is Eastern — all kept straight.
- **Idempotent imports.** A stable per-occurrence `sourceRowHash`
  (`src/lib/import/tos.ts:147-158`) plus a unique index and `onConflictDoNothing` makes
  re-importing the same statement a no-op. There is a test proving it
  (`src/lib/import/persist.test.ts`).
- **Fee subtleties** — fees live in a different CSV section and are joined back
  best-effort, *split* across identical fills to avoid double-counting
  (`src/lib/import/tos.ts:60-95`), then allocated proportionally to matched shares
  (`src/lib/import/match.ts:135`).

### Sound hygiene throughout
- Transactional, chunked inserts; good composite indexes including a dedicated
  `drizzle/0003_performance_indexes.sql` migration.
- Account scoping applied on every query.
- Candle layer is fetch-once-then-cache, with errors degraded to an empty "no data" chart
  instead of a crash (`src/lib/candles/index.ts:92-115`).
- API key read server-side only (`src/lib/candles/massive.ts`).
- Small open-redirect guard (`safeInternalHref`) in `src/app/journal/page.tsx:9`.
- Strict TypeScript, no `any`, no `TODO`/`FIXME`, tests on exactly the riskiest code
  (parsing + persistence).

---

## Findings & recommendations

Ordered by priority.

### 1. `journal_entries` columns are semantically overloaded — **highest priority**
The schema declares meaningful fields — `thesis`, `whatWentWell`, `whatWentWrong`,
`lessons`, `followedPlan`, `emotionalState` (`src/lib/db/schema.ts:148-172`). But the write
path repurposes them (`src/app/journal/actions.ts:72-80`):

| Column          | Schema intent     | Actual stored value                   |
| --------------- | ----------------- | ------------------------------------- |
| `lessons`       | lessons learned   | the free-text note body               |
| `emotionalState`| emotional state   | the primary trade *label* (e.g. "Best setup") |
| `whatWentWell`  | what went well    | JSON-encoded **process** tags         |
| `whatWentWrong` | what went wrong   | JSON-encoded **emotion** tags         |

The product clearly pivoted to pills/labels and the table did not follow. It works, but the
schema now lies about intent and structured tags are stuffed into text columns as JSON.

**Recommendation:** add columns that match the real model (`note`, `primary_label`,
`process_tags`, `emotion_tags`) and write a migration to move existing data. The decode
path already tolerates both JSON and legacy comma-text (`src/lib/journalLabels.ts:59-75`),
which gives a safe migration window.

### 2. Trade matching only runs on freshly-inserted fills
`src/lib/import/persist.ts:97-98` matches `newExecutions` only. A round-trip split across
two imports (open in one CSV, close in a later one) is **not** stitched together, and
existing trades are never re-matched/updated.

- **Impact:** fine for "import a full statement at once"; a latent correctness bug for
  incremental imports.
- **Recommendation:** either document the "import complete statements" constraint
  explicitly, or re-match against open trades for the symbol on insert.

### 3. Mock/prototype routes ship in the production route tree
Five `*mock*` pages plus `/trades/lightweight-prototype` live under `src/app/`:
`journal/mock/{page,day,month}`, `reports/stats-mock`, `trades/review/mock`,
`trades/lightweight-prototype`. These are publicly reachable and built/deployed.

- **Recommendation:** gate behind an env flag (e.g. reuse the demo-mode pattern) or move
  them out of `src/app/`.

### 4. Repo bloat from design artifacts
`samples/Journal Design/` contains **four ~1.4 MB HTML files** (vendored React dev builds)
plus several 100 KB+ prototype HTML files — roughly **6 MB** of committed
binaries-as-text that every clone now carries
(`docs/design/prototypes/trade_chart (10)-prototype.html`,
`docs/design/DESIGN_SYSTEM_ONE_SHEET.html`, etc.).

- **Recommendation:** prune, or move to a separate branch / release asset / design repo.
- **Note (good):** the `.db` files *are* correctly gitignored and not tracked.

### 5. Smaller items
- **CSV export formula injection** — `csvValue` (`src/app/api/export/trades/route.ts:8`)
  escapes quotes correctly but does not neutralize a leading `=` / `+` / `-` / `@`, so a
  crafted symbol/setup could execute as a formula in Excel. Low risk for a personal tool,
  but export is a shipped feature; prefix risky cells with a `'`.
- **No auth on the deploy path** — local-first is the design, but Turso/Vercel deployment
  is documented and `DEMO_READ_ONLY` only disables *writes*, not *reads*. Anything deployed
  is world-readable. Call this out for anyone hosting it.
- **Partial candle days** — `ensureDayCached` returns early if *any* bar exists in the
  day's range (`src/lib/candles/index.ts:40-54`), so a partially-fetched day won't
  complete. Edge case; minor.

### 6. A few God-components
`src/app/reports/page.tsx` (~989 lines), `src/components/TradeJournalReview.tsx` (~950),
`src/app/journal/mock/month/page.tsx` (~644) mix data fetching with heavy rendering. Not
broken, but they will get harder to change. The discipline in `lib/` hasn't fully reached
the page layer.

- **Recommendation:** extract data-loading and sub-sections as the files keep growing.

---

## Suggested order of work

1. **`journal_entries` schema realignment** (#1) — correctness/clarity landmine, do first.
2. **Gate or remove mock routes** (#3) — quick win, removes public surface.
3. **Prune design-artifact bloat** (#4) — quick win, shrinks clone size.
4. **Decide matching semantics** (#2) — document the constraint or fix incremental imports.
5. **Export hardening + deploy-auth note** (#5) — low effort, closes real gaps.
6. **Decompose the large page components** (#6) — ongoing, as they change.

---

## Verdict

A clean, well-architected early-stage codebase with correct domain modeling and unusually
careful handling of the hard parts. The debt is concentrated in the schema (overloaded
`journal_entries`) and the repo's shipped surface (mock routes, design artifacts), not in
the core logic. Address the schema first; the rest are mostly quick wins.
