# Away report — 2026-06-28 — T028 dynamic-vs-static card grids · restore legacy cards

Autonomous run (`/independent-work`). Branch `main`. Browser-verified end-to-end.

## Completed

**Library (`my-react-shell`, commit `8483376`)**

- **Renamed the fluid grid system:** `GridCard` → `DynamicGridCard`, `CardGrid` →
  `DynamicCardGrid` — symbols, CSS classes (`mrs-grid-card*` → `mrs-dynamic-grid-card*`,
  `mrs-card-grid*` → `mrs-dynamic-card-grid*`) and CSS vars, exports, and dist. Behaviour
  unchanged (verified: cards still stretch to fill columns).
- **New static `CardGrid`** (`src/components/CardGrid.tsx`): fixed-size cards flow
  left-to-right and wrap, fixed `gap` (default `1.5rem`, sized so four ≈312px cards fit a
  `wide` row), no stretching. `align` (`start`/`center`), `gap` override.
- **Restored `PhiCard`, `StatCard`, `ContentCard`** to their pre-`ac14a83` behaviour — own
  fixed `width`/`height` + golden ratio. The ruin was the port onto BaseCard / CSS-variable
  delegation where the vars (`--mrs-card-width`, `--mrs-base-card-min/max-width`) were read
  by **no** CSS rule, collapsing the cards to `width:100%`. Reverted the source + the
  `.mrs-phi-card` / `.mrs-stat-card` CSS.
- **Self-contained `StatCard`/`ContentCard`:** own `Size` + `Footer` types and `PHI`
  constant; no type/runtime import from `PhiCard` (which is being phased out). Default
  `md` retuned to **312px** (`sm` 240 · `md` 312 · `lg` 400 · `xl` 520) → four to a `wide`
  (1440px) row. Verified in-browser: cards render at **312×193px**, 4 per row.
- **Removed the orphaned `BaseCard`** (component + CSS + exports) — unreleased, no longer
  used after the restore.
- **Docs:** API reference updated (3 new component rows, detailed grid section, type list,
  corrected StatCard/ContentCard sizing); `docs/guides/card-grid.md` rewritten for the
  two-system reality. Deleted committed scratch files `temp_diff.txt`, `test-card.html`.

**Demo (`my-react-shell-demo`, commit `77eb2e5`)**

- **New `Cards grid` page** (`/cards-grid`): `StatCard` + `ContentCard` sections (moved out
  of `Cards old`) rendered in the static `CardGrid`, led by a "four to a row" group at
  default size.
- **`Cards old`** trimmed to the restored `PhiCard` (kept here, phase-out noted).
- **`Card grids`** page relabelled **"Dynamic card grids"**; its usages renamed to
  `DynamicCardGrid`/`DynamicGridCard`.
- Route + nav wired (`router.tsx`, `shell-config.tsx`).

**Verification:** both repos typecheck clean; lib `dist/` rebuilt; browser screenshots
confirm — Cards grid shows 4 StatCards/ContentCards per wide row (312×193), Dynamic card
grids stretch correctly post-rename, Cards old shows the restored PhiCard.

## Code review (run on `ac14a83~1..HEAD` before work)

All eight findings resolved: the two card-collapse bugs (the ruin) via restore; the missing
API-reference entries added; the two scratch files deleted; the stale GridCard footer
docstring, the `as any` casts, and the PHI duplication cleaned up in the rename.

## Concerns / suggested cleanup (out of scope — not done)

- **Soft CSS coupling:** `StatCard`/`ContentCard` still render their footer with PhiCard's
  `.mrs-phi-card__footer*` classes. Harmless while PhiCard stays, but when PhiCard is fully
  deleted those CSS rules must be kept or renamed into the stat/content stylesheets.
- **i18n keys** for the dynamic grid remain `mrs.cardGrid.*` (not renamed to `dynamicCardGrid`)
  — intentional, to avoid churning the catalog; rename later if desired.
- `CardGridsPage` `dummyCompositionItems` still carries unused `footerLines`/`footerSize`
  data (inert leftover from when DynamicGridCard had a footer slot).

## Dev env / file changes

- Temporarily created (then removed) a gitignored `.claude/launch.json` in the shell repo to
  drive the preview server for verification. No env or `.env*` changes. No dev data touched.

## Recommended next step

Confirm the visual result looks right to you. If good, this can ride the next release of the
shell (themes → shell → consumers) per the release runbook — note the **public API rename**
(`GridCard`/`CardGrid` → `DynamicGridCard`/`DynamicCardGrid`, `BaseCard` removed,
`StatCard`/`ContentCard` `size` widths changed) is **breaking** for any consumer already on
those exports; migrate consumers in the same bump.
