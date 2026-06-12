/**
 * Shared trade P&L math, so the Trades table, trade detail, and Calendar all
 * agree. Gross = directional (exit − entry) × shares; Net = gross − fees
 * (the fee-inclusive "final" number we show as P&L).
 */
export type TradeLike = {
  side: string;
  quantity: number;
  avgEntryPrice: number | null;
  avgExitPrice: number | null;
  fees: number;
};

export function grossPnl(t: TradeLike): number | null {
  if (t.avgEntryPrice == null || t.avgExitPrice == null) return null;
  const dir = t.side === "long" ? 1 : -1;
  return (t.avgExitPrice - t.avgEntryPrice) * dir * t.quantity;
}

export function netPnl(t: TradeLike): number | null {
  const g = grossPnl(t);
  return g == null ? null : g - t.fees;
}
