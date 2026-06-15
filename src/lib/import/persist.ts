/**
 * Persist a parsed TOS import: insert executions (dedupe by source hash),
 * match the newly-inserted ones into trades, and link them — all in one
 * transaction. Re-importing the same statement inserts 0 new rows (idempotent).
 */
import { inArray } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { etDateString } from "@/lib/time";
import { matchTrades } from "./match";
import { parseTosStatement } from "./tos";

export type ImportSummary = {
  batchId: number;
  parsed: number;
  inserted: number;
  duplicates: number;
  trades: number;
  parsedFrom: string | null;
  parsedTo: string | null;
  insertedFrom: string | null;
  insertedTo: string | null;
};

const INSERT_CHUNK_SIZE = 100;

function dateRange(executions: { executedAt: number }[]): { from: string | null; to: string | null } {
  if (executions.length === 0) return { from: null, to: null };
  const dates = executions.map((e) => etDateString(e.executedAt)).sort();
  return { from: dates[0], to: dates.at(-1) ?? dates[0] };
}

export function importTosCsv(csv: string, fileName: string, accountId: number): ImportSummary {
  const parsed = parseTosStatement(csv);
  if (parsed.length === 0) {
    throw new Error("No executions found in the Account Trade History section.");
  }
  const parsedRange = dateRange(parsed);

  return db.transaction((tx) => {
    const batch = tx
      .insert(schema.importBatches)
      .values({
        kind: "executions",
        accountId,
        source: "tos_csv",
        fileName,
        rowCount: 0,
      })
      .returning({ id: schema.importBatches.id })
      .get();

    // Insert executions in chunks so large backlog imports do not exceed
    // SQLite's bound-variable limit. Conflicting hashes are skipped.
    const insertedRows: { id: number; hash: string | null }[] = [];
    for (let i = 0; i < parsed.length; i += INSERT_CHUNK_SIZE) {
      const chunk = parsed.slice(i, i + INSERT_CHUNK_SIZE);
      const rows = tx
        .insert(schema.executions)
        .values(
          chunk.map((e) => ({
          symbol: e.symbol,
          accountId,
          side: e.side,
          quantity: e.quantity,
          price: e.price,
          executedAt: e.executedAt,
          fees: e.fees,
          posEffect: e.posEffect,
          importBatchId: batch.id,
          sourceRowHash: e.sourceRowHash,
          })),
        )
        .onConflictDoNothing()
        .returning({ id: schema.executions.id, hash: schema.executions.sourceRowHash })
        .all();
      insertedRows.push(...rows);
    }

    const idByHash = new Map(insertedRows.map((r) => [r.hash, r.id]));
    const newExecutions = parsed.filter((e) => idByHash.has(e.sourceRowHash));
    const insertedRange = dateRange(newExecutions);

    // Match only the newly-inserted fills into trades.
    const matched = matchTrades(newExecutions);
    for (const t of matched) {
      const trade = tx
        .insert(schema.trades)
        .values({
          symbol: t.symbol,
          accountId,
          side: t.side,
          quantity: t.quantity,
          avgEntryPrice: t.avgEntryPrice,
          entryAt: t.entryAt,
          avgExitPrice: t.avgExitPrice,
          exitAt: t.exitAt,
          fees: t.fees,
          status: t.status,
        })
        .returning({ id: schema.trades.id })
        .get();

      const execIds = t.executionHashes
        .map((h) => idByHash.get(h))
        .filter((id): id is number => id != null);
      if (execIds.length > 0) {
        tx
          .update(schema.executions)
          .set({ tradeId: trade.id })
          .where(inArray(schema.executions.id, execIds))
          .run();
      }
    }

    tx
      .update(schema.importBatches)
      .set({ rowCount: insertedRows.length })
      .where(inArray(schema.importBatches.id, [batch.id]))
      .run();

    return {
      batchId: batch.id,
      parsed: parsed.length,
      inserted: insertedRows.length,
      duplicates: parsed.length - insertedRows.length,
      trades: matched.length,
      parsedFrom: parsedRange.from,
      parsedTo: parsedRange.to,
      insertedFrom: insertedRange.from,
      insertedTo: insertedRange.to,
    };
  });
}
