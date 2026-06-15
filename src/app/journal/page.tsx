import Link from "next/link";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getActiveAccount } from "@/lib/accountScope";
import { fmtMoney } from "@/lib/format";
import { netPnl } from "@/lib/pnl";
import { etDateString, etDayRange } from "@/lib/time";
import RecapNote from "@/components/RecapNote";
import TradeJournalNote from "@/components/TradeJournalNote";
import ArchiveSidebar from "@/components/ArchiveSidebar";
import { decodeJournalTags, journalLabelTone } from "@/lib/journalLabels";

export const dynamic = "force-dynamic";

type DatePreset = "all" | "today" | "week" | "month" | "custom";

type JournalFilters = {
  date?: string;
  preset: DatePreset;
  from?: string;
  to?: string;
};

type JournalTrade = typeof schema.trades.$inferSelect & {
  pnl: number | null;
  notes: {
    id: number;
    text: string;
    primaryLabel: string | null;
    processTags: string[];
    emotionTags: string[];
  }[];
};

type JournalDay = {
  date: string;
  trades: JournalTrade[];
  pnl: number;
  noteCount: number;
};

type JournalWeek = {
  key: string;
  label: string;
  rangeLabel: string;
  days: JournalDay[];
  pnl: number;
  trades: number;
  noteCount: number;
};

type JournalMonth = {
  key: string;
  label: string;
  weeks: JournalWeek[];
  pnl: number;
  trades: number;
  noteCount: number;
};

type ArchiveMonth = {
  key: string;
  label: string;
  active: boolean;
  weeks: {
    key: string;
    label: string;
    rangeLabel: string;
    active: boolean;
  }[];
};

type JournalArchive = {
  months: ArchiveMonth[];
  years: string[];
};

function validDate(value: string | undefined): string | undefined {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
}

function parseSearchParams(params: {
  date?: string;
  preset?: string;
  from?: string;
  to?: string;
}): JournalFilters {
  const presetOptions = new Set<DatePreset>(["all", "today", "week", "month", "custom"]);
  return {
    date: validDate(params.date),
    preset: presetOptions.has(params.preset as DatePreset) ? (params.preset as DatePreset) : "month",
    from: validDate(params.from),
    to: validDate(params.to),
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

function dateRangeFor(filters: JournalFilters): { from: string; to: string } | undefined {
  if (filters.date) return { from: filters.date, to: filters.date };

  const today = currentEtDate();
  const anchor = filters.from ?? today;
  if (filters.preset === "today") return { from: anchor, to: anchor };
  if (filters.preset === "week") {
    const monday = isoAddDays(anchor, -((isoWeekday(anchor) + 6) % 7));
    return { from: monday, to: isoAddDays(monday, 4) };
  }
  if (filters.preset === "month") return { from: `${anchor.slice(0, 7)}-01`, to: lastDayOfMonth(anchor) };
  if (filters.preset === "custom") {
    if (!filters.from && !filters.to) return undefined;
    return {
      from: filters.from ?? "0000-01-01",
      to: filters.to ?? "9999-12-31",
    };
  }
  return undefined;
}

function filterHref(filters: JournalFilters, updates: Partial<JournalFilters>) {
  const next = { ...filters, ...updates };
  const params = new URLSearchParams();
  if (next.date) params.set("date", next.date);
  if (next.preset !== "all") params.set("preset", next.preset);
  if (next.from) params.set("from", next.from);
  if (next.to) params.set("to", next.to);
  const query = params.toString();
  return query ? `/journal?${query}` : "/journal";
}

const dateLabelNoYearFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
});

const monthLabelFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  year: "numeric",
});

const dayOnlyLabelFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "long",
  day: "numeric",
});

const weekdayLabelFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  weekday: "long",
});

function dateLabelNoYear(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return dateLabelNoYearFmt.format(new Date(Date.UTC(year, month - 1, day)));
}

function dateYear(date: string): string {
  return date.slice(0, 4);
}

