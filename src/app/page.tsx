import Link from "next/link";

const githubUrl = "https://github.com/trading-journal-ai/trading-journal";

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-[#0b0d12] text-[var(--foreground)]">
      <header className="mx-auto flex w-full max-w-[1180px] items-center justify-between px-6 py-8 md:px-10">
        <Link href="/" className="text-base font-semibold tracking-tight">
          Trading Journal AI
        </Link>
        <nav className="flex items-center gap-5 text-sm text-[var(--muted)] md:gap-7">
          <a
            href="#review"
            className="hidden transition-colors hover:text-[var(--foreground)] md:inline"
          >
            Review habit
          </a>
          <a
            href="#coach"
            className="hidden transition-colors hover:text-[var(--foreground)] md:inline"
          >
            AI coach
          </a>
          <a
            href="#local"
            className="hidden transition-colors hover:text-[var(--foreground)] md:inline"
          >
            Local-first
          </a>
          <Link href="/demo" className="transition-colors hover:text-[var(--foreground)]">
            Demo
          </Link>
          <a
            href={githubUrl}
            className="transition-colors hover:text-[var(--foreground)]"
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1180px] px-6 pb-20 pt-10 md:px-10 md:pt-20">
        <section className="max-w-[760px]">
          <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.32em] text-[var(--green)]">
            Local-first trading journal · Open source
          </p>
          <h1 className="mt-9 max-w-[720px] text-[56px] font-semibold leading-[0.98] tracking-[-0.04em] md:text-[86px]">
            A journal-first trading review system.
          </h1>
          <p className="mt-8 max-w-[720px] text-2xl font-medium leading-snug text-[var(--body)] md:text-[32px]">
            Review faster. Understand your patterns. Refine your trading process.
          </p>
          <p className="mt-6 max-w-[680px] text-lg leading-8 text-[var(--muted)] md:text-xl">
            Trading Journal AI brings notes, charts, P&amp;L, tags, and coaching into
            one journal-first workflow, so your data supports reflection instead of
            replacing it.
          </p>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--foreground)] px-6 text-sm font-semibold text-[#0b0d12] transition-opacity hover:opacity-90"
            >
              View the live demo <span aria-hidden="true" className="ml-3">-&gt;</span>
            </Link>
            <a
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[var(--border)] px-6 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--muted)] hover:bg-[var(--surface)]"
            >
              View on GitHub
            </a>
          </div>

          <p className="mt-6 font-mono text-sm text-[var(--muted)]">
            No signup · No subscription · Your data stays on your machine
          </p>
        </section>

        <section className="mt-28">
          <div className="mb-8 flex items-center justify-between gap-6">
            <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.32em] text-[var(--muted)]">
              The review, in three steps
            </p>
            <p className="hidden font-mono text-sm text-[var(--faint)] md:block">
              Import from your broker CSV, then review from the journal.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                number: "01",
                title: "Daily recap",
                body: "Start with the story of the session: market read, execution, and what stood out.",
              },
              {
                number: "02",
                title: "Ticker review",
                body: "See repeated trades, chart context, and P&L together before you decide what mattered.",
              },
              {
                number: "03",
                title: "Trade note",
                body: "Capture the lesson, tag the behavior, and keep the record easy to revisit later.",
              },
            ].map((step) => (
              <article
                key={step.number}
                className="border-t border-[var(--border)] pt-5"
              >
                <div className="flex items-baseline gap-3">
                  <span className="font-mono text-sm text-[var(--green)]">
                    {step.number}
                  </span>
                  <h2 className="text-lg font-semibold">{step.title}</h2>
                </div>
                <p className="mt-4 max-w-[340px] text-base leading-7 text-[var(--muted)]">
                  {step.body}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-md border border-[var(--border)] bg-[#10151d] shadow-2xl shadow-black/30">
          <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
            <div className="flex gap-2">
              <span className="size-3 rounded-full bg-[var(--red)]" />
              <span className="size-3 rounded-full bg-[#f5b83d]" />
              <span className="size-3 rounded-full bg-[var(--green)]" />
            </div>
            <div className="rounded-md border border-black/40 bg-black/35 px-4 py-1 font-mono text-xs text-[var(--muted)]">
              trading-journal.ai/demo
            </div>
            <div className="w-14" />
          </div>
          <div className="grid min-h-[460px] gap-8 p-6 md:grid-cols-[1fr_280px] md:p-10">
            <div>
              <div className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Week 2 · June 8 - 12 2026
              </div>
              <div className="mt-8 flex items-baseline gap-4">
                <span className="size-2.5 rounded-full bg-[var(--green)]" />
                <h3 className="text-4xl font-semibold tracking-tight">June 11</h3>
                <span className="font-mono text-lg text-[var(--muted)]">Thursday</span>
              </div>
              <p className="mt-6 max-w-[680px] text-lg leading-8 text-[var(--body)]">
                Strong session. The day rewarded patience more than activity, and the
                biggest winner did most of the heavy lifting. Keep looking for the
                moments where volume, direction, and entry location line up before
                adding risk.
              </p>
              <div className="mt-10 rounded-md bg-[var(--panel)] p-7">
                <div className="flex justify-between font-mono text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                  <span>Daily P&amp;L</span>
                  <span className="text-[var(--green)]">+$546.69</span>
                </div>
                <div className="mt-20 h-36">
                  <svg viewBox="0 0 640 160" className="h-full w-full" role="img" aria-label="Daily P&L chart preview">
                    <line x1="0" y1="112" x2="640" y2="112" stroke="rgba(255,255,255,.14)" strokeDasharray="5 6" />
                    <path
                      d="M0 112 L72 102 L132 116 L210 92 L282 98 L360 72 L448 82 L520 42 L640 26 L640 112 L0 112 Z"
                      fill="rgba(29,178,107,.22)"
                    />
                    <path
                      d="M0 112 L72 102 L132 116 L210 92 L282 98 L360 72 L448 82 L520 42 L640 26"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="3"
                    />
                  </svg>
                </div>
              </div>
            </div>
            <aside className="pt-24 font-mono text-lg">
              <div className="space-y-5">
                <div className="flex justify-between gap-8">
                  <span>CUPR</span>
                  <span className="text-[var(--green)]">+$305.53</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span>RGNT</span>
                  <span className="text-[var(--green)]">+$120.00</span>
                </div>
                <div className="flex justify-between gap-8">
                  <span>MTEN</span>
                  <span className="text-[var(--red)]">-$105.00</span>
                </div>
              </div>
              <div className="mt-12 border-t border-[var(--border)] pt-8 text-[var(--muted)]">
                <div className="flex justify-between gap-8">
                  <span>Accuracy</span>
                  <span className="text-[var(--foreground)]">75%</span>
                </div>
                <div className="mt-3 flex justify-between gap-8">
                  <span>P&amp;L</span>
                  <span className="text-[var(--green)]">+$546.69</span>
                </div>
              </div>
            </aside>
          </div>
        </section>

        <section id="review" className="mt-28 scroll-mt-24 border-t border-[var(--border)] pt-20">
          <div className="max-w-[760px]">
            <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.32em] text-[var(--green)]">
              The review habit
            </p>
            <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.03em] md:text-[52px]">
              Reflection first. Data where it helps.
            </h2>
            <p className="mt-6 max-w-[680px] text-lg leading-8 text-[var(--muted)]">
              The journal is the home base: start with the recap, keep the day in
              context, then move into ticker and trade evidence when a moment deserves
              a closer look.
            </p>
          </div>

          <div className="mt-14 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="font-mono text-sm text-[var(--green)]">01 · See the day in context</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                The recap leads, the data follows.
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                Open a day and the recap sits first: market read, execution, lesson,
                and what stood out. The chart, tickers, and P&amp;L sit beside the note
                for reference instead of overwhelming the review.
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6">
              <div className="flex items-baseline gap-4">
                <span className="size-2.5 rounded-full bg-[var(--green)]" />
                <h4 className="text-3xl font-semibold">June 11</h4>
                <span className="font-mono text-[var(--muted)]">Thursday</span>
              </div>
              <p className="mt-6 max-w-[620px] text-base leading-7 text-[var(--body)]">
                Strong session. I stayed patient while the best trade did most of the
                work. Review the weaker entry, but keep the main lesson simple: wait
                for volume, direction, and entry location to line up.
              </p>
              <div className="mt-8 grid gap-4 font-mono text-sm md:grid-cols-[1fr_180px]">
                <div className="rounded-md bg-[#1a2432] p-5">
                  <div className="flex justify-between uppercase tracking-[0.28em] text-[var(--muted)]">
                    <span>Daily P&amp;L</span>
                    <span className="text-[var(--green)]">+$546.69</span>
                  </div>
                  <svg viewBox="0 0 500 120" className="mt-10 h-28 w-full" role="img" aria-label="Daily P&L preview">
                    <line x1="0" y1="82" x2="500" y2="82" stroke="rgba(255,255,255,.14)" strokeDasharray="5 6" />
                    <path
                      d="M0 82 L62 76 L118 86 L178 68 L236 73 L310 48 L372 58 L430 30 L500 18 L500 82 L0 82 Z"
                      fill="rgba(29,178,107,.22)"
                    />
                    <path
                      d="M0 82 L62 76 L118 86 L178 68 L236 73 L310 48 L372 58 L430 30 L500 18"
                      fill="none"
                      stroke="var(--green)"
                      strokeWidth="2"
                    />
                  </svg>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="flex justify-between gap-5">
                    <span>CUPR</span>
                    <span className="text-[var(--green)]">+$305.53</span>
                  </div>
                  <div className="flex justify-between gap-5">
                    <span>RGNT</span>
                    <span className="text-[var(--green)]">+$120.00</span>
                  </div>
                  <div className="flex justify-between gap-5">
                    <span>MTEN</span>
                    <span className="text-[var(--red)]">-$105.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 grid gap-10 border-t border-[var(--border)] pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="rounded-md border border-[var(--border)] bg-[var(--panel)] p-6">
              <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.28em] text-[var(--muted)]">
                Trade note
              </p>
              <div className="mt-6 rounded-md border border-dashed border-[#2a3950] p-5">
                <p className="font-mono text-base font-semibold text-[var(--blue)]">
                  + Add a trade note
                </p>
                <p className="mt-4 max-w-[420px] text-sm leading-6 text-[var(--muted)]">
                  Setup quality, execution, rules followed or broken, emotions, and
                  what to remember next time.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {["Best setup", "Patient", "Let winner work", "Took profits early"].map((tag, index) => (
                  <span
                    key={tag}
                    className="rounded-md border border-[var(--border)] px-3 py-1 font-mono text-xs text-[var(--body)]"
                  >
                    <span className={index === 3 ? "text-[var(--red)]" : "text-[var(--green)]"}>•</span>{" "}
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p className="font-mono text-sm text-[var(--green)]">02 · Capture it in seconds</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">
                Tag the trade in your own language.
              </h3>
              <p className="mt-4 text-base leading-7 text-[var(--muted)]">
                Write the note, then tap the labels that fit. Over time those repeated
                tags turn subjective review into a record you can scan, search, and
                learn from.
              </p>
            </div>
          </div>
        </section>

        <section id="coach" className="mx-[-1.5rem] mt-28 scroll-mt-24 border-y border-[var(--border)] bg-[var(--surface)] px-6 py-20 md:mx-[-2.5rem] md:px-10">
          <div className="mx-auto grid max-w-[1180px] gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div>
              <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.32em] text-[var(--blue)]">
                AI coach preview
              </p>
              <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.03em] md:text-[52px]">
                Coaching against your rules, not generic trading advice.
              </h2>
              <p className="mt-6 max-w-[620px] text-lg leading-8 text-[var(--muted)]">
                The coaching layer is designed for post-trade review. Your notes,
                tags, recaps, and executions become the context for feedback that
                helps you understand drift, repeat strengths, and refine your process.
              </p>
            </div>
            <div className="rounded-md border border-[var(--border)] bg-[#0f141c] p-6">
              <div className="font-mono text-sm uppercase tracking-[0.28em] text-[var(--muted)]">
                Daily review draft
              </div>
              <div className="mt-6 space-y-5">
                {[
                  ["Codify your edge", "Turn your process tags into the rubric the coach reviews against."],
                  ["Review against it", "Read the day, the ticker, and the trade through the rules you care about."],
                  ["Draft, never auto-post", "The coach proposes notes and recaps; you decide what gets saved."],
                ].map(([title, body], index) => (
                  <div key={title} className="grid grid-cols-[34px_1fr] gap-4">
                    <span className="font-mono text-sm text-[var(--blue)]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="text-base font-semibold">{title}</h3>
                      <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{body}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-7 font-mono text-xs text-[var(--faint)]">
                Concept preview · post-trade review only
              </p>
            </div>
          </div>
        </section>

        <section id="local" className="mt-28 scroll-mt-24">
          <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <div>
              <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.32em] text-[var(--green)]">
                Local-first
              </p>
              <h2 className="mt-5 text-[38px] font-semibold leading-tight tracking-[-0.03em] md:text-[52px]">
                Your trading day stays on your machine.
              </h2>
              <p className="mt-6 max-w-[620px] text-lg leading-8 text-[var(--muted)]">
                A trading journal holds sensitive records: account history,
                positions, timestamps, notes, and behavior. Trading Journal AI is a
                personal tool, not a hosted subscription. Run it locally, keep the
                database on disk, and choose what you share.
              </p>
            </div>
            <div className="grid overflow-hidden rounded-md border border-[var(--border)] bg-[var(--border)] md:grid-cols-2">
              {[
                ["On your machine", "Everything lives in a local SQLite database inside the project folder."],
                ["Private by default", "Broker exports, API keys, and local databases are ignored by git."],
                ["No subscription", "No hosted account, no monthly fee, and no required signup for the app."],
                ["Open source", "Download it, fork it, or use it as the starting point for your own journal."],
              ].map(([title, body]) => (
                <article key={title} className="bg-[#0b0d12] p-6">
                  <div className="size-2 rounded-full bg-[var(--green)]" />
                  <h3 className="mt-5 text-base font-semibold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[var(--muted)]">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-28 border-t border-[var(--border)] py-20 text-center">
          <p className="font-mono text-[13px] font-semibold uppercase tracking-[0.32em] text-[var(--muted)]">
            Get started
          </p>
          <h2 className="mx-auto mt-5 max-w-[760px] text-[38px] font-semibold leading-tight tracking-[-0.03em] md:text-[52px]">
            Try the demo, or run your own in two minutes.
          </h2>
          <p className="mx-auto mt-6 max-w-[600px] text-lg leading-8 text-[var(--muted)]">
            Explore the hosted demo with seeded trades and journal notes, or clone
            the repo and start a private local journal with your own broker CSV.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center rounded-md bg-[var(--foreground)] px-6 text-sm font-semibold text-[#0b0d12] transition-opacity hover:opacity-90"
            >
              View the live demo <span aria-hidden="true" className="ml-3">-&gt;</span>
            </Link>
            <a
              href={githubUrl}
              rel="noreferrer"
              target="_blank"
              className="inline-flex h-12 items-center justify-center rounded-md border border-[var(--border)] px-6 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--muted)] hover:bg-[var(--surface)]"
            >
              View on GitHub
            </a>
          </div>
          <div className="mx-auto mt-10 max-w-[660px] rounded-md border border-[var(--border)] bg-[var(--surface)] p-4 text-left">
            <pre className="overflow-x-auto font-mono text-sm leading-7 text-[var(--body)]"><code>{`git clone https://github.com/trading-journal-ai/trading-journal
cd trading-journal
./install-trading-journal.sh`}</code></pre>
          </div>
        </section>

        <footer className="border-t border-[var(--border)] py-8">
          <div className="flex flex-col gap-4 font-mono text-xs text-[var(--muted)] md:flex-row md:items-center md:justify-between">
            <span>Trading Journal AI · trading-journal.ai</span>
            <div className="flex gap-6">
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
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
