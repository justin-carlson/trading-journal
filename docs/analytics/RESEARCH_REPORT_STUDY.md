# Daily Report Methodology — Reference Teardown

> A reverse-engineering of a public trader's daily review reports (an anonymized
> reference journal). The point is **not** to
> copy the trader's strategy, tickers, or specific rules — it is to learn *how
> the data is analyzed* so our AI coach (see
> [`TRADING_COACH.md`](../coach/TRADING_COACH.md)) can produce
> reviews of comparable rigor. Read this as "what a strong daily recap computes
> and why," not as trading advice.

## Why this is worth studying

The reference reports do something most journal tools do not: they separate
**luck from skill** with explicit statistics, attribute edge across multiple
axes, and end each day with exactly one falsifiable experiment. They are honest
to the point of telling the trader when a green day was statistically
indistinguishable from noise. That intellectual honesty is the thing to borrow.

## Methodology evolution (the first lesson)

The reports were not always quantitative. The earliest entries (Nov 2025) were
**narrative-first**: trade-by-trade storytelling, tape-reading notes, and a
subjective letter grade ("Trading grade: B-"). No tables, no statistics. By
mid-2026 they had become a **fixed, repeatable quantitative template** run every
day regardless of outcome.

Takeaway for our build: ship the narrative recap first (it is useful and cheap),
then layer the quantitative engine on top once the data pipeline supports it.
Our [`TRADING_COACH.md`](../coach/TRADING_COACH.md) already plans this with
Daily → Pattern → Process phases.

### Longitudinal timeline (sampled Nov 2025 – Jun 2026)

Sampling ~20 days across the archive plus a dense June sample reveals **two
distinct inflection points**, and the link between them is the key lesson:

| Era | Period | Trades/day | Report style |
| --- | --- | --- | --- |
| Narrative | Nov 2025 – mid-Mar 2026 | 3–12 | prose, letter grade, no stats |
| Stats creep in | mid-Mar – Apr 2026 | (still narrative prose) | R / accuracy / PF start appearing |
| High-frequency shift | **Apr 2026** | jumps to **50–144** | prose + stats |
| Full quant engine | **late May 2026 →** | 28–144 | fixed 8-section template + z-tests |

1. **Trading style flipped first (Apr 2026):** trade count jumped from a handful
   per day to dozens/hundreds — a move to high-frequency scalping. P&L magnitude
   scaled with it (±$1–3k days early; $5k–$50k days by June).
2. **Report methodology flipped second (~late May 2026):** narrative recap →
   the quantitative engine.

The second was *caused by* the first. Trade-by-trade storytelling does not scale
to 144 trades; high volume **forces** distributional, statistical review.

> **Design rule for our coach: the right review methodology depends on trade
> frequency.** A swing trader doing ~3 trades/day wants narrative, per-trade
> review. A scalper doing ~100/day needs aggregation, price/time buckets, and
> significance testing. The coach should detect the trader's volume regime and
> switch review modes accordingly, rather than forcing one format on everyone.

Other trend signals worth noting: **win rate stayed flat at ~48–51%** across the
entire dataset — the edge scaled through *volume × payoff asymmetry*, not a
rising hit rate. Typical losing days stayed in a stable −$1.6k to −$2.2k band
even as winners grew, consistent with disciplined fixed per-trade risk.

### Monthly aggregates (full archive, 144 days)

The complete dataset is captured in
[`research-report-study-daily.csv`](reference-data/research-report-study-daily.csv)
(one row per published report, Nov 17 2025 – Jun 17 2026). Rolled up by month:

| Month | Days | Net P&L* | Avg trades/day | Era |
| --- | --- | --- | --- | --- |
| Nov 2025 (partial) | 8 | +$12,588 | 9 | narrative / low-freq |
| Dec 2025 | 22 | ~+$2,969 | 11 | narrative / low-freq |
| Jan 2026 | 20 | **−$4,623** | 8 | narrative / low-freq |
| Feb 2026 | 19 | **−$1,030** | 7 | narrative / low-freq |
| Mar 2026 | 22 | +$4,090 | 12 (ramping) | transition |
| Apr 2026 | 20 | +$19,464 | **55** | high-freq begins |
| May 2026 | 20 | +$34,041 | 70 | high-freq |
| Jun 2026 (partial) | 13 | +$38,340 (ex one $50k day) | 67 | high-freq / full quant |

