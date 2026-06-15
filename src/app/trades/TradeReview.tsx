import Link from "next/link";
import { and, asc, desc, gte, inArray, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { netPnl } from "@/lib/pnl";
import { etDateString, etDayRange } from "@/lib/time";
import ArchiveSidebar, { type ArchiveSidebarMonth } from "@/components/ArchiveSidebar";
import TickerReviewRail from "@/components/TickerReviewRail";

export const dynamic = "force-dynamic";

export type ReviewPreset = "today" | "week" | "month";

type TradeRow = typeof schema.trades.$inferSelect;
type ExecutionRow = typeof schema.executions.$inferSelect;

type TickerRow = {
  symbol: string;
  pnl: number;
  trades: number;
};

type ReviewSummary = {
  trades: number;
  fills: number;
  wins: number;
  losses: number;
  grossWins: number;
  grossLosses: number;
  accuracy: number | null;
  profitFactor: number | null;
  pnl: number;
};

type ReviewDay = ReviewSummary & {
  date: string;
  label: string;
  displayDate: string;
  journalHref: string;
};

type PnlPoint = {
  time: string;
  value: number;
};

type ReviewData = {
  day: ReviewDay;
  tickerRows: TickerRow[];
  pnlPoints: PnlPoint[];
};

type ReviewWeek = ReviewSummary & {
  key: string;
  label: string;
  displayDate: string;
  days: ReviewData[];
};

type ReviewRange = ReviewSummary & {
  preset: ReviewPreset;
  anchor: string;
  title: string;
  eyebrow: string;
  displayDate: string;
  days: ReviewData[];
  weeks: ReviewWeek[];
};

type ReviewArchive = {
  months: ArchiveSidebarMonth[];
  years: {
    key: string;
    label: string;
    href: string;
  }[];
};

const dateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
  year: "numeric",
});

const dayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "long",
});

const monthFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

const shortDateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});

const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "numeric",
  minute: "2-digit",
  hour12: false,
});

