# Review Engine Spec (v0.1)

The **deterministic implementation spec** for the coach's statistical layer. This
is the "exactly how" behind the principles in `STATISTICAL_REVIEW.md`. Everything
here is computed in code, not by the language model.

## Determinism boundary

```
Normalized closed trades
      ↓  (deterministic)
Session fact pack
      ↓  (deterministic)
Trim / robustness classifier
      ↓  (deterministic)
Economics & breakeven analysis
      ↓  (deterministic)
Time / price / hold / symbol segmentation
      ↓  (deterministic)
Rolling personal-baseline comparison (trend vote)
      ↓  (deterministic)
Contradiction & leak ranking (surprise score)
      ↓
Evidence-gated narrative            ← the ONLY LLM step
      ↓
One expiring, measurable experiment (schema-bound)
```

The LLM may narrate and select among **pre-computed, evidence-tagged** candidates.
It must never calculate, re-derive, or reinterpret a number. See
`STATISTICAL_REVIEW.md` §10 for the numeric-integrity rule (and the two-field
uplift example).

## Provenance & validation status

The rules below were reverse-engineered from a 27-session replay of a public
reference engine (full-format reports, 2026-04-16 → 2026-06-17). The classifier
reproduced the published distribution label on **27/27** sessions.

**Caveat — thin, single-regime sample.** All 27 sessions fall in one hot,
high-frequency regime. Treat the *structure* (tail fraction, tree shape, vote
structure, surprise formula) as robust; treat the *numeric constants* below as
**reference-observed starting hypotheses, not defaults**. Recalibrate every
`{calibrate}` value against the user's own history before shipping.

## Calibration constants `{calibrate}`

| Constant | Reference value | Used by |
| --- | --- | --- |
| Trim tail fraction | `0.05` → `k = ceil(N·0.05)` | trim classifier |
| Trim retention boundary | `30%` | distribution label |
| Expectancy flat band | `±0.05R` | economics |
| Material-trade threshold | `|R| ≥ 1` | tails, mechanism |
| Trend: WR change | `≈ 2.0 pp` | trend vote |
| Trend: E[R] change | `≈ 0.02R` | trend vote |
| Trend: PF change | `≈ 0.10` | trend vote |
| Trend: net/session change | `≈ 2 risk units` | trend vote |
| Trend: aligned signals for coherent | `3 of 4` | trend vote |
| Persistence gate | `≥ 3 sessions` or survives historical bootstrap | findings |
| Same-symbol re-entry loss trigger | `≥ 1.5R` (example) | mechanism / policy |

## Session fact pack

The immutable object every downstream step reads from:

```yaml
session:
  N, net_pnl, total_R, E_R, WR, PF
  avg_winner, avg_loser, payoff_ratio, breakeven_WR, WR_margin
  peak_pnl, trough_pnl, final_giveback        # peak_pnl - net_pnl
robustness:
  trim_1, trim_5, retention, distribution_label
segments:
  windows_30m_PT[]                            # trades, WR, net per 30-min window
  price_bands[]                               # fixed entry-price buckets
  hold_duration_bands[]
  by_ticker[], by_setup[]
tails:
  material_trades[]                           # |R| >= material_threshold
  material_win_count, material_loss_count, material_net_R
  repeated_material_by_ticker[]
history:
  trailing_7d, preceding_23d, baseline_30d, baseline_90d
evidence:
  sample_sizes, recurrence_count, clustered_confidence_interval
```

## Trim / robustness classifier

```python
N = number_of_closed_trades
k = ceil(N * TAIL_FRACTION)                   # 0.05
baseline  = net_pnl(all_trades)
trim_1    = net_pnl after removing best + worst trade
trim_5    = net_pnl after removing k best + k worst trades
retention = min(trim_1, trim_5) / baseline    # fraction of result retained

# Green session (baseline > 0):
if min(trim_1, trim_5) <= 0:      label = "outlier-carried green"
elif retention < RETENTION_BOUND: label = "top-heavy green"        # 0.30
else:                             label = "broad green"

# Red session (baseline < 0):
if max(trim_1, trim_5) >= 0:      label = "tail-caused red"        # not yet observed
elif loss_retention < RETENTION_BOUND: label = "bottom-heavy red"
else:                             label = "broad-based red"
```

`tail_count = ceil(N · 0.05)` is deterministic (43→3, 90→5, 102→6 per tail). The
30% boundary held tightly in replay: 30.04% → broad green; 26.18% → top-heavy;
26.94% loss-retained → bottom-heavy; 37.83% → broad-based red.

## Session economics

```python
payoff_ratio = avg_winner / abs(avg_loser)
breakeven_WR = abs(avg_loser) / (avg_winner + abs(avg_loser))
WR_margin    = realized_WR - breakeven_WR

if   E_R >  +0.05: expectancy = "positive"
elif E_R >= -0.05: expectancy = "basically flat"
else:              expectancy = "negative"
```

