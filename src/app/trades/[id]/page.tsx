import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCandles } from "@/lib/candles";
import TradeChart from "@/components/TradeChart";
import { fmtDate, fmtMoney, fmtPrice } from "@/lib/format";

export const dynamic = "force-dynamic";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const fmtTime = (t: number) => timeFmt.format(new Date(t * 1000));

function holdingPeriod(from: number, to: number): string {
  const s = Math.max(0, to - from);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tradeId = Number(id);
  if (!Number.isInteger(tradeId)) notFound();

  const trade = (
    await db.select().from(schema.trades).where(eq(schema.trades.id, tradeId)).limit(1)
  )[0];
  if (!trade) notFound();

  const execs = await db
    .select()
    .from(schema.executions)
    .where(eq(schema.executions.tradeId, tradeId))
    .orderBy(asc(schema.executions.executedAt));

  const lastAt = trade.exitAt ?? execs.at(-1)?.executedAt ?? trade.entryAt ?? 0;
  const firstAt = trade.entryAt ?? execs[0]?.executedAt ?? lastAt;
  const pad = 20 * 60; // 20 minutes either side
  const { candles, error } = await getCandles(trade.symbol, firstAt - pad, lastAt + pad);

  const dir = trade.side === "long" ? 1 : -1;
  const gross =
    trade.avgEntryPrice != null && trade.avgExitPrice != null
      ? (trade.avgExitPrice - trade.avgEntryPrice) * dir * trade.quantity
      : null;
  const net = gross == null ? null : gross - trade.fees;

  const stats: [string, string][] = [
    ["Side", trade.side],
    ["Shares", trade.quantity.toLocaleString()],
    ["Avg entry", fmtPrice(trade.avgEntryPrice)],
    ["Avg exit", fmtPrice(trade.avgExitPrice)],
    ["P&L", net == null ? "—" : fmtMoney(net)],
    ["Fees", fmtMoney(trade.fees)],
    ["Held", trade.exitAt ? holdingPeriod(firstAt, trade.exitAt) : "open"],
    ["Fills", String(execs.length)],
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/trades" className="text-sm text-[#58a6ff] hover:underline">
          ← Trades
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">
          {trade.symbol}
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            {fmtDate(trade.entryAt)}
          </span>
        </h1>
      </div>

      <section className="grid grid-cols-4 gap-3">
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2"
          >
            <div
              className="text-sm font-semibold tabular-nums"
              style={
                label === "P&L" && net != null
                  ? { color: net >= 0 ? "var(--green)" : "var(--red)" }
                  : undefined
              }
            >
              {value}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-[var(--muted)]">
              {label}
            </div>
          </div>
        ))}
      </section>

      {error ? (
        <div className="rounded-lg border border-[var(--red)]/40 bg-[var(--red)]/10 px-4 py-3 text-sm text-[var(--red)]">
          Couldn&apos;t load candles: {error}
        </div>
      ) : (
        <TradeChart
          candles={candles}
          markers={execs.map((e) => ({
            t: e.executedAt,
            price: e.price,
            side: e.side as "buy" | "sell",
          }))}
        />
      )}

      <section>
        <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
          Executions
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                {["Time (ET)", "Side", "Shares", "Price", "Effect"].map((c) => (
                  <th key={c} className="px-3 py-2 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {execs.map((e) => (
                <tr key={e.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-1.5 tabular-nums">{fmtTime(e.executedAt)}</td>
                  <td
                    className="px-3 py-1.5"
                    style={{ color: e.side === "buy" ? "var(--green)" : "var(--red)" }}
                  >
                    {e.side.toUpperCase()}
                  </td>
                  <td className="px-3 py-1.5 tabular-nums">{e.quantity.toLocaleString()}</td>
                  <td className="px-3 py-1.5 tabular-nums">{fmtPrice(e.price)}</td>
                  <td className="px-3 py-1.5 text-[var(--muted)]">{e.posEffect ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
