import { mkdirSync, unlinkSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";

const outputPath = resolve(process.argv[2] ?? "data/tradingjournaldemo.db");

const symbols = [
  "ADIL",
  "CCTG",
  "DSY",
  "EDHL",
  "FJET",
  "GELS",
  "GLXG",
  "HKIT",
  "INHD",
  "JZXN",
  "LASE",
  "NPT",
  "NVDL",
  "PPCB",
  "RUBI",
  "XOS",
  "ZJYL",
];

const tagNames = [
  "Opening drive",
  "First pullback",
  "Green-to-red reclaim",
  "VWAP reclaim",
  "Halt runner",
  "Small cap momentum",
  "A+ setup",
  "Needs review",
];

const tradeNoteTemplates = [
  {
    label: "Good trade",
    tags: ["Followed plan", "Patient", "Let winner work", "Calm"],
    text: "Waited for confirmation instead of chasing the first spike. Entry was clean, risk was defined, and partials came into strength.",
  },
  {
    label: "Best setup",
    tags: ["Followed plan", "Focused", "Sized correctly", "Confident"],
    text: "Textbook setup with volume, structure, and a clean reclaim. This is the version of the trade to repeat.",
  },
  {
    label: "Needs review",
    tags: ["Focused", "Took profits early"],
    text: "The idea was valid, but I exited before the move had time to develop. Review whether the stop placement gave the trade enough room.",
  },
  {
    label: "Rule break",
    tags: ["Oversized", "Moved stop", "Frustrated"],
    text: "Position size got ahead of the setup and the stop moved after entry. This is exactly the type of trade the journal should catch.",
  },
  {
    label: "Revenge trade",
    tags: ["Added to loser", "Forced trade", "Tilted"],
    text: "Took the next entry to make back the prior loss instead of waiting for a fresh setup. The loss was avoidable.",
  },
];

const dayNotes = [
  "Clean open. Waited for the first pullback instead of chasing the spike, took profits into strength, and kept the afternoon quiet.",
  "Choppy session. Good reads early, but the middle of the day created a few unnecessary trades. Need to stay patient after the first two setups.",
  "Green day with better discipline. Small winners added up because the losses were contained and entries were closer to support.",
  "Red day. One oversized name erased a lot of good work. Keep red days small and stop after the second avoidable mistake.",
  "Focused session. The best trades came from waiting for volume and trend alignment instead of forcing continuation.",
];

const monthNotes = {
  "2026-02": "February was a baseline month for the demo account: selective entries, small size, and a focus on learning the workflow.",
  "2026-03": "March introduced more active momentum names. The big lesson was to separate valid continuation from late chasing.",
  "2026-04": "April improved consistency. Smaller losses and cleaner notes made the review process more useful.",
  "2026-05": "May was uneven. Accuracy stayed acceptable, but a handful of large losers overwhelmed the smaller wins.",
  "2026-06": "June recap test: solid week 1, kept red days small. Focus next: avoid overtrading the afternoon chop.",
};

const namedDayPlans = {
  "2026-06-01": [
    ["JZXN", 0.02, "Good trade"],
    ["NVDL", 12.98, "Good trade"],
    ["ZJYL", 6.97, "Needs review"],
    ["FJET", 2.46, "Good trade"],
    ["ABTS", 0.95, "Needs review"],
    ["DBGI", 0.26, "Good trade"],
    ["CTNT", 0.22, "Good trade"],
    ["CXDO", 0.18, "Needs review"],
  ],
  "2026-06-02": [
    ["XOS", 40.72, "Best setup"],
    ["NVDL", 11.31, "Good trade"],
    ["GXAI", 7.75, "Good trade"],
    ["ASTC", 6.49, "Good trade"],
    ["YMAT", 4.35, "Good trade"],
    ["RKTO", -0.02, "Needs review"],
    ["LASE", -0.28, "Needs review"],
  ],
  "2026-06-04": [
    ["STI", 58.91, "Best setup"],
    ["VERU", 33.35, "Good trade"],
    ["LASE", 17.29, "Good trade"],
    ["QNT", 10.54, "Good trade"],
    ["BGMS", 5.67, "Good trade"],
    ["FOXX", 5.51, "Good trade"],
    ["INIO", 1.79, "Good trade"],
    ["PPCB", -98.46, "Rule break"],
    ["GLXG", -76.21, "Revenge trade"],
  ],
  "2026-06-08": [
    ["NPT", 15.44, "Best setup"],
    ["INHD", 14.71, "Good trade"],
    ["SUNE", 8.36, "Good trade"],
    ["BYAH", 2.91, "Needs review"],
    ["PN", 0.9, "Good trade"],
  ],
  "2026-06-09": [
    ["PAVS", 23.84, "Good trade"],
    ["XELB", 15.54, "Good trade"],
    ["AZI", 11.9, "Good trade"],
    ["EPSM", -1.75, "Needs review"],
    ["QTEX", -10.42, "Chased"],
    ["UK", -12.47, "Chased"],
    ["AHMA", -29.98, "Rule break"],
    ["CCTG", -117.6, "Revenge trade"],
  ],
  "2026-06-10": [
    ["DSY", 15.04, "Good trade"],
    ["BATL", 3.88, "Good trade"],
    ["VSME", 1.85, "Good trade"],
    ["FLD", 1.33, "Good trade"],
    ["CHOW", 0.11, "Needs review"],
  ],
  "2026-06-11": [
    ["ADIL", 14.65, "Good trade"],
    ["LASE", -0.3, "Needs review"],
    ["GELS", -1.02, "Needs review"],
    ["EDHL", -52.65, "Rule break"],
    ["PPCB", -157.77, "Rule break"],
    ["GLXG", -287.26, "Rule break"],
  ],
  "2026-06-12": [
    ["TXMD", 21.3, "Good trade"],
    ["RILY", 18.44, "Good trade"],
    ["BBAI", 12.06, "Good trade"],
    ["NUZE", 6.3, "Good trade"],
  ],
};

function seededRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

const random = seededRandom(20260614);

function rand(min, max) {
  return min + (max - min) * random();
}

function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

function pick(items) {
  return items[randInt(0, items.length - 1)];
}

function easternOffsetHours(date) {
  return date < "2026-03-08" ? 5 : 4;
}

function easternEpoch(date, hour, minute, second = 0) {
  const [year, month, day] = date.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day, hour + easternOffsetHours(date), minute, second) / 1000);
}

function isoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function addDays(date, days) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function weekday(date) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function weekStart(date) {
  return addDays(date, -((weekday(date) + 6) % 7));
}

function tradingDaysForMonth(year, month, limitDay = 31) {
  const dates = [];
  const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
  for (let day = 1; day <= Math.min(last, limitDay); day += 1) {
    const date = isoDate(year, month, day);
    const dow = weekday(date);
    if (dow >= 1 && dow <= 5) dates.push(date);
  }
  return dates;
}

function setupSchema(db) {
  db.exec(`
    PRAGMA foreign_keys=OFF;
    CREATE TABLE "__drizzle_migrations" (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      hash TEXT NOT NULL,
      created_at NUMERIC
    );
    CREATE TABLE "attachments" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "trade_id" integer NOT NULL,
      "file_path" text NOT NULL,
      "caption" text,
      FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON UPDATE no action ON DELETE no action
    );
    CREATE TABLE "candles" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "symbol" text NOT NULL,
      "timeframe" text DEFAULT '1m' NOT NULL,
      "t" integer NOT NULL,
      "o" real NOT NULL,
      "h" real NOT NULL,
      "l" real NOT NULL,
      "c" real NOT NULL,
      "vol" real DEFAULT 0 NOT NULL
    );
    CREATE UNIQUE INDEX "candles_symbol_tf_t_unq" ON "candles" ("symbol","timeframe","t");
    CREATE TABLE "executions" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "symbol" text NOT NULL,
      "side" text NOT NULL,
      "quantity" integer NOT NULL,
      "price" real NOT NULL,
      "executed_at" integer NOT NULL,
      "fees" real DEFAULT 0 NOT NULL,
      "route" text,
      "pos_effect" text,
      "trade_id" integer,
      "import_batch_id" integer,
      "source_row_hash" text,
      FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON UPDATE no action ON DELETE no action,
      FOREIGN KEY ("import_batch_id") REFERENCES "import_batches"("id") ON UPDATE no action ON DELETE no action
    );
    CREATE UNIQUE INDEX "executions_source_row_hash_unq" ON "executions" ("source_row_hash");
    CREATE TABLE "import_batches" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "kind" text NOT NULL,
      "source" text NOT NULL,
      "file_name" text,
      "row_count" integer DEFAULT 0 NOT NULL,
      "imported_at" integer DEFAULT (unixepoch()) NOT NULL
    );
    CREATE TABLE "journal_entries" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "trade_id" integer,
      "scope" text DEFAULT 'trade' NOT NULL,
      "scope_key" text,
      "thesis" text,
      "what_went_well" text,
      "what_went_wrong" text,
      "lessons" text,
      "followed_plan" integer,
      "emotional_state" text,
      "created_at" integer DEFAULT (unixepoch()) NOT NULL,
      FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON UPDATE no action ON DELETE no action
    );
    CREATE TABLE "tags" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "name" text NOT NULL
    );
    CREATE UNIQUE INDEX "tags_name_unique" ON "tags" ("name");
    CREATE TABLE "trade_tags" (
      "trade_id" integer NOT NULL,
      "tag_id" integer NOT NULL,
      PRIMARY KEY("trade_id", "tag_id"),
      FOREIGN KEY ("trade_id") REFERENCES "trades"("id") ON UPDATE no action ON DELETE no action,
      FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON UPDATE no action ON DELETE no action
    );
    CREATE TABLE "trades" (
      "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL,
      "symbol" text NOT NULL,
      "side" text NOT NULL,
      "quantity" integer NOT NULL,
      "avg_entry_price" real,
      "entry_at" integer,
      "avg_exit_price" real,
      "exit_at" integer,
      "fees" real DEFAULT 0 NOT NULL,
      "stop_loss" real,
      "target" real,
      "setup" text,
      "status" text DEFAULT 'open' NOT NULL,
      "created_at" integer DEFAULT (unixepoch()) NOT NULL,
      "updated_at" integer DEFAULT (unixepoch()) NOT NULL
    );
    PRAGMA foreign_keys=ON;
  `);
}

