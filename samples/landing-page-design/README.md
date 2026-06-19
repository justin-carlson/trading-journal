# Handoff: Trading Journal AI — Landing Page

## Overview
Marketing landing page for **Trading Journal AI** (https://trading-journal.ai), a
local-first, journal-first trading review tool. The page sells the review habit
(Recap → Review & Reflect → Coach), the AI coach concept, and the local-first/
privacy story, and drives to the live demo (`/demo`) and the GitHub repo.

## About the Design Files
The files in this bundle are **design references created in HTML/React (via
in-browser Babel)** — a prototype showing the intended look, copy, and behavior.
They are **not** production code to ship as-is. The task is to **recreate this
design in the Trading Journal AI codebase** (Next.js / React, the same app that
contains `src/app/journal`, `src/app/trades`, etc.) using its existing
conventions — real components, CSS modules / Tailwind / whatever the app uses,
Next `<Link>`, etc.

The design deliberately reuses the app's **Deep dark** design system (the same
tokens already in `DESIGN_SYSTEM.md`), so most colors/type/spacing map directly
onto existing variables.

## Fidelity
**High-fidelity.** Final colors, typography, spacing, copy, and interactions are
all intended as shown. Recreate pixel-faithfully using the codebase's existing
component and styling patterns. The embedded "product screenshots" in the page
are simplified re-creations of real app screens (journal day view, ticker
review, trade detail, coach) — in production these can be real screenshots or
live components; they do not need to be rebuilt as the mock versions here.

## Layout / Page Structure
Single scrolling page, max content width **1200px**, 32px side padding,
Deep dark background (`--page-bg` radial gradient on `--bg`). Sections top→bottom:

1. **Sticky nav** — 64px tall, blurred translucent bg (`rgba(11,13,18,.72)` +
   `backdrop-filter: blur(14px)`), 1px `--hair` bottom border. Left: green dot
   (`--g`, 9px, soft glow) + wordmark "Trading Journal AI" (15.5px/700/`--ink`).
   Right: text links "The review habit", "AI coach", "Local-first", a GitHub
   link with inline icon, and a solid CTA button "View the demo".

2. **Hero** — left-aligned, max-width 800px text block:
   - Eyebrow (`.tj-eyebrow`, green `--g`): "Local-first trading journal"
   - H1 (56px / 600 / -0.03em / `--ink`, `text-wrap: balance`):
     "A journal-first trading review system."
   - Paragraph (19px/1.6/`--prose`, max 620px): "Trading Journal AI is built
     around the review habit. Write the daily recap, drill into the trades that
     mattered, and note what to repeat — so the story of each day stays easy to
     read."
   - Buttons row: primary "View the live demo →" (solid `--ink` bg, `--bg`
     text), secondary "View on GitHub" (1px `--border`, `--ink` text).
   - Mono caption (12px/`--muted`): "No signup · No subscription · Your data
     stays on your machine"
   - **Walkthrough** (margin-top 64px): a 3-column step rail above a browser
     frame. See "Interactions" for animation. Steps:
     - 01 **Recap** — "Start with the story of the session."
     - 02 **Review & Reflect** — "See the trade in context and note what mattered."
     - 03 **Coach** — "Get feedback graded against your own rules."
     The browser frame (rounded 12px, traffic-light dots, centered
     `trading-journal.ai/demo` URL pill) shows the screen for the active step,
     cross-fading between them.

3. **Review section** (`#review`) — eyebrow "The review habit"; H2 (40px/600):
   "Review faster. Remember more. / Refine your process." (2nd line `--prose`);
   sub "Trading Journal AI brings notes, charts, P&L, tags, and coaching into one
   journal-first workflow." Then two feature rows (alternating image/text, 56px
   gap), each with a numbered green mono kicker, 25px/600 title, 16px body, and a
   bordered product screenshot:
     - 01 "See the day in context — The recap leads, the data follows."
     - 02 "Capture it in seconds — Tag the trade in your own language." (shows the
       note composer with pills; pill row sample below the copy)

4. **Coach section** (`#coach`) — full-width band, `--surface` bg, top `--hair`
   border. Eyebrow with spark icon (accent `--accent`): "The AI in Trading
   Journal AI" + a "Preview" mono chip. Two columns: left = H2 (40px) "A coach
   that grades against *your* rules." ("your" in `--accent`), body paragraph, and
   a 3-step numbered list (Codify your edge / Review against it / Draft, never
   auto-post); right = the Coach review card (grade "A−", 4 rule checks with
   check/alert icons, a serif coach quote, and a "Use as note draft" button).

5. **Local-first section** (`#local`) — `--surface` bg. Left: eyebrow
   "Local-first" (green), H2 "Your trading day never leaves your machine.", body
   paragraph leading with "It's the first thing serious traders ask about…", and
   a "Read how it works →" accent link. Right: a 2×2 grid of cards (1px hairline
   dividers): On your machine / Private by default / No subscription / Open
   source · MIT, each with an icon, title, and description.

