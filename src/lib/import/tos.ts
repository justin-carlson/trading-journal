/**
 * ThinkorSwim Account Statement parser.
 *
 * Slices the `Account Trade History` section into fill-level executions.
 * (See docs/product/PRODUCT_SPEC.md §8 for the format spec.) Fees live in the `Cash Balance`
 * section and are joined here when available; otherwise default to 0.
 */
import { createHash } from "node:crypto";
import { tosWallClockToEpochSeconds } from "@/lib/time";
import { parseCsvLine } from "./csv";

export type ParsedExecution = {
  symbol: string;
  side: "buy" | "sell";
  quantity: number;
  price: number;
  executedAt: number; // epoch seconds (UTC)
  posEffect: string | null; // "TO OPEN" | "TO CLOSE"
  fees: number;
  sourceRowHash: string;
};

function parseTosDateTime(value: string): { date: string; time: string } {
  const m = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})\s+(\d{1,2}):(\d{2}):(\d{2})$/,
  );
  if (!m) throw new Error(`Could not parse Exec Time: ${value}`);
  const [, month, day, year, hour, minute, second] = m;
  const fullYear = Number(year) < 100 ? 2000 + Number(year) : Number(year);
  return {
    date: `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
    time: `${hour.padStart(2, "0")}:${minute}:${second}`,
  };
}

function parseNumber(value: string | undefined): number | null {
  if (value == null) return null;
  const n = Number(String(value).replace(/[,+$]/g, "").trim());
  return Number.isFinite(n) ? n : null;
}

/** Locate a section by its header line; return the rows until the next blank. */
function sliceSection(lines: string[], header: string): string[][] {
  const idx = lines.findIndex((l) => l.trim() === header);
  if (idx === -1) return [];
  const headers = parseCsvLine(lines[idx + 1]);
  const rows: string[][] = [];
  for (let i = idx + 2; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) break;
    rows.push(parseCsvLine(line));
  }
  return [headers, ...rows];
}

/**
 * Build a lookup of fees from the Cash Balance section, keyed by
 * `symbol|epochSeconds|absQty|price` (best-effort join to trade-history rows).
 */
function buildFeeIndex(lines: string[]): Map<string, { sum: number; n: number }> {
  // sum + count per key, so identical fills split the fee instead of each
  // claiming the full summed amount (which double-counts duplicates).
  const fees = new Map<string, { sum: number; n: number }>();
  const idx = lines.findIndex((l) => l.trim() === "Cash Balance");
  if (idx === -1) return fees;
  const headers = parseCsvLine(lines[idx + 1]);
  const col = (name: string) => headers.indexOf(name);
  const iDate = col("DATE");
  const iTime = col("TIME");
  const iDesc = col("DESCRIPTION");
  const iMisc = col("Misc Fees");
  if (iDate < 0 || iTime < 0 || iDesc < 0) return fees;

  for (let i = idx + 2; i < lines.length; i += 1) {
    const line = lines[i];
    if (!line.trim()) break;
    const c = parseCsvLine(line);
    const desc = c[iDesc] ?? "";
    // e.g. "BOT +100 TMDE @4.52" / "SOLD -2,180 AIFF @1.7117"
    const m = desc.match(/^(BOT|SOLD)\s+([+-][\d,]+)\s+(\S+)\s+@([\d.]+)/);
    if (!m) continue;
    const [, , rawQty, symbol, rawPrice] = m;
    const qty = Math.abs(parseNumber(rawQty) ?? 0);
    const price = parseNumber(rawPrice) ?? 0;
    const [mo, dy, yr] = (c[iDate] ?? "").split("/");
    if (!mo || !dy || !yr) continue;
    const fullYear = Number(yr) < 100 ? 2000 + Number(yr) : Number(yr);
    const date = `${fullYear}-${mo.padStart(2, "0")}-${dy.padStart(2, "0")}`;
    const epoch = tosWallClockToEpochSeconds(date, c[iTime] ?? "");
    const misc = Math.abs(parseNumber(c[iMisc]) ?? 0);
    const key = `${symbol.toUpperCase()}|${epoch}|${qty}|${price}`;
    const prev = fees.get(key) ?? { sum: 0, n: 0 };
    fees.set(key, { sum: prev.sum + misc, n: prev.n + 1 });
  }
  return fees;
}

function hashRow(parts: (string | number)[]): string {
  return createHash("sha1").update(parts.join("|")).digest("hex");
}

export function parseTosStatement(csv: string): ParsedExecution[] {
  const lines = csv.replace(/^﻿/, "").split(/\r?\n/);
  const section = sliceSection(lines, "Account Trade History");
  if (section.length === 0) {
    throw new Error("Could not find 'Account Trade History' section in the CSV.");
  }
  const [headers, ...rows] = section;
  const col = (name: string) => headers.indexOf(name);
  const iExec = col("Exec Time");
  const iSide = col("Side");
  const iQty = col("Qty");
  const iSym = col("Symbol");
  const iPrice = col("Price");
  const iNet = col("Net Price");
  const iPos = col("Pos Effect");

  const feeIndex = buildFeeIndex(lines);
  const out: ParsedExecution[] = [];

  for (const c of rows) {
    const execTime = c[iExec];
    const symbol = (c[iSym] ?? "").toUpperCase();
    const qty = Math.abs(parseNumber(c[iQty]) ?? 0);
    const price = parseNumber(c[iNet]) ?? parseNumber(c[iPrice]);
    if (!execTime || !symbol || qty === 0 || price == null) continue;

    const { date, time } = parseTosDateTime(execTime);
    const executedAt = tosWallClockToEpochSeconds(date, time);
    const side = (c[iSide] ?? "").toUpperCase() === "SELL" ? "sell" : "buy";
    const posEffect = (c[iPos] ?? "").trim() || null;
    const feeEntry = feeIndex.get(`${symbol}|${executedAt}|${qty}|${price}`);
    const fees = feeEntry ? feeEntry.sum / feeEntry.n : 0;

    out.push({
      symbol,
      side,
      quantity: qty,
      price,
      executedAt,
      posEffect,
      fees,
      sourceRowHash: "", // assigned below (per-occurrence)
    });
  }

  // Deterministic order, then a stable per-occurrence hash. TOS gives no fill
  // ID, so genuinely-identical fills (same symbol/time/side/qty/price) are
  // distinguished by their occurrence index — unique per fill, yet stable across
  // re-imports of the same statement (so cross-import dedupe still works).
  out.sort((a, b) => a.executedAt - b.executedAt || a.symbol.localeCompare(b.symbol));
  const occurrences = new Map<string, number>();
  for (const e of out) {
    const baseKey = [e.symbol, e.executedAt, e.side, e.quantity, e.price, e.posEffect ?? ""].join("|");
    const n = occurrences.get(baseKey) ?? 0;
    occurrences.set(baseKey, n + 1);
    e.sourceRowHash = hashRow([baseKey, n]);
  }
  return out;
}
