# Proposal: DropdownMenu — submenus and selectable (checkbox / radio) items

**Date**: 2026-06-23 | **Status**: draft

## What

Extend the component-kit `DropdownMenu` so its `items` model can express nested
submenus and selectable items — checkbox items (independent on/off) and radio items
(one-of-a-group) — alongside today's plain item / separator / label rows.

## Why

A consumer (evaluering) is removing shadcn and moving every dropdown onto the shell
`DropdownMenu`. Three of its six dropdowns use exactly these patterns, which the
current `item | separator | label` union can't represent. These are standard menu
behaviours; the kit should own them so consumers don't keep a parallel shadcn menu
just for a toggle or a submenu.

## User Goals

- **Open a submenu.** A menu row can reveal a nested submenu of further items (e.g. a
  "switch language / switch tenant" submenu inside a user menu).
- **Toggle a checkbox item.** A menu can hold items that show a checked/unchecked
  state and toggle independently when chosen, without the menu closing the way a plain
  action item does (e.g. show/hide columns, multi-select filters).
- **Pick one radio item from a group.** A menu can hold a group of mutually-exclusive
  options where exactly one is marked selected (e.g. a sort-by or view-mode choice).

## Open Questions

- Should checkbox / radio items keep the menu open on select (so several can be
  toggled in one opening) while plain action items still close it — and is that the
  kit's default or a per-item choice?
- How deep should submenu nesting be supported — one level, or arbitrary depth?
- Does the selected/checked state stay fully controlled by the consumer (the kit just
  renders the indicator), consistent with the rest of the kit's controlled inputs?

## References

- evaluering task **T063 — remove-shadcn** (`docs/2-tasks/T063-remove-shadcn/`):
  baseline review §2 (DropdownMenu) names the three gap sites — `UserMenu` (submenu),
  `ConsultantLeafView` (checkbox item), `MultiVendorDetail` (checkbox item + radio
  group).
- Sibling proposal: `table-row-interaction-and-expandable-rows.md` (the other
  shell-API gap surfaced by the same migration).