function utcDate(date: string): Date {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value).toLocaleString("en-US", {
    maximumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
    minimumFractionDigits: Math.abs(value) >= 100 ? 0 : 2,
  })}`;
}

function pnlClass(value: number | null | undefined) {
  if (value == null) return "text-[var(--muted)]";
  if (value > 0) return "text-[var(--green)]";
  if (value < 0) return "text-[var(--red)]";
  return "text-[var(--muted)]";
}

function formatProfitFactor(value: number | null): string {
  return value == null || !Number.isFinite(value) ? "-" : value.toFixed(2);
}

function formatTime(epochSeconds: number): string {
  return timeFmt.format(new Date(epochSeconds * 1000)).replace(/^24:/, "00:");
}

function validDate(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function isoAddDays(date: string, days: number): string {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

function isoWeekday(date: string): number {
  return utcDate(date).getUTCDay();
}

function weekStartFor(date: string): string {
  return isoAddDays(date, -((isoWeekday(date) + 6) % 7));
}

function lastDayOfMonth(date: string): string {
  const [year, month] = date.split("-").map(Number);
  const day = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return `${date.slice(0, 7)}-${String(day).padStart(2, "0")}`;
}

function monthWeekLabel(weekStart: string): string {
  const day = Number(weekStart.slice(8, 10));
  return `Week ${Math.floor((day - 1) / 7) + 1}`;
}

function weekRangeLabel(weekStart: string): string {
  const weekEnd = isoAddDays(weekStart, 4);
  const year = weekEnd.slice(0, 4);
  return `${shortDateFmt.format(utcDate(weekStart))} - ${shortDateFmt.format(utcDate(weekEnd))}, ${year}`;
}

function archiveWeekLabel(monthKey: string, weekStart: string): string {
  const firstWeekStart = weekStartFor(`${monthKey}-01`);
  const daysFromFirstWeek = Math.round((Date.parse(`${weekStart}T00:00:00Z`) - Date.parse(`${firstWeekStart}T00:00:00Z`)) / 86400000);
  return `Week ${Math.floor(daysFromFirstWeek / 7) + 1}`;
}

function archiveWeekRangeLabel(weekStart: string, monthKey: string): string {
  const start = weekStart < `${monthKey}-01` ? `${monthKey}-01` : weekStart;
  const endOfWeek = isoAddDays(weekStart, 4);
  const endOfMonth = lastDayOfMonth(`${monthKey}-01`);
  const end = endOfWeek > endOfMonth ? endOfMonth : endOfWeek;
  return `${Number(start.slice(-2))}-${Number(end.slice(-2))}`;
}

function archiveWeeks(monthKey: string, activeWeekKey?: string): ArchiveSidebarMonth["weeks"] {
  const monthStart = `${monthKey}-01`;
  const monthEnd = lastDayOfMonth(monthStart);
  let weekStart = weekStartFor(monthStart);
  const weeks: ArchiveSidebarMonth["weeks"] = [];

  while (weekStart <= monthEnd) {
    const weekEnd = isoAddDays(weekStart, 4);
    const intersectsMonth = weekEnd >= monthStart && weekStart <= monthEnd;
    if (intersectsMonth) {
      weeks.push({
        key: weekStart,
        label: archiveWeekLabel(monthKey, weekStart),
        rangeLabel: archiveWeekRangeLabel(weekStart, monthKey),
        active: weekStart === activeWeekKey,
        href: reviewHref({ preset: "week", from: weekStart }),
      });
    }
    weekStart = isoAddDays(weekStart, 7);
  }

  return weeks;
}

function summarizeTrades(trades: TradeRow[], fills: number): ReviewSummary {
  const pnls = trades.map((trade) => netPnl(trade) ?? 0);
  const winners = pnls.filter((pnl) => pnl > 0);
  const losers = pnls.filter((pnl) => pnl < 0);
  const grossWins = winners.reduce((sum, value) => sum + value, 0);
  const grossLosses = Math.abs(losers.reduce((sum, value) => sum + value, 0));
  const counted = winners.length + losers.length;
  const pnl = pnls.reduce((sum, value) => sum + value, 0);

  return {
    trades: trades.length,
    fills,
    wins: winners.length,
    losses: losers.length,
    grossWins,
    grossLosses,
    accuracy: counted === 0 ? null : Math.round((winners.length / counted) * 100),
    profitFactor: grossLosses === 0 ? null : grossWins / grossLosses,
    pnl,
  };
}

function summarizeDays(days: ReviewData[]): ReviewSummary {
  const summary = days.reduce(
    (acc, data) => {
      acc.trades += data.day.trades;
      acc.fills += data.day.fills;
      acc.wins += data.day.wins;
      acc.losses += data.day.losses;
      acc.grossWins += data.day.grossWins;
      acc.grossLosses += data.day.grossLosses;
      acc.pnl += data.day.pnl;
      return acc;
    },
    { trades: 0, fills: 0, wins: 0, losses: 0, grossWins: 0, grossLosses: 0, pnl: 0 },
  );
  const counted = summary.wins + summary.losses;

  return {
    ...summary,
    accuracy: counted === 0 ? null : Math.round((summary.wins / counted) * 100),
    profitFactor: summary.grossLosses === 0 ? null : summary.grossWins / summary.grossLosses,
  };
}

function fallbackData(dateOverride?: string): ReviewData {
  const date = validDate(dateOverride) ?? "2026-06-11";
  const rows = [
    { symbol: "PPCB", pnl: 5063, trades: 5 },
    { symbol: "GELS", pnl: 2814, trades: 4 },
    { symbol: "EDHL", pnl: 2701, trades: 3 },
    { symbol: "SMSI", pnl: 806, trades: 2 },
    { symbol: "CPOP", pnl: 476, trades: 2 },
    { symbol: "CHAI", pnl: -38, trades: 1 },
    { symbol: "HKIT", pnl: -153, trades: 2 },
    { symbol: "NTCL", pnl: -837, trades: 3 },
    { symbol: "ADIL", pnl: -1016, trades: 4 },
    { symbol: "BYAH", pnl: -1133, trades: 2 },
    { symbol: "RUBI", pnl: -1282, trades: 3 },
  ];

  return {
    day: {
      date,
      label: dayFmt.format(utcDate(date)),
      displayDate: dateFmt.format(utcDate(date)),
      trades: 31,
      fills: 78,
      wins: 5,
      losses: 7,
      grossWins: 11160,
      grossLosses: 7597,
      accuracy: 42,
      profitFactor: 1.47,
      pnl: 7400.22,
      journalHref: `/journal?preset=today&from=${date}`,
    },
    tickerRows: rows,
    pnlPoints: [
      { time: "9:00", value: 0 },
      { time: "10:00", value: 3000 },
      { time: "11:00", value: 8500 },
      { time: "12:00", value: 10300 },
      { time: "13:00", value: 7400 },
      { time: "15:00", value: 8000 },
      { time: "18:30", value: 7400 },
    ],
  };
}

async function latestTradeDate(): Promise<string | undefined> {
  const latest = (
    await db
      .select({ entryAt: schema.trades.entryAt })
      .from(schema.trades)
      .orderBy(desc(schema.trades.entryAt))
      .limit(1)
  )[0];

  return latest?.entryAt == null ? undefined : etDateString(latest.entryAt);
}

function rangeForPreset(preset: ReviewPreset, anchor: string): { from: string; to: string } {
  if (preset === "today") return { from: anchor, to: anchor };
  if (preset === "week") {
    const weekStart = weekStartFor(anchor);
    return { from: weekStart, to: isoAddDays(weekStart, 4) };
  }

  return { from: `${anchor.slice(0, 7)}-01`, to: lastDayOfMonth(anchor) };
}

function buildDayData(date: string, trades: TradeRow[], executions: ExecutionRow[]): ReviewData {
  const executionCountByTrade = new Map<number, number>();
  executions.forEach((execution) => {
    if (execution.tradeId == null) return;
    executionCountByTrade.set(execution.tradeId, (executionCountByTrade.get(execution.tradeId) ?? 0) + 1);
  });

  const summary = summarizeTrades(
    trades,
    trades.reduce((sum, trade) => sum + (executionCountByTrade.get(trade.id) ?? 0), 0),
  );
  const tickers = new Map<string, TickerRow>();

  trades.forEach((trade) => {
    const current = tickers.get(trade.symbol) ?? { symbol: trade.symbol, pnl: 0, trades: 0 };
    current.pnl += netPnl(trade) ?? 0;
    current.trades += 1;
    tickers.set(trade.symbol, current);
  });

  const { start } = etDayRange(date);
  let cumulative = 0;
  const pnlPoints: PnlPoint[] = [{ time: formatTime(trades[0]?.entryAt ?? start), value: 0 }];
  trades
    .filter((trade) => trade.exitAt != null)
    .sort((a, b) => (a.exitAt ?? 0) - (b.exitAt ?? 0))
    .forEach((trade) => {
      cumulative += netPnl(trade) ?? 0;
      pnlPoints.push({ time: formatTime(trade.exitAt ?? trade.entryAt ?? start), value: cumulative });
    });

  if (pnlPoints.length === 1) {
    pnlPoints.push({ time: formatTime(trades.at(-1)?.entryAt ?? start), value: summary.pnl });
  }

  return {
    day: {
      date,
      label: dayFmt.format(utcDate(date)),
      displayDate: dateFmt.format(utcDate(date)),
      journalHref: `/journal?preset=today&from=${date}`,
      ...summary,
    },
    tickerRows: [...tickers.values()].sort((a, b) => b.pnl - a.pnl),
    pnlPoints,
  };
}

async function loadReviewRange({
  preset,
  date,
  from,
}: {
  preset: ReviewPreset;
  date?: string;
  from?: string;
}): Promise<ReviewRange> {
  const explicitDate = validDate(date);
  const anchor = explicitDate ?? validDate(from) ?? (await latestTradeDate()) ?? "2026-06-11";
  const range = rangeForPreset(preset, anchor);
  const { start } = etDayRange(range.from);
  const { end } = etDayRange(range.to);
  const trades = (
    await db
      .select()
      .from(schema.trades)
      .where(and(gte(schema.trades.entryAt, start), lte(schema.trades.entryAt, end)))
      .orderBy(asc(schema.trades.entryAt))
  ).filter((trade) => {
    if (trade.entryAt == null) return false;
    const entryDate = etDateString(trade.entryAt);
    return entryDate >= range.from && entryDate <= range.to;
  });

  if (trades.length === 0) {
    const fallback = fallbackData(anchor);
    const summary = summarizeDays([fallback]);
    return {
      ...summary,
      preset,
      anchor,
      title: preset === "month" ? monthFmt.format(utcDate(anchor)) : fallback.day.label,
      eyebrow: "Trades Review",
      displayDate: fallback.day.displayDate,
      days: [fallback],
      weeks: [],
    };
  }

  const tradeIds = trades.map((trade) => trade.id);
  const executions =
    tradeIds.length > 0
      ? await db
          .select()
          .from(schema.executions)
          .where(inArray(schema.executions.tradeId, tradeIds))
          .orderBy(asc(schema.executions.executedAt))
      : [];
  const tradesByDate = new Map<string, TradeRow[]>();
  const executionsByDate = new Map<string, ExecutionRow[]>();

  trades.forEach((trade) => {
    if (trade.entryAt == null) return;
    const key = etDateString(trade.entryAt);
    tradesByDate.set(key, [...(tradesByDate.get(key) ?? []), trade]);
  });
  executions.forEach((execution) => {
    const key = etDateString(execution.executedAt);
    executionsByDate.set(key, [...(executionsByDate.get(key) ?? []), execution]);
  });

  const days = [...tradesByDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([entryDate, dayTrades]) => buildDayData(entryDate, dayTrades, executionsByDate.get(entryDate) ?? []));
  const weeksByStart = new Map<string, ReviewData[]>();

  days.forEach((day) => {
    const key = weekStartFor(day.day.date);
    weeksByStart.set(key, [...(weeksByStart.get(key) ?? []), day]);
  });

  const weeks: ReviewWeek[] = [...weeksByStart.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, weekDays]) => ({
      key,
      label: monthWeekLabel(key),
      displayDate: weekRangeLabel(key),
      days: weekDays,
      ...summarizeDays(weekDays),
    }));
  const summary = summarizeDays(days);
  const firstDay = days[0]?.day;

  return {
    ...summary,
    preset,
    anchor,
    title:
      preset === "month"
        ? monthFmt.format(utcDate(range.from))
        : preset === "week"
          ? `${monthWeekLabel(range.from)}`
          : firstDay?.label ?? dayFmt.format(utcDate(anchor)),
    eyebrow: "Trades Review",
    displayDate:
      preset === "month"
        ? monthFmt.format(utcDate(range.from))
        : preset === "week"
          ? weekRangeLabel(range.from)
          : firstDay?.displayDate ?? dateFmt.format(utcDate(anchor)),
    days,
    weeks,
  };
}

async function loadReviewArchive(anchor: string): Promise<ReviewArchive> {
  const selectedMonthKey = anchor.slice(0, 7);
  const selectedWeekKey = weekStartFor(anchor);
  const rows = await db
    .select({ entryAt: schema.trades.entryAt })
    .from(schema.trades)
    .limit(10000);

  const monthKeys = new Set<string>([selectedMonthKey]);
  const yearKeys = new Set<string>();

  for (const row of rows) {
    if (row.entryAt == null) continue;
    const date = etDateString(row.entryAt);
    const year = date.slice(0, 4);
    if (year === selectedMonthKey.slice(0, 4)) {
      monthKeys.add(date.slice(0, 7));
    } else {
      yearKeys.add(year);
    }
  }

  const months = [...monthKeys]
    .sort((a, b) => b.localeCompare(a))
    .map((key) => ({
      key,
      label: monthFmt.format(utcDate(`${key}-01`)).replace(/\s+\d{4}$/, ""),
      active: key === selectedMonthKey,
      href: reviewHref({ preset: "month", from: `${key}-01` }),
      weeks: key === selectedMonthKey ? archiveWeeks(key, selectedWeekKey) : [],
    }));

  const years = [...yearKeys].sort((a, b) => b.localeCompare(a)).map((year) => ({
    key: year,
    label: year,
    href: reviewHref({ preset: "month", from: `${year}-01-01` }),
  }));

  return { months, years };
}

function MetricLine({ summary }: { summary: ReviewSummary }) {
  const stats = [
    { label: null, value: `${summary.trades.toLocaleString()} trades` },
    { label: null, value: summary.accuracy == null ? "- win" : `${summary.accuracy}% win` },
    { label: "PF", value: formatProfitFactor(summary.profitFactor) },
    { label: "P&L", value: formatMoney(summary.pnl), className: pnlClass(summary.pnl) },
  ];

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] font-medium text-[var(--muted)]">
      {stats.map((stat, index) => (
        <span key={`${stat.label ?? "metric"}-${stat.value}`} className="flex items-center gap-x-3">
          {index > 0 ? <span className="text-[var(--faint)]">·</span> : null}
          <span className={`tabular-nums ${stat.className ?? ""}`}>
            {stat.label ? `${stat.label} ${stat.value}` : stat.value}
          </span>
        </span>
      ))}
    </div>
  );
}

function RunningPnlChart({ day, pnlPoints }: { day: ReviewDay; pnlPoints: PnlPoint[] }) {
  const width = 940;
  const height = 440;
  const pad = { top: 24, right: 26, bottom: 58, left: 70 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const values = pnlPoints.map((point) => point.value);
  const minValue = Math.min(0, ...values);
  const maxValue = Math.max(0, ...values);
  const range = Math.max(1, maxValue - minValue);
  const min = minValue - range * 0.18;
  const max = maxValue + range * 0.18;
  const y = (value: number) => pad.top + ((max - value) / (max - min)) * plotH;
  const x = (index: number) => pad.left + (index / Math.max(1, pnlPoints.length - 1)) * plotW;
  const line = pnlPoints.map((point, index) => `${x(index)},${y(point.value)}`).join(" ");
  const area = `${pad.left},${y(0)} ${line} ${x(pnlPoints.length - 1)},${y(0)}`;
  const ticks = [minValue, minValue + range / 2, maxValue];
  const labelIndexes = Array.from(
    new Set([
      0,
      Math.floor((pnlPoints.length - 1) * 0.33),
      Math.floor((pnlPoints.length - 1) * 0.66),
      pnlPoints.length - 1,
    ]),
  );
  const zeroY = y(0);
  const positiveFillId = `pnlPositiveFill-${day.date}`;
  const negativeFillId = `pnlNegativeFill-${day.date}`;
  const positiveClipId = `pnlPositiveClip-${day.date}`;
  const negativeClipId = `pnlNegativeClip-${day.date}`;

  return (
    <section className="flex h-[380px] flex-col rounded-md bg-[#14171a] px-4 py-4">
      <div className="mb-1 flex items-center justify-between gap-4">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Running P&L
        </h2>
        <span className={`font-mono text-sm font-semibold tabular-nums ${pnlClass(day.pnl)}`}>
          {formatMoney(day.pnl)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="min-h-0 flex-1" role="img" aria-label="Running P&L by time of day">
        <defs>
          <linearGradient id={positiveFillId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.36" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id={negativeFillId} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--red)" stopOpacity="0.08" />
            <stop offset="100%" stopColor="var(--red)" stopOpacity="0.36" />
          </linearGradient>
          <clipPath id={positiveClipId}>
            <rect x={pad.left} y={pad.top} width={plotW} height={Math.max(0, zeroY - pad.top)} />
          </clipPath>
          <clipPath id={negativeClipId}>
            <rect x={pad.left} y={zeroY} width={plotW} height={Math.max(0, height - pad.bottom - zeroY)} />
          </clipPath>
        </defs>
        {ticks.map((tick, index) => (
          <g key={`${tick}-${index}`}>
            <line x1={pad.left} x2={width - pad.right} y1={y(tick)} y2={y(tick)} stroke="var(--hairline)" />
            <text
              x={pad.left - 10}
              y={y(tick) + 5}
              fill="var(--muted)"
              fontFamily="var(--font-mono)"
              fontSize="13"
              fontWeight="500"
              textAnchor="end"
            >
              {formatMoney(tick).replace("+", "")}
            </text>
          </g>
        ))}
        <line
          x1={pad.left}
          x2={width - pad.right}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--muted)"
          strokeDasharray="5 7"
          strokeOpacity="0.7"
        />
        <polygon points={area} fill={`url(#${positiveFillId})`} clipPath={`url(#${positiveClipId})`} />
        <polygon points={area} fill={`url(#${negativeFillId})`} clipPath={`url(#${negativeClipId})`} />
        <polyline
          points={line}
          fill="none"
          stroke="var(--green)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          clipPath={`url(#${positiveClipId})`}
        />
        <polyline
          points={line}
          fill="none"
          stroke="var(--red)"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          clipPath={`url(#${negativeClipId})`}
        />
        {labelIndexes.map((index) => (
          <text
            key={`${index}-${pnlPoints[index].time}`}
            x={x(index)}
            y={height - 16}
            fill="var(--muted)"
            fontFamily="var(--font-mono)"
            fontSize="13"
            fontWeight="500"
            textAnchor="middle"
          >
            {pnlPoints[index].time}
          </text>
        ))}
      </svg>
    </section>
  );
}

