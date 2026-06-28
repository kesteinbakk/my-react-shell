# T029 — Card link / interactive-root pattern (nav cards first)

**Status:** planning
**Filed:** 2026-06-28

## Goal

Let a shell card act as a **whole-card navigation target** (a real link) without the
shell ever importing a router. First concrete scope: the **nav-card** use — replace the
offansk-ev consumer `NavCard` (a thin compose over the now-retiring `PhiCard`) with the
shell's **`DynamicGridCard`**, given the interactive-root support it currently lacks.

The hard part is **how** the card becomes a link. That pattern is the central open
question below — it is **not** nav-card-specific: `StatCard` and `ContentCard` are also
used as navigation targets in the consumer, so whatever pattern we pick here is the one
we will port across every card. Decide it once, deliberately.

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
- **No context-menu / corner-action support on these cards** (user decision). This
  removes the button-inside-anchor structural constraint entirely, so the card root can
  simply *be* the link. Consequence: **`AccessGroupsView`'s** group cards (the one call
  site using `actionMenu` for rename/delete/change-icon) lose the inline menu — those
  actions must be relocated (most naturally onto the group's detail page). Flag this in
  the port; where they resurface is the consumer's call.
- **Defer `error`/invalid state.** Defined on `NavCard` but used at **zero** call sites.
  Add later only if a real site needs the red-border state.

## Plan (nav-card scope, pending the open-question decision)

Additive props on **`DynamicGridCard`** (nothing existing breaks — the interactive root
defaults to a plain `<div>`):

- `figure?: ReactNode` — icon/emoji column beside the title (a figure-split layout).
- `hoverable?: boolean` — cursor + hover-lift + `:focus-visible` ring on the root.
- an **interactive-root seam** (exact shape = the open question) so the consumer supplies
  its router `<Link>` as the card's root element.

Then swap the offansk-ev call sites (`SetupHome`, `TenantAdminHome`, `DocumentsHome`,
`TenantTemplatesPage` — clean swaps; `AccessGroupsView` — swap + relocate its actions),
delete the consumer `NavCard`, update the api-reference + `docs/guides/card-grid.md`, and
show the nav/link variant on the demo's card-grid page.

## OPEN QUESTION (decide before implementing) — the interactive-root / routing pattern

**How should a shell card render *as* a consumer-supplied router `<Link>`, given the shell
must not depend on any router?** This decision governs **all** cards (nav, stat, content),
not just the nav card. Constraints to satisfy:

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
| **`renderRoot` render-prop** | `renderRoot={(p) => <Link {...p} to=… params=… />}` | ✅ full (literal `<Link>`) | none | Most explicit; per-`renderCard` boilerplate (one arrow). Dep-free. |
| **`asChild` (Radix Slot)** | `<Card asChild><Link to=… params=…/></Card>` | ✅ full (literal child) | `@radix-ui/react-slot` (new, needs approval) | Idiom consumers already know (shell consumes Radix `asChild` everywhere); single-child + ref-merge rules; Slot injects the card's internal JSX as the Link's children. |
| **polymorphic `as`** | `<Card as={Link} to=… params=… />` | ⚠️ weak/hard | none | Tersest, but typing `as` over TanStack's route-tree generics is genuinely painful — usually loses per-route checking. |
| **injected-Link via context** | app root: `<CardLinkProvider link={Link}>`; site: `<Card to=… params=… />` | ⚠️ weak by default | none | Best ergonomics (bind once at app root, terse sites); cards read an injected `LinkComponent`; route-level types need extra consumer typing to recover. Worth investigating — closest to "our own link wrapper for all cards." |

**Lean (to be confirmed):** `renderRoot` for dep-light + full type-safety, **or** `asChild`
if we accept the `react-slot` dep for the terser Radix-native idiom. Investigate the
**injected-Link-via-context** option seriously, since it's the literal form of the user's
"could we add our own link wrapper for all cards" — quantify how much router type-safety it
costs and whether a small consumer-side typed wrapper recovers it.

**Deliverable of the investigation:** pick one pattern, justify against the six constraints,
and confirm it ports cleanly to `StatCard`/`ContentCard` (retiring both consumer
workarounds) — recorded here before any code lands.

## Affects

- `src/components/DynamicGridCard.tsx` (`figure`, `hoverable`, interactive-root seam),
  `components.css` (`.mrs-dynamic-grid-card` figure-split + hover/focus), `index.ts` (types),
  `dist/` rebuild, `docs/specifications/api-reference.md`, `docs/guides/card-grid.md`.
- `my-react-shell-demo` (nav/link card on the card-grid page; `shell-config.tsx` icon if a
  new section).
- Consumer `offansk-ev`: delete `src/components/NavCard.tsx`; swap call sites
  (`SetupHome`, `TenantAdminHome`, `DocumentsHome`, `TenantTemplatesPage`, `AccessGroupsView`);
  relocate `AccessGroupsView`'s group actions. (Stat/content-card migration — `EntityCard` —
  is follow-on once the pattern is chosen.)