function weekRangeLabel(weekStart: string): string {
  const weekEnd = isoAddDays(weekStart, 4);
  return `${dateLabelNoYear(weekStart)} - ${dateLabelNoYear(weekEnd)}, ${dateYear(weekEnd)}`;
}

function dayOnlyLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return dayOnlyLabelFmt.format(new Date(Date.UTC(year, month - 1, day)));
}

function weekdayLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return weekdayLabelFmt.format(new Date(Date.UTC(year, month - 1, day)));
}

function monthLabel(monthKey: string): string {
  const [year, month] = monthKey.split("-").map(Number);
  return monthLabelFmt.format(new Date(Date.UTC(year, month - 1, 1)));
}

function weekKeyFor(date: string): string {
  return isoAddDays(date, -((isoWeekday(date) + 6) % 7));
}

function weekLabel(weekStart: string): string {
  const monthStart = `${weekStart.slice(0, 7)}-01`;
  const firstWeekStart = weekKeyFor(monthStart);
  const daysFromFirstWeek = Math.round((Date.parse(`${weekStart}T00:00:00Z`) - Date.parse(`${firstWeekStart}T00:00:00Z`)) / 86400000);
  return `Week ${Math.floor(daysFromFirstWeek / 7) + 1}`;
}

function pnlClass(value: number): string {
  if (value > 0) return "text-[var(--green)]";
  if (value < 0) return "text-[var(--red)]";
  return "text-[var(--muted)]";
}

function labelToneClass(value: string | null | undefined): string {
  const tone = journalLabelTone(value);
  if (tone === "positive") return "border-[var(--green)] text-[var(--green)]";
  if (tone === "negative") return "border-[var(--red)] text-[var(--red)]";
  return "border-[var(--border)] text-[var(--muted)]";
}

function pluralize(count: number, singular: string): string {
  return `${count} ${count === 1 ? singular : `${singular}s`}`;
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

function dayAccuracy(trades: JournalTrade[]): string {
  const wins = trades.filter((trade) => (trade.pnl ?? 0) > 0).length;
  const losses = trades.filter((trade) => (trade.pnl ?? 0) < 0).length;
  const counted = wins + losses;
  return counted === 0 ? "—" : formatPercent((wins / counted) * 100);
}

function dayProfitFactor(trades: JournalTrade[]): string {
  const grossWin = trades.reduce((sum, trade) => sum + Math.max(trade.pnl ?? 0, 0), 0);
  const grossLoss = Math.abs(trades.reduce((sum, trade) => sum + Math.min(trade.pnl ?? 0, 0), 0));
  if (grossWin === 0 && grossLoss === 0) return "—";
  if (grossLoss === 0) return "∞";
  return (grossWin / grossLoss).toFixed(2);
}

function metricLineValues(trades: JournalTrade[], pnl: number) {
  return {
    trades: pluralize(trades.length, "trade"),
    winRate: `${dayAccuracy(trades)} win`,
    profitFactor: `PF ${dayProfitFactor(trades)}`,
    pnl: fmtMoney(pnl),
  };
}

function MetricLine({ trades, pnl }: { trades: JournalTrade[]; pnl: number }) {
  const values = metricLineValues(trades, pnl);
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[13px] text-[var(--muted)]">
      <span>{values.trades}</span>
      <span aria-hidden="true">·</span>
      <span>{values.winRate}</span>
      <span aria-hidden="true">·</span>
      <span>{values.profitFactor}</span>
      <span aria-hidden="true">·</span>
      <span className={pnlClass(pnl)}>{values.pnl}</span>
    </div>
  );
}

function monthStart(monthKey: string): string {
  return `${monthKey}-01`;
}

