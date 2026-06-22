"use client";

import Link from "next/link";
import { useState } from "react";

type Surface = "dashboard" | "journal";

const compactRecap =
  "Green day with 17 trades and a 65% win rate. INHD was the best lift at $364.00, while OCC was the main drag at -$124.00. The main thing to carry forward is that the better trades had time to work; stay patient when the move confirms instead of forcing extra entries.";

const dashboardInputs = [
  ["Pre-market", "Only trade clean reclaim setups. No opening-extension chase."],
  ["Midday", "Tape got thinner. One good trade left only if volume returns."],
  ["End of day", "Skipped the third-extension entry. Good restraint."],
];

const journalStats = [
  ["Trades", "17"],
  ["P&L", "+$1,312.57"],
  ["Win rate", "65%"],
  ["Best lift", "INHD"],
];

const carryForward = [
  ["Current experiment", "No third-extension entries unless volume is expanding."],
  ["Risk guardrail", "Two avoidable rule breaks ends active trading."],
  ["Dashboard cue", "Missing the first move is not a reason to lower standards."],
];

export default function JournalContentReviewPage() {
  const [surface, setSurface] = useState<Surface>("dashboard");
  const [imported, setImported] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [coachReviewed, setCoachReviewed] = useState(false);
  const [notes, setNotes] = useState(
    "I noticed the urge to keep trading after the morning win. The most important decision was accepting that the tape got thinner and not giving back the day.",
  );

  function importTrades() {
    setImported(true);
    setSurface("journal");
    setEditorOpen(true);
  }

  function saveRecap() {
    setCoachReviewed(true);
    setEditorOpen(false);
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--body)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 lg:px-10">
        <div>
          <Link
            href="/review/journal"
            className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--blue)] hover:text-[var(--foreground)]"
          >
            ← Review hub
          </Link>
        </div>

        <header className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <Eyebrow>Clickable prototype</Eyebrow>
            <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--foreground)] md:text-5xl">
              Daily recap flow prototype
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[var(--prose)]">
              A lightweight click-through for the core flow: dashboard captures
              the day, trade import opens the recap editor, the journal stores
              the recap, and the dashboard carries the lesson forward.
            </p>
          </div>

          <nav className="flex flex-wrap gap-2" aria-label="Prototype surfaces">
            <SurfaceButton
              active={surface === "dashboard"}
              label="Dashboard"
              onClick={() => {
                setSurface("dashboard");
                setEditorOpen(false);
              }}
            />
            <SurfaceButton
              active={surface === "journal"}
              label="Journal"
              onClick={() => {
                setSurface("journal");
                setEditorOpen(false);
              }}
            />
            <ImportButton imported={imported} onClick={importTrades} />
          </nav>
        </header>

        {surface === "dashboard" ? (
          <DashboardView
            imported={imported}
            coachReviewed={coachReviewed}
            onJournal={() => {
              setSurface("journal");
              setEditorOpen(false);
            }}
          />
        ) : null}

        {surface === "journal" && !editorOpen ? (
          <JournalView
            imported={imported}
            coachReviewed={coachReviewed}
            onOpenEditor={() => setEditorOpen(true)}
          />
        ) : null}

        {surface === "journal" && editorOpen ? (
          <RecapEditor
            notes={notes}
            onNotesChange={setNotes}
            onClose={() => setEditorOpen(false)}
            onSave={saveRecap}
          />
        ) : null}
      </div>
    </main>
  );
}

