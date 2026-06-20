# Trading Journal AI

[Trading Journal AI](https://trading-journal.ai) is a local-first trading
journal built around reflection, context, and review.

It treats trade review more like a chronological journal than a spreadsheet.
Your daily recap leads. Trades, P&L, charts, notes, tags, calendar context, and
reports sit beside the writing so the story of each trading day is easier to
review, document, and learn from later.

The project is early, but the direction is clear: make journaling low-friction,
private, and useful without depending on a hosted trading-journal subscription.

## Journal-First Review

Most trading journals start with tables. This one starts with the day.

Import your broker executions, open the journal, and write the daily recap while
the session is still fresh: market read, execution quality, emotions, mistakes,
and what is worth repeating. From there, the data stays close but does not take
over. The daily P&L chart and ticker list show what shaped the session. Ticker
review lets you inspect every trade for a symbol in context. Trade detail lets
you open the chart, executions, and trade note when a specific decision deserves
attention.

The goal is to reduce the distance between:

- What happened?
- What did I see?
- What did I do well?
- What needs work?
- What should I focus on next session?

The next product layer is the AI coach: a post-trade review assistant that can
read your notes, trades, chart context, tags, and playbook, then help summarize
what worked, what did not, what can improve, and what to focus on next.

## Try The Hosted Demo

The hosted demo is for clicking around with sample data:

[trading-journal.ai/demo](https://trading-journal.ai/demo)

The app itself is designed to run locally. Your real broker exports, journal
notes, API keys, and local database stay on your machine.

## Data Importer

Trading Journal reads broker CSV exports and turns fills into a shared execution
format the journal, charts, calendar, reports, and trade log can use.

### Your Own Data

The importer was originally built around ThinkorSwim/Schwab account statement
exports, especially the `Account Trade History` section. It also supports
DAS-style trade-summary CSVs.

If you use another broker, the CSV may not work immediately. Broker exports can
use different column names, timestamps, side labels, fee fields, and row
structures. The intended path is to add a broker-specific adapter that
normalizes that broker's CSV into the app's shared execution format.

For non-technical users: you do not have to redesign the app for each broker,
but you may need help teaching the importer how to read your broker's CSV.

### Demo Data

The repo includes a demo dataset with augmented sample trades and placeholder
journal notes:

```text
samples/demo-trades-and-notes.csv
```

The demo data is meant for previewing and testing the app. It is realistic
enough to exercise the journal, charts, calendar, reports, and trade-review
flows, but it is not intended to be a perfect trading record or a model trading
system.

To reset the local demo database:

```bash
npm run reset:local
```

Demo mode creates a local SQLite database, imports the sample CSV, and adds
placeholder journal notes: one daily recap per active trading day, plus trade
notes for the best winner and worst loser when available.

## Charts And Chart Data

Charts are rendered with
[TradingView Lightweight Charts](https://tradingview.github.io/lightweight-charts/),
the open-source charting library from TradingView. The app uses it to display
candles, volume, pan/zoom behavior, and trade markers.

The candle data comes from [Massive](https://www.massive.com/). The free Massive
plan is enough to run the app locally. When you open a trade chart, the app uses
the trade's symbol and date to fetch one-minute OHLCV candle data: open, high,
low, close, and volume. It then caches that data locally so the chart does not
need to refetch the same candles every time.

Your broker CSV provides the execution data: symbol, time, side, shares, and
price. The chart combines both sources: Massive provides the market candles, and
your broker import provides the entry and exit markers. This is why broker CSV
parsing matters. If a broker export has unusual timestamps, time zones, prices,
or row formats, the importer may need an adapter so trades map cleanly onto the
chart.

If you enter a Massive API key during setup, the installer saves it to
`.env.local`, which is gitignored and stays on your machine. If you skip the key,
the app still runs, but uncached charts will not be able to fetch new candles.

## Install

You can install the app in two ways:

- **Trading Journal Demo**: loads sample trades and notes so you can preview the
  app.
- **Trading Journal**: creates an empty local journal for your own broker CSV.

Requirements:

- Node.js 20+
- npm
- Optional: a free [Massive](https://www.massive.com/) API key for candlestick
  chart data

Clone the repo, enter the project folder, and run the installer:

```bash
git clone https://github.com/trading-journal-ai/trading-journal.git
cd trading-journal
./install-trading-journal.sh
```

Run the installer from inside the cloned `trading-journal` folder. If you see
`no such file or directory`, you are probably one folder too high. Run
`cd trading-journal` first, then run the installer again.

The installer:

- Installs project dependencies.
- Lets you choose demo data or an empty local journal.
- Lets you add a Massive API key or skip chart fetching for now.
- Creates the local SQLite database.
- Starts the app on localhost.

The script does not install anything globally. Everything it creates stays
inside this project folder.

## Run It Locally

After setup, the installer starts the app automatically.

To start it again later:

```bash
npm run --silent dev
```

Leave the terminal open while using the journal. To stop the app, click the
terminal and press **Ctrl + C**. On Mac, that is the Control key, not Command.

Stopping and restarting the app does not delete your data. Your journal lives in
a SQLite database file on disk.

If the browser does not open automatically, go to the localhost URL printed in
the terminal, usually [http://localhost:3000](http://localhost:3000).

## Data & Privacy

Local private data is gitignored:

- `data/journal.db`
- `data/journal.db-*`
- `data/uploads/`
- `data/samples/`
- `.env.local`

Real broker exports should not be committed. They can contain account numbers,
trade history, symbols, timestamps, and other private information.

## License

MIT License. See [LICENSE](LICENSE).

## Use & Responsibility

Use this project freely: download it, fork it, modify it, run it locally, or use
it as a starting point for your own trading journal.

This software is provided as-is. It is a journaling and review tool, not
financial advice, trade recommendations, risk management advice, tax advice, or
brokerage software. Verify your own data, protect your own broker exports, and
use it at your own risk.
