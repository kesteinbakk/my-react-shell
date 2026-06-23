# Proposal: Table — frameless mode, per-cell expansion, custom disclosure control

**Date**: 2026-06-23 | **Status**: draft

## What

Three follow-on `Table` refinements found while migrating real tables onto the kit:
(1) a frameless mode so a table can sit inside a `Card` without a double border,
(2) per-cell (column-keyed) expansion, not only per-row, and (3) the option to use a
consumer-supplied disclosure control (a labelled button) instead of only the kit's
leading chevron.

## Why

A consumer (evaluering) is moving every table onto the kit. Three patterns can't keep
today's UI:
- **Frameless:** most tables sit inside a `Card` (the card is the frame, the table is
  borderless). The kit `Table` now draws its own bordered/rounded wrapper, so nesting
  it in the card yields a double border — and a `className` override can't remove it
  (the kit's unlayered CSS wins the cascade over a utility class).
- **Per-cell expansion:** an all-scores grid expands a comments region keyed to *which
  scorer column* was clicked — the disclosure belongs to a cell, not the whole row.
  The kit's `renderExpanded` is strictly per-row, so it can't express this.
- **Custom disclosure:** one table's expand control is a labelled, right-aligned button
  ("Score row ▸ / Collapse row ▾"); the kit's `renderExpanded` replaces it with a bare
  leading chevron, changing the affordance and dropping the label.

## User Goals

- **A table can render without its own frame** so it nests cleanly inside a card (the
  card is the single border), without the consumer fighting the cascade.
- **A cell can own an expandable detail region** keyed to the specific column that was
  activated (e.g. click a scorer's score → reveal that scorer's comments under the row).
- **The disclosure control is the consumer's choice** — the kit's leading chevron, or a
  consumer-supplied labelled control placed where today's UI has it.

## Open Questions

- Frameless: a `frame={false}` / `bare` prop, or detect "inside a Card" via context?
- Per-cell expansion is a meaningfully richer model than per-row `renderExpanded` — is
  it worth first-classing, or should that one grid keep a hand-built table until there's
  a second consumer?
- Custom disclosure: expose the open state + a render-prop for the toggle, so a consumer
  can supply its own control while the kit still owns the open/close state?

## References

- evaluering task **T063 — remove-shadcn**: Phase D. Frameless affects ~13 card-wrapped
  tables; per-cell expansion is `evaluation/OverviewGrid`; custom disclosure is
  `evaluation/TabellView`/`TabellRow`.
- Builds on `table-row-interaction-and-expandable-rows.md` (shipped: onRowClick +
  per-row renderExpanded + dynamic columns).
