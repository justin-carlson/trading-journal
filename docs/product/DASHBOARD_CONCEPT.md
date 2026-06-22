# Dashboard Concept

## Page Promise

**Dashboard**

Planning, accountability, and check-ins for the trading day.

The dashboard is the trader's active-day surface. It helps the user prepare for
the session, stay accountable to the plan while trading, and answer timely
prompts that route useful context into the journal and coach loop.

It is not a second Reports page, a scanner, or a full daily recap. Reports own
analytics. Journal owns reflection and durable recap writing. The dashboard owns
the live operating loop.

## Core Jobs

| Job | Purpose |
| --- | --- |
| Planning | Name the plan, market read, active themes, risk guardrail, and focus rule before or during the session. |
| Accountability | Keep rules, max loss, risk posture, and current experiment visible while the user is trading. |
| Check-ins | Create structured pauses for morning, midday, and end-of-day/power-hour review. |
| Documentation prompts | Ask for short in-the-moment notes so the daily recap and coach have better context later. |
| Handoff | Move the important pieces into Journal and Coach instead of trapping them on the dashboard. |

## Primary Flow

1. **Morning plan**: the user names the tape, active themes, risk guardrail,
   focus rule, and sticky cues for the open.
2. **Opening session**: the dashboard keeps the plan and accountability cues
   visible while the user trades.
3. **Midday check-in**: the user records current market quality, behavior,
   P&L/trade count context, and whether to keep trading, risk down, or stop.
4. **Power-hour / end-of-day check-in**: the user notes what changed, what
   carried, and what needs to go into the daily recap.
5. **Journal / coach handoff**: the dashboard sends notes, check-ins, and cue
   outcomes into the daily recap and future coach review.

## Operating Loop

The dashboard should not become the long-term home for every note. It prompts
the active trading moment, then hands that context to the journal. The journal
is the durable record. The coach interprets that record with trade evidence and
returns the active lesson that should be visible on the next dashboard.

**Dashboard prompts. Journal captures. Coach synthesizes. Dashboard reminds.**

For the broader system model and infographic direction, see
`docs/product/TRADING_JOURNAL_LEARNING_LOOP.md`.

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

This prevents notes from becoming a dead end. Important observations should
either stay in the daily recap as context or be promoted into active
carry-forward items that remain visible while the trader works on them.

| Surface | Owns | Sends Forward |
| --- | --- | --- |
| Journal | The durable record: trades, recap, emotions, process notes, and the human story of the trading day. | Recap context and unresolved patterns into coach review. |
| Coach | The synthesis layer: what worked, what broke, what mattered, and what to try next. | Coach feedback, experiments, risk cues, and behavior prompts. |
| Dashboard | The reminder layer: the next session's insight, sticky cue, rule, risk guardrail, or unresolved pattern. | The next trading plan. |
| Dashboard | The live prompt layer: morning plan, midday reset, market read, emotional state, rule reminders, and "should I keep trading?" questions. | Timestamped check-ins and quick notes back into the daily recap. |

Useful names for promoted items:

- **Insight**: shared learning context, such as a journal observation, coach
  synthesis, dashboard reminder, or next-session cue.
- **Current Experiment**: coach-generated behavior to test for a defined period.
- **Carry Forward**: user-authored lesson or unresolved pattern from the
  journal.
- **Dashboard Cue**: short visible reminder shown during the next session.

Example:

- Journal note: "I chased the third extension twice after missing the clean
  entry."
- Coach feedback: "For the next 5 sessions, no third-extension entries unless
  volume is increasing and risk is defined."
- Dashboard cue: "Missing the first move is not a reason to lower standards."

## Component Map

### Page Header

- **Title**: Dashboard.
- **Subtitle**: Planning, accountability, and check-ins for the trading day.
- **Role**: Establish the dashboard as an active-day operating surface, not a
  generic analytics board.

### Current Phase Strip

- **Inputs**: Time of day, manual phase selection, latest check-in state.
- **Displays**: Morning plan, opening session, midday reset, power hour, or
  end-of-day handoff.
- **Role**: Tells the rest of the page what matters right now.
- **Relationships**: Drives the active prompt, primary action, and which notes
  are emphasized.

### Primary Check-In Card

- **Inputs**: Current phase, user-written notes, optional imported P&L/trade
  count context.
- **Displays**: One focused prompt for the current moment.
- **Role**: Creates the active pause: plan, reset, continue, risk down, stop, or
  hand off to recap.
- **Relationships**: Produces check-in records that feed the session notes,
  journal recap, and future coach context.

### Plan Snapshot

- **Inputs**: Pre-market note, current experiment, risk guardrail, max loss,
  latest coach focus, manual edits.
