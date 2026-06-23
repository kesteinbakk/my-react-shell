# T021 — Table: row interaction, expandable detail rows, dynamic columns

**Status:** finished · **Proposal:** `docs/1-proposals/table-row-interaction-and-expandable-rows.md`

## What shipped

Extended the `my-react-shell/components` `Table` with three additive props:

- **`onRowClick(row, index)`** — whole-row click with a pointer + hover affordance.
  Guarded: a click whose target matches an interactive selector
  (`button, a, input, select, textarea, label, [role="button"]` — which includes the
  disclosure toggle) does **not** fire the row handler, so in-cell controls keep working.
- **`renderExpanded(row)`** — when provided, a narrow leading disclosure column appears.
  The table **owns the per-row open/closed state** (a `Set` of row keys) and renders the
  chevron toggle; the consumer supplies the detail node, rendered in a full-width
  `colSpan` row directly below, collapsible per row.
- **`rowVariant(row, index)`** → `default` · `muted` · `selected` — per-row emphasis
  themed via `--color-*` tokens (`--color-surface-sunken`, `--color-text-muted`,
  `--color-selected`); no hardcoded colors.

**Dynamic columns** needed no API change — `columns` is already an ordinary array, so a
per-row/per-entity column set can be built at render time. Showcased only.

## Decisions (proposal open questions)

- **Expandable region:** kit-driven state + disclosure control; consumer-supplied content
  (the first proposal option, kept consistent with the kit's controlled style).
- **Row-click vs in-cell controls:** coexist via the interactive-target guard above.
- **Per-row styling:** semantic states the kit themes (not an open color hook), keeping
  "no hardcoded colors" intact.

Additive / non-breaking: sorting, striping, sticky header, and empty state are unchanged.

## Surface

`src/components/Table.tsx`, `src/components/components.css` (`.mrs-table__row--clickable`
/`--muted`/`--selected`, `.mrs-table__expand-*`, `.mrs-table__expanded-*`),
`src/components/index.ts` (`TableRowVariant` export),
`docs/specifications/api-reference.md`. Demo: `my-react-shell-demo`
`src/pages/TablesCardsPage.tsx` (`TableShowcase`).
