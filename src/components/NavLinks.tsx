"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/calendar", label: "Calendar" },
  { href: "/trades", label: "Trades" },
  { href: "/journal", label: "Journal" },
  { href: "/reports", label: "Reports" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex gap-4 text-sm">
      {nav.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors ${
              active
                ? "font-semibold text-[var(--foreground)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
