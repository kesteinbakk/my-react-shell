# T029 — Card link / interactive-root pattern (nav cards first)

**Status:** archived
**Filed:** 2026-06-28 · **Archived:** 2026-06-28

## Goal

Let a shell card act as a **whole-card navigation target** (a real link) without the
shell ever importing a router. First concrete scope: the **nav-card** use — replace the
offansk-ev consumer `NavCard` (a thin compose over the now-retiring `PhiCard`) with the
shell's **`DynamicGridCard`**, given the interactive-root support it currently lacks.

The hard part is **how** the card becomes a link. That pattern is the central open
question below — it is **not** nav-card-specific: `StatCard` and `ContentCard` are also
used as navigation targets in the consumer, so whatever pattern we pick here is the one
we will port across every card. Decide it once, deliberately.

**Scope now includes `StatCard` and `ContentCard` porting** (no longer follow-on). The
two differ on a structural axis that the seam decision must account for: **`StatCard` has
real nested buttons (`onMedallionPress`, `dragHandle`, interactive `lower`) in addition to
being a link**, while **`ContentCard` does not**. See the "Interactive children" section
below — this is what forces the block-link overlay over a naive root-as-anchor.

## Background

- The consumer's `NavCard` (`offansk-ev/src/components/NavCard.tsx`) wraps the whole
  card in a TanStack `<Link>` so the tile is a real anchor (navigation, focus,
  keyboard activation). It composes `PhiCard`.
- **`PhiCard` is being retired** (see T028, api-reference, `docs/guides/card-grid.md`).
  It is **out of scope as a base** — do **not** build anything new on it or weigh its
  feature set in the pattern decision. The forward target is the dynamic-card line.
- `DynamicGridCard` today is a passive `<div>` with `title` / `subtitle` / `children`
  (body = `children`). It has no interactive root, no figure/icon slot, no hover
  affordance.
- The consumer already carries **two different, inconsistent nav workarounds** because
  the shell cards can't be links cleanly:
  - `NavCard` → wraps the whole card in `<Link>` (anchor `>` card `<div>` nesting; the
    error border had to be moved onto the Link wrapper because the card root doesn't own
    its own border state).
  - `EntityCard` (`offansk-ev/src/components/EntityCard.tsx`, wraps `StatCard`) → can't
    make the card a link at all (`StatCard.onClick` is a "mouse-only div click"), so it
    injects a focusable `<button>` CTA in the `lower` slot as the accessible open path.
  A single interactive-root pattern would retire **both** workarounds.

## Decided so far

- **Drop the consumer `NavCard` wrapper.** It only DRYed two app bindings (the `AppIcon`
  lookup + the `<Link>`), and those already live inside one `renderCard` per grid
  (~5 `renderCard`s, not 12 hand-written cards). Call the shell card directly in
  `renderCard`. No per-app wrapper.
- **Body stays `children`** — consistent with `DynamicGridCard` (only the dynamic-line
  card uses `children`; the φ-line cards use named slots, and the φ line is retiring).
- **Keep corner-action support via a `corner` slot on `DynamicGridCard`** (user
  decision — reinstated). With the block-link overlay (Option A, decided below), the
  consumer's `<Link>` is a full-bleed overlay — *not* the root — so a corner control is a
  **sibling** of the anchor: a real `<button>`, never nested inside an `<a>`, raised above
  the overlay with `z-index` so it stays independently clickable. This is the same
  mechanism that keeps `StatCard`'s medallion button live, and it ports `PhiCard`'s
  existing `corner` slot forward. Consequence: **`AccessGroupsView`** keeps its inline
  rename/delete/change-icon `DropdownMenu` exactly as today — **no relocation**. (This
  decision is what forces Option A for the nav card: a root-as-link nav card could not host
  the menu button without nesting it in the anchor.)
- **Defer `error`/invalid state.** Defined on `NavCard` but used at **zero** call sites.
  Add later only if a real site needs the red-border state.
