"use client";

import Link from "next/link";
import heroBackground from "../../samples/landing-page/trading-journal-hero.png";
import { useEffect, useState } from "react";

const githubUrl = "https://github.com/trading-journal-ai/trading-journal";

const installCommand = `git clone ${githubUrl}.git
cd trading-journal
./install-trading-journal.sh`;

const walkthroughSteps = [
  {
    kicker: "Recap",
    desc: "Start with the day's story.",
    Screen: RecapScreen,
  },
  {
    kicker: "Review",
    desc: "Every trade right there to tag.",
    Screen: ReviewScreen,
  },
  {
    kicker: "Coach",
    desc: "Guided by the rules you set.",
    Screen: CoachScreen,
  },
];

const localCards = [
  {
    icon: "monitor",
    title: "On your machine",
    body: "Everything lives in a local SQLite file in your project folder. Stopping the app never touches your entries.",
  },
  {
    icon: "lock",
    title: "Private by default",
    body: "Your broker exports and notes are gitignored. Trade data stays yours unless you intentionally deploy or share it.",
  },
  {
    icon: "help",
    title: "No subscription",
    body: "No hosted account, no monthly fee, no signup. Reflection that does not depend on someone else's server.",
  },
  {
    icon: "github",
    title: "Open source · MIT",
    body: "Built in the open. Download it, fork it, run it, or use it as the starting point for your own journal.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0d12] text-[var(--foreground)]">
      <SiteHeader />

      <main>
        <Hero />
        <ReviewHabit />
        <CoachSection />
        <LearningLoopSection />
        <LocalFirstSection />
        <GetStartedSection />
      </main>

      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--hairline)] bg-[#0b0d12]/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1200px] items-center justify-between px-6 md:px-8">
        <Link href="/" className="flex items-center gap-2.5 text-[15.5px] font-bold tracking-tight">
          <span className="size-2.5 rounded-full bg-[var(--green)] shadow-[0_0_12px_rgba(29,178,107,.5)]" />
          <span>Trading Journal AI</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-5 text-[13.5px] font-medium text-[var(--body)] md:gap-7">
          <a href="#review" className="hidden transition-colors hover:text-[var(--foreground)] md:inline">
            The review habit
          </a>
          <a href="#coach" className="hidden transition-colors hover:text-[var(--foreground)] md:inline">
            AI coach
          </a>
          <a href="#local" className="hidden transition-colors hover:text-[var(--foreground)] lg:inline">
            Local-first
          </a>
          <a
            href={githubUrl}
            rel="noreferrer"
            target="_blank"
            className="hidden items-center gap-1.5 transition-colors hover:text-[var(--foreground)] sm:inline-flex"
          >
            GitHub
          </a>
          <Link
            href="/demo"
            className="inline-flex h-9 items-center rounded-lg bg-[var(--foreground)] px-4 text-[13.5px] font-semibold text-[#0b0d12] transition-opacity hover:opacity-90"
          >
            View the demo
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative isolate overflow-hidden border-b border-[var(--hairline)]">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 -z-30 hidden h-[620px] overflow-hidden md:block md:h-[670px] lg:h-[720px]">
        <div
          className="absolute inset-0 bg-[length:auto_94%] bg-[center_top] bg-no-repeat opacity-85 md:bg-[right_top]"
          style={{ backgroundImage: `url(${heroBackground.src})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#0b0d12_0%,rgba(11,13,18,.98)_30%,rgba(11,13,18,.8)_52%,rgba(11,13,18,.35)_78%,rgba(11,13,18,.18)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(11,13,18,0)_0%,rgba(11,13,18,.24)_58%,#0b0d12_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_36%,rgba(89,230,158,.12),transparent_34%)]" />
      </div>

      <div className="mx-auto w-full max-w-[1200px] px-6 pb-12 pt-16 md:px-8 md:pt-[72px] lg:pb-14">
        <div className="max-w-[760px]">
          <SectionEyebrow className="text-[11.5px] text-[var(--green)]">
            Local-first trading journal
          </SectionEyebrow>
          <h1 className="mt-5 max-w-[860px] text-balance text-[44px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[64px] md:text-[88px]">
            A journal-first trading review system.
          </h1>
          <p className="mt-6 max-w-[620px] text-pretty text-[19px] leading-[1.6] text-[var(--prose,#99a3b1)]">
            Trading Journal AI organizes your trades so they&apos;re easy to find, tag, and
            reflect on. Reviewing stays fast, and an AI coach guides you based on your
            rules.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row sm:items-center">
            <PrimaryButton href="/demo">View the live demo</PrimaryButton>
            <GhostButton href={githubUrl}>
              View on GitHub
            </GhostButton>
          </div>
          <p className="mt-[18px] font-mono text-xs text-[var(--muted)]">
            No signup · No subscription · Your data stays on your machine
          </p>
        </div>

        <HeroWalkthrough />
      </div>
    </section>
  );
}

function HeroWalkthrough() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => {
      setActive((current) => (current + 1) % walkthroughSteps.length);
    }, 4200);
    return () => clearTimeout(timer);
  }, [active, paused]);

  return (
    <div
      className="mt-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="mb-[22px] grid gap-3.5 sm:grid-cols-3">
        {walkthroughSteps.map((step, index) => {
          const isActive = index === active;
          const isComplete = index < active;
          return (
            <button
              key={step.kicker}
              type="button"
              onClick={() => setActive(index)}
              className="flex flex-col gap-2.5 text-left"
            >
              <span className="relative block h-0.5 overflow-hidden rounded-sm bg-[var(--border)]">
                {isActive ? (
                  <span
                    key={active}
                    className="absolute inset-0 origin-left bg-[var(--green)]"
                    style={{
                      transform: paused ? "scaleX(1)" : "scaleX(0)",
                      animation: paused ? "none" : "tj-growx 4.2s linear forwards",
                    }}
                  />
                ) : (
                  <span
                    className="absolute inset-0 origin-left bg-[var(--green)]"
                    style={{ transform: isComplete ? "scaleX(1)" : "scaleX(0)" }}
                  />
                )}
              </span>
              <span className="flex items-baseline gap-2">
                <span className={`font-mono text-[11px] ${isActive ? "text-[var(--green)]" : "text-[var(--faint)]"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className={`text-sm font-semibold ${isActive ? "text-[var(--foreground)]" : "text-[var(--muted)]"}`}>
                  {step.kicker}
                </span>
              </span>
              <span className={`text-[12.5px] leading-[1.45] ${isActive ? "text-[var(--body)]" : "text-[var(--muted)]"}`}>
                {step.desc}
              </span>
            </button>
          );
        })}
      </div>

      <BrowserFrame>
        <div className="grid">
          {walkthroughSteps.map((step, index) => {
            const isActive = index === active;
            return (
              <div
                key={step.kicker}
                aria-hidden={!isActive}
                className={`[grid-area:1/1] transition-opacity duration-500 ${
                  isActive ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
              >
                <step.Screen />
              </div>
            );
          })}
        </div>
      </BrowserFrame>
    </div>
  );
}

function ReviewHabit() {
  return (
    <section id="review" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-[1200px] px-6 pb-8 pt-24 md:px-8">
        <div className="max-w-[760px]">
          <SectionEyebrow className="text-[var(--green)]">The review habit</SectionEyebrow>
          <h2 className="mt-[18px] text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[40px]">
            Review faster. Gain insights.
            <br />
            Refine your process.
          </h2>
          <p className="mt-[22px] max-w-[640px] text-pretty text-[17.5px] leading-[1.6] text-[var(--prose,#99a3b1)]">
            Trading Journal AI brings notes, charts, P&amp;L, tags, and coaching into one
            journal-first workflow.
          </p>
        </div>

        {/* Feature 1: the day in context */}
        <div className="mt-16 grid gap-14 pb-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="order-2 lg:order-1">
            <PreviewFrame>
              <RecapScreen hideNav />
            </PreviewFrame>
          </div>
          <div className="order-1 lg:order-2 lg:pt-12">
            <p className="font-mono text-xs text-[var(--green)]">01 · See the day in context</p>
            <h3 className="mt-3.5 text-[25px] font-semibold leading-tight tracking-[-0.01em]">
              The recap leads, the data follows.
            </h3>
            <p className="mt-4 text-pretty text-base leading-[1.6] text-[var(--prose,#99a3b1)]">
              Open a day and the recap sits first: market read, execution, lesson. The
              trades and P&amp;L sit beside it for reference, not as the headline. The
              week and month are just containers you scroll back through.
            </p>
          </div>
        </div>

        {/* Feature 2: capture it fast (note + pills) */}
        <div className="grid gap-14 pt-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div className="lg:pt-12">
            <p className="font-mono text-xs text-[var(--green)]">02 · Capture it in seconds</p>
            <h3 className="mt-3.5 text-[25px] font-semibold leading-tight tracking-[-0.01em]">
              Tag the trade in your own language.
            </h3>
            <p className="mt-4 text-pretty text-base leading-[1.6] text-[var(--prose,#99a3b1)]">
              Write a sentence, then tap the pills that fit: one quality call,
              plus the process and emotion behind it. The same vocabulary every session,
              so patterns become searchable instead of buried in prose.
            </p>
            <div className="mt-[22px] flex flex-wrap gap-2">
              <Pill label="Best setup" tone="positive" active />
              <Pill label="Patient" tone="positive" active />
              <Pill label="Oversized" tone="negative" />
              <Pill label="FOMO" tone="negative" />
            </div>
          </div>
          <NoteComposerCard />
        </div>
      </div>
    </section>
  );
}

function CoachSection() {
  return (
    <section id="coach" className="scroll-mt-24">
      <div className="mx-auto grid w-full max-w-[1200px] gap-14 px-6 py-24 md:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <SparkIcon />
            <SectionEyebrow className="text-[var(--blue)]">The AI in Trading Journal AI</SectionEyebrow>
            <span className="rounded border border-[var(--border)] px-1.5 py-0.5 font-mono text-[10.5px] text-[var(--muted)]">
              Preview
            </span>
          </div>
          <h2 className="mt-[18px] text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[40px]">
            A coach that guides you by <span className="text-[var(--blue)]">your</span> rules.
          </h2>
          <p className="mt-[22px] max-w-[520px] text-pretty text-[17px] leading-[1.62] text-[var(--prose,#99a3b1)]">
            First you codify what an A+ trade looks like: the entry, risk, and
            process criteria you already track as pills. Then the coach reads every
            imported trade against that standard, flags where you drifted, and drafts the
            note and recap in your voice.
          </p>
          <div className="mt-[30px] space-y-4">
            {[
              ["01", "Codify your edge", "Turn your process pills into the rubric your coach reviews against."],
              ["02", "Review against it", "Each trade gets read against your own criteria, not generic advice."],
              ["03", "Draft, never auto-post", "The coach proposes the note and recap; you always edit before it saves."],
            ].map(([number, title, body]) => (
              <div key={number} className="grid grid-cols-[28px_1fr] gap-3.5">
                <span className="pt-0.5 font-mono text-xs text-[var(--blue)]">{number}</span>
                <div>
                  <h3 className="text-[15.5px] font-semibold">{title}</h3>
                  <p className="mt-1 text-sm leading-[1.5] text-[var(--prose,#99a3b1)]">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-[26px] font-mono text-[11.5px] text-[var(--faint)]">
            Concept preview. Runs on your trades, on your machine.
          </p>
        </div>
        <CoachCard />
      </div>
    </section>
  );
}

function LearningLoopSection() {
  const surfaces = [
    {
      verb: "Captures the record",
      title: "Journal",
      body: "The day's story: trades, recap, emotions, process notes, check-ins, charts, and the human context behind each decision.",
      forward: "Recap context, unresolved patterns, and carry-forward items into coach review.",
    },
    {
      verb: "Synthesizes",
      title: "Coach",
      body: "Reads journal context against trade evidence to say what worked, what broke, what mattered, and what to try next.",
      forward: "A current experiment, focus, or risk cue into carry-forward.",
    },
    {
      verb: "Prompts & reminds",
      title: "Dashboard",
      body: "Brings the lesson into the next session with plans, resets, market reads, emotional check-ins, and rule reminders.",
      forward: "Timestamped check-ins back into the daily recap; the next trading plan.",
    },
  ];

  return (
    <section id="learning-loop" className="scroll-mt-24 border-t border-[var(--hairline)]">
      <div className="mx-auto w-full max-w-[1200px] px-6 py-24 md:px-8">
        <div className="max-w-[760px]">
          <SectionEyebrow className="text-[var(--green)]">The learning loop</SectionEyebrow>
          <h2 className="mt-[18px] max-w-[760px] text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[40px]">
            Lessons shouldn&apos;t disappear into archived notes.
          </h2>
          <p className="mt-[22px] max-w-[720px] text-pretty text-[17px] leading-[1.62] text-[var(--prose,#99a3b1)]">
            Trading days are full of small moments that are easy to lose: the
            hesitation before an entry, the rule you bent, the cue that helped you stop.
            The journal keeps those moments with the story of the day. The coach turns
            them into a focused lesson, and the dashboard brings that lesson back into
            the next session while capturing the next round of check-ins.
          </p>
        </div>

        <div className="relative mt-14 overflow-hidden px-4 pb-0 pt-8 sm:px-6 lg:px-8">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[72px] h-[760px] w-[930px] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(29,178,107,.055)_0%,rgba(29,178,107,.04)_38%,rgba(16,22,24,.026)_62%,transparent_82%)] blur-[18px]"
          />
          <div className="relative mx-auto hidden h-[900px] max-w-[1080px] lg:block">
            <svg className="absolute inset-0 h-[720px] w-full overflow-visible" viewBox="0 0 1080 680" aria-hidden="true">
              <defs>
                <filter id="landing-loop-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="1.35" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <g className="tj-loop-orbit" style={{ transformOrigin: "540px 310px" }}>
                <circle className="tj-loop-dots" cx="540" cy="310" r="160" />
                <circle className="tj-loop-grain" cx="540" cy="310" r="201" />
                <circle className="tj-loop-dashes" cx="540" cy="310" r="146" />
              </g>
              <circle cx="540" cy="310" r="204" fill="none" stroke="var(--hairline)" strokeWidth="1.5" strokeDasharray="2 7" />
              <g fill="none" strokeLinecap="round">
                <path d="M468.2,507.3 A210 210 0 0 1 345.3,231.3" stroke="var(--green)" strokeWidth="2.5" opacity=".34" />
                <path d="M358.1,205 A210 210 0 0 1 741.9,252.1" stroke="var(--green)" strokeWidth="2.5" opacity=".34" />
                <path d="M748,280.8 A210 210 0 0 1 503.5,516.8" stroke="var(--green)" strokeWidth="2.5" opacity=".34" />
              </g>
              <g filter="url(#landing-loop-soft-glow)">
                <path className="tj-loop-flow tj-loop-flow-1" pathLength="1" d="M468.2,507.3 A210 210 0 0 1 345.3,231.3" />
                <path className="tj-loop-flow tj-loop-flow-2" pathLength="1" d="M358.1,205 A210 210 0 0 1 741.9,252.1" />
                <path className="tj-loop-flow tj-loop-flow-3" pathLength="1" d="M748,280.8 A210 210 0 0 1 503.5,516.8" />
              </g>
              <LoopNode x={358.1} y={205} label="01" />
              <LoopNode x={748} y={280.8} label="02" />
              <LoopNode x={468.2} y={507.3} label="03" />
            </svg>

            <div className="absolute left-[390px] top-[290px] w-[300px] text-center">
              <h3 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.02em]">
                Trading Journal
                <br />
                Learning Loop
              </h3>
            </div>

            <LoopDiagramCard
              number="01"
              label="Journal"
              title="Daily recap"
              body="The day&apos;s story: trades, check-ins, emotions, process notes, charts, and market context."
              className="left-6 top-[42px]"
            />
            <LoopDiagramCard
              number="02"
              label="Coach"
              title="Feedback"
              body="Synthesizes what worked, what broke, and what to try next from journal context and trade evidence."
              className="left-[792px] top-[94px]"
            />
            <LoopDiagramCard
              number="03"
              label="Dashboard"
              title="Check-ins + reminders"
              body="Prompts the moment: plan, market read, behavior, emotion. Resurfaces the active lesson and next-session cue."
              className="left-[306px] top-[584px]"
            />
          </div>

          <div className="relative lg:hidden">
            <div className="mx-auto grid h-[320px] max-w-[360px] place-items-center rounded-full border border-[var(--hairline)] bg-[radial-gradient(circle,rgba(29,178,107,.08),transparent_68%)]">
              <div className="rounded-full border border-[var(--border)] px-8 py-7 text-center">
                <h3 className="text-[25px] font-semibold leading-[1.12] tracking-[-0.02em]">
                  Trading Journal
                  <br />
                  Learning Loop
                </h3>
              </div>
            </div>
            <div className="mt-7 grid gap-4">
              <LoopDiagramCard number="01" label="Journal" title="Daily recap" body="The day&apos;s story, check-ins, trades, and context." />
              <LoopDiagramCard number="02" label="Coach" title="Feedback" body="Turns journal context and trade evidence into a focused lesson." />
              <LoopDiagramCard number="03" label="Dashboard" title="Check-ins + reminders" body="Brings the lesson into the next session and captures the next check-ins." />
            </div>
          </div>
        </div>

        <div className="mt-9">
          <SectionEyebrow className="text-[var(--green)]">Surface responsibilities</SectionEyebrow>
          <h3 className="mt-[18px] text-balance text-[28px] font-semibold leading-[1.12] tracking-[-0.02em] md:text-[34px]">
            Three surfaces, one job each
          </h3>
          <p className="mt-[18px] max-w-[720px] text-pretty text-[16.5px] leading-[1.62] text-[var(--prose,#99a3b1)]">
            The journal keeps the story of the day. The coach turns that story into a
            focused lesson. The dashboard carries the lesson into the next session,
            then captures the check-ins that start the loop again.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {surfaces.map((surface) => (
              <article key={surface.title} className="flex min-h-[250px] flex-col rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6">
                <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--green)]">
                  {surface.verb}
                </span>
                <h4 className="mt-2.5 text-xl font-semibold">{surface.title}</h4>
                <p className="mt-3 text-[13.5px] leading-[1.58] text-[var(--prose,#99a3b1)]">
                  {surface.body}
                </p>
                <div className="mt-auto pt-5">
                  <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--muted)]">Sends forward</p>
                  <p className="mt-2 flex gap-2 text-[13px] leading-[1.5] text-[var(--body)]">
                    <span className="text-[var(--green)]">→</span>
                    <span>{surface.forward}</span>
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function LoopNode({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r="13" fill="var(--surface)" stroke="var(--green)" strokeWidth="1.6" />
      <text
        x={x}
        y={y + 1}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="var(--green)"
        fontFamily="var(--font-geist-mono), ui-monospace, monospace"
        fontSize="8.5"
        fontWeight="700"
      >
        {label}
      </text>
    </g>
  );
}

function LoopDiagramCard({
  number,
  label,
  title,
  body,
  className = "",
}: {
  number: string;
  label: string;
  title: string;
  body: string;
  className?: string;
}) {
  return (
    <article className={`${className} rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[0_22px_54px_-26px_rgba(0,0,0,.8)] lg:absolute lg:w-[268px]`}>
      <div className="flex items-center gap-3">
        <span className="grid size-[34px] shrink-0 place-items-center rounded-full border border-[rgba(29,178,107,.55)] font-mono text-[13px] font-semibold text-[var(--green)]">
          {number}
        </span>
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--muted)]">
          {label}
        </span>
      </div>
      <h4 className="mt-[17px] text-[22px] font-semibold leading-tight tracking-[-0.015em]">
        {title}
      </h4>
      <p className="mt-3 text-[13.5px] leading-[1.6] text-[var(--prose,#99a3b1)]">
        {body}
      </p>
    </article>
  );
}

function LocalFirstSection() {
  return (
    <section id="local" className="scroll-mt-24 border-b border-[var(--hairline)] bg-[var(--surface)]">
      <div className="mx-auto grid w-full max-w-[1200px] gap-16 px-6 py-[90px] md:px-8 lg:grid-cols-2 lg:items-start">
        <div>
          <SectionEyebrow className="text-[var(--green)]">Local-first</SectionEyebrow>
          <h2 className="mt-[18px] text-balance text-[30px] font-semibold leading-[1.1] tracking-[-0.02em] md:text-[38px]">
            Your trading day never leaves your machine.
          </h2>
          <p className="mt-[22px] max-w-[620px] text-pretty text-[17px] leading-[1.62] text-[var(--prose,#99a3b1)]">
            It&apos;s the first thing serious traders ask about, and the answer is
            simple. A trading journal holds some of your most sensitive records: account
            history, positions, timestamps. Trading Journal AI is a personal tool, not a
            hosted service. It runs locally and stores everything on disk, so your review
            habit stays completely private.
          </p>
          <a
            href={githubUrl}
            rel="noreferrer"
            target="_blank"
            className="mt-7 inline-flex items-center gap-2 text-[15px] font-semibold text-[var(--blue)] transition-opacity hover:opacity-80"
          >
            Read how it works
            <ArrowRight className="ml-0" />
          </a>
        </div>
        <div className="grid overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--hairline)] md:grid-cols-2 md:gap-px">
          {localCards.map((card) => (
            <article key={card.title} className="bg-[#0b0d12] p-6">
              <LocalCardIcon icon={card.icon} />
              <h3 className="mt-4 text-base font-semibold">{card.title}</h3>
              <p className="mt-2 text-[13.5px] leading-[1.55] text-[var(--prose,#99a3b1)]">{card.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function GetStartedSection() {
  return (
    <section id="get-started" className="scroll-mt-24">
      <div className="mx-auto w-full max-w-[900px] px-6 py-24 text-center md:px-8">
        <SectionEyebrow>Get started</SectionEyebrow>
        <h2 className="mx-auto mt-5 max-w-[760px] text-balance text-[32px] font-semibold leading-[1.08] tracking-[-0.025em] md:text-[42px]">
          Try the demo, or run your own in two minutes.
        </h2>
        <p className="mx-auto mt-[22px] max-w-[560px] text-pretty text-[17px] leading-[1.6] text-[var(--prose,#99a3b1)]">
          Explore the hosted demo with seeded trades and journal notes, or clone the repo
          and start a private local journal with your own broker CSV.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3.5 sm:flex-row">
          <PrimaryButton href="/demo">View the live demo</PrimaryButton>
          <GhostButton href={githubUrl}>
            View on GitHub
          </GhostButton>
        </div>
        <InstallCommand />
      </div>
    </section>
  );
}

function InstallCommand() {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard?.writeText(installCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="mx-auto mt-10 max-w-[620px] text-left">
      <p className="mb-2.5 text-center font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        Or run it locally
      </p>
      <button
        type="button"
        onClick={copy}
        className="flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-[18px] py-[15px] text-left transition-colors hover:border-[var(--muted)]"
      >
        <code className="truncate font-mono text-[13px] text-[var(--body)]">
          <span className="text-[var(--muted)]">$ </span>
          git clone … &amp;&amp; ./install-trading-journal.sh
        </code>
        <span className={`shrink-0 font-mono text-xs font-semibold ${copied ? "text-[var(--green)]" : "text-[var(--muted)]"}`}>
          {copied ? "Copied ✓" : "Copy"}
        </span>
      </button>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-[var(--hairline)]">
      <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-4 px-6 py-[34px] md:flex-row md:items-center md:justify-between md:px-8">
        <div className="flex items-center gap-2.5">
          <span className="size-2 rounded-full bg-[var(--green)]" />
          <span className="text-[13.5px] font-semibold text-[var(--body)]">Trading Journal AI</span>
          <span className="ml-1.5 font-mono text-xs text-[var(--faint)]">trading-journal.ai</span>
        </div>
        <div className="flex gap-6 font-mono text-xs text-[var(--muted)]">
          <Link href="/demo" className="transition-colors hover:text-[var(--foreground)]">
            Demo
          </Link>
          <a
            href={githubUrl}
            rel="noreferrer"
            target="_blank"
            className="transition-colors hover:text-[var(--foreground)]"
          >
            GitHub
          </a>
          <span>MIT License</span>
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}

/* ── Product screen mocks (simplified re-creations of real app screens) ── */

function MiniNav({ active }: { active: string }) {
  const items = ["Calendar", "Trades", "Journal", "Reports"];
  return (
    <div className="flex items-center gap-7 border-b border-[var(--hairline)] px-7 py-4">
      <span className="text-[15px] font-bold tracking-tight">Trading Journal</span>
      <div className="flex gap-5">
        {items.map((item) => (
          <span
            key={item}
            className={`text-[13px] ${item === active ? "font-semibold text-[var(--foreground)]" : "font-medium text-[var(--muted)]"}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function RecapScreen({ hideNav = false }: { hideNav?: boolean }) {
  return (
    <div className="min-h-[440px] bg-[#0d121a]">
      {!hideNav && <MiniNav active="Journal" />}
      <div className="px-7 py-6">
        <p className="font-mono text-[12.5px] text-[var(--muted)]">Week 2 · June 8 – June 12 2026</p>
        <div className="mt-4 flex items-baseline gap-3.5">
          <span className="size-2.5 self-center rounded-full bg-[var(--green)]" />
          <h3 className="text-[32px] font-semibold leading-none">Monday</h3>
          <span className="font-mono text-lg text-[var(--green)]">8</span>
        </div>
        <p className="mt-3 pl-6 font-mono text-[13.5px] text-[var(--body)]">
          5 trades <span className="text-[var(--faint)]">·</span> 63% win{" "}
          <span className="text-[var(--faint)]">·</span> PF 1.64{" "}
          <span className="text-[var(--faint)]">·</span>{" "}
          <span className="font-semibold text-[var(--green)]">P&amp;L +$42.33</span>
        </p>
        <div className="mt-6 grid gap-9 pl-6 md:grid-cols-[1fr_230px]">
          <div>
            <SectionEyebrow>Daily Recap</SectionEyebrow>
            <p className="mt-3 max-w-[560px] text-pretty text-[17px] leading-[1.6] text-[var(--foreground)]">
              Clean open. Waited for the first pullback on NPT instead of chasing the
              spike. That patience set the tone for the whole session. Sized
              normal, took profits into strength, and walked away after the morning push.
            </p>
            <div className="mt-4 flex gap-2">
              {["Patient", "Followed plan"].map((tag) => (
                <span key={tag} className="rounded-md bg-[rgba(29,178,107,.16)] px-2.5 py-1 font-mono text-[11.5px] text-[var(--green)]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div>
            <SectionEyebrow>Trades</SectionEyebrow>
            <div className="mt-3">
              {[
                ["NPT", "+$15.44", "green"],
                ["INHD", "+$14.71", "green"],
                ["SUNE", "+$8.36", "green"],
                ["BYAH", "+$2.91", "green"],
                ["PN", "+$0.90", "green"],
              ].map(([ticker, pnl, tone], index, arr) => (
                <div
                  key={ticker}
                  className={`flex items-center justify-between py-2.5 ${index < arr.length - 1 ? "border-b border-[var(--hairline)]" : ""}`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className={`size-1.5 rounded-full ${tone === "green" ? "bg-[var(--green)]" : "bg-[var(--red)]"}`} />
                    <span className="text-[13.5px] font-semibold">{ticker}</span>
                  </span>
                  <span className={`font-mono text-[12.5px] font-semibold ${tone === "green" ? "text-[var(--green)]" : "text-[var(--red)]"}`}>
                    {pnl}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewScreen() {
  return (
    <div className="min-h-[440px] bg-[#0d121a]">
      <MiniNav active="Trades" />
      <div className="px-7 py-6">
        <p className="font-mono text-xs text-[var(--muted)]">
          <span className="text-[var(--body)]">‹ NPT</span> &nbsp;|&nbsp; Trades / NPT /{" "}
          <span className="font-semibold text-[var(--foreground)]">Trade 1</span>
        </p>
        <div className="mt-4 flex items-end gap-3.5">
          <h3 className="text-[30px] font-semibold tracking-[-0.01em]">NPT</h3>
          <span className="pb-1 font-mono text-[13px] text-[var(--muted)]">Jun 08, 2026 · Trade 1</span>
        </div>
        <div className="mt-5 grid gap-7 md:grid-cols-[1fr_280px] md:items-start">
          <div className="rounded-md border border-[var(--border)] bg-[#0b0d12] px-4 pb-1.5 pt-3.5">
            <PnlSparkline />
          </div>
          <div>
            <div className="flex items-end justify-between">
              <div>
                <SectionEyebrow>Net P&amp;L</SectionEyebrow>
                <p className="mt-1 font-mono text-[26px] font-semibold tracking-[-0.02em] text-[var(--green)]">+$15.44</p>
              </div>
              <div className="text-right">
                <SectionEyebrow>Held</SectionEyebrow>
                <p className="mt-1 font-mono text-[14.5px] font-semibold">6m</p>
              </div>
            </div>
            <div className="my-4 h-px bg-[var(--hairline)]" />
            <SectionEyebrow>Trade Note</SectionEyebrow>
            <div className="mt-3 inline-flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-[var(--green)]" />
              <span className="font-mono text-[11px] text-[var(--green)]">Best setup</span>
            </div>
            <p className="mt-3 text-pretty text-[15.5px] leading-[1.6] text-[var(--prose,#99a3b1)]">
              Textbook green-to-red reclaim. Entered on the reclaim, added on the first
              pullback, trimmed half into the move. The A+ I keep talking about: patient
              entry, defined risk, let it work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CoachScreen() {
  return (
    <div className="min-h-[440px] bg-[#0d121a]">
      <MiniNav active="Trades" />
      <div className="px-7 py-6">
        <p className="font-mono text-xs text-[var(--muted)]">
          <span className="text-[var(--body)]">‹ NPT</span> &nbsp;|&nbsp; Trades / NPT /{" "}
          <span className="font-semibold text-[var(--foreground)]">Trade 1</span>
        </p>
        <div className="mt-5 grid gap-7 md:grid-cols-2 md:items-start">
          <div>
            <div className="flex items-end gap-3.5">
              <h3 className="text-[28px] font-semibold tracking-[-0.01em]">NPT</h3>
              <span className="pb-1 font-mono text-[12.5px] text-[var(--muted)]">Jun 08 · Trade 1</span>
            </div>
            <div className="mt-4 rounded-md border border-[var(--border)] bg-[#0b0d12] px-3.5 pb-1 pt-3">
              <PnlSparkline compact />
            </div>
            <div className="mt-3.5 flex gap-5">
              <div>
                <SectionEyebrow>Net P&amp;L</SectionEyebrow>
                <p className="mt-1 font-mono text-[17px] font-semibold text-[var(--green)]">+$15.44</p>
              </div>
              <div>
                <SectionEyebrow>Held</SectionEyebrow>
                <p className="mt-1 font-mono text-[17px] font-semibold">6m</p>
              </div>
            </div>
          </div>
          <CoachCard embedded />
        </div>
      </div>
    </div>
  );
}

/* ── Reusable bits ── */

function BrowserFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[0_40px_90px_-30px_rgba(0,0,0,.7)]">
      <div className="flex items-center gap-3.5 border-b border-[var(--hairline)] px-4 py-3">
        <div className="flex gap-1.5">
          <span className="size-[11px] rounded-full bg-[#ff5f57]" />
          <span className="size-[11px] rounded-full bg-[#febc2e]" />
          <span className="size-[11px] rounded-full bg-[#28c840]" />
        </div>
        <div className="flex flex-1 justify-center">
          <div className="flex items-center gap-1.5 rounded-md border border-[var(--hairline)] bg-[#0b0d12] px-3.5 py-1 font-mono text-xs text-[var(--muted)]">
            <LockGlyph />
            trading-journal.ai/demo
          </div>
        </div>
        <div className="w-[52px]" />
      </div>
      {children}
    </div>
  );
}

function PreviewFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-xl bg-[var(--surface)] shadow-[0_30px_70px_-34px_rgba(0,0,0,.6)]">
      {children}
    </div>
  );
}

function NoteComposerCard() {
  return (
    <div className="rounded-2xl bg-[var(--surface)] p-7 shadow-[0_30px_70px_-30px_rgba(0,0,0,.6)]">
      <div className="flex items-baseline justify-between">
        <SectionEyebrow>Trade Note</SectionEyebrow>
        <span className="font-mono text-xs text-[var(--muted)]">
          NPT · Trade 1 · <span className="text-[var(--green)]">+$15.44</span>
        </span>
      </div>

      <GroupLabel className="mt-5">How was this trade?</GroupLabel>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill label="Best setup" tone="positive" active />
        <Pill label="Good trade" tone="positive" />
        <Pill label="Needs review" />
        <Pill label="Chased" tone="negative" />
        <Pill label="Rule break" tone="negative" />
      </div>

      <div className="mt-5 rounded-[10px] border border-[var(--border)] bg-[#0b0d12] px-[18px] py-4">
        <p className="text-pretty text-base leading-[1.62] text-[var(--foreground)]">
          Textbook green-to-red reclaim. Entered on the reclaim, added on the first
          pullback, trimmed half into the move. The A+ I keep talking about:
          patient entry, defined risk, let it work
          <span className="ml-0.5 inline-block h-[18px] w-0.5 translate-y-[3px] animate-pulse bg-[var(--green)]" />
        </p>
      </div>

      <GroupLabel className="mt-5">Process</GroupLabel>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill label="Patient" tone="positive" active />
        <Pill label="Followed plan" tone="positive" active />
        <Pill label="Let winner work" tone="positive" active />
        <Pill label="Sized correctly" tone="positive" />
        <Pill label="Took profits early" tone="negative" />
        <Pill label="More" plus />
      </div>

      <GroupLabel className="mt-5">Emotion</GroupLabel>
      <div className="mt-3 flex flex-wrap gap-2">
        <Pill label="Calm" tone="positive" active />
        <Pill label="Focused" tone="positive" />
        <Pill label="Impatient" tone="negative" />
        <Pill label="FOMO" tone="negative" />
        <Pill label="More" plus />
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-[var(--hairline)] pt-[18px]">
        <span className="font-mono text-[11.5px] text-[var(--faint)]">Autosaves to your local file</span>
        <span className="inline-flex items-center gap-2 rounded-lg bg-[var(--green)] px-4 py-2 text-[13.5px] font-semibold text-[#06121f]">
          Save note
        </span>
      </div>
    </div>
  );
}

function CoachCard({ embedded = false }: { embedded?: boolean }) {
  return (
    <div className={embedded ? "rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5" : "rounded-2xl bg-[#0f141c] p-7 md:p-8"}>
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--blue)]">
          <SparkIcon />
          <span>Coach review</span>
          {!embedded && <span className="text-[var(--muted)]">· NPT · Trade 1</span>}
        </div>
      </div>
      <GroupLabel className="mt-5">Read against your rules</GroupLabel>
      <div className="mt-3.5 space-y-3">
        {[
          ["pass", "Waited for confirmation", "Entry after the reclaim held"],
          ["pass", "Sized to plan", "10 sh · within your risk"],
          ["pass", "Let the winner work", "Added on the first pullback"],
          ["warn", "Took profits early", "Trimmed half before your 2R target"],
        ].map(([status, title, body]) => (
          <div key={title} className="grid grid-cols-[20px_1fr] items-start gap-3">
            <span
              className={
                status === "pass"
                  ? "mt-px grid size-[18px] place-items-center rounded-full bg-[rgba(29,178,107,.18)] text-[var(--green)]"
                  : "mt-px grid size-[18px] place-items-center rounded-full bg-[rgba(240,81,67,.18)] text-[var(--red)]"
              }
            >
              <span className="text-[10px] leading-none">{status === "pass" ? "✓" : "!"}</span>
            </span>
            <p className="text-[13.5px] leading-[1.4]">
              <span className="font-semibold">{title}</span>{" "}
              <span className="text-[var(--muted)]">{body}</span>
            </p>
          </div>
        ))}
      </div>
      <div className="mt-[18px] border-t border-[var(--hairline)] pt-4">
        <p className="text-pretty text-[14.5px] leading-[1.58] text-[var(--prose,#99a3b1)]">
          &ldquo;Your highest-quality entry this week. The only drift was trimming early,
          the same pattern flagged Tuesday. Worth sizing the runner next time.&rdquo;
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3.5 py-2 text-[12.5px] font-semibold text-[var(--foreground)]">
            <SparkIcon />
            Use as note draft
          </span>
          <span className="font-mono text-[10.5px] text-[var(--faint)]">You always edit before it saves</span>
        </div>
      </div>
    </div>
  );
}

function PnlSparkline({ compact = false }: { compact?: boolean }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
        <span>NPT · 1m</span>
        <span className="text-[var(--green)]">114.62 → 115.04</span>
      </div>
      <svg
        viewBox="0 0 640 170"
        className={compact ? "mt-6 h-28 w-full" : "mt-8 h-36 w-full"}
        role="img"
        aria-label="NPT price chart preview"
      >
        <line x1="0" y1="116" x2="640" y2="116" stroke="rgba(255,255,255,.12)" strokeDasharray="5 6" />
        <path
          d="M0 110 L70 122 L132 130 L210 96 L282 86 L360 64 L448 70 L520 44 L640 30 L640 116 L0 116 Z"
          fill="rgba(29,178,107,.18)"
        />
        <path
          d="M0 110 L70 122 L132 130 L210 96 L282 86 L360 64 L448 70 L520 44 L640 30"
          fill="none"
          stroke="var(--green)"
          strokeWidth="2.5"
        />
        <text x="0" y="160" fill="var(--muted)" fontSize="12" fontFamily="monospace">15:34</text>
        <text x="300" y="160" fill="var(--muted)" fontSize="12" fontFamily="monospace" textAnchor="middle">15:56</text>
        <text x="640" y="160" fill="var(--muted)" fontSize="12" fontFamily="monospace" textAnchor="end">16:18</text>
      </svg>
    </div>
  );
}

function Pill({
  label,
  tone = "neutral",
  active = false,
  plus = false,
}: {
  label: string;
  tone?: "positive" | "negative" | "neutral";
  active?: boolean;
  plus?: boolean;
}) {
  let cls = "border-[var(--border)] text-[var(--muted)]";
  if (active && tone === "positive") cls = "border-[rgba(29,178,107,.6)] bg-[rgba(29,178,107,.16)] text-[var(--green)]";
  else if (active && tone === "negative") cls = "border-[rgba(240,81,67,.6)] bg-[rgba(240,81,67,.16)] text-[var(--red)]";
  else if (active) cls = "border-[var(--muted)] bg-[var(--surface-2)] text-[var(--foreground)]";

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs font-medium ${cls}`}>
      {active && !plus && <span className="size-[5px] rounded-full bg-current" />}
      {plus && <span className="text-[13px] leading-none opacity-70">+</span>}
      {label}
    </span>
  );
}

function GroupLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--faint)] ${className}`}>
      {children}
    </p>
  );
}

function SectionEyebrow({
  children,
  className = "text-[var(--muted)]",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p className={`font-mono text-[10.5px] font-medium uppercase tracking-[0.16em] ${className}`}>
      {children}
    </p>
  );
}

function PrimaryButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex h-12 items-center justify-center gap-2 rounded-[9px] bg-[var(--foreground)] px-[22px] text-[15px] font-semibold text-[#0b0d12] transition-opacity hover:opacity-90"
    >
      {children}
      <ArrowRight className="ml-0" />
    </Link>
  );
}

function GhostButton({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      rel="noreferrer"
      target="_blank"
      className="inline-flex h-12 items-center justify-center gap-2 rounded-[9px] border border-[var(--border)] px-[22px] text-[15px] font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--muted)] hover:bg-[var(--surface)]"
    >
      {children}
    </a>
  );
}

function ArrowRight({ className = "ml-3" }: { className?: string }) {
  return (
    <svg className={`${className} size-4`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function LockGlyph() {
  return (
    <svg className="size-[11px]" viewBox="0 0 14 14" fill="none" stroke="var(--green)" strokeWidth="1.6" aria-hidden="true">
      <rect x="3" y="6.5" width="8" height="5.5" rx="1" />
      <path d="M4.5 6.5V4.5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}

function LocalCardIcon({ icon }: { icon: string }) {
  if (icon === "monitor") {
    return (
      <svg className="size-5 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="4" width="18" height="13" rx="2" />
        <path d="M8 21h8" />
        <path d="M12 17v4" />
      </svg>
    );
  }

  if (icon === "lock") {
    return (
      <svg className="size-5 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="10" width="16" height="11" rx="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  if (icon === "help") {
    return (
      <svg className="size-5 text-[var(--green)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  return <GitHubIcon className="size-5 text-[var(--green)]" />;
}

function GitHubIcon({ className = "size-[17px]" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3" />
      <path d="M15 22v-3.9a3.4 3.4 0 0 0-.9-2.6c3-.3 6.2-1.5 6.2-6.7A5.2 5.2 0 0 0 19 5.3a4.9 4.9 0 0 0-.1-3.6s-1.1-.3-3.6 1.4a12.3 12.3 0 0 0-6.6 0C6.2 1.4 5.1 1.7 5.1 1.7A4.9 4.9 0 0 0 5 5.3 5.2 5.2 0 0 0 3.7 8.8c0 5.2 3.2 6.4 6.2 6.7a3.4 3.4 0 0 0-.9 2.6V22" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg className="size-[15px] text-[var(--blue)]" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 1.2c.2 2.7 1.9 4.7 4.6 5.1-2.7.4-4.4 2.4-4.6 5.1-.2-2.7-1.9-4.7-4.6-5.1C5.8 5.9 7.5 3.9 8 1.2Z" />
      <circle cx="12.8" cy="11.6" r="1.6" opacity="0.55" />
    </svg>
  );
}
