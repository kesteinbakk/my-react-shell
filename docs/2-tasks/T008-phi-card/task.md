# T008 — phi-card

Port the SolidJS `foundation` **`PhiCard`** into the React kit and document it.

## Goal

Add `<PhiCard>` to `my-react-shell/components` — a faithful React port of
foundation's golden-ratio–locked card (`~/Developer/zingularis/foundation/src/kit/shared/PhiCard.tsx`),
with the same public API and the same φ-proportioned geometry, styled the kit's way.

## Why

Rule of two: the component exists in the Solid foundation; a React consumer wanting
the same structured, proportion-locked card had no equivalent. The geometry is pure
CSS grid (`fr`-unit ratios), so it carries from Solid to React with no engine-specific
logic — a clean port.

## Geometry (unchanged from the source)

```
Outer:      width : height  = φ : 1     (height = width / φ)
Bands:      upperH : lowerH  = φ : 1     (horizontal split)
Upper band: leftW  : rightW  = 1 : φ     (narrow logo · wide title)
Lower band: leftW  : rightW  = φ : 1     (wide footer · narrow badge)
```

`PHI = 1.6180339887` is exported. Width presets: `sm`/`md`/`lg`/`xl` = 180/240/320/480px.

## Adaptations to kit conventions

- **Self-contained surface.** The Solid version wraps the kit's `Card`; the React kit
  ships no `Card` (plain cards stay shadcn's), so `PhiCard` renders its own surface —
  bordered, rounded, `surface-primary`, shadow, hover-lift — directly on the semantic
  tokens.
- **Own CSS, not Tailwind utilities.** All structure lives in `components.css` as
  `mrs-phi-card*` classes (the kit ships precompiled CSS; a consumer's Tailwind never
  scans `node_modules`). The φ splits are `fr`-unit `grid-template` literals; the
  `1.6180339887fr` literals are φ, kept in lockstep with the exported `PHI`.
- **`class` → `className`, `JSX.Element` → `ReactNode`**; props otherwise identical
  (`size`, the four slots, `leftBorderColor`, `onClick`, `hoverable`, `dividers`,
  `centerContent`, `singleBand`).

## Scope

- `src/components/PhiCard.tsx` — new component + `PHI` + types.
- `src/components/components.css` — the `mrs-phi-card` block.
- `src/components/index.ts` — export `PhiCard`, `PHI`, `PhiCardProps`, `PhiCardSize`.
- `docs/guides/component-kit.md` — add to the Shipped-today list + a Layout section.

## Out of scope (follow-up)

- **Demo Kit page** in `my-react-shell-demo` — the visual φ-geometry showcase and
  in-browser verification. No showcase lives in this repo (strategy D7); flagged to the
  user as the next step.

## Status

Code + guide complete; lib typecheck/build green. Demo Kit-page showcase pending (user).