function sidebarWeekRangeLabel(weekStart: string, monthKey: string): string {
  const start = weekStart < monthStart(monthKey) ? monthStart(monthKey) : weekStart;
  const endOfWeek = isoAddDays(weekStart, 4);
  const endOfMonth = lastDayOfMonth(monthStart(monthKey));
  const end = endOfWeek > endOfMonth ? endOfMonth : endOfWeek;
  return `${Number(start.slice(-2))}-${Number(end.slice(-2))}`;
}

function monthWeeks(monthKey: string, activeWeekKey: string): ArchiveMonth["weeks"] {
  const lastDay = lastDayOfMonth(monthStart(monthKey));
  let weekStart = weekKeyFor(monthStart(monthKey));
  const weeks: ArchiveMonth["weeks"] = [];

  while (weekStart <= lastDay) {
    const weekEnd = isoAddDays(weekStart, 4);
    const intersectsMonth = weekEnd >= monthStart(monthKey) && weekStart <= lastDay;
    if (intersectsMonth) {
      weeks.push({
        key: weekStart,
        label: weekLabel(weekStart),
        rangeLabel: sidebarWeekRangeLabel(weekStart, monthKey),
        active: weekStart === activeWeekKey,
      });
    }
    weekStart = isoAddDays(weekStart, 7);
  }

  return weeks;
}

function tradeNoteText(note: typeof schema.journalEntries.$inferSelect): string {
  return note.lessons || note.thesis || "";
}

/** Scoped recap notes (day/week/month) keyed by `${scope}:${scopeKey}`. */
async function loadRecaps(accountId: number): Promise<Map<string, string>> {
  const rows = await db
    .select({
      scope: schema.journalEntries.scope,
      scopeKey: schema.journalEntries.scopeKey,
      lessons: schema.journalEntries.lessons,
    })
    .from(schema.journalEntries)
    .where(and(eq(schema.journalEntries.accountId, accountId), inArray(schema.journalEntries.scope, ["day", "week", "month"])));

  const map = new Map<string, string>();
  for (const row of rows) {
    if (row.scopeKey) map.set(`${row.scope}:${row.scopeKey}`, row.lessons ?? "");
  }
  return map;
}

async function loadJournalTrades(filters: JournalFilters, accountId: number): Promise<JournalTrade[]> {
  const range = dateRangeFor(filters);
  const accountWhere = eq(schema.trades.accountId, accountId);
  const where =
    range
      ? (() => {
          const { start } = etDayRange(range.from);
          const { end } = etDayRange(range.to);
          return and(accountWhere, gte(schema.trades.entryAt, start), lte(schema.trades.entryAt, end));
        })()
      : accountWhere;

  let rows = await db.select().from(schema.trades).where(where).limit(2000);

  if (range) {
    rows = rows.filter((trade) => {
      if (trade.entryAt == null) return false;
      const entryDate = etDateString(trade.entryAt);
      return entryDate >= range.from && entryDate <= range.to;
    });
  }

  const noteRows = await db
    .select()
    .from(schema.journalEntries)
    .where(eq(schema.journalEntries.accountId, accountId))
    .orderBy(schema.journalEntries.createdAt);
  const notesByTrade = new Map<number, JournalTrade["notes"]>();
  for (const note of noteRows) {
    if (note.tradeId == null) continue; // standalone day/week/month notes aren't trade notes
    const text = tradeNoteText(note);
    const notes = notesByTrade.get(note.tradeId) ?? [];
    notes.push({
      id: note.id,
      text: text || "No note text.",
      primaryLabel: note.emotionalState,
      processTags: decodeJournalTags(note.whatWentWell),
      emotionTags: decodeJournalTags(note.whatWentWrong),
    });
    notesByTrade.set(note.tradeId, notes);
  }

  return rows
    .map((trade) => ({ ...trade, pnl: netPnl(trade), notes: notesByTrade.get(trade.id) ?? [] }))
    .sort((a, b) => (a.entryAt ?? 0) - (b.entryAt ?? 0));
}