function DashboardView({
  imported,
  coachReviewed,
  onJournal,
}: {
  imported: boolean;
  coachReviewed: boolean;
  onJournal: () => void;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="space-y-6">
        <Panel tone="blue" roomy>
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div>
              <Eyebrow>Dashboard</Eyebrow>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
                Active trading day
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--prose)]">
                The dashboard handles the lightweight intraday check-ins. Trade
                data can strengthen the recap, but the dashboard is mostly about
                planning, accountability, and prompts.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {dashboardInputs.map(([label, body]) => (
              <div
                key={label}
                className="rounded-lg border border-[var(--hairline)] bg-[rgba(255,255,255,.02)] p-5"
              >
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--blue)]">
                  {label}
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--prose)]">
                  {body}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        {coachReviewed ? (
          <Panel tone="green">
            <Eyebrow>Resurfaced from journal</Eyebrow>
            <h2 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
              Tomorrow&apos;s focus
            </h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              {carryForward.map(([label, body]) => (
                <FocusCard key={label} label={label} body={body} />
              ))}
            </div>
          </Panel>
        ) : null}
      </div>

      <aside className="space-y-4">
        <Panel>
          <Eyebrow>Status</Eyebrow>
          <StatusRow label="Trades imported" done={imported} />
          <StatusRow label="Daily recap reviewed" done={coachReviewed} />
          <StatusRow label="Dashboard cues ready" done={coachReviewed} />
          {imported ? (
            <button
              type="button"
              onClick={onJournal}
              className="mt-5 h-10 w-full rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--foreground)]"
            >
              Open journal day
            </button>
          ) : null}
        </Panel>

        <Panel>
          <Eyebrow>Shared day record</Eyebrow>
          <p className="mt-3 text-sm leading-6 text-[var(--prose)]">
            Dashboard check-ins and trade import both attach to the same June 8
            journal day. The dashboard reads the active lesson back from that
            record after review.
          </p>
        </Panel>
      </aside>
    </section>
  );
}

function JournalView({
  imported,
  coachReviewed,
  onOpenEditor,
}: {
  imported: boolean;
  coachReviewed: boolean;
  onOpenEditor: () => void;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <Eyebrow>Journal</Eyebrow>
          <h2 className="mt-3 text-4xl font-semibold leading-none text-[var(--foreground)]">
            June 8 <span className="text-2xl text-[var(--muted)]">Monday</span>
          </h2>
        </div>
      </div>

      {!imported ? (
        <Panel tone="blue">
          <Eyebrow>No import yet</Eyebrow>
          <h3 className="mt-3 text-xl font-semibold text-[var(--foreground)]">
            Import trades to start the daily recap review
          </h3>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--prose)]">
            This would usually happen right after the trading session. Importing
            gives the recap its P&L, tickers, and trade context.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--blue)]">
            Use Import trades in the top nav
          </p>
        </Panel>
      ) : (
        <button
          type="button"
          onClick={onOpenEditor}
          className="block w-full rounded-lg border border-[rgba(77,155,255,.36)] bg-[rgba(18,21,29,.72)] p-6 text-left transition-colors hover:border-[rgba(77,155,255,.7)]"
        >
          <p className="text-xl leading-9 text-[var(--body)]">{compactRecap}</p>
          <div className="mt-5 grid gap-4 border-t border-[var(--hairline)] pt-5 sm:grid-cols-4">
            {journalStats.map(([label, value]) => (
              <div key={label}>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {label}
                </div>
                <div
                  className={`mt-1 font-mono text-sm ${
                    label === "P&L" ? "text-[var(--green)]" : "text-[var(--foreground)]"
                  }`}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-[var(--hairline)] pt-4">
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Click recap to edit
            </span>
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--blue)]">
              View full recap
            </span>
          </div>
        </button>
      )}

      {coachReviewed ? (
        <Panel tone="green">
          <Eyebrow>Coach review attached</Eyebrow>
          <p className="mt-3 text-sm leading-6 text-[var(--prose)]">
            Narrative on the day, execution feedback, statistical read, and
            carry-forward cues have been added to this daily recap.
          </p>
        </Panel>
      ) : null}
    </section>
  );
}

