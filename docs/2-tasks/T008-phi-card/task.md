# T008 — phi-card

Add a `<PhiCard>` to `my-react-shell/components` — a golden-ratio card — and document it.

## Goal

A golden-ratio card for the opinionated kit. Started as a port of foundation's
`PhiCard` (`~/Developer/zingularis/foundation/src/kit/shared/PhiCard.tsx`), then
**redesigned** for a simpler, more reusable React API: two consumer-owned sections
instead of four fixed slots, and a built-in top-right actions menu.

## Why

Rule of two: a structured, proportion-locked card existed in the Solid foundation but
had no React equivalent. The redesign drops the foundation's logo/title/footer/badge
opinion — a React consumer fills the two sections however they like.

## Design (current)

Geometry — width is the only size knob:

```
Outer:  width : height = φ : 1     (height = width / φ)
Split:  upperH : lowerH = φ : 1    (the two sections)
```

- **Two consumer-owned sections** — `upper` / `lower` (`ReactNode`). Full-bleed: each is
  a single grid cell that stretches its child to fill both axes, so a figure/image fills
  edge-to-edge; the consumer adds its own padding for inset content.
- **Optional figure** — `image` (full-bleed, `object-fit: cover`) or `icon` (centered)
  renders the **top** section full-width (figure-over-content), with `lower` below.
  Precedence for the top section: `image` > `icon` > `upper`.
- **Bottom collapses when empty** — `lower` absent / `null` / `false` → the section is not
  rendered; the top fills the card and the outer φ:1 ratio is kept (so collapsed cards
  still line up in a grid). Replaces the old `singleBand` prop.
- **Top-right overflow menu** — `actions: PhiCardAction[]` → a ⋮ trigger opening a Radix
  `DropdownMenu` (reuses the already-declared `@radix-ui/react-dropdown-menu` optional
  peer — no new dependency). No actions → no trigger. The card owns placement + the menu
  mechanism + the trigger glyph; the consumer owns the actions (icons, labels, handlers,
  `destructive`). The kit ships no icon registry and never imports i18n.
- **`corner` escape hatch** — a consumer node that replaces the built-in menu (inline icon
  buttons, a custom menu). The corner never triggers a clickable card's `onClick`.
- Kept: `size` (`sm`/`md`/`lg`/`xl` = 180/240/320/480px), `leftBorderColor`, `onClick` /
  `hoverable`, `className`, and the exported `PHI` (`1.6180339887`).
- Dropped from the Solid original: the four `upper*`/`lower*` slots, `dividers`,
  `centerContent`.

Self-contained surface (the kit ships no `Card`) styled with `mrs-phi-card*` classes in
`components.css`; the φ split is an `fr`-unit `grid-template` literal kept in lockstep
with `PHI`.

## Scope

- `src/components/PhiCard.tsx` — component + `PhiCardMenu` + `PHI` + types
  (`PhiCardProps`, `PhiCardAction`, `PhiCardSize`).
- `src/components/components.css` — the `mrs-phi-card` block (surface, sections, corner,
  menu).
- `src/components/index.ts` — export `PhiCard`, `PHI`, `PhiCardProps`, `PhiCardSize`.
- `docs/specifications/api-reference.md` — the single source of truth: export-table row +
  a `### PhiCard` entry (the deleted `component-kit.md` guide was consolidated here).
- `my-react-shell-demo` — Kit-page section (`KitPage.tsx`) + the `phi-card` tab icon
  (`shell-config.tsx`).

## Status

Code, api-reference, and demo complete; both repos typecheck green, lib build green.
Visual φ-geometry verification (proportions, bottom-collapse, the ⋮ menu) is the user's —
run the demo dev server and open `/kit` → PhiCard.
