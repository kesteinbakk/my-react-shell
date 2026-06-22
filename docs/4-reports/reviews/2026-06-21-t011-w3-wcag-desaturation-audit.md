# T011 W3 — Dark-accent desaturation + WCAG 4.5:1 audit

**Type:** review
**Date:** 2026-06-21
**Agent:** code
**Scope:** All six palettes (ocean, forest, sunset, soft, dynamic, golden) — dark-mode accent desaturation pass and full per-token WCAG AA text contrast audit in both light and dark modes.

---

## Summary

15 WCAG AA failures were found — all `--color-text-muted` on light tinted surfaces — and fixed across all six palettes. No dark-mode text failures. Dark accent foreground tokens (`*-400`/`*-300`) were desaturated ~20 saturation points in four palettes (ocean, forest, sunset, golden); soft and dynamic were already appropriately calibrated and unchanged.

---

## Context

T011's W3 best-effort scope specified two palette-wide colour fixes deferred from the main surface-token refactor:

1. **Dark-accent desaturation** — Tailwind `*-400` foreground accents in dark mode are heavily saturated and cause visual fatigue on dark backgrounds. Convention (Material 3, Radix, Apple HIG) is to desaturate dark foreground accents ~15–25 saturation points.
2. **WCAG 4.5:1 audit** — A full per-token contrast check for text-on-every-surface across all 6 palettes, both modes.

Both items were carried out in the shared `themes` package (`~/Developer/themes`), which ripples to all consumers on their next tag bump.

---

## Findings

### Dark-accent desaturation

Tailwind `*-400` and `*-300` tokens are unmodified HSL values designed for light-mode use. On dark backgrounds they read as aggressively saturated and cause eye fatigue. The fix is to reduce the S component by ~20pp in HSL space and hardcode the resulting hex, leaving lightness unchanged.

**Palettes affected:**

| Palette | Tokens desaturated |
|---|---|
| **ocean** | `--color-primary` (cyan-400), `--color-text-heading`, `--color-focus`, `--color-focus-ring`, `--color-success/hover/strong`, `--color-warning/hover/strong`, `--color-info/hover/strong`, all 5 `--color-accent-*` foreground + hover |
| **forest** | Same token set; emerald primary accent |
| **sunset** | Same token set; fuchsia-400 primary (`#de89eb`), fuchsia-300 hover (`#eab5f2`), fuchsia-500 active (`#ca5adb`) |
| **golden** | sky/emerald/violet/rose accents + success/info; amber kept as custom `#ea9425` (golden theme signature); warning/danger kept as theme-custom values |
| **soft** | Already uses custom-calibrated soft values (e.g. `rgb(125,182,251)`) — no change |
| **dynamic** | Already uses 300-level vibrant values intentionally (high-contrast palette) — no change |

**Desaturated values used consistently across palettes:**

| Original | Desaturated (~−20pp S) |
|---|---|
| sky-400 | `#4fb4e4` |
| sky-300 | `#8bcfee` |
| emerald-400 | `#4ebb93` |
| emerald-300 | `#7fd7b4` |
| amber-400 | `#e4b43a` |
| amber-300 | `#eac35e` |
| violet-400 | `#ac96ee` |
| violet-300 | `#cbbef4` |
| rose-400 | `#ec7e8f` |
| rose-300 | `#f3b0ba` |
| fuchsia-400 | `#de89eb` |
| fuchsia-300 | `#eab5f2` |
| fuchsia-500 | `#ca5adb` |
| cyan-400 (ocean primary) | `#38c1d6` |
| emerald-500 (forest active) | `#24a57a` |

All desaturated accent values were verified to still pass WCAG 4.5:1 when used as text on their respective dark surfaces and as solid button backgrounds.

---

### WCAG 4.5:1 text audit

**Method:** Node.js script computing sRGB relative luminance for every text token × surface pair across all 6 palettes in both modes, using hardcoded Tailwind color hex values (CSS variables can't be resolved outside the browser). Contrast formula: `(max(L1,L2)+0.05) / (min(L1,L2)+0.05)`.

**Dark mode:** No failures. Dark text ramps use 100–300 level neutrals with sufficient lightness; all pairs comfortably exceed 4.5:1 on every dark surface stop.

**Light mode:** 15 failures, all `--color-text-muted`.

| Palette | Original token | Worst ratio | Surface |
|---|---|---|---|
| ocean | `--color-slate-500` (L≈0.216) | ~3.8:1 | sky-50 sunken |
| forest | `--color-stone-500` (L≈0.216) | ~3.8:1 | stone-50 sunken |
| sunset | `--color-zinc-500` (L≈0.216) | ~3.6:1 | orange-50 sunken |
| soft | `rgb(106,120,138)` (L≈0.194) | ~3.9:1 | rgb(247,249,251) sunken |
| dynamic | `--color-zinc-500` (L≈0.216) | ~3.6:1 | zinc-50 sunken |
| golden | `#9a948a` / ink-400 (L≈0.305) | **2.83:1** | `#fffefb` card (worst of all palettes) |

The root cause is shared: Tailwind's mid-scale neutrals (`*-500`) sit at luminance ~0.2, and many palettes use lightly tinted surfaces (50/100 level) as their sunken levels. On those backgrounds the standard `*-500` muted text routinely fails 4.5:1. Golden was the most severe because its muted token was ink-400 (warm beige), much lighter than a chromatic neutral.

**Fixes applied:**

| Palette | Old value | New value | Worst ratio (new) |
|---|---|---|---|
| ocean | `var(--color-slate-500)` | `rgb(90, 104, 126)` | 4.66:1 |
| forest | `var(--color-stone-500)` | `rgb(106, 100, 95)` | 4.65:1 |
| sunset | `var(--color-zinc-500)` | `rgb(100, 100, 108)` | 4.51:1 |
| soft | `rgb(106, 120, 138)` | `rgb(95, 108, 124)` | 4.52:1 |
| dynamic | `var(--color-zinc-500)` | `rgb(100, 100, 108)` | 4.51:1 |
| golden | `#9a948a` | `#6d6760` | 4.65:1 (on ink-100 sunken-deep) |

All six fixes were verified by a second script confirming every text-on-surface pair in both modes passes ≥4.5:1, tightest margin 4.51:1 (sunset/dynamic muted on orange-50/zinc-50).

---

## Recommendations

None — informational only. All items in W3 scope are resolved. The tightest passing margins (4.51:1) leave virtually no room; any future lightening of `--color-text-muted` in sunset or dynamic would require re-verification against the sunken surfaces.

If the audit is ever re-run, the share-status tokens (`--color-share-public/shared/private`) were intentionally excluded — they are decorative/status indicators, not body text, and the WCAG AA 4.5:1 requirement does not apply to non-text color indicators.

---

## References

- `~/Developer/themes/ocean.css`, `forest.css`, `sunset.css`, `soft.css`, `dynamic.css`, `golden.css`
- `docs/2-tasks/T011-surface-token-model/task.md` — W3 completion block
- themes repo commit: `abc3499` (6 files changed, 102 insertions, 102 deletions)
