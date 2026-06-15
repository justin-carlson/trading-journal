import Link from "next/link";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getActiveAccount } from "@/lib/accountScope";
import { fmtMoney } from "@/lib/format";
import { grossPnl, netPnl } from "@/lib/pnl";
import { etDateString, etDayRange, MARKET_TZ, timeZoneParts } from "@/lib/time";
import MonthPicker from "@/components/MonthPicker";

export const dynamic = "force-dynamic";

type DatePreset = "all" | "today" | "week" | "month" | "year" | "custom";

type ReportFilters = {
  date?: string;
  preset: DatePreset;
  from?: string;
  to?: string;
  symbol?: string;
  side?: "long" | "short";
  tag?: string;
  account?: string;
  chart: "cumulative" | "daily";
};

type ReportTrade = typeof schema.trades.$inferSelect & {
  pnl: number | null;
  gross: number | null;
};

type Bucket = {
  label: string;
  count: number;
  pnl: number;
};

type Stat = { label: string; value: string };
type StatSection = { title: string; stats: Stat[] };

const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function validDate(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function parseSearchParams(params: {
  date?: string;
  preset?: string;
  from?: string;
  to?: string;
  symbol?: string;
  side?: string;
  tag?: string;
  account?: string;
  chart?: string;
}): ReportFilters {
  const presetOptions = new Set<DatePreset>(["all", "today", "week", "month", "year", "custom"]);
  return {
    date: validDate(params.date),
    preset: presetOptions.has(params.preset as DatePreset) ? (params.preset as DatePreset) : "month",
    from: validDate(params.from),
    to: validDate(params.to),
    symbol: params.symbol?.trim().toUpperCase() || undefined,
    side: params.side === "long" || params.side === "short" ? params.side : undefined,
    tag: params.tag || undefined,
    account: params.account || undefined,
    chart: params.chart === "daily" ? "daily" : "cumulative",
  };
}

function isoAddDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function isoWeekday(date: string): number {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function currentEtDate(): string {
  return etDateString(Math.floor(Date.now() / 1000));
}

function lastDayOfMonth(date: string): string {
  const [year, month] = date.split("-").map(Number);
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${date.slice(0, 7)}-${String(day).padStart(2, "0")}`;
}

function yearRange(date: string): { from: string; to: string } {
  const year = date.slice(0, 4);
  return { from: `${year}-01-01`, to: `${year}-12-31` };
}

const monthLabelFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

const dateLabelFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric",
});

function dateLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return dateLabelFmt.format(new Date(Date.UTC(year, month - 1, day)));
}

function monthLabel(date: string): string {
  const [year, month] = date.split("-").map(Number);
  return monthLabelFmt.format(new Date(Date.UTC(year, month - 1, 1)));
}

function dateRangeFor(filters: ReportFilters): { from: string; to: string } | undefined {
  if (filters.date) return { from: filters.date, to: filters.date };

  const today = currentEtDate();
  const anchor = filters.from ?? today;
  if (filters.preset === "today") return { from: anchor, to: anchor };
  if (filters.preset === "week") {
    const monday = isoAddDays(anchor, -((isoWeekday(anchor) + 6) % 7));
    return { from: monday, to: isoAddDays(monday, 4) };
  }
  if (filters.preset === "month") return { from: `${anchor.slice(0, 7)}-01`, to: lastDayOfMonth(anchor) };
  if (filters.preset === "year") return yearRange(anchor);
  if (filters.preset === "custom") {
    if (!filters.from && !filters.to) return undefined;
    return {
      from: filters.from ?? "0000-01-01",
      to: filters.to ?? "9999-12-31",
    };
  }

  return undefined;
}

function reportRangeLabel(filters: ReportFilters): string {
  const range = dateRangeFor(filters);
  if (!range) return "All dates";
  if (range.from === range.to) return dateLabel(range.from);
  if (filters.preset === "month") return monthLabel(range.from);
  if (filters.preset === "year") return range.from.slice(0, 4);
  return `${dateLabel(range.from)} to ${dateLabel(range.to)}`;
}

function filterHref(filters: ReportFilters, updates: Partial<ReportFilters>) {
  const next = { ...filters, ...updates };
  const params = new URLSearchParams();
  if (next.date) params.set("date", next.date);
  if (next.preset !== "all") params.set("preset", next.preset);
  if (next.from) params.set("from", next.from);
  if (next.to) params.set("to", next.to);
  if (next.symbol) params.set("symbol", next.symbol);
  if (next.side) params.set("side", next.side);
  if (next.tag) params.set("tag", next.tag);
  if (next.account) params.set("account", next.account);
  if (next.chart !== "cumulative") params.set("chart", next.chart);
  const query = params.toString();
  return query ? `/reports?${query}` : "/reports";
}

async function loadTagOptions() {
  return db.select({ name: schema.tags.name }).from(schema.tags);
}

async function loadTrades(filters: ReportFilters, accountId: number): Promise<ReportTrade[]> {
  let rows = await db
    .select()
    .from(schema.trades)
    .where(eq(schema.trades.accountId, accountId))
    .limit(5000);
  const range = dateRangeFor(filters);

  if (range) {
    const { start } = etDayRange(range.from);
    const { end } = etDayRange(range.to);
    rows = rows.filter((t) => {
      if (t.entryAt == null || t.entryAt < start || t.entryAt > end) return false;
      const entryDate = etDateString(t.entryAt);
      return entryDate >= range.from && entryDate <= range.to;
    });
  }
  if (filters.symbol) rows = rows.filter((t) => t.symbol.toUpperCase().includes(filters.symbol!));
  if (filters.side) rows = rows.filter((t) => t.side === filters.side);

  if (filters.tag) {
    const taggedRows = await db
      .select({ tradeId: schema.tradeTags.tradeId, name: schema.tags.name })
      .from(schema.tradeTags)
      .innerJoin(schema.tags, eq(schema.tags.id, schema.tradeTags.tagId));
    const taggedTradeIds = new Set(taggedRows.filter((r) => r.name === filters.tag).map((r) => r.tradeId));
    rows = rows.filter((t) => taggedTradeIds.has(t.id));
  }

  return rows
    .map((t) => ({ ...t, pnl: netPnl(t), gross: grossPnl(t) }))
    .sort((a, b) => (a.entryAt ?? 0) - (b.entryAt ?? 0));
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function moneyOrDash(value: number | null | undefined): string {
  return value == null || !Number.isFinite(value) ? "-" : fmtMoney(value);
}

function ratioOrDash(value: number | null): string {
  return value == null || !Number.isFinite(value) ? "-" : value.toFixed(2);
}

function percentOrDash(value: number | null): string {
  return value == null || !Number.isFinite(value) ? "-" : `${(value * 100).toFixed(1)}%`;
}

function minutesLabel(minutes: number | null): string {
  if (minutes == null || !Number.isFinite(minutes)) return "-";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  if (minutes < 60 * 24) {
    const hours = minutes / 60;
    return `${hours < 2 ? "about " : ""}${hours.toFixed(hours < 10 ? 1 : 0)} hours`;
  }
  return `${(minutes / (60 * 24)).toFixed(1)} days`;
}

function maxStreak(values: number[], predicate: (value: number) => boolean): number {
  let best = 0;
  let current = 0;
  for (const value of values) {
    if (predicate(value)) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 0;
    }
  }
  return best;
}

function countWithPercent(count: number, total: number): string {
  return total === 0 ? "0" : `${count} (${((count / total) * 100).toFixed(1)}%)`;
}

function buildStats(trades: ReportTrade[]) {
  const closed = trades.filter((t) => t.pnl != null);
  const pnls = closed.map((t) => t.pnl as number);
  const winners = pnls.filter((pnl) => pnl > 0);
  const losers = pnls.filter((pnl) => pnl < 0);
  const scratches = pnls.filter((pnl) => pnl === 0);
  const totalPnl = pnls.reduce((sum, pnl) => sum + pnl, 0);
  const grossWins = winners.reduce((sum, pnl) => sum + pnl, 0);
  const grossLosses = Math.abs(losers.reduce((sum, pnl) => sum + pnl, 0));
  const grossValues = closed.map((t) => t.gross ?? 0);
  const totalGross = grossValues.reduce((sum, pnl) => sum + pnl, 0);
  const totalShares = closed.reduce((sum, t) => sum + t.quantity, 0);
  const shareSizes = closed.map((t) => Math.abs(t.quantity));
  const perShareValues = closed
    .filter((t) => t.quantity !== 0)
    .map((t) => ({
      pnl: t.pnl as number,
      value: (t.gross ?? t.pnl ?? 0) / Math.abs(t.quantity),
    }));
  const winningPerShare = perShareValues
    .filter((t) => t.pnl > 0)
    .map((t) => t.value);
  const losingPerShare = perShareValues
    .filter((t) => t.pnl < 0)
    .map((t) => t.value);
  const dailyPnl = [...closed.reduce((map, trade) => {
    if (trade.entryAt == null) return map;
    const date = etDateString(trade.entryAt);
    map.set(date, (map.get(date) ?? 0) + (trade.pnl ?? 0));
    return map;
  }, new Map<string, number>()).values()];
  const holdMinutesFor = (predicate: (pnl: number) => boolean) => closed
    .filter((t) => t.entryAt != null && t.exitAt != null && t.pnl != null && predicate(t.pnl))
    .map((t) => ((t.exitAt as number) - (t.entryAt as number)) / 60);
  const avgTrade = average(pnls);
  const winRate = winners.length + losers.length === 0 ? null : winners.length / (winners.length + losers.length);
  const avgWinner = average(winners);
  const avgLoser = average(losers);
  const payoffRatio = avgWinner == null || avgLoser == null || avgLoser === 0 ? null : avgWinner / Math.abs(avgLoser);

  return [
    {
      title: "Performance",
      stats: [
        { label: "Total Gain/Loss", value: fmtMoney(totalPnl) },
        { label: "Average Daily Gain/Loss", value: moneyOrDash(average(dailyPnl)) },
        { label: "Average Trade Gain/Loss", value: moneyOrDash(avgTrade) },
        { label: "Largest Gain", value: moneyOrDash(winners.length ? Math.max(...winners) : null) },
        { label: "Largest Loss", value: moneyOrDash(losers.length ? Math.min(...losers) : null) },
      ],
    },
    {
      title: "Accuracy",
      stats: [
        { label: "Win Rate", value: percentOrDash(winRate) },
        { label: "Number of Winning Trades", value: countWithPercent(winners.length, closed.length) },
        { label: "Number of Losing Trades", value: countWithPercent(losers.length, closed.length) },
        { label: "Average Winning Trade", value: moneyOrDash(avgWinner) },
        { label: "Average Losing Trade", value: moneyOrDash(avgLoser) },
        { label: "Payoff Ratio", value: ratioOrDash(payoffRatio) },
        { label: "Profit Factor", value: ratioOrDash(grossLosses === 0 ? null : grossWins / grossLosses) },
        { label: "Max Consecutive Wins", value: String(maxStreak(pnls, (pnl) => pnl > 0)) },
        { label: "Max Consecutive Losses", value: String(maxStreak(pnls, (pnl) => pnl < 0)) },
      ],
    },
    {
      title: "Sizing",
      stats: [
        { label: "Average Share Size", value: shareSizes.length ? Math.round(average(shareSizes) ?? 0).toLocaleString() : "-" },
        { label: "Median Share Size", value: shareSizes.length ? Math.round(median(shareSizes) ?? 0).toLocaleString() : "-" },
        { label: "Total Shares Traded", value: totalShares.toLocaleString() },
        { label: "Average Daily Volume", value: dailyPnl.length ? Math.round(totalShares / dailyPnl.length).toLocaleString() : "-" },
        { label: "Average Per-share Gain/Loss", value: totalShares > 0 ? fmtMoney(totalGross / totalShares) : "-" },
        { label: "High Winning Per-share", value: moneyOrDash(winningPerShare.length ? Math.max(...winningPerShare) : null) },
        { label: "Average Winning Per-share", value: moneyOrDash(average(winningPerShare)) },
        { label: "Average Losing Per-share", value: moneyOrDash(average(losingPerShare)) },
        { label: "Worst Losing Per-share", value: moneyOrDash(losingPerShare.length ? Math.min(...losingPerShare) : null) },
      ],
    },
    {
      title: "Timing",
      stats: [
        { label: "Number of Scratch Trades", value: countWithPercent(scratches.length, closed.length) },
        { label: "Average Hold Time (winning trades)", value: minutesLabel(average(holdMinutesFor((pnl) => pnl > 0))) },
        { label: "Average Hold Time (losing trades)", value: minutesLabel(average(holdMinutesFor((pnl) => pnl < 0))) },
      ],
    },
  ] satisfies StatSection[];
}

function emptyBuckets(labels: string[]): Bucket[] {
  return labels.map((label) => ({ label, count: 0, pnl: 0 }));
}

function addToBucket(bucket: Bucket, trade: ReportTrade) {
  bucket.count += 1;
  bucket.pnl += trade.pnl ?? 0;
}

function buildDayBuckets(trades: ReportTrade[]): Bucket[] {
  const buckets = emptyBuckets(dayLabels);
  for (const trade of trades) {
    if (trade.entryAt == null) continue;
    const parts = timeZoneParts(trade.entryAt * 1000, MARKET_TZ);
    const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay();
    addToBucket(buckets[weekday], trade);
  }
  return buckets;
}

function buildHourBuckets(trades: ReportTrade[]): Bucket[] {
  const buckets = Array.from({ length: 16 }, (_, i) => ({ label: `${String(i + 4).padStart(2, "0")}:00`, count: 0, pnl: 0 }));
  for (const trade of trades) {
    if (trade.entryAt == null) continue;
    const parts = timeZoneParts(trade.entryAt * 1000, MARKET_TZ);
    if (parts.hour < 4 || parts.hour > 19) continue;
    addToBucket(buckets[parts.hour - 4], trade);
  }
  return buckets;
}

function buildMonthBuckets(trades: ReportTrade[]): Bucket[] {
  const buckets = emptyBuckets(monthLabels);
  for (const trade of trades) {
    if (trade.entryAt == null) continue;
    const parts = timeZoneParts(trade.entryAt * 1000, MARKET_TZ);
    addToBucket(buckets[parts.month - 1], trade);
  }
  return buckets;
}

function buildDurationBuckets(trades: ReportTrade[]): Bucket[] {
  const buckets = [
    { label: "< 1m", count: 0, pnl: 0 },
    { label: "1-5m", count: 0, pnl: 0 },
    { label: "5-15m", count: 0, pnl: 0 },
    { label: "15-60m", count: 0, pnl: 0 },
    { label: "1h+", count: 0, pnl: 0 },
  ];
  for (const trade of trades) {
    if (trade.entryAt == null || trade.exitAt == null) continue;
    const minutes = (trade.exitAt - trade.entryAt) / 60;
    const index = minutes < 1 ? 0 : minutes < 5 ? 1 : minutes < 15 ? 2 : minutes < 60 ? 3 : 4;
    addToBucket(buckets[index], trade);
  }
  return buckets;
}

function buildDailyPnl(trades: ReportTrade[]) {
  const byDate = new Map<string, number>();
  for (const trade of trades) {
    if (trade.entryAt == null) continue;
    const date = etDateString(trade.entryAt);
    byDate.set(date, (byDate.get(date) ?? 0) + (trade.pnl ?? 0));
  }

  let cumulative = 0;
  return [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, pnl]) => {
      cumulative += pnl;
      return { date, pnl, cumulative };
    });
}

function FilterBar({ filters, tagOptions }: { filters: ReportFilters; tagOptions: { name: string }[] }) {
  const activePreset: DatePreset = filters.date ? "custom" : filters.preset;
  const presetBase = { date: undefined, from: undefined, to: undefined };
  const presetButtonClass = (preset: DatePreset) =>
    `flex h-8 min-w-16 items-center justify-center rounded px-3 text-sm font-semibold transition-colors ${
      activePreset === preset
        ? "bg-[var(--surface-2)] text-[var(--foreground)]"
        : "text-[var(--muted)] hover:text-[var(--foreground)]"
    }`;
  const selectedDate = dateRangeFor(filters)?.from ?? currentEtDate();

  return (
    <form action="/reports" className="space-y-4">
      <input type="hidden" name="preset" value={activePreset} />
      <input type="hidden" name="chart" value={filters.chart} />
      <div className="relative mb-4 space-y-2">
        <span className="block text-sm font-semibold text-[var(--muted)]">Date range</span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div className="inline-flex h-10 items-center rounded-md border border-[var(--border)] p-1">
            <Link href={filterHref(filters, { ...presetBase, preset: "today" })} className={presetButtonClass("today")}>Today</Link>
            <Link href={filterHref(filters, { ...presetBase, preset: "week" })} className={presetButtonClass("week")}>Week</Link>
            <Link href={filterHref(filters, { ...presetBase, preset: "month" })} className={presetButtonClass("month")}>Month</Link>
            <Link href={filterHref(filters, { ...presetBase, preset: "year" })} className={presetButtonClass("year")}>Year</Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <MonthPicker selectedDate={selectedDate} />
            <Link href="/reports" className="flex h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm text-[var(--muted)] hover:border-[#58a6ff]">Clear</Link>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="space-y-1">
          <span className="block text-sm font-semibold text-[var(--muted)]">Symbol</span>
          <input name="symbol" defaultValue={filters.symbol ?? ""} placeholder="Symbol" className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[#58a6ff]" />
        </label>
        <label className="space-y-1">
          <span className="block text-sm font-semibold text-[var(--muted)]">Tag</span>
          <select name="tag" defaultValue={filters.tag ?? ""} className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[#58a6ff]">
            <option value="">All tags</option>
            {tagOptions.map((tagOption) => <option key={tagOption.name} value={tagOption.name}>{tagOption.name}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-sm font-semibold text-[var(--muted)]">Side</span>
          <select name="side" defaultValue={filters.side ?? ""} className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[#58a6ff]">
            <option value="">All sides</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="h-10 rounded-md border border-[#58a6ff] px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface)]">Apply</button>
        </div>
      </div>
    </form>
  );
}

const summaryStatLabels = [
  "Total Gain/Loss",
  "Win Rate",
  "Profit Factor",
  "Payoff Ratio",
  "Average Trade Gain/Loss",
  "Average Per-share Gain/Loss",
];

function findStat(sections: StatSection[], label: string) {
  return sections.flatMap((section) => section.stats).find((stat) => stat.label === label);
}

function StatsGrid({ sections, rangeLabel }: { sections: StatSection[]; rangeLabel: string }) {
  const summaryStats = summaryStatLabels
    .map((label) => findStat(sections, label))
    .filter((stat): stat is Stat => Boolean(stat));
  const detailStats = sections.flatMap((section) =>
    section.stats.filter((stat) => !summaryStatLabels.includes(stat.label)),
  );
  const stats = [...summaryStats, ...detailStats];

  return (
    <section className="pt-6">
      <h2 className="mb-8 text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Stats
        {rangeLabel !== "All dates" && <span className="text-[var(--muted)]"> · {rangeLabel}</span>}
      </h2>

      <div className="border-y border-[var(--hairline)] px-4 md:px-6">
        {Array.from({ length: Math.ceil(stats.length / 3) }, (_, rowIndex) => {
          const rowStats = stats.slice(rowIndex * 3, rowIndex * 3 + 3);
          const isLastRow = rowIndex === Math.ceil(stats.length / 3) - 1;
          const isSummaryRow = rowIndex < 2;
          return (
            <div
              key={rowIndex}
              className={`grid gap-x-16 md:grid-cols-3 ${isLastRow ? "" : "border-b border-[var(--hairline)]"}`}
            >
              {rowStats.map((stat) => {
                return (
                  <div
                    key={stat.label}
                    className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-5 ${
                      isSummaryRow ? "min-h-[5.25rem] py-5" : "min-h-14 py-4"
                    }`}
                  >
                    <div className="text-sm font-normal leading-snug text-[var(--body)]">{stat.label}</div>
                    <div
                      className={`whitespace-nowrap font-mono font-semibold tabular-nums text-[var(--foreground)] ${
                        isSummaryRow ? "text-lg" : "text-base"
                      }`}
                    >
                      {stat.value}
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function CountChart({ title, buckets }: { title: string; buckets: Bucket[] }) {
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  return (
    <section>
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">{title}</h2>
      <div className="mb-4 mt-4 border-t border-[var(--hairline)]" />
      <div className="space-y-2">
        {buckets.map((bucket) => (
          <div key={bucket.label} className="grid grid-cols-[64px_1fr_56px] items-center gap-3 text-sm">
            <div className="text-[var(--muted)]">{bucket.label}</div>
            <div className="h-2 rounded bg-[var(--surface-2)]">
              <div className="h-2 rounded bg-[var(--green)]" style={{ width: `${Math.max(2, (bucket.count / max) * 100)}%` }} />
            </div>
            <div className="text-right tabular-nums text-[var(--muted)]">{bucket.count}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PnlChart({ title, buckets }: { title: string; buckets: Bucket[] }) {
  const maxAbs = Math.max(1, ...buckets.map((bucket) => Math.abs(bucket.pnl)));
  return (
    <section>
      <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">{title}</h2>
      <div className="mb-4 mt-4 border-t border-[var(--hairline)]" />
      <div className="space-y-2">
        {buckets.map((bucket) => {
          const pos = bucket.pnl >= 0;
          return (
            <div key={bucket.label} className="grid grid-cols-[64px_1fr_80px] items-center gap-3 text-sm">
              <div className="text-[var(--muted)]">{bucket.label}</div>
              <div className="grid h-2 grid-cols-2 rounded bg-[var(--surface-2)]">
                <div className="flex justify-end">
                  {!pos && <div className="h-2 rounded bg-[var(--red)]" style={{ width: `${Math.max(2, (Math.abs(bucket.pnl) / maxAbs) * 100)}%` }} />}
                </div>
                <div>
                  {pos && <div className="h-2 rounded bg-[var(--green)]" style={{ width: `${Math.max(2, (bucket.pnl / maxAbs) * 100)}%` }} />}
                </div>
              </div>
              <div
                className="text-right tabular-nums text-[var(--foreground)]"
                style={{ color: bucket.pnl > 0 ? "var(--green)" : bucket.pnl < 0 ? "var(--red)" : undefined }}
              >
                {fmtMoney(bucket.pnl)}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function DailyPnlBars({ points }: { points: { date: string; pnl: number }[] }) {
  const maxAbs = Math.max(1, ...points.map((point) => Math.abs(point.pnl)));
  const ticks = points.length <= 8 ? points : points.filter((_, index) => index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 4) === 0);

  return (
    <>
      {points.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--muted)]">No closed trades in range.</div>
      ) : (
        <div className="h-64">
          <div className="grid h-52 items-stretch gap-1" style={{ gridTemplateColumns: `repeat(${points.length}, minmax(3px, 1fr))` }}>
            {points.map((point) => {
              const pos = point.pnl >= 0;
              return (
                <div key={point.date} className="grid grid-rows-2">
                  <div className="flex items-end">
                    {pos && (
                      <div
                        className="w-full rounded-t bg-[var(--green)]"
                        style={{ height: `${Math.max(2, (point.pnl / maxAbs) * 100)}%` }}
                        title={`${point.date}: ${fmtMoney(point.pnl)}`}
                      />
                    )}
                  </div>
                  <div className="flex items-start border-t border-[var(--muted)]/40">
                    {!pos && (
                      <div
                        className="w-full rounded-b bg-[var(--red)]"
                        style={{ height: `${Math.max(2, (Math.abs(point.pnl) / maxAbs) * 100)}%` }}
                        title={`${point.date}: ${fmtMoney(point.pnl)}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex justify-between text-xs text-[var(--muted)]">
            {ticks.map((point) => <span key={point.date}>{point.date.slice(5)}</span>)}
          </div>
        </div>
      )}
    </>
  );
}

function CumulativePnlLine({ points }: { points: { date: string; cumulative: number }[] }) {
  const width = 520;
  const height = 220;
  const pad = 20;
  const values = points.map((point) => point.cumulative);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const path = points.map((point, index) => {
    const x = pad + (points.length === 1 ? 0 : (index / (points.length - 1)) * (width - pad * 2));
    const y = pad + ((max - point.cumulative) / span) * (height - pad * 2);
    return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const zeroY = pad + ((max - 0) / span) * (height - pad * 2);
  const ticks = points.length <= 8 ? points : points.filter((_, index) => index === 0 || index === points.length - 1 || index % Math.ceil(points.length / 4) === 0);
  const final = values.at(-1) ?? 0;

  return (
    <>
      <div className="mb-4 flex justify-end">
        <span
          className="text-sm font-semibold tabular-nums text-[var(--foreground)]"
          style={{ color: final > 0 ? "var(--green)" : final < 0 ? "var(--red)" : undefined }}
        >
          {fmtMoney(final)}
        </span>
      </div>
      {points.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-sm text-[var(--muted)]">No closed trades in range.</div>
      ) : (
        <div>
          <svg viewBox={`0 0 ${width} ${height}`} className="h-64 w-full" role="img" aria-label="Cumulative P&L">
            <line x1={pad} x2={width - pad} y1={zeroY} y2={zeroY} stroke="var(--muted)" strokeOpacity="0.35" />
            <path d={path} fill="none" stroke={final >= 0 ? "var(--green)" : "var(--red)"} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="mt-3 flex justify-between text-xs text-[var(--muted)]">
            {ticks.map((point) => <span key={point.date}>{point.date.slice(5)}</span>)}
          </div>
        </div>
      )}
    </>
  );
}

function PnlModule({ filters, points }: { filters: ReportFilters; points: { date: string; pnl: number; cumulative: number }[] }) {
  const chartButtonClass = (chart: ReportFilters["chart"]) =>
    `inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-semibold transition-colors ${
      filters.chart === chart
        ? "border-[#58a6ff] bg-[#58a6ff]/10 text-[var(--foreground)]"
        : "border-[var(--border)] text-[var(--muted)] hover:border-[#58a6ff] hover:text-[var(--foreground)]"
    }`;

  return (
    <section className="border-t border-[var(--hairline)] pt-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
          {filters.chart === "daily" ? "Daily P&L" : "Cumulative P&L"}
        </h2>
        <div className="flex gap-2">
          <Link href={filterHref(filters, { chart: "cumulative" })} className={chartButtonClass("cumulative")}>Cumulative</Link>
          <Link href={filterHref(filters, { chart: "daily" })} className={chartButtonClass("daily")}>Daily</Link>
        </div>
      </div>
      {filters.chart === "daily" ? <DailyPnlBars points={points} /> : <CumulativePnlLine points={points} />}
    </section>
  );
}

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    preset?: string;
    from?: string;
    to?: string;
    symbol?: string;
    side?: string;
    tag?: string;
    account?: string;
    chart?: string;
  }>;
}) {
  const filters = parseSearchParams(await searchParams);
  const activeAccount = await getActiveAccount();
  const [trades, tagOptions] = await Promise.all([loadTrades(filters, activeAccount.id), loadTagOptions()]);
  const statSections = buildStats(trades);
  const dayBuckets = buildDayBuckets(trades);
  const hourBuckets = buildHourBuckets(trades);
  const monthBuckets = buildMonthBuckets(trades);
  const durationBuckets = buildDurationBuckets(trades);
  const dailyPnl = buildDailyPnl(trades);
  const rangeLabel = reportRangeLabel(filters);

  return (
    <div className="mx-auto max-w-6xl">
      <FilterBar filters={filters} tagOptions={tagOptions} />

      <div className="mt-6">
        <StatsGrid sections={statSections} rangeLabel={rangeLabel} />
      </div>

      <div className="mt-16">
        <PnlModule filters={filters} points={dailyPnl} />
      </div>

      <div className="mt-24">
        <div className="grid gap-x-24 gap-y-16 md:grid-cols-2">
          <CountChart title="Trade Distribution by Day of Week" buckets={dayBuckets} />
          <PnlChart title="Performance by Day of Week" buckets={dayBuckets} />
          <CountChart title="Trade Distribution by Hour of Day" buckets={hourBuckets} />
          <PnlChart title="Performance by Hour of Day" buckets={hourBuckets} />
          <CountChart title="Trade Distribution by Month" buckets={monthBuckets} />
          <PnlChart title="Performance by Month" buckets={monthBuckets} />
          <CountChart title="Trade Distribution by Duration" buckets={durationBuckets} />
          <PnlChart title="Performance by Duration" buckets={durationBuckets} />
        </div>
      </div>
    </div>
  );
}
