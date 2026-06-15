import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getActiveAccount } from "@/lib/accountScope";
import { netPnl } from "@/lib/pnl";
import { etDateString } from "@/lib/time";
import { fmtDate, fmtMoney } from "@/lib/format";
import CumulativePnlChart, { type PnlPoint, type PnlSeries } from "@/components/CumulativePnlChart";
import { RowLink } from "./trades/RowLink";

export const dynamic = "force-dynamic";

const MONTHS_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const dayLabelFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "short",
});

function isoAddDays(date: string, n: number): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
function isoWeekday(date: string): number {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
function dayLabel(date: string): { wd: string; day: number } {
  const [y, m, d] = date.split("-").map(Number);
  return { wd: dayLabelFmt.format(new Date(Date.UTC(y, m - 1, d))), day: d };
}

export default async function Home() {
  // Server component renders per request, so reading the current time here is
  // intentional (not a memoized impure call).
  // eslint-disable-next-line react-hooks/purity
  const todayStr = etDateString(Math.floor(Date.now() / 1000));
  const thisMonth = todayStr.slice(0, 7);
  const activeAccount = await getActiveAccount();

  const trades = await db
    .select()
    .from(schema.trades)
    .where(eq(schema.trades.accountId, activeAccount.id))
    .orderBy(desc(schema.trades.entryAt));

  // current trading week (Mon-Fri) containing today
  const weekStart = isoAddDays(todayStr, -((isoWeekday(todayStr) + 6) % 7));
  const weekDates = Array.from({ length: 5 }, (_, i) => isoAddDays(weekStart, i));
  const weekDateSet = new Set(weekDates);

  // daily + monthly aggregation
  const byDate = new Map<string, { pnl: number; trades: number }>();
  const weekPnls: number[] = [];
  for (const t of trades) {
    const net = netPnl(t) ?? 0;
    if (t.entryAt == null) continue;
    const date = etDateString(t.entryAt);
    const cur = byDate.get(date) ?? { pnl: 0, trades: 0 };
    cur.pnl += net;
    cur.trades += 1;
    byDate.set(date, cur);
    if (t.status === "closed" && weekDateSet.has(date)) weekPnls.push(net);
  }

  // Build cumulative series with plain loops (avoids in-render closure mutation).
  function cumulativeSeries(dates: string[], label: (d: string, i: number) => string): PnlSeries {
    const points: PnlPoint[] = [];
    let cum = 0;
    let trades = 0;
    for (let i = 0; i < dates.length; i += 1) {
      const a = byDate.get(dates[i]);
      cum += a?.pnl ?? 0;
      trades += a?.trades ?? 0;
      points.push({ label: label(dates[i], i), value: cum });
    }
    return { points, trades };
  }

  const weekSeries = cumulativeSeries(weekDates, (d) => d.slice(5));
  const weekPnl = weekSeries.points.at(-1)?.value ?? 0;

  // current month — daily cumulative
  const [yr, moNum] = thisMonth.split("-").map(Number);
  const daysInMonth = new Date(Date.UTC(yr, moNum, 0)).getUTCDate();
  const monthDates = Array.from(
    { length: daysInMonth },
    (_, i) => `${thisMonth}-${String(i + 1).padStart(2, "0")}`,
  );
  const monthSeries = cumulativeSeries(monthDates, (_d, i) => String(i + 1));

  // current year — monthly cumulative (aggregate each month's daily totals)
  const monthlyTotals = new Array(12).fill(0);
  const monthlyTradeCounts = new Array(12).fill(0);
  for (const [date, a] of byDate) {
    if (!date.startsWith(`${yr}-`)) continue;
    const idx = Number(date.slice(5, 7)) - 1;
    monthlyTotals[idx] += a.pnl;
    monthlyTradeCounts[idx] += a.trades;
  }
  const yearPoints: PnlPoint[] = [];
  let yearCum = 0;
  for (let i = 0; i < 12; i += 1) {
    yearCum += monthlyTotals[i];
    yearPoints.push({ label: MONTHS_SHORT[i], value: yearCum });
  }
  const yearSeries: PnlSeries = {
    points: yearPoints,
    trades: monthlyTradeCounts.reduce((s: number, n: number) => s + n, 0),
  };

  const weeklyWins = weekPnls.filter((pnl) => pnl > 0);
  const weeklyLosses = weekPnls.filter((pnl) => pnl < 0);
  const weeklyCounted = weeklyWins.length + weeklyLosses.length;
  const weeklyWinRate = weeklyCounted > 0 ? Math.round((weeklyWins.length / weeklyCounted) * 100) : null;
  const grossWeeklyWins = weeklyWins.reduce((sum, pnl) => sum + pnl, 0);
  const grossWeeklyLosses = Math.abs(weeklyLosses.reduce((sum, pnl) => sum + pnl, 0));
  const weeklyProfitFactor = grossWeeklyLosses > 0 ? grossWeeklyWins / grossWeeklyLosses : null;
  const averageWeeklyWin = weeklyWins.length > 0 ? grossWeeklyWins / weeklyWins.length : null;
  const averageWeeklyLoss = weeklyLosses.length > 0 ? grossWeeklyLosses / weeklyLosses.length : null;
  const weeklyPayoffRatio = averageWeeklyWin != null && averageWeeklyLoss != null && averageWeeklyLoss > 0
    ? averageWeeklyWin / averageWeeklyLoss
    : null;
  const averageWeeklyTrade = weekPnls.length > 0
    ? weekPnls.reduce((sum, pnl) => sum + pnl, 0) / weekPnls.length
    : null;
  const recent = trades.slice(0, 8);

  const stats: { label: string; value: string; color?: string }[] = [
    { label: "Weekly P&L", value: fmtMoney(weekPnl), color: weekPnl >= 0 ? "var(--green)" : "var(--red)" },
    { label: "Win rate", value: weeklyWinRate == null ? "—" : `${weeklyWinRate}%` },
    { label: "Profit factor", value: weeklyProfitFactor == null ? "—" : weeklyProfitFactor.toFixed(2) },
    { label: "Payoff ratio", value: weeklyPayoffRatio == null ? "—" : weeklyPayoffRatio.toFixed(2) },
    {
      label: "Avg trade",
      value: averageWeeklyTrade == null ? "—" : fmtMoney(averageWeeklyTrade),
      color: averageWeeklyTrade == null ? undefined : averageWeeklyTrade >= 0 ? "var(--green)" : "var(--red)",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      {trades.length === 0 ? (
        <p className="text-sm text-[var(--muted)]">
          No trades yet — import a statement to get started.
        </p>
      ) : (
        <>
          <div className="space-y-6">
            <section className="space-y-2">
              <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Dashboard
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">This week</h2>
              <div className="grid grid-cols-5 border-y border-[var(--hairline)]">
                {weekDates.map((d) => {
                  const agg = byDate.get(d);
                  const { wd, day } = dayLabel(d);
                  const today = d === todayStr;
                  const pos = agg ? agg.pnl >= 0 : false;
                  const cell = (
                    <div
                      className="flex h-28 flex-col border-t-2 border-transparent px-0.5 py-4"
                      style={{
                        borderTopColor: today ? "#58a6ff" : "transparent",
                      }}
                    >
                      <span className="text-sm font-semibold text-[var(--muted)]">{wd} {day}</span>
                      {agg ? (
                        <span className="mt-auto">
                          <span className="block text-base font-semibold tabular-nums" style={{ color: pos ? "var(--green)" : "var(--red)" }}>
                            {fmtMoney(agg.pnl)}
                          </span>
                          <span className="block text-sm font-semibold text-[var(--muted)]">{agg.trades} {agg.trades === 1 ? "trade" : "trades"}</span>
                        </span>
                      ) : (
                        <span className="mt-auto text-base font-semibold text-[var(--muted)]">—</span>
                      )}
                    </div>
                  );
                  return agg ? (
                    <Link key={d} href={`/trades?date=${d}`} className="block">{cell}</Link>
                  ) : (
                    <div key={d}>{cell}</div>
                  );
                })}
              </div>
            </section>

            <section className="grid grid-cols-5 gap-6 pb-6">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="space-y-2"
                >
                  <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">{s.label}</div>
                  <div
                    className="font-mono text-lg tabular-nums"
                    style={s.color ? { color: s.color } : undefined}
                  >
                    {s.value}
                  </div>
                </div>
              ))}
            </section>
          </div>

          <CumulativePnlChart week={weekSeries} month={monthSeries} year={yearSeries} />

          <section className="space-y-2">
            <div className="flex items-baseline justify-between">
              <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide">Recent trades</h2>
              <Link href="/trades" className="text-xs text-[#58a6ff] hover:underline">All trades →</Link>
            </div>
            <div className="overflow-x-auto border-y border-[var(--hairline)]">
              <table className="w-full text-sm">
                <tbody>
                  {recent.map((t) => {
                    const net = netPnl(t);
                    const pos = (net ?? 0) >= 0;
                    return (
                      <RowLink
                        key={t.id}
                        href={`/trades/${t.id}`}
                        className="border-b border-[var(--hairline)] last:border-0 hover:bg-[var(--surface)] cursor-pointer"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-[var(--muted)]">{fmtDate(t.entryAt)}</td>
                        <td className="px-3 py-2 font-medium">{t.symbol}</td>
                        <td className="px-3 py-2 tabular-nums">{t.quantity.toLocaleString()}</td>
                        <td className="px-3 py-2 tabular-nums text-right" style={{ color: pos ? "var(--green)" : "var(--red)" }}>
                          {net == null ? "—" : fmtMoney(net)}
                        </td>
                      </RowLink>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
