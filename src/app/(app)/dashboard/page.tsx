import Link from "next/link";

const phaseModes = [
  {
    title: "Morning plan",
    time: "Pre-market / open",
    job: "Name the tape, choose the first rule, and set the session guardrail.",
    active: true,
  },
  {
    title: "Midday reset",
    time: "Lunch window",
    job: "Decide whether the market still deserves attention or risk should come down.",
    active: false,
  },
  {
    title: "Power hour / EOD",
    time: "Late session",
    job: "Capture what changed and stage the daily recap handoff.",
    active: false,
  },
];

const promptFields = [
  {
    label: "Market read",
    placeholder: "Hot, choppy, selective, thin, theme-driven, or no clean edge.",
  },
  {
    label: "Trader state",
    placeholder: "Calm, FOMO, impatient, frustrated, confident, tired.",
  },
  {
    label: "Next action",
    placeholder: "Wait, trade only A+ setups, risk down, stop, or press if quality holds.",
  },
  {
    label: "Does it match?",
    placeholder: "Does current behavior still match the tape, risk plan, and active rule?",
  },
];

const focusItems = [
  {
    label: "Current experiment",
    value: "No third-extension entries unless volume is increasing and risk is defined.",
  },
  {
    label: "Risk guardrail",
    value: "Stop new attempts if losses cluster or trade count reaches the plan limit.",
  },
  {
    label: "Dashboard cue",
    value: "Missing the first move is not a reason to lower standards.",
  },
];

const pulseItems = [
  { label: "Realized P&L", value: "$0", tone: "neutral" },
  { label: "Trades", value: "0", tone: "neutral" },
  { label: "Risk posture", value: "Normal", tone: "focus" },
  { label: "Max loss room", value: "Available", tone: "neutral" },
];

const stickyCues = [
  "Only A+ continuation setups.",
  "Size follows tape quality.",
  "Green in cold tape is enough.",
  "Write the reason before the next click.",
];

const handoffRows = [
  {
    source: "Check-in answers",
    destination: "Daily recap",
    detail: "Timestamped market read, trader state, decision, and next action.",
  },
  {
    source: "Session notes",
    destination: "Journal context",
    detail: "Short in-session observations before memory rewrites the day.",
  },
  {
    source: "Cue outcome",
    destination: "Coach input",
    detail: "Followed, missed, carried forward, retired, or changed.",
  },
];

const loopSteps = [
  "Journal captures the record",
  "Coach synthesizes the lesson",
  "Dashboard keeps it visible",
  "Check-ins return to Journal",
];

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[11px] font-semibold uppercase text-[var(--muted)]">
      {children}
    </div>
  );
}

