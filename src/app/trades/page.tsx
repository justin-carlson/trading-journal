import Link from "next/link";
import { and, desc, gte, lte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fmtDate, fmtMoney, fmtPrice } from "@/lib/format";
import { netPnl } from "@/lib/pnl";
import { etDateString, etDayRange } from "@/lib/time";
import { RowLink } from "./RowLink";

export const dynamic = "force-dynamic";

async function loadTrades(date?: string) {
  const where =
    date && /^\d{4}-\d{2}-\d{2}$/.test(date)
      ? (() => {
          const { start, end } = etDayRange(date);
          return and(gte(schema.trades.entryAt, start), lte(schema.trades.entryAt, end));
        })()
      : undefined;

  let rows = await db
    .select()
    .from(schema.trades)
    .where(where)
    .orderBy(desc(schema.trades.entryAt))
    .limit(500);

  // The epoch window has slack for DST; refine to the exact ET date.
  if (date) rows = rows.filter((t) => t.entryAt != null && etDateString(t.entryAt) === date);

  const execCounts = await db
    .select({ tradeId: schema.executions.tradeId, n: sql<number>`count(*)` })
    .from(schema.executions)
    .groupBy(schema.executions.tradeId);

  const countByTrade = new Map(execCounts.map((r) => [r.tradeId, r.n]));
  return rows.slice(0, 200).map((t) => ({ ...t, execs: countByTrade.get(t.id) ?? 0 }));
}

export default async function TradesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date } = await searchParams;
  const trades = await loadTrades(date);

  if (trades.length === 0) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-xl font-semibold tracking-tight">Trades</h1>
        <p className="text-sm text-[var(--muted)] mt-2">
          {date ? (
            <>
              No trades on {fmtDate(etDayRange(date).start)}.{" "}
              <Link href="/trades" className="text-[#58a6ff] hover:underline">
                Show all
              </Link>
            </>
          ) : (
            <>
              No trades yet.{" "}
              <Link href="/import" className="text-[#58a6ff] hover:underline">
                Import a ThinkorSwim statement
              </Link>{" "}
              to get started.
            </>
          )}
        </p>
      </div>
    );
  }

  const cols = ["Date", "Symbol", "Shares", "Execs", "Entry", "Exit", "P&L", "Status"];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight">Trades</h1>
          {date && (
            <span className="text-sm text-[var(--muted)]">
              {fmtDate(etDayRange(date).start)} ·{" "}
              <Link href="/trades" className="text-[#58a6ff] hover:underline">
                clear
              </Link>
            </span>
          )}
        </div>
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
              const net = netPnl(t);
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
