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

## Reference Tab Mental Model

The reference screenshots are organized less by chart type and more by review
job. That is useful: each tab answers a different kind of trader question.

### Overview

The Overview tab is the dashboard layer. It shows recent daily P&L, cumulative
P&L, daily volume, and win percentage so the trader can quickly understand the
current period's shape. Its job is orientation: "What has happened recently, and
is the account moving in the right direction?" This is the most natural home for
the default Analytics landing state.

### Detailed

The Detailed tab is the accounting/statistics layer. It gives the full stat
matrix: total gain/loss, average trade, winning/losing trades, average
winner/loser, hold time, profit factor, max streaks, fees, and related metrics.
Its job is auditability: "Show me the numbers behind the headline." This should
remain table-like and scan-friendly, not overly charted.

### Win vs Loss Days

Win vs Loss Days compares behavior on green days against behavior on red days.
It is not just a win-rate report; it asks whether losing days have different
trade count, average loss, hold time, volume, profit factor, or give-back
patterns. Its job is behavioral diagnosis: "What changes when I lose?" This is
high value for the coach because it points toward controllable process leaks.

### Drawdown

The Drawdown tab is the risk pain layer. It summarizes average drawdown, biggest
drawdown, days in drawdown, and related risk trend charts. Its job is capital
protection: "How deep and how long are my bad stretches?" This should not be
limited to pretty equity curves; the useful version highlights peak-to-trough
loss, current drawdown, recovery time, and worst streak context.

### Compare

The Compare tab is the cohort-testing layer. It lets the trader compare two
filtered groups, such as one tag vs another, long vs short, one date range vs
another, or one symbol group vs another. Its job is validation: "Is this subset
actually better, or does it just feel better?" This is where statistical
discipline matters, because small samples and outliers can fool the user.

### Tag Breakdown

The Tag Breakdown tab is the classification layer. It aggregates P&L, count,
volume, and performance by tag or setup. Its job is edge attribution: "Which
labels are helping, and which are draining?" This should eventually separate
trade setup tags from behavior/emotion/process tags so the report does not mix
strategy and psychology into one bucket.

### Advanced

The Advanced tab is the research sandbox. It supports trend charts, moving
averages, custom axes, scatter plots, and quick reports like P&L by trade
duration. Its job is exploration: "What relationship should I investigate?" It
is useful, but it is also where charts can become eye candy. Advanced modules
should be opt-in, configurable, and tied to a concrete question.

### Cross-Cutting Filters

The filter bar is effectively the report query builder. Date range, symbol, tag,
side, duration, and P&L mode change the question every tab is answering. This
structure is worth keeping: tabs decide the review job, while filters decide the
population being reviewed.

## Reports Page Organization Recommendation

The app should probably move from one long reports page to a small tab set, but
not one tab for every possible chart. A tab should represent a review mode. A
widget should represent a specific metric or visualization inside that mode.

Recommended first tab model:

| Tab | Purpose | Default modules |
| --- | --- | --- |
| Overview | Orient the trader to the selected period. | Scorecard, cumulative P&L, daily P&L bars, recent sessions. |
| Stats | Keep the full detailed stat matrix auditable. | Performance, accuracy, sizing, timing, fees/commissions when available. |
| Edge | Show where performance is coming from. | Time of day, duration, symbol, tag/setup, price bucket. |
| Risk | Explain drawdown, losses, and account pain. | Drawdown path, worst days, streaks, average loser, loss concentration. |
| Compare | Test one cohort against another. | Two filtered groups, side-by-side metrics, statistically cautious notes. |
| Coach | Translate the analytics into a next action. | Deterministic findings, outlier test, give-back, one experiment to try. |

This keeps the mental model simple:

- Overview: what happened?
- Stats: what are the numbers?
- Edge: where does it work?
- Risk: where does it hurt?
- Compare: what is better?
- Coach: what should I do next?

The AI coach should not be buried below the charts. It should be a first-class
tab and also appear as a compact callout on Overview when the deterministic
facts produce a useful finding. The coach's job is not to add more charts; it is
to narrate the evidence and choose the one highest-leverage next experiment.