function Section({
  title,
  eyebrow,
  children,
  className = "",
  emphasis = false,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  emphasis?: boolean;
}) {
  return (
    <section
      className={`rounded-md border p-5 ${
        emphasis
          ? "border-[var(--blue)] bg-[var(--surface)]"
          : "border-[var(--hairline)] bg-transparent"
      } ${className}`}
    >
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function PhaseCard({ mode }: { mode: (typeof phaseModes)[number] }) {
  return (
    <div
      className={`rounded-md border p-4 ${
        mode.active ? "border-[var(--blue)] bg-[var(--surface)]" : "border-[var(--hairline)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{mode.title}</h3>
        <span className="font-mono text-[11px] text-[var(--muted)]">{mode.time}</span>
      </div>
      <p className="mt-3 text-sm leading-6 text-[var(--body)]">{mode.job}</p>
    </div>
  );
}

function TextPrompt({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <label className="block rounded-md border border-[var(--hairline)] p-4">
      <span className="font-mono text-[11px] font-semibold uppercase text-[var(--muted)]">
        {label}
      </span>
      <span className="mt-2 block min-h-16 rounded border border-dashed border-[var(--hairline)] px-3 py-2 text-sm leading-6 text-[var(--muted)]">
        {placeholder}
      </span>
    </label>
  );
}

function FocusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-[var(--hairline)] py-3 last:border-b-0">
      <div className="font-mono text-[11px] font-semibold uppercase text-[var(--muted)]">{label}</div>
      <p className="mt-1 text-sm leading-6 text-[var(--body)]">{value}</p>
    </div>
  );
}

function PulseItem({ label, value, tone }: { label: string; value: string; tone: string }) {
  const color = tone === "focus" ? "text-[var(--blue)]" : "text-[var(--foreground)]";

  return (
    <div className="rounded border border-[var(--hairline)] px-3 py-2">
      <div className="font-mono text-[11px] text-[var(--muted)]">{label}</div>
      <div className={`mt-1 font-mono text-base font-semibold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function HandoffRow({ row }: { row: (typeof handoffRows)[number] }) {
  return (
    <div className="grid gap-3 border-b border-[var(--hairline)] py-4 last:border-b-0 md:grid-cols-[180px_160px_1fr]">
      <div>
        <div className="font-mono text-[11px] font-semibold uppercase text-[var(--muted)]">Source</div>
        <div className="mt-1 text-sm font-semibold text-[var(--foreground)]">{row.source}</div>
      </div>
      <div>
        <div className="font-mono text-[11px] font-semibold uppercase text-[var(--muted)]">Writes to</div>
        <div className="mt-1 text-sm text-[var(--body)]">{row.destination}</div>
      </div>
      <p className="text-sm leading-6 text-[var(--body)]">{row.detail}</p>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <header className="space-y-4">
        <Eyebrow>Dashboard wireframe</Eyebrow>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--foreground)]">
              Dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-[var(--body)]">
              Planning, accountability, and check-ins for the trading day. Dashboard prompts the
              live moment, keeps the active lesson visible, and routes context back into Journal.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/journal"
              className="inline-flex h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--body)] transition-colors hover:border-[var(--blue)] hover:text-[var(--foreground)]"
            >
              Open Journal
            </Link>
            <Link
              href="/import"
              className="inline-flex h-10 items-center rounded-md border border-[var(--blue)] px-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:bg-[var(--surface)]"
            >
              Import / refresh
            </Link>
          </div>
        </div>
      </header>

      <Section title="Current phase" eyebrow="Start here" emphasis>
        <div className="grid gap-3 md:grid-cols-3">
          {phaseModes.map((mode) => (
            <PhaseCard key={mode.title} mode={mode} />
          ))}
        </div>
      </Section>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-8">
          <Section title="Active check-in" eyebrow="Dashboard prompts">
            <div className="grid gap-4 sm:grid-cols-2">
              {promptFields.map((field) => (
                <TextPrompt key={field.label} label={field.label} placeholder={field.placeholder} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <button className="h-10 rounded-md border border-[var(--blue)] px-3 text-sm font-semibold text-[var(--foreground)]">
                Save check-in to Journal
              </button>
              <button className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--body)]">
                Ask coach later
              </button>
            </div>
          </Section>

          <Section title="Journal handoff" eyebrow="Where the work goes">
            <p className="max-w-3xl text-sm leading-6 text-[var(--body)]">
              Dashboard entries are lightweight. The durable record lives in the daily recap, where
              check-ins, notes, trade evidence, and cue outcomes become coach context.
            </p>
            <div className="mt-2">
              {handoffRows.map((row) => (
                <HandoffRow key={row.source} row={row} />
              ))}
            </div>
          </Section>
        </div>

        <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
          <Section title="Active focus" eyebrow="Dashboard reminds">
            <div>
              {focusItems.map((item) => (
                <FocusItem key={item.label} label={item.label} value={item.value} />
              ))}
            </div>
          </Section>

          <Section title="Account pulse" eyebrow="Intraday context">
            <div className="grid grid-cols-2 gap-3">
              {pulseItems.map((item) => (
                <PulseItem key={item.label} label={item.label} value={item.value} tone={item.tone} />
              ))}
            </div>
          </Section>

          <Section title="Sticky cues" eyebrow="Plan adherence">
            <div className="space-y-2">
              {stickyCues.map((cue) => (
                <div
                  key={cue}
                  className="rounded border border-dashed border-[var(--hairline)] px-3 py-2 text-sm leading-6 text-[var(--body)]"
                >
                  {cue}
                </div>
              ))}
            </div>
          </Section>
        </aside>
      </div>

      <Section title="Learning loop" eyebrow="System model">
        <div className="grid gap-3 md:grid-cols-4">
          {loopSteps.map((step, index) => (
            <div key={step} className="rounded-md border border-[var(--hairline)] p-4">
              <div className="font-mono text-[11px] text-[var(--muted)]">
                {String(index + 1).padStart(2, "0")}
              </div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[var(--foreground)]">{step}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--body)]">
          Insights and trade evidence flow through the system as context. They are not separate
          dashboard sections; they help Journal, Coach, and Dashboard stay connected.
        </p>
      </Section>
    </div>
  );
}
