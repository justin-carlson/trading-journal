import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { isDemoReadOnly } from "@/lib/demoMode";
import { netPnl } from "@/lib/pnl";
import { etDateString, etDayRange } from "@/lib/time";
import ArchiveSidebar, { type ArchiveSidebarMonth } from "@/components/ArchiveSidebar";
import Breadcrumbs, { originCrumbFromHref } from "@/components/Breadcrumbs";
import InlineImportPrompt from "@/components/InlineImportPrompt";
import RecapNote from "@/components/RecapNote";
import TickerReviewRail from "@/components/TickerReviewRail";

export type JournalReviewPreset = "today" | "week" | "month";
export type JournalReviewSearchParams = {
  date?: string;
  preset?: string;
  from?: string;
  month?: string;
};

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
  preset: JournalReviewPreset;
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

const monthDayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
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
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
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

function validMonth(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}$/.test(value) ? value : undefined;
}

export function parseJournalReviewSearchParams(params: JournalReviewSearchParams): {
  preset: JournalReviewPreset;
  date?: string;
  from?: string;
  month?: string;
} {
  const presetOptions = new Set<JournalReviewPreset>(["today", "week", "month"]);
  const date = validDate(params.date);
  return {
    preset: date
      ? "today"
      : presetOptions.has(params.preset as JournalReviewPreset)
        ? (params.preset as JournalReviewPreset)
        : "month",
    date,
    from: validDate(params.from),
    month: validMonth(params.month),
  };
}

