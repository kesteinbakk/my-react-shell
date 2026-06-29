# Proposal: Opt-in Whole-Card Dragging (dragWholeCard)

**Date**: 2026-06-29 | **Status**: draft

## What

Add an opt-in `dragWholeCard?: boolean` prop to `StatCard`, `ContentCard`, and `DynamicGridCard`. When this prop is enabled, it changes the root cursor of the card component to `grab` (and `grabbing` when active) to indicate that the entire card is a draggable container, rather than using a separate visual drag handle pin.

## Why

Currently, cards like `StatCard`, `ContentCard`, and `DynamicGridCard` support dragging via a right-edge vertical stripes `dragHandle` control. However, in some layout interfaces (e.g., dashboard builders, Kanban boards), the user wants the entire card surface to act as the drag container. Offering `dragWholeCard` provides an elegant, opt-in cursor hint without forcing apps to write custom CSS overrides or wrappers.

## User Goals

- Consumers can set `dragWholeCard` on `StatCard`, `ContentCard`, and `DynamicGridCard`.
- Hovering over the card root displays the `grab` cursor rather than `pointer`.
- Mousing down/active state displays the `grabbing` cursor.
- Safe developer guards: throws in dev if combined with `renderLink` (block-link navigation overlays) since a link card shouldn't be drag-reordered.

## Open Questions

- Should `dragWholeCard` and the standard `dragHandle` be mutually exclusive? If both are passed, should we hide the drag handle, or raise a dev warning? (Recommended: They should be mutually exclusive, or passing `dragWholeCard` suppresses the rendering of a separate drag handle).

## References

- [api-reference.md](file:///Users/kesteinbakk/Developer/my-react-shell/docs/specifications/api-reference.md)
- [card-grid.md](file:///Users/kesteinbakk/Developer/my-react-shell/docs/guides/card-grid.md)