async function loadJournalArchive(filters: JournalFilters, accountId: number): Promise<JournalArchive> {
  const selectedRange = dateRangeFor(filters);
  const selectedDate = selectedRange?.from ?? currentEtDate();
  const selectedMonthKey = selectedDate.slice(0, 7);
  const selectedWeekKey = weekKeyFor(selectedDate);

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
      label: monthLabel(key).replace(/ \d{4}$/, ""),
      active: key === selectedMonthKey,
      weeks: key === selectedMonthKey ? monthWeeks(key, selectedWeekKey) : [],
    }));

  const years = [...yearKeys].sort((a, b) => b.localeCompare(a));

  return { months, years };
}

function TagPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-[var(--border)] px-2 py-0.5 font-mono text-[11px] text-[var(--muted)]">
      {label}
    </span>
  );
}

function TradeNoteBlock({
  trade,
  note,
  returnTo,
}: {
  trade: JournalTrade;
  note: JournalTrade["notes"][number];
  returnTo: string;
}) {
  return (
    <article className="border-l border-[var(--border)] pl-5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="text-[15px] font-semibold text-[var(--foreground)]">
          {trade.symbol}
        </span>
        {note.primaryLabel ? (
          <span
            className={`rounded border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] ${labelToneClass(
              note.primaryLabel,
            )}`}
          >
            {note.primaryLabel}
          </span>
        ) : null}
      </div>
      <div className="mt-1.5">
        <TradeJournalNote
          noteId={note.id}
          tradeId={trade.id}
          symbol={trade.symbol}
          text={note.text}
          primaryLabel={note.primaryLabel}
          processTags={note.processTags}
          emotionTags={note.emotionTags}
        />
      </div>
      <Link
        href={`/trades/${trade.id}?returnTo=${encodeURIComponent(returnTo)}`}
        className="mt-3 inline-flex font-mono text-[12px] text-[var(--blue)] hover:underline"
      >
        View trade -&gt;
      </Link>
    </article>
  );
}

function groupJournal(trades: JournalTrade[], filters: JournalFilters): JournalMonth[] {
  const monthMap = new Map<string, JournalMonth>();
  const groupByWeekStart = !filters.date && filters.preset === "week";

  for (const trade of trades) {
    if (trade.entryAt == null) continue;
    const date = etDateString(trade.entryAt);
    const weekKey = weekKeyFor(date);
    const monthKey = groupByWeekStart ? weekKey.slice(0, 7) : date.slice(0, 7);
    const pnl = trade.pnl ?? 0;
    const noteCount = trade.notes.length;

    let month = monthMap.get(monthKey);
    if (!month) {
      month = { key: monthKey, label: monthLabel(monthKey), weeks: [], pnl: 0, trades: 0, noteCount: 0 };
      monthMap.set(monthKey, month);
    }

    let week = month.weeks.find((item) => item.key === weekKey);
    if (!week) {
      week = {
        key: weekKey,
        label: weekLabel(weekKey),
        rangeLabel: weekRangeLabel(weekKey),
        days: [],
        pnl: 0,
        trades: 0,
        noteCount: 0,
      };
      month.weeks.push(week);
    }

    let day = week.days.find((item) => item.date === date);
    if (!day) {
      day = { date, trades: [], pnl: 0, noteCount: 0 };
      week.days.push(day);
    }

    day.trades.push(trade);
    day.pnl += pnl;
    day.noteCount += noteCount;
    week.pnl += pnl;
    week.trades += 1;
    week.noteCount += noteCount;
    month.pnl += pnl;
    month.trades += 1;
    month.noteCount += noteCount;
  }

  return [...monthMap.values()]
    .sort((a, b) => b.key.localeCompare(a.key))
    .map((month) => ({
      ...month,
      weeks: month.weeks
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((week) => ({
          ...week,
          days: week.days.sort((a, b) => a.date.localeCompare(b.date)),
        })),
    }));
}

