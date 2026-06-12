import Link from "next/link";
import { db, schema } from "@/lib/db";
import { netPnl } from "@/lib/pnl";
import { etDateString } from "@/lib/time";
import { fmtMoney } from "@/lib/format";
import CalendarRangeFilter from "@/components/CalendarRangeFilter";

export const dynamic = "force-dynamic";

type DayAgg = { pnl: number; trades: number };
type CalendarSearch = {
  m?: string;
  y?: string;
  view?: string;
  range?: string;
  from?: string;
  to?: string;
};

const monthFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});
const monthShortFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
});
const WORKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const YEAR_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function shiftMonth(ym: string, delta: number): string {
  let [y, m] = ym.split("-").map(Number);
  m += delta;
  while (m < 1) { m += 12; y -= 1; }
  while (m > 12) { m -= 12; y += 1; }
  return `${y}-${String(m).padStart(2, "0")}`;
}

/** Calendar cells for a month: leading blanks + day numbers, padded to weeks. */
function monthMatrix(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (number | null)[] = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addUtcDays(date: Date, days: number): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days));
}

function validDate(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function calendarHref(params: CalendarSearch): string {
  const search = new URLSearchParams();
  if (params.m) search.set("m", params.m);
  if (params.view) search.set("view", params.view);
  if (params.y) search.set("y", params.y);
  if (params.range) search.set("range", params.range);
  if (params.from) search.set("from", params.from);
  if (params.to) search.set("to", params.to);
  const query = search.toString();
  return query ? `/calendar?${query}` : "/calendar";
}

function filterByRange(byDate: Map<string, DayAgg>, from: string | undefined, to: string | undefined) {
  if (!from && !to) return byDate;
  const filtered = new Map<string, DayAgg>();
  for (const [date, agg] of byDate) {
    if (from && date < from) continue;
    if (to && date > to) continue;
    filtered.set(date, agg);
  }
  return filtered;
}

type WorkweekDay = {
  date: string;
  day: number;
  inMonth: boolean;
  agg: DayAgg | undefined;
};

type Workweek = {
  days: WorkweekDay[];
  pnl: number;
  trades: number;
};

function workweeksForMonth(year: number, month: number, byDate: Map<string, DayAgg>): Workweek[] {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const last = new Date(Date.UTC(year, month, 0));
  const mondayOffset = (first.getUTCDay() + 6) % 7;
  let cursor = addUtcDays(first, -mondayOffset);
  const weeks: Workweek[] = [];

  while (cursor <= last) {
    const days: WorkweekDay[] = [];
    let pnl = 0;
    let trades = 0;

    for (let i = 0; i < 5; i += 1) {
      const dayDate = addUtcDays(cursor, i);
      const date = isoDate(dayDate);
      const inMonth = dayDate.getUTCFullYear() === year && dayDate.getUTCMonth() === month - 1;
      const agg = inMonth ? byDate.get(date) : undefined;
      if (agg) {
        pnl += agg.pnl;
        trades += agg.trades;
      }
      days.push({ date, day: dayDate.getUTCDate(), inMonth, agg });
    }

    if (days.some((d) => d.inMonth)) weeks.push({ days, pnl, trades });
    cursor = addUtcDays(cursor, 7);
  }

  return weeks;
}

async function dailyAgg(): Promise<{ byDate: Map<string, DayAgg>; periods: Set<string> }> {
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
  const periods = new Set<string>();
  for (const t of trades) {
    if (t.entryAt == null) continue;
    const date = etDateString(t.entryAt);
    periods.add(date.slice(0, 7));
    const pnl = netPnl(t) ?? 0;
    const cur = byDate.get(date) ?? { pnl: 0, trades: 0 };
    cur.pnl += pnl;
    cur.trades += 1;
    byDate.set(date, cur);
  }
  return { byDate, periods };
}

function emptyState() {
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

function ViewToggle({ active, monthHref, yearHref }: { active: "month" | "year"; monthHref: string; yearHref: string }) {
  const base = "flex h-10 items-center rounded-md px-3 text-sm font-semibold border";
  const on = "bg-[var(--surface)] border-[#58a6ff] text-[var(--foreground)]";
  const off = "border-[var(--border)] text-[var(--muted)] hover:border-[#58a6ff]";
  return (
    <div className="flex gap-1.5">
      <Link href={monthHref} className={`${base} ${active === "month" ? on : off}`}>Month</Link>
      <Link href={yearHref} className={`${base} ${active === "year" ? on : off}`}>Year</Link>
    </div>
  );
}

function NavButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="flex h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)] hover:border-[#58a6ff]"
    >
      {children}
    </Link>
  );
}

