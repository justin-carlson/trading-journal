# Trading Coach

## Purpose

The trading coach is a post-trade review assistant. It should help the trader
understand whether their trades matched their own process, rules, setups, and
journal notes.

It is not a signal service, trade-calling tool, or live decision engine. The
coach should never tell the user what to buy, sell, short, hold, or size in real
time. Its job is review, reflection, and pattern recognition after trades are
closed.

The core question is:

> Did my trading match the system I said I wanted to trade?

## Product Positioning

The coach should feel like a second set of eyes after the session:

- It reviews completed trades, daily performance, and journal notes.
- It separates process quality from outcome quality.
- It identifies repeated mistakes and repeated strengths.
- It surfaces patterns in the data that the trader may have missed.
- It helps the trader process wins, losses, drawdowns, and sizing decisions.
- It helps the user refine their own playbook over time.
- It gives concrete review prompts for the next journal entry.

The coach should not pretend that a green trade was automatically good or that a
red trade was automatically bad. A losing trade can be high-quality if it
followed the plan. A winning trade can be low-quality if it was chased,
oversized, revenge-driven, or outside the setup criteria.

The coach should also be allowed to discover patterns that are not already in
the playbook. For example, it might notice that larger share size appears more
often on losing trades, that a specific time window produces most mistakes, or
that one ticker type repeatedly causes oversized losses. These observations
should be framed as hypotheses from the data, not as certain conclusions.

## Why A Playbook Is Required

General AI models understand common trading language, but they do not know the
user's edge by default.

To give useful feedback, the coach needs a clear description of:

- What setups the user trades.
- What makes a setup valid or invalid.
- What the entry criteria are.
- What the exit criteria are.
- How risk should be defined.
- How size should be chosen.
- What rules should never be broken.
- What emotional or process mistakes matter most.
- What the trader is currently trying to improve.

Without this context, the coach will drift into generic feedback. With this
context, it can evaluate whether a trade was aligned with the user's system.

## Required Inputs

### Trade Data

The coach should use structured trade data as the base layer:

- Trade id
- Symbol
- Date and time
- Side: long or short
- Entry price
- Exit price
- Shares
- P&L
- Per-share P&L
- Holding time
- Executions/fills
- Trade grouping by symbol and day
- Tags and labels
- Account, if multiple accounts are supported later

### Chart Data

Chart context is important because the trader cares most about whether the
setup, pattern, and entry made sense.

Useful chart inputs:

- OHLCV candles before, during, and after the trade.
- Entry and exit markers.
- Volume behavior into the entry.
- Volume behavior during the trade.
- Immediate trend or structure before the trade.
- Whether the entry chased an extended candle.
- Whether the exit cut the trade early, late, or according to plan.
- Whether the trade moved in favor first or immediately failed.

The coach should prefer direct chart facts over vague visual impressions.

### Journal Data

The coach should use the journal as the human context layer:

- Trade note text.
- Primary trade label: good trade, rule break, revenge trade, etc.
- Process pills: followed plan, cut loss, let winner work, oversized, etc.
- Emotion pills: calm, frustrated, impatient, fearful, tilted, FOMO, etc.
- Daily note.
- Weekly recap.
- Monthly recap.
- Current emotional state, if the user chooses to write it down.
- Stated goals or improvement themes for the current week/month.

The strongest reviews will happen after the user has added notes. The coach
should be able to say when the available context is too thin.

### Session And Report Data

Daily and weekly coaching should use aggregate report data:

- Net P&L
- Win rate
- Profit factor
- Payoff ratio
- Average winning trade
- Average losing trade
- Average winning per-share
- Average losing per-share
- Best/worst ticker
- Largest gain/loss
- Max consecutive wins/losses
- Distribution by time of day
- Distribution by symbol
- Volume/share-size behavior

These stats help the coach connect trade-level behavior to the larger session.

## Playbook Requirements

The app should eventually support a user-editable trading playbook. A first
version could be a markdown file or settings screen.

Suggested sections:

### Trading Style

- Market focus
- Timeframes
- Typical trade duration
- Long/short preference
- Instruments traded
- Preferred session window
- Trade frequency expectations

### Approved Setups

Each setup should define:

