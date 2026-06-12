import Link from "next/link";
import { and, gte, lte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fmtMoney } from "@/lib/format";
import { netPnl } from "@/lib/pnl";
import { etDateString, etDayRange } from "@/lib/time";
import { updateJournalEntryAction } from "./actions";

export const dynamic = "force-dynamic";

type DatePreset = "all" | "today" | "week" | "month" | "custom";

type JournalFilters = {
  date?: string;
  preset: DatePreset;
  from?: string;
  to?: string;
  symbol?: string;
  side?: "long" | "short";
  tag?: string;
};

type JournalTrade = typeof schema.trades.$inferSelect & {
  pnl: number | null;
  notes: {
    id: number;
    text: string;
    emotionalState: string | null;
  }[];
};

type DailySymbolSummary = {
  symbol: string;
  trades: number;
  wins: number;
  losses: number;
  pnl: number;
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
}): JournalFilters {
  const presetOptions = new Set<DatePreset>(["all", "today", "week", "month", "custom"]);
  return {
    date: validDate(params.date),
    preset: presetOptions.has(params.preset as DatePreset) ? (params.preset as DatePreset) : "month",
    from: validDate(params.from),
    to: validDate(params.to),
    symbol: params.symbol?.trim().toUpperCase() || undefined,
    side: params.side === "long" || params.side === "short" ? params.side : undefined,
    tag: params.tag || undefined,
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
  if (filters.preset === "today") return { from: today, to: today };
  if (filters.preset === "week") {
    const monday = isoAddDays(today, -((isoWeekday(today) + 6) % 7));
    return { from: monday, to: isoAddDays(monday, 4) };
  }
  if (filters.preset === "month") return { from: `${today.slice(0, 7)}-01`, to: lastDayOfMonth(today) };
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
  if (next.symbol) params.set("symbol", next.symbol);
  if (next.side) params.set("side", next.side);
  if (next.tag) params.set("tag", next.tag);
  const query = params.toString();
  return query ? `/journal?${query}` : "/journal";
}

const dateLabelFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric",
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

function dateLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return dateLabelFmt.format(new Date(Date.UTC(year, month - 1, day)));
}

