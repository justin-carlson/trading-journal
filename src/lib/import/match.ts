/**
 * Group executions into round-trip trades.
 *
 * Walks each symbol's fills chronologically tracking net position. A trade opens
 * when position leaves zero and closes when it returns to zero; scaling in/out
 * stays within one trade, and a fill that flips through zero splits into a close
 * + a new opposite trade. (See docs/product/PRODUCT_SPEC.md §5.)
 */
import type { ParsedExecution } from "./tos";

export type MatchedTrade = {
  symbol: string;
  side: "long" | "short";
  quantity: number; // shares opened
  avgEntryPrice: number;
  entryAt: number;
  avgExitPrice: number | null;
  exitAt: number | null;
  fees: number;
  status: "open" | "closed";
  pnl: number; // realized
  executionHashes: string[];
};

type Builder = {
  symbol: string;
  side: "long" | "short";
  openQty: number;
  openCost: number; // sum(price * qty) of opening fills
  closeQty: number;
  closeProceeds: number; // sum(price * qty) of closing fills
  fees: number;
  firstAt: number;
  lastAt: number;
  position: number; // remaining open shares (>0)
  hashes: Set<string>;
};

function finalize(b: Builder): MatchedTrade {
  const avgEntryPrice = b.openCost / b.openQty;
  const avgExitPrice = b.closeQty > 0 ? b.closeProceeds / b.closeQty : null;
  const matched = Math.min(b.openQty, b.closeQty);
  const closed = b.position === 0 && b.closeQty > 0;
  const pnl =
    avgExitPrice == null
      ? 0
      : (b.side === "long"
          ? avgExitPrice - avgEntryPrice
          : avgEntryPrice - avgExitPrice) *
          matched -
        b.fees;
  return {
    symbol: b.symbol,
    side: b.side,
    quantity: b.openQty,
    avgEntryPrice,
    entryAt: b.firstAt,
    avgExitPrice,
    exitAt: closed ? b.lastAt : null,
    fees: b.fees,
    status: closed ? "closed" : "open",
    pnl,
    executionHashes: [...b.hashes],
  };
}

export function matchTrades(executions: ParsedExecution[]): MatchedTrade[] {
  const bySymbol = new Map<string, ParsedExecution[]>();
  for (const e of executions) {
    if (!bySymbol.has(e.symbol)) bySymbol.set(e.symbol, []);
    bySymbol.get(e.symbol)!.push(e);
  }

  const trades: MatchedTrade[] = [];

  for (const fills of bySymbol.values()) {
    fills.sort((a, b) => a.executedAt - b.executedAt);
    let b: Builder | null = null;

    for (const f of fills) {
      let remaining = f.quantity;
      const isBuy = f.side === "buy";

      while (remaining > 0) {
        if (!b) {
          b = {
            symbol: f.symbol,
            side: isBuy ? "long" : "short",
            openQty: 0,
            openCost: 0,
            closeQty: 0,
            closeProceeds: 0,
            fees: 0,
            firstAt: f.executedAt,
            lastAt: f.executedAt,
            position: 0,
            hashes: new Set(),
          };
        }

        const opening =
          (b.side === "long" && isBuy) || (b.side === "short" && !isBuy);
        b.hashes.add(f.sourceRowHash);
        b.lastAt = f.executedAt;

        if (opening) {
          b.openQty += remaining;
          b.openCost += f.price * remaining;
          b.position += remaining;
          b.fees += allocFee(f, remaining);
          remaining = 0;
        } else {
          const closeQty = Math.min(remaining, b.position);
          b.closeQty += closeQty;
          b.closeProceeds += f.price * closeQty;
          b.position -= closeQty;
          b.fees += allocFee(f, closeQty);
          remaining -= closeQty;
          if (b.position === 0) {
            trades.push(finalize(b));
            b = null; // any `remaining` opens a new (flipped) trade next loop
          }
        }
      }
    }

    if (b) trades.push(finalize(b)); // still-open position
  }

  trades.sort((a, b) => a.entryAt - b.entryAt || a.symbol.localeCompare(b.symbol));
  return trades;
}

/** Allocate a fill's fee proportionally to the matched share count. */
function allocFee(f: ParsedExecution, qty: number): number {
  if (f.quantity === 0) return 0;
  return (f.fees * qty) / f.quantity;
}