function DayReviewSection({
  data,
  returnTo,
  showDivider = true,
}: {
  data: ReviewData;
  returnTo: string;
  showDivider?: boolean;
}) {
  const { day, tickerRows, pnlPoints } = data;

  return (
    <section className={showDivider ? "border-t border-[var(--hairline)] pt-7" : ""}>
      <div className="grid grid-cols-[8px_minmax(0,1fr)] gap-x-4">
        <span
          className={`mt-2.5 size-2 rounded-full ${
            day.pnl >= 0 ? "bg-[var(--green)]" : "bg-[var(--red)]"
          }`}
        />
        <div className="min-w-0">
          <div className="mb-6 space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
              <h2 className="text-[24px] font-semibold leading-none tracking-[-0.01em] text-[var(--foreground)]">
                {day.label}
              </h2>
              <span className="font-mono text-sm text-[var(--muted)]">{shortDateFmt.format(utcDate(day.date))}</span>
            </div>
            <MetricLine summary={day} />
          </div>

          <div className="grid max-w-[665px] gap-6 lg:grid-cols-[minmax(0,1fr)_200px] lg:items-start">
            <RunningPnlChart day={day} pnlPoints={pnlPoints} />
            <TickerReviewRail
              rows={tickerRows.map((row) => ({
                symbol: row.symbol,
                pnl: row.pnl,
                href: `/trades/review?date=${day.date}&symbol=${row.symbol}&returnTo=${encodeURIComponent(returnTo)}`,
              }))}
              accuracy={day.accuracy}
              profitFactor={day.profitFactor}
              pnl={day.pnl}
            />
          </div>

          <div className="mt-5">
            <Link href={day.journalHref} className="font-mono text-[12px] text-[var(--blue)] hover:underline">
              View day note
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function RangeHeader({ range }: { range: ReviewRange }) {
  return (
    <div className="space-y-4">
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
        {range.eyebrow}
      </div>
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h1 className="text-5xl font-semibold leading-none tracking-[-0.03em] text-[var(--foreground)]">
            {range.title}
          </h1>
          {range.preset !== "month" ? (
            <span className="font-mono text-base text-[var(--muted)]">{range.displayDate}</span>
          ) : null}
        </div>
        <MetricLine summary={range} />
      </div>
    </div>
  );
}

function WeekSection({ week, returnTo }: { week: ReviewWeek; returnTo: string }) {
  return (
    <section className="space-y-8 border-t border-[var(--hairline)] pt-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <h2 className="text-[28px] font-semibold leading-none tracking-[-0.02em] text-[var(--foreground)]">
            {week.label}
          </h2>
          <span className="font-mono text-sm text-[var(--muted)]">{week.displayDate}</span>
        </div>
        <MetricLine summary={week} />
      </div>

      <div className="space-y-12">
        {week.days.map((dayData, index) => (
          <DayReviewSection
            key={dayData.day.date}
            data={dayData}
            returnTo={returnTo}
            showDivider={index > 0}
          />
        ))}
      </div>
    </section>
  );
}

function reviewHref({
  preset,
  date,
  from,
}: {
  preset: ReviewPreset;
  date?: string;
  from?: string;
}) {
  const params = new URLSearchParams();
  params.set("preset", preset);
  params.set("view", "review");
  params.set("sort", "date");
  params.set("dir", "desc");
  if (date) params.set("date", date);
  if (from) params.set("from", from);
  return `/trades?${params.toString()}`;
}

function TradeReviewSidebar({ archive }: { archive: ReviewArchive }) {
  return (
    <ArchiveSidebar
      ariaLabel="Trade review archive"
      months={archive.months}
      years={archive.years}
      offsetClassName="md:pt-[5.75rem]"
    />
  );
}

export default async function TradeReview({
  preset = "month",
  date,
  from,
  returnTo = "/trades",
  backHref,
}: {
  preset?: ReviewPreset;
  date?: string;
  from?: string;
  returnTo?: string;
  backHref?: string;
}) {
  const range = await loadReviewRange({ preset, date, from });
  const archive = await loadReviewArchive(range.anchor);

  return (
    <div className="mx-auto w-full max-w-[905px] pb-24">
      {backHref ? (
        <Link
          href={backHref}
          className="inline-flex h-9 items-center rounded-md border border-[var(--border)] px-3 font-mono text-[12px] font-semibold text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--foreground)]"
        >
          Back
        </Link>
      ) : null}

      <div className="grid gap-8 md:grid-cols-[180px_minmax(0,665px)] xl:grid-cols-[200px_minmax(0,665px)] xl:gap-10">
        <TradeReviewSidebar archive={archive} />
        <div className="min-w-0 space-y-8">
          <RangeHeader range={range} />

          {preset === "month" ? (
            <div className="space-y-14">
              {range.weeks.map((week) => (
                <WeekSection key={week.key} week={week} returnTo={returnTo} />
              ))}
            </div>
          ) : preset === "week" ? (
            <div className="space-y-12 border-t border-[var(--hairline)] pt-8">
              {range.days.map((dayData, index) => (
                <DayReviewSection
                  key={dayData.day.date}
                  data={dayData}
                  returnTo={returnTo}
                  showDivider={index > 0}
                />
              ))}
            </div>
          ) : (
            <DayReviewSection data={range.days[0] ?? fallbackData(range.anchor)} returnTo={returnTo} />
          )}

          <section className="border-t border-[var(--hairline)] pt-6">
            <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              AI Review
            </h2>
            <p className="mt-4 max-w-[760px] text-sm leading-6 text-[var(--body)]">
              AI review will summarize what drove the selected period after notes are added. It
              should interpret the ticker attribution, P&L path, accuracy, and profit factor
              instead of repeating the same stats shown above.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
