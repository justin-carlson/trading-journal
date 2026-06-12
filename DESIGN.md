# Trading Journal — Design Doc

> Status: **Draft v2** · Last updated: 2026-06-11

A personal, local-first web app for logging stock/ETF trades, reviewing them
reflectively, and tracking performance over time.

> **Catch-up note (read first).** Work on this has been spread across several
> standalone files and chats. This doc is the single place that brings it
> together. The most important prior asset is a working, self-contained
> trade-chart prototype — see [§8 Prior Work & Assets](#8-prior-work--assets).
> The charting approach is considered **proven**; we'll refine it as needed
> rather than redesign it.

---

## 1. Goals & Non-Goals

### Goals
- **Single-user, personal tool.** Built for one trader (me). No accounts, no
  multi-tenancy, no public sharing in v1.
- **Capture every trade** with the context that makes review valuable: setup,
  notes, tags, emotional state, screenshots.
- **Understand performance** through clear analytics: P&L, win rate,
  R-multiples, equity curve.
- **Reduce friction on data entry** by supporting broker CSV import (manual
  exports for v1; optional automation later).
- **Local-first, private, and cheap.** Data lives on my machine; no dependency
  on a hosted service. Goal: **replace TraderVue ($29.95/mo)** and run on just
  the existing TradingView sub (~$10/mo) — no new recurring cost.

### Non-Goals (v1)
- Multi-user accounts / authentication.
- Real-time market data or live position tracking.
- Order execution or any broker write actions (read/import only).
- Instruments beyond stocks & ETFs (options/futures/crypto are future work).
- Mobile-native apps (responsive web is enough).

---

## 2. Scope

### Instruments
- **v1:** Stocks & ETFs only.
- Data model should leave room for options/futures later, but we won't build
  multi-leg/contract logic now.

### Data entry methods

There are **two distinct data inputs**, both currently **manual CSV exports**:

**A. Execution data (the trades) — ThinkorSwim (primary), DAS (secondary).**
- Trading is done through **DAS Trader** on a **Schwab** account; **ThinkorSwim
  (TOS)** runs on the same account and exports the same fills.
- **Decision: TOS is the primary execution source for v1.** Its *Account
  Statement* export is stronger than the DAS log for our purposes (see §8 for
  the full format spec):
  - **`Pos Effect` = `TO OPEN` / `TO CLOSE`** on every fill → round-trip
    matching becomes *authoritative* instead of FIFO-inferred.
  - A built-in **Profits and Losses** section to **validate** our computed P&L.
- DAS remains a **secondary** importer (the §8 prototype already parses two DAS
  formats) behind the same interface, for when a TOS export isn't handy.
- Both are **execution/fill level** — one row per buy/sell, *not* pre-bundled
  round-trips.

**B. Price/candle data (for the per-trade chart) — auto-fetched via Massive.**
- OHLCV 1-min candles are **auto-fetched by the app** for the symbols it parsed
  from the execution import — no per-symbol manual work. Source: **Massive**
  (Polygon-platform `/v2/aggs`), **validated 91/91** on real trades incl.
  extended hours. See §9.
- **Alpha Vantage** (free) = fallback provider; **manual chart export**
  (TradingView/ToS, extended-hours session on) = last resort.
- **⚠️ Extended hours required** (this style trades pre-market) — Massive
  includes it.
- **Cost: $0** — the Massive **free tier** works (just per-minute rate-limited,
  which is fine for a session's handful of symbols). Data stays local & private.
  See §9.

**C. Manual entry** — a form to add/edit an execution or trade by hand
(corrections, missing fills, non-broker trades).

**D. Candle fetch is already automated** (see §9): the app pulls candles for the
parsed symbols from **Massive**. Automating *execution* ingestion (vs. the manual
TOS export) is a possible later nicety, behind the same importer interface — not
a v1 deliverable.

> **Key implication:** because the broker gives us fills, the import pipeline
> must group executions into positions / round-trips itself (see §5).
> Day-trading means frequent scaling in and out, so an execution-level model is
> required, not optional.

---

## 3. Core Features (v1)

> See **[FEATURES.md](FEATURES.md)** for the full scoped feature inventory
> (✅ MVP / 🔜 Later / ⛔ Out), grounded in the reference-tool screenshots. The
> subsections here describe the core; FEATURES.md is the checklist.

### 3.1 Trade Logging
- Store raw **executions** (fills) as the immutable source of truth.
- **Group executions into trades** (round-trips / positions) via a matching
  algorithm (FIFO by default) — opening and closing fills for the same symbol.
- A *trade* exposes: symbol, side (long/short), avg entry & exit price, total
  quantity, first-entry & last-exit time, fees, derived stop/target, status
  (`open` | `closed`).
- Derived: P&L ($ and %), R-multiple, holding period, # of fills, max
  size/exposure.
- Manual add / edit / delete for executions and trades.
- Tags (free-form, reusable), setup/strategy label.
- Free-text notes (markdown).

### 3.2 Performance Analytics
- Summary dashboard: total P&L, win rate, avg win / avg loss, profit factor,
  expectancy, average R.
- **Equity curve** over time.
- Breakdowns by tag, setup, symbol, day-of-week, time period.
- Date-range and tag filters.

### 3.3 Review & Journaling
- Per-trade reflection: what was the thesis, what went right/wrong, lessons.
- Emotional state / discipline tracking (e.g. followed plan? FOMO? revenge
  trade?).
- Searchable journal of mistakes & lessons across trades.
- Journal design details live in **[JOURNAL_DESIGN.md](JOURNAL_DESIGN.md)**:
  root-level, text-first month/week/day/trade notes with emotion/process review
  and trade notes rolling up into the Journal.

### 3.4 Trade Chart (entry/exit visualization)
- Per-trade candlestick chart with **entry/exit markers** plotted on the
  candles (buy = green up-triangle, sell = red down-triangle).
- Fed by **Massive 1-min candles** (§2-B, auto-fetched) + the trade's
  executions; PT→ET alignment handled so markers land on the right candle.
- Interactive: pan/zoom, crosshair showing OHLCV per candle.
- **Export to SVG** — capture a static snapshot of the chart into the journal
  entry for that trade.
- **Approach is proven** — adapt the existing prototype (§8) rather than rebuild
  from scratch. Open choice: keep its hand-rolled canvas+SVG renderer, or port
  the interactive view to TradingView **Lightweight Charts** while keeping the
  SVG-snapshot idea. See §7.

### 3.5 Screenshots
- Attach one or more chart images to a trade.
- Store images locally; display in the trade detail view.
- (Stretch) lightweight annotation / markup.

---

## 4. Architecture

### Stack
- **Framework:** Next.js (App Router) + React + TypeScript.
- **Styling:** TBD (Tailwind likely — fast for data-dense UI).
- **Charts:** general analytics charts via a React lib (Recharts / visx — TBD).
  The **trade entry/exit chart** is its own thing, adapted from the proven
  prototype (§8) — candlestick + markers + SVG export.
- **Data store:** **local-first SQLite.**
  - Accessed server-side via Next.js route handlers / server actions.
  - ORM/query layer: TBD (Drizzle or Prisma — Drizzle preferred for SQLite +
    TS ergonomics).
- **File storage:** screenshots saved to a local `data/uploads/` directory,
  referenced by path in the DB.

### Why local-first SQLite
- Personal use, single machine — no hosting cost, full privacy.
- Single-file DB is easy to back up (copy the file) and version.
- Can migrate to hosted Postgres later if multi-device sync is ever wanted; the
  data-access layer should isolate this choice.

### High-level layout
```
trading-journal/
  app/                # Next.js routes & pages
  components/         # UI components
  lib/
    db/               # schema, migrations, queries
    import/           # execution parsers: TOS (primary), DAS (2 formats)
    candles/          # CandleProvider: Massive (primary), Alpha Vantage, manual
    chart/            # candlestick + entry/exit markers + SVG export
    analytics/        # P&L, R-multiple, equity curve calcs
  data/
    journal.db        # SQLite database (gitignored)
    uploads/          # screenshots + imported CSVs (gitignored)
  DESIGN.md
```

---

## 5. Data Model (first cut)

Because DAS exports fills, **`Execution` is the source of truth** and a `Trade`
is a derived grouping of executions for one round-trip position.

**Execution** (one DAS fill — immutable)
- `id`
- `symbol`
- `side` (`buy` | `sell`)
- `quantity`
- `price`
- `executed_at`
- `fees`, `route` (nullable)
- `trade_id` (FK — assigned by the matching step, nullable until matched)
- `import_batch_id` (FK), `source_row_hash` (for dedupe)

**Trade** (derived round-trip / position)
- `id`
- `symbol`
- `side` (`long` | `short`)
- `quantity` (total shares traded)
- `avg_entry_price`, `entry_at` (first opening fill)
- `avg_exit_price`, `exit_at` (last closing fill; nullable while open)
- `fees` (sum of constituent executions)
- `stop_loss`, `target` (nullable — user-supplied for R calc)
- `setup` (label)
- `status` (`open` | `closed`)
- `created_at`, `updated_at`
- Derived (computed, not stored): `pnl`, `pnl_pct`, `r_multiple`,
  `holding_period`, fill count.

> Matching: a FIFO algorithm walks a symbol's executions chronologically,
> opening a Trade on the first fill and closing it when net position returns to
> zero. Scaling in/out stays within one Trade; a flip through zero starts a new
> one. FIFO vs LIFO should be configurable.

**Tag** + **TradeTag** (many-to-many)

**JournalEntry** (1:1 or 1:many with Trade)
- `trade_id`
- `thesis`, `what_went_well`, `what_went_wrong`, `lessons`
- `followed_plan` (bool), `emotional_state` (tags/enum)

**Attachment**
- `trade_id`, `file_path`, `caption`

**ImportBatch** (audit trail for imports)
- `kind` (`executions` | `candles`)
- `source` (`tos_csv` | `das_csv` | `manual` | `massive` | `alpha_vantage` |
  `tradingview_csv` | `tos_chart_csv`)
- `imported_at`, `row_count`, `file_name`

> Note: derived metrics (P&L, R) computed in the analytics layer so the source
> fields stay the single source of truth.

---

## 6. Phasing

### Phase 0 — Foundations
- Next.js + TS scaffold, Tailwind, SQLite + migrations, base layout.

### Phase 1 — Execution & trade model (MVP)
- `Execution` + `Trade` schema, FIFO matching engine, manual add/edit/delete,
  trade list, trade detail, derived P&L/R.

### Phase 2 — Execution CSV import (TOS primary, DAS secondary)
- Parse the **TOS Account Statement** (§8 format): slice the `Account Trade
  History` section → executions (use `Net Price`, `Pos Effect`), join `Cash
  Balance` for fees, cross-check against the `Profits and Losses` section.
- Run matching into trades (driven by `Pos Effect`), with preview/confirm and
  row-hash dedupe. **Reuse the fill-aggregation logic from the §8 prototype**;
  parse `Exec Time` as **Pacific → Eastern** via IANA zones (§9 Timezone), not
  the prototype's hardcoded −4.
- Add the **DAS** parser (two formats from the §8 prototype) as a second source.

### Phase 3 — Trade chart + candle auto-fetch
- Port the §8 candlestick + entry/exit-marker chart into the trade detail view;
  keep SVG export. (Earlier than analytics because the code already exists and
  it's the most distinctive feature.)
- **Auto-fetch candles** for the parsed symbols via the `CandleProvider`
  (**Massive**, validated) into the `candles` cache — eliminates per-symbol
  manual exports (§9). Adapt the proven `scripts/dev-chart-server.mjs` proxy
  (key server-side) into the app's server route. Alpha Vantage / manual export
  remain fallbacks.

### Phase 4 — Analytics
- Summary dashboard, equity curve, filters & breakdowns.

### Phase 5 — Review & journaling
- Reflection fields, emotional/discipline tracking, lessons search.

### Phase 6 — Screenshots
- Image upload, attach to trades, display in detail view.

### Phase 7 — Provider hardening (optional)
- Candle auto-fetch already lands in Phase 3 (Massive). This optional phase adds
  robustness only if needed: the **Alpha Vantage** free fallback adapter, retry /
  rate-limit handling, bulk historical backfill, and a usage-based deep-history
  option (**Databento**) — all behind the existing `CandleProvider`.

---

## 7. Open Questions
- ~~Automate the candle data?~~ — **resolved: Massive, validated 91/91** (§9).
  App auto-fetches candles for the parsed symbols, key proxied server-side. Kills
  the per-symbol export drudgery; no UI scraping. Alpha Vantage = free fallback.
  Massive **free tier confirmed working** (rate-limited, fine). *Loose end:*
  prove an actual pre-market fill (sample had none).
- ~~DAS vs TOS for executions~~ — **resolved: TOS primary** (Pos Effect +
  built-in P&L), DAS secondary. See §8 for the confirmed TOS format.
- ~~Pre-market coverage~~ — **resolved:** Massive includes extended-hours
  candles. (Still want to confirm against an actual pre-market fill.)
- **Trade chart renderer** — keep the prototype's canvas+SVG, or port to
  Lightweight Charts + keep SVG snapshot? (Either works; not blocking.)
- **Matching edge cases:** position flips through zero, shorts, overnight holds
  spanning export files, partial-day exports. FIFO vs LIFO default.
- Styling lib: confirm Tailwind.
- ORM: Drizzle vs Prisma for SQLite.
- Analytics charting lib choice.
- Backup strategy for the SQLite file.

> **Resolved:**
> - Partial fills / scaling in & out — `Execution` → `Trade` FIFO matching (§5).
> - Candle data source — **Massive**, app-auto-fetched, validated 91/91 (§9).
> - TOS `Exec Time` zone — **Pacific → Eastern** (§9 Timezone).
> - Trade-chart approach — adapt the proven §8 prototype.

---

## 8. Prior Work & Assets

Work to date has been scattered across files and chats. Index of what exists and
how it feeds this project:

### Trade-chart prototype ⭐ (the key reusable asset)
- **File:** `~/Desktop/trade_chart (10).html` — a single self-contained HTML
  file (~886 lines, embedded ROLR sample data, opens standalone in a browser).
- **What it does:** drag-drop a **TradingView candle CSV** + a **DAS Trader
  log**; renders a candlestick chart (canvas) with **buy/sell markers**,
  crosshair OHLCV, an execution table with running P&L, multi-symbol tabs, and
  an **Export-SVG** button. Price axis is SVG.
- **Reusable logic (port these):**
  - **DAS parser, two formats** — new (`TradeID,OrderID,…`, `B`/`S`,
    `MM/DD/YY HH:MM:SS`, every row an execution) and old (`Event,B/S,…`, filter
    `Event=Execute`, `HH:MM:SS`).
  - Timestamp conversion (note: hardcoded EDT = UTC−4 — **wrong for TOS**, which
    is Pacific; see §9 Timezone. The DAS path may differ; verify per source.)
  - **Same-minute, same-side fill aggregation** → effectively the
    execution-grouping step.
  - **Running avg-cost P&L** per symbol.
  - Candle CSV ingestion (`epoch,o,h,l,c,…,vol`).
- **History:** evolved over a long chat (started pure-SVG, fixed candle slots,
  pan/zoom + momentum, price-range bug fixes when zoomed out) — see the shared
  thread "Trade entry and exit visualization tool".

### Massive candle integration ⭐ (in-repo, validated)
- **`scripts/dev-chart-server.mjs`** — local server: serves the prototype and
  **proxies Massive** (`/api/massive/aggs?symbol=&date=`) with `MASSIVE_API_KEY`
  read server-side from `.env.local` (gitignored). Key never hits the browser.
- **`scripts/test-massive-coverage.mjs`** — parses the TOS sample, fetches
  Massive 1-min bars per symbol/day, asserts each fill maps to a candle with
  price in range. **Result: 91/91 PASS** (see §9). Configurable TZ, price
  tolerance, rate-limit delay.
- **`scripts/test-massive-candles.mjs`** — single-symbol probe.
- **`trade_chart (10)-prototype.html`** — prototype wired to the dev server.
- Run: put `MASSIVE_API_KEY=…` in `.env.local`, then
  `node scripts/dev-chart-server.mjs` → http://127.0.0.1:4173/.

### TOS Account Statement format (primary execution source)
- **Sample / fixture:** `data/samples/2026-03-04-AccountStatement.csv`
  (gitignored — real trades; re-export to reproduce on another machine).
- **One file, multiple stacked sections** separated by blank lines, each with its
  own header row. The parser must locate sections by header, not read the whole
  file as one table. Sections present:
  1. **Cash Balance** — `DATE,TIME,TYPE,REF #,DESCRIPTION,Misc Fees,Commissions
     & Fees,AMOUNT,BALANCE`. Fills as free-text description
     (`BOT +100 TMDE @4.52`, `SOLD -2,180 AIFF @1.7117`). **Has fees** (Misc
     Fees) and running cash balance.
  2. **Account Order History** — every order incl. `CANCELED`/`REJECTED`, with
     `Pos Effect`, `TIF`. Bonus data for journaling intent; not needed for core.
  3. **Account Trade History** ⭐ **— primary execution table.**
     `,Exec Time,Spread,Side,Qty,Pos Effect,Symbol,Type,Price,Net Price,Order
     Type`. One row per fill. `Exec Time` = `M/D/YY H:MM:SS`.
  4. **Profits and Losses** — per-symbol `P/L Day`, `P/L YTD`, etc. Use to
     **validate** computed P&L.
  5. Account Summary, plus empty Futures/Forex/Crypto stubs (ignore).
- **Field mapping (Account Trade History → `Execution`):** `Exec Time`→
  `executed_at`, `Side`(BUY/SELL)+signed `Qty`→`side`/`quantity`, `Symbol`,
  **`Net Price`**→`price` (matches the cash ledger; `Price` can differ),
  `Pos Effect`(TO OPEN/TO CLOSE)→drives round-trip matching. Fees come from the
  **Cash Balance** section (join by time+symbol+qty, or just total them).
- **Parsing gotchas:**
  - **`Exec Time` is Pacific (`America/Los_Angeles`), NOT Eastern.** ⚠️
    *Confirmed empirically* by the Massive coverage test (price-in-range only
    passes under PT→ET). Parse as PT, convert to Eastern market time via IANA
    zones (see §9 Timezone). The chart prototype's hardcoded −4 offset is wrong.
  - Strip `="…"` wrapper on `REF #` and comma thousands separators
    (`-2,180`, `90,439.83`).
  - Use `Net Price`, not `Price`.
  - This sample is 86 regular + 5 after-hours, **0 pre-market** (times read as
    PT, e.g. `06:34 PT → 09:34 ET`, regular). Pre-market still expected on other
    days → extended-hours candles required (§2-B).
- **Account:** export is from the **Swing** account (`…SCHW (Swing)`),
  commission-free; only tiny SEC/TAF Misc Fees.

### Reference: current journal tool (UI inspiration)
- Four screenshots of the journal app currently in use define the target feature
  set: **Trades table** (filters, gross/net, pagination, CSV export), **Reports
  → Detailed** (stats grid + day/hour/month/duration distributions), **Reports →
  Calendar** (monthly P&L heatmap), and a widget **Dashboard**. Scope to the
  basics — not a full clone of every widget.

### `trading-dashboard` — dead prototype, harvest for parts
- `~/Working/trading-dashboard` ("Momentum Trading Dashboard") — an **abandoned
  early prototype** (Supabase is pausing its DB for inactivity). A *market-regime
  memory companion* (daily mood, pattern types, Gemini AI sentiment/news) —
  explicitly *not* a trade journal/chart tool.
- **Decision: scaffold fresh, don't harvest.** It's coupled to **Supabase
  (hosted Postgres) + RLS + auth**, conflicting with our **local-first SQLite,
  single-user, no-auth** design. Cleaner to start clean than to untangle it — we
  build a **fresh `trading-journal` app** from scratch (Phase 0).

### Not related (ruled out)
- `~/Working/trading-learning-app` (GitHub: `justin-carlson/trading-learning-app`)
  — an *educational* app (trading patterns, risk calculator, L2 simulator). No
  chart/journal code. Cloned locally only for evaluation.

### Source repo
- `github.com/justin-carlson/trading-journal` (private) — this project.

---

## 9. Candle Data Pipeline (OHLCV for the chart)

The per-trade chart needs 1-minute OHLCV candles **with extended hours**.

> **Decision: provider = Massive (validated), app-driven auto-fetch.** The app
> auto-fetches candles for the symbols it parsed from the TOS export, via
> **Massive** (Polygon-platform `/v2/aggs` 1-min bars). Coverage was validated
> 91/91 against real penny-stock trades (see below). Alpha Vantage is the free
> fallback; manual TradingView/ToS export is the last resort.

### ✅ Validation result (coverage test)
- `scripts/test-massive-coverage.mjs` parsed all **91 executions** from the TOS
  sample and matched every one to a Massive 1-min candle: **91/91 PASS**,
  including thin penny names (MOBX ~$0.95, CDTG ~$0.53, ASNS ~$0.55).
- Each fill's price fell **inside the matched candle's high/low** — proof both
  that coverage is real *and* that the timestamp mapping is correct.
- Bar counts (~945/symbol-day) confirm **extended-hours candles are present**.
- This sample happened to be 86 regular + 5 after-hours, **0 pre-market** — so
  pre-market is covered *in principle* (extended bars exist) but not yet proven
  on an actual pre-market fill. Re-check when a pre-market trade appears.

### Cost
- **Candles are $0** — the Massive **free tier** is sufficient (per-minute rate
  limit only; a session's handful of symbols fits). This project **replaces
  TraderVue ($29.95/mo)** with no new recurring data cost.
- **Alpha Vantage = $0 fallback** if Massive's free tier ever changes. Privacy
  note: a candle API never sees trades — only public OHLCV requests for a
  ticker+date. Data stays local, private, and owned.

### The real pain point: per-symbol chart exports
- The TOS execution export is **one step** for the whole session.
- But candles must be pulled **per symbol** — 2–10 manual chart exports per
  session, every session. That repetition is the friction worth automating.
- **Automating TradingView's UI** (agent / browser bot) to do those exports is
  the *wrong* fix: it violates TradingView's ToS (and ToS runs on the brokerage
  login), it's brittle, and it's more work than the API path below.

### App auto-fetches candles for the parsed symbols
The TOS execution export is **one step** for the whole session, but candles
otherwise need **2–10 manual chart exports per session** — that repetition is the
real friction. Because the importer already parsed the executions, **the app
knows exactly which symbols + dates were traded**, so it fetches their candles
itself. Per-symbol manual exports drop to **zero**:

1. Export TOS Account Statement (1 step, unchanged).
2. Import → parse executions → **app auto-fetches candles for each traded symbol
   via the `CandleProvider`** → cache locally → render.

- **Provider: Massive** (Polygon-platform). Endpoint pattern (from the working
  prototype):
  `GET https://api.massive.com/v2/aggs/ticker/{SYMBOL}/range/1/minute/{date}/{date}?adjusted=false&sort=asc&limit=50000&apiKey=…`
  → `results[]` of `{t (ms), o,h,l,c,v}`.
- **Key handling (already prototyped):** `scripts/dev-chart-server.mjs` reads
  `MASSIVE_API_KEY` from `.env.local` and **proxies** the call server-side, so
  the key never reaches the browser. This is the model for the real app's server
  route / server action.
- **⚠️ Do not automate TradingView/ToS UIs** to grab candles (agent/browser bot):
  it violates their ToS (ToS is on the brokerage login), is brittle, and is more
  work than this API call.

### Fallbacks
1. **Alpha Vantage free tier** — the $0 automated option if we ever want to drop
   the Massive cost. `TIME_SERIES_INTRADAY`, 1-min, `extended_hours=true` by
   default, historical by `month=YYYY-MM`; ~25 req/day (fine for a session's
   handful of symbols). Coverage on thin penny names unverified.
2. **Manual "Export chart data" CSV** (TradingView, already paid; or free ToS),
   same `timestamp,o,h,l,c,vol` format — last resort for a symbol the APIs miss.
   Turn the chart's **extended-hours session** on first.

### Core strategy: fetch once on import, cache forever
- On import, for each traded symbol+day, fetch the 1-min candles **once** and
  **persist them in SQLite** (new `candles` table: `symbol, timeframe, t (epoch),
  o,h,l,c,vol`, unique on `symbol+timeframe+t`).
- After that the chart reads from the local cache — no re-fetch, works offline,
  and a short-lookback provider stops mattering for *ongoing* trades.
- All providers sit behind one **`CandleProvider` interface**
  (`getCandles(symbol, fromEpoch, toEpoch, timeframe)`), so the source is a
  config/adapter choice, not a rewrite.

### ⏰ Timezone (critical — corrects an earlier assumption)
- **TOS `Exec Time` is Pacific (`America/Los_Angeles`), NOT Eastern.** The
  account/platform exports in the trader's local PT. Earlier drafts (and the §8
  chart prototype) wrongly assumed Eastern — that's fixed here and in §8.
- Pipeline: parse `Exec Time` as **PT → convert to Eastern market time
  (`America/New_York`) → epoch** for candle matching. Use **IANA time zones**
  (as `test-massive-coverage.mjs` does), not hardcoded offsets — both zones
  observe DST so the gap is usually 3h, but let the zone database handle edges.
- The **price-in-range check is the correctness guard**: if the TZ mapping were
  wrong, fills wouldn't land inside their candles. Keep it as an import-time
  sanity assertion.

### Backfill (old trades)
- Massive carries deep historical 1-min, so old trades are reachable, not just
  recent ones. (Fetch-once-and-cache still applies.)
- **How TraderVue does it (reference):** renders with TradingView's charting
  library but feeds it their **own licensed historical data vendor** — the deep
  history is the data feed, not TradingView.

### Provider options
| Provider | Cost | Ext. hours | 1-min history | Notes |
|---|---|---|---|---|
| **Massive** ⭐ (Polygon platform) | **Free tier** (rate-limited) | ✅ full session | ✅ years | **Chosen + validated 91/91.** `/v2/aggs/ticker/.../range/1/minute/...`. Free tier sufficient. |
| **Alpha Vantage** | **Free** (~25 req/day) | ✅ `extended_hours=true` (default) | ✅ by month (years) | $0 fallback; thin-name coverage unverified. |
| **Databento** | Usage-based (one-time) | ✅ | ✅ deepest quality | If a one-time deep backfill is ever needed. |
| **Schwab Market Data** | Free w/ account | ✅ `needExtendedHoursData=true` | ⚠️ ~30–35 days | Ruled out: short window + 7-day OAuth re-auth. |
| **Twelve Data** | free / paid | ❌ ext. hours = Pro only | mid | Free tier lacks pre-market → unsuitable. |
| **yfinance** (unofficial) | Free | ⚠️ gappy | ⚠️ ~7–30 days | Unreliable on thin names. |

### Decision
- **Provider = Massive**, app-driven (fetch candles for the parsed symbols),
  cached locally. Validated 91/91. Key proxied server-side (never in browser).
- **Alpha Vantage = free fallback**; manual TradingView/ToS export = last resort.
- **`CandleProvider` interface + `candles` cache** so swapping/adding a provider
  later is config, not a rewrite.
- ⚠️ **Do not automate TradingView/ToS UIs** — ToS violation, brittle, and
  unnecessary now that the API path is proven.
