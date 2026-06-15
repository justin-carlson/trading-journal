"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addAccountAction, deleteAccountAction, renameAccountAction } from "@/app/accounts/actions";
import type { AccountOption } from "@/lib/accountScope";

export default function AccountSettings({
  accounts,
}: {
  accounts: AccountOption[];
}) {
  const router = useRouter();
  const [newAccountName, setNewAccountName] = useState("");
  const [editingAccount, setEditingAccount] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {accounts.map((account) => (
          <div key={account.id} className="grid gap-2 border-b border-[var(--border)] py-3 md:grid-cols-[1fr_auto] md:items-center">
            {editingAccount === account.id ? (
              <input
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                className="h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--blue)]"
                aria-label={`Rename ${account.name}`}
                autoFocus
              />
            ) : (
              <div className="flex h-10 items-center text-sm font-semibold text-[var(--foreground)]">
                {account.name}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {editingAccount === account.id ? (
                <>
                  <form
                    action={async (formData) => {
                      await renameAccountAction(formData);
                      setEditingAccount(null);
                      setEditingName("");
                      router.refresh();
                    }}
                  >
                    <input type="hidden" name="accountId" value={account.id} />
                    <input type="hidden" name="name" value={editingName} />
                    <button
                      type="submit"
                      className="h-10 rounded-md bg-[var(--blue)] px-3 text-sm font-semibold text-black"
                    >
                      Save
                    </button>
                  </form>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingAccount(null);
                      setEditingName("");
                    }}
                    className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--foreground)]"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setEditingAccount(account.id);
                    setEditingName(account.name);
                  }}
                  className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--foreground)]"
                >
                  Edit
                </button>
              )}

              <form
                action={async (formData) => {
                  await deleteAccountAction(formData);
                  router.refresh();
                }}
              >
                <input type="hidden" name="accountId" value={account.id} />
                <button
                  type="submit"
                  disabled={accounts.length <= 1}
                  className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--red)] hover:text-[var(--foreground)] disabled:opacity-40"
                >
                  Delete
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>

      <form
        action={async (formData) => {
          await addAccountAction(formData);
          setNewAccountName("");
          router.refresh();
        }}
        className="flex flex-wrap gap-2"
      >
        <input
          name="name"
          value={newAccountName}
          onChange={(event) => setNewAccountName(event.target.value)}
          placeholder="New account name"
          className="h-10 min-w-64 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--blue)]"
        />
        <button
          type="submit"
          className="h-10 rounded-md bg-[var(--blue)] px-4 text-sm font-semibold text-black"
        >
          Add account
        </button>
      </form>
    </div>
  );
}
