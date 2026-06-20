# B001 — breadcrumb-dropdown-shadow

**Status:** open | **Branch:** main
**Filed:** 2026-06-20 — dogfood finding from evaluering's T029 (app-shell adoption),
where evaluering became the first real consumer of the `app-shell` module. Surfaced
by an adversarial review of the consumer diff and verified against shell source.

## Symptom

The breadcrumb leaf **sibling-switcher dropdown** panel (`.mrs-breadcrumbs__menu`,
the `DropdownMenu.Content` rendered by `ShellPageHeader`) appears **flat — no
drop-shadow** — in light and dark, in every shipped theme and every consumer. The
panel is otherwise correct: right surface colour, border, radius, text.

## Root cause

A **token-contract mismatch**: a colour-channel token is consumed as a complete
`box-shadow` value.

- `src/app-shell/app-shell.css` (≈ line 331):
  ```css
  .mrs-breadcrumbs__menu { box-shadow: var(--color-shadow-lg); }
  ```
- `--color-shadow-*` is declared as a **bare colour** by the contract:
  - `src/styles/base.css` declares the `--color-shadow-*` family (the contract).
  - Every shipped theme (soft / forest / ocean / sunset / dynamic) fills it with a
    colour, e.g. `--color-shadow-lg: rgba(0, 0, 0, 0.15)`.
- A bare colour is **invalid `box-shadow` syntax** (a `<shadow>` needs at least
  offset-x / offset-y lengths). The browser therefore **drops the declaration**, so
  the panel renders with no shadow.

The shell already uses the correct pattern elsewhere — `app-shell.css` (≈ line 399)
composes `box-shadow: 0 0 0 2px var(--color-focus-ring)` from a colour channel — so
this is a localized consumption bug, not a missing token. All consumers inherit it
because they all fill the documented colour-only contract correctly (evaluering
included; **no consumer-side fix is appropriate**).

## Fix options (shell-side — pick one)

1. **Compose the shadow in the rule** (smallest, keeps the token a colour channel as
   its `--color-*` name implies):
   ```css
   .mrs-breadcrumbs__menu { box-shadow: 0 4px 12px var(--color-shadow-lg); }
   ```
2. **Redefine the token family to carry full box-shadow values** (rename
   `--color-shadow-*` → `--shadow-*` across `base.css` + the 5 theme palettes, and
   update every consumer of the rule). Larger blast radius; only worth it if other
   surfaces also want full-shadow tokens.

Recommendation: **option 1** — local, no contract churn, and it matches the
`--color-focus-ring` precedent already in the same file.

## Affected

- `src/app-shell/app-shell.css` — `.mrs-breadcrumbs__menu` rule (≈ line 331).
- Only if option 2: `src/styles/base.css` + the 5 theme palettes + every
  `var(--color-shadow-*)` consumer.

## Notes

- Severity is low (cosmetic elevation on one transient panel); no functional or a11y
  impact. Filed so the contract decision is deliberate rather than implicit.
- Verification: confirmed `--color-shadow-lg` is a bare colour under both
  `.theme-evaluering-{light,dark}` and all shipped shell themes; confirmed the panel
  is reachable (it is the breadcrumb leaf switcher, newly exercised by evaluering).
