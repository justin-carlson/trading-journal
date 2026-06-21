"use client";

import { useState } from "react";

type Variation = {
  id: string;
  label: string;
  file: string;
  blurb: string;
};

const VARIATIONS: Variation[] = [
  {
    id: "base",
    label: "Recap",
    file: "/review/dashboard/base.html",
    blurb:
      "The orientation surface as two designed recaps — a Morning brief (“where you left off”) and an Afternoon check-in. Command strip up top, narrative + account pulse on the left, last-week rail and A+ watchlist on the right.",
  },
  {
    id: "orientation",
    label: "Orientation loop",
    file: "/review/dashboard/orientation.html",
    blurb:
      "Adds the active orientation loop: a collapsible phase check-in, the market-read “call the tape” block, and a top-gainers review where every mover is classified and scored against the five pillars.",
  },
  {
    id: "sticky",
    label: "Sticky cues",
    file: "/review/dashboard/sticky.html",
    blurb:
      "Brings the “notes on the glass” ritual into the dashboard — draggable paper cue cards you check off as you run them, placed above or below the recap.",
  },
];

export default function DashboardReviewPage() {
  const [active, setActive] = useState(VARIATIONS[0]);

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#07090d",
        color: "#c0c8d4",
        fontFamily:
          "ui-sans-serif, system-ui, -apple-system, 'Hanken Grotesk', sans-serif",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <header
        style={{
          borderBottom: "1px solid #242a35",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span
            style={{
              fontFamily: "ui-monospace, 'Geist Mono', monospace",
              fontSize: 10.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#6e7886",
            }}
          >
            Design review
          </span>
          <span style={{ fontSize: 17, fontWeight: 700, color: "#f1f4f8" }}>
            Dashboard design variations
          </span>
        </div>

        <div
          style={{
            display: "inline-flex",
            border: "1px solid rgba(255,255,255,.1)",
            borderRadius: 10,
            padding: 4,
            gap: 4,
            background: "#11151d",
            boxShadow:
              "inset 0 1px 0 rgba(255,255,255,.04), 0 14px 34px -24px rgba(0,0,0,.9)",
          }}
        >
          {VARIATIONS.map((v) => {
            const on = v.id === active.id;
            return (
              <button
                key={v.id}
                onClick={() => setActive(v)}
                style={{
                  cursor: "pointer",
                  border: "none",
                  padding: "9px 17px",
                  borderRadius: 7,
                  fontSize: 13,
                  fontWeight: 700,
                  whiteSpace: "nowrap",
                  color: on ? "#f1f4f8" : "#99a3b1",
                  background: on
                    ? "linear-gradient(180deg, rgba(29,178,107,.22), rgba(25,29,39,.96))"
                    : "rgba(255,255,255,.03)",
                  boxShadow: on
                    ? "0 0 0 1px rgba(29,178,107,.42), 0 10px 26px -18px rgba(29,178,107,.7)"
                    : "inset 0 0 0 1px rgba(255,255,255,.045)",
                  transition: "color .15s, background .15s, box-shadow .15s",
                }}
              >
                {v.label}
              </button>
            );
          })}
        </div>

        <span style={{ flex: 1 }} />

        <a
          href={active.file}
          target="_blank"
          rel="noreferrer"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            height: 36,
            padding: "0 15px",
            borderRadius: 8,
            border: "1px solid rgba(77,155,255,.35)",
            background: "rgba(77,155,255,.08)",
            fontSize: 13,
            fontWeight: 700,
            color: "#d7e7ff",
            textDecoration: "none",
            whiteSpace: "nowrap",
            boxShadow: "0 12px 30px -24px rgba(77,155,255,.75)",
          }}
        >
          Open fullscreen ↗
        </a>
      </header>

      <p
        style={{
          margin: 0,
          padding: "14px 28px",
          maxWidth: "92ch",
          fontSize: 14,
          lineHeight: 1.6,
          color: "#99a3b1",
          borderBottom: "1px solid #242a35",
        }}
      >
        {active.blurb}
      </p>

      <div style={{ flex: 1, minHeight: 0, background: "#07090d" }}>
        <iframe
          key={active.id}
          src={active.file}
          title={active.label}
          style={{
            width: "100%",
            height: "100%",
            minHeight: "calc(100vh - 150px)",
            border: "none",
            display: "block",
          }}
        />
      </div>
    </main>
  );
}