Charts that do not directly support one of these questions should be optional
widgets, not default page furniture.

## Statistical Review Framework Alignment

The statistical review framework should live in the analytics system, but it
should not be treated as just another chart tab. It is the interpretive layer
that reads across the report data and turns it into a verdict, a blind spot, and
one next experiment.

The Tradervue-style reports and the statistical review framework are
complementary:

| Layer | Role | Product shape |
| --- | --- | --- |
| Tradervue-style reports | Describe what happened by metric, bucket, cohort, and filter. | Overview, Stats, Edge, Risk, Compare tabs. |
| Statistical review framework | Interpret whether the result was robust, repeatable, risky, or actionable. | Coach tab, overview callout, journal/session digest. |
| Journal | Capture the trader's reflection and close the loop. | Daily/weekly note with embedded findings and experiment tracking. |

The screenshots from the Danny C Trades research show a different kind of
artifact than a dashboard. They are written statistical reviews with sections
like Trim Review, Session Verdict, Significance and conceptual math, What you
might have missed, and One thing to try next session. That format is valuable
because it answers questions charts do not answer by themselves:

- Was today broad-based, or carried by a few outliers?
- Did the win rate actually matter, or was payoff/risk doing the work?
- Which time window or price bucket quietly controlled the day?
- Did the headline P&L hide give-back, churn, or weak expectancy?
- What is the single rule worth testing next?

Recommended product placement:

### Analytics

Analytics owns the deterministic fact pack and the full statistical review. The
Coach tab should show the complete review when enough data exists:

- Trim Review.
- Session Verdict.
- Significance and conceptual math.
- What you might have missed.
- One thing to try next session.

This belongs in Analytics because the review depends on report-wide data,
rolling baselines, cohorts, and computed metrics. It should be generated from
precomputed facts, not freeform model math.

### Journal

Journal should surface a smaller version of the same review at the day/week/month
level. The user should not have to leave their reflection flow to see the most
important statistical finding.

Suggested journal embed:

- One-line verdict: broad green, outlier-carried, tail-caused, churn-heavy,
  payoff-led, etc.
- Key evidence: 2-4 metrics that explain the verdict.
- One thing to try next session.
- Link to the full Analytics Coach tab.

This makes the statistical framework part of the feedback loop rather than a
separate report the trader may never revisit.

### Reports Tabs

The report tabs should feed the statistical review:

| Report tab | Statistical review dependency |
| --- | --- |
| Overview | Daily P&L path, cumulative P&L, recent session context. |
| Stats | Scorecard, win rate, profit factor, payoff ratio, avg win/loss. |
| Edge | Time windows, price buckets, symbols, tags/setups. |
| Risk | Drawdown, loss concentration, streaks, worst trades/days. |
| Compare | Baselines, cohorts, before/after experiments. |
| Coach | Verdict, significance, blind spot, next experiment. |

In other words, the reports tabs are the evidence views; Coach is the synthesis.

## Statistical Review Sections

The Danny C-style review can be modeled as a repeatable section set:

| Section | Job | Data requirement | Default surface |
| --- | --- | --- | --- |
| Trim Review | Test outlier dependency by removing best/worst and tail trades. | Trade P&L, R when available. | Coach tab; compact verdict in Journal. |
| Session Verdict | Explain the day's mechanism in plain language. | Scorecard, time windows, material trades, P&L path. | Coach tab; summary in Journal. |
| Significance and conceptual math | Separate variance from meaningful edge. | Baseline windows, win rate, avg win/loss, PF, R. | Coach tab only at first. |
| What you might have missed | Surface non-obvious contradictions or quiet leaks. | Time, price, symbol, tag, outlier, give-back facts. | Coach tab; optional Journal callout. |
| One thing to try next session | Convert analysis into a falsifiable experiment. | Biggest leak plus counterfactual or measurable rule. | Coach tab and Journal. |

Suggested implementation stance:

- Ship the sections progressively, not all at once.
- Start with dollar-native versions where R is unavailable.
- Add R-native interpretations only when initial risk is reliable.
- Keep significance language conservative until enough baseline history exists.
- Store generated experiments so later journal/analytics views can check whether
  the user followed them and whether they helped.

The most important product decision is that statistical review should be
deterministic-first. The model can write the explanation, but it should only
narrate numbers produced by the analytics service.

## Dashboard And Market Context

The dashboard may be worth bringing back, but with a different purpose than the
old generic widget board. It should be the trader's orientation surface: what
state am I in, what market did I just trade, and what should I keep in mind
before the next session?

This gives Dashboard a distinct job from Analytics:

| Surface | Job |
| --- | --- |
| Dashboard | Orient before/after a session: account state, current experiment, market context, watch themes. |
| Analytics | Analyze selected trade data and evidence. |
| Coach | Interpret the evidence and turn it into a behavioral experiment. |
| Journal | Reflect, annotate, and close the loop. |

Recommended dashboard sections:

- **Today / next-session brief**: current experiment, risk guardrail, one focus
  item, link to last coach review.
- **Account pulse**: recent P&L, drawdown, win rate, profit factor, trade count,
  open trades if supported.
- **Time-aware check-in**: pre-market, open, midday, power hour, after-hours, or
  post-session mode with one prompt for the moment.
- **Market context**: market condition, active themes, and opportunity quality.
  This is a read of the tape, not a detailed stock review.
- **Sticky-note accountability**: visible plan cues from the latest journal
  reflection, coach feedback, or manual pre-market note.
- **Recent review loop**: yesterday's verdict, whether the experiment was
  followed, and what changed.
- **Daily recap handoff**: prompt the user to review top stocks and five-pillar
  fit in the daily recap, where it becomes coach input.

### Time-Aware Check-In Modes

The dashboard should change emphasis based on where the trader is in the day.
This is one concept: the dashboard mode is also the intraday check-in window.
It does not have to be fully realtime in the first version; a manual mode switch
is enough to test the workflow.

Suggested check-in modes:

| Mode | Primary job |
| --- | --- |
| Pre-market | Call the tape, name active themes, choose the first rule, and set sticky cues for the open. |
| Opening bell | Keep the plan visible, monitor setup quality, spread/liquidity quality, and chase risk. |
| Midday / lunch | Reorient after early trades: import latest fills, check churn, and decide whether continued trading is justified. |
| Power hour | Re-check continuation, squeezes, fades, second-leg moves, active themes, and risk posture. |
| After hours | Note market context and carry-forward themes; detailed mover review belongs in daily recap. |
| Hot all day | Mark exception days where stocks keep moving across multiple windows. |

For each mode, capture:

- Market read: hot, slow, choppy, thin, theme-driven.
- Active themes and whether opportunity quality is improving or fading.
- Current plan/risk cue.
- What the trader is seeing and feeling.
- Reason to stay active or stand down.
- Notes for the next review.

The mode/check-in is the bridge between static journaling and a useful
trading-day assistant. The ideal future interaction is a single import/refresh
button inside the current mode:

1. Import latest fills.
2. Recompute account pulse, trade count, realized P&L, and current risk context.
3. Show a short coach note: keep trading, risk down, stop, or step back.
4. Offer a daily recap handoff for top stocks, five-pillar fit, missed
   opportunities, and selection review.

Until direct broker/scanner integrations exist, this can start as a manual
checkpoint that reminds the trader to upload/export current data and reassess.

Later, if trade import and scanner data can be connected quickly enough, these
check-ins could become live evaluations. Until then, they should be treated as a
lightweight review structure, not a realtime trading assistant.

### Focus Reset Prompts

One dashboard job is to interrupt tunnel vision. The trader can become locked
onto tickers and stop asking whether current behavior still matches the tape.
Short focus resets can help prevent overtrading and under-risking.

This should not make the coach an oracle. The coach is a sounding board: it can
prompt, reflect, and challenge, but the trader is still naming the tape and
making the decision. The highest-value behavior may be the trader pausing long
enough to say what they see out loud or write it down. Trading is solitary, and
naming the tape plus naming the trader's state can break the spell of FOMO
before it turns into another low-quality click.

