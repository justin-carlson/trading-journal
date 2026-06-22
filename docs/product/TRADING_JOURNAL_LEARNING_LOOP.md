# Trading Journal Learning Loop

## Core Idea

The Journal is the product's source of truth. The product should not let
important trading lessons disappear into archived notes. Each trading day should
create a loop where the journal captures the full record, the coach turns the
record into a learning focus, and the dashboard brings the active lesson back
into the next session.

**Dashboard prompts. Journal captures. Coach synthesizes. Dashboard reminds.**

This is the operating model behind the journal, coach, and dashboard working
together. The dashboard prompts and reminds, but the loop starts and ends with
the journal.

Trade data is the currency that flows through the system. Executions, P&L,
timing, sizing, charts, and statistical patterns make the coach more grounded,
but they are not a separate emotional or product destination. They support the
conversation between Journal, Coach, and Dashboard.

## Loop Summary

```text
Daily journal recap
  -> Coach feedback
  -> Next dashboard plan
  -> Dashboard prompts / check-ins
  -> Daily journal recap

Insights
  -> Journal context
  -> Coach feedback
  -> Dashboard reminders

Trade evidence
  -> Journal context
  -> Coach context
  -> Dashboard context
```

The dashboard is not the source of truth. It is the active surface that asks the
right question at the right moment and brings the active lesson back into view.
The journal is the durable record. Trade evidence grounds the record. Insights
flow through all three surfaces: they are captured in the journal, synthesized
by the coach, and resurfaced by the dashboard.

## Surface Responsibilities

| Surface | Owns | Sends Forward |
| --- | --- | --- |
| Journal | The durable record: trades, recap, emotions, process notes, check-ins, screenshots/charts, and the human story of the trading day. | Recap context, unresolved patterns, and user-authored carry-forward items into coach review. |
| Coach | The synthesis layer: what worked, what broke, what mattered, and what to try next. | Coach feedback, experiments, risk cues, and behavior prompts. |
| Dashboard | The reminder layer: the next session's insight, sticky cue, rule, risk guardrail, or unresolved pattern. | The next trading plan. |
| Dashboard | The live prompt layer: morning plan, midday reset, market read, emotional state, rule reminders, and "should I keep trading?" questions. | Timestamped check-ins and quick notes back into the daily recap. |

## Insight Currency

Insights are not a separate product surface. They are the learning currency that
moves through Journal, Coach, and Dashboard.

| Insight Source | How It Moves |
| --- | --- |
| Journal reflection | User-authored observations, emotions, process notes, and unresolved patterns become coach context. |
| Coach feedback | Synthesized lessons become experiments, risk cues, or behavior prompts. |
| Dashboard check-ins | In-session answers create fresh context that attaches back to the daily recap. |
| Dashboard reminders | The most important insight stays visible as a next-session cue. |

## Evidence Currency

Reports are useful because they expose trade evidence, but the learning loop
does not depend on Reports as a peer surface. Evidence should move through the
loop wherever it helps the user and coach understand the day.

| Evidence | Supports |
| --- | --- |
| Executions and trade notes | Journal recap, trade review, coach context. |
| P&L shape and risk metrics | Coach feedback, dashboard risk posture, daily recap context. |
| Timing, sizing, and hold behavior | Coach pattern detection and current experiment selection. |
| Charts and screenshots | Journal narrative and trade-specific review. |
| Statistical patterns and contradictions | Coach synthesis and future focus selection. |

## Data Objects

| Object | Home | Description |
| --- | --- | --- |
| Daily recap | Journal | Full record of the day: trades, market context, emotions, process, and user reflection. |
| Check-ins | Journal, initiated by Dashboard | Timestamped prompts from the dashboard, attached to the daily recap. |
| Coach feedback | Journal / Coach | Interpretation of journal context plus trade evidence. |
| Insight | Shared context | A lesson moving through the system: journal observation, coach synthesis, dashboard reminder, or next-session cue. |
| Current experiment | Coach -> Dashboard | A coach-generated behavior to test for a defined period. |
| Carry forward | Journal -> Dashboard | A user-authored lesson, unresolved pattern, or note that should remain visible. |
| Dashboard cue | Dashboard | Short reminder shown during the next active trading session. |
| Trade evidence | Shared context | Executions, P&L, timing, sizing, charts, and patterns used by Journal, Coach, and Dashboard. |

## Infographic Concept

The infographic should explain the product system, not the final dashboard UI.
It can be used in product docs, design reviews, and team discussions to show why
the dashboard exists.

Suggested center copy:

```text
Dashboard prompts.
Journal captures.
Coach synthesizes.
Dashboard reminds.
```

Suggested orbit nodes:

1. **Daily recap**  
   Journal captures the durable record: trades, check-ins, emotions, process,
   and context.

2. **Feedback**  
   Coach synthesizes what worked, what broke, what mattered, and what to try
   next, using journal context and trade evidence.

3. **Dashboard**  
   Prompts check-ins during the day and reminds the trader of the active lesson
   before the next session.

Optional labels inside the Dashboard node:

- **Check-in**: plan, market read, behavior, emotion, quick notes.
- **Reminder**: current experiment, risk guardrail, unresolved pattern, or
  next-session cue.

Optional side label:

- **Trade evidence**: executions, P&L shape, timing, sizing, charts, and
  patterns flow through Journal, Coach, and Dashboard as context.
- **Insights**: journal observations, coach feedback, experiments, and cues flow
  through Journal, Coach, and Dashboard as learning context.

Suggested supporting line:

```text
Every check-in can become the next session's focus.
```

## Example Loop

1. Journal note: "I chased the third extension twice after missing the clean
   entry."
2. Trade evidence: late extension entries have weak expectancy and poor
   hold-through.
3. Coach feedback: "For the next 5 sessions, no third-extension entries unless
   volume is increasing and risk is defined."
4. Dashboard cue: "Missing the first move is not a reason to lower standards."
5. Dashboard prompt: "Are you lowering standards because you missed the first
   move?" The answer attaches back to the daily recap.

## Design Notes

- Keep the visual calm and product-native: dark theme, type-led hierarchy,
  hairlines, and restrained blue/green/gold accents.
- Make the loop feel active but not noisy. This is an accountability system, not
  a gamified productivity wheel.
- Do not make the dashboard look like it owns the full record. The visual should
  clearly show Journal as the core durable capture surface and the place the
  loop returns.
- Treat trade evidence as shared context, not a peer node unless the visual
  needs an explicit data layer.
- Treat insights as shared learning context, not a peer node. The visual should
  show insights moving through the loop rather than living in a standalone card.
- Use "Dashboard prompts" instead of "Dashboard captures" in central copy.
