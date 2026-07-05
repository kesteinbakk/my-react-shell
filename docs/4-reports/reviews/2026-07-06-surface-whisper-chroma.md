# Surface whisper-chroma pass — ocean, forest, sunset

**Type:** review / work report
**Date:** 2026-07-06
**Agent:** my-react-shell-master
**Scope:** The three colored palettes (ocean, forest, sunset) in the shared
`~/Developer/themes` package — surface/background/border/interactive chroma in dark
mode, canvas tints in light mode. Soft, dynamic, and golden untouched. Vendored into
the shell's `src/themes/`.

---

## Summary

The user compared all palettes across light and dark (screenshots from the offansk-ev
app) and asked two structural questions. Both were settled by decision, with visual
mockups and computed WCAG numbers as evidence:

1. **Keep the elevation direction.** The dark ladder stays canvas-darkest /
   popover-lightest (the documented, Material-style "elevation = lighter" rule). An
   inverted ladder (cards darkest) was mocked up and measured: it merely *moves*
   contrast rather than adding it (card-vs-canvas separation identical at 1.21:1
   either way), and it makes popovers read as holes. Rejected.
2. **Surfaces carry only a whisper of the palette hue.** The colored trio's dark
   surfaces sat at C 0.045/0.036 — 3–4× the chroma of soft (C 0.012), the palette the
   user prefers. All dark surface-layer chroma is now scaled to ~⅓ ("whisper"), and
   light canvases are softened to matching custom stops. Theme identity lives in the
   accents (headings, primary, focus, selected), which are untouched.

A "graded chroma" variant (chroma falling as elevation rises, cards nearly neutral)
was proposed, mocked up, and **explicitly rejected** by the user in favor of the flat
whisper scaling — every dark rung keeps a visible tint. Do not "improve" the palettes
toward neutral cards.

## Applied values

**Dark (ocean H237 · forest H162 · sunset H52)** — L stops unchanged, chroma scaled:

| Token | Before | After |
|---|---|---|
| `background-primary` / `-secondary` | C 0.045 | **C 0.015** |
| `surface-primary` (card) | C 0.036 | **C 0.012** |
| `surface-raised` | C 0.038 | **C 0.013** |
| `surface-sunken` / `-sunken-deep` | C 0.034 / 0.032 | **C 0.011** |
| `border-primary/secondary/hover` | C 0.045 | **C 0.015** |
| `hover` / `active` | C 0.045 | **C 0.015** |
| `selected`, semantic/accent `*-bg`, text, brand | — | unchanged |

**Light (same three palettes)** — cards and sunken wells unchanged (wells keep their
tint by explicit user decision); only the canvas zone softened, onto shared stops:

| Token | Before | After |
|---|---|---|
| `background-primary` | sky-100 / emerald-50 / orange-50 | **oklch(0.975 0.012 H)** |
| `background-secondary` | sky-200 / emerald-100 / amber-100 | **oklch(0.955 0.018 H)** |

Light hues: ocean 237, forest 166, sunset 70 (the light canvas keeps the warm orange
family; the dark ladder keeps hue 52).

Side effect: sunset-dark no longer reads as a brown room — hue 52 at whisper chroma
is a warm charcoal, so the earlier idea of re-hueing sunset-dark toward fuchsia is
dropped.

## Verification

- `pnpm check:palettes` exits 0 — all hard checks (ladder ordering, hover/active,
  collisions, WCAG AA ≥4.5:1 on every text×surface pair) pass; only the two known
  advisory `surface-neutral` warnings remain. Tightest contrast is still 4.59:1
  (golden-light, untouched).
- Vendored via `pnpm sync:themes`; verified live in the demo preview: ocean dark,
  forest dark, sunset dark, ocean light all render the new tokens (computed-style
  check + screenshots), console clean.

## Status

- Applied in `~/Developer/themes` and vendored into the shell's `src/themes/`.
- **Not yet released** — consumers (demo via `link:` sees it live; the SolidJS
  foundation and tag-pinned apps do not) pick this up on the next `themes` tag bump +
  downstream reinstall.
- Golden (foundation-only) still carries the old C 0.045 dark surfaces — align it in
  the themes repo if the whisper rule should hold there too.

## References

- `~/Developer/themes/ocean.css`, `forest.css`, `sunset.css`
- Prior reports: `2026-07-05-dark-palette-systematization-wcag.md` (the ladder + gate
  this pass builds on), `2026-06-21-t011-w3-wcag-desaturation-audit.md`
