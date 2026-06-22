# Daily Recap Flow

## Status

Concept captured from dashboard/journal review exploration on 2026-06-22.

This document preserves the daily recap ideas that emerged while prototyping the
dashboard and journal loop. The current clickable review prototype may stay
lightweight, but these concepts should remain available for later product and UI
work.

## Core Idea

The daily recap is the journal's durable day container. It should start simple
in the normal journal day view, then open into a full-page review workspace when
the trader needs to complete the day, add context, and ask the coach for
feedback.

The dashboard prompts and pre-populates context. Trade import provides the
objective evidence. The trader adds color and reflection. The coach synthesizes
the record. The dashboard resurfaces the few lessons that should affect the next
session.

```text
Dashboard check-ins
  -> Trade import / daily evidence
  -> Journal daily recap
  -> Coach review
  -> Carry-forward cues
  -> Next dashboard
```

## Product Flow

1. **Dashboard captures the trading day in motion**
   - Pre-market or morning plan.
   - Midday reset.
   - Power-hour or end-of-day note.
   - Market read, trader state, tickers in play, risk posture, and quick notes.

2. **Trade import completes the objective record**
   - Importing trades creates daily P&L, traded tickers, executions, and chart
     evidence.
   - After importing today's trades, the next natural destination should be the
     daily recap review.
   - Historical bulk imports may not need to force the daily recap editor.

3. **Journal opens the full-page daily recap editor**
   - The current journal day can keep a compact recap card.
   - Clicking the recap or choosing "view full recap" opens a larger editor.
   - The editor starts with generated/imported context but must remain editable.

4. **Trader adds thoughts before coach review**
   - The user should have a moment to add what the data cannot know: hesitation,
     frustration, conviction, tape feel, why a rule was hard, or what changed
     during the session.
   - The coach should review the trader's completed record, not only raw trade
     data.

5. **Coach review attaches back to the recap**
   - The coach adds feedback as a section inside the daily recap.
   - Coach output should not replace the user-authored recap.
   - Coach review should be explicit and user-triggered.

6. **Carry-forward items return to the dashboard**
   - Only the most useful lessons should resurface tomorrow.
   - The dashboard should not show the whole recap, only the active experiment,
     risk guardrail, sticky cue, or unresolved pattern.

## Journal Day Preview

The normal journal day should not show the full daily recap by default. It
should remain readable and scannable.

Always visible:

- Date and day.
- Compact daily recap summary.
- Daily stats such as trades, P&L, win rate, and best/worst ticker.
- A quiet affordance to open the full recap.

Previewed, but not expanded:

- Dashboard input count or latest phase summary.
- Trade notes count or notable-note snippet.
- Coach review status.
- Statistical read status.
- Active carry-forward lesson when available.

Hidden until opened:

- Full phase-by-phase recap form.
- Every dashboard check-in.
- Every trade note.
- Coach context package.
- Full coach review.
- Detailed statistical analysis.

## Full-Page Daily Recap Editor

The editor is the take-over state after import or when the user opens the recap
from the journal day.

Suggested hierarchy:

1. **Generated summary**
   - Starts from trade import and current journal summary.
   - User can edit directly.

2. **Dashboard inputs**
   - Pre-market plan.
   - Midday reset.
   - End-of-day/power-hour note.
   - Market condition, market read, trader state, risk posture, and tickers in
     play.

3. **Trade evidence**
   - Imported trades, P&L, ticker sidebar, and chart/execution links.
   - Ticker-level rows should link to the stock/day review.
   - Individual trades remain deeper drilldowns for detailed trade notes.

4. **Trader thoughts**
   - User-authored context before asking the coach.
   - This is where emotional and mechanical observations live.

5. **Coach review**
   - Added after the trader asks for review.
   - Attached to the daily recap as a durable section.

6. **Statistical analysis**
   - Data-science read on the day: P&L shape, setup quality, timing, ticker
     concentration, behavior patterns, and contradictions.

7. **Carry forward**
   - Current experiment.
   - Risk guardrail.
   - Dashboard cue.
   - Unresolved pattern.

## Coach Review Components

The coach can provide multiple components rather than one long response.

| Component | Purpose |
| --- | --- |
| Narrative on the day | Plain-language read of what happened and what mattered. |
| Execution feedback | What matched the system, what broke, and where standards changed. |
| Behavior pattern | Emotional or mechanical pattern that affected decisions. |
| Statistical read | P&L shape, setup quality, timing, concentration, and contradictions. |
| Carry forward | One or more specific items to promote into the next dashboard. |

Button language can stay short. Candidate labels:

- **Ask Coach**
- **Coach Review**
- **Review Day**
- **Get Feedback**

The supporting copy can clarify the action:

> Add your thoughts first, then let the coach review the full day.

## Review Prototype Notes

The lightweight review prototype should focus on the circle of flow rather than
every trade drilldown.

Current intended prototype flow:

```text
Dashboard
  -> Import trades
  -> Daily recap editor opens
  -> Save review / close editor
  -> Journal day preview
  -> Back to dashboard
  -> Carry-forward cues visible
```

The prototype does not need the full ticker/trade drilldown yet. It only needs
enough trade evidence to explain why the daily recap is stronger after import.

## Design Decisions Captured

- The Journal owns the durable recap.
- The Dashboard is both an input surface and an output/reminder surface.
- Trade data strengthens the recap but does not replace trader reflection.
- The daily recap should be editable before coach review.
- Coach feedback should attach to the recap, not float elsewhere.
- Carry-forward items should solve the "dead end" problem by returning to the
  next dashboard.
- The normal journal day should remain compact; the full recap is a take-over
  review/editor state.

## Open Questions

- Should importing today's trades automatically open the daily recap editor, or
  show an import-complete banner with a primary review action?
- Should the compact journal recap show section snippets or only status counts?
- Should coach review be generated immediately on save, or require a separate
  explicit action after the user adds thoughts?
- How much statistical analysis belongs in the recap before it feels like
  Reports duplicated inside Journal?