export function journalReviewHref(
  basePath: string,
  {
    preset,
    date,
    from,
    month,
  }: {
    preset: JournalReviewPreset;
    date?: string;
    from?: string;
    month?: string;
  },
) {
  const params = new URLSearchParams();
  if (preset !== "month") params.set("preset", preset);
  if (date) params.set("date", date);
  if (from) params.set("from", from);
  if (month) params.set("month", month);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
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

function weekRangeLabel(weekStart: string): string {
  const weekEnd = isoAddDays(weekStart, 4);
  const year = weekEnd.slice(0, 4);
  return `${monthDayFmt.format(utcDate(weekStart))} - ${monthDayFmt.format(utcDate(weekEnd))} ${year}`;
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

function journalWeekSectionId(weekKey: string): string {
  return `journal-week-${weekKey}`;
}

function archiveWeeks(monthKey: string, activeWeekKey: string | undefined, basePath: string): ArchiveSidebarMonth["weeks"] {
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
        href: journalReviewHref(basePath, { preset: "week", from: weekStart, month: monthKey }),
        sectionId: journalWeekSectionId(weekStart),
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

function currentEtDate(): string {
  return etDateString(Math.floor(Date.now() / 1000));
}

function rangeForPreset(preset: JournalReviewPreset, anchor: string): { from: string; to: string } {
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
  month,
  accountId,
}: {
  preset: JournalReviewPreset;
  date?: string;
  from?: string;
  month?: string;
  accountId: number;
}): Promise<ReviewRange> {
  const explicitDate = validDate(date);
  const anchor = explicitDate ?? validDate(from) ?? currentEtDate();
  const range = rangeForPreset(preset, anchor);
  const selectedMonthKey = month ?? range.from.slice(0, 7);
  const { start } = etDayRange(range.from);
  const { end } = etDayRange(range.to);
  const trades = (
    await db
      .select()
      .from(schema.trades)
      .where(and(eq(schema.trades.accountId, accountId), gte(schema.trades.entryAt, start), lte(schema.trades.entryAt, end)))
      .orderBy(asc(schema.trades.entryAt))
  ).filter((trade) => {
    if (trade.entryAt == null) return false;
    const entryDate = etDateString(trade.entryAt);
    return entryDate >= range.from && entryDate <= range.to;
  });

  if (trades.length === 0) {
    const summary = summarizeDays([]);
    return {
      ...summary,
      preset,
      anchor,
      title:
        preset === "month"
          ? monthFmt.format(utcDate(range.from))
          : preset === "week"
            ? archiveWeekLabel(selectedMonthKey, range.from)
            : dayFmt.format(utcDate(anchor)),
      eyebrow: "Trade Journal",
      displayDate:
        preset === "month"
          ? monthFmt.format(utcDate(range.from))
          : preset === "week"
            ? weekRangeLabel(range.from)
            : dateFmt.format(utcDate(anchor)),
      days: [],
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
      label: archiveWeekLabel(preset === "month" ? range.from.slice(0, 7) : selectedMonthKey, key),
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
          ? archiveWeekLabel(selectedMonthKey, range.from)
          : firstDay?.label ?? dayFmt.format(utcDate(anchor)),
    eyebrow: "Trade Journal",
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

async function loadReviewArchive(anchor: string, accountId: number, basePath: string, month?: string): Promise<ReviewArchive> {
  const selectedMonthKey = month ?? anchor.slice(0, 7);
  const selectedWeekKey = weekStartFor(anchor);
  const rows = await db
    .select({ entryAt: schema.trades.entryAt })
    .from(schema.trades)
    .where(eq(schema.trades.accountId, accountId))
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
      href: journalReviewHref(basePath, { preset: "month", from: `${key}-01` }),
      weeks: key === selectedMonthKey ? archiveWeeks(key, selectedWeekKey, basePath) : [],
    }));

  const years = [...yearKeys].sort((a, b) => b.localeCompare(a)).map((year) => ({
    key: year,
    label: year,
    href: journalReviewHref(basePath, { preset: "month", from: `${year}-01-01` }),
  }));

  return { months, years };
}

async function loadDayRecaps(accountId: number, dates: string[]): Promise<Map<string, string>> {
  if (dates.length === 0) return new Map();

  const rows = await db
    .select({
      scopeKey: schema.journalEntries.scopeKey,
      thesis: schema.journalEntries.thesis,
      lessons: schema.journalEntries.lessons,
    })
    .from(schema.journalEntries)
    .where(
      and(
        eq(schema.journalEntries.accountId, accountId),
        eq(schema.journalEntries.scope, "day"),
        inArray(schema.journalEntries.scopeKey, dates),
      ),
    );

  const recaps = new Map<string, string>();
  rows.forEach((row) => {
    if (row.scopeKey) recaps.set(row.scopeKey, row.lessons ?? row.thesis ?? "");
  });
  return recaps;
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
  const pad = { top: 24, right: 26, bottom: 58, left: 128 };
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
    <section className="flex h-[380px] flex-col rounded-[6px] bg-[#1a2432] px-4 py-4">
      <div className="mb-1 flex items-center justify-between gap-4">
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Daily P&L
        </h2>
        <span className={`font-mono text-sm font-semibold tabular-nums ${pnlClass(day.pnl)}`}>
          {formatMoney(day.pnl)}
        </span>
      </div>
      <svg viewBox={`0 0 ${width} ${height}`} className="min-h-0 flex-1" role="img" aria-label="Daily P&L by time of day">
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
              fill="var(--body)"
              fontFamily="var(--font-mono)"
              fontSize="20"
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
            fill="var(--body)"
            fontFamily="var(--font-mono)"
            fontSize="20"
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
  recaps,
  returnTo,
  showMetrics = true,
}: {
  data: ReviewData;
  recaps: Map<string, string>;
  returnTo: string;
  showMetrics?: boolean;
}) {
  const { day, tickerRows, pnlPoints } = data;

  return (
    <section>
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
                {monthDayFmt.format(utcDate(day.date))}
              </h2>
              <span className="font-mono text-sm text-[var(--muted)]">{day.label}</span>
            </div>
            {showMetrics ? <MetricLine summary={day} /> : null}
          </div>

          <div className="mb-6 max-w-[665px] text-[15px] leading-6 text-[var(--body)]">
            <RecapNote
              scope="day"
              scopeKey={day.date}
              text={recaps.get(day.date) ?? ""}
              placeholder="Add a daily recap: market read, execution quality, emotions, what worked, and what to tighten next session."
            />
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
        </div>
      </div>
    </section>
  );
}

function WeekHeader({
  label,
  displayDate,
}: {
  label: string;
  displayDate: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 font-mono text-sm font-semibold text-[var(--muted)]">
      <h2 className="text-sm font-semibold leading-none">
        {label}
      </h2>
      <span aria-hidden="true" className="text-[var(--faint)]">·</span>
      <span>{displayDate}</span>
    </div>
  );
}

function ScopeHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      {children}
      <div className="h-px bg-[var(--hairline)]" />
    </div>
  );
}

function todayDisplayDate(range: ReviewRange): string {
  return (range.days[0]?.day.displayDate ?? range.displayDate).replace(",", "");
}

