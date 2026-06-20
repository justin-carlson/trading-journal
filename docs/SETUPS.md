# Setups

The **setups pillar** of the coach: *what* to trade. Each entry defines a pattern
the trader recognizes and considers tradeable — its structure, the conditions
that make it valid or invalid, and the mistakes that commonly ruin it.

This pillar is intentionally separate from:
- `EXECUTION.md` *(planned)* — *when/how* to pull the trigger (mechanical entry /
  exit / sizing rules). Setups say "this is an ABCD"; execution says "enter on the
  break of the pullback high with a stop under the low."
- `STATISTICAL_REVIEW.md` — the *math* layer that evaluates outcomes across trades.

**How this feeds the coach.** Every trade carries a setup tag. The coach reviews
each trade against its setup's criteria (was this a *valid* instance? was the
entry/stop/exit consistent with the definition?), and the stats layer breaks down
performance **by setup** so we learn which setups carry the edge and which leak.
A losing trade in a valid setup can be good process; a winning trade outside any
setup is a flag.

> **Status: scaffold.** The setup bodies below are placeholders for the trader to
> author. Fill the `TODO` fields with your own definitions — keep the wording in
> your framework's vocabulary so the coach can speak it back to you.

## Setup index

| Setup | Phase | Bias | Status |
| --- | --- | --- | --- |
| [Micro Pullback](#micro-pullback) | TODO | long | draft / unauthored |
| [ABCD Pattern](#abcd-pattern) | TODO | TODO | draft / unauthored |
| [The Curl](#the-curl) | TODO | TODO | draft / unauthored |

*(Add rows as setups are added.)*

---

## Per-setup template

Copy this block for each new setup. Fields mirror the "Approved Setups" list in
`TRADING_COACH.md` so the coach reads every setup the same way.

```markdown
## <Setup Name>

- **What it looks like:** <one- or two-line description of the pattern>
- **Required chart structure:** <trend / base / level / role-flip context that must be present>
- **Required volume behavior:** <what volume must do into and during the setup>
- **Entry trigger:** <the precise event that makes it actionable>  ← detailed rules live in EXECUTION.md
- **Stop / risk definition:** <where 1R is and what invalidates the trade structurally>
- **Exit logic:** <how the trade is managed and exited when right>
- **Invalid conditions:** <what disqualifies the setup before or after entry>
- **Common mistakes:** <the recurring ways this setup is traded badly>
- **Examples:** <links to trades / screenshots once available>
- **Phase / scene:** <e.g. Phase 1 first move vs Phase 2 post-first-move>
- **Notes:** <anything else worth capturing>
```

---

## Micro Pullback

- **What it looks like:** TODO — brief continuation pullback within a strong move.
- **Required chart structure:** TODO
- **Required volume behavior:** TODO
- **Entry trigger:** TODO *(mechanical rule → `EXECUTION.md`)*
- **Stop / risk definition:** TODO — where is 1R, what structurally invalidates it?
- **Exit logic:** TODO
- **Invalid conditions:** TODO
- **Common mistakes:** TODO — e.g. chasing extended, entering into supply, no defined risk.
- **Examples:** TODO
- **Phase / scene:** TODO
- **Notes:** TODO

## ABCD Pattern

- **What it looks like:** TODO — A leg up, B pullback, C continuation, D target/exhaustion.
- **Required chart structure:** TODO
- **Required volume behavior:** TODO
- **Entry trigger:** TODO *(mechanical rule → `EXECUTION.md`)*
- **Stop / risk definition:** TODO
- **Exit logic:** TODO
- **Invalid conditions:** TODO
- **Common mistakes:** TODO
- **Examples:** TODO
- **Phase / scene:** TODO
- **Notes:** TODO

## The Curl

- **What it looks like:** TODO — roll-over / curl back through a level (define direction).
- **Required chart structure:** TODO
- **Required volume behavior:** TODO
- **Entry trigger:** TODO *(mechanical rule → `EXECUTION.md`)*
- **Stop / risk definition:** TODO
- **Exit logic:** TODO
- **Invalid conditions:** TODO
- **Common mistakes:** TODO
- **Examples:** TODO
- **Phase / scene:** TODO
- **Notes:** TODO

---

## Relationship to other docs

- `EXECUTION.md` *(planned)* — the mechanical entry/exit/sizing rules for these setups.
- `STATISTICAL_REVIEW.md` — evaluates performance **by setup** across trades.
- `TRADING_COACH.md` — the overall coach; its "Approved Setups" section defines
  these fields and the playbook intent.