- Name
- What the pattern looks like
- Required chart structure
- Required volume behavior
- Entry trigger
- Stop/risk definition
- Exit logic
- Invalid conditions
- Common mistakes
- Example notes or screenshots later

### Risk Rules

Examples:

- Max loss per trade.
- Max daily loss.
- Max position size.
- Max number of trades per ticker.
- No averaging down.
- No moving stop away from risk.
- No adding to loser.
- Stop after a defined emotional/process trigger.

### Process Rules

Examples:

- Wait for confirmation.
- Do not chase extended candles.
- Respect the first stop.
- Trade only planned setups.
- Size down after a mistake.
- Stop trading after revenge behavior appears.

### Review Rubric

The coach should score or classify trades based on process, not only P&L.

Possible dimensions:

- Setup quality
- Entry quality
- Risk quality
- Size quality
- Exit quality
- Emotional discipline
- Rule adherence
- Journal completeness

### Psychological And Emotional Coaching

The coach should support the emotional side of trading because loss, variance,
drawdowns, frustration, fear, confidence, and sizing pressure are part of the
work.

This should be framed as trading reflection and process coaching, not therapy,
medical advice, or financial advice.

Areas the coach can help with:

- Accepting that losses are part of the game.
- Reinforcing the goal of losing small.
- Separating normal red days from preventable red days.
- Reviewing whether a loss was within plan or caused by rule-breaking.
- Helping the trader avoid revenge trading after a loss.
- Helping the trader avoid overconfidence after a win.
- Identifying when frustration, FOMO, fear, or impatience affected execution.
- Encouraging the trader to think in weeks and months, not only one painful day.
- Supporting gradual, evidence-based sizing up.
- Noticing when bigger size appears before process is ready.
- Building trust in a valid move after a good entry.
- Distinguishing setup invalidation from emotional discomfort.
- Helping the trader manage fast, volatile trades without panicking.

The coach should be direct but steady. It should help the trader stay grounded:

- A red trade is not automatically a bad trade.
- A red day is not automatically a failure.
- A green day is not automatically good process.
- The goal is not to avoid losing; the goal is to keep losses controlled and
  repeat the best process.
- A good entry can create emotional time. If the trade is entered close to risk
  and the setup remains valid, the trader can manage around invalidation instead
  of reacting to every tick.

### Trusting The Move

One recurring coaching theme is learning to stay with a valid setup when the
trend, volume, and structure are still supporting the trade.

The coach should help the trader review whether they exited because the trade
was actually invalidated or because volatility created discomfort.

Useful framing:

- A strong trader is not fearless; they have accepted the defined loss before
  the trade plays out.
- A clean early entry reduces emotional pressure because the stop is closer and
  the trade has more room to work.
- Partial profit can create calm if it is part of the plan, but it can also be a
  fear response if it is taken only for relief.
- Adding back can be valid when structure confirms the setup, but it should not
  be used to repair a bad entry.
- Fast tape can feel slower when the trader knows exactly what invalidates the
  trade.
- The review question is not simply "Did I hold longer?" It is "Did I manage
  the trade according to structure or according to discomfort?"

Potential signals to review:

- The trade was entered near a defined risk level.
- Volume and trend remained supportive after entry.
- Pullbacks held structure, but the trader exited anyway.
- The trader took profit quickly despite no invalidation.
- The trader cut the trade before the planned stop or exit logic.
- The trader added back only after confirmation, not from fear of missing out.
- The trader stopped out calmly when the setup failed.

Potential prompts:

- What part of this loss was planned risk versus avoidable damage?
- Did I change behavior after the first loss?
- Did I size up because the setup was better, or because I wanted to make more?
- Did I take profits early because of fear or because the setup changed?
- Did I keep the red day small enough to recover during the week?
- What would calm, rule-based trading have looked like here?
- Did I exit because the setup was invalid, or because the volatility made me
  uncomfortable?
- Did the entry give me enough emotional time to let the trade work?
- Was the trend still with me when I reduced or exited?
- Was volume confirming the move or warning that the move was fading?
- Did I manage the trade around my invalidation level or around my anxiety?
- Did I take partial profit according to the plan or because I wanted relief?
- If I added back, was it because the structure improved or because I was afraid
  to miss the move?

## Coaching Outputs

### Trade-Level Review

Triggered from a trade detail page or from a trade note.

Should answer:

- Was this trade aligned with an approved setup?
- Was the entry early, clean, late, or chased?
- Was risk defined and respected?
- Was size appropriate?
- Was the exit consistent with the plan?
- Was the result mostly process, variance, or rule violation?
- What is the one lesson to keep?

Suggested output:

- One-sentence verdict.
- Process score or qualitative label.
- What went right.
- What went wrong.
- Evidence from chart/trade data.
- One concrete improvement.

### Daily Review

Triggered after imports and notes are complete for the day.

Should answer:

- What drove the day?
- Was the P&L broad-based or concentrated in a few trades/tickers?
- Did the trader follow the plan?
- Were losses controlled?
- Did winners have room to work?
- Were there revenge, chase, or overtrading patterns?
- Did emotions appear to affect risk, entries, exits, or sizing?
- Did the trader trust valid moves or exit because of discomfort?
- What should be repeated tomorrow?
- What should be avoided tomorrow?

Possible sections:

- Session summary.
- Best process trade.
- Worst process trade.
- Attribution review.
- Biggest hidden issue.
- What the stats say.
- What the notes say.
- One focus for next session.

### Daily Coach Recap Framework

The daily AI review should feel like a practical end-of-day coaching recap, not
a generic report. A useful first version can use a simple reflection framework:

- What's working well.
- What's not working.
- What can improve.
- What to focus on next session.

This gives the trader a short, repeatable checklist after the session. The goal
is to connect data, notes, charts, and process into a clear next-day plan.

Suggested output:

- **What worked:** the strongest process behaviors, best decision quality, clean
  entries, controlled losses, patience, sizing discipline, or valid holds.
- **What did not work:** the main leak, rule break, emotional pattern, oversized
  trade, chase, early exit, overtrade, or avoidable damage.
- **What can improve:** one or two concrete improvements tied to the trader's
  playbook, not broad motivational advice.
- **Next-session focus:** a small checklist or single theme for tomorrow, such
  as "wait for the first pullback," "keep red trades small," "only size up on
  A+ structure," or "do not re-enter after frustration."

Potential frameworks to borrow from:

- **Start / Stop / Continue:** start one behavior, stop one behavior, continue
  one behavior.
- **Keep / Kill / Try:** keep what is working, kill the biggest leak, try one
  focused adjustment next session.
- **Repeat / Reduce / Review:** repeat the best process, reduce the main
  mistake, review the trade that explains the day.

The coach should keep this recap short enough to read before the next session.
It should cite the trades, tickers, notes, and stats behind the finding so the
feedback feels grounded instead of abstract.

### Daily Attribution Review

Some raw data points are useful, but they become much more valuable when the
coach interprets them instead of simply repeating them in the UI.

Useful attribution prompts:

- Best lift: which ticker or trade contributed most to the day, and was it good
  process or just outcome?
- Biggest drag: which ticker or trade did the most damage, and was the loss
  planned risk, oversized risk, poor execution, or a rule break?
- Most active: was the activity focused trading in a clean name, or did it
  suggest overtrading, chopping, or trying to make money back?
- Concentration: did one ticker define the whole day, or was the result broad
  across multiple names?
- Accuracy versus profit factor: did the trader win often but lose too much, or
  win less often but let winners carry the day?

This belongs in the AI review layer more than in the static stats layer. The UI
can show the top-line day health and ticker attribution, while the coach turns
best/worst/most-active data into a short interpretation:

> Biggest drag was GLXG. It accounted for most of the red day, so the key review
> is whether that loss was defined risk or preventable damage. EDHL was the most
> active ticker; review whether that was focused continuation trading or churn.

### Weekly Review

Should focus on patterns across days:

- Did one red day distort the week?
- Were red days kept small?
- Did the trader recover process after mistakes?
- Which setup produced the best results?
- Which mistake repeated?
- Did size increase on worse trades or better trades?
- Did the trader keep red days small enough to protect the week?
- Did wins create overconfidence or better execution?

### Monthly Review

Should be more strategic:

- What improved?
- What repeated?
- What should be removed from the playbook?
- What setup deserves more focus?
- What risk rule needs adjustment?
- What is the next month improvement theme?
- Is the trader ready to size up based on evidence, or should size stay stable?

## Example Analysis Ideas

