# Trading Journal Design System One-Sheet

> Status: Draft · Last updated: 2026-06-13 · Source: Deep theme exploration +
> current app audit

This is the quick-reference sheet for the product's visual system. It compresses
the design direction into one scannable artifact, compares it to what the app is
currently doing, and turns the gap into an implementation checklist.

For a visual browser artifact, open
[DESIGN_SYSTEM_ONE_SHEET.html](DESIGN_SYSTEM_ONE_SHEET.html).

## Use With Codex

Before making UI changes, read this file and `DESIGN_SYSTEM.md`. Treat the
system as a working brief:

- Preserve the Deep theme.
- Use type, spacing, and hairlines before boxes and fills.
- Use shared primitives instead of page-local one-off class strings.
- Keep trading data dense only where density helps scanning.
- Give journal prose, report sections, chart groups, and page headers room to
  breathe.

Default implementation primitives:

- `Eyebrow`
- `Money`
- `SegmentedControl`
- `GhostButton`
- `StatBlock`
- `ReportsStatsMatrix`
- `OpenSection`
- `Tag/Pill`

## North Star

Trading Journal should feel like a focused trading ledger and reflective journal:
calm, dark, type-led, compact where data needs scanning, spacious where notes
need reading.

Core idea:

- **Type-first and open.**
- **Hairlines instead of boxes.**
- **Mono numbers and metadata.**
- **Red/green only for trading outcomes.**
- **Blue only for active/focus/link states.**
- **Whitespace creates the layout.**

## Foundations

### Color

| Role | Intended Token | Intended Value | Current App | Status |
| --- | --- | --- | --- | --- |
| Page background | `--background` | `#0b0d12` | `#080c12` | Close, should converge. |
| Page glow | `--page-bg` | radial deep gradient | Missing | Add. |
| Surface | `--surface` | `#12151d` | `#111821` | Close, should converge. |
| Active surface | `--surface-2` | `#191d27` | `#151e2a` | Needs update. |
| Border | `--border` | `#242a35` | `#273040` | Needs update. |
| Hairline | `--hairline` | `rgba(255,255,255,.06)` | `rgba(255,255,255,.07)` | Close. |
| Heading/value | `--foreground` | `#f1f4f8` | `#e6edf3` | Needs update. |
| Body/labels | `--body` | `#c0c8d4` | `#c3ccd8` | Close. |
| Prose | `--prose` | `#99a3b1` | Missing | Add. |
| Muted/meta | `--muted` | `#6e7886` | `#7a8492` | Needs update. |
| Faint | `--faint` | `#414b58` | `#4d5664` | Needs update. |
| Accent | `--blue` | `#4d9bff` | `#58a6ff` | Needs update. |
| Positive P&L | `--green` | `#1db26b` | `#1db26b` | Aligned. |
| Negative P&L | `--red` | `#f05143` | `#f05143` | Aligned. |

Rules:

- Every dollar amount uses red/green by sign.
- Zero values use muted text.
- Calendar cells avoid strong red/green fills; use text and subtle heatmap
  backgrounds only where needed.
- Hard-coded colors should be replaced with tokens.

### Typography

Keep Geist Sans and Geist Mono for now. The external design exploration used
Hanken Grotesk, but that is paused until the existing type system is normalized.

| Role | Intended Use | Size / Line | Current App Pattern | Status |
| --- | --- | --- | --- | --- |
| Eyebrow | Section labels, chart labels | 10.5 / 1.2, mono uppercase | Many `text-xs`, `tracking-[0.3em]` variants | Normalize. |
| Display | Journal month/week/day | 48 / 1.0 | Journal uses `text-5xl`, close | Mostly aligned. |
| Page title | Calendar, reports, trades range | 30-38 / 1.1 | Mixed `text-xl`, `text-3xl`, `text-5xl` | Needs roles. |
| Section title | Dashboard, module titles | 24-26 / 1.2 | Mixed page-by-page | Needs roles. |
| Day title | Journal day | 19-21 / 1.25 | Often 24px | Consider tightening. |
| Body large | Journal prose | 15.5-18 / 1.62-1.75 | Journal close, elsewhere mixed | Mostly aligned in Journal. |
| Label | Form/stat labels | 12.5-13 / 1.4 | Often `text-sm font-semibold` | Too loud in places. |
| Metric strip | Header submetrics | 13-14 / 1.4 mono | Journal exists | Add role. |
| Figure | Numeric values | Mono tabular | Inconsistent mono usage | Normalize. |
| Pill text | Process/emotion pills | 11 / 1.3 mono | Journal close | Mostly aligned. |
| Ticker rail | Journal right-side ticker/P&L module | 11 / 1.55 mono | Journal close | Needs named role. |
| Sidebar nav | Journal sidebar month/week nav | 13 / 1.45 mono | Too small in app | Promote role. |

