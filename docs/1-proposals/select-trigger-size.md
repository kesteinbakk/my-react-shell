# Proposal: Select — trigger size

**Date**: 2026-06-23 | **Status**: draft

## What

Give the component-kit `Select` a `size` option (at least a compact `sm` alongside
the default) that sets the trigger's height/padding, matching the size scale the
kit's `Input` and `Button` already expose.

## Why

A consumer (evaluering) removing shadcn has several selects that sit in dense rows
next to small inputs and buttons (e.g. a price-line row, member-role pickers) where
the control today is the compact `sm` height. The shell `Select` owns one fixed
height with no size option, so those selects render taller than the controls beside
them — a visible row-alignment regression the migration is meant to avoid.

## User Goals

- **A select can match the size of the controls around it.** In a compact row, the
  select trigger is the same height as the adjacent small input/button; in a normal
  form it uses the standard height. One consistent size scale across the kit's form
  controls.

## Open Questions

- Which rungs — just `sm` + default, or the full `sm`/`md`/`lg` to mirror `Input`?
- Should the size be inherited from an enclosing field/density context, or always
  passed explicitly?

## References

- evaluering task **T063 — remove-shadcn**: Phase C2 dropped `SelectTrigger size="sm"`
  on 5 sites (DrilldownShell, PriceLineRow, ProjectMembersView, AccessGroupsView,
  KgvView) because the shell `Select` exposes no size.
