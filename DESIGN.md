# Trading Journal — Design Doc

> Status: **Draft v1** · Last updated: 2026-06-11

A personal, local-first web app for logging stock/ETF trades, reviewing them
reflectively, and tracking performance over time.

---

## 1. Goals & Non-Goals

### Goals
- **Single-user, personal tool.** Built for one trader (me). No accounts, no
  multi-tenancy, no public sharing in v1.
- **Capture every trade** with the context that makes review valuable: setup,
  notes, tags, emotional state, screenshots.
- **Understand performance** through clear analytics: P&L, win rate,
  R-multiples, equity curve.
- **Reduce friction on data entry** by supporting broker CSV import, with an
  eventual automated sync from Schwab.
- **Local-first & private.** Data lives on my machine; no dependency on a hosted
  service to function.

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
1. **Manual entry** — a form to add/edit a trade by hand.
2. **CSV import** — parse broker trade-history exports into trades.
3. **Broker API sync (later phase)** — automated pull from **Schwab** (formerly
   TD Ameritrade). Designed as a pluggable importer, not a v1 deliverable.

---

## 3. Core Features (v1)

### 3.1 Trade Logging
- Add / edit / delete trades.
- Fields: symbol, side (long/short), entry & exit date/time, entry & exit price,
  quantity, fees/commissions, stop loss, target.
- Derived: P&L ($ and %), R-multiple, holding period.
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

### 3.4 Charts & Screenshots
- Attach one or more chart images to a trade.
- Store images locally; display in the trade detail view.
- (Stretch) lightweight annotation / markup.

---

## 4. Architecture

### Stack
- **Framework:** Next.js (App Router) + React + TypeScript.
- **Styling:** TBD (Tailwind likely — fast for data-dense UI).
- **Charts:** a React charting lib (e.g. Recharts / visx — decide at build time).
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
    import/           # CSV parsers + broker importers (Schwab adapter later)
    analytics/        # P&L, R-multiple, equity curve calcs
  data/
    journal.db        # SQLite database (gitignored)
    uploads/          # screenshots (gitignored)
  DESIGN.md
```

---

## 5. Data Model (first cut)

**Trade**
- `id`
- `symbol`
- `side` (`long` | `short`)
- `quantity`
- `entry_price`, `entry_at`
- `exit_price`, `exit_at` (nullable while open)
- `fees`
- `stop_loss`, `target` (nullable)
- `setup` (label)
- `status` (`open` | `closed`)
- `created_at`, `updated_at`
- Derived (computed, not stored): `pnl`, `pnl_pct`, `r_multiple`,
  `holding_period`.

**Tag** + **TradeTag** (many-to-many)

**JournalEntry** (1:1 or 1:many with Trade)
- `trade_id`
- `thesis`, `what_went_well`, `what_went_wrong`, `lessons`
- `followed_plan` (bool), `emotional_state` (tags/enum)

**Attachment**
- `trade_id`, `file_path`, `caption`

**ImportBatch** (audit trail for CSV/API imports)
- `source` (`csv` | `schwab`), `imported_at`, `row_count`

> Note: derived metrics (P&L, R) computed in the analytics layer so the source
> fields stay the single source of truth.

---

## 6. Phasing

### Phase 0 — Foundations
- Next.js + TS scaffold, Tailwind, SQLite + migrations, base layout.

### Phase 1 — Trade logging (MVP)
- Manual add/edit/delete, trade list, trade detail, derived P&L/R.

### Phase 2 — CSV import
- Upload + map broker CSV → trades, with a preview/confirm step and dedupe.

### Phase 3 — Analytics
- Summary dashboard, equity curve, filters & breakdowns.

### Phase 4 — Review & journaling
- Reflection fields, emotional/discipline tracking, lessons search.

### Phase 5 — Charts & screenshots
- Image upload, attach to trades, display in detail view.

### Phase 6 — Schwab API sync (later)
- Schwab adapter behind the importer interface; auth, fetch, map, dedupe.

---

## 7. Open Questions
- Styling lib: confirm Tailwind.
- ORM: Drizzle vs Prisma for SQLite.
- Charting lib choice.
- CSV format: which exact Schwab export are we targeting? (need a real sample).
- How to handle partial fills / scaling in & out (multiple entries/exits per
  position)? May need a `TradeLeg` / execution table sooner than expected.
- Backup strategy for the SQLite file.
