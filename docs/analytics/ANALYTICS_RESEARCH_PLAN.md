# Analytics Research Plan

> Status: draft research plan
> Last updated: 2026-06-20
> Inputs: current `/reports` implementation, existing coach/statistics docs, and
> reference screenshots from Tradervue-style reports.

## Purpose

The analytics space should help a trader answer one question quickly:

> What should I change, keep, or investigate before the next session?

This is not meant to become a wall of reports. The product should support a
configurable analytics workspace where users can add, remove, and reorder the
review tools that match their process, while preserving a strong default view
for common post-trade review.

The north star is a diagnostic workspace, not a generic dashboard:

- Explain outcome: P&L, win rate, profit factor, average trade, drawdown.
- Explain edge quality: expectancy, payoff ratio, R-multiple behavior, outlier
  dependency.
- Explain location of edge: time, symbol, tag/setup, price bucket, duration.
- Explain behavior: overtrading, give-back, holding winners/losers, rule drift.
- Turn analysis into one next action, especially when paired with the AI coach.

## Current Product Baseline

The live `/reports` page already supports:

- Account-scoped trade loading.
- Date presets and custom ranges.
- Symbol, side, and tag filtering.
- Cumulative P&L line.
- Performance snapshot and detailed stats matrix.
- Count and P&L distributions by duration, day of week, hour of day, and month.

Current deterministic data is mostly trade-level:

- Available now: account, symbol, side, quantity, entry/exit price, entry/exit
  time, fees, gross/net P&L, executions, tags, journal fields, cached candles.
- Partially available: stop loss, target, setup, route, position effect, candle
  volume.
- Not reliably available yet: initial planned risk, R per trade, plan adherence
  taxonomy, market regime, liquidity add/remove semantics, MAE/MFE snapshots,
  commissions vs fees split, benchmark/index context.

## Reference Screenshot Takeaways

The reference product organizes reports around these families:

- Overview: recent daily P&L, cumulative P&L, volume, win percentage.
- Detailed stats: a broad matrix of trade and day statistics.
- Win vs loss days: compare winning-day behavior against losing-day behavior.
- Drawdown: drawdown summary and advanced risk charts.
- Compare: compare two filtered trade groups.
- Tag breakdown: aggregate performance by tag.
- Advanced: configurable trend and quick/custom scatter reports.

Useful ideas to borrow:

- Persistent global filters across all report modules.
- A stats matrix that makes label/value comparison fast.
- Tag/setup breakdowns as an edge-attribution tool.
- Compare mode for validating "this subset is better than that subset."
- Trend widgets for rolling win rate, expectancy, profit factor, and average
  trade.
- Scatter plots for relationships like duration vs P&L or price vs P&L.

Ideas to avoid copying wholesale:

- Locked/premium placeholder report grids.
- Too many equal-weight tabs before the default analytics story is clear.
- Advanced metrics with weak actionability, such as SQN, K-ratio, or random
  chance probability, unless they are backed by the deterministic review engine.
- Liquidity reports until imports reliably expose add/remove liquidity.

## Priority Levels

### Level 1: Core Review

These are the default analytics modules. They answer the most common review
questions and should be visible without customization.

| Module | Question | Data readiness | Notes |
| --- | --- | --- | --- |
| Summary scorecard | How did I do? | Available now | Total P&L, win rate, profit factor, avg trade, avg win/loss, payoff ratio, trade count. |
| Cumulative P&L | What was the path? | Available now | Use date/session ordering; supports drawdown later. |
| Daily P&L bars | Which days drove the period? | Available now | Good overview replacement for raw report tabs. |
| Win/loss and payoff pair | Was it hit rate or payoff? | Available now | Always show win rate with payoff ratio/profit factor. |
| Distribution by time | When does edge show up? | Available now | Start with hour of day; later use 30-minute windows. |
| Distribution by duration | Are holds helping or hurting? | Available now | Already implemented as count and performance. |
| Distribution by symbol | Which tickers matter? | Available now | Needs a chart/table module. |
| Tag/setup breakdown | Which labels carry edge? | Available now | Use existing tags first; setup field can follow. |
| Recent sessions table | What should I inspect? | Available now | Link back to calendar/journal/trades. |

Level 1 should make the current page stronger before adding complex advanced
reports. The main implementation work is packaging existing calculations into a
widget registry and adding missing symbol/tag/session modules.

### Level 2: Diagnostic Edge

These modules make the analytics space meaningfully better than a basic journal.
They should be fast-follow widgets once Level 1 is coherent.

| Module | Question | Data readiness | Notes |
| --- | --- | --- | --- |
| Drawdown summary | How bad was the pain? | Derivable now | Peak-to-trough drawdown, current drawdown, longest drawdown. |
| Rolling trends | Is the edge improving? | Derivable now | Rolling avg trade, win rate, profit factor, daily P&L, trade count. |
| Win vs loss days | What changes on red days? | Derivable now | Compare trade count, avg loser, hold time, volume, give-back. |
| Compare cohorts | Is A better than B? | Derivable now | Compare filters: tag vs tag, symbol vs symbol, long vs short, date ranges. |
| Price bucket breakdown | Where does edge live by price? | Derivable now | Bucket by entry price; count, win rate, net P&L, avg trade. |
| Give-back | Did I keep gains? | Derivable now | Best intraday window as percent of final daily P&L. |
| Outlier dependency | Was the period carried by one trade? | Derivable now | Trim best/worst trade and top/bottom tail. |
| Trade concentration | How many trades actually mattered? | Derivable now | Contribution of top winners/losers; material-trade count. |
| Overtrading detector | Did more trades lower quality? | Derivable now | Trade count vs avg trade/PF/E[R] when R exists. |