function CurrentShortcuts({ filters }: { filters: JournalFilters }) {
  const activePreset: DatePreset = filters.date ? "custom" : filters.preset;
  const presetBase = { date: undefined, from: undefined, to: undefined };
  const buttonClass = (preset: DatePreset) =>
    `inline-flex h-8 min-w-16 items-center justify-center rounded px-3 text-sm font-semibold transition-colors ${
      activePreset === preset
        ? "bg-[var(--surface-2)] text-[var(--foreground)]"
        : "text-[var(--muted)] hover:text-[var(--foreground)]"
    }`;

  return (
    <nav aria-label="Current journal shortcuts" className="inline-flex h-10 items-center rounded-md border border-[var(--border)] p-1">
      <Link href={filterHref(filters, { ...presetBase, preset: "today" })} className={buttonClass("today")}>Today</Link>
      <Link href={filterHref(filters, { ...presetBase, preset: "week" })} className={buttonClass("week")}>This week</Link>
      <Link href={filterHref(filters, { ...presetBase, preset: "month" })} className={buttonClass("month")}>This month</Link>
    </nav>
  );
}

function JournalSidebar({
  archive,
  filters,
}: {
  archive: JournalArchive;
  filters: JournalFilters;
}) {
  const months = archive.months.map((month) => ({
    key: month.key,
    label: month.label,
    active: month.active,
    href: filterHref(filters, {
      date: undefined,
      preset: "month",
      from: monthStart(month.key),
      to: undefined,
    }),
    weeks: month.weeks.map((week) => ({
      key: week.key,
      label: week.label,
      rangeLabel: week.rangeLabel,
      active: week.active,
      href: filterHref(filters, {
        date: undefined,
        preset: "week",
        from: week.key,
        to: undefined,
      }),
    })),
  }));

  const years = archive.years.map((year) => ({
    key: year,
    label: year,
    href: filterHref(filters, {
      date: undefined,
      preset: "month",
      from: `${year}-01-01`,
      to: undefined,
    }),
  }));

  return (
    <ArchiveSidebar
      ariaLabel="Journal archive"
      months={months}
      years={years}
      offsetClassName="md:pt-[11.25rem]"
    />
  );
}

function tradesForWeek(week: JournalWeek): JournalTrade[] {
  return week.days.flatMap((day) => day.trades);
}

function tradesForMonth(month: JournalMonth): JournalTrade[] {
  return month.weeks.flatMap(tradesForWeek);
}

const placeholders = {
  day: "Add a daily note: market read, plan, execution, emotions, what worked, what to fix tomorrow.",
  week: "Add a short weekly recap: did I keep red days small, what repeated, what to focus on next week.",
  month: "Add a light monthly recap: themes, bigger-picture progress, drawdown context, what carries into next month.",
};

function DayEntry({
  day,
  recaps,
  returnTo,
}: {
  day: JournalDay;
  recaps: Map<string, string>;
  returnTo: string;
}) {
  const tradesWithNotes = day.trades.filter((trade) => trade.notes.length > 0);

  return (
    <section className="grid grid-cols-[8px_minmax(0,1fr)] gap-x-4">
      <span
        className={`mt-2.5 size-2 rounded-full ${
          day.pnl >= 0 ? "bg-[var(--green)]" : "bg-[var(--red)]"
        }`}
      />
      <div className="max-w-[665px]">
        <div className="flex items-baseline gap-3">
          <h3 className="text-[24px] font-semibold leading-none tracking-[-0.01em] text-[#e6edf3]">
            {weekdayLabel(day.date)}
          </h3>
          <span className="font-mono text-sm text-[var(--muted)]">
            {dayOnlyLabel(day.date)}
          </span>
        </div>
        <div className="mt-3">
          <MetricLine trades={day.trades} pnl={day.pnl} />
        </div>
        <div className="mt-4 max-w-[665px] text-[15.5px] font-light leading-7 text-[var(--foreground)]">
          <RecapNote
            scope="day"
            scopeKey={day.date}
            text={recaps.get(`day:${day.date}`) ?? ""}
            placeholder={placeholders.day}
          />
        </div>
        {tradesWithNotes.length > 0 ? (
          <div className="mt-5 space-y-6">
            {tradesWithNotes.map((trade) =>
              trade.notes.map((note) => (
                <TradeNoteBlock
                  key={note.id}
                  trade={trade}
                  note={note}
                  returnTo={returnTo}
                />
              )),
            )}
          </div>
        ) : (
          <div className="mt-5 flex flex-wrap gap-2">
            <TagPill label="No trade notes yet" />
          </div>
        )}
      </div>
    </section>
  );
}

