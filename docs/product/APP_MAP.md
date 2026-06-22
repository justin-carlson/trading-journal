# App Map

## Core Screens

- Landing: `/` is the marketing/front-door page, not the main journal workflow.
- Dashboard: `/dashboard` is the active-day surface for planning,
  accountability, and check-ins. It keeps the plan, market read, risk posture,
  and notes visible while the user trades, then hands durable review context to
  Journal and Coach. It is intentionally lighter than Analytics and does not own
  detailed daily recap review.
- Trade import: `/import` uses `ImportForm`, `src/app/import/actions.ts`, and
  `src/lib/import/persist.ts`.
- Trade detail: `/trades/[id]` shows the chart, executions, note composer, and
  breadcrumbs back into trades/journal/calendar review flows.
- Session review: `/journal` handles day/week/month recap; `/trades/review`
  handles ticker-by-day review; `/calendar` gives the month/year overview.
- AI coach / report: `/reports` is the live analytics screen. The fuller coach
  system is still primarily specified in `docs/coach/TRADING_COACH.md`,
  `docs/analytics/STATISTICAL_REVIEW.md`, and
  `docs/analytics/REVIEW_ENGINE_SPEC.md`.
- Settings: `/settings` holds account selection support, theme settings, export,
  and dev reset tools.
- Demo: `/demo` is the read-only preview path.

## Data Flow

1. Trade data enters through CSV import in `ImportForm` and
   `src/app/import/actions.ts`, or through local demo/setup scripts.
2. CSVs are normalized by `src/lib/import/tos.ts`, `src/lib/import/das.ts`, and
   `src/lib/import/match.ts`.
3. Data is stored through `src/lib/db/index.ts` using the schema in
   `src/lib/db/schema.ts`.
4. The UI reads that data into `TradeJournalReview`, trades pages, calendar,
   reports, and trade detail screens.
5. AI review is intended to use structured trade facts, journal notes, and the
   deterministic evidence model defined in the coaching/review docs. The LLM
   layer should narrate from precomputed facts, not invent math.

## Important Concepts

- Session verdict: a deterministic read assembled from distribution shape,
  session economics, trend relationship, dominant mechanism, and path
  interpretation.
- Time review: most screens reason in ET market dates, not raw UTC timestamps.
  Date filters and intraday charts are sensitive to this.
- Significance: the research direction favors evidence-weighted statistical
  significance over simple win-rate storytelling.
- Conceptual math: expectancy, profit factor, breakeven win rate, trim
  retention, trend votes, and contradiction scoring are core to the intended
  coach.
- What we missed: the coach should surface the top contradiction or surprise,
  not just the biggest loser.
- One thing to try next session: output should be one constrained, measurable,
  expiring experiment, not vague advice.

## Known Fragile Areas

- Do not touch: execution-to-trade matching, ET date conversion rules, or
  account scoping defaults unless the task explicitly needs it.
- Be careful with: `src/components/TradeJournalReview.tsx`,
  `src/lib/import/persist.ts`, `src/lib/candles/index.ts`,
  `src/app/(app)/trades/[id]/page.tsx`, and
  `src/app/(app)/trades/review/page.tsx`.
- Current workaround: candle fetch failures degrade to cached/empty/fallback
  chart behavior instead of crashing; the hosted demo is read-only; missing
  account cookie state falls back to the first account.
