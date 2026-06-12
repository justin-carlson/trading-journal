import Link from "next/link";
import { and, gte, lte, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { fmtDate, fmtMoney, fmtPrice } from "@/lib/format";
import { netPnl } from "@/lib/pnl";
import { etDateString, etDayRange } from "@/lib/time";
import { RowLink } from "./RowLink";

export const dynamic = "force-dynamic";

type TradeSort = "date" | "symbol" | "side" | "shares" | "execs" | "entry" | "exit" | "pnl";
type SortDir = "asc" | "desc";
type DatePreset = "all" | "today" | "week" | "month" | "custom";

type TradeFilters = {
  date?: string;
  preset: DatePreset;
  from?: string;
  to?: string;
  symbol?: string;
  side?: "long" | "short";
  tag?: string;
  account?: string;
  sort: TradeSort;
  dir: SortDir;
};

function parseSearchParams(params: {
  date?: string;
  preset?: string;
  from?: string;
  to?: string;
  symbol?: string;
  side?: string;
  tag?: string;
  account?: string;
  sort?: string;
  dir?: string;
}): TradeFilters {
  const sortOptions = new Set<TradeSort>(["date", "symbol", "side", "shares", "execs", "entry", "exit", "pnl"]);
  const presetOptions = new Set<DatePreset>(["all", "today", "week", "month", "custom"]);
  const side = params.side === "long" || params.side === "short" ? params.side : undefined;
  const sort = sortOptions.has(params.sort as TradeSort) ? (params.sort as TradeSort) : "date";
  const dir = params.dir === "asc" ? "asc" : "desc";
  const preset = presetOptions.has(params.preset as DatePreset) ? (params.preset as DatePreset) : "all";
  const validDate = (value: string | undefined) => value && /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : undefined;
  return {
    date: validDate(params.date),
    preset,
    from: validDate(params.from),
    to: validDate(params.to),
    symbol: params.symbol?.trim().toUpperCase() || undefined,
    side,
    tag: params.tag || undefined,
    account: params.account || undefined,
    sort,
    dir,
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

function dateRangeFor(filters: TradeFilters): { from: string; to: string } | undefined {
  if (filters.date) return { from: filters.date, to: filters.date };

  const today = currentEtDate();
  if (filters.preset === "today") return { from: today, to: today };
  if (filters.preset === "week") {
    const monday = isoAddDays(today, -((isoWeekday(today) + 6) % 7));
    return { from: monday, to: isoAddDays(monday, 4) };
  }
  if (filters.preset === "month") {
    return { from: `${today.slice(0, 7)}-01`, to: lastDayOfMonth(today) };
  }
  if (filters.preset === "custom") {
    if (!filters.from && !filters.to) return undefined;
    return {
      from: filters.from ?? "0000-01-01",
      to: filters.to ?? "9999-12-31",
    };
  }

  return undefined;
}

async function loadTrades(filters: TradeFilters) {
  const { symbol, side, tag, sort, dir } = filters;
  const range = dateRangeFor(filters);
  const where =
    range
      ? (() => {
          const { start } = etDayRange(range.from);
          const { end } = etDayRange(range.to);
          return and(gte(schema.trades.entryAt, start), lte(schema.trades.entryAt, end));
        })()
      : undefined;

  let rows = await db
    .select()
    .from(schema.trades)
    .where(where)
    .limit(2000);

  // The epoch window has slack for DST; refine to exact ET market dates.
  if (range) {
    rows = rows.filter((t) => {
      if (t.entryAt == null) return false;
      const entryDate = etDateString(t.entryAt);
      return entryDate >= range.from && entryDate <= range.to;
    });
  }
  if (symbol) rows = rows.filter((t) => t.symbol.toUpperCase().includes(symbol));
  if (side) rows = rows.filter((t) => t.side === side);

  const execCounts = await db
    .select({ tradeId: schema.executions.tradeId, n: sql<number>`count(*)` })
    .from(schema.executions)
    .groupBy(schema.executions.tradeId);

  const countByTrade = new Map(execCounts.map((r) => [r.tradeId, r.n]));

  if (tag) {
    const taggedRows = await db
      .select({
        tradeId: schema.tradeTags.tradeId,
        name: schema.tags.name,
      })
      .from(schema.tradeTags)
      .innerJoin(schema.tags, sql`${schema.tags.id} = ${schema.tradeTags.tagId}`);
    const taggedTradeIds = new Set(taggedRows.filter((r) => r.name === tag).map((r) => r.tradeId));
    rows = rows.filter((t) => taggedTradeIds.has(t.id));
  }

  const mapped = rows.map((t) => ({ ...t, execs: countByTrade.get(t.id) ?? 0, pnl: netPnl(t) }));
  const multiplier = dir === "asc" ? 1 : -1;
  mapped.sort((a, b) => {
    const value = (t: (typeof mapped)[number]): string | number | null => {
      switch (sort) {
        case "symbol": return t.symbol;
        case "side": return t.side;
        case "shares": return t.quantity;
        case "execs": return t.execs;
        case "entry": return t.avgEntryPrice;
        case "exit": return t.avgExitPrice;
        case "pnl": return t.pnl;
        case "date":
        default: return t.entryAt ?? 0;
      }
    };
    const av = value(a);
    const bv = value(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "string" && typeof bv === "string") return av.localeCompare(bv) * multiplier;
    return (Number(av) - Number(bv)) * multiplier;
  });

  return mapped.slice(0, 200);
}

async function loadTagOptions() {
  return db.select({ name: schema.tags.name }).from(schema.tags);
}

function filterHref(filters: TradeFilters, updates: Partial<TradeFilters>) {
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
  params.set("sort", next.sort);
  params.set("dir", next.dir);
  return `/trades?${params.toString()}`;
}

function SortHeader({
  label,
  sort,
  filters,
}: {
  label: string;
  sort: TradeSort;
  filters: TradeFilters;
}) {
  const active = filters.sort === sort;
  const nextDir: SortDir = active && filters.dir === "asc" ? "desc" : "asc";
  return (
    <Link
      href={filterHref(filters, { sort, dir: nextDir })}
      className="inline-flex items-center gap-1 hover:text-[var(--foreground)]"
    >
      {label}
      <span className="text-[10px]">{active && filters.dir === "asc" ? "▲" : "▼"}</span>
    </Link>
  );
}

export default async function TradesPage({
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
    sort?: string;
    dir?: string;
  }>;
}) {
  const filters = parseSearchParams(await searchParams);
  const trades = await loadTrades(filters);
  const tagOptions = await loadTagOptions();
  const date = filters.date;
  const activeRange = dateRangeFor(filters);
  const activePreset: DatePreset = date ? "custom" : filters.preset;
  const presetBase = { date: undefined, from: undefined, to: undefined };
  const presetButtonClass = (preset: DatePreset) =>
    `flex h-10 items-center rounded-md border px-3 text-sm font-semibold transition-colors ${
      activePreset === preset
        ? "border-[#58a6ff] bg-[var(--surface)] text-[var(--foreground)]"
        : "border-[var(--border)] text-[var(--muted)] hover:border-[#58a6ff]"
    }`;
  const customRangeClass =
    `flex h-10 min-w-48 items-center gap-2 rounded-md border px-4 text-sm font-semibold transition-colors ${
      activePreset === "custom"
        ? "border-[#58a6ff] bg-[var(--surface)] text-[var(--foreground)]"
        : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[#58a6ff]"
    }`;

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
          {!date && activeRange && (
            <span className="text-sm text-[var(--muted)]">
              {activeRange.from === activeRange.to ? activeRange.from : `${activeRange.from} to ${activeRange.to}`}
            </span>
          )}
        </div>
        <span className="text-xs text-[var(--muted)]">{trades.length} shown</span>
      </div>

      <form action="/trades" className="space-y-3">
        <input type="hidden" name="sort" value={filters.sort} />
        <input type="hidden" name="dir" value={filters.dir} />

        <input type="hidden" name="preset" value={activePreset} />

        <div className="relative space-y-2">
          <span className="block text-sm font-semibold text-[var(--muted)]">Date range</span>
          <div className="flex flex-wrap gap-2">
            <Link href={filterHref(filters, { ...presetBase, preset: "today" })} className={presetButtonClass("today")}>
              Today
            </Link>
            <Link href={filterHref(filters, { ...presetBase, preset: "week" })} className={presetButtonClass("week")}>
              Week
            </Link>
            <Link href={filterHref(filters, { ...presetBase, preset: "month" })} className={presetButtonClass("month")}>
              Month
            </Link>
            <Link href={filterHref(filters, { date: undefined, preset: "custom" })} className={customRangeClass}>
              <svg
                aria-hidden="true"
                className="h-5 w-5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                viewBox="0 0 24 24"
              >
                <path d="M7 3v4M17 3v4M4.5 9h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
              </svg>
              <span>From - To</span>
            </Link>
            <Link
              href="/trades"
              className="flex h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm text-[var(--muted)] hover:border-[#58a6ff]"
            >
              Clear
            </Link>
          </div>

          {activePreset === "custom" && (
            <div className="absolute left-0 top-full z-20 mt-2 w-full max-w-xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl md:w-[520px]">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
                <label className="space-y-1">
                  <span className="block text-sm font-semibold text-[var(--muted)]">From</span>
                  <input
                    type="date"
                    name="from"
                    defaultValue={date ?? filters.from ?? ""}
                    className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[#58a6ff]"
                  />
                </label>

                <label className="space-y-1">
                  <span className="block text-sm font-semibold text-[var(--muted)]">To</span>
                  <input
                    type="date"
                    name="to"
                    defaultValue={date ?? filters.to ?? ""}
                    className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[#58a6ff]"
                  />
                </label>

                <div className="flex items-end">
                  <button
                    type="submit"
                    className="h-10 rounded-md border border-[#58a6ff] px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_1fr_auto]">
          <label className="space-y-1">
            <span className="block text-sm font-semibold text-[var(--muted)]">Symbol</span>
            <input
              name="symbol"
              defaultValue={filters.symbol ?? ""}
              placeholder="Symbol"
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[#58a6ff]"
            />
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-semibold text-[var(--muted)]">Tag</span>
            <select
              name="tag"
              defaultValue={filters.tag ?? ""}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[#58a6ff]"
            >
              <option value="">All tags</option>
              {tagOptions.map((tagOption) => (
                <option key={tagOption.name} value={tagOption.name}>
                  {tagOption.name}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-semibold text-[var(--muted)]">Side</span>
            <select
              name="side"
              defaultValue={filters.side ?? ""}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[#58a6ff]"
            >
              <option value="">All sides</option>
              <option value="long">Long</option>
              <option value="short">Short</option>
            </select>
          </label>

          <label className="space-y-1">
            <span className="block text-sm font-semibold text-[var(--muted)]">Account</span>
            <select
              name="account"
              defaultValue={filters.account ?? ""}
              className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm outline-none focus:border-[#58a6ff]"
            >
              <option value="">All accounts</option>
              <option value="paper">Paper trading</option>
              <option value="tos">Thinkorswim</option>
              <option value="broker-2">Broker account 2</option>
            </select>
          </label>

          <div className="flex items-end">
            <button
              type="submit"
              className="h-10 rounded-md border border-[#58a6ff] px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--surface)]"
            >
              Apply
            </button>
          </div>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
              <th className="px-3 py-2 font-medium whitespace-nowrap"><SortHeader label="Date" sort="date" filters={filters} /></th>
              <th className="px-3 py-2 font-medium whitespace-nowrap"><SortHeader label="Symbol" sort="symbol" filters={filters} /></th>
              <th className="px-3 py-2 font-medium whitespace-nowrap"><SortHeader label="Side" sort="side" filters={filters} /></th>
              <th className="px-3 py-2 font-medium whitespace-nowrap"><SortHeader label="Shares" sort="shares" filters={filters} /></th>
              <th className="px-3 py-2 font-medium whitespace-nowrap"><SortHeader label="Execs" sort="execs" filters={filters} /></th>
              <th className="px-3 py-2 font-medium whitespace-nowrap"><SortHeader label="Entry" sort="entry" filters={filters} /></th>
              <th className="px-3 py-2 font-medium whitespace-nowrap"><SortHeader label="Exit" sort="exit" filters={filters} /></th>
              <th className="px-3 py-2 font-medium whitespace-nowrap"><SortHeader label="P&L" sort="pnl" filters={filters} /></th>
            </tr>
          </thead>
          <tbody>
            {trades.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-6 text-center text-[var(--muted)]">
                  {date ? `No trades on ${fmtDate(etDayRange(date).start)} match these filters.` : "No trades match these filters."}
                </td>
              </tr>
            ) : trades.map((t) => {
              const net = t.pnl;
              const pos = (net ?? 0) >= 0;
              return (
                <RowLink
                  key={t.id}
                  href={`/trades/${t.id}`}
                  className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface)] cursor-pointer"
                >
                  <td className="px-3 py-2 whitespace-nowrap">{fmtDate(t.entryAt)}</td>
                  <td className="px-3 py-2 font-medium">{t.symbol}</td>
                  <td className="px-3 py-2 text-[var(--muted)] capitalize">{t.side}</td>
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
                </RowLink>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
