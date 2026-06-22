# T012 — ColorPicker component

Status: finished

## Goal

Add an opinionated **`ColorPicker`** to the component kit (`my-react-shell/components`),
inspired by the SolidJS foundation's `CompactColorPicker` but re-idiomised for this kit.
User requirements: **two modes — theme colors *and* a full range** — behind a **compact
popover trigger**, and **research a dependency** rather than hand-rolling the saturation
canvas.

## Outcome (what shipped)

A controlled, compact popover color picker with two modes:

- **Theme** — a grid of theme accent swatches (default `ACCENT_SWATCHES`, or a custom
  `swatches` list). A swatch emits `var(--color-accent-<name>)`, so a pick stays
  **theme-adaptive** (tracks light/dark + palette). Swatches are `Tab`-navigable radios —
  the same a11y model as `SegmentedControl` (chosen over foundation's Kobalte roving focus
  for kit consistency; the user freed the port from foundation's exact approach).
- **Custom** — a full hue/saturation range + hex input via **`react-colorful`**.

`value`/`onChange` is always a **directly-usable CSS color string** (`var(--color-accent-*)`
or `#rrggbb`); the component persists nothing. The mode toggle reuses the kit's
`SegmentedControl`; the popover is Radix Popover (an existing optional peer); opening the
Custom tab seeds the range from the current value by resolving a swatch token to its
concrete hex (DOM probe → canvas normalize).

### Dependency decision (user-approved)

Researched `react-colorful` vs `@uiw/react-color` vs React-Aria `ColorPicker`. Chose
**`react-colorful` 5.7.0** — ~2.8 KB gzipped, zero runtime deps, MIT, actively maintained
(May 2026 release), open React peer range (`>=16.8`, so React 19 installs clean), and it
auto-injects its own CSS. Added as an **optional peer of `/components`** (+ devDep here for
build/harness), mirroring the Radix peers — the consumer installs it only when using
`ColorPicker`. The swatch grid + popover stay shell-owned; only the saturation canvas is
outsourced. The 10-swatch default set comes from the shared `themes` accent vocabulary.

### Landed in

- **`src/components/ColorPicker.tsx`** (new) — the component + `ACCENT_SWATCHES`.
- **`src/components/components.css`** — `.mrs-color-picker*` rules (trigger, preview chip
  with empty-checkerboard, popover panel on `surface-raised`, swatch grid, react-colorful
  geometry overrides, hex field).
- **`src/components/index.ts`** — `ColorPicker`, `ACCENT_SWATCHES`, `ColorPickerProps`.
- **`package.json`** — `react-colorful` as devDep + optional peer.
- **`docs/specifications/api-reference.md`** — peers row, component-table row, `ColorPicker`
  subsection (props + examples), surfaces map.
- **`my-react-shell-demo`** — `src/pages/InputsActionsPage.tsx` (a `color-picker` section:
  both-modes + swatch-only + custom-only) and `src/shell-config.tsx` (`color-picker` icon in
  `ICONS` + `EMOJIS`).

## Verification

`pnpm typecheck` + `pnpm build:lib` clean in the shell; demo `tsc` clean. In-browser visual
verification on the demo `/inputs-actions` page is left to the user (browser tools are
user-instruction only; never start the dev server).
