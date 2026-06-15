# Journal Design

## Purpose

The journal is a text-first review system for turning trading data into a
repeatable feedback loop. Reports answer what happened. The journal should help
answer why it happened and what to do next.

The product has two modes:

- Reading mode: review day, week, and month narratives with lightweight trade
  context.
- Editing mode: add concise notes, labels, and process markers without turning
  the journal into a form-heavy workflow.

## Visual Language

The current direction is a deep, low-noise interface that keeps the data close
to the writing instead of wrapping every section in cards.

Core theme:

- Background: deep blue-black.
- Surfaces: subtle blue-gray lifts only where an interactive control, popover,
  chart canvas, or note editor needs containment.
- Dividers: use quiet hairlines for table rows, stat rows, and section breaks.
- Green/red: softer trading colors, used for P&L and small status dots.
- Typography: keep the app's current font stack for now. Use size, weight,
  spacing, and mono labels for hierarchy instead of introducing a new font.

Layout rules:

- Tables should read like ledgers: no heavy outer boxes, just top/bottom rules
  and subtle row dividers.
- Stats should be grouped into open sections with compact labels and values,
  not boxed grid cells.
- Journal content stays prose-first. Metrics and ticker P&L modules should be
  compact secondary context.
- Controls may keep borders because they need clear click targets.

Reference files for this direction live in `samples/Journal Design/`, including
the dashboard, calendar, reports, and journal explorations.

## Note Hierarchy

Journal notes exist at four levels:

- Month: broad themes, bigger-picture progress, drawdown context, and what
  carries into the next month.
- Week: pattern recognition across days, especially whether red days stayed
  contained and whether one trade distorted the week.
- Day: the core review unit. Captures market read, plan quality, execution,
  emotions, what worked, and what to fix tomorrow.
- Trade: a focused note attached to a specific trade. Trade notes surface under
  the matching day and link back to the trade detail chart.

Trade notes should not live only inside the trade detail page. They should roll
up into the daily journal automatically.

## Trade Note Labels

Trade note labels are the short callouts that appear next to the ticker symbol.
They describe the type of trade review at a glance.

Recommended starting set:

- Best setup: one of the highest-quality trades of the period; worth studying
  and repeating.
- Good trade: followed the plan or showed solid process, even if the P&L was
  small.
- Bad trade: poor execution, weak setup selection, or a decision that should not
  be repeated.
- Needs review: unclear lesson; useful to revisit with the chart.
- Rule break: explicit violation of a trading rule.
- Revenge trade: entered to make money back after a loss, not because the setup
  was valid.
- Chased: late entry after the clean opportunity had already passed.
- Overtraded: too many trades for the environment or quality of setups.

Display treatment:

- Positive labels: green border/text.
- Negative labels: red border/text.
- Neutral labels: muted border/text.
- Labels should be compact and sit inline with the ticker symbol.

Suggested tones:

| Label | Tone |
| --- | --- |
| Best setup | Positive |
| Good trade | Positive |
| Needs review | Neutral |
| Bad trade | Negative |
| Rule break | Negative |
| Revenge trade | Negative |
| Chased | Negative |
| Overtraded | Negative |

## Process And Emotion Pills

Process and emotion pills are smaller descriptive tags that sit under the trade
note or daily recap. They explain the trader state or execution quality without
replacing the main callout.

Process pills:

- Followed plan
- Patient
- Focused
- Sized correctly
- Cut loss
- Let winner work
- Stopped trading

Risk/process warning pills:

- Oversized
- Moved stop
- No stop
- Added to loser
- Held too long
- Took profits early
- Forced trade

Emotion pills:

- Calm
- Confident
- Frustrated
- Impatient
- Fearful
- Tilted
- FOMO

The pills should support multiple selections. They are secondary metadata, not
the main note title.

## Future Tag Taxonomy

Tags should eventually separate into three related but distinct groups:

- Trade classification: the main review label, such as Good trade, Best setup,
  Needs review, Rule break, Revenge trade, or Bad trade.
- Trade setup: the technical setup or strategy context, such as VWAP reclaim,
  opening range breakout, news momentum, continuation, pullback, or scalp.
- Emotion/process: the execution state, such as Calm, Frustrated, FOMO,
  Patient, Followed plan, Chased, Oversized, or Moved stop.

Custom tags should be managed separately from the current visual cleanup work.
They will affect trade notes, journal editing, trade log filtering, reports, and
future AI review, so this should be handled as a focused Part 2 feature.

## Trade Note UI

Trade detail page:

- User writes or edits a trade note under the chart/executions.
- User chooses one primary trade label.
- User can optionally add process/emotion pills.
- Saving the note updates the trade detail page and the journal rollup.

Journal page:

- Trade note displays as:
  - ticker
  - primary callout label
  - note body
  - process/emotion pills
  - link back to trade
- In reading mode, edit controls should stay hidden.
- Clicking the note can enter editing mode.

## Daily Note UI

The daily note is the heart of the journal.

Daily view should show:

- Day header and date.
- Day metrics: trade count, win rate, profit factor, P&L.
- Daily recap text.
- Trade notes for selected/high-signal trades.
- Compact ticker P&L module on the right.

Daily note prompts:

- What was the market environment?
- What was the plan?
- Did I follow the plan?
- What emotions showed up?
- Did I revenge trade, chase, oversize, or force anything?
- What should I repeat?
- What should I fix tomorrow?

## Data Model Direction

Current `journal_entries` fields support the first version:

- `scope`: trade, day, week, or month.
- `scopeKey`: date/week/month key for non-trade notes.
- `tradeId`: links trade notes to trades.
- `lessons`: currently used for most note body text.
- `emotionalState`: currently stores one trade label/status.

For Part 2, likely additions:

- Rename or generalize `emotionalState` to `label` or `reviewLabel`.
- Add structured tag storage for multiple process/emotion pills.
- Keep note text as plain text or Markdown-compatible text.

Possible future tables:

- `journal_labels`: canonical primary labels.
- `journal_tags`: canonical process/emotion tags.
- `journal_entry_tags`: many-to-many join between notes and tags.

## Part 2 Scope

Part 2 should focus on authoring, not layout.

Build order:

1. Define canonical label/tag constants in one shared module.
2. Reuse those constants on trade detail and journal edit forms.
3. Replace duplicated hard-coded select options.
4. Add primary label editing for trade notes.
5. Add multi-select process/emotion pills.
6. Persist tags in a future migration after the UI pattern feels right.
