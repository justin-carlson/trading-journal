import Link from "next/link";

const wireframes = [
  {
    title: "Coach review mockup",
    href: "/review/journal/coach-review-mockup",
    label: "Mockup",
    body: "A mostly static view of what the completed daily recap could contain: dashboard inputs, coach review, statistical read, and carry-forward cues.",
    versions: [
      { label: "Current", href: "/review/journal/coach-review-mockup" },
      { label: "Legacy alias", href: "/review/journal-coach-recap" },
    ],
  },
];

const prototypes = [
  {
    title: "Daily recap flow prototype",
    href: "/review/journal/prototype-flow",
    label: "Prototype",
    body: "Clickable flow: dashboard, import trades, recap editor takeover, save back to journal, return to dashboard with carry-forward cues.",
    versions: [
      { label: "Current", href: "/review/journal/prototype-flow" },
      { label: "Legacy alias", href: "/review/journal-content" },
    ],
  },
];

export default function JournalReviewHubPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--body)]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-8 lg:px-10">
        <header className="border-b border-[var(--hairline)] pb-8">
          <Eyebrow>Design review</Eyebrow>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-[var(--foreground)] md:text-5xl">
            Journal review index
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--prose)]">
            A small index for separating static structure from clickable flow
            while we explore the dashboard, daily recap, and coach loop.
          </p>
        </header>

        <ReviewSection
          title="Mockups"
          eyebrow="Structure"
          body="Use these to decide what belongs on the screen and how sections relate before judging click behavior."
          items={wireframes}
        />

        <ReviewSection
          title="Clickable prototypes"
          eyebrow="Mechanics"
          body="Use these to feel the end-to-end interaction: where the user lands, what opens, what closes, and what returns to the dashboard."
          items={prototypes}
        />
      </div>
    </main>
  );
}

function ReviewSection({
  title,
  eyebrow,
  body,
  items,
}: {
  title: string;
  eyebrow: string;
  body: string;
  items: Array<{
    title: string;
    href: string;
    label: string;
    body: string;
    disabled?: boolean;
    versions?: Array<{ label: string; href: string }>;
  }>;
}) {
  return (
    <section className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <div>
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--foreground)]">
          {title}
        </h2>
        <p className="mt-3 text-sm leading-6 text-[var(--prose)]">{body}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) =>
          item.disabled ? (
            <div
              key={item.title}
              className="rounded-lg border border-[var(--hairline)] bg-[rgba(18,21,29,.55)] p-5 opacity-75"
            >
              <CardContent item={item} />
            </div>
          ) : (
            <div
              key={item.title}
              className="rounded-lg border border-[var(--hairline)] bg-[rgba(18,21,29,.72)] p-5 transition-colors hover:border-[rgba(77,155,255,.45)]"
            >
              <CardContent item={item} />
            </div>
          ),
        )}
      </div>
    </section>
  );
}

function CardContent({
  item,
}: {
  item: {
    title: string;
    href: string;
    label: string;
    body: string;
    versions?: Array<{ label: string; href: string }>;
  };
}) {
  return (
    <>
      <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--blue)]">
        {item.label}
      </div>
      <Link
        href={item.href}
        className="mt-3 block text-xl font-semibold text-[var(--foreground)] hover:text-[var(--blue)]"
      >
        {item.title}
      </Link>
      <p className="mt-3 text-sm leading-6 text-[var(--prose)]">{item.body}</p>
      {item.versions ? (
        <div className="mt-5 border-t border-[var(--hairline)] pt-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Versions
          </div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
            {item.versions.map((version) => (
              <Link
                key={version.href}
                href={version.href}
                className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--blue)] hover:text-[var(--foreground)]"
              >
                {version.label}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
      {children}
    </div>
  );
}
