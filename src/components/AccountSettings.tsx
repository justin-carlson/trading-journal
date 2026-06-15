"use client";

import { useEffect, useState } from "react";
import { ACCOUNT_STORAGE_EVENT, ACCOUNTS_STORAGE_KEY, ACTIVE_ACCOUNT_STORAGE_KEY, DEFAULT_ACCOUNTS } from "@/lib/accounts";

function cleanAccounts(accounts: string[]): string[] {
  const unique = new Set<string>();
  for (const account of accounts) {
    const name = account.trim();
    if (name) unique.add(name);
  }
  return [...unique];
}

export default function AccountSettings() {
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [activeAccount, setActiveAccount] = useState(DEFAULT_ACCOUNTS[0]);
  const [newAccountName, setNewAccountName] = useState("");
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    const savedAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    let parsedAccounts: unknown = DEFAULT_ACCOUNTS;
    try {
      parsedAccounts = savedAccounts ? JSON.parse(savedAccounts) : DEFAULT_ACCOUNTS;
    } catch {
      parsedAccounts = DEFAULT_ACCOUNTS;
    }
    const nextAccounts = Array.isArray(parsedAccounts) ? cleanAccounts(parsedAccounts) : DEFAULT_ACCOUNTS;
    const savedActiveAccount = localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);

    setAccounts(nextAccounts.length > 0 ? nextAccounts : DEFAULT_ACCOUNTS);
    setActiveAccount(savedActiveAccount && nextAccounts.includes(savedActiveAccount) ? savedActiveAccount : nextAccounts[0] ?? DEFAULT_ACCOUNTS[0]);
  }, []);

  function saveAccounts(nextAccounts: string[], nextActiveAccount = activeAccount) {
    const cleanNextAccounts = cleanAccounts(nextAccounts);
    const fallbackAccounts = cleanNextAccounts.length > 0 ? cleanNextAccounts : DEFAULT_ACCOUNTS;
    const cleanActiveAccount = fallbackAccounts.includes(nextActiveAccount) ? nextActiveAccount : fallbackAccounts[0];

    setAccounts(fallbackAccounts);
    setActiveAccount(cleanActiveAccount);
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(fallbackAccounts));
    localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, cleanActiveAccount);
    window.dispatchEvent(new Event(ACCOUNT_STORAGE_EVENT));
  }

  function addAccount() {
    const name = newAccountName.trim();
    if (!name) return;
    saveAccounts([...accounts, name], name);
    setNewAccountName("");
  }

  function renameAccount(oldName: string, nextName: string) {
    const cleanName = nextName.trim();
    if (!cleanName) return;
    const nextAccounts = accounts.map((account) => (account === oldName ? cleanName : account));
    saveAccounts(nextAccounts, activeAccount === oldName ? cleanName : activeAccount);
    setEditingAccount(null);
    setEditingName("");
  }

  function deleteAccount(name: string) {
    saveAccounts(accounts.filter((account) => account !== name));
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        {accounts.map((account) => (
          <div key={account} className="grid gap-2 border-b border-[var(--border)] py-3 md:grid-cols-[1fr_auto] md:items-center">
            {editingAccount === account ? (
              <input
                value={editingName}
                onChange={(event) => setEditingName(event.target.value)}
                className="h-10 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--blue)]"
                aria-label={`Rename ${account}`}
                autoFocus
              />
            ) : (
              <div className="flex h-10 items-center text-sm font-semibold text-[var(--foreground)]">
                {account}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {editingAccount === account ? (
                <>
                  <button
                    type="button"
                    onClick={() => renameAccount(account, editingName)}
                    className="h-10 rounded-md bg-[var(--blue)] px-3 text-sm font-semibold text-black"
                  >
                    Save
                  </button>
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
                    setEditingAccount(account);
                    setEditingName(account);
                  }}
                  className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--blue)] hover:text-[var(--foreground)]"
                >
                  Edit
                </button>
              )}

              <button
                type="button"
                onClick={() => deleteAccount(account)}
                className="h-10 rounded-md border border-[var(--border)] px-3 text-sm font-semibold text-[var(--muted)] transition-colors hover:border-[var(--red)] hover:text-[var(--foreground)]"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          value={newAccountName}
          onChange={(event) => setNewAccountName(event.target.value)}
          placeholder="New account name"
          className="h-10 min-w-64 rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none focus:border-[var(--blue)]"
        />
        <button
          type="button"
          onClick={addAccount}
          className="h-10 rounded-md bg-[var(--blue)] px-4 text-sm font-semibold text-black"
        >
          Add account
        </button>
      </div>
    </div>
  );
}
