import { desc, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { grossPnl, netPnl } from "@/lib/pnl";

export const dynamic = "force-dynamic";

function csvValue(value: unknown): string {
  if (value == null) return "";
  const text = String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function isoDateTime(seconds: number | null): string {
  if (seconds == null) return "";
  return new Date(seconds * 1000).toISOString();
}

export async function GET() {
  const trades = await db.select().from(schema.trades).orderBy(desc(schema.trades.entryAt));
  const execCounts = await db
    .select({ tradeId: schema.executions.tradeId, n: sql<number>`count(*)` })
    .from(schema.executions)
    .groupBy(schema.executions.tradeId);
  const countByTrade = new Map(execCounts.map((row) => [row.tradeId, row.n]));

  const headers = [
    "trade_id",
    "symbol",
    "side",
    "quantity",
    "executions",
    "entry_at",
    "exit_at",
    "avg_entry_price",
    "avg_exit_price",
    "gross_pnl",
    "net_pnl",
    "pnl_per_share",
    "fees",
    "status",
    "setup",
  ];
  const rows = trades.map((trade) => {
    const gross = grossPnl(trade);
    const net = netPnl(trade);
    const perShare = gross == null || trade.quantity === 0 ? null : gross / Math.abs(trade.quantity);
    return [
      trade.id,
      trade.symbol,
      trade.side,
      trade.quantity,
      countByTrade.get(trade.id) ?? 0,
      isoDateTime(trade.entryAt),
      isoDateTime(trade.exitAt),
      trade.avgEntryPrice,
      trade.avgExitPrice,
      gross,
      net,
      perShare,
      trade.fees,
      trade.status,
      trade.setup,
    ];
  });
  const csv = [headers, ...rows].map((row) => row.map(csvValue).join(",")).join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="trades-export-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
