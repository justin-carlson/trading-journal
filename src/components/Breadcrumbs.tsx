import Link from "next/link";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

function isSafeInternalHref(value: string | undefined): value is string {
  return Boolean(value?.startsWith("/") && !value.startsWith("//"));
}

export function sectionLabelForHref(href: string | undefined): string {
  if (!href) return "Back";
  if (href === "/" || href.startsWith("/journal")) return "Journal";
  if (href.startsWith("/trades")) return "Trades";
  if (href.startsWith("/calendar")) return "Calendar";
  if (href.startsWith("/reports")) return "Analytics";
  if (href.startsWith("/settings")) return "Settings";
  return "Back";
}

export function originCrumbFromHref(href: string | undefined, fallback = "/trades"): BreadcrumbItem {
  let origin = isSafeInternalHref(href) ? href : fallback;

  for (let depth = 0; depth < 4; depth += 1) {
    const queryStart = origin.indexOf("?");
    if (queryStart < 0) break;

    const nested = new URLSearchParams(origin.slice(queryStart + 1)).get("returnTo") ?? undefined;
    if (!isSafeInternalHref(nested)) break;
    origin = nested;
  }

  return {
    label: sectionLabelForHref(origin),
    href: origin,
  };
}

function Crumb({ item, current = false }: { item: BreadcrumbItem; current?: boolean }) {
  const className = current
    ? "text-[var(--foreground)]"
    : "text-[var(--muted)] transition-colors hover:text-[var(--foreground)]";

  if (!item.href || current) {
    return <span className={className}>{item.label}</span>;
  }

  return (
    <Link href={item.href} className={className}>
      {item.label}
    </Link>
  );
}

export default function Breadcrumbs({
  back,
  items = [],
  current,
  className = "",
}: {
  back: BreadcrumbItem;
  items?: BreadcrumbItem[];
  current?: string;
  className?: string;
}) {
  const crumbs: BreadcrumbItem[] = [...items, ...(current ? [{ label: current }] : [])];

  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[13px] font-semibold ${className}`}
    >
      <Link
        href={back.href ?? "#"}
        className="inline-flex items-center gap-2 text-[var(--muted)] transition-colors hover:text-[var(--foreground)]"
      >
        <span aria-hidden="true" className="text-base leading-none">
          ‹
        </span>
        <span>{back.label}</span>
      </Link>
      {crumbs.map((item, index) => (
        <span key={`${item.label}-${index}`} className="inline-flex items-center gap-3">
          <span aria-hidden="true" className="text-[var(--faint)]">
            /
          </span>
          <Crumb item={item} current={index === crumbs.length - 1} />
        </span>
      ))}
    </nav>
  );
}