The coach could eventually support:

- Outlier review: results with biggest winner/loser removed.
- Concentration review: how much of the day came from top trades.
- Size discipline review: whether larger size appeared on better setups.
- Winner/loser asymmetry: whether losers were too large relative to winners.
- Per-share edge review: average winning/losing cents per share.
- Time-of-day behavior: whether certain windows produce worse decisions.
- Ticker behavior: symbols that caused repeated mistakes.
- Note consistency: whether user labels match the actual data.
- Blind-spot discovery: data patterns the trader did not explicitly ask about.
- Hypothesis generation: possible causes worth checking in future reviews.
- Emotional pattern review: whether certain emotions correlate with worse
  execution.
- Sizing readiness review: whether larger size is being applied to better
  setups or simply increasing losses.
- Trust-the-move review: whether early exits happened while trend, volume, and
  structure still supported the trade.

These should be presented as review insights, not trading predictions.

> The mathematical/statistical rules behind these analysis ideas (expectancy,
> trim/significance tests, risk math, regime-aware frequency) live in their own
> pillar: `STATISTICAL_REVIEW.md`.

## Data Discovery And Blind Spots

One of the most valuable roles for the coach is finding things the trader may
not see while reviewing manually.

The coach should be able to scan trade, report, chart, and journal data for
patterns such as:

- Size increasing on lower-quality trades.
- Winners being held for less time than losers.
- Losses clustering in a specific time window.
- Certain symbols or price ranges producing repeated mistakes.
- Strong win rate hiding poor payoff ratio.
- Good P&L hiding poor process.
- Red days driven by one oversized trade.
- Green days driven by one outlier instead of broad consistency.
- Emotional tags appearing before worse execution.
- Notes saying one thing while the data suggests another.
- Big wins followed by overconfidence or looser execution.
- Big losses followed by revenge trading or forced trades.
- Valid setups exited early because volatility increased.
- Partial profit taken as emotional relief rather than planned management.
- Add-backs that followed confirmation versus add-backs that chased.

These insights should be written carefully:

- "The data suggests..."
- "This may be worth reviewing..."
- "A possible pattern is..."
- "I would verify this against the chart and your notes..."

The coach should avoid overstating causation. It can identify correlations and
review candidates, but the trader should decide whether the pattern is real,
actionable, or just normal variance.

## Guardrails

The coach should:

- Only review completed trades.
- Avoid live trade recommendations.
- Avoid certainty language.
- Cite the data it used.
- Say when it lacks enough context.
- Distinguish process from outcome.
- Separate observed facts from hypotheses.
- Avoid shaming language.
- Be direct but constructive.
- Encourage emotional regulation without acting as a therapist.
- Preserve privacy by default.

The coach should not:

- Tell the user to enter, exit, buy, sell, short, or hold a live trade.
- Pretend it knows the user's setup without a playbook.
- Overfit one day of results.
- Treat P&L as the only measure of quality.
- Make unsupported claims from incomplete chart data.
- Present correlations as proven causes.
- Diagnose mental health or give medical/therapeutic advice.

## Suggested Implementation Phases

### Backlog: Find Your Levels Trade Review Coach Prompt

The user supplied a draft prompt artifact, `fyl_trade_review_coach.md`, for a
future AI trade review feature. Capture it as the first concrete coaching prompt
direction.

Full source prompt: `docs/prompts/fyl_trade_review_coach.md`.

Intent:

- Build a post-trade review coach based on the Find Your Levels framework.
- Focus the first version on entry quality, not whether the trade made money.
- Review completed trades only.
- Treat the trader's marked levels as the source of truth.
- Speak in the trader's framework vocabulary: trapped buyers/sellers, overhead
  supply, frontside/backside, role flip, vote count, buying support instead of
  chasing breakouts, structural invalidation.

Required input shape:

- Session identity: ticker, date, catalyst, float, daily 200 EMA context, and
  any pre-trade notes.
- User-marked levels: price, support/resistance type, source, timeframe, and
  color.
- Broker trade records: direction, entry/exit price, entry/exit time, shares,
  planned stop, and planned setup.
- Chart data: 1m and 5m execution candles plus daily/weekly context.
- Indicator data where available: volume, VWAP, EMA 9/20, daily 200 EMA, MACD,
  MACD signal, and MACD histogram.
