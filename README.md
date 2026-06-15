# Trading Journal

A local-first trading journal for importing broker executions, reviewing trades
with candlestick charts, tracking performance, and writing lightweight journal
notes that roll up from trade to day to week to month.

This project is early, but the core direction is clear: make trade review fast,
private, and useful without depending on a hosted journaling subscription.

## Vision

Most trading journals are good at tables and reports, but the real review loop is
more human:

- What setup did I take?
- Did the chart actually support the entry?
- Did I cut losers quickly enough?
- Did I hold winners long enough?
- Was this a process problem, an emotional problem, or just normal variance?

Trading Journal is designed around that loop. It combines imported executions,
per-trade charts, reports, a P&L calendar, and a text-first journal so the
numbers and the reflection live together.

## Current Features

- **ThinkorSwim CSV import** for Account Statement exports.
- **Execution matching** into round-trip trades.
- **Local SQLite storage** with Drizzle migrations.
- **Automatic candle fetching** through Massive for OHLCV data.
- **Trade detail charts** with candlesticks and entry/exit markers.
- **Trades table** with symbol/tag/side/account filters, sorting, pagination,
  and per-share value.
- **Calendar views** for monthly and yearly P&L review.
- **Reports** with stats, cumulative/daily P&L, and distribution charts.
- **Dashboard** with weekly P&L, win rate, profit factor, payoff ratio, average
  trade, and recent trades.
- **Journal** with month/week/day structure, daily trade recaps, and trade notes
  that link back to the trade chart.
- **Light/dark theme toggle**.

See [FEATURES.md](FEATURES.md), [DESIGN.md](DESIGN.md), and
[JOURNAL_DESIGN.md](JOURNAL_DESIGN.md) for deeper product notes.

## How It Works

The app uses broker executions as the source of truth.

1. Export a ThinkorSwim Account Statement CSV.
2. Import the CSV into the app.
3. The importer parses fills and groups them into trades.
4. The app fetches one-minute OHLCV candles for each traded symbol/date.
5. Trades, candles, reports, and notes are stored locally in SQLite.

Your trade data stays on your machine unless you intentionally deploy or share
it.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS
- SQLite
- Drizzle ORM
- better-sqlite3
- Massive API for stock candles

## Requirements

- Node.js 20+
- npm
- A Massive API key if you want automatic candlestick data

The app can still run without a Massive key, but trade charts that need candle
data will fail to fetch new candles until the key is configured.

## Setup

Install dependencies:

```bash
npm install
```

Create a local environment file:

```bash
cp .env.example .env.local
```

Set your Massive API key in `.env.local`:

```bash
MASSIVE_API_KEY=your_key_here
```

Create the local SQLite database:

```bash
npm run db:migrate
```

Start the development server:

```bash
npm run dev
```

Open:

[http://localhost:3000](http://localhost:3000)

## Useful Scripts

```bash
npm run dev          # Start the local Next.js dev server
npm run build        # Build the app
npm run start        # Start the production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run db:migrate   # Apply Drizzle migrations
npm run db:generate  # Generate migrations after schema changes
npm run db:push      # Push schema changes directly
npm run db:studio    # Open Drizzle Studio
```

## Data & Privacy

Local private data is gitignored:

- `data/journal.db`
- `data/journal.db-*`
- `data/uploads/`
- `data/samples/`
- `.env.local`

Real broker exports should not be committed. They can contain account numbers,
trade history, symbols, timestamps, and other private information.

## Demo Data

Generate a synthetic demo database:

```bash
npm run demo:db -- data/tradingjournaldemo.db
```

The demo database uses fake trading activity and journal notes. It is intended
for screenshots, hosted demos, and contributor onboarding; do not commit real
broker exports or a personal `data/journal.db`.

## Hosting A Demo

The app can run locally from SQLite or in production against Turso/libSQL.
For a hosted demo:

```bash
# 1. Generate demo data
npm run demo:db -- data/tradingjournaldemo.db

# 2. Upload it to Turso
turso db create trading-journal-demo --from-file data/tradingjournaldemo.db --wait
turso db show trading-journal-demo
turso db tokens create trading-journal-demo

# 3. Link and configure Vercel
vercel link --project trading-journal
vercel env add TURSO_DATABASE_URL production
vercel env add TURSO_AUTH_TOKEN production

# 4. Deploy
vercel --prod
```

Required hosted environment variables:

```bash
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your_turso_token_here
```

Keep `MASSIVE_API_KEY` server-side only. Do not let public users upload private
broker exports unless there is a clear privacy model.

## Candle Data

Candles are fetched from Massive using one-minute aggregate bars. The API key is
read server-side from `.env.local`; it is not pasted into the browser.

Environment variable:

```bash
MASSIVE_API_KEY=your_key_here
```

The candle cache is stored locally in SQLite so each symbol/date only needs to
be fetched once.

## Import Notes

The current importer is focused on ThinkorSwim Account Statement CSVs. The
parser expects the statement sections exported by ThinkorSwim, especially
`Account Trade History`.

Known assumptions:

- `Exec Time` is interpreted as Pacific time and mapped to Eastern market time.
- `Net Price` is used for fill price.
- Re-importing the same file is intended to be safe; duplicate executions are
  skipped.

## Project Docs

- [DESIGN.md](DESIGN.md) - product design, architecture, data model, and phases.
- [FEATURES.md](FEATURES.md) - feature inventory and scope.
- [JOURNAL_DESIGN.md](JOURNAL_DESIGN.md) - journal model, note hierarchy, and
  review philosophy.

## Roadmap

Near-term:

- Add public-safe demo data and a seed command.
- Harden import previews and error states.
- Improve trade chart pan/zoom and volume context.
- Generalize journal notes beyond trade-level entries.
- Add backup/export guidance for SQLite data.

Later:

- DAS Trader CSV import.
- Manual candle CSV fallback.
- Settings for timezone, fees, and defaults.
- Search across journal notes.
- Optional hosted/demo deployment.

## License

No license has been selected yet. Add a license before opening the repository to
outside contributors.