Rules:

- Use named type roles instead of one-off Tailwind text sizes.
- Use mono for figures, metric strips, compact metrics, dates as data, ticker
  rails, pills, and table headers.
- Metric strips use muted mono text, generous dot separators, and red/green only
  on the P&L value.
- Use mono for the Journal sidebar month/week navigation. It is small support
  navigation, not body copy and not micro annotation.
- Use tabular numbers for all prices, shares, P&L, percentages, and counts.
- Avoid using color as the only hierarchy tool.
- Do not go below 11px for app UI. If text needs to be smaller than that, the
  layout probably needs more room instead.

### Spacing

| Use | Intended Value |
| --- | --- |
| Micro gaps | 4-8px |
| Component rhythm | 12-16px |
| Filter to content | 24px |
| Header to content | 32px |
| Major section breaks | 48px |
| Editorial journal breaks | 64px |

Current app uses many good values, but spacing is still mostly page-local. The
biggest issue is not the exact number; it is that equivalent sections on
dashboard, reports, trades, calendar, and journal sometimes use different
vertical rhythm.

### Negative Space

Negative space is not leftover area. It is an active part of the interface. It
tells the user what belongs together, what can be scanned quickly, and where to
slow down and reflect.

Use this ladder:

| Layer | Space | Use |
| --- | --- | --- |
| Micro | 4-8px | Pills, metric separators, ticker rows, compact controls. |
| Component | 12-16px | Button groups, form rows, stat label-to-value rhythm, chart labels. |
| Section | 24-32px | Header-to-content, filter-to-content, chart title-to-plot. |
| Major | 44-56px | Stats to P&L, P&L to charts, calendar header to grid, report module breaks. |
| Editorial | 64px+ | Journal month/week/day breaks where the user is reading or writing. |

Rule of thumb:

Keep density inside the thing being scanned, then give the whole thing space
around it. Trades can be tight. Ticker rails can be tight. Stat rows can be
compact. But the spaces between filters, sections, charts, and journal entries
should be generous enough that the page feels intentional instead of packed.

Page-specific notes:

- **Journal:** Prose column should sit around 760-860px. Ticker rails should stay
  close to the note, not drift to the far edge of the viewport.
- **Reports:** Create clear vertical breaks between stats, P&L, and chart grids.
  Two-up charts need horizontal gutters so labels do not bleed into each other.
- **Calendar:** The grid can be structured, but the theme should stay quiet. Use
  text color and hairlines before strong fills.
- **Dashboard:** Pull labels closer to their values and remove lines that do not
  separate meaningful sections.
- **Trades:** Ledger rows can stay dense, but range context, filters, and
  pagination need more breathing room.

## Component Inventory

### Segmented Control

Use for Today / Week / Month, Month / Year, and chart tabs.

Intended:

- One outer border.
- Active segment = `--surface-2` + foreground.
- Inactive = muted.
- Modest radius.
- Width fits labels.

Current:

- Exists in several places.
- Some hard-coded blue values remain.
- Slight width/radius differences across pages.

### Ghost Button

Use for Clear, Apply, Back, secondary actions.

Intended:

- 40px height.
- 6px radius or less.
- Border token.
- Blue only for focus/primary emphasis.

Current:

- Mostly aligned.
- Some buttons use page-local class strings.

### StatBlock

Use for dashboard summary metrics and compact metric groups. Do not use this as
the default pattern for detailed Reports stats.

Intended:

- Label above value.
- Label regular weight, body/muted color.
- Value mono, tabular, stronger.
- Money values red/green.
- Grouped into Performance, Accuracy, Sizing, Timing.

Current:

- Dashboard is a good fit for this pattern.
- Reports needs a more diagnostic pattern.
- Needs shared primitive to prevent drift.

### ReportsStatsMatrix

Use for detailed Reports stats.

Intended:

- Summary strip first: Total Gain/Loss, Win Rate, Profit Factor, Payoff Ratio,
  Avg Trade, Avg Per-share G/L.
- Detail groups below: Performance, Accuracy, Sizing, Timing.
- Row-based scanning with label left and value right inside each cell.
- Subtle row rules and column gutters.
- Labels regular weight and muted/body color.
- Values mono, tabular, stronger.
- Money values red/green by sign.
- All values visible without hover.

Current:

- Reports has drifted too editorial/open for the diagnostic job.
- Needs this pattern before the next Reports polish pass.

### OpenSection

Default section pattern.

Intended:

- Eyebrow/title.
- One hairline.
- Content.
- No outer card.