function WeekSection({
  week,
  recaps,
  returnTo,
}: {
  week: JournalWeek;
  recaps: Map<string, string>;
  returnTo: string;
}) {
  const trades = tradesForWeek(week);

  return (
    <section className="border-t border-[var(--border)] pt-10">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
        <h2 className="text-3xl font-semibold leading-none tracking-[-0.02em] text-[#e6edf3]">
          {week.label}
        </h2>
        <span className="font-mono text-sm text-[var(--muted)]">
          {week.rangeLabel}
        </span>
      </div>
      <div className="mt-3">
        <MetricLine trades={trades} pnl={week.pnl} />
      </div>
      <div className="mt-4 max-w-[665px] text-[16px] font-light leading-7 text-[var(--foreground)]">
        <RecapNote
          scope="week"
          scopeKey={week.key}
          text={recaps.get(`week:${week.key}`) ?? ""}
          placeholder={placeholders.week}
        />
      </div>
      <div className="mt-9 space-y-12">
        {week.days.map((day) => (
          <DayEntry
            key={day.date}
            day={day}
            recaps={recaps}
            returnTo={returnTo}
          />
        ))}
      </div>
    </section>
  );
}

function MonthView({
  month,
  recaps,
  returnTo,
}: {
  month: JournalMonth;
  recaps: Map<string, string>;
  returnTo: string;
}) {
  const trades = tradesForMonth(month);

  return (
    <article>
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.38em] text-[var(--muted)]">
        THE JOURNAL
        <span className="px-3">·</span>
        {month.key.slice(0, 4)}
      </div>
      <div className="mt-5">
        <h1 className="text-5xl font-semibold leading-none tracking-[-0.03em] text-[#e6edf3]">
          {month.label}
        </h1>
      </div>
      <div className="mt-4">
        <MetricLine trades={trades} pnl={month.pnl} />
      </div>
      <div className="mt-8 max-w-[665px] text-[18px] font-light leading-8 text-[var(--foreground)]">
        <RecapNote
          scope="month"
          scopeKey={month.key}
          text={recaps.get(`month:${month.key}`) ?? ""}
          placeholder={placeholders.month}
        />
      </div>

      <div className="mt-12 space-y-14">
        {month.weeks.map((week) => (
          <WeekSection
            key={week.key}
            week={week}
            recaps={recaps}
            returnTo={returnTo}
          />
        ))}
      </div>
    </article>
  );
}

function WeekView({
  week,
  recaps,
  returnTo,
}: {
  week: JournalWeek;
  recaps: Map<string, string>;
  returnTo: string;
}) {
  const trades = tradesForWeek(week);

  return (
    <article>
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.38em] text-[var(--muted)]">
        THE JOURNAL
        <span className="px-3">·</span>
        {week.label.toUpperCase().replace(" ", " 0")}
      </div>
      <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-3">
        <h1 className="text-5xl font-semibold leading-none tracking-[-0.03em] text-[#e6edf3]">
          {week.label}
        </h1>
        <p className="font-mono text-base text-[var(--muted)]">
          {week.rangeLabel}
        </p>
      </div>
      <div className="mt-4">
        <MetricLine trades={trades} pnl={week.pnl} />
      </div>
      <div className="mt-8 max-w-[665px] text-[18px] font-light leading-8 text-[var(--foreground)]">
        <RecapNote
          scope="week"
          scopeKey={week.key}
          text={recaps.get(`week:${week.key}`) ?? ""}
          placeholder={placeholders.week}
        />
      </div>
      <div className="mt-10 border-t border-[var(--border)]" />
      <div className="relative mt-8 space-y-12">
        {week.days.map((day) => (
          <DayEntry
            key={day.date}
            day={day}
            recaps={recaps}
            returnTo={returnTo}
          />
        ))}
      </div>
    </article>
  );
}