function dayOnlyLabel(date: string): string {
  const [year, month, day] = date.split("-").map(Number);
  return dayOnlyLabelFmt.format(new Date(Date.UTC(year, month - 1, day)));
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

function noteWord(count: number): string {
  return `${count} ${count === 1 ? "note" : "notes"}`;
}

function tradeNoteText(note: typeof schema.journalEntries.$inferSelect): string {
  return note.lessons || note.thesis || note.whatWentWell || note.whatWentWrong || "";
}

async function loadTagOptions() {
  return db.select({ name: schema.tags.name }).from(schema.tags);
}

async function loadJournalTrades(filters: JournalFilters): Promise<JournalTrade[]> {
  const range = dateRangeFor(filters);
  const where =
    range
      ? (() => {
          const { start } = etDayRange(range.from);
          const { end } = etDayRange(range.to);
          return and(gte(schema.trades.entryAt, start), lte(schema.trades.entryAt, end));
        })()
      : undefined;

  let rows = await db.select().from(schema.trades).where(where).limit(2000);

  if (range) {
    rows = rows.filter((trade) => {
      if (trade.entryAt == null) return false;
      const entryDate = etDateString(trade.entryAt);
      return entryDate >= range.from && entryDate <= range.to;
    });
  }

  if (filters.symbol) rows = rows.filter((trade) => trade.symbol.toUpperCase().includes(filters.symbol!));
  if (filters.side) rows = rows.filter((trade) => trade.side === filters.side);

  if (filters.tag) {
    const taggedRows = await db
      .select({ tradeId: schema.tradeTags.tradeId, name: schema.tags.name })
      .from(schema.tradeTags)
      .innerJoin(schema.tags, sql`${schema.tags.id} = ${schema.tradeTags.tagId}`);
    const taggedTradeIds = new Set(taggedRows.filter((row) => row.name === filters.tag).map((row) => row.tradeId));
    rows = rows.filter((trade) => taggedTradeIds.has(trade.id));
  }

  const noteRows = await db
    .select()
    .from(schema.journalEntries)
    .orderBy(schema.journalEntries.createdAt);
  const notesByTrade = new Map<number, JournalTrade["notes"]>();
  for (const note of noteRows) {
    const text = tradeNoteText(note);
    const notes = notesByTrade.get(note.tradeId) ?? [];
    notes.push({
      id: note.id,
      text: text || "No note text.",
      emotionalState: note.emotionalState,
    });
    notesByTrade.set(note.tradeId, notes);
  }

  return rows
    .map((trade) => ({ ...trade, pnl: netPnl(trade), notes: notesByTrade.get(trade.id) ?? [] }))
    .sort((a, b) => (a.entryAt ?? 0) - (b.entryAt ?? 0));
}

function buildDailySymbolSummary(trades: JournalTrade[]): DailySymbolSummary[] {
  const bySymbol = new Map<string, DailySymbolSummary>();

  for (const trade of trades) {
    const pnl = trade.pnl ?? 0;
    const row = bySymbol.get(trade.symbol) ?? {
      symbol: trade.symbol,
      trades: 0,
      wins: 0,
      losses: 0,
      pnl: 0,
    };
    row.trades += 1;
    row.pnl += pnl;
    if (pnl > 0) row.wins += 1;
    if (pnl < 0) row.losses += 1;
    bySymbol.set(trade.symbol, row);
  }

  return [...bySymbol.values()].sort((a, b) => Math.abs(b.pnl) - Math.abs(a.pnl));
}

function groupJournal(trades: JournalTrade[]): JournalMonth[] {
  const monthMap = new Map<string, JournalMonth>();

  for (const trade of trades) {
    if (trade.entryAt == null) continue;
    const date = etDateString(trade.entryAt);
    const monthKey = date.slice(0, 7);
    const weekKey = weekKeyFor(date);
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
        rangeLabel: `${dateLabel(weekKey)} - ${dateLabel(isoAddDays(weekKey, 4))}`,
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

function FilterBar({ filters, tagOptions }: { filters: JournalFilters; tagOptions: { name: string }[] }) {
  const activePreset: DatePreset = filters.date ? "custom" : filters.preset;
  const presetBase = { date: undefined, from: undefined, to: undefined };
  const buttonClass = (preset: DatePreset) =>
    `inline-flex h-10 items-center rounded-md border px-3 text-sm font-semibold transition-colors ${
      activePreset === preset
        ? "border-[var(--blue)] bg-[var(--surface)] text-[var(--foreground)]"
        : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--blue)] hover:text-[var(--foreground)]"
    }`;

  return (
    <form action="/journal" className="space-y-3">
      <input type="hidden" name="preset" value={activePreset} />
      <div className="space-y-2">
        <span className="block text-sm font-semibold text-[var(--muted)]">Date range</span>
        <div className="flex flex-wrap gap-2">
          <Link href={filterHref(filters, { ...presetBase, preset: "today" })} className={buttonClass("today")}>Today</Link>
          <Link href={filterHref(filters, { ...presetBase, preset: "week" })} className={buttonClass("week")}>Week</Link>
          <Link href={filterHref(filters, { ...presetBase, preset: "month" })} className={buttonClass("month")}>Month</Link>
          <Link href={filterHref(filters, { date: undefined, preset: "custom" })} className={buttonClass("custom")}>Custom</Link>
          <Link href="/journal" className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm text-[var(--muted)] hover:border-[var(--blue)] hover:text-[var(--foreground)]">Clear</Link>
        </div>

        {activePreset === "custom" && (
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-[var(--muted)]">From</span>
              <input type="date" name="from" defaultValue={filters.date ?? filters.from ?? ""} className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--blue)]" />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-[var(--muted)]">To</span>
              <input type="date" name="to" defaultValue={filters.date ?? filters.to ?? ""} className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--blue)]" />
            </label>
            <div className="flex items-end">
              <button type="submit" className="h-10 rounded-md border border-[var(--blue)] px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface)]">Apply range</button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
        <label className="space-y-1">
          <span className="block text-sm font-semibold text-[var(--muted)]">Symbol</span>
          <input name="symbol" defaultValue={filters.symbol ?? ""} placeholder="Symbol" className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--blue)]" />
        </label>
        <label className="space-y-1">
          <span className="block text-sm font-semibold text-[var(--muted)]">Tag</span>
          <select name="tag" defaultValue={filters.tag ?? ""} className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--blue)]">
            <option value="">All tags</option>
            {tagOptions.map((tagOption) => <option key={tagOption.name} value={tagOption.name}>{tagOption.name}</option>)}
          </select>
        </label>
        <label className="space-y-1">
          <span className="block text-sm font-semibold text-[var(--muted)]">Side</span>
          <select name="side" defaultValue={filters.side ?? ""} className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[var(--blue)]">
            <option value="">All sides</option>
            <option value="long">Long</option>
            <option value="short">Short</option>
          </select>
        </label>
        <div className="flex items-end">
          <button type="submit" className="h-10 rounded-md border border-[var(--blue)] px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface)]">Apply</button>
        </div>
      </div>
    </form>
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
    symbol?: string;
    side?: string;
    tag?: string;
  }>;
}) {
  const filters = parseSearchParams(await searchParams);
  const [trades, tagOptions] = await Promise.all([loadJournalTrades(filters), loadTagOptions()]);
  const months = groupJournal(trades);
  const totalNotes = trades.reduce((sum, trade) => sum + trade.notes.length, 0);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-baseline justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">Journal</h1>
        <span className="text-xs text-[var(--muted)]">{noteWord(totalNotes)}</span>
      </div>

      <FilterBar filters={filters} tagOptions={tagOptions} />

      <section className="space-y-4">
        {months.length === 0 ? (
          <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted)]">
            No trade notes match these filters yet. Add a note from a trade detail page to see it roll up here.
          </div>
        ) : (
          months.map((month) => (
            <article key={month.key} className="space-y-7">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold tracking-tight">{month.label}</h2>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">Month Review</h3>
                    <span className="text-sm text-[var(--muted)]">{month.trades} trades · {noteWord(month.noteCount)} · {fmtMoney(month.pnl)}</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">[ Add a light monthly recap: themes, bigger-picture progress, drawdown context, what carries into next month. ]</p>
                </div>
              </div>

              <div className="space-y-8">
                {month.weeks.map((week) => (
                  <section key={week.key} className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-baseline justify-between gap-3">
                        <h3 className="text-xl font-semibold">{week.label}</h3>
                        <span className="text-sm text-[var(--muted)]">{week.rangeLabel} · {fmtMoney(week.pnl)}</span>
                      </div>
                      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                        <p className="text-sm leading-6 text-[var(--muted)]">[ Add a short weekly recap: did I keep red days small, what repeated, what to focus on next week. ]</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {week.days.map((day) => (
                        <div key={day.date} className="rounded-lg border border-[var(--border)] px-5 py-5">
                          <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_max-content]">
                            <div className="space-y-4">
                              <div>
                                <div className="flex flex-wrap items-baseline justify-between gap-3">
                                  <h4 className="text-xl font-semibold">{dayOnlyLabel(day.date)}</h4>
                                  <span className="text-sm text-[var(--muted)]">{day.trades.length} trades · {noteWord(day.noteCount)} · {fmtMoney(day.pnl)}</span>
                                </div>
                                <p className="mt-2 text-base leading-7 text-[var(--muted)]">[ Note on overall day: market read, plan, execution, emotions, what worked, what to fix tomorrow. ]</p>
                              </div>

                              <div className="space-y-6 pt-4">
                                {day.trades.filter((trade) => trade.notes.length > 0).map((trade) => (
                                  <div key={trade.id} className="space-y-2">
                                    <div>
                                      <h5 className="text-lg font-semibold">{trade.symbol}</h5>
                                      <p className="text-sm text-[var(--muted)]">{trade.side} · {trade.quantity.toLocaleString()} shares · {trade.pnl == null ? "-" : fmtMoney(trade.pnl)}</p>
                                    </div>
                                    {trade.notes.map((note) => (
                                      <form key={note.id} action={updateJournalEntryAction} className="space-y-2">
                                        <input type="hidden" name="noteId" value={note.id} />
                                        <input type="hidden" name="tradeId" value={trade.id} />
                                        <div className="flex flex-wrap items-center gap-2">
                                          <select
                                            name="emotionalState"
                                            defaultValue={note.emotionalState ?? ""}
                                            className="h-9 rounded-md border border-[var(--border)] bg-[var(--background)] px-2 text-sm outline-none focus:border-[var(--blue)]"
                                          >
                                            <option value="">Optional</option>
                                            <option value="Good trade">Good trade</option>
                                            <option value="Bad trade">Bad trade</option>
                                            <option value="Rule break">Rule break</option>
                                            <option value="Revenge trade">Revenge trade</option>
                                            <option value="Chased">Chased</option>
                                            <option value="Overtraded">Overtraded</option>
                                            <option value="Needs review">Needs review</option>
                                          </select>
                                          <Link href={`/trades/${trade.id}`} className="text-sm font-semibold text-[var(--foreground)] hover:underline">
                                            Link to trade
                                          </Link>
                                        </div>
                                        <textarea
                                          name="note"
                                          rows={3}
                                          defaultValue={note.text}
                                          className="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm leading-6 outline-none focus:border-[var(--blue)]"
                                        />
                                        <button type="submit" className="h-9 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)] hover:border-[var(--blue)] hover:text-[var(--foreground)]">
                                          Save note
                                        </button>
                                      </form>
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </div>

                            <aside className="w-max max-w-full justify-self-end self-start rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-sm">
                              <h5 className="mb-3 text-sm font-semibold text-[var(--foreground)]">Trade Recap</h5>
                              <div className="grid grid-cols-[max-content_2rem_2.75rem_max-content] gap-x-2 text-xs font-semibold text-[var(--muted)]">
                                <span>Ticker</span>
                                <span className="text-right">Tr</span>
                                <span className="text-right">W/L</span>
                                <span className="text-right">P&L</span>
                              </div>
                              <div className="mt-2 space-y-2">
                                {buildDailySymbolSummary(day.trades).map((row) => (
                                  <div key={row.symbol} className="grid grid-cols-[max-content_2rem_2.75rem_max-content] items-center gap-x-2 whitespace-nowrap">
                                    <span className="font-semibold text-[var(--foreground)]">{row.symbol}</span>
                                    <span className="text-right tabular-nums text-[var(--muted)]">{row.trades}</span>
                                    <span className="text-right tabular-nums text-[var(--muted)]">{row.wins}/{row.losses}</span>
                                    <span className="text-right font-semibold tabular-nums text-[var(--foreground)]">{fmtMoney(row.pnl)}</span>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 grid grid-cols-[max-content_2rem_2.75rem_max-content] items-center gap-x-2 whitespace-nowrap pt-2 font-semibold">
                                <span>Total</span>
                                <span className="text-right tabular-nums">{day.trades.length}</span>
                                <span className="text-right tabular-nums">
                                  {day.trades.filter((trade) => (trade.pnl ?? 0) > 0).length}/{day.trades.filter((trade) => (trade.pnl ?? 0) < 0).length}
                                </span>
                                <span className="text-right tabular-nums">{fmtMoney(day.pnl)}</span>
                              </div>
                            </aside>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            </article>
          ))
        )}
      </section>
    </div>
  );
}
