# Away report — 2026-06-28 — T029 card link / interactive-root pattern

Autonomous run (`/independent-work`). Branch `main` (shell, demo, consumer). Browser-verified
end-to-end against the live demo and the live `offansk-ev` app.

## Completed

A shell card can now act as a **whole-card navigation link** without the shell importing any
router: a `renderLink` render-prop mounts the consumer's `<Link>` as a full-bleed block-link
overlay, the card root keeps its hover/border/focus states, and nested controls stay clickable
above the overlay. One mechanism across all three cards.

**Phase 1 — `DynamicGridCard` (shell `e03fe74`, demo `bcf97f7`)**
- Added `figure` (figure-split header), `hoverable`, `corner` (raised action slot), `renderLink`
  + block-link overlay, and a unified `footer` slot (freeform node or structured `{lines,badges}`).
- Renamed `variant`→`shape` (`standard` φ:1 · `landscape` φ²:1). Auto-wired the overlay's
  `aria-labelledby` from the card title.
- Demo card-grid page gained a "Navigation links" section; api-reference + `card-grid.md` updated.

**Phase 2 — `StatCard` / `ContentCard` (shell `5f09e85`, demo `79bbb71`)**
- Ported the same `renderLink` + overlay seam. The overlay sits *beneath* the content layer;
  `__inner` is `pointer-events:none` so taps route to the anchor, while the medallion button and
  drag handle re-enable their own clicks (they're trapped in `__inner`'s `z-index:1` stacking
  context, so the stacking-only approach used on DynamicGridCard wouldn't free them).
- Unified `footer`+`lower` into one `footer` prop; **`lower` removed**. Added landscape `shape`
  (`height = width / φ²`) and a `dragHandle`×`renderLink` dev throw.

**Phase 3 — consumer `offansk-ev` (`bab9d72`, `8eb42ca`, `3581b17`)**
- Unblocked the `lower` removal: repointed `lower`→`footer` at `EntityCard`, `CriteriaView`,
  `TilbudRootView`, `TilbudView`.
- Retired `NavCard` (the PhiCard-in-`<Link>` + error-border-on-wrapper hack): deleted it and
  swapped `SetupHome`, `DocumentsHome`, `TenantTemplatesPage`, `TenantAdminHome`, and
  `AccessGroupsView` to `DynamicGridCard` + `renderLink` (AppIcon/emoji → `figure`;
  AccessGroupsView's rename/delete menu → `corner`).

**Verification (Chrome, read-only):**
- Demo: DynamicGridCard nav links are real anchors named from the title; the corner ⋮ menu opens
  without navigating. StatCard linked card — clicking the medallion fired `onMedallionPress` and
  did **not** navigate; landscape renders visibly shorter.
- Live `offansk-ev`: `/setup` tiles are real anchors with correct routes + AppIcon figures;
  clicking "Grupper" navigated; group cards carry the correct `$groupId` route, emoji figure, and a
  corner menu that opens (Velg ikon / Gi nytt navn / Slett) without navigating.

All four repos typecheck clean (shell `tsc -b`, demo + consumer `tsc --noEmit`).

## Remaining / carved-out follow-ups

- **Delete `EntityCard` + convert its `onOpen` call sites to `renderLink`.** Deferred — it
  collides with an **active in-flight session** (`offansk-ev` T079 "unified drilldown system",
  whose `src/components/drilldown/DrilldownCard.tsx` imports `EntityCard`), and `EntityCard` is
  used at ~10 sites. Deleting now would clobber another agent's uncommitted work. `EntityCard`
  is left functional (`body`→`footer` fixed). Once T079 lands: delete `EntityCard`, repoint to
  `StatCard` directly, convert navigable tiles to `renderLink`.

## Concerns found mid-work

- **Duplicate `.mrs-content-card` rule blocks in `components.css`** (one ~line 2803, one ~line
  4980 — the latter is the complete, winning definition). Pre-existing (from the T028 card
  restore), out of T029 scope. My ContentCard rules were placed in the winning block. Worth a
  cleanup pass but left untouched (scope wall).

## Suggested cleanup

- Collapse the duplicate `.mrs-content-card` / `__inner` rule sets in `components.css`.

## Dev env / file changes

- No env, `.env*`, dependency, or Convex changes. No servers started/stopped (verification used
  the already-running demo:2000 and offansk-ev:2001 dev servers, read-only).

## Recommended next step

Land `offansk-ev` T079, then do the carved-out `EntityCard` deletion + `renderLink` conversion as
a small follow-up task. No action needed on the shell — the seam is complete and shipped in `dist/`.
