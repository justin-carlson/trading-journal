import Link from "next/link";

export type ArchiveSidebarWeek = {
  key: string;
  label: string;
  rangeLabel: string;
  href: string;
  active: boolean;
};

export type ArchiveSidebarMonth = {
  key: string;
  label: string;
  href: string;
  active: boolean;
  weeks: ArchiveSidebarWeek[];
};

type ArchiveSidebarProps = {
  ariaLabel: string;
  months: ArchiveSidebarMonth[];
  years?: {
    key: string;
    label: string;
    href: string;
  }[];
  offsetClassName?: string;
};

export default function ArchiveSidebar({
  ariaLabel,
  months,
  years = [],
  offsetClassName = "md:pt-56",
}: ArchiveSidebarProps) {
  return (
    <aside className={`hidden md:block md:sticky md:top-24 md:self-start ${offsetClassName}`}>
      <nav
        aria-label={ariaLabel}
        className="space-y-4 font-mono text-[13px] leading-5 text-[var(--muted)]"
      >
        {months.map((month) => (
          <div key={month.key}>
            <Link
              href={month.href}
              className={`block ${
                month.active
                  ? "text-[var(--foreground)]"
                  : "hover:text-[var(--foreground)]"
              }`}
            >
              {month.label}
            </Link>
            {month.active && month.weeks.length > 0 ? (
              <div className="mt-3 space-y-2 pl-3">
                {month.weeks.map((week) => (
                  <Link
                    key={week.key}
                    href={week.href}
                    className={`block text-[13px] leading-5 ${
                      week.active
                        ? "text-[var(--green)]"
                        : "hover:text-[var(--foreground)]"
                    }`}
                  >
                    {week.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
        {years.map((year) => (
          <Link
            key={year.key}
            href={year.href}
            className="block hover:text-[var(--foreground)]"
          >
            {year.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