- **Displays**: Today's intended behavior in a compact scan-friendly block.
- **Role**: Makes the user's stated plan visible before trading begins.
- **Relationships**: Feeds accountability cues and gets compared against later
  check-ins.

### Accountability Cues

- **Inputs**: Manual sticky cues, latest coach feedback, recurring journal
  lessons, current experiment.
- **Displays**: Short active reminders such as rule, focus, risk boundary, or
  stop condition.
- **Role**: Replaces monitor sticky notes with app-native cues that can be
  checked, carried forward, or retired.
- **Relationships**: Should be visible near the active check-in and later feed
  the recap question: did I follow what I said?

### Market Read

- **Inputs**: Manual market condition, active themes, opportunity quality,
  user notes.
- **Displays**: Hot, choppy, thin, selective, theme-driven, broad momentum, or
  no clean edge; plus short theme notes.
- **Role**: Prompts the user to name the tape without becoming a scanner.
- **Relationships**: Informs risk posture, check-in prompts, and daily recap
  context.

### Account Pulse

- **Inputs**: Imported trades, selected account, current day/range metrics.
- **Displays**: Realized P&L, trade count, win/loss context, drawdown/max loss
  proximity, and possibly open trade state later.
- **Role**: Provides enough account context for accountability without turning
  into a full analytics surface.
- **Relationships**: Supports midday and end-of-day decisions such as keep
  trading, risk down, stop, or protect a green day.

### Risk Posture

- **Inputs**: Plan snapshot, account pulse, market read, check-in answers.
- **Displays**: Risk up, normal, risk down, stop trading, or step back.
- **Role**: Summarizes the current behavioral stance.
- **Relationships**: Can be manually selected first; later it can be suggested
  by coach logic from check-in context.

### Session Notes

- **Inputs**: Short prompt answers and notes entered throughout the day.
- **Displays**: A lightweight running log, grouped by phase or timestamp.
- **Role**: Stages what the user is seeing, feeling, and deciding so the journal
  can preserve it before memory rewrites the day.
- **Relationships**: Feeds the daily recap draft and coach review context.

### Coach Note Placeholder

- **Inputs**: Check-in answers, plan, market read, account pulse, journal/coach
  history when available.
- **Displays**: A short response or empty placeholder.
- **Role**: Future spot for interactive coaching feedback without making AI a
  requirement for the first dashboard version.
- **Relationships**: Should be explicit and user-triggered at first, such as
  "Run check-in" or "Ask coach."

### Recap Handoff

- **Inputs**: Check-ins, session notes, cue outcomes, market read, top themes.
- **Displays**: The few items that should move into the daily recap.
- **Role**: Prevents the dashboard from becoming the recap while making recap
  writing easier.
- **Relationships**: Sends context to Journal, which then becomes better input
  for the coach.

## Check-In Modes

The first version should focus on three normal check-ins and one exception
state.

| Mode | Primary Question | Key Outputs |
| --- | --- | --- |
| Morning plan | What is the plan before the highest-attention window starts? | Market read, themes, focus rule, risk guardrail, sticky cues. |
| Midday reset | Is the market still worth trading, and am I still following the plan? | Current read, behavior state, risk posture, note to continue/risk down/stop. |
| Power-hour / EOD handoff | What changed, what mattered, and what should go into the recap? | Carry-forward themes, cue outcome, recap notes, tomorrow's focus candidate. |
| Hot all day | Is this an exception tape where opportunity persists across windows? | Exception flag, active themes, risk posture, note for later review. |

## Data Relationships

```text
Plan snapshot
  -> Accountability cues
  -> Active check-in
  -> Session notes
  -> Daily recap
  -> Coach review
  -> Next plan snapshot

Market read
  -> Risk posture
  -> Active check-in
  -> Daily recap context

Account pulse
  -> Risk posture
  -> Midday / EOD check-in
  -> Accountability review
```

## First-Version Boundaries

- Manual inputs are acceptable and preferred while the workflow is being tested.
- The dashboard can show an AI coach placeholder, but the first version should
  not depend on AI feedback to be useful.
- The dashboard should not classify every top mover or own five-pillar stock
  review. That belongs in the daily recap.
- Market read should be user-authored until data-provider reliability is clear.
- Account pulse should stay compact; detailed diagnostics belong in Reports.

## Open Design Questions

- Should the first build default to the current clock-based phase or ask the
  user to choose the active phase manually?
- Should accountability cues be simple text notes first, or should they have
  explicit states such as active, checked, missed, carried, and retired?
- Should the dashboard write directly into a daily recap draft, or stage a
  handoff that the user reviews before saving to Journal?
