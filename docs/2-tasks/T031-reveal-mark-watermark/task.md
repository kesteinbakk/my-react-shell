# T031 — reveal-mark-watermark

A general **hover-reveal watermark seam** and its first instance, an isometric **drawer** mark,
usable as a `DynamicGridCard` watermark that rests closed and slides open on hover.

## What shipped

- **`RevealMark`** (`src/components/RevealMark.tsx`) — the seam. Two stacked layers
  (`closed` / `revealed`) that cross-fade. The revealed layer shows when the mark's nearest
  `.mrs-reveal-host` ancestor is hovered, or unconditionally when `open` is `true` (active route).
  Driven entirely by CSS — the host owns the hover, so a mark works inside any `mrs-reveal-host`
  container. Decorative (`aria-hidden`).
- **`DrawerMark`** (`src/components/DrawerMark.tsx`) — first instance, built on `RevealMark`.
  Closed = a solid isometric box with a knob; open = the tray pulled out, a dark slot, gray inner
  walls + floor, and one sheet lying flat inside. All theme-token-driven; the gray interior is a
  `color-mix(--color-text-primary …)` into the surface (no new token), so it inverts between
  light and dark mode. Surfaces shade top → front → side (raised → primary → sunken).
- **`DynamicGridCard.watermark`** overloaded `string | ReactNode`. A string keeps the emoji
  `::after` path (gated to `[data-watermark]`); an element renders in a faint
  `mrs-dynamic-grid-card__watermark` art layer (opacity `0.16`) behind the content, and the card
  root gains `mrs-reveal-host` so a hover-reveal mark opens on card hover.

## Decisions

- **Interior gray = local `color-mix`**, not a new `--color-surface-inverse` token (user call).
- **Built the general seam** (`RevealMark`) rather than a one-off drawer, so other openable marks
  can reuse it (user call).
- Open state = **active route** (forced via `open`); closed = resting, opens on hover.

## Surface touched

Shell: `RevealMark.tsx`, `DrawerMark.tsx`, `DynamicGridCard.tsx`, `components.css`, `index.ts`,
`dist/`, `docs/specifications/api-reference.md`, `docs/guides/card-grid.md`. Demo
`my-react-shell-demo`: new "Drawer mark" section on `CardGridsPage` (reuses the `card` icon key).

## Verification

`pnpm typecheck` + `pnpm build:lib` clean in the shell; `pnpm typecheck` clean in the demo
against the link'd build. Visual/browser confirmation in the demo pending the user.
