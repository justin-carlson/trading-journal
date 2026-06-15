import Link from "next/link";

export default function SettingsLink() {
  return (
    <Link
      href="/settings"
      aria-label="Settings"
      className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[var(--border)] bg-[var(--surface)] text-lg font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--blue)]"
    >
      ⚙
    </Link>
  );
}
