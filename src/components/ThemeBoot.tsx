"use client";

import { useEffect } from "react";

export default function ThemeBoot() {
  useEffect(() => {
    try {
      const theme = localStorage.getItem("theme");
      document.documentElement.dataset.theme = theme === "light" ? "light" : "dark";
    } catch {
      document.documentElement.dataset.theme = "dark";
    }
  }, []);

  return null;
}
