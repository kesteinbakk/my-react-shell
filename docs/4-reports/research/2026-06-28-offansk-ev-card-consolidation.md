# offansk-ev Card Consolidation — Replacing Local "Support Cards" with Pure Shell Cards

**Type:** research
**Date:** 2026-06-28
**Agent:** my-react-shell-master
**Scope:** Card usage in the consumer project `offansk-ev` — which project-local card wrappers can be replaced by pure `my-react-shell` cards, and what the shell must add to remove the rest.

---

## Summary

offansk-ev defines **5 project-local "support cards"** wrapping shell cards, plus a
handful of inline hand-rolled card `<div>`s. Most can be deleted in favor of pure
shell components today. Removing the remainder cleanly is blocked by **two real shell
gaps**: (1) clickable shell cards (`StatCard`/`ContentCard`/`PhiCard`) are not
keyboard-accessible or routable — they render a bare `<div onClick>`; and (2) there is
no full-border error/danger treatment on the cards. Closing those two gaps eliminates
~90% of the local card code.

## Context

The user asked to investigate card usage in offansk-ev and replace as much as possible
with pure react-shell cards, *without the need for "additional support cards"* — and to
analyse the differences and what the shell would need to support. This report is the
analysis pass; **no code has been changed** in either repo.

offansk-ev is a React + Vite + Convex consumer that imports `my-react-shell/components`.
Findings below were verified against the live wrapper sources in offansk-ev and the live
shell card sources, not from memory.

## Findings

### A. The project-local "support cards"

| Local card | Uses | Wraps | Verdict |
|---|---|---|---|
| `EntityCard` | ~48 | `StatCard` | **Delete** — near-pure pass-through (props map 1:1). |
| `NavCard` | ~15 | `PhiCard` + `<Link>` | **Blocked** by shell gaps #1 and #2. |
| `CriterionCard` | ~2 | `EntityCard` | **Keep** (real domain logic) — repoint at `StatCard`. |
| `NotFoundCard` | ~15 | `Card` + msg + button | **Replace** with shell `EmptyState`. |
| `PersonSubCard` / `VendorColumn` / `ConsultantVendorColumn` | hand-rolled | `<div className="rounded-lg border bg-card …">` | Domain layouts — only the **outer wrapper** should become shell `Card`. |

Paths:
- `offansk-ev/src/components/EntityCard.tsx`
- `offansk-ev/src/components/NavCard.tsx`
- `offansk-ev/src/modules/evaluation/CriterionCard.tsx`
- `offansk-ev/src/modules/admin/NotFoundCard.tsx`
- `offansk-ev/src/modules/evaluation/PersonSubCard.tsx`, `VendorColumn.tsx`, `ConsultantVendorColumn.tsx`

#### `EntityCard` — a rename of `StatCard`

Its props forward 1:1 to `StatCard`: `badge→medallion`, `body→lower`, `onOpen→onClick`,
plus `tone`/`color`/`stats`/`watermark`/`sideBarCompleteness`/`topStripeFollowsGauge`/
`variant`/`onMedallionPress`/`size`. The component body is a single `<StatCard …/>` with
no extra markup.

Notably, EntityCard's **doc comment** claims it adds an accessible "open" CTA
(`openText`/`openLabel`, the `.mrs-stat-card__nudge` chevron) as the keyboard open-path —
but the **current code no longer renders it**. `openText`/`openLabel` are accepted and
then ignored; only `onClick={onOpen}` is wired. So functionally EntityCard is a semantic
rename of `StatCard`, and its documented reason to exist *is exactly shell gap #1*.

#### `NavCard` — exists for routing + error border

A thin compose over `PhiCard` that the project wraps in a TanStack `<Link>` for three
reasons, two of which are shell gaps:

