# T028 — Dynamic vs static card grids · restore legacy cards

**Status:** finished · **Filed:** 2026-06-28 · **Branch:** main

> **Done (2026-06-28).** Shell `8483376`, demo `77eb2e5`. Browser-verified: 4 StatCards/
> ContentCards per `wide` row at 312×193px; dynamic grid intact post-rename; PhiCard restored.
> BaseCard removed (orphaned). See `docs/4-reports/status/2026-06-28-away-report.md`.

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

## Resolved decisions (user, 2026-06-28)

1. **Static-grid name = `CardGrid`** — reuse the name freed by renaming the fluid grid to
   `DynamicCardGrid`. So: dynamic system → `DynamicCardGrid` + `DynamicGridCard`; the new
   static grid takes the plain `CardGrid` name. CSS classes/vars for the dynamic system are
   renamed (`mrs-grid-card`→`mrs-dynamic-grid-card`, `mrs-card-grid`→`mrs-dynamic-card-grid`)
   so the static `CardGrid` can own the `mrs-card-grid` class without collision.
2. **Size target = default ≈312px → 4 per wide row.** Retune `StatCard`/`ContentCard`
   `SIZE_WIDTH_PX` so the default (`md`) lands ~312px (height = 312/φ ≈ 193px); keep the
   sm/md/lg/xl scale. Verify four fit on the `wide` (1440px) container in the demo.
3. **PhiCard** is restored to working order but **stays on the `CardsOld` page** (it's being
   phased out). Only `StatCard`/`ContentCard` move to the new `CardsGrid` page. Make
   `StatCard`/`ContentCard` fully self-contained — own `Size`/`Footer` types + own `PHI`
   constant, no type or runtime import from `PhiCard`, so PhiCard can be deleted later
   without breaking them.

## Code-review findings folded in (run on `ac14a83~1..HEAD`)

- StatCard `--mrs-card-width` set but consumed by no CSS rule → width:100% (the ruin). Fixed by restore.
- BaseCard `--mrs-base-card-min/max-width` consumed by no rule → PhiCard width:100% (the ruin). Fixed by restore.
- `api-reference.md` not updated for new exports — update for the renamed/new surface.
- Stray committed files `temp_diff.txt`, `test-card.html` at repo root → delete. Audit `AGENTS.md` change.
- GridCard docstring claims a removed `footer` slot; `(cssVars as any)` casts; PHI duplicated 4× → clean up in the rename.

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
