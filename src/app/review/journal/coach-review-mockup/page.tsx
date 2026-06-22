"use client";

import Link from "next/link";
import { useState } from "react";

const compactRecap =
  "Green day with 17 trades and a 65% win rate. INHD was the best lift at $364.00, while OCC was the main drag at -$124.00. The main thing to carry forward is that the better trades had time to work; stay patient when the move confirms instead of forcing extra entries.";

const dashboardInputs = [
  {
    phase: "Pre-market",
    prompt: "Plan",
    value: "Only trade clean reclaim setups. No opening-extension chase.",
    context: "Market read: active but selective. Tickers in play: INHD, NPT, OCC.",
  },
  {
    phase: "Midday",
    prompt: "Reset",
    value: "Tape got thinner. One good trade left only if volume returns.",
    context: "Trader state: impatient after sitting. Risk posture: protect green.",
  },
  {
    phase: "End of day",
    prompt: "Handoff",
    value: "Skipped the third-extension entry. Good restraint.",
    context: "Cue outcome: followed the guardrail after missing the first move.",
  },
];

const coachNarrative = [
  {
    title: "Narrative on the day",
    body:
      "The day worked because your best trades had time to develop. You made most of the money when you waited for confirmation, then the risk increased when the tape slowed and you felt pressure to keep participating.",
  },
  {
    title: "Execution feedback",
    body:
      "Your strongest executions matched the system: reclaim, defined risk, and patience after confirmation. The weak spot was not trade selection at the open; it was the later urge to lower standards after missing the cleanest move.",
  },
  {
    title: "Behavior pattern",
    body:
      "The trigger was not being red on the day. The trigger was watching a move leave without you, then feeling urgency to catch the next extension. That pattern is specific enough to train against.",
  },
];

const statisticalRead = [
  {
    label: "P&L shape",
    value: "Front-loaded green",
    body: "Most profit came before midday. Afternoon activity added decision risk without materially improving expectancy.",
  },
  {
    label: "Setup quality",
    value: "Reclaims paid",
    body: "The trades that fit your defined A setup carried the day. Extension entries were lower quality.",
  },
  {
    label: "Market fit",
    value: "Morning edge",
    body: "Conditions supported the 3-4 hour goal. The later tape did not justify staying aggressive.",
  },
];

const carryForward = [
  {
    label: "Current experiment",
    body: "For the next 5 sessions, no third-extension entries unless volume is expanding and risk is defined before entry.",
  },
  {
    label: "Risk guardrail",
    body: "Two avoidable rule breaks ends active trading for the day.",
  },
  {
    label: "Dashboard cue",
    body: "Missing the first move is not a reason to lower standards.",
  },
];

