import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { getCandles } from "@/lib/candles";
import TradeChart from "@/components/TradeChart";
import { fmtDate, fmtMoney, fmtPrice } from "@/lib/format";
import { addTradeNoteAction } from "./actions";

export const dynamic = "force-dynamic";

const timeFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/New_York",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const fmtTime = (t: number) => timeFmt.format(new Date(t * 1000));

function holdingPeriod(from: number, to: number): string {
  const s = Math.max(0, to - from);
  if (s < 60) return `${s}s`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m`;
  return `${Math.floor(m / 60)}h ${m % 60}m`;
}

export default async function TradeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const tradeId = Number(id);
  if (!Number.isInteger(tradeId)) notFound();

  const trade = (
    await db.select().from(schema.trades).where(eq(schema.trades.id, tradeId)).limit(1)
  )[0];
  if (!trade) notFound();

  const execs = await db
    .select()
    .from(schema.executions)
    .where(eq(schema.executions.tradeId, tradeId))
    .orderBy(asc(schema.executions.executedAt));

  const notes = await db
    .select()
    .from(schema.journalEntries)
    .where(eq(schema.journalEntries.tradeId, tradeId))
    .orderBy(asc(schema.journalEntries.createdAt));

  const lastAt = trade.exitAt ?? execs.at(-1)?.executedAt ?? trade.entryAt ?? 0;
  const firstAt = trade.entryAt ?? execs[0]?.executedAt ?? lastAt;
  const pad = 20 * 60; // 20 minutes either side
  const { candles, error } = await getCandles(trade.symbol, firstAt - pad, lastAt + pad);

  const dir = trade.side === "long" ? 1 : -1;
  const gross =
    trade.avgEntryPrice != null && trade.avgExitPrice != null
      ? (trade.avgExitPrice - trade.avgEntryPrice) * dir * trade.quantity
      : null;
  const net = gross == null ? null : gross - trade.fees;

  const pct =
    net != null && trade.avgEntryPrice
      ? (net / (trade.avgEntryPrice * trade.quantity)) * 100
      : null;

  type Stat = { label: string; value: string; sub?: string; color?: string };
  const stats: Stat[] = [
    { label: "Shares", value: trade.quantity.toLocaleString() },
    { label: "Fills", value: String(execs.length) },
    { label: "Held", value: trade.exitAt ? holdingPeriod(firstAt, trade.exitAt) : "open" },
    {
      label: "P&L",
      value: net == null ? "—" : fmtMoney(net),
      sub: pct == null ? undefined : `${pct >= 0 ? "+" : ""}${pct.toFixed(2)}%`,
      color:
        net == null ? undefined : net >= 0 ? "var(--green)" : "var(--red)",
    },
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="space-y-2">
        <Link href="/trades" className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--foreground)]">
          &lt; Back
        </Link>
        <h1 className="text-xl font-semibold tracking-tight">
          {trade.symbol}
          {trade.side === "short" && (
            <span className="ml-2 align-middle rounded bg-[var(--red)]/15 px-1.5 py-0.5 text-xs font-semibold text-[var(--red)]">
              SHORT
            </span>
          )}
          <span className="ml-2 text-sm font-normal text-[var(--muted)]">
            {fmtDate(trade.entryAt)}
          </span>
        </h1>
      </div>

      <section className="grid grid-cols-4 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3"
          >
            <div
              className="text-2xl font-semibold tabular-nums"
              style={s.color ? { color: s.color } : undefined}
            >
              {s.value}
              {s.sub && (
                <span className="ml-1.5 text-sm font-normal">{s.sub}</span>
              )}
            </div>
            <div className="mt-1 text-sm font-semibold text-[var(--muted)]">
              {s.label}
            </div>
          </div>
        ))}
      </section>

      {error ? (
        <div className="rounded-lg border border-[var(--red)]/40 bg-[var(--red)]/10 px-4 py-3 text-sm text-[var(--red)]">
          Couldn&apos;t load candles: {error}
        </div>
      ) : (
        <TradeChart
          candles={candles}
          markers={execs.map((e) => ({
            t: e.executedAt,
            price: e.price,
            side: e.side as "buy" | "sell",
          }))}
        />
      )}

      <section>
        <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide mb-2">
          Executions
        </h2>
        <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[var(--muted)] border-b border-[var(--border)]">
                {["Time (ET)", "Side", "Shares", "Price", "Effect"].map((c) => (
                  <th key={c} className="px-3 py-2 font-medium">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {execs.map((e) => (
                <tr key={e.id} className="border-b border-[var(--border)] last:border-0">
                  <td className="px-3 py-1.5 tabular-nums">{fmtTime(e.executedAt)}</td>
                  <td
                    className="px-3 py-1.5"
                    style={{ color: e.side === "buy" ? "var(--green)" : "var(--red)" }}
                  >
                    {e.side.toUpperCase()}
                  </td>
                  <td className="px-3 py-1.5 tabular-nums">{e.quantity.toLocaleString()}</td>
                  <td className="px-3 py-1.5 tabular-nums">{fmtPrice(e.price)}</td>
                  <td className="px-3 py-1.5 text-[var(--muted)]">{e.posEffect ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide">
            Trade Journal
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Add a lightweight trade note here. It will surface in the Journal under this trade&apos;s day, week, and month.
          </p>
        </div>

        <form action={addTradeNoteAction} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4">
          <input type="hidden" name="tradeId" value={trade.id} />
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-[var(--muted)]">Note</span>
              <textarea
                name="note"
                rows={4}
                placeholder="What happened? Good trade, bad trade, rule break, lesson, emotion, setup quality..."
                className="w-full resize-y rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-sm outline-none focus:border-[var(--blue)]"
              />
            </label>
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-[var(--muted)]">Emotion / process</span>
              <select
                name="emotionalState"
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[var(--blue)]"
                defaultValue=""
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
              <button type="submit" className="mt-3 h-10 rounded-md border border-[var(--blue)] px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]">
                Add note
              </button>
            </label>
          </div>
        </form>

        {notes.length > 0 && (
          <div className="space-y-2">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-3">
                {note.emotionalState && (
                  <div className="mb-2 inline-flex rounded-md border border-[var(--border)] px-2 py-1 text-xs font-semibold text-[var(--muted)]">
                    {note.emotionalState}
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm leading-6 text-[var(--foreground)]">
                  {note.lessons || note.thesis || note.whatWentWell || note.whatWentWrong || "No note text."}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
