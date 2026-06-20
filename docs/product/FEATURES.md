# Trading Journal — Feature Inventory

> A consolidated, scoped checklist of features. Grounded in the four reference
> screenshots of the current journal tool (Trades, Reports/Detailed,
> Reports/Calendar, Dashboard) + our own design (DESIGN.md). Goal is **the
> basics**, not a full clone — and to lead with the things that tool *doesn't*
> do (per-trade chart with fills, deep journaling).

**Scope legend:** ✅ MVP · 🔜 Later · ⛔ Out of scope (single-user, local, private)

---

## 0. Launch QA / public readiness  ⭐
- 🔜 Verify `trading-journal.ai` end-to-end on Vercel: root domain, `www`
  redirect, HTTPS, fresh browser load, mobile viewport, and any stale DNS/cache
  edge cases.
- 🔜 Test the first-run/onboarding flow from a clean environment with no local
  database: install/setup, demo data path, import path, empty states, settings,
  and recovery from missing env vars or missing data files.
- 🔜 Document the public path clearly: what the hosted site is for, how to run
  the app locally, how to load demo data, how to import real broker exports, and
  how contributors should validate changes before opening PRs.
- 🔜 Add a lightweight release checklist for future domain/deploy changes:
  build, smoke test, DNS/domain verification, canonical URL behavior, README
  accuracy, and known-risk notes.

---

## 1. Data & Import
- ✅ Import **TOS Account Statement** CSV → executions (parse `Account Trade
  History`; `Net Price`, `Pos Effect`; PT→ET; strip `="…"`/commas). *(Phase 2)*
- ✅ **Executions → Trades** matching (round-trips via `Pos Effect`/FIFO).
- ✅ **Auto-fetch candles** (Massive) for parsed symbols → local cache. *(Phase 3)*
- ✅ Import preview / confirm + dedupe (row-hash); import history.
- ✅ Manual add / edit / delete of executions & trades.
- 🔜 **Broker CSV adapter system**: normalize broker-specific CSV exports into a
  shared fill/execution shape before trade grouping. Target sample sets include
  Lightspeed, CenterPoint, Ocean One, DAS Trader, Cobra, TradeZero, and other
  active trading platforms.
- 🔜 Generic CSV column mapping for unsupported broker exports.
- 🔜 Collect anonymized broker sample files for importer testing. Samples should
  preserve columns, row structure, timestamps, quantities, prices, fees, and
  partial-fill behavior while removing account numbers and identifying data.
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
- 🔜 AI trade-review coach: daily-first review using the Find Your Levels prompt
  rubric, user-marked levels, chart data, trade records, and journal notes.
- 🔜 AI daily coach recap: summarize what worked, what did not work, what can
  improve, and one focused next-session checklist item.

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

## 7. Export & Portability
- 🔜 **Export Trades CSV**: portable trade/execution data for spreadsheets or
  another trading journal. This should include trade identity, dates, symbols,
  side, shares, entry/exit, P&L, fees when available, and enough IDs to reconnect
  notes if needed. Chart candles should not be included by default.
- 🔜 **Export Journal Notes**: separate human-readable and/or structured export
  for daily recaps, trade notes, labels, and process/emotion tags. Markdown is
  useful for reading; JSON is better for restoring or migrating.
- 🔜 **Full SQLite Backup**: complete local-first backup/restore path for power
  users. This should preserve trades, executions, notes, tags, cached candles,
  accounts/settings, and any future AI reviews.
- 🔜 Clear import/restore guidance so users understand the difference between
  moving trade data, preserving journal writing, and backing up the full app.

## 8. Dashboard  *(screenshot 4)*
- 🔜 **Deferred for MVP** — Reports + Calendar cover the home-screen need for now.
  When built, start **compact** (Cumulative P&L, Win %, Profit factor, Total/Avg
  trade P&L, # trades, **Open trades** list) — not ~40 widgets.
- 🔜 **Edit Layout** / customizable widget grid; 30/60/90-day range; more widgets.
- ⛔ "Instrument ATR / RVOL / opening gap / day type" widgets (heavy data needs).

## 9. Cross-cutting / system
- ✅ Local-first **SQLite**; data stays on disk (`data/journal.db`).
- ✅ Dark UI; top nav (Calendar / Trades / Journal / Reports / Account / Import / Settings).
- ✅ Global filter bar (symbol / tags / side / duration / date) shared across views.
- 🔜 Account switching for paper/live/IRA accounts, with imports, reports,
  calendar, trades, and journal scoped to the active account.
- 🔜 Settings (theme, accounts, default gross/net, timezone, fees handling,
  backup/export DB).
- 🔜 Tag management split into trade classification, trade setup, and
  emotion/process tags.
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