- Journal context: daily note, trade notes, labels, process tags, and emotion
  tags.

Review rubric:

- Phase and scene: identify Phase 1 first-pullback/catalyst move versus Phase 2
  post-first-move setup.
- Entry quality: decide whether the entry was a dip into support/structure or a
  chase into open space or supply.
- Vote count: volume, daily 200 EMA, VWAP, EMA 9/20, and MACD when available.
- Risk: whether invalidation was definable before entry and whether the stop was
  structural instead of pain-based.
- Exit: brief note only; the grade remains entry-first.
- Grade: A+, B/acceptable, Forced, or Mistake.
- Closing question: who was trapped here, and was the trader on the right side
  of them?

Expected output:

- Structured per-trade review.
- Concise session synthesis.
- The repeated pattern or leak across the session.
- Best entry to repeat, based on process rather than P&L.
- One specific fix for the next session.
- Rehab checks for the rebuild phase: size consistency and whether marginal
  chases slipped in.

Guardrails from the prompt:

- Never grade on P&L alone.
- Never invent or override the trader's levels.
- Never penalize early Phase 1 trades for thin intraday levels when the move is
  too young to have built them.
- Never ask for or assume Level 2 / Time & Sales data.
- Never recommend live trades, predict price, or give alerts.
- Never use indicators as standalone signals.
- Avoid generic encouragement; every line should reference the session.

Implementation to-do:

- Add a user-editable playbook/levels model before enabling serious coaching.
- Decide whether levels are manually entered, imported from screenshots, or
  drawn on the chart.
- Add indicator generation or import for EMA 9/20, daily 200 EMA, VWAP, MACD,
  and volume context.
- Build a normalized AI input payload for a single ticker/day session.
- Add a daily "AI Review" surface first; trade-level review can come later.
- Store AI reviews separately from user-authored journal notes.
- Create a small eval set of known trades to test whether the coach grades
  process over outcome.
- Prototype the prompt against demo data before wiring it into production UI.

### Phase 1: Design The Coach Playbook

- Create the initial playbook structure.
- Define setup names and rules.
- Define primary labels and process/emotion tags.
- Define coaching output formats.
- Keep this as markdown before building complex UI.

### Phase 2: Daily Summary From Existing Data

- Use imported trades, daily stats, and existing notes.
- Generate a daily review after the user has added notes.
- Do not use chart image analysis yet.
- Include clear caveats about missing setup definitions.

### Phase 3: Trade-Level Coach

- Add a "Review this trade" action to trade detail.
- Feed the model trade data, executions, notes, labels, and candle summary.
- Return a structured trade review.
- Store the review as an optional generated note.

### Phase 4: Chart-Aware Review

- Add summarized candle/volume context.
- Optionally include rendered chart snapshots if useful.
- Compare entry/exit against the defined setup rules.
- Detect likely chase, late exit, early exit, and stop/risk issues.

### Phase 5: Pattern Review

- Compare weeks/months.
- Detect repeated mistakes.
- Detect whether size is correlated with worse outcomes.
- Detect whether certain setups, times, or tickers carry the edge.
- Surface blind spots and unexpected correlations for the trader to review.

### Phase 6: Process And Psychology Review

- Compare emotional tags against trade outcomes and rule adherence.
- Detect revenge trading, fear-based exits, overconfidence, and hesitation.
- Help the trader distinguish normal losses from preventable damage.
- Review whether sizing up is supported by the data.
- Review whether trades were managed around invalidation or discomfort.
- Identify repeated early exits from valid trend/volume setups.
- Generate daily and weekly process prompts for the journal.

## Open Questions

- Should AI reviews be saved permanently or regenerated on demand?
- Should AI-generated reviews be editable journal notes or separate coach notes?
- Should the model use chart images, candle summaries, or both?
- How much user playbook detail is required before enabling the coach?
- Should the coach have a strict rubric score or only prose feedback?
- How should the app show uncertainty and missing context?

## Near-Term Next Step

Create a first draft of the user's trading playbook:

- Approved setups.
- Entry rules.
- Exit rules.
- Risk rules.
- Sizing rules.
- Common mistakes.
- Current improvement goals.

Once that exists, the coach can start reviewing trades against the user's actual
system instead of generic trading advice.
