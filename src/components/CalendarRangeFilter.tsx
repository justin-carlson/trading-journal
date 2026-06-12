"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type CalendarRangeParams = {
  m?: string;
  y?: string;
  view?: string;
  from?: string;
  to?: string;
};

const rangeDayFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
});
const rangeDateFmt = new Intl.DateTimeFormat("en-US", {
  timeZone: "UTC",
  month: "short",
  day: "numeric",
  year: "numeric",
});

function rangeLabel(from: string | undefined, to: string | undefined): string | null {
  if (!from && !to) return null;
  const formatDate = (date: string) => rangeDateFmt.format(new Date(`${date}T00:00:00Z`));
  if (from && to) {
    if (from === to) return formatDate(from);
    const fromDate = new Date(`${from}T00:00:00Z`);
    const toDate = new Date(`${to}T00:00:00Z`);
    if (fromDate.getUTCFullYear() === toDate.getUTCFullYear()) {
      return `${rangeDayFmt.format(fromDate)} to ${formatDate(to)}`;
    }
    return `${formatDate(from)} to ${formatDate(to)}`;
  }
  return from ? `From ${formatDate(from)}` : `To ${formatDate(to!)}`;
}

export default function CalendarRangeFilter({
  params,
  clearHref,
}: {
  params: CalendarRangeParams;
  clearHref: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLFormElement>(null);
  const label = rangeLabel(params.from, params.to);

  useEffect(() => {
    function closeOnOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <form ref={rootRef} action="/calendar" className="relative">
      {params.m && <input type="hidden" name="m" value={params.m} />}
      {params.view && <input type="hidden" name="view" value={params.view} />}
      {params.y && <input type="hidden" name="y" value={params.y} />}
      <input type="hidden" name="range" value="custom" />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className={`flex h-10 min-w-48 items-center gap-2 rounded-md border bg-[var(--surface)] px-4 text-sm font-semibold transition-colors ${
            open || label
              ? "border-[#58a6ff] text-[var(--foreground)]"
              : "border-[var(--border)] text-[var(--muted)] hover:border-[#58a6ff]"
          }`}
        >
          <svg
            aria-hidden="true"
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            viewBox="0 0 24 24"
          >
            <path d="M7 3v4M17 3v4M4.5 9h15M6 5h12a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
          </svg>
          <span>{label ?? "From - To"}</span>
        </button>

        {label && (
          <Link
            href={clearHref}
            className="flex h-10 items-center rounded-md border border-[var(--border)] px-3 text-sm text-[var(--muted)] hover:border-[#58a6ff]"
          >
            Clear
          </Link>
        )}
      </div>

      {open && (
        <div className="absolute left-0 top-full z-20 mt-2 w-full max-w-xl rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-xl md:w-[520px]">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto]">
            <label className="space-y-1">
              <span className="block text-sm font-semibold text-[var(--muted)]">From</span>
              <input
                type="date"
                name="from"
                defaultValue={params.from ?? ""}
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[#58a6ff]"
              />
            </label>

            <label className="space-y-1">
              <span className="block text-sm font-semibold text-[var(--muted)]">To</span>
              <input
                type="date"
                name="to"
                defaultValue={params.to ?? ""}
                className="h-10 w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 text-sm outline-none focus:border-[#58a6ff]"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="h-10 rounded-md border border-[#58a6ff] px-3 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--background)]"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