function RecapEditor({
  notes,
  onNotesChange,
  onClose,
  onSave,
}: {
  notes: string;
  onNotesChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <section className="rounded-lg border border-[rgba(232,174,76,.34)] bg-[rgba(18,21,29,.8)] p-6 md:p-7">
      <div className="flex flex-col gap-5 border-b border-[var(--hairline)] pb-6 md:flex-row md:items-start md:justify-between">
        <div>
          <Eyebrow>Full-page editor</Eyebrow>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
            Daily recap review
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[var(--prose)]">
            This is the take-over state after import. Add your thoughts, let the
            coach add feedback, then save back to the journal day.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-md border border-[var(--border)] px-4 text-sm font-semibold text-[var(--muted)]"
          >
            Close
          </button>
          <button
            type="button"
            onClick={onSave}
            className="h-10 rounded-md border border-[rgba(29,178,107,.42)] bg-[rgba(29,178,107,.08)] px-4 text-sm font-semibold text-[var(--foreground)]"
          >
            Save review
          </button>
        </div>
      </div>

      <div className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <section>
            <Eyebrow>Generated summary</Eyebrow>
            <textarea
              className="mt-3 min-h-32 w-full resize-y rounded-md border border-[rgba(77,155,255,.34)] bg-[rgba(7,9,13,.55)] p-4 text-base leading-8 text-[var(--body)] outline-none focus:border-[rgba(77,155,255,.7)]"
              defaultValue={compactRecap}
            />
          </section>

          <section>
            <Eyebrow>Your notes before coach</Eyebrow>
            <textarea
              value={notes}
              onChange={(event) => onNotesChange(event.target.value)}
              className="mt-3 min-h-36 w-full resize-y rounded-md border border-[var(--border)] bg-[rgba(7,9,13,.55)] p-4 text-base leading-7 text-[var(--body)] outline-none focus:border-[rgba(77,155,255,.7)]"
            />
          </section>

          <section>
            <Eyebrow>Coach adds</Eyebrow>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <MiniCard
                title="Narrative on the day"
                body="You made most of the money when you waited for confirmation."
              />
              <MiniCard
                title="Execution feedback"
                body="Best trades matched your system; weak trades came from lowering standards."
              />
              <MiniCard
                title="Statistical read"
                body="P&L was front-loaded. Afternoon attempts added noise."
              />
              <MiniCard
                title="Carry forward"
                body="No third-extension entries unless volume is expanding."
              />
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <Panel>
            <Eyebrow>Dashboard inputs</Eyebrow>
            <div className="mt-4 space-y-4">
              {dashboardInputs.map(([label, body]) => (
                <MiniCard key={label} title={label} body={body} />
              ))}
            </div>
          </Panel>
        </aside>
      </div>
    </section>
  );
}

function StatusRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="mt-4 flex items-center justify-between gap-4 border-t border-[var(--hairline)] pt-4 first:mt-0 first:border-t-0 first:pt-0">
      <span className="text-sm text-[var(--prose)]">{label}</span>
      <span
        className={`font-mono text-[11px] uppercase tracking-[0.16em] ${
          done ? "text-[var(--green)]" : "text-[var(--muted)]"
        }`}
      >
        {done ? "Done" : "Pending"}
      </span>
    </div>
  );
}

function SurfaceButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-md border px-4 text-sm font-semibold ${
        active
          ? "border-[rgba(77,155,255,.42)] bg-[rgba(77,155,255,.08)] text-[var(--foreground)]"
          : "border-[var(--border)] text-[var(--muted)]"
      }`}
    >
      {label}
    </button>
  );
}

function ImportButton({
  imported,
  onClick,
}: {
  imported: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-md border px-4 text-sm font-semibold ${
        imported
          ? "border-[rgba(29,178,107,.42)] bg-[rgba(29,178,107,.08)] text-[var(--foreground)]"
          : "border-[rgba(77,155,255,.42)] bg-[rgba(77,155,255,.08)] text-[var(--foreground)]"
      }`}
    >
      {imported ? "Trades imported" : "Import trades"}
    </button>
  );
}

function Panel({
  children,
  tone = "neutral",
  roomy,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "blue" | "green";
  roomy?: boolean;
}) {
  const toneClass = {
    neutral: "border-[var(--border)]",
    blue: "border-[rgba(77,155,255,.34)]",
    green: "border-[rgba(29,178,107,.34)]",
  }[tone];

  return (
    <div
      className={`${toneClass} rounded-lg border bg-[rgba(18,21,29,.72)] ${
        roomy ? "p-6 md:p-7" : "p-5"
      }`}
    >
      {children}
    </div>
  );
}

function MiniCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-[var(--hairline)] bg-[rgba(255,255,255,.02)] p-4">
      <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--prose)]">{body}</p>
    </div>
  );
}

function FocusCard({ label, body }: { label: string; body: string }) {
  return (
    <div className="rounded-md border border-[rgba(29,178,107,.28)] bg-[rgba(29,178,107,.05)] p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--green)]">
        {label}
      </div>
      <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">{body}</p>
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
