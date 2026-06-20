# Statistical Review Framework

The **mathematical / statistical layer** of the AI coach: how a session (and
rolling windows of sessions) are evaluated, how risk and expectancy are judged,
and how we decide whether an edge is real or just variance. It is post-trade and
analytical — it does not recognize chart patterns or fire entries.

This is one pillar of the coach's rule system, deliberately kept separate from
the mechanical pillars:

| Pillar | Doc | Question it answers |
| --- | --- | --- |
| Setups | [`SETUPS.md`](../coach/SETUPS.md) *(planned)* | *What* to trade — micro pullback, ABCD, the curl, … |
| Execution | `EXECUTION.md` *(planned)* | *When/how* to enter and exit — mechanical triggers |
| **Statistical review** | **this doc** | *Was the process sound, is the edge real, and where does it live* |

Setups and execution are mechanical (pattern + trigger). This layer is
mathematical: it evaluates **outcomes and process statistics across trades**,
agnostic to what any individual setup looks like.

**Evidence base:** the rules below were derived from
[`RESEARCH_REPORT_STUDY.md`](RESEARCH_REPORT_STUDY.md)
(a 144-day teardown of a public trader's daily reports). That doc holds the
supporting data; this doc holds the rules we adopt. Thresholds marked
`{calibrate}` must be tuned against the user's own history before they fire —
do not ship the reference trader's numbers as defaults.

---

## 1. Foundational unit: R

Every metric is expressed in **R-multiples** (trade P&L ÷ the 1R risk taken on
that trade), not raw dollars. R normalizes across position sizes so a small day
and a large day are directly comparable, and so sizing changes don't distort the
read. Dollars are shown for human context; R drives the logic.

## 2. Session scorecard

Computed per session (and re-computed over rolling windows — see §9):

- **Net P&L** = Σ trade P&L
- **Total R** = Σ trade R
- **Accuracy** = winning trades ÷ total trades
- **Profit Factor (PF)** = gross winning $ ÷ |gross losing $|
- **E[R]/trade** = Total R ÷ trade count *(the core efficiency metric)*
- **Avg win / Avg loss** (in $ and R)
- **Trade count** and **time in market** (see §7)

Accuracy and PF are always reported **together**: a high win rate hiding a poor
payoff ratio is a leak, not a strength. The coach should never treat accuracy
alone as success.

## 3. Is the edge real? (robustness + significance)

Two checks that separate skill from luck. Both run before any praise or alarm.

**Trim / outlier test.** Re-compute the scorecard after removing the single
best/worst trade (`trim_1`) and the top/bottom `ceil(N × 5%)` trades (`trim_5`),
then classify the session by how much result is retained:
- Green: flips ≤ $0 → **outlier-carried**; else retention < 30% → **top-heavy**;
  else → **broad green**.
- Red: flips ≥ $0 → **tail-caused**; else loss-retention < 30% → **bottom-heavy**;
  else → **broad-based red**.

The exact classifier, tail-count rule, and the `{calibrate}` retention boundary
are specified deterministically in `REVIEW_ENGINE_SPEC.md`.

**Significance — cluster-bootstrap primary, naive-z descriptive.** Trades are not
independent; they cluster by ticker, setup, and session. A plain two-proportion
z-test against the baseline win rate is therefore **overconfident** and is kept
only as a familiar descriptive number, never as the verdict.
- **Primary:** cluster bootstrap **by session** → the confidence estimate we act on.
- **Secondary:** cluster bootstrap **by ticker** → concentration sensitivity (is
  the "edge" really one or two names?).
- **Persistence gate:** call a finding *persistent* only when it recurs over
  **≥ 3 sessions** or survives a historical bootstrap — not from one day, however
  good the single-day p-value looks.

**Breakeven math** (the honest core):
- **Breakeven win rate** = `|avg_loss| / (avg_win + |avg_loss|)`
- **Cushion** = actual win rate − breakeven win rate
- **Reward:risk** = `avg_win / |avg_loss|`

When accuracy is near breakeven but the day is green, the edge is **payoff
asymmetry**, not hit rate — name it explicitly.

## 4. Edge attribution (when / where / how)

Decompose every result along three axes so the coach can say *where* edge lives:

- **How** — hit-rate vs. payoff (from §3). Which one carried the result?
- **When** — bucket P&L into 30-minute windows; report trades, win rate, net $
  per window. Surface the best/worst window and the **give-back** metric
  (best window P&L as a % of net; >100% means later trading bled gains back).
- **Where** — bucket by entry price ($1–2, $2–3, $3–5, $5–10, $10–15, …); report
  trades, win rate, net $ per bucket. Flag buckets that drain on high trade
  count vs. carry on few trades.

## 5. Risk rules — keep losers small

The tail, not the average, is what damages an account. Rules:

- **Max-loss rule.** Enforce a hard daily stop. Judge discipline on the **worst
  single day**, not the average — one un-capped tilt day can erase weeks.
- **Tilt detection.** Flag size escalation *after* a loss (avg risk-per-trade
  rising following a red trade/streak) — the signature of revenge/tilt.
- **Per-trade risk consistency.** 1R should be stable across the session; growing
  1R on losers is a red flag, growing it on winners with conviction is not.

The coach's job is not to eliminate red days — they are normal and will scale
with the account — but to confirm losers stayed **within plan**.

## 6. Conviction over churn

Make per-trade quality legible so volume can't masquerade as edge.

- Report **E[R]/trade** prominently. A high-volume day with near-zero E[R]/trade
  is a **warning**, not a win, even if net P&L is positive.
- Track **time in market / exposure**. More positions = more screen time = more
  chances to be caught in a flush after a move is already made.
- Rule: if E[R]/trade falls below `{calibrate}` while trade count rises, flag
  **over-trading / low conviction** and surface the highest-E[R] subset of
  trades as the "trades that actually mattered."

Principle: *if you can recognize the setup, you can trade less with more size.*
Quality of decision over quantity of decisions.

## 7. Regime-aware frequency

The right trade frequency is a function of **market regime**, not a fixed trait.

- In a hot, trending tape, higher frequency is rewarded — momentum is plentiful
  and flushes recover.
- In chop, the same frequency just feeds the trader to the flushes.

The coach should (a) tag the prevailing regime, and (b) evaluate frequency
*relative to regime* rather than against a fixed number. **Caveat:** frequency
and regime are easily confounded — when validating "more trades helped," confirm
E[R]/trade actually held up as volume rose, per trader, before concluding causation.

## 8. From analysis to action

Each review ends with **exactly one** falsifiable experiment derived from the
biggest leak, stated with its counterfactual ("capping X would have changed the
day from A to B"). One testable change — not a checklist.

## 9. Review horizons

Three horizons, three distinct jobs. A finding at one horizon does not transfer
to another.

| Horizon | Job |
| --- | --- |
| **Daily** | Process / rule adherence; was risk controlled; did winners get room |
| **Weekly** | Is a leak chronic or a one-off; did process recover after a mistake |
| **Monthly / regime** | Did a *deliberate change* (frequency, price band, sizing) actually move the needle |

A single day — however rigorous the math — **cannot** tell you whether a strategy
change worked; only the monthly/regime aggregate can (a deliberate shift may look
"insignificant" day-by-day yet be decisive over months).

**Close the loop.** Persist each "one thing to try" and each marked strategy
change, then on later reviews check whether it was followed and whether it helped
(before/after aggregates). Recommendation-tracking is what turns daily recaps
into actual improvement — without it the same advice recurs forever.

## 10. Determinism boundary & numeric integrity

Every number is produced by a **deterministic fact pack**, computed in code. The
language model **only narrates** over that pack, gated to claims the evidence
supports. The LLM must **never calculate, re-derive, or reinterpret a number** —
that is the single largest source of confident-sounding error.

The canonical failure to design against: the **"+5pp win-rate uplift"**. The
incremental uplift `0.05 · N · (avg_win + |avg_loss|)` is *not* the projected
total — the projected total is `baseline + uplift`. Conflating the two
mislabels, e.g., a −$5,946 day as "+$1,943" when the real projection is −$4,003.
The analytics service must therefore return **two separate immutable fields** and
forbid the model from touching either:

```json
{
  "accuracy_5pp_incremental_uplift": 1943.04,
  "accuracy_5pp_projected_total": -4003.22
}
```

This boundary applies to every counterfactual ("what capping X would have
saved"), every projection, and every aggregate. If a value is not in the fact
pack, the coach does not state it.

The full deterministic specification — fact pack, classifier tree, trend vote,
mechanism priority tree, surprise scoring, and the recommendation schema — lives
in `REVIEW_ENGINE_SPEC.md`.

## Open questions / calibration TODO

- Calibrate all `{calibrate}` thresholds (E[R]/trade floor, give-back %, cushion)
  against the user's own trade history once enough is imported.
- Decide the baseline window for the significance test (30 / 60 / 90 day).
- Define the regime tagger (manual tag vs. derived from index/volatility/breadth).
- Decide where derived metrics live: precomputed in the reports layer
  ([`FEATURES.md`](../product/FEATURES.md) §6) vs. computed on demand in the AI
  review layer.

## Relationship to other docs

- [`REVIEW_ENGINE_SPEC.md`](REVIEW_ENGINE_SPEC.md) — the deterministic
  implementation spec for everything here (fact pack, classifier, vote,
  schemas, `{calibrate}` constants).
- [`RESEARCH_REPORT_STUDY.md`](RESEARCH_REPORT_STUDY.md) — the evidence base
  these rules were derived from.
- [`TRADING_COACH.md`](../coach/TRADING_COACH.md) — the overall coach product;
  this is its statistical layer.
- [`FEATURES.md`](../product/FEATURES.md) §6 — the reporting metrics that feed
  this layer.
