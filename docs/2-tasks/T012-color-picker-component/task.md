# T012 — ColorPicker component

Status: finished

## Goal

Add an opinionated **`ColorPicker`** to the component kit (`my-react-shell/components`) —
a compact popover-trigger color picker, with a dependency (not hand-rolled) for the
full-range canvas.

## Outcome (what shipped)

A **general**, controlled color picker behind a compact popover trigger. Two behaviours,
chosen by whether the consumer constrains it:

- **Free** (default) — a full hue/saturation range via **`react-colorful`**. `onChange`
  emits a CSS color string in `format` — `hex` (`#rrggbb`, with an editable hex field),
  `rgb` (`rgb(…)`), or `hsl` (`hsl(…)`). rgb/hsl show the current value read-only below the
  canvas (react-colorful ships no editable input for those).
- **Constrained** — passing a `colors` set **limits** selection to it, shown as a
  `Tab`-navigable swatch grid (same a11y model as `SegmentedControl`). Entries may be **any**
  CSS color string; `onChange` emits the picked entry verbatim.

`value`/`onChange` is always a directly-usable CSS color string; the component persists
nothing. The popover is Radix Popover (an existing optional peer).

> **Design history:** the first cut tied the swatch grid to the shared theme accent tokens
> (`--color-accent-*`, a "Theme" tab). That was dropped — the accent tokens don't read like
> the active palette's colors (confusing), and the contract only guarantees 5 of them, so
> non-`dynamic` palettes showed empty cells. Theme-token support was removed entirely in
> favour of this general any-color picker; consumers that want a fixed palette pass `colors`.

### Dependency decision (user-approved)

Researched `react-colorful` vs `@uiw/react-color` vs React-Aria `ColorPicker`. Chose
**`react-colorful` 5.7.0** — ~2.8 KB gzipped, zero runtime deps, MIT, actively maintained,
open React peer range (React 19 installs clean), auto-injects its own CSS, and ships per-format
string pickers (`HexColorPicker` / `RgbStringColorPicker` / `HslStringColorPicker`). Added as
an **optional peer of `/components`** (+ devDep here for build/harness), mirroring the Radix
peers — installed only when a consumer uses `ColorPicker`.

### Landed in

- **`src/components/ColorPicker.tsx`** (new) — `ColorPicker` + `ColorFormat`.
- **`src/components/components.css`** — `.mrs-color-picker*` rules (trigger, empty-checkerboard
  preview, popover panel on `surface-raised`, swatch grid, react-colorful geometry overrides,
  hex field, rgb/hsl readout).
- **`src/components/index.ts`** — `ColorPicker`, `ColorPickerProps`, `ColorFormat`.
- **`package.json`** — `react-colorful` as devDep + optional peer.
- **`docs/specifications/api-reference.md`** — peers row, component-table row, `ColorPicker`
  subsection (free/constrained + format), surfaces map.
- **`my-react-shell-demo`** — `src/pages/InputsActionsPage.tsx` (a `color-picker` section:
  free / constrained-set / rgb+hsl formats) and `src/shell-config.tsx` (`color-picker` icon).

## Verification

`pnpm typecheck` + `pnpm build:lib` clean in the shell; demo `tsc` clean. In-browser visual
verification on the demo `/inputs-actions` page is left to the user.
