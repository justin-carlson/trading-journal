# Trading Journal

A personal, local-first web app for logging stock/ETF trades, reviewing them
reflectively, and tracking performance over time.

Built for single-user, private use. Data lives locally in SQLite.

## Status

Early design. See [DESIGN.md](DESIGN.md) for the full plan, scope, and phasing.
See [JOURNAL_DESIGN.md](JOURNAL_DESIGN.md) for the text-first review and
coaching journal model.

## Planned stack

- Next.js (App Router) + React + TypeScript
- Local-first SQLite

## Data pipeline (current plan)

Two manual CSV inputs feed the journal:

- **Executions (your trades)** — exported from **DAS Trader** (or **ThinkorSwim**)
  at the fill level. Grouped into round-trip trades via FIFO matching.
- **Candles (for the chart)** — fetched from **Massive** using 1-minute stock
  aggregate bars. The local prototype maps ThinkorSwim execution times into
  Eastern market time, fetches the matching symbol/day candles, and overlays
  entries/exits on the chart.

A working **trade-chart prototype** already exists at
`~/Desktop/trade_chart (10).html` — candlesticks + entry/exit markers + SVG
export, with a reusable DAS parser. We adapt it rather than rebuild. See
[DESIGN.md §8](DESIGN.md) for the full asset index.

## Phases

Scaffold → execution/trade model + FIFO matching → DAS/TOS import → trade chart
→ analytics → journaling → screenshots → automated candle/sync.

## Local chart prototype

Create `.env.local` in the project root:

```bash
MASSIVE_API_KEY=your_key_here
```

Run the local prototype server:

```bash
node scripts/dev-chart-server.mjs
```

Open:

[http://127.0.0.1:4173/](http://127.0.0.1:4173/)

Use the **TOS + Massive Visual Test** panel to load a ThinkorSwim Account
Statement CSV. The browser calls the local server, and the server reads
`MASSIVE_API_KEY` from `.env.local`, so the key does not need to be pasted into
the HTML page.

For this sample export, ThinkorSwim `Exec Time` appears to be Pacific time; the
prototype converts it to Eastern market time before matching 1-minute candles.

## Getting started

The app is a **Next.js 16 (App Router) + TypeScript + Tailwind** project with a
**local-first SQLite** database via **Drizzle + better-sqlite3**.

```bash
npm install
npm run db:migrate      # creates data/journal.db from drizzle/ migrations
npm run dev             # http://localhost:3000
```

Useful scripts:

- `npm run db:generate` — generate a migration after editing `src/lib/db/schema.ts`
- `npm run db:migrate` / `db:push` — apply migrations
- `npm run db:studio` — Drizzle Studio
- `npm run build` / `npm test` / `npm run lint`

Data layout (gitignored): `data/journal.db` (SQLite), `data/uploads/`
(screenshots), `data/samples/` (broker-export fixtures).
