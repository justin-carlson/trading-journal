"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { selectAccountAction } from "@/app/accounts/actions";
import type { AccountOption } from "@/lib/accountScope";

export default function AccountSelector({
  accounts,
  activeAccountId,
}: {
  accounts: AccountOption[];
  activeAccountId: number;
}) {
  const [, startTransition] = useTransition();
  const router = useRouter();

  return (
    <label className="inline-flex h-10 items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--blue)]">
      <span className="sr-only">Active account</span>
      <select
        defaultValue={String(activeAccountId)}
        onChange={(event) => {
          const formData = new FormData();
          formData.set("accountId", event.target.value);
          startTransition(() => {
            void selectAccountAction(formData).then(() => router.refresh());
          });
        }}
        className="bg-transparent outline-none"
      >
        {accounts.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}
