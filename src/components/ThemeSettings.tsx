"use client";

import { useState } from "react";

type Theme = "dark" | "light";

function getInitialTheme(): Theme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

export default function ThemeSettings() {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function updateTheme(nextTheme: Theme) {
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem("theme", nextTheme);
  }

  return (
    <div className="inline-flex h-10 items-center rounded-md border border-[var(--border)] p-1">
      {(["dark", "light"] as const).map((option) => {
        const active = theme === option;
        return (
          <button
            key={option}
            type="button"
            onClick={() => updateTheme(option)}
            className={`h-8 rounded px-3 text-sm font-semibold capitalize transition-colors ${
              active
                ? "bg-[var(--foreground)] text-[var(--background)]"
                : "text-[var(--muted)] hover:text-[var(--foreground)]"
            }`}
            aria-pressed={active}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