Current:

- Journal and Reports are closest.
- Dashboard and Trades still have mixed treatments.

### Tables / Ledgers

Intended:

- No heavy outer card.
- Subtle horizontal row rules.
- Mono uppercase headers.
- Tabular numeric columns.
- P&L columns red/green.

Current:

- Trades table is close structurally.
- Some table typography and filter spacing still feel older than the new visual
  direction.

### Journal Sidebar

Intended:

- Mono navigation for month/week history at `13px / 1.45`.
- Active item uses foreground or outcome color when it represents the selected
  period.
- Inactive items use muted/faint color.
- Dates stay compact and tabular.
- The sidebar should support navigation, not compete with the journal prose.

Current:

- The pattern exists visually, but it was missing from the type system.
- Existing app sidebar type is likely too small for navigation.
- Needs a named `JournalSidebarNav` primitive before production cleanup.

### Calendar

Intended:

- Month view can keep a grid.
- Cells use Deep background, hairlines, quiet hierarchy.
- Month header row includes monthly P&L.
- Year mini-months share the same theme and subtle heatmap logic.

Current:

- Recently improved.
- Still a key place to verify color consistency against Deep tokens.

### Journal

Intended:

- Prose-first.
- Month/week/day hierarchy.
- Compact metrics under headers.
- Trade notes under daily notes.
- Ticker module compact and near prose, not floating far right.
- Editing controls hidden until interaction.

Current:

- Closest to the north star.
- Needs continued cleanup around edit states, note labels, and shared note
  composer behavior.

## Current App Gap Summary

High-confidence gaps found in current code:

- Tokens are close but not fully aligned with Deep.
- `--page-bg` and `--prose` are missing.
- Hard-coded `#58a6ff` and `#e6edf3` still appear in components.
- Typography roles are documented but not implemented as reusable utilities.
- Several pages repeat their own segmented-control/button class strings.
- Reports stats should move from loose StatBlock grids to a diagnostic
  `ReportsStatsMatrix`.
- Calendar needs final token consistency across month and year.
- Trades needs the newest design language applied more intentionally.
- Journal is strong, but trade note editing should become a shared component
  pattern rather than page-specific UI.
- Journal sidebar navigation should be promoted from tiny micro text to the
  `Sidebar nav` role.

## Fix List

### Phase 1: Foundations

1. Update `src/app/globals.css` to match Deep tokens.
2. Add `--page-bg` and apply it to page background.
3. Add `--prose`.
4. Replace hard-coded `#58a6ff` with `var(--blue)`.
5. Replace hard-coded `#e6edf3` with `var(--foreground)`.
6. Add shared utility classes or components for:
   - Eyebrow
   - Money
   - SegmentedControl
   - GhostButton
   - StatBlock
   - ReportsStatsMatrix
   - OpenSection
   - Tag/Pill

### Phase 2: Typography Cleanup

1. Normalize page titles across Calendar, Reports, Trades, and Journal.
2. Normalize section labels to one Eyebrow treatment.
3. Normalize stat labels to regular weight.
4. Normalize stat values to mono/tabular.
5. Normalize table headers to mono uppercase.
6. Normalize compact metric strips.

### Phase 3: Component Cleanup

1. Replace duplicated segmented-control markup with one shared component.
2. Replace duplicated secondary buttons with one GhostButton pattern.
3. Convert Reports stat groups to the shared ReportsStatsMatrix primitive.
4. Convert Dashboard weekly stats and chart tabs to shared primitives.
5. Convert Trades filters/table/pagination to shared primitives.
6. Keep Calendar grid but align cells and headers with Deep tokens.

### Phase 4: Journal And Notes

1. Keep the current journal layout as the north star.
2. Make the trade note composer shared between Journal and Trade detail.
3. Define view/edit/delete states for notes.
4. Keep note labels and pills visually quiet: white text with small red/green
   dots.
5. Confirm keyboard/focus behavior for editable notes.

### Phase 5: Accessibility And States

1. Ensure every icon-only or visual-only control has an accessible name.
2. Add visible focus states to links, buttons, filters, note editors, and table
   rows.
3. Define empty/loading/error/success states for imports, reports, charts, and
   journal notes.
4. Confirm color contrast after Deep token update.

## Suggested Order Of Work

Start with the smallest shared foundation:

1. Tokens.
2. Reusable Money and Eyebrow primitives.
3. SegmentedControl.
4. Negative-space rhythm: page widths, section breaks, chart gutters.
5. Reports stats.
6. Dashboard.
7. Calendar.
8. Trades.
9. Journal note composer polish.

This avoids redesigning everything at once while still forcing the system to
become real.
