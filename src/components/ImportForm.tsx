"use client";

import Link from "next/link";
import { useActionState, useRef } from "react";
import { importTosAction, type ImportState } from "@/app/import/actions";

export default function ImportForm() {
  const [state, formAction, pending] = useActionState<ImportState, FormData>(
    importTosAction,
    null,
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const parsedRange = state?.ok && state.summary.parsedFrom && state.summary.parsedTo
    ? state.summary.parsedFrom === state.summary.parsedTo
      ? state.summary.parsedFrom
      : `${state.summary.parsedFrom} to ${state.summary.parsedTo}`
    : null;
  const insertedRange = state?.ok && state.summary.insertedFrom && state.summary.insertedTo
    ? state.summary.insertedFrom === state.summary.insertedTo
      ? state.summary.insertedFrom
      : `${state.summary.insertedFrom} to ${state.summary.insertedTo}`
    : null;

  return (
    <div className="space-y-2">
      <form ref={formRef} action={formAction}>
        <input
          ref={inputRef}
          type="file"
          name="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={() => {
            if (inputRef.current?.files?.length) formRef.current?.requestSubmit();
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={pending}
          className="rounded-md bg-[#58a6ff] px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
        >
          {pending ? "Importing…" : "Import"}
        </button>
      </form>

      {state?.ok === false && (
        <div className="rounded-md border border-[var(--red)]/40 bg-[var(--red)]/10 px-3 py-1.5 text-sm text-[var(--red)]">
          {state.error}
        </div>
      )}

      {state?.ok && (
        <div className="rounded-md border border-[var(--green)]/40 bg-[var(--green)]/10 px-3 py-1.5 text-sm">
          <span className="font-semibold text-[var(--green)]">
            {state.summary.inserted > 0 ? "Imported" : "No new executions"}
          </span>{" "}
          <span className="text-[var(--foreground)]">
            {state.summary.inserted} executions · {state.summary.trades} trades
            {state.summary.duplicates > 0 && ` · ${state.summary.duplicates} dupes skipped`}
            {parsedRange && ` · parsed ${parsedRange}`}
            {insertedRange && ` · added ${insertedRange}`}
          </span>{" "}
          <Link href="/trades" className="text-[#58a6ff] hover:underline">view →</Link>
        </div>
      )}
    </div>
  );
}
