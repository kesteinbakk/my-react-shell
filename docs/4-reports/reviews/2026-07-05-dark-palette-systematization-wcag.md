# Dark-palette systematization + WCAG AA re-audit + check:palettes gate

**Type:** review / work report
**Date:** 2026-07-05
**Agent:** my-react-shell-master
**Scope:** All six palettes (ocean, forest, sunset, soft, dynamic, golden) in the shared
`~/Developer/themes` package — light background tints, a full systematization of the
**dark** surface + interactive + border layer, golden-specific fixes, a new
`check:palettes` CI gate, and a WCAG AA re-audit of the re-lit surfaces.

---

## Summary

What began as a small request — "more blue in light ocean, more green in light forest" —
surfaced a deeper, structural problem the user named directly: **the palettes were tuned
per-file and per-eye, so cross-palette and light↔dark inconsistencies went uncaught.**
The work grew into putting the whole **dark surface layer on one system** and building a
tool so the class of drift is caught mechanically from now on.

Net result:

- Light **ocean**/**forest** backgrounds nudged bluer/greener; **forest** light surfaces
  moved off warm-gray `stone` onto `emerald` so it carries its hue like its siblings.
- Every palette's **dark** surface, interactive, and border tokens now derive from **one
  shared OKLCH ladder** (shared lightness stops; only hue + a chroma budget vary).
- **Golden** light-mode collisions fixed; its dark `*-bg` converted from translucent
  overlays to solid deep tints like the other five.
- New **`pnpm check:palettes`** gate (zero-dep Node) enforces consistency + WCAG AA.
- The re-lit dark surfaces were caught **below AA** by the gate and **darkened** to
  restore ≥4.5:1 (tightest now 4.59:1).

All changes are in the shared `themes` package (rippling to both my-react-shell and the
SolidJS foundation on the next tag bump) and vendored into the shell's `src/themes/`
(golden is foundation-only, not vendored).

---

## Context

The palettes fill a single framework-neutral `--color-*` contract. **Light** mode was
already principled — each palette indexes the same Tailwind ramp step (e.g.
`surface-sunken-deep` = the hue's `-100`), hue being the only variable. **Dark** mode was
not: every palette had an independently hand-tuned raw-RGB surface ladder, and the
interactive/border/semantic layers had drifted apart. The symptoms the user caught, in
order, drove the work:

1. Forest's light surfaces used a neutral warm-gray (`stone`) where every sibling tinted
   with its own hue — visible as a gray table header on a now-green page.
2. Dark `surface-sunken-deep` collapsed to near-black in every colored palette, losing
   its per-theme hue and its separation from the page floor.
3. The dark surface change, made in isolation, broke hover/active contrast and exposed
   an inverted forest hover/active — because surfaces and interactive states are one
   coupled system.
4. Golden (foundation-only, unswept until asked) had its own light collisions and a
   unique translucent `*-bg` strategy.

The through-line: **theme correctness is a relational property** (how tokens relate
across palettes and across modes), invisible to per-file review and only catchable with
a computed cross-section.

---

## Findings & changes

### 1. Light background tints (ocean, forest)

| Palette (light) | Token | Before | After |
|---|---|---|---|
| ocean | `background-primary` / `-secondary` | `sky-50` / `sky-100` | `sky-100` / `sky-200` |
| forest | `background-primary` / `-secondary` | `stone-50` / `stone-100` | `emerald-50` / `emerald-100` |

### 2. Forest light surfaces — hue alignment

Forest was the only palette whose surface/interactive/border neutrals used warm-gray
`stone`. Moved `surface-sunken`/`-deep`, `hover`, `active`, `selected`, `border-*`, and
`secondary-bg` onto `emerald`, matching how ocean tints on sky/slate and sunset on
orange/amber.

### 3. Dark surface ladder — one OKLCH spec (all six palettes)

Replaced six independently hand-tuned raw-RGB ladders with a single set of OKLCH
lightness stops; only hue + chroma vary per palette. Colored palettes carry a visible
chroma (0.045); soft/dynamic stay near-neutral by design. The system is visible in the
values themselves — identical L and C columns, only H rotates. Final (post-WCAG-darken)
lightness stops:

```
background-primary   L 0.15    surface-primary   L 0.255
background-secondary L 0.175   surface-raised    L 0.295
surface-sunken-deep  L 0.20
surface-sunken       L 0.23
```

Per-palette hue/chroma: ocean 237/0.045 · forest 162/0.045 · sunset 52/0.045 ·
golden 78/0.045 · soft 250/0.012 · dynamic 265/0.006.

### 4. Dark interactive + border layer — derived from the ladder

`hover`/`active`/`border-*` now sit at fixed OKLCH lightness stops **above** the
surfaces (hover 0.365, active 0.405, borders 0.43/0.49/0.56) in the palette's own
hue+chroma; `selected` is L0.35 C0.06 at the **brand** hue. This fixed, by construction:

- **hover colliding** with `surface-raised` (ocean), `surface-primary` (sunset), and
  `active≈raised` (forest) after the surface re-light.
- **forest's inverted** hover/active (active had been darker than hover).
- **`selected`** scattered from a translucent overlay (golden) to a vivid blue-600
  (dynamic) → unified to a brand-hued highlight, differentiated from the neutral hover
  by colour.

### 5. `*-bg` unification (dark)

Forest/sunset's floor-tinted semantic + accent backgrounds were aligned to the Tailwind
`-950` refs ocean already used, so all nine `*-bg` tokens are identical across the vivid
trio (ocean/forest/sunset). Golden's translucent `rgba(…, 0.10–0.14)` `*-bg` overlays
(unique to golden) were converted to the same solid deep tints, with a solid deep
champagne for `primary-bg` (kept distinct from amber `warning-bg`).

### 6. `surface-neutral`

Ocean's dark `surface-neutral` aligned to the shared `rgb(107,114,128)` (it had been the
lone `var(--color-gray-500)`). Golden keeps a warm `ink-500` by identity (advisory only).

### 7. Golden light-mode collisions

- `selected` had equalled `hover` (both `accent-50`) → moved to the champagne brand tint.
- `border-primary` had equalled `surface-sunken-deep` **and** `background-secondary` (all
  `ink-100`), making borders invisible on those surfaces → border ramp shifted one step to
  `ink-200/300/400`, matching the `-200` border convention.

### 8. `check:palettes` gate

`~/Developer/themes/scripts/check-palettes.mjs` (zero-dep Node, `pnpm check:palettes`).
Resolves every token — OKLCH/hex/rgb literals + Tailwind `var()` refs via the bundled
`scripts/tailwind-ramp.json` (parsed from `tailwindcss/theme.css`; regenerate on a
Tailwind bump). Hard-fails (exit 1) on: contract completeness, dark ladder ordering +
sunken-deep/floor separation, dark hover<active + surface contrast, `selected≠hover`,
light border/selected collisions, and **WCAG AA ≥4.5:1** for every text tier on every
card/well surface. Advisory WARNs on `surface-neutral` + vivid-trio `*-bg` divergence.

### 9. WCAG AA re-audit + darkening

The prior 2026-06-21 audit found dark mode had **zero** failures — but it ran against the
*old, darker* dark surfaces. The systematization had re-lit them (card L38, raised L51),
and `check:palettes` caught the cost:

| dark palette | text-muted / surface-raised (re-lit) | after darkening |
|---|---|---|
| dynamic | **4.13:1** ✗ (AA fail) | 4.59:1 ✓ |
| soft | 4.60:1 (thin) | 5.16:1 |
| ocean | 4.67:1 (thin) | 5.23:1 |
| forest / sunset | 4.70 / 4.91 | 5.20 / 5.44 |

Fix: pull every shared dark L-stop down ~0.02–0.03, most at the top where contrast is
tight (raised 0.325→0.295, card 0.275→0.255). Systematic structure and per-palette
hue+chroma preserved; surfaces still read clearly coloured, just deeper. Verified both by
`check:palettes` (fixture math) and independently in the live browser (canvas-resolved).

---

## Status

- **All six palettes** on the unified dark system; `pnpm check:palettes` exits 0.
- **WCAG AA:** every text tier ≥4.5:1 on every card/well surface, both modes, all six
  palettes. Tightest margin **4.59:1** (dynamic-dark muted/raised).
- **Advisories (intentional, not gated):** ocean-light `text-muted` on
  `background-secondary` = 4.25:1 — that token is the page canvas behind cards, not a
  body-text surface; golden's warm `surface-neutral` — earth-tone identity.
- **Vendored** into the shell's `src/themes/` (5 palettes; golden foundation-only).
- **Not yet released.** Consumers (the demo, live-linked apps, the SolidJS foundation)
  pick these up on the next `themes` tag bump + downstream reinstall — a separate,
  explicit release step.

---

## Recommendations

- **Run `pnpm check:palettes` after any palette/token edit**, and wire it into the
  themes release preflight so a sub-AA or inconsistent palette can never ship.
- **Do not lighten the top dark L-stops** (`surface-raised`/`surface-primary`) without
  re-running the gate — `surface-raised` is the tightest surface for light-muted text.
- **Regenerate `scripts/tailwind-ramp.json`** whenever the Tailwind version bumps (it is
  a snapshot of `tailwindcss/theme.css`).
- The dark semantic/accent **foregrounds** intentionally vary by palette identity (soft
  muted, dynamic vivid, colored desaturated-for-comfort) — left as-is by design; revisit
  only if a single semantic set across palettes is ever wanted.

---

## References

- `~/Developer/themes/` — `ocean.css`, `forest.css`, `sunset.css`, `soft.css`,
  `dynamic.css`, `golden.css`; `scripts/check-palettes.mjs`; `scripts/tailwind-ramp.json`
- Prior audit: `docs/4-reports/reviews/2026-06-21-t011-w3-wcag-desaturation-audit.md`
- themes commits: `5a1439d`, `3d95849`, `c005278`, `c5135d4`, `ce01338`, `2fffdb8`
- shell vendor commits: `e0610a1`…`e4f5712` (`src/themes/`)