- **Unify the structured `footer` + freeform `lower` into one slot** (user decision). They
  are already mutually exclusive (the cards throw if both are given), so a single prop typed
  `ReactNode | { lines?: FooterLine[]; badges?: ReactNode[] }` replaces both and drops the
  both-not-allowed dev throw. The freeform branch is the old `lower`; the structured branch
  is the old `footer`. Applied across `StatCard` / `ContentCard` / the nav `DynamicGridCard`
  (which gains a real footer instead of routing meta through `children`). Breaking rename of
  every `lower=` / `footer=` call site (TilbudRootView, CriteriaView, TilbudView, the
  `EntityCard` pass-through) — folded into the Phase 2/3 port. **Prop name: `footer`** — the
  structured term becomes the single name; it also accepts a `ReactNode` for the old freeform
  `lower` case. `lower` is removed.
- **Ship in phases** (user decision). **Phase 1:** shell seam + nav `DynamicGridCard`
  (`figure` / `hoverable` / `corner` / `renderLink` + block-link overlay), proven on the
  demo's card-grid page. **Phase 2:** port the `renderLink` + overlay seam to `StatCard` +
  `ContentCard` (medallion/drag-handle above the overlay), demo'd on the kit pages.
  **Phase 3:** consumer `offansk-ev` migration — delete `NavCard` + `EntityCard`, swap all
  call sites. Each phase is its own commit-and-verify unit.

## Plan (nav-card scope, pending the open-question decision)

Additive props on **`DynamicGridCard`** (nothing existing breaks — the interactive root
defaults to a plain `<div>`):

- `figure?: ReactNode` — icon/emoji column beside the title (a figure-split layout).
- `hoverable?: boolean` — cursor + hover-lift + `:focus-visible` ring on the root.
- `corner?: ReactNode` — a top-corner action slot (e.g. a `DropdownMenu` trigger),
  rendered above the link overlay (`z-index`) so it stays independently clickable. Ports
  `PhiCard`'s `corner` slot forward.
- an **interactive-root seam** (`renderLink`, decided below) so the consumer supplies its
  router `<Link>`, which the card renders as a full-bleed block-link overlay (Option A);
  the card root stays a `position:relative` `<div>` that owns its hover/border/focus states.

Then swap the offansk-ev call sites (`SetupHome`, `TenantAdminHome`, `DocumentsHome`,
`TenantTemplatesPage` — clean swaps; `AccessGroupsView` — swap, passing its `DropdownMenu`
to the new `corner` slot so the inline menu is kept), delete the consumer `NavCard`, update
the api-reference + `docs/guides/card-grid.md`, and show the nav/link variant on the demo's
card-grid page.

## DECIDED — the interactive-root / routing pattern: `renderLink` render-prop

**How should a shell card render *as* a consumer-supplied router `<Link>`, given the shell
must not depend on any router?** Decided: the **`renderLink` render-prop** (see hypothesis
below). This decision governs **all** cards (nav, stat, content), not just the nav card.
Constraints it satisfies:

1. **Router-agnostic** — the shell imports no router; the consumer supplies the `<Link>`.
2. **Router type-safety preserved** — TanStack Router's `to`/`params` type-checking is
   generic over the route tree; any indirection that doesn't see the route tree weakens it
   unless the consumer's `<Link>` JSX is written literally at the call site.
3. **Accessibility** — a real focusable/keyboard-activatable anchor; the card root *is*
   the interactive element (not a div nested in an anchor).
4. **Card root owns its states** — `:hover` / `:focus-visible` / border live on the root,
   killing the "error border on the wrapper" hack.
5. **Dep-light** — adding a dependency to the barrel needs user approval.
6. **Uniform across all cards** — one pattern that stat/content cards adopt verbatim.

Candidate patterns to evaluate (a naive "wrap the card in `<Link>`" reintroduces the
anchor `>` div nesting + the state-ownership hack — it is the thing we're moving away from,
so the real options merge link-ness onto the card root):

| Pattern | Call site | Type-safe? | Dep | Notes |
|---|---|---|---|---|
| **`renderLink` render-prop** | `renderLink={(p) => <Link {...p} to=… params=… />}` | ✅ full (literal `<Link>`) | none | Most explicit; per-`renderCard` boilerplate (one arrow). Dep-free. |
| **`asChild` (Radix Slot)** | `<Card asChild><Link to=… params=…/></Card>` | ✅ full (literal child) | `@radix-ui/react-slot` (new, needs approval) | Idiom consumers already know (shell consumes Radix `asChild` everywhere); single-child + ref-merge rules; Slot injects the card's internal JSX as the Link's children. |
| **polymorphic `as`** | `<Card as={Link} to=… params=… />` | ⚠️ weak/hard | none | Tersest, but typing `as` over TanStack's route-tree generics is genuinely painful — usually loses per-route checking. |
| **injected-Link via context** | app root: `<CardLinkProvider link={Link}>`; site: `<Card to=… params=… />` | ⚠️ weak by default | none | Best ergonomics (bind once at app root, terse sites); cards read an injected `LinkComponent`; route-level types need extra consumer typing to recover. Worth investigating — closest to "our own link wrapper for all cards." |

