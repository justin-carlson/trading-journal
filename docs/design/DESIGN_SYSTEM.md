# Trading Journal Design System

> Status: Draft v1 · Last updated: 2026-06-13 · Theme: Deep

This document is the source of truth for the product's visual language,
typography, color, spacing, reusable primitives, and component rules. The
broader product requirements live in [DESIGN.md](DESIGN.md). Journal-specific
behavior and note structure live in [JOURNAL_DESIGN.md](JOURNAL_DESIGN.md).
For a compressed audit and implementation checklist, see
[DESIGN_SYSTEM_ONE_SHEET.md](DESIGN_SYSTEM_ONE_SHEET.md).

The system is type-first and open: structure comes from clear hierarchy,
mono eyebrow labels, tabular figures, whitespace, and thin hairline rules - not
from boxed, rounded cards. When in doubt, remove the box and let type,
spacing, and a single hairline do the work.

## Reference Artifacts

- [Material Design type scale](https://m2.material.io/design/typography/the-type-system.html#type-scale)
  for the idea of named type roles.
- A local design primitives exploration file
  for design-system primitives and Deep-theme exploration.
- `samples/Journal Design/`
  for journal, dashboard, calendar, and reports visual explorations.

## Design Direction

Trading Journal should feel calm, focused, and data-literate. It is not a
marketing site and it should not feel decorative. The interface should support
quick scanning during review, then get out of the way when the user is writing.

The current direction is:

- Deep blue-black background with a subtle lifted page glow.
- Open layouts over heavy card layouts.
- Ledger-like tables with quiet rules instead of boxed grids.
- Typography-led hierarchy.
- Compact mono metadata for dates, metrics, labels, and ticker rails.
- Red/green used only for P&L, status dots, and trading outcome signals.
- Blue used only for links, focus, active states, and selected accents.
- Controls stay clearly clickable, but content areas avoid unnecessary borders
  and containers.

## Fonts

Keep the current font stack for now:

- Sans: Geist Sans via `--font-sans`.
- Mono: Geist Mono via `--font-mono`.

The Deep-theme design exploration used Hanken Grotesk for UI/prose and
Newsreader as an optional editorial face for journal dates. Do not implement
that font change yet. Revisit only after the type scale and component roles are
normalized with the existing fonts.

## Tokens

Current app tokens should converge toward the Deep theme. Use stable token names
so a future light theme can swap values without changing component code.

### Core Dark Tokens

| Token | Value | Use |
| --- | --- | --- |
| `--background` | `#0b0d12` | App background and open content surfaces. |
| `--page-bg` | `radial-gradient(135% 90% at 50% -10%, #11151d 0%, #0a0c11 60%)` | Page background only. |
| `--surface` | `#12151d` | Controls, inputs, elevated modules, editors. |
| `--surface-2` | `#191d27` | Active segmented controls and slightly stronger surfaces. |
| `--border` | `#242a35` | Control borders and stronger dividers. |
| `--hairline` | `rgba(255, 255, 255, 0.06)` | Internal rules, table rows, chart dividers. |
| `--foreground` | `#f1f4f8` | Headings and primary values. |
| `--body` | `#c0c8d4` | Labels, readable UI copy, standard prose. |
| `--prose` | `#99a3b1` | Long-form journal note text. |
| `--muted` | `#6e7886` | Metadata, eyebrows, secondary labels. |
| `--faint` | `#414b58` | Disabled text, empty states, lowest-emphasis marks. |
| `--blue` | `#4d9bff` | Links, focus, selected nav accents, today markers. |
| `--green` | `#1db26b` | Positive P&L and positive status dots. |
| `--red` | `#f05143` | Negative P&L and negative status dots. |

Optional future token aliases from the Deep mockups:

```css
--g-bg: oklch(0.82 0.14 158 / 0.16);
--r-bg: oklch(0.71 0.19 27 / 0.16);
--g-edge: oklch(0.82 0.14 158 / 0.6);
--r-edge: oklch(0.71 0.19 27 / 0.6);
```

### Color Rules

- Page backgrounds use `background: var(--page-bg, var(--background))`.
- Component surfaces use `--background`, `--surface`, or `--surface-2`.
- P&L color helper:
  - `value > 0` uses `--green`.
  - `value < 0` uses `--red`.
  - `value === 0` uses `--muted`.
- Dollar amounts should be red/green when positive or negative.
- Neutral numeric values stay foreground or body color.
- Red and green should mean trading outcome, process signal, or P&L.
- Avoid colored backgrounds for calendar cells unless they are very subtle.
- Do not rely on color alone; pair red/green with signs, labels, dots, or
  placement.

## Type Scale

Use named type roles rather than one-off sizes. The Material Design type system
is useful as a model because it separates display, headline, title, body, and
label roles. We should adapt the idea, not copy Material's exact scale.

| Role | Use | Size / Line | Weight | Family | Notes |
| --- | --- | --- | --- | --- | --- |
| Eyebrow | Section/kicker labels | 10.5 / 1.2 | 600 | Mono | Uppercase, muted, letter spaced. |
| Display | Journal month/week/day title | 48 / 1.0 | 600 | Sans | Strong editorial moment. Use sparingly. |
| Page title | Calendar month/year, reports stats, trades range | 30-38 / 1.1 | 600 | Sans | Primary page orientation. |
| Section title | Dashboard sections, chart titles when not eyebrow | 24-26 / 1.2 | 600 | Sans | Major content sections. |
| Day title | Journal day / weekday | 19-21 / 1.25 | 600 | Sans | Pairs with compact metadata. |
| Trade symbol | Trade note symbol | 15 / 1.2 | 600 | Sans | Keep tight and scannable. |
| Body large | Journal prose | 15.5-18 / 1.62-1.75 | 300-400 | Sans | Reading mode, recap notes. |
| Body | Standard copy | 16 / 1.6 | 400 | Sans | Default descriptive text. |
| Label | Stat labels, form labels, meta | 12.5-13 / 1.4 | 500 | Sans | Quiet but legible. |
| Metric strip | Header submetrics like trades, win rate, PF, P&L | 13-14 / 1.4 | 400-500 | Mono | Muted, tabular, dot-separated. |
| Figure | Prices, counts, P&L, percentages | Varies | 400-600 | Mono | Always tabular. |
| Stat value | Stacked stat values | 18-20 / 1.2 | 600 | Mono | Use for reports/dashboard metrics. |
| Pill text | Process/emotion pills | 11 / 1.3 | 400-600 | Mono | White text with tiny valence dot. |
| Ticker rail | Journal right-side ticker/P&L module | 11 / 1.55 | 400-500 | Mono | Compact, tabular, best-to-worst scan. |
| Sidebar nav | Journal sidebar month/week navigation | 13 / 1.45 | 500 | Mono | Navigation, not annotation; keep legible. |

### Typography Rules

- Use size, weight, spacing, and position before using color for hierarchy.
- Avoid arbitrary text sizes unless a component has a clear reason.
- Use mono for:
  - table headers
  - metric strips and compact metrics
  - dates/ranges when they behave like data
  - ticker rails
  - journal sidebar month/week navigation
  - pills and labels
  - figures and page counts
- Use sans for:
  - page titles
  - prose
  - navigation
  - form labels and controls
- Use `font-variant-numeric: tabular-nums` on every number.
- Every P&L/figure span should use `white-space: nowrap`.
- Metric strips use muted mono text, generous dot separators, and red/green only
  on the P&L value.
- Keep letter spacing to a small set:
  - Eyebrow: `0.16em` to `0.28em`
  - Table header / small labels: `0.16em` to `0.22em`
  - Normal text: `0`
- Avoid negative letter spacing except for large display titles where it is
  already part of the journal direction.
- Micro type must be named and intentional. The approved tiny UI contexts are
  the Journal ticker rail and pill text. Journal sidebar navigation is promoted
  to `Sidebar nav` because it is navigational UI, not annotation.

## Spacing And Layout

Use spacing to show relationships:

- Tight spacing inside a group.
- Medium spacing between related groups.
- Larger spacing between major sections.

Recommended spacing roles:

| Value | Use |
| --- | --- |
| 4px | Tiny internal gaps, icon/text micro gaps. |
| 8px | Button internals, compact control gaps. |
| 12px | Label to control, table cell rhythm. |
| 16px | Standard component spacing. |
| 24px | Filter to content, section internals. |
| 32px | Header to content, chart/module spacing. |
| 48px | Major section breaks. |
| 64px | Large editorial/journal section breaks. |

Layout rules:

- No boxes by default. Group content with an eyebrow and a single hairline
  rather than a bordered rounded card.
- Use `--hairline` for internal rules; reserve `--border` for real controls or
  rare containers.
- Center major page content when it has a readable max width.
- Let dense tables use the full practical width.
- Journal prose should use readable line length; ticker rails should sit near
  the content, not float far to the right.
- Numbers are mono and tabular. They carry most of the saturated color on the
  page.
- Whitespace is the grid. Stacked label-over-value is often more scannable than
  label-left/value-right.
- Avoid cards inside cards.
- Avoid heavy outer boxes around content sections.

Negative-space rules:

- Keep density inside the object being scanned, then give the object room around
  it.
- Use 4-8px for micro gaps, 12-16px inside components, 24-32px between related
  groups, 44-56px between major report/chart sections, and 64px+ for journal
  reading breaks.
- Reports should breathe between stats, P&L, and chart grids.
- Journal prose should keep a readable line length, with ticker rails close
  enough to feel attached to the note.
- Calendar grids can be structured, but should stay quiet through text,
  hairlines, and subtle surfaces rather than heavy fills.

Radii:

- Containers: 5-7px.
- Pills/toggles: 6-7px.
- Avoid radius above 10px unless a component has a specific reason.
- Prefer no container at all when the content can stand on spacing and rules.

## Primitives

Build these once and reuse them everywhere.

### Eyebrow

Mono uppercase kicker for page sections and chart labels.

### Money

Mono tabular figure, P&L-colored, signed (`+$...` / `-$...`), no wrapping.

### Dot

Small green/red circle for valence. Use sparingly. Do not use dots on the
calendar.

### Toggle / Segmented Control

Use for peer view choices:

- Calendar: Month / Year.
- Reports: Today / Week / Month / Year.
- Trades: Today / Week / Month.
- Journal: Today / This week / This month.
- Dashboard chart: Week / Month / Year.

Rules:

- One outer border.
- Active segment uses `--surface-2` and foreground text.
- Inactive segments are muted.
- Border radius is modest, not pill-like.
- Height matches nearby controls.
- Width should fit the label set; avoid oversized segmented controls.

### Ghost Button

Outline button for Prev, Next, Clear, Apply, Back, and secondary actions.
Primary actions can use blue fill.

Rules:

- Default height: 40px.
- Border radius: 6px or less.
- Button text: 14px, semibold.
- Destructive actions use red text or red border only when needed.

### Tag

Pill with a small valence dot for process/emotion vocabulary. Tags are
secondary metadata, not the primary content.

### StatBlock

Stacked label above mono value. Use for dashboard summary metrics and small
metric groups. It is not the default pattern for detailed Reports stats.

### ReportsStatsMatrix

Diagnostic stats table for Reports. This is the default pattern when the user
needs to compare many performance metrics in one place.

Rules:

- Start with a compact summary strip for the period's primary answer:
  Total Gain/Loss, Win Rate, Profit Factor, Payoff Ratio, Avg Trade, and Avg
  Per-share G/L.
- Group detailed rows into Performance, Accuracy, Sizing, and Timing.
- Use row-based scanning with label left and value right inside each cell.
- Use subtle row rules and column gutters; avoid heavy boxed table chrome.
- Labels use regular-weight body/muted color.
- Values use mono tabular figures.
- Money values use red/green by sign; neutral metrics stay foreground/body.
- Keep all values visible without hover.
- On mobile, collapse to one column while preserving the group order.

### OpenSection

Eyebrow, thin rule, content, no outer box. This should be the default for most
dashboard, reports, and journal content.

### Strip

One bordered, hairline-divided rail. Use sparingly where a stronger grouped
module is needed.

### HBar / DivBar

Count bar and diverging P&L bar for Reports.

### LineChart

Cumulative P&L polyline with subtle area gradient. Final sign controls line
color.

## Components

### App Header

- Brand left, navigation beside it, utility actions right.
- Active nav item is foreground and semibold.
- Inactive nav items are muted and become foreground on hover.

### Forms And Filters

- Labels use Label or Eyebrow depending on density.
- Inputs/selects are 40px high, `--surface`, `--border`, 14px text.
- Filter bars are compact and aligned.
- Avoid adding unused controls to the journal; journal navigation should feel
  more like a note app than a data grid.

### Tables

Tables should read like ledgers.

Rules:

- No heavy outer card unless the table is inside a real tool surface.
- Use top/bottom rules and subtle row dividers.
- Table headers: mono, uppercase, 11-12px, letter spaced.
- Table body: 14px.
- Numeric columns use tabular numbers.
- P&L columns use red/green.
- Hover row can use subtle `--surface`.

### Stats

Stats should be diagnostic first. Choose the pattern based on the job:

- Dashboard summary metrics use `StatBlock`.
- Reports detailed metrics use `ReportsStatsMatrix`.

Rules:

- Group stats into named sections: Performance, Accuracy, Sizing, Timing.
- Section label uses the Eyebrow role.
- Reports stats use row-based matrix scanning rather than loose floating cards.
- Add one horizontal rule below each section label.
- Stat labels are regular weight and body/muted color.
- Stat values use Stat Value.
- Money values use red/green.
- Bottom row in each section does not need an extra divider.

### Charts

- Chart titles use Eyebrow.
- Put the horizontal rule under the chart title.
- Leave generous space before chart groups.
- Two-column chart grids need enough horizontal gutter to avoid visual merging.
- Cumulative P&L should usually span full width before smaller distribution
  charts.

### Calendar

- Month view earns its grid; keep the cell structure.
- Cells use `--hairline` rules, modest radius, and no dots.
- Day headers are quiet and compact.
- Day number, P&L, and trade count have clear hierarchy.
- Today uses the blue day number or a subtle active marker.
- Monthly P&L sits on the month header row.
- Weekly Total column is flat, not filled.
- Year view shares the same background and cell color logic as month view.
- Year view mini-months can use subtle green/red heatmap fills.

### Journal

Journal is prose-first.

Rules:

- Month/week/day headers use Display or Page Title roles.
- Recap text uses Body Large.
- Metrics sit directly under the header as quiet mono metadata.
- Trade notes sit under the daily note.
- Ticker rail is compact, secondary, and sorted best to worst.
- Process/emotion pills are secondary metadata.
- Reading mode hides edit controls until the user interacts.

## Page-by-Page Direction

### Dashboard

- "This week" uses five open day columns under a hairline.
- Today uses blue label or a 2px blue top tick, not a filled block.
- Weekly stats are an open StatBlock row beneath one hairline.
- Cumulative chart and recent trades use OpenSection.
- Recent trades should be hairline-ruled rows, not table chrome.

### Calendar

- Month and year controls use the shared Toggle treatment.
- Month grid remains a practical ledger grid.
- Year mini-months use the same Deep background and subtle P&L cell colors.

### Reports

- Stat sections use the `ReportsStatsMatrix` pattern.
- Avoid loose floating stat blocks for detailed reports.
- Avoid heavy table chrome; use subtle row rules and clear group labels.
- Selects are flat with `--hairline` or `--border`.
- Cumulative/daily chart and distribution/performance bars use OpenSection.

### Journal

- The Hybrid journal direction is the current north star: spine/dot rhythm,
  prose-weight notes, quiet day stat line, compact best-to-worst ticker module.
- Sidebar supports historical navigation; top shortcuts are for current day,
  week, and month.

### Trades

Still needs a full design pass. Apply the shared table, filter, segmented
control, note composer, and P&L rules already defined here.

## States

Every reusable component should define:

- Default
- Hover
- Focus
- Active/selected
- Disabled
- Empty
- Loading, where applicable
- Error/success, where applicable

Focus states should use `--blue` and be visible against the dark background.
Empty states should be quiet but actionable. Error states should be specific,
calm, and recoverable.

## Accessibility

- Body text and controls remain readable at common desktop and laptop sizes.
- Avoid type below 10px.
- Do not encode meaning with color alone.
- Icon-only controls need accessible labels.
- Form controls need visible labels or proper screen-reader labels.
- Keyboard focus is visible for links, buttons, inputs, selects, and editable
  notes.
- Preserve semantic headings where possible.
- Touch/click targets should remain large enough even when the visual treatment
  is compact.

## Implementation Guidance

Near-term cleanup:

1. Add shared type-role utilities or component classes for the roles in this
   doc.
2. Replace one-off text sizes where practical.
3. Normalize metadata tracking to one or two values.
4. Normalize stat, table, filter, and segmented-control typography.
5. Port the Deep tokens into `src/app/globals.css` carefully.
6. Keep journal as the north star, then bring reports, dashboard, calendar, and
   trades into the same language.

Do not change everything at once. Start with one surface, verify visually, then
roll the shared patterns across the rest of the app.

## Open Items

- Light mode token values.
- Trades list and detail visual pass.
- Whether to revisit Hanken Grotesk after the existing Geist type scale is
  normalized.
- Whether green/red should eventually move from hex tokens to OKLCH tokens for
  better perceptual tuning.

## Source Map

The original design explorations are mockups, not production code. Port the
token names, visual values, and component intent into the real Next.js app.

| Concern | Reference |
| --- | --- |
| Product design doc | [DESIGN.md](DESIGN.md) |
| Journal feature design | [JOURNAL_DESIGN.md](JOURNAL_DESIGN.md) |
| Design primitives exploration | Local design primitives exploration file |
| Journal mockups | `samples/Journal Design/` |
| App tokens | `src/app/globals.css` |
| Main app shell | `src/app/layout.tsx` |
| Dashboard | `src/app/page.tsx` |
| Calendar | `src/app/calendar/page.tsx` |
| Reports | `src/app/reports/page.tsx` |
| Journal | `src/app/journal/page.tsx` |
| Trades list | `src/app/trades/page.tsx` |
| Trade detail | `src/app/trades/[id]/page.tsx` |