function DayView({
  day,
  recaps,
  returnTo,
}: {
  day: JournalDay;
  recaps: Map<string, string>;
  returnTo: string;
}) {
  return (
    <article>
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.38em] text-[var(--muted)]">
        THE JOURNAL
        <span className="px-3">·</span>
        TODAY
      </div>
      <div className="mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-3">
        <h1 className="text-5xl font-semibold leading-none tracking-[-0.03em] text-[#e6edf3]">
          {weekdayLabel(day.date)}
        </h1>
        <p className="font-mono text-base text-[var(--muted)]">
          {dayOnlyLabel(day.date)}, {dateYear(day.date)}
        </p>
      </div>
      <div className="mt-4">
        <MetricLine trades={day.trades} pnl={day.pnl} />
      </div>
      <div className="mt-10 max-w-[760px]">
        <div className="max-w-[665px] text-[18px] font-light leading-8 text-[var(--foreground)]">
          <RecapNote
            scope="day"
            scopeKey={day.date}
            text={recaps.get(`day:${day.date}`) ?? ""}
            placeholder={placeholders.day}
          />
        </div>
        <div className="mt-6 space-y-6">
          {day.trades.filter((trade) => trade.notes.length > 0).map((trade) =>
            trade.notes.map((note) => (
              <TradeNoteBlock
                key={note.id}
                trade={trade}
                note={note}
                returnTo={returnTo}
              />
            )),
          )}
        </div>
      </div>
    </article>
  );
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{
    date?: string;
    preset?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const filters = parseSearchParams(await searchParams);
  const returnTo = filterHref(filters, {});
  const activeAccount = await getActiveAccount();
  const [trades, recaps, archive] = await Promise.all([
    loadJournalTrades(filters, activeAccount.id),
    loadRecaps(activeAccount.id),
    loadJournalArchive(filters, activeAccount.id),
  ]);
  const months = groupJournal(trades, filters);
  const activePreset = filters.date ? "today" : filters.preset;
  const selectedRange = dateRangeFor(filters);
  const selectedDate = selectedRange?.from ?? currentEtDate();
  const allWeeks = months.flatMap((month) => month.weeks);
  const allDays = allWeeks.flatMap((week) => week.days);
  const selectedWeek = allWeeks[0];
  const selectedDay =
    allDays[0] ??
    (activePreset === "today"
      ? { date: selectedDate, trades: [], pnl: 0, noteCount: 0 }
      : undefined);

  return (
    <div className="mx-auto grid w-full max-w-[905px] gap-8 pb-24 pt-8 md:grid-cols-[180px_minmax(0,665px)] xl:grid-cols-[200px_minmax(0,665px)] xl:gap-10">
      <JournalSidebar archive={archive} filters={filters} />
      <main className="mx-auto min-w-0 w-full max-w-[665px]">
        <CurrentShortcuts filters={filters} />
        <section className="mt-10">
          {activePreset === "today" && selectedDay ? (
            <DayView day={selectedDay} recaps={recaps} returnTo={returnTo} />
          ) : activePreset === "week" && selectedWeek ? (
            <WeekView week={selectedWeek} recaps={recaps} returnTo={returnTo} />
          ) : months.length > 0 ? (
            <div className="space-y-20">
              {months.map((month) => (
                <MonthView
                  key={month.key}
                  month={month}
                  recaps={recaps}
                  returnTo={returnTo}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
              No trades match this journal view yet.
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