function buildInsertStatements(db) {
  return {
    batch: db.prepare("INSERT INTO import_batches (kind, source, file_name, row_count, imported_at) VALUES (?, ?, ?, ?, ?)"),
    tag: db.prepare("INSERT INTO tags (name) VALUES (?)"),
    tradeTag: db.prepare("INSERT OR IGNORE INTO trade_tags (trade_id, tag_id) VALUES (?, ?)"),
    trade: db.prepare(`
      INSERT INTO trades (
        symbol, side, quantity, avg_entry_price, entry_at, avg_exit_price, exit_at, fees,
        stop_loss, target, setup, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    execution: db.prepare(`
      INSERT INTO executions (
        symbol, side, quantity, price, executed_at, fees, route, pos_effect, trade_id, import_batch_id, source_row_hash
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
    candle: db.prepare(`
      INSERT OR IGNORE INTO candles (symbol, timeframe, t, o, h, l, c, vol)
      VALUES (?, '1m', ?, ?, ?, ?, ?, ?)
    `),
    journal: db.prepare(`
      INSERT INTO journal_entries (
        trade_id, scope, scope_key, thesis, what_went_well, what_went_wrong, lessons, followed_plan, emotional_state, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `),
  };
}

function createCandles(stmts, symbol, date, tradePlans) {
  let price = rand(1.4, 9.5);
  const impulses = tradePlans.map((plan) => ({
    center: Math.max(20, Math.min(360, plan.minute)),
    strength: plan.pnl >= 0 ? rand(0.03, 0.09) : -rand(0.03, 0.09),
  }));

  for (let minute = 0; minute <= 390; minute += 1) {
    const t = easternEpoch(date, 9, 30 + minute);
    const open = price;
    let drift = rand(-0.018, 0.018);
    for (const impulse of impulses) {
      const distance = Math.abs(minute - impulse.center);
      if (distance < 12) {
        drift += impulse.strength * (1 - distance / 12);
      }
    }
    const close = Math.max(0.2, open + drift);
    const high = Math.max(open, close) + rand(0.005, 0.06);
    const low = Math.max(0.1, Math.min(open, close) - rand(0.005, 0.06));
    const nearTrade = impulses.some((impulse) => Math.abs(minute - impulse.center) < 10);
    const volume = Math.round(rand(900, 6000) * (nearTrade ? rand(4, 16) : 1));
    stmts.candle.run(symbol, t, round(open), round(high), round(low), round(close), volume);
    price = close;
  }
}

function round(value, decimals = 4) {
  return Number(value.toFixed(decimals));
}

function createTrade(stmts, batchId, tagIds, date, plan, sequence) {
  const [symbol, targetPnl, label] = plan;
  const minute = randInt(18, 340);
  const entryAt = easternEpoch(date, 9, 30 + minute, randInt(0, 40));
  const holdSeconds = randInt(25, 24 * 60);
  const exitAt = entryAt + holdSeconds;
  const quantity = targetPnl > 20 ? pick([200, 300, 500, 800, 1000]) : pick([10, 50, 100, 200, 300]);
  const side = random() > 0.18 ? "long" : "short";
  const entry = round(rand(1.3, 12), 4);
  const perShareMove = targetPnl / quantity;
  const exit = side === "long" ? round(entry + perShareMove, 4) : round(entry - perShareMove, 4);
  const createdAt = entryAt - randInt(60, 240);
  const tradeInfo = stmts.trade.run(
    symbol,
    side,
    quantity,
    entry,
    entryAt,
    exit,
    exitAt,
    0,
    round(entry - Math.abs(perShareMove) * 1.7, 4),
    round(entry + Math.abs(perShareMove) * 2.4, 4),
    pick(tagNames),
    "closed",
    createdAt,
    exitAt,
  );
  const tradeId = Number(tradeInfo.lastInsertRowid);
  const openingSide = side === "long" ? "buy" : "sell";
  const closingSide = side === "long" ? "sell" : "buy";
  const entryPartials = random() > 0.7 ? [Math.floor(quantity / 2), quantity - Math.floor(quantity / 2)] : [quantity];
  const exitPartials = random() > 0.45 ? [Math.floor(quantity / 2), quantity - Math.floor(quantity / 2)] : [quantity];

  entryPartials.forEach((qty, index) => {
    stmts.execution.run(
      symbol,
      openingSide,
      qty,
      round(entry + rand(-0.006, 0.006), 4),
      entryAt + index * 5,
      0,
      "DEMO",
      "TO OPEN",
      tradeId,
      batchId,
      `demo|${date}|${symbol}|${sequence}|open|${index}`,
    );
  });

  exitPartials.forEach((qty, index) => {
    stmts.execution.run(
      symbol,
      closingSide,
      qty,
      round(exit + rand(-0.006, 0.006), 4),
      exitAt + index * 6,
      0,
      "DEMO",
      "TO CLOSE",
      tradeId,
      batchId,
      `demo|${date}|${symbol}|${sequence}|close|${index}`,
    );
  });

  const tagId = tagIds.get(pick(tagNames));
  if (tagId) stmts.tradeTag.run(tradeId, tagId);

  if (random() > 0.58 || Object.hasOwn(namedDayPlans, date)) {
    const template = tradeNoteTemplates.find((item) => item.label === label) ?? pick(tradeNoteTemplates);
    stmts.journal.run(
      tradeId,
      "trade",
      date,
      template.text,
      JSON.stringify(template.tags),
      null,
      "Use this note to connect the chart, the execution, and the daily journal review.",
      template.label === "Good trade" || template.label === "Best setup" ? 1 : 0,
      template.label,
      exitAt + 60,
    );
  }

  return { symbol, minute, pnl: targetPnl };
}

function buildPlansForDate(date) {
  if (namedDayPlans[date]) return namedDayPlans[date];
  const count = randInt(5, 12);
  const used = new Set();
  const plans = [];
  for (let index = 0; index < count; index += 1) {
    let symbol = pick(symbols);
    while (used.has(symbol)) symbol = pick(symbols);
    used.add(symbol);
    const positive = random() > 0.42;
    const pnl = positive ? round(rand(1.2, 72), 2) : round(-rand(0.8, 135), 2);
    const label = positive ? (random() > 0.7 ? "Good trade" : "Needs review") : pick(["Needs review", "Rule break", "Chased"]);
    plans.push([symbol, pnl, label]);
  }
  return plans;
}

function seed(db) {
  const stmts = buildInsertStatements(db);
  const batch = stmts.batch.run("executions", "demo_seed", "tradingjournaldemo.seed", 0, easternEpoch("2026-06-14", 18, 0));
  const batchId = Number(batch.lastInsertRowid);
  const tagIds = new Map();

  for (const name of tagNames) {
    const info = stmts.tag.run(name);
    tagIds.set(name, Number(info.lastInsertRowid));
  }

  const dates = [
    ...tradingDaysForMonth(2026, 2).filter((date) => Number(date.slice(-2)) >= 9),
    ...tradingDaysForMonth(2026, 3),
    ...tradingDaysForMonth(2026, 4),
    ...tradingDaysForMonth(2026, 5),
    ...tradingDaysForMonth(2026, 6, 12),
  ];

  let sequence = 1;
  const candlePlans = new Map();
  const tradeCountByDate = new Map();

  for (const date of dates) {
    const plans = buildPlansForDate(date);
    tradeCountByDate.set(date, plans.length);
    for (const plan of plans) {
      const tradePlan = createTrade(stmts, batchId, tagIds, date, plan, sequence);
      const key = `${date}|${tradePlan.symbol}`;
      const list = candlePlans.get(key) ?? [];
      list.push(tradePlan);
      candlePlans.set(key, list);
      sequence += 1;
    }
  }

  for (const [key, plans] of candlePlans.entries()) {
    const [date, symbol] = key.split("|");
    createCandles(stmts, symbol, date, plans);
  }

  for (const [month, text] of Object.entries(monthNotes)) {
    stmts.journal.run(
      null,
      "month",
      month,
      text,
      null,
      null,
      "Review the month by asking whether the biggest losses were controlled and whether the best setups were repeated.",
      1,
      null,
      easternEpoch(`${month}-01`, 16, 30),
    );
  }

  const seenWeeks = new Set();
  for (const date of dates) {
    if (random() > 0.55 || date.startsWith("2026-06")) {
      stmts.journal.run(
        null,
        "day",
        date,
        pick(dayNotes),
        null,
        null,
        "Daily review: market read, execution quality, emotional state, and what to carry into the next session.",
        random() > 0.35 ? 1 : 0,
        null,
        easternEpoch(date, 16, 10),
      );
    }

    const start = weekStart(date);
    if (!seenWeeks.has(start)) {
      seenWeeks.add(start);
      stmts.journal.run(
        null,
        "week",
        start,
        "Weekly recap: keep red days small, repeat the cleanest setups, and avoid adding size when the market gets choppy.",
        null,
        null,
        "Zoom out from one red day and evaluate the week as a unit.",
        1,
        null,
        easternEpoch(date, 16, 20),
      );
    }
  }

  stmts.batch.run("candles", "demo_seed", "tradingjournaldemo.seed", candlePlans.size, easternEpoch("2026-06-14", 18, 1));
}

mkdirSync(dirname(outputPath), { recursive: true });
for (const suffix of ["", "-wal", "-shm"]) {
  try {
    unlinkSync(`${outputPath}${suffix}`);
  } catch {
    // The file may not exist yet.
  }
}

const db = new Database(outputPath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");
setupSchema(db);
db.transaction(() => seed(db))();
db.pragma("optimize");
db.pragma("wal_checkpoint(TRUNCATE)");

const counts = db
  .prepare(`
    SELECT
      (SELECT count(*) FROM trades) AS trades,
      (SELECT count(*) FROM executions) AS executions,
      (SELECT count(*) FROM candles) AS candles,
      (SELECT count(*) FROM journal_entries) AS notes
  `)
  .get();
db.close();

console.log(`Created ${outputPath}`);
console.log(`Trades: ${counts.trades}`);
console.log(`Executions: ${counts.executions}`);
console.log(`Candles: ${counts.candles}`);
console.log(`Journal entries: ${counts.notes}`);