These should be framed as diagnostics, not decorative charts. Each one should
produce a short takeaway or "inspect these trades" link.

### Level 3: Advanced Research

These are valuable, but they need better data contracts or calibration before
they should become first-class product features.

| Module | Question | Data readiness | Notes |
| --- | --- | --- | --- |
| R-multiple analytics | Was risk-adjusted expectancy positive? | Needs reliable planned risk | Requires initial stop or risk per trade. |
| MAE/MFE | Did trades move against/for me before exit? | Needs candle/execution logic | Useful, but easy to miscompute. |
| Rule adherence | Did I follow my process? | Needs structured review fields | Can combine journal fields, tags, and setup taxonomy. |
| Market regime | Does frequency work only in certain tapes? | Needs market data or manual regime tag | Start manual before deriving. |
| Significance and bootstrap | Is this finding persistent? | Needs enough history | Belongs in the deterministic review engine. |
| Counterfactuals | What would a rule have saved? | Needs rule definitions | Example: cap cheap-bucket trades, daily stop, no re-entry. |
| Recommendation tracking | Did the one experiment help? | Needs persisted experiments | Bridges analytics and AI coaching. |

### Level 4: Later / Optional

These should not block the analytics product.

| Module | Reason to defer |
| --- | --- |
| SQN, K-ratio, probability of random chance | Low immediate actionability; risk of false precision. |
| Liquidity add/remove reports | Requires reliable route/liquidity semantics from broker data. |
| Broker-style commission/fee detail | Useful only if import sources expose it consistently. |
| Instrument ATR/RVOL/opening gap widgets | Heavy external market data dependency. |
| Highly custom chart builder | Expensive interaction surface; start with configurable widgets instead. |

## Configurable Analytics Workspace

The workspace should be built from a widget catalog. Each widget declares:

- `id`: stable identifier.
- `title`: user-facing label.
- `priority`: Level 1, 2, 3, or optional.
- `size`: compact, half, full, or table.
- `dataRequirements`: trade fields, executions, candles, journal fields, tags.
- `filtersSupported`: date, symbol, side, tag, setup, duration, account.
- `emptyState`: why the widget has no useful data.
- `defaultEnabled`: whether it appears in the starter workspace.
- `takeaway`: optional deterministic sentence generated from the metric.
- `links`: drilldowns to trades, journal day, calendar, or trade detail.

Recommended UX:

- Keep global filters at the page level.
- Add an "Edit analytics" mode for toggling modules and reordering sections.
- Use presets before freeform layout: Core Review, Edge Diagnostics, Risk,
  Behavior, Custom.
- Store the first version locally per account/browser. Move to SQLite only when
  the layout needs to travel with backups or multi-device state.
- Keep the default layout opinionated even when customization exists.

Mobile path:

- One-column module stack.
- Keep scorecard and date/filter context first.
- Collapse dense breakdowns into sortable tables before showing large charts.
- Use tap/focus details, not hover-only tooltips.

## Proposed Default Layout

1. Filter bar: date range, symbol, tag, side, duration.
2. Header scorecard: total P&L, win rate, profit factor, payoff ratio, avg
   trade, trade count.
3. Cumulative P&L and drawdown path.
4. Daily P&L bars and recent sessions table.
5. Edge attribution:
   - Time of day.
   - Duration.
   - Symbol.
   - Tag/setup.
6. Diagnostics:
   - Win vs loss days.
   - Outlier dependency.
   - Price buckets.
   - Rolling trends.

## Data Model Notes

Do not change schema just to support this plan yet. First, implement the widgets
that can be derived from current trades, executions, tags, and journal entries.

Future data fields worth considering:

- `plannedRiskAmount` or a reliable initial `stopLoss` snapshot for R.
- `initialTarget` snapshot for planned reward/risk.
- Structured setup taxonomy separate from free-form tags.
- Structured process/emotion tags separate from setup tags.
- Per-trade strategy/rule adherence fields.
- Persisted analytics layout preferences.
- Persisted experiments/recommendations for before/after review.

## First Implementation Slice

Recommended next slice:

1. Extract report calculations from `src/app/(app)/reports/page.tsx` into a
   small analytics module with typed outputs.
2. Add a widget catalog for current Level 1 modules.
3. Add missing Level 1 modules:
   - Daily P&L bars.
   - Symbol breakdown.
   - Tag breakdown table.
   - Recent sessions table.
4. Add a non-persistent "Customize analytics" panel that toggles visible modules
   within the current session.
5. Keep Level 2 modules documented but out of the first UI pass.

This gives the product the shape of a configurable analytics workspace without
forcing database changes, external data, or a custom chart builder yet.

## Open Questions

- Should R be required before advanced analytics are considered "real," or
  should dollar-native diagnostics ship first with clear labels?
- Should setup become a first-class structured field separate from tags?
- Should analytics layout preferences be browser-local, account-local in
  SQLite, or both?
- Which review horizon should the default analytics page optimize for: recent
  sessions, current month, or user-selected range?
- Should the AI coach consume the same widget outputs as deterministic fact
  packs, or should it have a separate review-engine API?
