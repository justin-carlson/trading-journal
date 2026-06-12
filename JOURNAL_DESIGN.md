# Trading Journal — Journal Design

> Status: Draft · Last updated: 2026-06-12

The journal is the reflective layer of the trading app. Reports explain what
happened numerically; the journal explains why it happened, what the trader felt,
what rules were followed or broken, and what should change next.

The journal should be lightweight, text-first, and discoverable from the root
navigation. Trade-level notes can exist on a trade detail page, but they should
roll up into the main Journal view so notes are never hidden inside individual
trade pages.

---

## 1. Product Intent

The journal should help with review and coaching, not become another dense
report.

Core intent:
- Capture daily process and emotional context.
- Keep red days in perspective by reviewing the week and month, not only the
single painful day.
- Make important trade notes easy to find later.
- Help identify recurring behavior patterns: revenge trading, chasing,
overtrading, hesitation, moving stops, sizing mistakes, and broken rules.
- Provide a place for short weekly/monthly recaps without forcing long writing.

The most important review layer is the **daily note**. Weekly and monthly recaps
are higher-level summaries that help the trader zoom out.

---

## 2. Journal Model

Use one journal/note system with scopes instead of separate disconnected note
systems.

Suggested note scopes:
- `trade` — attached to a specific trade, created from trade detail or Journal.
- `day` — daily review note, usually the primary writing surface.
- `week` — weekly recap, process trends, and bigger-picture perspective.
- `month` — monthly recap, themes, drawdown/recovery notes, and goals.

Each note should have:
- `scope`: `trade | day | week | month`
- `scopeKey`: trade id, `YYYY-MM-DD`, week start date, or `YYYY-MM`
- `title` or generated label
- `body` markdown/text
- optional emotion/process fields
- optional linked trade ids
- timestamps

This allows a note written on a trade detail page to appear in the Journal under:

`Month -> Week -> Day -> Trade note`

The note belongs to the trade, but it is discoverable through the root journal.

---

## 3. Text-First Review Surface

The Journal page should not list every trade by default. Some days can have many
trades, and showing all of them turns the journal into another trade report.

Default Journal view should emphasize:
- Month recap notes
- Week recap notes
- Daily review notes
- Flagged or linked trades only
- Light stats for context, not full report tables

Trade links should appear when they are relevant:
- A trade was explicitly linked from a note.
- A trade was flagged for review.
- A trade note exists.
- A trade is marked as best setup, rule break, revenge trade, or needs review.

The Journal can still infer the structure automatically from existing trades:

`Month -> Week -> Day`

But the content inside each day should be mostly notes and flagged trades, not a
complete trade list.

---

## 4. Daily Review

The daily note is the highest-value journal entry.

Suggested daily review fields:
- **Market read** — What was the context? Trend, chop, catalyst, volume,
  premarket behavior, overall feel.
- **Plan** — What setups or rules were intended for the day?
- **Execution** — Did I follow the plan? Where did I deviate?
- **Emotions** — How did I feel while trading?
- **Behavior flags** — What process issues showed up?
- **What worked** — One thing to repeat.
- **What to fix** — One thing to improve tomorrow.

Daily notes should support concise writing. The app should not make every field
mandatory. The goal is consistency, not paperwork.

---

## 5. Emotions & Process

Emotion and discipline tracking is a core part of the journal because emotional
state often explains performance better than a chart or P&L number.

Suggested emotion tags:
- Calm
- Focused
- Patient
- Confident
- Frustrated
- Impatient
- Anxious
- Tilted
- Distracted
- Fearful

Suggested behavior/process flags:
- Followed plan
- Broke rules
- Revenge traded
- Chased
- Overtraded
- Oversized
- Hesitated
- Moved stop
- Took A+ setup
- Forced trade
- Cut winner early
- Held loser too long

These can exist at both day and trade scopes:
- Day scope: "Today I was tilted and overtraded after a red open."
- Trade scope: "This was a revenge trade" or "This was a good A+ setup."

---

## 6. Trade Notes & Flagged Trades

Trade notes should be optional. The app should not imply that every trade needs a
note.

