# Proposal: Table — row interaction, expandable detail rows, and dynamic columns

**Date**: 2026-06-23 | **Status**: draft

## What

Extend the component-kit `Table` so it can express three patterns its current
column-config API cannot: interactive rows, an expandable detail region beneath a
row, and a column set built at runtime.

## Why

A consumer (evaluering) is removing shadcn and moving every table onto the shell
`Table`. Eleven of its sixteen tables fit today. Three do not — and the gap is not
exotic styling, it's three common table affordances the kit should own so consumers
never have to drop back to hand-rolled `<table>` markup (which is exactly what the
kit exists to prevent). Without these, those three screens either keep a bespoke
table or regress in behaviour.

## User Goals

- **Click a whole row.** A reader can click anywhere on a row to act on it (e.g.
  open a breakdown modal), with the row showing it's interactive (pointer affordance,
  hover state). Today the kit only supports clicks on individual cell content.
- **Expand a row to reveal detail in place.** A row can toggle open to show a full
  expanded region directly below it — spanning the table's full width — for things
  like an inline document preview or a comments thread, then collapse again. The
  open/closed state is per row.
- **Style an individual row.** A row can carry its own emphasis (e.g. a muted or
  selected background) so the table can signal state without the consumer abandoning
  the kit.
- **Columns decided at render time.** The set of columns can be generated
  dynamically (e.g. one column per evaluator, where the evaluators aren't known until
  the data loads) rather than only from a statically-written column list.

## Open Questions

- Should the expandable region be driven by the kit (the table owns the open/closed
  state and renders a disclosure control) or by the consumer (the table just renders
  whatever detail node the consumer supplies for an open row)?
- Does whole-row click need to coexist gracefully with interactive controls inside a
  cell (buttons, links) without the row handler swallowing those clicks?
- Is per-row styling best expressed as a semantic state (selected / muted / emphasis)
  the kit themes, or as an open hook the consumer fills — to keep "no hardcoded colors"
  intact?

## References

- evaluering task **T063 — remove-shadcn** (`docs/2-tasks/T063-remove-shadcn/`):
  baseline review §4 names the three gap sites — `OverviewGrid` (dynamic per-scorer
  columns + expandable colSpan comments row), `TabellView`/`TabellRow` (expandable
  inline PDF-preview row), `EvaluationResultPage` (whole-row click opens a modal).
- Sibling proposal: `dropdown-menu-submenu-and-selectable-items.md` (the other
  shell-API gap surfaced by the same migration).
