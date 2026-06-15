"use client";

import { useEffect, useState } from "react";

const accounts = [
  "Live Account",
  "Paper Trading",
  "Roth IRA",
];

export default function AccountSelector() {
  const [account, setAccount] = useState(accounts[0]);

  useEffect(() => {
    const savedAccount = localStorage.getItem("activeAccount");
    if (savedAccount && accounts.includes(savedAccount)) {
      setAccount(savedAccount);
    }
  }, []);

  function updateAccount(nextAccount: string) {
    setAccount(nextAccount);
    localStorage.setItem("activeAccount", nextAccount);
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
