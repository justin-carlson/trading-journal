"use client";

import { useEffect, useState } from "react";
import { ACCOUNT_STORAGE_EVENT, ACCOUNTS_STORAGE_KEY, ACTIVE_ACCOUNT_STORAGE_KEY, DEFAULT_ACCOUNTS } from "@/lib/accounts";

export default function AccountSelector() {
  const [accounts, setAccounts] = useState(DEFAULT_ACCOUNTS);
  const [account, setAccount] = useState(DEFAULT_ACCOUNTS[0]);

  useEffect(() => {
    function loadAccounts() {
      const savedAccounts = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
      let parsedAccounts: unknown = DEFAULT_ACCOUNTS;
      try {
        parsedAccounts = savedAccounts ? JSON.parse(savedAccounts) : DEFAULT_ACCOUNTS;
      } catch {
        parsedAccounts = DEFAULT_ACCOUNTS;
      }
      const cleanAccounts = Array.isArray(parsedAccounts)
        ? parsedAccounts.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : DEFAULT_ACCOUNTS;
      const nextAccounts = cleanAccounts.length > 0 ? cleanAccounts : DEFAULT_ACCOUNTS;
      const savedAccount = localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY);

      setAccounts(nextAccounts);
      setAccount(savedAccount && nextAccounts.includes(savedAccount) ? savedAccount : nextAccounts[0]);
    }

    loadAccounts();
    window.addEventListener(ACCOUNT_STORAGE_EVENT, loadAccounts);
    return () => window.removeEventListener(ACCOUNT_STORAGE_EVENT, loadAccounts);
  }, []);

  function updateAccount(nextAccount: string) {
    setAccount(nextAccount);
    localStorage.setItem(ACTIVE_ACCOUNT_STORAGE_KEY, nextAccount);
  }

  return (
    <label className="inline-flex h-10 items-center rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm font-semibold text-[var(--foreground)] transition-colors hover:border-[var(--blue)]">
      <span className="sr-only">Active account</span>
      <select
        value={account}
        onChange={(event) => updateAccount(event.target.value)}
        className="bg-transparent outline-none"
      >
        {accounts.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
