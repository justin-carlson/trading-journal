import Link from "next/link";
import { db, schema } from "@/lib/db";
import { netPnl } from "@/lib/pnl";
import { etDateString } from "@/lib/time";
import { fmtMoney } from "@/lib/format";

export const dynamic = "force-dynamic";

type DayAgg = { pnl: number; trades: number };

const monthFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shiftMonth(ym: string, delta: number): string {
  let [y, m] = ym.split("-").map(Number);
  m += delta;
  while (m < 1) { m += 12; y -= 1; }
  while (m > 12) { m -= 12; y += 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

async function dailyAgg(): Promise<{ byDate: Map<string, DayAgg>; months: Set<string> }> {
  const trades = await db
    .select({
      side: schema.trades.side,
      quantity: schema.trades.quantity,
      avgEntryPrice: schema.trades.avgEntryPrice,
      avgExitPrice: schema.trades.avgExitPrice,
      fees: schema.trades.fees,
      entryAt: schema.trades.entryAt,
    })
    .from(schema.trades);

  const byDate = new Map<string, DayAgg>();
  const months = new Set<string>();
  for (const t of trades) {
    if (t.entryAt == null) continue;
    const date = etDateString(t.entryAt);
    months.add(date.slice(0, 7));
    const pnl = netPnl(t) ?? 0;
    const cur = byDate.get(date) ?? { pnl: 0, trades: 0 };
    cur.pnl += pnl;
    cur.trades += 1;
    byDate.set(date, cur);
  }
  return { byDate, months };
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ m?: string }>;
}) {
  const { m } = await searchParams;
  const { byDate, months } = await dailyAgg();

  const latest = [...months].sort().at(-1);
  const ym = /^\d{4}-\d{2}$/.test(m ?? "") ? (m as string) : latest;

  if (!ym) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-xl font-semibold tracking-tight">Calendar</h1>
        <p className="text-sm text-[var(--muted)] mt-2">
          No trades yet.{" "}
          <Link href="/import" className="text-[#58a6ff] hover:underline">
            Import a ThinkorSwim statement
          </Link>{" "}
          to populate the calendar.
        </p>
      </div>
    );
  }

  const [year, month] = ym.split("-").map(Number);
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  let monthPnl = 0;
  let monthTrades = 0;
  for (const day of cells) {
    if (day == null) continue;
    const agg = byDate.get(`${ym}-${String(day).padStart(2, "0")}`);
    if (agg) {
      monthPnl += agg.pnl;
      monthTrades += agg.trades;
    }
  }

  return (
    <div className="max-w-4xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {monthFmt.format(new Date(Date.UTC(year, month - 1, 1)))}
          </h1>
          {monthTrades > 0 && (
            <span
              className="text-sm tabular-nums"
              style={{ color: monthPnl >= 0 ? "var(--green)" : "var(--red)" }}
            >
              {fmtMoney(monthPnl)} · {monthTrades} trades
            </span>
          )}
        </div>
        <div className="flex gap-2 text-sm">
          <Link
            href={`/calendar?m=${shiftMonth(ym, -1)}`}
            className="rounded border border-[var(--border)] px-2 py-1 hover:border-[#58a6ff]"
          >
            ← Prev
          </Link>
          <Link
            href={`/calendar?m=${shiftMonth(ym, 1)}`}
            className="rounded border border-[var(--border)] px-2 py-1 hover:border-[#58a6ff]"
          >
            Next →
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-[11px] uppercase tracking-wide text-[var(--muted)] pb-1">
            {d}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day == null) return <div key={i} />;
          const date = `${ym}-${String(day).padStart(2, "0")}`;
          const agg = byDate.get(date);
          const pos = agg ? agg.pnl >= 0 : false;
          const tint = agg
            ? pos
              ? "rgba(38,166,65,0.14)"
              : "rgba(232,64,64,0.14)"
            : "var(--surface)";
          const border = agg
            ? pos
              ? "rgba(38,166,65,0.5)"
              : "rgba(232,64,64,0.5)"
            : "var(--border)";
          const cell = (
            <div
              className="aspect-square rounded-md border p-1.5 flex flex-col"
              style={{ background: tint, borderColor: border }}
            >
              <span className="text-[11px] text-[var(--muted)]">{day}</span>
              {agg && (
                <span className="mt-auto">
                  <span
                    className="block text-xs font-semibold tabular-nums"
                    style={{ color: pos ? "var(--green)" : "var(--red)" }}
                  >
                    {fmtMoney(agg.pnl)}
                  </span>
                  <span className="block text-[10px] text-[var(--muted)]">
                    {agg.trades} {agg.trades === 1 ? "trade" : "trades"}
                  </span>
                </span>
              )}
            </div>
          );
          return agg ? (
            <Link key={i} href={`/trades?date=${date}`} className="block">
              {cell}
            </Link>
          ) : (
            <div key={i}>{cell}</div>
          );
        })}
      </div>
    </div>
  );
}
