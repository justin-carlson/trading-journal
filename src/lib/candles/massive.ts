/**
 * Massive (Polygon-platform) candle provider. Fetches 1-minute aggregate bars
 * for a symbol on a single market date. Key is read server-side from the env
 * (never exposed to the client). See docs/product/PRODUCT_SPEC.md §9.
 */
const BASE = "https://api.massive.com";

export type Candle = {
  t: number; // bar start, epoch seconds (UTC)
  o: number;
  h: number;
  l: number;
  c: number;
  vol: number;
};

/** Fetch 1-min bars for `symbol` on an ET market date (YYYY-MM-DD). */
export async function fetchMassiveDay(
  symbol: string,
  date: string,
): Promise<Candle[]> {
  const key = process.env.MASSIVE_API_KEY;
  if (!key) throw new Error("MASSIVE_API_KEY is not set (.env.local).");

  const url = new URL(
    `/v2/aggs/ticker/${encodeURIComponent(symbol)}/range/1/minute/${date}/${date}`,
    BASE,
  );
  url.searchParams.set("adjusted", "false");
  url.searchParams.set("sort", "asc");
  url.searchParams.set("limit", "50000");
  url.searchParams.set("apiKey", key);

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Massive ${res.status}: ${(await res.text()).slice(0, 200)}`);
  }
  const body = await res.json();
  const results: unknown[] = Array.isArray(body?.results) ? body.results : [];
  return results
    .map((r) => r as Record<string, number>)
    .filter((b) => Number.isFinite(b.t) && Number.isFinite(b.o))
    .map((b) => ({
      t: Math.round(b.t / 1000),
      o: b.o,
      h: b.h,
      l: b.l,
      c: b.c,
      vol: b.v ?? 0,
    }));
}
