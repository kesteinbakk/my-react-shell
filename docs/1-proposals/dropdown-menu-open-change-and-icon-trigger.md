# Proposal: DropdownMenu — open-state callback + icon-only trigger affordance

**Date**: 2026-06-23 | **Status**: draft

## What

Two related `DropdownMenu` ergonomics: (1) an `onOpenChange` callback that fires when
the menu opens/closes, and (2) a first-class way to use an **icon-only action button**
as the menu trigger (today only the text `Button` works as the trigger anchor; the
kit's `ActionButton` cannot, because it doesn't forward the trigger's injected props).

## Why

A consumer (evaluering) removing shadcn hit both. A notification bell needs to run a
side-effect ("mark visible notifications read") **when the menu opens** — there's no
open event, so the consumer had to approximate it on the trigger's click (fires on
open and close; only tolerable because the action is idempotent). And the bell/account
menus are icon-only triggers; with no icon-capable trigger affordance they fall back
to a text `Button` rendered with an icon child, which carries text-button padding
rather than a proper square icon hit-area.

## User Goals

- **React to the menu opening or closing.** A consumer can run a side-effect exactly
  when the menu opens (or closes) — e.g. mark items seen on open, refetch on open —
  without piggy-backing on the trigger's click.
- **Use an icon-only action button as the trigger.** An icon-only control (a bell, a
  ⋮ overflow, an account glyph) can anchor a dropdown and look like the kit's other
  icon buttons, not like a text button squeezed around an icon.

## Open Questions

- Is `onOpenChange(open: boolean)` enough, or are separate `onOpen`/`onClose` clearer?
- For the icon trigger: make `ActionButton` forward the trigger's injected props (so
  it can be the anchor), or add an icon affordance to the trigger path? Whichever keeps
  "icon buttons look the same everywhere" true.

## References

- evaluering task **T063 — remove-shadcn**: Phase C2 — NotificationBell mark-read moved
  to the trigger `onClick` for lack of `onOpenChange`; the bell + account triggers
  became text `Button`s with icon children because `ActionButton` can't anchor the menu.
- Related: `dropdown-menu-submenu-and-selectable-items.md` (already shipped).