\*Several Nov–Feb reports did not publish a dollar P&L, so those sums are mildly
understated. Directionally unambiguous.

**The arc:** a streaky, high-variance start (Nov–Dec swung between +$11.5k and
−$16.3k days) → a real two-month drawdown (Jan–Feb, small size) → a turn in
March (he starts *experimenting* with high-frequency: isolated 27–84 trade days
appear among the usual 5-trade days) → **April: the switch flips** — trade count
jumps ~8 → ~55/day and stays there, and monthly P&L steps up an order of
magnitude (+$19k → +$34k → +$38k) and never reverts.

The high-frequency pivot was not cosmetic — **it is what turned a sometimes-
losing trader into a consistently profitable one.** Win rate barely moved
(~45–50% throughout); the edge came from volume × payoff asymmetry, exactly as
the per-day significance math kept asserting.

### The lesson a daily report structurally cannot deliver

This is the most important takeaway of the whole study. The reference trader's
own engine labeled the early high-frequency days "outlier-carried" and statistically
insignificant **day by day**. Only the multi-month aggregate reveals the regime
change was the best decision in the dataset.

> **A daily review — however rigorous — cannot tell you whether a deliberate
> strategy change worked.** That requires comparing aggregates *before vs. after*
> a marked change. Our coach should operate at three horizons with three jobs:
> **daily** = process/rule adherence; **weekly** = is a leak chronic or one-off;
> **monthly/regime** = did a deliberate change (frequency, price band, sizing)
> actually move the needle. The monthly job only works if the coach persists the
> change and the prior recommendation — the loop-closing feature the reference
> reports lack (see the section above).

Risk note for the coach's design: **drawdowns scaled with the account.** Worst
days: −$16.3k (Dec), −$8.6k (Nov), −$5.9k (Apr), −$5.2k (Jan), plus a 3-day
−$7.8k skid in early May. Even in the winning era the red days are large; the
coach's job is not to eliminate them but to confirm they stayed within plan.

## The fixed 8-section template

Every recent report runs the same pipeline in the same order:

1. **Gross $ / R by ticker** — per-symbol P&L and R, sorted.
2. **Day Stats** — net P&L, total R, accuracy, profit factor, trade count.
3. **Trim Review** — outlier-dependency test (remove best/worst, recompute).
4. **Session Verdict** — material-trade count + time-of-day windows.
5. **Significance & Conceptual Math** — the statistical core.
6. **Price-bucket analysis** — edge attribution by price band (within §5).
7. **What You Might Have Missed** — counterintuitive cross-cuts.
8. **One Thing To Try Next Session** — a single falsifiable experiment.

The same template runs on winning, losing, and outlier-carried days. Losing days
do **not** get a separate "failure analysis" section — the insight is embedded in
the unified verdict. Consistency of format is a feature: it trains the reader to
look for the same things every day.

## Input data the engine needs (per trade)

- Ticker / symbol
- Entry and exit time (to the minute, for 30-min bucketing)
- Entry price (for price-bucket assignment)
- P&L in dollars
- **R-multiple** = trade P&L ÷ the 1R risk on that trade

R is the linchpin. Almost every insight is expressed in R rather than dollars,
because R normalizes across position sizes and makes a $50k day and a $1.4k day
directly comparable.

## Section-by-section: what each computes and why

### 2. Day Stats

- **Net P&L** = Σ trade P&L
- **Total R** = Σ trade R
- **Accuracy** = winning trades ÷ total trades
- **Profit Factor (PF)** = gross winning $ ÷ |gross losing $|
- **Trade count**

The headline scorecard. Note accuracy and PF are deliberately shown together —
the whole report repeatedly demonstrates that high accuracy is not the edge.

### 3. Trim Review (outlier-dependency test)

Sort trades by P&L, then recompute the full stat set after removing:

- the single best and single worst trade, then
- the top/bottom N (roughly the 5–8% tails).

For each scenario, report: trades, net P&L, total R, **E[R]/trade**, $WR, PF.