export default function JournalCoachRecapPrototype() {
  const [reviewGenerated, setReviewGenerated] = useState(false);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--body)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Eyebrow>Static mockup</Eyebrow>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--foreground)] md:text-5xl">
              Coach review mockup
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--prose)]">
              A focused mockup of the full recap editor after dashboard inputs
              and trade data have been captured, showing what the coach adds and
              what gets carried forward.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/review/journal"
              className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted)]"
            >
              Review hub
            </Link>
            <Link
              href="/review/journal/prototype-flow"
              className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted)]"
            >
              Daily recap flow
            </Link>
          </div>
        </header>

        <section className="rounded-lg border border-[rgba(232,174,76,.34)] bg-[rgba(18,21,29,.8)] p-6 md:p-7">
          <div className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-6 md:flex-row md:items-start md:justify-between">
            <div>
              <Eyebrow>Journal</Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                June 8 daily recap review
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--prose)]">
                The user writes the recap first. Dashboard inputs remain visible
                as source context. The coach review is generated after the user
                is ready.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setReviewGenerated(true)}
              className="h-10 rounded-md border border-[rgba(77,155,255,.42)] bg-[rgba(77,155,255,.08)] px-4 text-sm font-semibold text-[var(--foreground)]"
            >
              Ask Coach
            </button>
          </div>

          <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-8">
              <section>
                <Eyebrow>Daily recap</Eyebrow>
                <div className="mt-3 rounded-md border border-[rgba(77,155,255,.34)] bg-[rgba(7,9,13,.55)] p-4 text-base leading-8 text-[var(--body)]">
                  {compactRecap}
                </div>
              </section>

              <section>
                <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                  <div>
                    <Eyebrow>Dashboard inputs</Eyebrow>
                    <h3 className="mt-2 text-xl font-semibold text-[var(--foreground)]">
                      Captured during the session
                    </h3>
                  </div>
                  <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
                    3 check-ins
                  </span>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  {dashboardInputs.map((item) => (
                    <DashboardInputCard key={item.phase} item={item} />
                  ))}
                </div>
              </section>

              {reviewGenerated ? (
                <>
                  <section>
                    <Eyebrow>Coach review</Eyebrow>
                    <div className="mt-4 space-y-4">
                      {coachNarrative.map((item) => (
                        <ReviewBlock key={item.title} {...item} />
                      ))}
                    </div>
                  </section>

                  <section>
                    <Eyebrow>Statistical read</Eyebrow>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {statisticalRead.map((item) => (
                        <StatCard key={item.label} {...item} />
                      ))}
                    </div>
                  </section>

                  <section>
                    <Eyebrow>What to carry forward</Eyebrow>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {carryForward.map((item) => (
                        <CarryCard key={item.label} {...item} />
                      ))}
                    </div>
                  </section>
                </>
              ) : (
                <section className="rounded-lg border border-dashed border-[var(--border)] bg-[rgba(255,255,255,.02)] p-6">
                  <Eyebrow>Coach review pending</Eyebrow>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--prose)]">
                    After the user adds their thoughts, Ask Coach adds narrative
                    feedback, execution feedback, statistical read, and
                    carry-forward items to this same daily recap.
                  </p>
                </section>
              )}
            </div>

            <aside className="space-y-4">
              <Panel>
                <Eyebrow>Coach context</Eyebrow>
                <ContextRow label="User recap" value="Complete" />
                <ContextRow label="Dashboard inputs" value="3 saved" />
                <ContextRow label="Trade data" value="17 trades" />
                <ContextRow label="Trade notes" value="3 notable" />
              </Panel>

              <Panel tone="blue">
                <Eyebrow>Dashboard return</Eyebrow>
                <p className="mt-3 text-sm leading-6 text-[var(--prose)]">
                  Carry-forward items become tomorrow&apos;s active experiment,
                  risk guardrail, and sticky dashboard cue.
                </p>
              </Panel>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function DashboardInputCard({
  item,
}: {
  item: { phase: string; prompt: string; value: string; context: string };
}) {
  return (
    <div className="rounded-md border border-[rgba(77,155,255,.24)] bg-[rgba(77,155,255,.04)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--blue)]">
        {item.phase} / {item.prompt}
      </div>
      <p className="mt-3 text-sm font-semibold leading-6 text-[var(--foreground)]">
        {item.value}
      </p>
      <p className="mt-2 text-sm leading-6 text-[var(--prose)]">
        {item.context}
      </p>
    </div>
  );
}

function ReviewBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-[rgba(29,178,107,.28)] bg-[rgba(29,178,107,.04)] p-5">
      <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-3 text-base leading-7 text-[var(--prose)]">{body}</p>
    </div>
  );
}

function StatCard({
  label,
  value,
  body,
}: {
  label: string;
  value: string;
  body: string;
}) {
  return (
    <div className="rounded-md border border-[var(--hairline)] bg-[rgba(255,255,255,.02)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
        {label}
      </div>
      <div className="mt-2 text-base font-semibold text-[var(--foreground)]">
        {value}
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--prose)]">{body}</p>
    </div>
  );
}

function CarryCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-md border border-[rgba(77,155,255,.3)] bg-[rgba(77,155,255,.05)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--blue)]">
        {label}
      </div>
      <p className="mt-2 text-sm font-semibold leading-6 text-[var(--foreground)]">
        {body}
      </p>
    </div>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--hairline)] pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <span className="text-sm text-[var(--prose)]">{label}</span>
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}

function Panel({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue";
}) {
  const toneClass =
    tone === "blue" ? "border-[rgba(77,155,255,.34)]" : "border-[var(--border)]";

  return (
    <div className={`${toneClass} rounded-lg border bg-[rgba(18,21,29,.72)] p-5`}>
      {children}
    </div>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
      {children}
    </div>
  );
}
