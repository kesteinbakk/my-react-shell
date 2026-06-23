# Proposal: Dialog — custom content chrome, header actions, and close-source control

**Date**: 2026-06-23 | **Status**: draft

## What

Extend the component-kit `Dialog` so it can host dialogs that aren't the standard
padded title/body/footer card: full-bleed / custom-padding content with an internal
scroll region and a sticky header, a heading that carries an adjacent control, and
finer control over what closes the dialog.

## Why

A consumer (evaluering) is removing shadcn and moving every dialog onto the shell
`Dialog`. Most fit. Six do not — and accepting the shell's fixed chrome would
*change today's UI* (shifted padding, a reflowed header, or a behaviour change),
which the migration is explicitly not allowed to do. These are ordinary dialog
needs the kit should own so consumers don't keep a parallel shadcn dialog just to
preserve a full-bleed viewer or an unsaved-edit guard.

## User Goals

- **Choose the dialog's width.** A dialog can be sized to its content — a narrow
  confirm, a standard form, a wide preview — rather than every dialog rendering at
  one fixed max-width. (Today `Dialog` hard-codes ~26rem with no size option, so a
  consumer migrating off a wider dialog silently narrows it.) This affects *every*
  migrated dialog, not just the custom ones below.
- **Scroll a tall dialog within the viewport.** When a dialog's content exceeds the
  screen height, the body scrolls inside the dialog (with the title/footer staying
  put) instead of overflowing the viewport. Today there is no max-height / scroll.
- **Full-bleed / custom-padded content with internal scroll.** A dialog can present
  content that runs edge-to-edge (e.g. a document/PDF viewer, a large evaluation
  panel) with its own sticky header band and a scrolling body that fits within the
  viewport — rather than the fixed outer padding and single-flow layout the standard
  dialog imposes.
- **A heading with an adjacent action.** The dialog title row can carry a control on
  the same line as the heading (e.g. a version picker, a score badge) without losing
  the heading's accessible name.
- **Control what closes the dialog.** A dialog can keep an in-progress edit safe —
  e.g. a click on the backdrop does not discard unsaved work, while the explicit
  close/save controls (and optionally Esc) still close it. Today backdrop, Esc, and
  the ✕ all funnel through one close path with no way to treat them differently or
  guard a dismissal.

## Open Questions

- Is full-bleed best modelled as a "content mode" (the dialog stops applying its own
  padding/spacing and the consumer owns the inner layout) or as explicit slots
  (sticky-header slot + scrollable-body slot)?
- Should max-height / viewport-fit + the internal scroll be automatic, or opt-in?
- For close control: a simple "guard a dismissal" callback that can veto a close,
  or distinct per-source signals (backdrop vs Esc vs ✕)? What's the least surface
  that covers "don't discard unsaved edits"?
- Should the title slot simply accept a node (so a consumer can put a heading +
  action inside it) while the kit still derives the accessible name?

## References

- evaluering task **T063 — remove-shadcn** (`docs/2-tasks/T063-remove-shadcn/`):
  Phase C1 identified the six gap dialogs — `EvalModal` (full-bleed + don't-discard-
  on-backdrop), `PdfViewer` (full-bleed + title-row picker), `LetterDialog` (title-
  row version picker), `MultiVendorDetail` all-scores modal (full-bleed), `EvalHelp`
  modal (full-bleed), `ResultBreakdownModal` (title-row score badge).
- Sibling proposals: `table-row-interaction-and-expandable-rows.md`,
  `dropdown-menu-submenu-and-selectable-items.md`.