Useful trade-level prompts:
- Good trade: what went right?
- Bad trade: what went wrong?
- Rule break: what rule did I break?
- Setup quality: was this actually the setup?
- Entry quality: was the entry early, late, or correct?
- Exit quality: did I follow the plan?
- Lesson: what should I remember next time?

Suggested trade flags:
- Good trade
- Bad trade
- Best setup
- Rule break
- Revenge trade
- Needs review
- Missed opportunity

Flagged trades should appear in the Journal under the correct day/week/month
with a link back to the trade detail chart.

---

## 7. Weekly & Monthly Recaps

Weekly and monthly recaps should help the trader zoom out.

This matters because a red day can feel emotionally outsized. The journal should
help reframe the day inside the week or month:
- Red days are expected.
- The goal is to keep red days small.
- Some drawdowns take multiple weeks to recover from.
- A single bad day should be reviewed, but not allowed to dominate the whole
process narrative.

Weekly recap prompts:
- What was the main pattern this week?
- Did I keep red days small?
- What rule or behavior repeated?
- What setup worked best?
- What should I focus on next week?

Monthly recap prompts:
- What changed in my trading this month?
- Am I improving process or just reacting to P&L?
- What was the biggest lesson?
- What is the next month focus?

Weekly/monthly recaps can include light metrics for context:
- P&L
- trade count
- win rate
- best/worst day
- flagged trade count

But they should not become full reports.

---

## 8. UI Direction

Top-level Journal route:
- Keep it in the main nav.
- Use similar date/symbol/tag filters as Trades and Reports.
- Default to current month or recent days.
- Text-first layout.

Suggested layout:
- Header: Journal, active range, quick filters.
- Linear month-first outline:
  - month review
  - week recap
  - daily review entries
  - flagged/linked trade notes under the relevant day only
- The page should read vertically like a journal, not like a dashboard grid.

Daily card:
- Date
- small context: P&L, trade count, red/green day
- compact trade recap by ticker: ticker, trade count, W/L, P&L
- daily note preview or "Add daily note"
- emotion/process tags
- linked/flagged trades

Trade note links:
- symbol
- P&L
- flag type
- short note preview
- link to trade detail chart

Avoid:
- Full trade lists by default.
- Chart embeds inside the Journal page.
- Long required forms.
- Making weekly/monthly notes feel mandatory.

---

## 9. Data Model Direction

The current schema has `journal_entries` attached directly to trades. That is a
good starting point for trade notes, but the journal feature needs a more
general note model.

Possible future schema:

```ts
journal_notes
- id
- scope: "trade" | "day" | "week" | "month"
- scope_key
- title
- body
- emotion_tags_json
- process_flags_json
- created_at
- updated_at

journal_note_trades
- note_id
- trade_id

trade_review_flags
- trade_id
- flag
- created_at
```

Migration path:
- Keep existing trade `journal_entries` for now.
- Introduce generalized `journal_notes`.
- Backfill existing trade journal entries into `journal_notes` with
  `scope = "trade"`.

---

## 10. Initial Implementation Slice

First useful slice:
1. Replace the current Journal stub with a lightweight text-first layout.
2. Show month/week/day structure, but not every trade.
3. Add placeholder note cards for month/week/day.
4. Show flagged/linked trades only.
5. Add "Add note" affordances without persistence if needed.

Proof-of-concept slice before the generalized database migration:
1. Use the existing `journal_entries` table for trade-level notes.
2. Add a note form on trade detail.
3. Save note text and optional emotion/process label to the trade.
4. In the root Journal route, show only trades that have notes.
5. Automatically place each noted trade under the correct month, week, and day
   based on the trade entry date.
6. Link each noted trade back to the trade detail chart.
7. Show a compact daily trade recap by ticker so the daily note has context
   without listing every trade.
8. Allow trade notes to be edited from the Journal page.

Next slice:
1. Add generalized `journal_notes` database table.
2. Add daily note create/edit.
3. Add trade note create/edit on trade detail.
4. Roll trade notes into the Journal route under the correct day/week/month.

Later:
1. Emotion/process tag filters.
2. Search journal notes.
3. Weekly/monthly recap editor.
4. Flag trades from the trade detail page.
5. Journal insights: repeated mistakes, best setup notes, revenge-trade count.
