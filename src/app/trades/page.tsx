import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fmtDate, fmtMoney, fmtPrice } from "@/lib/format";
import { RowLink } from "./RowLink";

export const dynamic = "force-dynamic";

function grossPnl(t: {
  side: string;
  quantity: number;
  avgEntryPrice: number | null;
  avgExitPrice: number | null;
}): number | null {
  if (t.avgEntryPrice == null || t.avgExitPrice == null) return null;
  const dir = t.side === "long" ? 1 : -1;
  return (t.avgExitPrice - t.avgEntryPrice) * dir * t.quantity;
}

async function loadTrades() {
  const rows = await db
    .select()
    .from(schema.trades)
    .orderBy(desc(schema.trades.entryAt))
    .limit(200);

  const execCounts = await db
    .select({ tradeId: schema.executions.tradeId, n: sql<number>`count(*)` })
    .from(schema.executions)
    .groupBy(schema.executions.tradeId);

  const countByTrade = new Map(execCounts.map((r) => [r.tradeId, r.n]));
  return rows.map((t) => ({ ...t, execs: countByTrade.get(t.id) ?? 0 }));
}

export default async function TradesPage() {
  const trades = await loadTrades();

  if (trades.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-xl font-semibold tracking-tight">Trades</h1>
        <p className="text-sm text-[var(--muted)] mt-2">
          No trades yet.{" "}
          <Link href="/import" className="text-[#58a6ff] hover:underline">
            Import a ThinkorSwim statement
          </Link>{" "}
          to get started.
        </p>
      </div>
    );
  }

  const cols = ["Date", "Symbol", "Shares", "Execs", "Entry", "Exit", "P&L", "Status"];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">Trades</h1>
        <span className="text-xs text-[var(--muted)]">{trades.length} shown</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
              {cols.map((c) => (
                <th key={c} className="px-3 py-2 font-medium whitespace-nowrap">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {trades.map((t) => {
              const gross = grossPnl(t);
              const net = gross == null ? null : gross - t.fees;
              const pos = (net ?? 0) >= 0;
              return (
                <RowLink
                  key={t.id}
                  href={`/trades/${t.id}`}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)] cursor-pointer"
                >
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDate(t.entryAt)}</td>
                  <td className="px-3 py-2 font-medium">{t.symbol}</td>
                  <td className="px-3 py-2 tabular-nums">{t.quantity.toLocaleString()}</td>
                  <td className="px-3 py-2 tabular-nums">{t.execs}</td>
                  <td className="px-3 py-2 tabular-nums">{fmtPrice(t.avgEntryPrice)}</td>
                  <td className="px-3 py-2 tabular-nums">{fmtPrice(t.avgExitPrice)}</td>
                  <td
                    className="px-3 py-2 tabular-nums"
                    style={{ color: pos ? "var(--green)" : "var(--red)" }}
                  >
                    {net == null ? "—" : fmtMoney(net)}
                  </td>
                  <td className="px-3 py-2 text-[var(--muted)]">{t.status}</td>
                </RowLink>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
