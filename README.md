# Trading Journal AI

[Trading Journal AI](https://trading-journal.ai) is a local-first trading
journal built around the review habit first: write the recap, see the day in
context, and drill into the trade evidence only when it matters.

Instead of starting with a dense trade table, the app treats trading review more
like a chronological note journal. Days, weeks, and months become the structure.
Imported executions, P&L charts, and reports sit beside your notes so the story
of each trading day is easier to review and document.

The goal is to make journaling feel low-friction. Start with a daily recap, add
trade notes when a specific trade deserves attention, and come back later to a
human-readable record of what happened instead of a grid of data you have to
sort through again.

The project is early, but the core direction is clear: make reflection fast,
private, and useful without depending on a hosted journaling subscription.

## Vision

Most trading journals are good at tables and reports. That matters, but the real
review loop is more human:

- What setup did I take?
- Did the chart actually support the entry?
- Did I cut losers quickly enough?
- Did I hold winners long enough?
- Was this a process problem, an emotional problem, or just normal variance?

Trading Journal AI is designed around that loop. The journal is the center of
the product, not an afterthought. You can scan a month like a notebook, read
daily recaps chronologically, see the trades that shaped the day, and then drill
into a ticker or individual trade when you need the chart, executions, or trade
note.

The goal is to reduce friction between "what happened?" and "what did I learn?"
The numbers, charts, and trade log are still there, but they support the journal
instead of replacing it.

## Review Flow

The primary workflow is intentionally simple:

1. Import executions from a broker CSV so the trade data, P&L, charts, and
   calendar context are created automatically.
2. Open the journal and review the day in chronological context.
3. Write a daily recap that captures the market read, execution quality,
   emotions, and lessons from the session.
4. Use the daily P&L chart and ticker list to see what shaped the day.
5. Drill into a ticker review when you want to inspect the trades behind a
   symbol.
6. Open a single trade when the chart, executions, or setup deserves a specific
   trade note.
7. Save that trade note back into the journal, nested under the same day, so the
   recap and supporting trade evidence stay connected.
8. Zoom back out to the week or month so one red day does not dominate the
   bigger story.

That structure keeps the journal lightweight and readable while still making the
underlying data available when it is useful.

## Current Features

- **CSV import** for ThinkorSwim Account Statement exports and DAS
  trade-summary exports.
- **Execution matching** into round-trip trades.
- **Local SQLite storage** with Drizzle migrations.
- **Automatic candle fetching** through Massive for OHLCV data.
- **Journal-first review** with month/week/day chronology, daily recaps, and
  trade notes that link back to the chart.
- **Ticker review** for quickly drilling into all trades for a symbol on a given
  day.
- **Trade detail charts** with candlesticks, volume, entry/exit markers, and
  trade notes.
- **Trade log** with sorting, pagination, and per-share value for deeper data
  inspection.
- **Calendar views** for monthly and yearly P&L context.
- **Reports** with cumulative P&L, stats, at-a-glance metrics, and distribution
  charts.
- **Light/dark theme toggle**.

See [FEATURES.md](docs/FEATURES.md), [DESIGN.md](docs/DESIGN.md), and
[JOURNAL_DESIGN.md](docs/JOURNAL_DESIGN.md) for deeper product notes.

## How It Works

The app uses broker executions as the source of truth.

1. Export a supported broker CSV.
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

The app can run without a Massive key, but trade charts need candle data to show
real one-minute candlesticks. Without a key, you can still import/review trades,
write notes, use the calendar, and explore reports; charts that have not already
been cached will not be able to fetch new candle rows.

[Massive](https://www.massive.com/) provides the market data API used by this
project. The app uses their one-minute aggregate stock bars to draw the
candlestick charts behind ticker reviews and trade details. The Massive free
plan is enough to run the app locally; you do not need a paid plan just to try
the journal.

## Setup

There are two ways to run the app locally:

1. **Demo mode** - use the included demo dataset with trades and seeded notes.
   This is best for previewing the app before importing personal data.
2. **Live/local mode** - create your own private local journal and import your
   own broker CSV.

Both modes run on your machine and store data in a local SQLite database inside
this project folder.

```bash
git clone https://github.com/trading-journal-ai/trading-journal.git
cd trading-journal
./install-trading-journal.sh
```

Run the installer from inside the cloned `trading-journal` folder. If you see
`no such file or directory`, you are probably one folder too high. Run
`cd trading-journal` first, then run `./install-trading-journal.sh`.

The installer:

- Installs the project dependencies with `npm install`.
- Asks whether you want to start with the included demo data or an empty local
  journal.
- Asks whether you want to add chart data with a Massive API key or skip it for
  now. If you add a key, it saves it to `.env.local` and checks whether the key
  works. The key is hidden while you paste it.
- Creates the local SQLite database.
- Starts the app at [http://localhost:3000](http://localhost:3000).

The script does not install anything globally. Everything it creates stays in
this folder.

## Running the App

After the installer finishes, the app starts automatically. To use the journal,
leave that terminal window open and open the local URL it prints, usually
[http://localhost:3000](http://localhost:3000).

### Start it

If you come back later, open this project folder in your terminal and run:

```bash
npm run dev
```

This launches the local app. Leave the terminal window open while you use the
journal. You will see log messages scroll by; that is normal.

### Stop it

Click the terminal window and press **Ctrl + C**. On Mac, that is the Control
key, not Command. The app shuts down and you get your prompt back. You can close
the terminal after that.

### Restart it

Press **Ctrl + C** to stop the app, then run `npm run dev` again. You can also
close the terminal, open a new one in this project folder, and run
`npm run dev`.

### Your data is safe

The journal stores everything in a SQLite database file on your computer.
Stopping and starting the app never deletes your entries. Your data lives on
disk, not in the running terminal process.

### Troubleshooting

If the browser does not open automatically, go to
[http://localhost:3000](http://localhost:3000) manually. If Next.js says it is
using a different port, use the URL printed in the terminal instead.

If you see a "port already in use" message, a previous copy may still be
running. On Mac or Linux, this frees the default port:

```bash
lsof -ti:3000 | xargs kill -9
```

On Windows, find the process ID:

```bash
netstat -ano | findstr :3000
```

Then stop it, replacing `<that-number>` with the PID from the last column:

```bash
taskkill /PID <that-number> /F
```

Once the port is free, run `npm run dev` again.

### Massive API Key

Charts need candle data. To enable charts, create a free account at
[Massive](https://www.massive.com/), copy your API key, and paste it when the
installer asks for it.

The installer writes the key into `.env.local`, which is gitignored and should
stay on your machine. If you skip the key at first, the app still runs, but
charts that have not already been cached will not be able to fetch new candle
rows.

### Demo Mode

Choose demo mode if you just want to see the app working.

The repo includes a demo dataset with trades and seeded journal notes for
previewing, testing, and giving feedback. The demo trade CSV lives here:

```text
samples/das-paper-trades-2026-demo.csv
```

Demo mode creates `data/tradingjournaldemo.db`, imports the demo CSV, and adds
demo journal notes: one daily recap per active trading day, plus trade notes for
the best winner and worst loser when available.

If you want to reset the local demo data later:

```bash
npm run reset:local
```

### Live/Local Mode

Choose live/local mode when you are ready to import your own trades.

The installer creates `data/journal.db` and starts the app with an empty
journal. From there, use the Import button in the app and upload your broker
CSV.

The importer was originally built around ThinkorSwim/Schwab account statement
exports, especially the `Account Trade History` section. It also supports
DAS-style trade-summary CSVs.

If you use another broker, the CSV may not work immediately. Broker exports are
not standardized: each broker can use different column names, timestamps, side
labels, fees, and trade grouping. In that case, the best path is to use Codex or
another coding assistant with an anonymized sample CSV to add a broker-specific
import adapter. The adapter's job is to translate that broker's CSV into the
shared trade/execution format the app already understands.

For non-technical users: the important part is that you do not have to redesign
the app for each broker, but you may need help teaching the importer how to read
your broker's CSV.

### Manual Setup

The installer is the recommended path. If you prefer to run each step yourself:

```bash
npm install
cp .env.example .env.local
```

Add your Massive key to `.env.local` if you have one:

```bash
MASSIVE_API_KEY=your_key_here
```

For demo data:

```bash
DB_PATH=data/tradingjournaldemo.db npm run db:migrate
npm run demo:paper
DB_PATH=data/tradingjournaldemo.db npm run dev
```

For an empty local journal:

```bash
npm run db:migrate
npm run dev
```

If you added a Massive API key, you can also pre-load candlestick data:

```bash
npm run demo:candles -- --db data/tradingjournaldemo.db
```

That step can take a while because it fetches one symbol/day pair at a time and
respects API rate limits. Once candles are cached in SQLite, the app does not
need to refetch them for the same symbol/date.

## Useful Scripts

```bash
npm run dev          # Start the local Next.js dev server
npm run setup:local  # Interactive local setup for demo or empty journal mode
npm run reset:local  # Reset the included local demo dataset
npm run build        # Build the app
npm run start        # Start the production build
npm run lint         # Run ESLint
npm test             # Run tests
npm run demo:paper   # Rebuild the paper-trading demo DB and seed notes
npm run demo:candles # Cache Massive candle data for the demo DB
npm run demo:notes   # Regenerate demo journal notes
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

This app is designed as a local-first personal tool. If you run it locally, your
trade data and notes stay on your machine unless you choose to upload, host,
share, or commit them somewhere else.

## Demo Data

The main setup instructions above are the recommended demo path. A few details:

- The demo trade CSV is tracked at `samples/das-paper-trades-2026-demo.csv`.
- The generated SQLite file, `data/tradingjournaldemo.db`, is local and
  gitignored.
- The app imports trades from CSV. Demo journal notes are generated by
  `npm run demo:paper` / `npm run demo:notes` rather than imported through the
  UI.
- Demo notes include one daily recap per active trading day, plus trade notes
  for the best winner and worst loser when available.

If you want to rebuild only part of the demo:

```bash
npm run demo:paper-db -- --db data/tradingjournaldemo.db --csv samples/das-paper-trades-2026-demo.csv
npm run demo:notes -- --db data/tradingjournaldemo.db --month all
```

There is also an older fully synthetic generator:

```bash
npm run demo:db -- data/tradingjournaldemo.db
```

That path uses fake `SIMxx` symbols, synthetic trading activity, and synthetic
journal notes. The current hosted demo uses the paper-trading fixture because it
better fills out the real journal, calendar, reports, and trade-review flows.

Do not commit real broker exports or a personal `data/journal.db`.

## Hosting A Demo

The app can run locally from SQLite or in production against Turso/libSQL.
For a hosted demo:

```bash
# 1. Generate demo data
DB_PATH=data/tradingjournaldemo.db npm run db:migrate
npm run demo:paper

# Optional: hydrate chart candles before upload
npm run demo:candles -- --db data/tradingjournaldemo.db

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

The current importer supports:

- ThinkorSwim Account Statement CSVs, especially the `Account Trade History`
  section.
- DAS-style trade-summary CSVs with `Open Datetime`, `Close Datetime`,
  `Symbol`, `Side`, `Volume`, `Entry Price`, and `Exit Price` columns.

Known assumptions:

- `Exec Time` is interpreted as Pacific time and mapped to Eastern market time.
- `Net Price` is used for fill price.
- DAS `Open Datetime` and `Close Datetime` values are interpreted as Eastern
  market time.
- DAS trade-summary rows are already grouped trades, so the importer creates a
  synthetic open/close execution pair for each row.
- DAS trade-summary `Volume` is treated as round-trip volume. A closed
  500-share long trade exported as buy 500 / sell 500 is imported as a
  500-share trade, not 1,000 shares.
- Re-importing the same file is intended to be safe; duplicate executions are
  skipped.

Important import roadmap:

- Broker CSV exports are not standardized. Lightspeed, CenterPoint, Cobra,
  TradeZero, Ocean One, DAS Trader, and other brokers may all use different
  column names, timestamp formats, side labels, fee fields, and row structures.
- The long-term importer should use broker-specific adapters that normalize each
  CSV into a shared execution/fill shape before grouping fills into trades.
- A generic column-mapping import could help support unknown broker exports, but
  broker-specific sample files are still needed to test real-world edge cases.
- Real broker samples should be anonymized before sharing. Useful test files can
  replace account numbers, symbols, and personally identifying fields while
  preserving the original columns, row order, timestamps, quantities, prices,
  fees, and partial-fill behavior.

## Project Docs

- [DESIGN.md](docs/DESIGN.md) - product design, architecture, data model, and phases.
- [FEATURES.md](docs/FEATURES.md) - feature inventory and scope.
- [JOURNAL_DESIGN.md](docs/JOURNAL_DESIGN.md) - journal model, note hierarchy, and
  review philosophy.

## Roadmap

Near-term:

- Validate the public launch path for `trading-journal.ai`: hosted domain,
  canonical `www` redirect, clean first-run/onboarding flow, demo setup, import
  flow, empty states, and contributor testing docs.
- Harden import previews and error states.
- Design broker CSV adapter support and collect anonymized sample exports from
  Lightspeed, CenterPoint, Ocean One, DAS Trader, and other active trading
  platforms.
- Improve trade chart pan/zoom and volume context.
- Generalize journal notes beyond trade-level entries.
- Add backup/export guidance for SQLite data.

Later:

- Broker-specific CSV imports beyond ThinkorSwim and DAS.
- Generic CSV column mapping for unsupported brokers.
- Manual candle CSV fallback.
- Settings for timezone, fees, and defaults.
- Search across journal notes.
- Optional hosted/demo deployment.

## License

MIT License. See [LICENSE](LICENSE).

## Use & Responsibility

Use this project freely: download it, fork it, modify it, run it locally, or use
it as a starting point for your own trading journal.

This software is provided as-is. It is a journaling and review tool, not
financial advice, trade recommendations, risk management advice, tax advice, or
brokerage software. Verify your own data, protect your own broker exports, and
use it at your own risk.