1. **Routable + keyboard-focusable tile.** A footer-less `PhiCard` with `onClick` is a
   mouse-only, non-focusable `<div>`; the `<Link>` provides navigation, focus, and
   keyboard activation. (Shell gap #1.)
2. **Error state.** A red border + red subtitle. The code comment notes the border has
   to live on the `<Link>` wrapper because *"the shell card sets `border` via a shorthand
   a Tailwind utility loses to."* (Shell gap #2.)
3. **`actionMenu`** rendered as an absolutely-positioned overlay. `PhiCard` already ships
   a `corner` slot that would serve this once routing is solved — not a gap.

#### `CriterionCard` — genuine domain logic, keep

Computes completion %, weight formatting (`fmtScore`/`displayPct`), branch-vs-leaf
emoji (📁/📄), identity color, and `topStripeFollowsGauge` fallback. This is a feature
component, not a duplicated shell capability. It should render `StatCard` directly once
`EntityCard` is removed.

#### `NotFoundCard` — should be `EmptyState`

A plain shell `Card` with an i18n message and an optional "back to home" button. The shell
already ships `EmptyState` (centered zero-state: optional icon, required `title`,
`description`, action slot), which covers this. Keep `NotFoundCard` only as a ~5-line i18n
wrapper around `EmptyState` if a single domain entry point is wanted.

### B. Inline hand-rolled card patterns (no shell change needed)

These re-implement shell `Card` and can be swapped today:

- **Config cards** — `rounded-xl border border-border/50 bg-card p-6 shadow-sm` in
  `CriteriaConfig.tsx`, `TilbudConfig.tsx`.
- **Help/info cards** — 4 identical `rounded-xl border … hover:shadow-md` cards in
  `CommunicationPage.tsx`.
- **Vendor-column shells** — `rounded-lg border bg-card p-4` outer wrapper in
  `VendorColumn.tsx`, `ConsultantVendorColumn.tsx`, `PriceVendorColumn.tsx`, and the
  per-person `rounded-md border bg-background p-3` in `PersonSubCard.tsx`.

The **outer wrapper** of each maps to `Card` (+ `CardHeader`/`CardTitle`/`CardContent`/
`CardFooter`); the domain internals stay as-is.

### C. The two shell gaps (verified against shell source)

**Gap #1 — clickable cards are not accessible or routable.**
`StatCard`, `ContentCard`, and `PhiCard` render a bare `<div … onClick={onClick}>` with no
`tabIndex`, no `role`, no `onKeyDown` (Enter/Space), and no link semantics:
- `src/components/StatCard.tsx:568` (root `<div>`), `:584` (`onClick`)
- `src/components/PhiCard.tsx:388` (`onClick`)
- `src/components/ContentCard.tsx:272` (`onClick`)

This single gap is the documented reason `EntityCard` exists and the primary reason
`NavCard` wraps `PhiCard` in a `<Link>`.

**Gap #2 — no full-border error/danger treatment.**
`StatCard`/`ContentCard` have `variant='warning'|'danger'`, but it paints only an accent
stripe + watermark, not a full border. `PhiCard` has no `variant` at all. The card's
`border` is set via a shorthand that a consumer Tailwind utility cannot override, so
NavCard draws its red error border on a wrapper element instead.

## Recommendations

**Shell changes (unblock NavCard, make EntityCard removal correct):**

1. **Accessible / routable clickable cards** on `StatCard`, `ContentCard`, `PhiCard`.
   Recommended: add **`asChild`** (Radix `Slot`), mirroring the kit `Button` — a consumer
   passes a `<Link>`/`<a>`/`<button>` as the card root and gets routing + focus + keyboard
   for free, keeping the shell router-free. Fallback if `asChild` is structurally awkward:
   when `onClick` is set, add `role="button"` + `tabIndex={0}` + Enter/Space handling
   built in (covers keyboard but not real navigation).
2. **Bordered error/danger state.** Either extend the `variant='danger'|'warning'`
   treatment with a full border (and add a comparable variant to `PhiCard`), or make the
   card border overridable so a consumer utility wins.

Each shell change must update `docs/specifications/api-reference.md` and the relevant demo
kit page(s) in the same change (per project policy).

**offansk-ev changes (after the shell ships):**

1. Delete `EntityCard` → use `StatCard` directly.
2. Delete `NavCard` → `PhiCard asChild={<Link>}` + the new danger border; use `PhiCard`'s
   `corner` slot for `actionMenu`.
3. Repoint `CriterionCard` at `StatCard`.
4. Replace `NotFoundCard` with `EmptyState` (or a thin i18n wrapper around it).
5. Swap the inline config/help/vendor-column card `<div>`s for shell `Card` + parts.

**Open decision (for the user):** which a11y approach for gap #1 — `asChild`, built-in
button semantics, or both — and whether to spec this as a task before implementing.

## References

- offansk-ev: `src/components/EntityCard.tsx`, `src/components/NavCard.tsx`,
  `src/modules/evaluation/CriterionCard.tsx`, `src/modules/admin/NotFoundCard.tsx`,
  `src/modules/evaluation/{PersonSubCard,VendorColumn,ConsultantVendorColumn}.tsx`,
  `src/modules/project-admin/{CriteriaConfig,TilbudConfig,CommunicationPage}.tsx`,
  `src/modules/price/PriceVendorColumn.tsx`
- shell: `src/components/StatCard.tsx:568,584`, `src/components/PhiCard.tsx:388`,
  `src/components/ContentCard.tsx:272`
- shell API reference: `docs/specifications/api-reference.md` (`StatCard`, `ContentCard`,
  `PhiCard`, `EmptyState`, `Card`, `CardGrid`, `DynamicCardGrid`)
</content>
</invoke>