Useful reset prompts:

| Prompt | When it appears | Intended action |
| --- | --- | --- |
| Risk up | Market is hot, quality names are holding, spreads are workable, and opportunity quality is improving. | Consider whether planned risk is too conservative. |
| Risk down | Spikes are failing, names are rolling over, volume is fading, or losses are clustering. | Reduce size, trade count, or new attempts. |
| Stop trading | No A+ candidates, repeated failed breakouts, revenge entries, or rule drift. | Stand down until a better window. |
| Step back | User is deep in a window, trade count is rising, or context has changed. | Ask: what is the market doing, what am I doing, and do those still match? |

This should be framed as coaching, not prediction. The system is not telling the
trader what to buy or sell; it is helping them regulate attention, risk, and
trade frequency against the current opportunity set.

Useful self-check prompts:

| Prompt | Purpose |
| --- | --- |
| What am I seeing? | Name the market condition: hot, fading, selective, choppy, theme-driven, or no clean edge. |
| What am I feeling? | Name the trader state: calm, FOMO, impatient, frustrated, confident, tired. |
| What am I about to do? | Convert impulse into language: wait, size up, size down, stop, or take only A+ setups. |
| Does it match? | Check alignment between market condition, candidate quality, risk, and current behavior. |

### Timed Coaching Prompts

The dashboard could eventually support timed notifications. These are not
predictions or instructions; they are mentor-style check-ins at natural moments
in the trading day.

Suggested cadence:

| Timing | Prompt job |
| --- | --- |
| 15 minutes before opening bell | "How did pre-market go? What are the A+ names, active themes, and first rule for the open?" |
| 90 minutes after opening bell | "How did the opening bell session go? Are you green in a cold tape, chasing, or still seeing quality?" |
| Midday reset | "Is the market still paying, or is this becoming churn? Should risk come down until power hour?" |
| Post-market | "What did you capture, miss, or avoid? What carries into tomorrow's plan?" |

This is where the "go home green on a cold day" style of coaching belongs. The
prompt is small, but the behavioral value can be large because it interrupts the
solo chase and creates a moment of accountability.

### Daily Recap Owns Opportunity Review

Top gainers should be captured even when the trader did not trade them. They are
the day's visible opportunity set, and reviewing them creates learning material
beyond the user's executed trades.

This should live in the daily recap, not the dashboard. The dashboard may prompt
the user to complete this review, but it should not become the place where every
mover is classified and scored. Keeping it in the recap makes the context part
of the reflection record and gives the coach a cleaner input.

For each notable top gainer, capture:

- Symbol.
- Maximum intraday percent move or close-to-close percent change.
- Price range.
- Float.
- Relative volume.
- Catalyst/news.
- Theme, such as crypto, AI, biotech, energy, sympathy, or earnings.
- Whether it met the five-pillar criteria.
- Whether the trader traded it, watched it, missed it, or intentionally avoided
  it.
- If traded: quality of execution and whether the trade matched the thesis.
- If skipped: reason for staying out.
- If traded poorly: what went wrong and whether the setup was still valid.
- Lesson: capitalize next time, avoid next time, needs study, or no action.

This creates a review category that is broader than personal P&L:

- **Captured opportunity**: the trader traded the right name with reasonable
  process.
- **Missed opportunity**: the stock met criteria, moved well, and the trader had
  a clear reason to study why they stayed out.
- **Poorly executed opportunity**: the right stock, weak execution.
- **False opportunity**: looked hot, but failed the framework or was too risky.
- **Correct avoidance**: staying out was disciplined.

This is especially useful for the coach because it can later compare the
trader's actual trades against the opportunity set. A green day with no exposure
to the best names may mean the trader left quality on the table. A red day spent
trading lower-quality names while A+ names were available points to selection
discipline rather than execution alone.

The first version can be manual in the Journal daily recap. Automation can come
later through scanner imports or market data enrichment.

The market-context piece should not be mixed into the statistical review as if
it were already proven causal. It should be captured as context that helps later
analysis answer better questions, such as:

- Did high trade frequency work only on hot market days?
- Did most profit come from a dominant theme?
- Did losses cluster in low-quality market conditions?
- Did the trader force trades when no A+ candidates met the selection criteria?
- Did the trader miss or mishandle the day's best opportunities?

### Five Pillars Of Stock Selection

The user's five-pillar framework is a strong candidate for the Journal daily
recap and later trade/candidate review. It describes the quality of the
opportunity set before a trade, while analytics describes what happened after
trading. Dashboard should only summarize the read, such as "quality improving"
or "no clean A+ names," rather than storing pillar-by-pillar detail.

| Pillar | Default rule | Product use |
| --- | --- | --- |
| Price range | `$1-$20` | Candidate filter and later trade-quality context. |
| Float | `< 10M shares` | Candidate quality marker for supply/demand imbalance. |
| Relative volume | `>= 5x` | Confirms attention/liquidity and theme strength. |
| Daily percentage change | `>= 10%` | Confirms current momentum. |
| News catalyst | Required | Explains why the move may be happening. |

Possible candidate states:

- **A+ candidate**: meets all five pillars.
- **Watchable**: meets most pillars but has one caveat.
- **Avoid / low quality**: fails multiple pillars or lacks a catalyst.

This framework can support three product moments:

1. **Dashboard check-in**: orient to market quality, active themes, and risk
   posture without turning the dashboard into a scanner.
2. **During/after import**: annotate trades with the candidate quality they came
   from.
3. **Daily recap review**: compare the day's top stocks, five-pillar fit,
   actual participation, missed opportunities, and trade selection.

### Data Capture Strategy

Start lightweight and local:

- Manual market day snapshot in Journal: condition, themes, top names, notes.
- Manual candidate fields: float, relative volume, percent change, catalyst,
  theme.
- Optional import/paste from a scanner export later.

Only automate after the manual model proves useful:

- Top gainers feed.
- Relative volume and float enrichment.
- News/catalyst capture.
- Theme tagging.
- Market breadth/regime indicators.

Automated scanner data should be treated as a future integration because it adds
network/provider requirements and raises freshness, cost, and reliability
questions. Manual capture is enough to validate whether the context improves the
coach and review loop.

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
| Market context snapshot | What kind of opportunity set existed today? | Start manual; automate later | Dashboard captures condition/themes/quality; daily recap captures top stocks, catalysts, and five-pillar fit. |
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

1. Global filter bar: date range, symbol, tag, side, duration.
2. Tabs: Overview, Stats, Edge, Risk, Compare, Coach.
3. Overview default:
   - Header scorecard: total P&L, win rate, profit factor, payoff ratio, avg
     trade, trade count.
   - Cumulative P&L and drawdown context.
   - Daily P&L bars.
   - Recent sessions table.
   - Compact coach callout when a deterministic finding exists.
4. Stats default:
   - Full stat matrix.
   - Gross/net and dollar/percent/R display modes when supported.
5. Edge default:
   - Time of day.
   - Duration.
   - Symbol.
   - Tag/setup.
   - Price buckets.
6. Risk default:
   - Drawdown summary.
   - Worst days/trades.
   - Streaks.
   - Loss concentration.
7. Compare default:
   - Two user-defined cohorts.
   - Side-by-side stat matrix.
   - Caution labels for small samples/outlier-carried cohorts.
8. Coach default:
   - Outlier dependency.
   - Give-back.
   - Win-rate vs payoff diagnosis.
   - What you might have missed.
   - One next-session experiment.

## Data Model Notes

Do not change schema just to support this plan yet. First, implement the widgets
that can be derived from current trades, executions, tags, and journal entries.

Future data fields worth considering:

- `plannedRiskAmount` or a reliable initial `stopLoss` snapshot for R.
- `initialTarget` snapshot for planned reward/risk.
- Dashboard market snapshot: condition, themes, opportunity quality, notes.
- Daily recap opportunity context: top stocks, float, relative volume, daily
  percent change, catalyst, theme, five-pillar score.
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