function WeekSection({
  week,
  recaps,
  returnTo,
}: {
  week: ReviewWeek;
  recaps: Map<string, string>;
  returnTo: string;
}) {
  return (
    <section id={journalWeekSectionId(week.key)} className="scroll-mt-28 space-y-8">
      <ScopeHeader>
        <WeekHeader label={week.label} displayDate={week.displayDate} />
      </ScopeHeader>

      <div className="space-y-12">
        {week.days.map((dayData) => (
          <DayReviewSection
            key={dayData.day.date}
            data={dayData}
            recaps={recaps}
            returnTo={returnTo}
          />
        ))}
      </div>
    </section>
  );
}

function TradeReviewSidebar({
  archive,
  todayHref,
  todayActive = false,
  enableWeekScrollSpy = false,
}: {
  archive: ReviewArchive;
  todayHref: string;
  todayActive?: boolean;
  enableWeekScrollSpy?: boolean;
}) {
  return (
    <ArchiveSidebar
      ariaLabel="Journal archive"
      topLinks={[{ key: "today", label: "Today", href: todayHref, active: todayActive }]}
      months={archive.months}
      years={archive.years}
      offsetClassName="md:pt-[5.75rem]"
      enableWeekScrollSpy={enableWeekScrollSpy}
    />
  );
}

function EmptyReviewState() {
  const readOnly = isDemoReadOnly();

  return (
    <section className="space-y-3">
      <p className="max-w-[460px] text-sm leading-6 text-[var(--body)]">
        No trades for this account in the selected period yet.
      </p>
      <InlineImportPrompt readOnly={readOnly} />
    </section>
  );
}

export default async function TradeJournalReview({
  preset = "month",
  date,
  from,
  month,
  basePath = "/journal",
  returnTo,
  backHref,
  accountId,
}: {
  preset?: JournalReviewPreset;
  date?: string;
  from?: string;
  month?: string;
  basePath?: string;
  returnTo?: string;
  backHref?: string;
  accountId: number;
}) {
  const archiveAnchor = validDate(date) ?? validDate(from) ?? currentEtDate();
  const [range, archive] = await Promise.all([
    loadReviewRange({ preset, date, from, month, accountId }),
    loadReviewArchive(archiveAnchor, accountId, basePath, month),
  ]);
  const recaps = await loadDayRecaps(accountId, range.days.map((day) => day.day.date));
  const currentHref = returnTo ?? journalReviewHref(basePath, { preset, date, from, month });
  const breadcrumbBack = backHref
    ? originCrumbFromHref(backHref, basePath)
    : { label: "Journal", href: basePath };

  return (
    <div className="mx-auto w-full max-w-[905px] pb-24">
      <Breadcrumbs
        back={breadcrumbBack}
        current={preset === "today" && !backHref ? undefined : range.title}
        className="mb-10"
      />

      <div className="grid gap-8 md:grid-cols-[180px_minmax(0,665px)] xl:grid-cols-[200px_minmax(0,665px)] xl:gap-10">
        <TradeReviewSidebar
          archive={archive}
          todayHref={journalReviewHref(basePath, { preset: "today" })}
          todayActive={preset === "today"}
          enableWeekScrollSpy={preset === "month"}
        />
        <div className="min-w-0 space-y-8">
          {preset === "week" ? (
            <ScopeHeader>
              <WeekHeader label={range.title} displayDate={range.displayDate} />
            </ScopeHeader>
          ) : null}
          {preset === "today" ? (
            <ScopeHeader>
              <WeekHeader label="Today" displayDate={todayDisplayDate(range)} />
            </ScopeHeader>
          ) : null}

          {range.trades === 0 ? (
            <EmptyReviewState />
          ) : preset === "month" ? (
            <div className="space-y-14">
              {range.weeks.map((week) => (
                <WeekSection key={week.key} week={week} recaps={recaps} returnTo={currentHref} />
              ))}
            </div>
          ) : preset === "week" ? (
            <div className="space-y-12">
              {range.days.map((dayData) => (
                <DayReviewSection
                  key={dayData.day.date}
                  data={dayData}
                  recaps={recaps}
                  returnTo={currentHref}
                />
              ))}
            </div>
          ) : (
            <DayReviewSection data={range.days[0]} recaps={recaps} returnTo={currentHref} />
          )}

          {range.trades > 0 ? (
            <section className="pt-2">
              <h2 className="font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
                AI Review
              </h2>
              <p className="mt-4 max-w-[760px] text-sm leading-6 text-[var(--body)]">
                AI review will summarize what drove the selected period after notes are added. It
                should interpret the ticker attribution, P&L path, accuracy, and profit factor
                instead of repeating the same stats shown above.
              </p>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
