# T028 — Dynamic vs static card grids · restore legacy cards

**Status:** planning · **Filed:** 2026-06-28 · **Branch:** main

## Problem

The recent grid refactor (`ac14a83`, `5a661c5`, `0b7a661`) introduced a fluid CSS-Grid
card system (`CardGrid` + `BaseCard` + `GridCard`) but, in porting the legacy cards onto
`BaseCard`/CSS-variable dimension delegation, **broke `PhiCard` and `StatCard`** (and the
`ContentCard` surface). We want two clearly separated systems, not one that cannibalised
the other:

- A **dynamic/fluid** grid (cards stretch to fill `1fr` columns) — the new system, kept.
- A **static** grid (fixed-size cards, fixed gap, flow left→right, wrap; a larger gap at
  the end of a row is fine; all cards uniformly sized) — what the legacy cards need.

## Goal / end state

1. **Rename the dynamic system** so its name says what it is:
   - `GridCard` → `DynamicGridCard`
   - `CardGrid` → `DynamicCardGrid`
   - Carries through: component + type exports (`index.ts`), CSS classes, the demo's
     existing grid page, `docs/specifications/api-reference.md`, `docs/guides/card-grid.md`.
   - Behaviour unchanged — dynamic cards work exactly as they do today.

2. **New static card grid** — fixed-width/height cards, fixed gap between them, flowing
   left to right and wrapping when needed (uneven trailing gap acceptable), all cards
   stacked uniformly. Component name: **TBD (user question)**.

3. **Restore `PhiCard`, `StatCard`, `ContentCard`** to their pre-`ac14a83` behaviour —
   each owns its fixed `width`/`height` derived from `size` and the golden ratio
   (`height = width / φ`), rendering its own root element (not delegating dimensions to
   `BaseCard`). Reference blobs: PhiCard/StatCard at the parent of `ac14a83`.

4. **Self-contained stat/content cards.** PhiCard is being phased out, so `StatCard` and
   `ContentCard` must NOT depend on PhiCard at runtime and must carry the φ ratio
   themselves. On the `wide` page-container base (1440px — "exactly fits four 312px
   cards", per `docs/guides/app-shell.md`) the default size should land **~4 cards per
   row** (≈312px each).

5. **Demo** — move `PhiCard`/`StatCard`/`ContentCard` out of `CardsOldPage` into a new
   **`CardsGrid`** page, rendered inside the new static grid. Keep
   `DynamicGridCard`/`DynamicCardGrid` on the existing grid page. Register the new page's
   route + section icons (`shell-config.tsx`), per the demo lockstep rule.

## Open questions (asked of user before execution)

- Name of the new static-grid component.
- Whether to reuse the freed `CardGrid` name for the static grid or keep it retired.
- Confirm the ~312px / 4-per-row target and whether the legacy `xl` size is kept or dropped.
- Whether `PhiCard` also moves to the new page and renders in the static grid, or only
  `StatCard`/`ContentCard`.

## Affected surface

- `src/components/`: `GridCard.tsx`→`DynamicGridCard.tsx`, `CardGrid.tsx`→`DynamicCardGrid.tsx`,
  new static-grid component, `PhiCard.tsx`, `StatCard.tsx`, `ContentCard.tsx`, `BaseCard.tsx`
  (decouple), `index.ts`, `components.css`, `dist/` rebuild.
- `docs/specifications/api-reference.md`, `docs/guides/card-grid.md`.
- `my-react-shell-demo`: new `CardsGridPage`, updated `CardsOldPage`, routes, `shell-config.tsx`.

## Notes

- The clean "before" for PhiCard/StatCard is the blob prior to `ac14a83` (the commit that
  swapped explicit `width`/`height` for `--mrs-card-width`/`--mrs-card-aspect-ratio`).
- `ContentCard.tsx` still computes `width`/`height` directly — verify what actually broke
  it (likely the `@layer components` CSS wrap or shared classes) rather than assuming.
</content>
</invoke>