function MonthView({
  ym,
  byDate,
  params,
}: {
  ym: string;
  byDate: Map<string, DayAgg>;
  params: CalendarSearch;
}) {
  const [year, month] = ym.split("-").map(Number);
  const weeks = workweeksForMonth(year, month, byDate);

  let monthPnl = 0;
  let monthTrades = 0;
  for (const week of weeks) {
    monthPnl += week.pnl;
    monthTrades += week.trades;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">
            {monthFmt.format(new Date(Date.UTC(year, month - 1, 1)))}
          </h1>
          {monthTrades > 0 && (
            <span className="text-sm tabular-nums" style={{ color: monthPnl >= 0 ? "var(--green)" : "var(--red)" }}>
              {fmtMoney(monthPnl)} · {monthTrades} trades
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle
            active="month"
            monthHref={calendarHref({ ...params, view: undefined, y: undefined, m: ym })}
            yearHref={calendarHref({ ...params, view: "year", y: String(year), m: undefined })}
          />
          <div className="flex gap-2">
            <NavButton href={calendarHref({ ...params, m: shiftMonth(ym, -1), view: undefined, y: undefined })}>
              Prev
            </NavButton>
            <NavButton href={calendarHref({ ...params, m: shiftMonth(ym, 1), view: undefined, y: undefined })}>
              Next
            </NavButton>
          </div>
          <CalendarRangeFilter
            params={params}
            clearHref={calendarHref({ ...params, range: undefined, from: undefined, to: undefined })}
          />
        </div>
      </div>

      <div className="max-w-6xl">
        <div className="grid grid-cols-[repeat(5,minmax(0,1fr))_minmax(150px,0.8fr)] px-1 pb-1">
          {[...WORKDAYS, "Total"].map((d) => (
            <div key={d} className="text-center text-lg font-semibold text-[var(--muted)]">
              {d}
            </div>
          ))}
        </div>

        <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]">
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              className="grid min-h-48 grid-cols-[repeat(5,minmax(0,1fr))_minmax(150px,0.8fr)] border-b border-[var(--border)] last:border-b-0"
            >
              {week.days.map((day) => {
                const pos = day.agg ? day.agg.pnl >= 0 : false;
                const content = (
                  <div
                    className={`flex h-full min-h-48 flex-col border-r border-[var(--border)] p-4 ${
                      day.inMonth ? "" : "opacity-30"
                    }`}
                  >
                    <span className="text-lg font-semibold leading-none text-[var(--foreground)]">
                      {day.day}
                    </span>
                    <span className="mt-auto">
                      <span
                        className="block text-lg font-semibold tabular-nums"
                        style={{ color: day.agg ? (pos ? "var(--green)" : "var(--red)") : "var(--muted)" }}
                      >
                        {day.agg ? fmtMoney(day.agg.pnl) : "$0.00"}
                      </span>
                      <span className="block text-base font-semibold text-[var(--muted)]">
                        {day.agg?.trades ?? 0} {day.agg?.trades === 1 ? "trade" : "trades"}
                      </span>
                    </span>
                  </div>
                );
                return day.agg ? (
                  <Link key={day.date} href={`/trades?date=${day.date}`} className="block">
                    {content}
                  </Link>
                ) : (
                  <div key={day.date}>{content}</div>
                );
              })}

              <div className="flex min-h-48 flex-col p-4">
                <span className="text-lg font-semibold leading-none text-[var(--foreground)]">
                  Week {weekIndex + 1}
                </span>
                <span className="mt-auto">
                  <span
                    className="block text-lg font-semibold tabular-nums"
                    style={{ color: week.trades ? (week.pnl >= 0 ? "var(--green)" : "var(--red)") : "var(--muted)" }}
                  >
                    {fmtMoney(week.pnl)}
                  </span>
                  <span className="block text-base font-semibold text-[var(--muted)]">
                    {week.trades} {week.trades === 1 ? "trade" : "trades"}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MiniMonth({
  year,
  month,
  byDate,
  params,
}: {
  year: number;
  month: number;
  byDate: Map<string, DayAgg>;
  params: CalendarSearch;
}) {
  const ym = `${year}-${String(month).padStart(2, "0")}`;
  const cells = monthMatrix(year, month);
  let pnl = 0;
  let trades = 0;
  for (const d of cells) {
    if (d == null) continue;
    const a = byDate.get(`${ym}-${String(d).padStart(2, "0")}`);
    if (a) { pnl += a.pnl; trades += a.trades; }
  }

  return (
    <Link
      href={calendarHref({ ...params, m: ym, view: undefined, y: undefined })}
      className="block rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 hover:border-[#58a6ff]"
    >
      <div className="mb-4 flex items-baseline justify-between">
        <span className="text-lg font-semibold">{monthShortFmt.format(new Date(Date.UTC(year, month - 1, 1)))}</span>
        {trades > 0 && (
          <span className="text-sm font-semibold tabular-nums" style={{ color: pnl >= 0 ? "var(--green)" : "var(--red)" }}>{fmtMoney(pnl)}</span>
        )}
      </div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {YEAR_WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-[var(--muted)]">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, i) => {
          if (day == null) return <div key={i} className="aspect-square" />;
          const agg = byDate.get(`${ym}-${String(day).padStart(2, "0")}`);
          const pos = agg ? agg.pnl >= 0 : false;
          return (
            <div
              key={i}
              className="aspect-square rounded-md flex items-center justify-center text-base font-semibold text-[var(--muted)]"
              style={{
                backgroundColor: agg ? (pos ? "rgba(38, 166, 65, 0.12)" : "rgba(232, 64, 64, 0.12)") : undefined,
                color: agg ? (pos ? "var(--green)" : "var(--red)") : undefined,
              }}
              title={agg ? `${ym}-${String(day).padStart(2, "0")}: ${fmtMoney(agg.pnl)}` : undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
    </Link>
  );
}

function YearView({
  year,
  byDate,
  latest,
  params,
}: {
  year: number;
  byDate: Map<string, DayAgg>;
  latest: string;
  params: CalendarSearch;
}) {
  let yearPnl = 0;
  let yearTrades = 0;
  for (const [date, agg] of byDate) {
    if (!date.startsWith(`${year}-`)) continue;
    yearPnl += agg.pnl;
    yearTrades += agg.trades;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{year}</h1>
          {yearTrades > 0 && (
            <span className="text-sm tabular-nums" style={{ color: yearPnl >= 0 ? "var(--green)" : "var(--red)" }}>
              {fmtMoney(yearPnl)} · {yearTrades} trades
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <ViewToggle
            active="year"
            monthHref={calendarHref({ ...params, m: latest, view: undefined, y: undefined })}
            yearHref={calendarHref({ ...params, view: "year", y: String(year), m: undefined })}
          />
          <CalendarRangeFilter
            params={params}
            clearHref={calendarHref({ ...params, range: undefined, from: undefined, to: undefined })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 12 }, (_, i) => (
          <MiniMonth key={i} year={year} month={i + 1} byDate={byDate} params={params} />
        ))}
      </div>
    </div>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<CalendarSearch>;
}) {
  const rawParams = await searchParams;
  const { m, y, view, range } = rawParams;
  const from = validDate(rawParams.from);
  const to = validDate(rawParams.to);
  const { byDate, periods } = await dailyAgg();
  const params: CalendarSearch = {
    m,
    y,
    view,
    range,
    from,
    to,
  };
  const filteredByDate = filterByRange(byDate, from, to);

  const latest = [...periods].sort().at(-1);
  if (!latest) return emptyState();

  if (view === "year") {
    const year = /^\d{4}$/.test(y ?? "") ? Number(y) : Number(latest.slice(0, 4));
    return <YearView year={year} byDate={filteredByDate} latest={latest} params={{ ...params, view: "year", y: String(year), m: undefined }} />;
  }

  const ym = /^\d{4}-\d{2}$/.test(m ?? "") ? (m as string) : latest;
  return <MonthView ym={ym} byDate={filteredByDate} params={{ ...params, m: ym, view: undefined, y: undefined }} />;
}