**Verdict logic:**

- Still clearly green after trimming → **broad-based edge** ("a stack of small
  plus-EV decisions compounding, not a few home runs").
- Flips to flat/red after removing 1–2 trades → **outlier-carried** ("a single
  best trade — or the top 5% — is effectively the entire P&L; the rest of the
  book was roughly flat-to-red").

This is the single cheapest, most honest tool in the report. It directly answers
"was this skill or one lucky print?" Our coach should run it on every day and
every rolling window.

### 4. Session Verdict

- **Material trades**: count trades with |R| ≥ 1 and |R| ≥ 2. The recurring
  finding is that a small handful of material trades (e.g. 27 of 144) drives the
  entire outcome while the rest is noise.
- **Time-of-day windows**: bucket P&L into 30-minute windows; report trades, win
  rate, and net $ per window. Surface the best and worst windows.
- **E[R]/trade** = total R ÷ trade count, framed against the historical baseline.

Answers *when* edge exists and *how few trades actually mattered*.

### 5. Significance & Conceptual Math (the part most worth copying)

Given average win and average loss for the day:

- **Breakeven win rate** = |avg_loss| ÷ (avg_win + |avg_loss|)
  - Example: $274.53 ÷ ($942.06 + $274.53) = 22.6%.
- **Cushion** = actual win rate − breakeven win rate.
- **Reward:risk** = avg_win ÷ |avg_loss| (e.g. 3.43:1).
- **Significance test** — a two-proportion **z-test** comparing the day's win
  rate against the trailing baseline (e.g. 90-day) win rate, producing a
  **p-value**. Across every sampled day, `p > 0.05` → the day's hit rate was
  *not* statistically distinguishable from normal variance.
- **Baseline-relative framing** — today's E[R] vs. 90-day E[R]; today's PF vs.
  30-day and 90-day PF. Nothing is judged in absolute terms.
- **Counterfactual math** — e.g. "cap these 3 losers at −1R each" → recompute →
  "the +$1.49k day becomes ~+$5k." Quantifies the leak in dollars and R.

The recurring conclusion this math forces: **edge comes from payoff asymmetry
(bigger winners than losers), not from accuracy.** That conclusion is only
reachable because breakeven WR, reward:risk, and the significance test are all
computed together.

### 6. Price-bucket analysis

Bucket trades by entry price ($0.50–1, $1–2, $2–3, $3–5, $5–10, $10–15,
$15–20, …). Per bucket: trade count, win rate, net $.

Surfaces *where* edge lives. The reference reports repeatedly find that cheap
buckets ($1–5) bleed money on high trade counts while mid-priced buckets
($5–15) carry the day on far fewer trades — sometimes a bucket with a *sub-50%
win rate* still leads in dollars because of payoff asymmetry.

### 7. What You Might Have Missed

Counterintuitive cross-cuts that the headline hides, e.g.:

- **Give-back metric**: best window's P&L as a % of net (e.g. "the best hour was
  127% of net" → later trading gave ~$1,020 back).
- A low-win-rate window that was nonetheless the biggest dollar contributor.
- **Single-trade dominance**: "3 trades produced more P&L than the other 80
  combined."
- A price zone that flipped negative despite hosting earlier winners.

### 8. One Thing To Try Next Session

Exactly **one** falsifiable rule derived from the biggest leak, stated with its
counterfactual P&L (what it would have saved/changed). Not a checklist. Examples
seen: cap cheap-bucket trade count; block re-entry in a ticker after a realized
±2R; same-ticker position cap within a 30-min window.

## Design principles to inherit

1. **R-normalize first.** Every stat is risk-adjusted so days of different size
   are comparable.
2. **Be outlier-robust.** Always ask "does this survive removing the best/worst
   trade?" — at the trade, day, *and* month level.
3. **Separate luck from skill explicitly.** Compute the z-test/p-value and tell
   the user when a good (or bad) day was probably just variance.
4. **Attribute edge on three axes:** hit-rate vs. payoff, *when* (time block),
   *where* (price bucket). The key conclusions only emerge from all three.
5. **Quantify the leak with a counterfactual,** not a vibe.
6. **Exactly one next action,** falsifiable, with hypothetical P&L.
7. **Baseline-relative everything** — judge against a trailing window, not zero.

## Where our coach can be *better* than the reference

Across the sampled reports, the engine kept prescribing the **same fix** (cap
cheap names, limit re-entries) day after day — evidence the leak is chronic and
the rules are not sticking. The reports have no memory: they regenerate advice
daily without tracking whether prior recommendations were followed or worked.

Our coach should **close that loop**: persist each "one thing to try," then on
later days check whether the trader actually followed it and whether it helped.
That recommendation-tracking is a feature the reference reports lack and a clear
place for us to add value. It fits the Pattern/Process phases in
[`TRADING_COACH.md`](../coach/TRADING_COACH.md).

## Design principles from observed data (operator's thesis)

These principles come from the operator reviewing this dataset, cross-checked
against the numbers. They are stated as a point of view to build into the coach,
not as proven law.

**The stance:** if you are good enough to recognize the setup and when to take
it, you can trade *less* with *bigger size*. Jumping in and out a hundred times a
day is usually a symptom of low conviction — and every extra position is extra
time in the market, which is extra chance of getting flushed after a stock has
already made its move. Quality of decision beats quantity of decisions.

Three coaching principles fall out of this, each supported by the data:

1. **Keep losers small — judge the worst day, not the average.** A max-loss rule
   exists to cap the tail, and the tail is where accounts die. Evidence: the
   −$16,290 December tilt day was the worst in the archive; after it, *no further
   double-digit-thousand red day occurs* even as size grew — worst day per month
   thereafter sits in the −$2k to −$6k band. The coach should surface the worst
   single day and flag tilt-driven size escalation, not just net P&L.

2. **Conviction over churn — make per-trade quality legible.** Compute
   **E[R]/trade** and time-in-market/exposure, and treat a high-volume, low-edge
   day as a *warning*, not a win. Evidence: low-count conviction days (Apr 6: 4
   trades, PF 4.27; Mar 17: ~1.9R per trade) vastly out-earn per decision versus
   churn days (May 19: **118 trades, +$570, ~0.007R per trade**). The reference
   trader's own engine repeatedly prescribed the same fix — "fewer trades,
   concentrate, cap the cheap buckets" — confirming the churn is a known leak.

3. **Frequency should be regime-aware.** High frequency is *rewarded* in a hot,
   trending tape (Apr–Jun here) where momentum is plentiful and flushes recover,
   and *punished* in chop (Dec–Feb) where the same activity just feeds you to the
   flushes. The right number of trades is a function of market regime, not a
   fixed trait. As the market heated up, the trader deliberately "stepped on it"
   and rode momentum with more, faster trades — the correct adaptation *for that
   regime*.

**Honest caveat:** in this dataset, trade frequency and a hot market are
confounded — he ramped volume at exactly the moment the tape turned. We cannot
cleanly separate "more trades made more money" from "the hot market made more
money." Treat the relationship as correlation, and have the coach *test it per
trader* (does this trader's E[R]/trade actually hold up as volume rises?) rather
than assuming the answer.

## Mapping to our existing plans

> The rules **derived** from this study live in
> [`STATISTICAL_REVIEW.md`](STATISTICAL_REVIEW.md) (the coach's statistical
> layer). This doc is the evidence base; that doc is the framework we adopt.

- The **Trim Review** and "outlier review / concentration review" already listed
  under *Example Analysis Ideas* in
  [`TRADING_COACH.md`](../coach/TRADING_COACH.md) are the same tool — this doc
  specifies the exact computation.
- **Significance math** extends the Reports metrics in
  [`FEATURES.md`](../product/FEATURES.md) (expectancy, R-multiple stats) with
  breakeven WR + a variance test.
- **Time-of-day and price/volume bucket** breakdowns are already on the
  [`FEATURES.md`](../product/FEATURES.md) roadmap (§6, marked 🔜) — this is the
  analytical payload they should feed.

## Source

A public trader's daily-report journal (anonymized reference; daily reports,
Nov 2025 – present). Reviewed full reports across winning, losing, and
outlier-carried days plus the earliest narrative-era report to trace methodology
evolution.
