# Trading Journal — Feature Inventory

> A consolidated, scoped checklist of features. Grounded in the four reference
> screenshots of the current journal tool (Trades, Reports/Detailed,
> Reports/Calendar, Dashboard) + our own design (DESIGN.md). Goal is **the
> basics**, not a full clone — and to lead with the things that tool *doesn't*
> do (per-trade chart with fills, deep journaling).

**Scope legend:** ✅ MVP · 🔜 Later · ⛔ Out of scope (single-user, local, private)

---

## 1. Data & Import
- ✅ Import **TOS Account Statement** CSV → executions (parse `Account Trade
  History`; `Net Price`, `Pos Effect`; PT→ET; strip `="…"`/commas). *(Phase 2)*
- ✅ **Executions → Trades** matching (round-trips via `Pos Effect`/FIFO).
- ✅ **Auto-fetch candles** (Massive) for parsed symbols → local cache. *(Phase 3)*
- ✅ Import preview / confirm + dedupe (row-hash); import history.
- ✅ Manual add / edit / delete of executions & trades.
- 🔜 **DAS Trader** CSV import (2 formats) as a second source.
- 🔜 Manual candle CSV (TradingView/ToS) fallback for missed symbols.
- ⛔ Automated execution sync / broker API; cloud sync.

## 2. Trades list  *(screenshot 1)*
- ✅ Table: **Date, Symbol, Volume, Execs, Entry Price, Exit Price, P&L, Notes**.
- ✅ P&L color-coded (green/red); **Gross / Net** toggle.
- ✅ Sort by column (Date default); **pagination** + page-size (30/…).
- ✅ Filters: **Symbol, Tags, Side, Duration, date range (From–To)**.
- ✅ Row → open **Trade detail**.
- ✅ **Download CSV** of the filtered list.
- 🔜 Saved/"Custom" filter sets; Advanced filter builder.
- 🔜 Inline views: **Charts (large) / Charts (small)** thumbnail grid of trades.
- 🔜 Bulk select + bulk tag/delete.
- ⛔ **Shared** column / share links (social feature).

## 3. Trade detail  ⭐ *(our core differentiator — the reference tool is weak here)*
- ✅ **Candlestick chart with entry/exit markers** (Massive candles + fills),
  crosshair OHLCV, pan/zoom. *(adapt §8 prototype)*
- ✅ **Export chart to SVG** snapshot into the trade.
- ✅ Execution list for the trade (fills, running P&L).
- ✅ Trade stats: P&L $/%, R-multiple, holding period, size/exposure.
- ✅ **Tags**, **setup/strategy** label, **notes** (markdown).
- 🔜 **Trade chart view model:** keep two clear trade chart contexts:
  - **Single trade chart**: usually reached from a journal trade note; shows one
    trade, the trade note in the right column, and the shared chart pan/zoom
    behavior.
  - **Trade Review chart**: reached from the Trades Review ticker module; shows
    all trades/cycles for one ticker on one day, with the same-day ticker module
    in the right column for quick jumps to other tickers. Trade cycles are
    informational for now, not clickable drilldowns.
- 🔜 Chart navigation polish (easing, momentum, resize) — *separate UI track*.
- 🔜 "Open in TradingView" deep link.
- 🔜 Stop/target lines & R visualization on the chart.

## 4. Journaling & Review  ⭐
- ✅ Per-trade reflection: **thesis, what went well / wrong, lessons**.
- ✅ **Discipline/emotion** tagging (followed plan? FOMO? revenge?).
- ✅ **Screenshots**: attach images to a trade (stored locally).
- 🔜 Searchable journal of mistakes/lessons across trades.
- 🔜 Daily note / day snapshot (market regime, how I traded).

## 5. Calendar  *(screenshot 3)*
- ✅ **Monthly P&L calendar**, days color-coded by net P&L.
- ✅ Year selector; click a day → that day's trades.
- 🔜 Year/Month/Day and "Recent" alternate views; weekly summaries.

## 6. Reports / Analytics  *(screenshot 2)*
- ✅ **Summary stats (basics):** Total P&L, win rate, # trades (win/loss),
  avg win / avg loss, avg trade P&L, largest gain/loss, profit factor,
  total fees/commissions, avg hold time.
- ✅ **Equity curve** + **cumulative drawdown**.
- ✅ **Distributions:** by **day of week**, **hour of day**, **month**,
  **duration** (intraday/multiday) — count + performance.
- ✅ **Tag breakdown** (P&L by tag/setup) and by symbol.
- ✅ **A few advanced metrics:** expectancy, **R-multiple stats** (avg R, win/loss
  R), **max consecutive wins/losses**.
- 🔜 Further metrics: std dev, MAE/MFE, Kelly %.
- 🔜 Win-vs-loss-days, Compare, intraday-duration buckets, price/volume &
  liquidity breakdowns.
- 🔜 Gross/Net + $ / % / R view modes across all reports.
- ⛔ Premium-style scores (SQN, K-Ratio, "Probability of Random Chance").

## 7. Dashboard  *(screenshot 4)*
- 🔜 **Deferred for MVP** — Reports + Calendar cover the home-screen need for now.
  When built, start **compact** (Cumulative P&L, Win %, Profit factor, Total/Avg
  trade P&L, # trades, **Open trades** list) — not ~40 widgets.
- 🔜 **Edit Layout** / customizable widget grid; 30/60/90-day range; more widgets.
- ⛔ "Instrument ATR / RVOL / opening gap / day type" widgets (heavy data needs).

## 8. Cross-cutting / system
- ✅ Local-first **SQLite**; data stays on disk (`data/journal.db`).
- ✅ Dark UI; left nav (Dashboard / Trades / Calendar / Reports / Import).
- ✅ Global filter bar (symbol / tags / side / duration / date) shared across views.
- 🔜 Settings (default gross/net, timezone, fees handling, backup/export DB).
- 🔜 Backup/restore (copy the SQLite file; export/import).
- ⛔ Auth / login / multi-user / RLS; community / "people"; billing.

---

## MVP cut (confirmed)
The ✅ items deliver: **Import → Trades list → Trade detail (chart + journaling)
→ Calendar → Reports (basics + a few advanced: expectancy, R-stats, max
consecutive).** Decisions:
- **Dashboard: deferred** — Reports + Calendar are the MVP home surface.
- **Analytics: basics + a few advanced** (expectancy, R-multiple stats, max
  consecutive win/loss); the rest is 🔜.
- **Social / multi-user: dropped** (⛔) — private, single-user, local tool, no
  sharing/accounts.

Everything 🔜 is a fast-follow; ⛔ is intentionally out.
