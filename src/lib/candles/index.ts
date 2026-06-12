/**
 * Candle cache: fetch-once on demand, then serve from SQLite.
 *
 * `getCandles` ensures the trade's market day(s) are cached (fetching from
 * Massive if not), then returns the bars within the requested window.
 */
import { and, eq, gte, lte } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { MARKET_TZ, zonedDateTimeToUtcMs } from "@/lib/time";
import { fetchMassiveDay, type Candle } from "./massive";

const TIMEFRAME = "1m";

const etDateFmt = new Intl.DateTimeFormat("en-CA", {
  timeZone: MARKET_TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

/** ET market date (YYYY-MM-DD) for an epoch-seconds instant. */
function etDate(epochSeconds: number): string {
  return etDateFmt.format(new Date(epochSeconds * 1000));
}

/** Unique set of ET dates spanned by [from, to] (hourly steps cover DST). */
function etDatesBetween(from: number, to: number): string[] {
  const dates = new Set<string>();
  for (let t = from; t <= to; t += 3600) dates.add(etDate(t));
  dates.add(etDate(to));
  return [...dates];
}

function dayBounds(date: string): { start: number; end: number } {
  const start = Math.round(zonedDateTimeToUtcMs(date, "00:00:00", MARKET_TZ) / 1000);
  return { start: start - 3600, end: start + 26 * 3600 };
}

async function ensureDayCached(symbol: string, date: string): Promise<void> {
  const { start, end } = dayBounds(date);
  const existing = await db
    .select({ t: schema.candles.t })
    .from(schema.candles)
    .where(
      and(
        eq(schema.candles.symbol, symbol),
        eq(schema.candles.timeframe, TIMEFRAME),
        gte(schema.candles.t, start),
        lte(schema.candles.t, end),
      ),
    )
    .limit(1);
  if (existing.length > 0) return;

  const bars = await fetchMassiveDay(symbol, date);
  if (bars.length === 0) return;
  await db
    .insert(schema.candles)
    .values(
      bars.map((b) => ({
        symbol,
        timeframe: TIMEFRAME,
        t: b.t,
        o: b.o,
        h: b.h,
        l: b.l,
        c: b.c,
        vol: b.vol,
      })),
    )
    .onConflictDoNothing();
}

/**
 * Return cached 1-min candles for `symbol` within [from, to] (epoch seconds),
 * fetching any uncached market days first. Errors are swallowed to a degraded
 * empty result so a chart can render "no data" rather than crash.
 */
export async function getCandles(
  symbol: string,
  from: number,
  to: number,
): Promise<{ candles: Candle[]; error?: string }> {
  try {
    for (const date of etDatesBetween(from, to)) {
      await ensureDayCached(symbol, date);
    }
  } catch (e) {
    return { candles: [], error: e instanceof Error ? e.message : "Candle fetch failed." };
  }

  const rows = await db
    .select()
    .from(schema.candles)
    .where(
      and(
        eq(schema.candles.symbol, symbol),
        eq(schema.candles.timeframe, TIMEFRAME),
        gte(schema.candles.t, from),
        lte(schema.candles.t, to),
      ),
    )
    .orderBy(schema.candles.t);

  return {
    candles: rows.map((r) => ({ t: r.t, o: r.o, h: r.h, l: r.l, c: r.c, vol: r.vol })),
  };
}
