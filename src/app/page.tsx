import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";

export const dynamic = "force-dynamic";

async function counts() {
  const [executions, trades, candles] = await Promise.all([
    db.select({ n: sql<number>`count(*)` }).from(schema.executions),
    db.select({ n: sql<number>`count(*)` }).from(schema.trades),
    db.select({ n: sql<number>`count(*)` }).from(schema.candles),
  ]);
  return {
    executions: executions[0]?.n ?? 0,
    trades: trades[0]?.n ?? 0,
    candles: candles[0]?.n ?? 0,
  };
}

const phases = [
  { n: 1, label: "Execution & trade model", done: true },
  { n: 2, label: "TOS import → trades", done: true },
  { n: 3, label: "Trade chart + Massive candles", done: true },
  { n: 4, label: "Analytics", done: false },
  { n: 5, label: "Review & journaling", done: false },
];

export default async function Home() {
  const c = await counts();
  const stats = [
    { label: "Executions", value: c.executions },
    { label: "Trades", value: c.trades },
    { label: "Candles cached", value: c.candles },
  ];

  return (
    <div className="max-w-3xl space-y-8">
      <section>
        <h1 className="text-xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-[var(--muted)] mt-1">
          Local-first trading journal. SQLite is live and empty — import a
          ThinkorSwim Account Statement to get started.
        </p>
      </section>

      <section className="grid grid-cols-3 gap-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4"
          >
            <div className="text-2xl font-semibold tabular-nums">{s.value}</div>
            <div className="text-xs text-[var(--muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-[var(--muted)] uppercase tracking-wide">
          Build progress
        </h2>
        <ul className="mt-3 space-y-1.5 text-sm">
          {phases.map((p) => (
            <li key={p.n} className="flex items-center gap-2">
              <span className={p.done ? "text-[var(--green)]" : "text-[var(--muted)]"}>
                {p.done ? "✓" : "○"}
              </span>
              <span className={p.done ? "" : "text-[var(--muted)]"}>
                Phase {p.n} — {p.label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