This is why a 36%-WR session can be profitable (large payoff ratio) and a 54%-WR
session can lose (losers much larger than winners). `WR_margin` is the headline
economic read, not raw accuracy.

## Rolling-trend four-signal vote

Each signal scores `+1 / 0 / −1` against its material-change threshold; **3 of 4
aligned material signals** → coherent improvement/deterioration, else `mixed`.

```python
signals = {
  "win_rate":    sign_if_material(d_WR,  WR_THRESH),    # ~2.0 pp
  "E_R":         sign_if_material(d_E_R, ER_THRESH),    # ~0.02R
  "profit_factor": sign_if_material(d_PF, PF_THRESH),   # ~0.10
  "net_session": sign_if_material(d_net, NET_THRESH),   # ~2 risk units
}
agg = sum(signals.values())
label = "improvement" if count_aligned(signals) >= 3 and agg > 0
   else "deterioration" if count_aligned(signals) >= 3 and agg < 0
   else "mixed"
```

Implement as an **explicit vote**, never as an LLM judgment. (Explains why a
near-flat-WR day reads as improvement when E[R]/PF/net all rise materially, and a
slight-WR-rise day reads as deterioration when the other three fall.)

## Verdict engine

The verdict is assembled from five deterministic objects:

1. **Distribution state** — from the trim classifier.
2. **Session economics** — E[R], PF, payoff ratio, breakeven WR, WR margin.
3. **Historical relationship** — extends / interrupts / breaks / inconclusive vs.
   recent trend (from the vote).
4. **Dominant mechanism** — priority tree below.
5. **Path interpretation** — steady accumulation / grind / whipsaw / recovery /
   late giveback.

### Dominant-mechanism priority tree

```python
if removing_one_ticker_changes_session_sign:        mechanism = "ticker concentration"
elif distribution in {"outlier-carried green", "bottom-heavy red"}: mechanism = "tail concentration"
elif same_symbol_has_multiple_material_losses:      mechanism = "same-symbol re-entry"
elif (peak_pnl - net_pnl) is large:                 mechanism = "post-peak giveback"
elif one_supported_segment_is_strongly_negative:    mechanism = "segment leak"
elif distribution == "broad-based red":             mechanism = "ordinary-flow leakage"
else:                                               mechanism = "broad accumulation"
```

## "What you might have missed" — surprise ranking

Generate contradiction candidates, then rank — do **not** just report the largest
loser.

Candidate generators:
- High WR + negative P&L
- Low WR + positive P&L
- Highest-WR segment is net negative
- Material trades nearly cancel, but small trades drive the day
- One time window earns more than the final session net (giveback)
- A lightly traded bucket out-earns an overtraded bucket
- Removing one ticker flips the session sign
- Adjacent windows, equal WR, opposite P&L

```
surprise_score = economic_impact × contradiction_strength × sample_support
```

Rank by `surprise_score`; surface the top contradiction(s). Each candidate
carries its evidence (the segment/trade ids and sample sizes) so the narrative is
gated.

## "One thing to try next" — policy compiler

```
observed leak → observable trigger → one constrained action
              → one-session expiration → counterfactual measurement
```

Output schema:

```json
{
  "hypothesis": "Repeated entries after a material symbol loss magnify the left tail.",
  "trigger": "A ticker produces a loss of at least 1.5R.",
  "action": "No re-entry for 60 minutes; subsequent size capped at 50%.",
  "scope": "That ticker only.",
  "expires": "Session close.",
  "measure": { "avoided_pnl": true, "missed_opportunity": true, "blocked_trade_log": true }
}
```

Recurring policy families: same-name circuit breakers, reduced size after rapid
stop-outs, time-based context checks, price-band lockouts, A/B conviction sizing.

## Statistical layer

```python
# Descriptive only — kept because it's familiar, NOT the verdict:
z = (p_session - p_baseline) / sqrt(p_baseline * (1 - p_baseline) / N)
```

This naive proportion test is **overconfident** — trades cluster by ticker,
setup, and session. Compute and act on:
- **Cluster bootstrap by session** → primary confidence estimate.
- **Cluster bootstrap by ticker** → concentration sensitivity.

**Persistence gate:** a finding is `persistent` only if it recurs over **≥ 3
sessions** or survives a historical bootstrap. Never promote a one-day result on
its single-day p-value.

## Numeric integrity

All counterfactuals/projections/aggregates follow the two-immutable-field rule in
`STATISTICAL_REVIEW.md` §10 (incremental uplift vs. projected total are separate
fields; the LLM touches neither).

## Known-uncertain (not yet deterministic)

The **narrative ranking** — *why one valid leak is chosen over another* — is the
remaining soft spot. Constrain it with the controllability + surprise scores
above and an evidence gate; a learned ranker can replace the heuristic later.
Everything else is recovered sufficiently to build v0.1.
