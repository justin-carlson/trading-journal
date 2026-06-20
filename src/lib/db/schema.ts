/**
 * Drizzle schema for the trading journal (SQLite).
 *
 * Source of truth = `executions` (raw fills). A `trade` is a derived round-trip
 * grouping of executions (see docs/product/PRODUCT_SPEC.md §5). Market timestamps (`executedAt`,
 * `entryAt`, `exitAt`, candle `t`) are stored as **epoch seconds** to align with
 * the chart prototype; `createdAt`/`updatedAt` use Drizzle timestamp mode.
 */
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

/** Audit trail for each CSV/API import. */
export const accounts = sqliteTable("accounts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const importBatches = sqliteTable(
  "import_batches",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountId: integer("account_id").references(() => accounts.id),
    kind: text("kind", { enum: ["executions", "candles"] }).notNull(),
    // tos_csv | das_csv | manual | massive | alpha_vantage | tradingview_csv | tos_chart_csv
    source: text("source").notNull(),
    fileName: text("file_name"),
    rowCount: integer("row_count").notNull().default(0),
    importedAt: integer("imported_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [index("import_batches_account_imported_idx").on(t.accountId, t.importedAt)],
);

/** A derived round-trip position (one or more executions). */
export const trades = sqliteTable(
  "trades",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountId: integer("account_id").references(() => accounts.id),
    symbol: text("symbol").notNull(),
    side: text("side", { enum: ["long", "short"] }).notNull(),
    quantity: integer("quantity").notNull(),
    avgEntryPrice: real("avg_entry_price"),
    entryAt: integer("entry_at"), // epoch seconds, first opening fill
    avgExitPrice: real("avg_exit_price"),
    exitAt: integer("exit_at"), // epoch seconds, last closing fill (null while open)
    fees: real("fees").notNull().default(0),
    stopLoss: real("stop_loss"),
    target: real("target"),
    setup: text("setup"),
    status: text("status", { enum: ["open", "closed"] })
      .notNull()
      .default("open"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("trades_account_entry_idx").on(t.accountId, t.entryAt),
    index("trades_account_symbol_entry_idx").on(t.accountId, t.symbol, t.entryAt),
  ],
);

/** One immutable broker fill. */
export const executions = sqliteTable(
  "executions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    symbol: text("symbol").notNull(),
    side: text("side", { enum: ["buy", "sell"] }).notNull(),
    quantity: integer("quantity").notNull(),
    price: real("price").notNull(),
    executedAt: integer("executed_at").notNull(), // epoch seconds (UTC)
    fees: real("fees").notNull().default(0),
    route: text("route"),
    posEffect: text("pos_effect"), // TO OPEN | TO CLOSE (from TOS) — drives matching
    tradeId: integer("trade_id").references(() => trades.id),
    accountId: integer("account_id").references(() => accounts.id),
    importBatchId: integer("import_batch_id").references(() => importBatches.id),
    sourceRowHash: text("source_row_hash"),
  },
  (t) => [
    uniqueIndex("executions_source_row_hash_account_unq").on(t.sourceRowHash, t.accountId),
    index("executions_trade_executed_idx").on(t.tradeId, t.executedAt),
    index("executions_account_executed_idx").on(t.accountId, t.executedAt),
  ],
);

/** Cached OHLCV candles (fetched once on import). */
export const candles = sqliteTable(
  "candles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    symbol: text("symbol").notNull(),
    timeframe: text("timeframe").notNull().default("1m"),
    t: integer("t").notNull(), // bar start, epoch seconds
    o: real("o").notNull(),
    h: real("h").notNull(),
    l: real("l").notNull(),
    c: real("c").notNull(),
    vol: real("vol").notNull().default(0),
  },
  (tbl) => [
    uniqueIndex("candles_symbol_tf_t_unq").on(tbl.symbol, tbl.timeframe, tbl.t),
  ],
);

/** Reusable free-form tags. */
export const tags = sqliteTable("tags", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
});

/** Trade <-> Tag join. */
export const tradeTags = sqliteTable(
  "trade_tags",
  {
    tradeId: integer("trade_id")
      .notNull()
      .references(() => trades.id),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id),
  },
  (t) => [primaryKey({ columns: [t.tradeId, t.tagId] })],
);

/**
 * Reflective journal note. Scoped: a `trade` note attaches to a trade; `day` /
 * `week` / `month` notes stand alone (tradeId null) keyed by `scopeKey`
 * (YYYY-MM-DD, week-start date, or YYYY-MM). See docs/design/JOURNAL_DESIGN.md §2/§9.
 */
export const journalEntries = sqliteTable(
  "journal_entries",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    accountId: integer("account_id").references(() => accounts.id),
    tradeId: integer("trade_id").references(() => trades.id),
    scope: text("scope", { enum: ["trade", "day", "week", "month"] })
      .notNull()
      .default("trade"),
    scopeKey: text("scope_key"),
    thesis: text("thesis"),
    whatWentWell: text("what_went_well"),
    whatWentWrong: text("what_went_wrong"),
    lessons: text("lessons"),
    followedPlan: integer("followed_plan", { mode: "boolean" }),
    emotionalState: text("emotional_state"),
    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (t) => [
    index("journal_entries_account_scope_key_idx").on(t.accountId, t.scope, t.scopeKey),
    index("journal_entries_trade_idx").on(t.tradeId),
  ],
);

/** Screenshot / image attached to a trade. */
export const attachments = sqliteTable(
  "attachments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    tradeId: integer("trade_id")
      .notNull()
      .references(() => trades.id),
    filePath: text("file_path").notNull(),
    caption: text("caption"),
  },
  (t) => [index("attachments_trade_idx").on(t.tradeId)],
);