6. **Get started** (centered, max 900px) — eyebrow "Get started", H2 (42px) "Try
   the demo, or run your own in two minutes.", body, two buttons (View the live
   demo / Star on GitHub), and a click-to-copy install command box ("$ git clone
   … && ./install-trading-journal.sh").

7. **Footer** — green dot + wordmark + `trading-journal.ai`, right-aligned mono
   links: Demo / GitHub / MIT License / © 2026.

## Interactions & Behavior
- **Sticky nav**: stays on scroll, translucent blur. Links smooth-scroll to
  `#review`, `#coach`, `#local` (page uses `scroll-behavior: smooth`).
- **Hero walkthrough**: auto-advances through the 3 steps on a **4.2s** interval.
  The active step's underline bar animates a left→right fill (`scaleX` 0→1,
  `transform-origin: left`, 4.2s linear) via the `tj-growx` keyframe; completed
  steps show a full bar; upcoming steps empty. The product screen for the active
  step is opacity-1, others opacity-0 with a **0.5s ease** cross-fade. Clicking a
  step jumps to it. **Hovering the walkthrough pauses** auto-advance (and freezes
  the bar). Copy under each step stays fully visible at all times (do not fade
  the labels — earlier versions flashed and were hard to read).
- **CTA buttons**: primary lightens slightly on hover (opacity .88); ghost
  buttons brighten border to `--muted` + `--surface` bg on hover.
- **Install command box**: click copies the full clone+install command to
  clipboard and shows "Copied ✓" (green) for 1.6s.
- **Note caret** (in note-composer mock): blinking caret via `lf-blink` keyframe.
- Links open the demo / GitHub in a new tab.

## State Management
Minimal, all local component state (React `useState`/`useEffect`):
- Hero: `i` (active step index 0–2), `paused` (bool, hover). `setTimeout` on a
  4.2s loop advancing `i`, cleared/skipped while `paused`.
- Get started: `copied` (bool) with a 1.6s reset timer.
No data fetching. No global state. No routing beyond anchor links + external
hrefs (`/demo`, GitHub URL).

## Design Tokens (Deep dark — `.tj.tj-dark`)
Fonts:
- `--sans`: 'Hanken Grotesk', system-ui, sans-serif
- `--serif`: 'Newsreader', Georgia, serif  (used for journal prose / recaps / notes)
- `--mono`: 'Geist Mono', ui-monospace, monospace  (numbers, labels, eyebrows)

Colors:
- `--bg`: #0b0d12
- `--page-bg`: radial-gradient(135% 90% at 50% -10%, #11151d 0%, #0a0c11 60%)
- `--surface`: #12151d   · `--surface-2`: #191d27
- `--border`: #242a35    · `--hair`: rgba(255,255,255,.06)
- `--ink`: #f1f4f8 (headings) · `--body`: #c0c8d4 · `--prose`: #99a3b1
- `--muted`: #6e7886 · `--faint`: #414b58
- `--g` (P&L green / positive): oklch(0.82 0.14 158)
- `--r` (P&L red / negative): oklch(0.71 0.19 27)
- `--g-bg` / `--r-bg`: same hue @ 16% alpha (pill/cell fills)
- `--g-edge` / `--r-edge`: same hue @ 60% alpha (pill borders)
- `--accent` (AI coach / links): #4d9bff

Type scale used on the page (px):
- Hero H1 56 / Section H2 38–42 / feature H3 25 / body 16–19 / mono labels 10.5–13
- `.tj-eyebrow`: mono, 10.5px, letter-spacing .16em, uppercase, `--muted`, 500

Radius: cards/frames 12px, buttons 8–9px, pills 999px, small fills 6–7px.
Shadows: frames use `0 30–40px 70–90px -30px rgba(0,0,0,.6–.7)`.
Spacing: section vertical padding ~90–100px; content gap 32–56px; max width 1200.

Semantics: **green = positive P&L / good process, red = negative / rule break,
accent blue = AI coach + links only.** Keep P&L green/red exactly as-is.

A light theme (`.tj-light`) exists in `journal-data.jsx` if a light landing
variant is ever wanted, but the page ships dark.

## Pills / codified inputs (note composer + Review feature 02)
The note pills mirror the app's real label sets (`src/lib/journalLabels.ts`):
quality (Best setup / Good trade / Needs review / Chased / Rule break),
**Process** (Patient, Followed plan, Let winner work, Sized correctly, Took
profits early…), **Emotion** (Calm, Focused, Impatient, FOMO…). Reuse those exact
sets in production rather than the sample subset shown.

## Assets
- **Fonts**: Hanken Grotesk, Newsreader (incl. italic), Geist Mono — loaded from
  Google Fonts in the prototype; use the app's existing font setup in production.
- **Icons**: all inline SVG (GitHub mark, arrow, lock, monitor, spark, check,
  alert, download). No external icon dependency.
- **Charts**: lightweight inline SVG candlestick+volume (`trades-flow-chart.jsx`),
  deterministic sample data — placeholders for real chart components.
- No raster images / no photography.

## Files (in this bundle)
- `Trading Journal AI - Landing.html` — host file (load order + Google Fonts + base CSS)
- `landing.jsx` — page composition: Nav, Hero, Review, Coach, LocalFirst, GetStarted, Footer
- `landing-mocks.jsx` — scaled browser frame + product-screen mocks (Recap, Drill, Note, **Coach**) + the STAGES array driving the hero walkthrough
- `landing-features.jsx` — note-composer card + pills + coach concept card
- `journal-data.jsx` — **the Deep dark token system** (inject once), money/pct helpers, sample week/month data, pill label tones
- `trades-flow-chart.jsx` — inline SVG candlestick + volume chart
- `trading-journal-landing.html` — the fully self-contained single-file build (all
  JS inlined; useful as a visual reference / quick preview, not for editing)

To preview: open `Trading Journal AI - Landing.html` (needs the sibling .jsx
files) or just open `trading-journal-landing.html` standalone.