**Working hypothesis (chosen):** the **`renderLink` render-prop** seam — dep-light, full
type-safety (literal `<Link>` at the call site), card root owns its states, no new barrel
dep. Rejected: `asChild` (adds `@radix-ui/react-slot` to the components barrel for only a
terseness win, fiddlier Slot mechanics on the heavy slot cards), `as` (loses route-tree
type-checking), injected-Link-via-context (loses route-level types by default; recovering
them reintroduces the per-app typed wrapper this task deletes).

**No new subcard / no injected-Link wrapper.** A shell-side subcard still can't import a
router, so it would only *hide* the seam behind more surface; an injected-Link wrapper taxes
router type-safety and the recovery is the very wrapper we're retiring. The decision to
inline ~5 `renderCard`s already removes the DRY win a wrapper used to buy.

## Interactive children — the seam alone is not enough (StatCard vs ContentCard)

`renderLink` decides *how the consumer supplies the `<Link>`*; it does **not** by itself
decide *where the anchor sits*. Interactive content cannot nest (`<button>`/`<a>` inside an
`<a>` is invalid HTML + breaks keyboard/AT), and the two ported cards differ here:

- **`StatCard` carries real nested buttons in addition to being a link target:**
  `onMedallionPress` renders a true `<button>` (used by the consumer `EntityCard`);
  `dragHandle` is a `<button>`; `lower`/`footer.badges` are freeform nodes that are often
  interactive (EntityCard's "open" CTA lives in `lower` today). The medallion must stay a
  real button — reverting it to a div-onClick is the mouse-only a11y regression EntityCard's
  CTA hack exists to avoid. → **The card root cannot be the anchor.**
- **`ContentCard` has no first-class nested control** — title / `content` text / gauge are
  display-only; only `dragHandle` and freeform `lower`/`badges`. → root-as-anchor is viable.

**Resolution — the block-link overlay, applied uniformly.** Every card renders the
consumer's `<Link>` (via `renderLink`) as a **single full-bleed overlay** (`position:
absolute; inset:0`) inside a `position: relative` root `<div>`; nested buttons get
`z-index:1` to sit above it and stay independently clickable; the root owns hover/border and
projects the anchor's `:focus-visible` ring via `:has(a:focus-visible)`. This is the inverse
of (and fix for) the NavCard `<Link> > <div>` hack: one real anchor, siblings not nested,
root owns state. It is the **only single mechanism that handles StatCard's medallion-button +
link at once**, and it ports verbatim to every card (genuine constraint-6 uniformity) — so we
ship the overlay placement everywhere rather than mixing root-as-link (simple cards) with
overlay (StatCard) and letting the two diverge. Type-safety is identical (literal `<Link>`);
no new dep.

See the **overlay placement** section below (decided: Option A — overlay everywhere).

Port consequences:
- **EntityCard's `lower` "open" CTA is dropped** — the whole card becomes the link, so the
  CTA is redundant. This retires the second consumer workaround.
- **`dragHandle` + link-overlay are mutually exclusive** (no drag-reordering a nav tile) — a
  dev throw, not a case to reconcile.

**Recorded as final:** overlay placement is locked to **Option A** (below), so the
`renderLink` + block-link overlay pattern is final for nav / `StatCard` / `ContentCard`.

## DECIDED — overlay placement: Option A (overlay everywhere)

**Locked.** Every card (the nav `DynamicGridCard`, `StatCard`, `ContentCard`) renders the
consumer's `<Link>` as a full-bleed block-link overlay; the root `<div>` stays
`position:relative` and owns its hover/border/focus states. The deciding factor beyond the
analysis below: **keeping the nav card's corner action menu (`DynamicGridCard.corner`)
requires the overlay even on the button-free cards** — a root-as-link nav card cannot host a
corner `<button>` without nesting it in the anchor. One mechanism across the whole surface
(constraint 6), future-proof, and since `StatCard` forces the overlay anyway, Option A ships
*less* code than maintaining two placements that can drift.

The original A-vs-B analysis is retained below for the record.

Both options use the same `renderLink` seam and the
**same block-link overlay implementation for `StatCard`** (which is forced — see Interactive
children). They differ only in where the anchor sits for the **button-free cards** (the nav
`DynamicGridCard` and `ContentCard`):

| | **Option A — overlay everywhere** | **Option B — mixed** |
|---|---|---|
| Nav card / `ContentCard` anchor | full-bleed overlay inside a `position:relative` root | the **root element** *is* the `<Link>` |
| `StatCard` anchor | full-bleed overlay (forced) | full-bleed overlay (forced) |
| Mechanisms to maintain | **one** | **two** |
| DOM on simple cards | +1 overlay el + `:has()` focus projection | minimal (root *is* anchor) |
| Card grows a button later | no re-architecting | must switch root→overlay |

Identical in both: the `renderLink` seam, full router type-safety (literal `<Link>` at the
call site), zero new deps, root owns its hover/border/focus states, the EntityCard `lower`
CTA drop, and the `dragHandle`×link dev throw.

**Findings.** The overlay's only cost over root-as-anchor is one absolutely-positioned anchor
plus a `:has(a:focus-visible)` rule to project focus onto the root — both standard, cheap,
and well-supported. Root-as-anchor's only edge is marginally simpler DOM on the two
button-free cards; it buys nothing the overlay lacks (same a11y, same type-safety, same
state-ownership). Its hidden cost is that the moment a "simple" card gains a button (a badge
action, a quick-action), it must be re-architected to the overlay — i.e. Option B bakes in a
latent migration. There is no scenario where the overlay fails but root-as-anchor succeeds.

**Recommendation: Option A (overlay everywhere).** One mechanism across the whole card
surface is the genuine form of constraint 6 (uniform across all cards); it is future-proof,
and since `StatCard` forces the overlay to exist anyway, Option A ships *less* total code
than maintaining two placements that can drift. Choose Option B only if the marginally
leaner DOM on the simple cards is judged to outweigh carrying two patterns.

## Overlay pattern — locked details

Resolutions for the overlay mechanics (from the baseline review), binding on all three cards:

- **Accessible name (decided: auto-wire).** The card gives its title node a `useId` id and
  sets `aria-labelledby` on the overlay anchor automatically — the link is always named from
  the card's `title`, zero consumer burden. A consumer may override by putting `aria-label`
  on the `<Link>` it passes to `renderLink`.
- **Footer vs overlay (decided: overlay covers everything; interactivity goes in slots).**
  The link overlay covers the **whole card**, footer included, so the entire tile is the
  navigation target — matching the consumer's footers, which are display-only text (org-nr /
  status / meta rows). Interactive controls never live in the freeform footer; they go in
  **dedicated raised slots** (`corner`, the medallion button, the drag-handle) that the card
  explicitly lifts above the overlay. If a card ever needs an interactive footer control, add
  a named raised slot for it then — no live buttons in freeform footer content.

## Add-on — landscape proportion on `StatCard` / `ContentCard`

Extend the shorter-wider **landscape** proportion (already on `DynamicGridCard`) to
`StatCard` + `ContentCard`, for light cards — no footer, small main content — where the
standard golden-ratio (φ:1) height reads too tall/empty.

- **Mechanics.** `DynamicGridCard` does this via `aspect-ratio` (φ:1 → φ²:1). `StatCard`/
  `ContentCard` instead set explicit `width`+`height` inline (`height = width / φ`), so
  landscape = `height = width / φ²` — same `size` width, shorter box. A modifier class may
  tune the inner flex layout for the shorter height; no aspect-ratio rule needed.
- **Constraint.** Landscape is for sparse content only; a full stats row + footer can
  overflow the shorter box — same intent/caveat as `DynamicGridCard`'s landscape. Consumer's
  call when to use it.
- **Prop name (decided): `shape?: 'standard' | 'landscape'`, default `'standard'`.** Unified
  across all three cards. `StatCard`/`ContentCard` already have a `variant` prop meaning the
  **alert** state (`'warning' | 'danger'`), so the proportion can't reuse `variant` there;
  `shape` is the new, collision-free name. For consistency, `DynamicGridCard`'s existing
  `variant: 'standard' | 'landscape'` is **renamed to `shape`** (a breaking rename on
  `DynamicGridCard`, folded into its Phase 1 work since that file is already being touched;
  update the demo + api-reference + `card-grid.md` accordingly).
- **Scope.** Lands with the Phase 2 `StatCard`/`ContentCard` port (those files are already
  being touched). Demo: a landscape stat/content example on the kit pages. Touches
  `components.css` (landscape height + any inner-layout tune), `index.ts` types,
  api-reference, and `docs/guides/card-grid.md` (the fixed-size cards now have a proportion
  axis).

## Status — implemented (all phases done)

- **Phase 1 (done).** `DynamicGridCard` gained `figure` / `hoverable` / `corner` /
  `renderLink` + the block-link overlay, a unified `footer` slot (freeform node or
  structured `{ lines, badges }`), and the `variant`→`shape` rename. Shell + demo
  card-grid page + api-reference + `card-grid.md` updated. Browser-verified: the corner
  menu opens without navigating; the link is auto-named from the title.
- **Phase 2 (done).** `StatCard` / `ContentCard` ported to the same `renderLink` + overlay
  seam (overlay beneath the content layer; `__inner` click-transparent so the medallion
  button / drag handle stay live via `pointer-events`), unified `footer` (`lower` removed),
  added the landscape `shape` (`height = width / φ²`) and the `dragHandle`×`renderLink` dev
  throw. Shell + demo kit pages + docs updated. Browser-verified: clicking the medallion in
  a linked card fires `onMedallionPress` and does **not** navigate.
- **Phase 3 (NavCard retired — done).** Consumer `offansk-ev`: deleted `NavCard`; swapped
  `SetupHome`, `DocumentsHome`, `TenantTemplatesPage`, `TenantAdminHome`, and
  `AccessGroupsView` to `DynamicGridCard` + `renderLink` (AppIcon/emoji in `figure`,
  AccessGroupsView's rename/delete menu in `corner`). Also repointed the freeform
  `lower`→`footer` at the direct StatCard sites (`EntityCard`, `CriteriaView`,
  `TilbudRootView`, `TilbudView`) — the unblock for the unified-footer change.
  Browser-verified in the live app: setup tiles are real anchors with correct routes; the
  group cards navigate and their corner menu opens without navigating.

### Phase 3b — grid-container sweep (done)

The broader intent of the consumer cleanup was **not** just retiring wrapper cards — it was
making every card/grid pairing correct. A follow-up sweep fixed the **grid containers**: several
sites rendered **fixed-size** cards (`StatCard`/`EntityCard`, inline `width`) inside the **fluid**
`DynamicCardGrid`, whose `1fr` columns are narrower than the card width — so each card overflowed
its column and **overlapped** the next (visible bug on the tenant projects landing). Fixed by
switching the fixed-card lists to the static **`CardGrid`** (flex-wrap, no stretch, cards keep
their own width):

- `ProjectsView`, `HomePage`, `TenantsPage`, `ProjectHome`, `TilbudRootView` —
  `DynamicCardGrid items/renderCard` → `CardGrid` + `.map()`.
- `TilbudView`, `CriteriaView` — replaced a hand-rolled `div.mrs-card-grid__cards` (an
  **undefined** class — the static grid is `.mrs-card-grid`, so those cards had *no* grid layout)
  with the `CardGrid` component. `CriteriaView`'s dnd-kit `SortableStatCard` wrapper dropped
  `w-full h-full` so cards size to content in the flex grid.

The `DynamicGridCard` nav sites (`SetupHome`, `DocumentsHome`, `TenantTemplatesPage`,
`TenantAdminHome`, `AccessGroupsView`) correctly **keep** `DynamicCardGrid` — a size-less card in
the fluid grid is the right pairing. Rule: fixed-size cards (`StatCard`/`ContentCard`/`EntityCard`)
→ `CardGrid`; size-less `DynamicGridCard` → `DynamicCardGrid`. Browser-verified: the overlap is
gone and CriteriaView's draggable cards lay out cleanly.

### Docs sweep — card surface made consumer-easy (done)

Closing pass over every card-referencing doc so the shipped state reads consistently and the
card surface is easy to consume:

- **`docs/guides/card-grid.md`** (the read-first card guide): retitled *Card & Card-Grid
  Guide*; added a **"Which card component?"** picker table (StatCard / ContentCard / PaperCard
  / DynamicGridCard / legacy PhiCard) and a **"Which grid?"** table; promoted `renderLink`
  to a standalone **§3 Navigation links (any card)** covering all four link-capable cards
  (was buried under the dynamic-grid section and omitted PaperCard), with the
  `dragHandle`×`renderLink` throw and the fixed-card overlay note; added the
  fixed-card-in-fluid-grid **overlap warning** (the Phase 3b bug class); marked PhiCard legacy.
- **`docs/specifications/api-reference.md`**: legacy banner on the `PhiCard` deep section + its
  table row (steer to StatCard/ContentCard; note it has no `renderLink` seam); added the
  overlap caveat + a pointer to the read-first guide on the grid section; PaperCard listed in
  the static-grid card set.
- **Consumer `offansk-ev`** — fixed staleness the deletions left behind: two dangling JSDoc
  `{@link NavCard}` comments (`TenantAdminHome.tsx`, `SetupHome.tsx`) now describe
  `DynamicGridCard` + `renderLink`; `docs/guides/app-shell-structure.md` told module authors to
  return an `EntityCard` — updated to `StatCard` in a static `CardGrid` (matching `ProjectHome`).
  `component-reuse.md` was already correct.

### Phase 3c — EntityCard deleted (done)

Once T079 landed (committed), `EntityCard` was deleted and every call site inlines `StatCard`
directly: `HomePage`, `ProjectsView`, `AdminPage`, `TenantsPage`, `ProjectHome` (~10 cards),
`CriterionCard`, `DrilldownCard`. Prop mapping `badge`→`medallion`, `body`→`footer`,
`onOpen`→`onClick`; the dead `openText`/`openLabel` dropped; re-exported types repointed
(`EntityCardTone`→`StatCardTone`, `EntityCardBadge`→`StatCardMedallion`, `EntityCardStat`→`StatItem`).
Each card carries an explicit `size="md"` — matching `EntityCard`'s current default (a sibling
commit had shrunk it `lg`→`md`); `StatCard`'s own default is `md` too. `AdminPage`'s hand-rolled
`flex flex-wrap` div also moved to `CardGrid`. CriterionCard test green; browser-verified the
ProjectHome module-card grid renders identically at `md`. No navigable EntityCard site needed
`renderLink` (they use `onClick` whole-card navigation, which `StatCard` carries natively).

## References

- [offansk-ev Card Consolidation research](../../4-reports/research/2026-06-28-offansk-ev-card-consolidation.md)
  — the analysis pass that scoped this work: which consumer card wrappers can be deleted, and
  the two shell gaps (routable/keyboard-accessible cards; full-border error state) that block
  removing the rest.

## Affects

- `src/components/DynamicGridCard.tsx` (`figure`, `hoverable`, `corner`, `renderLink` seam,
  unified `footer` slot, `variant`→`shape` rename),
  `src/components/StatCard.tsx` + `src/components/ContentCard.tsx` (`renderLink` seam +
  block-link overlay; raise nested buttons above the overlay; `dragHandle`×link dev throw;
  unified `footer` slot; landscape proportion prop = `height = width / φ²`),
  `components.css` (`.mrs-dynamic-grid-card` figure-split + hover/focus; `__link-overlay`
  + `:has(a:focus-visible)` state projection + button/`__corner` `z-index` on all three
  cards), `index.ts` (types), `dist/` rebuild, `docs/specifications/api-reference.md`,
  `docs/guides/card-grid.md`.
- `my-react-shell-demo` (nav/link card on the card-grid page, including a `corner`-slot
  example; link variant on the stat/content kit sections; `shell-config.tsx` icon if a new
  section).
- Consumer `offansk-ev`: delete `src/components/NavCard.tsx`; swap call sites
  (`SetupHome`, `TenantAdminHome`, `DocumentsHome`, `TenantTemplatesPage`, `AccessGroupsView`
  — the last passes its `DropdownMenu` to the new `corner` slot, keeping the inline menu).
  Migrate `src/components/EntityCard.tsx` to the `StatCard` overlay link — drop its `lower`
  "open" CTA workaround.
