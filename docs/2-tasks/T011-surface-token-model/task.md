# T011 — mode-consistent surface-token model

Status: finished

## Outcome (what shipped)

**Decision (user, 2026-06-21): the role-clear redesign with TWO sunken levels, full
migration now.** The surface contract is rebuilt to a mode-consistent ladder:

| New token | Replaces | Role |
|---|---|---|
| `--color-surface-primary` | (kept) | card / panel |
| `--color-surface-raised` | `surface-elevated` | popovers, dropdowns, dialogs, toasts (above the card) |
| `--color-surface-sunken` | `surface-secondary` | wells, inputs, table headers, neutral notes, chips (below the card) |
| `--color-surface-sunken-deep` | `surface-tertiary` | deeper recess — filled badges, avatars, nested wells, hover-on-sunken |

Direction is now identical in both modes: `raised` reads above the card (lighter in
dark; pure white over a hair-off-white card + shadow in light), `sunken*` read below
it (darker than the card in both modes). Two sunken levels were kept (not one)
because foundation uses two distinct recessed tones in one element; the user noted
`Toggle3DButton` is unused and that breaking foundation is acceptable ("I can fix
misses there"), so foundation was migrated by a straight token rename, best-effort.

Landed in:
- **`themes`** — `contract.css` (new role tokens + doc) and all six palettes
  (`ocean`/`forest`/`sunset`/`soft`/`dynamic`/`golden`), light + dark, mode-consistent;
  `dynamic` lifted off pure `#000` (page now `rgb(9,9,11)`); light cards nudged a hair
  off-white so the white `raised` plane separates.
- **my-react-shell** — `styles/base.css`, `components/components.css`,
  `app-shell/app-shell.css`, `i18n/MissingTranslationsOverlay.tsx`, harness
  `routes/index.tsx`; `dist` rebuilt; `docs/guides/theme.md` (ladder + shadcn bridge),
  `docs/specifications/api-reference.md` (Surfaces & elevation), `docs/strategy.md` (**D15**).
- **Demos** — `my-react-shell-demo` `PaletteReference` `PALETTE_GROUPS` + shadcn bridge;
  `my-react-shell-theme-demo` `SurfacesPage` (new tokens + a both-modes ladder, W4) +
  shadcn bridge.
- **SolidJS foundation** — token rename across ~31 files + `themes/base.css` utility
  classes + a `colors.ts` comment; `tsc` green.

**W3 — done.** The dark-accent desaturation pass (~20pp on ocean/forest/sunset/golden;
soft/dynamic were already calibrated) and the full per-token WCAG AA audit (15 light-mode
`--color-text-muted` failures fixed across all six palettes; no dark-mode failures) were
completed in `themes` (commit `abc3499`). Audit report:
[`docs/4-reports/reviews/2026-06-21-t011-w3-wcag-desaturation-audit.md`](../../4-reports/reviews/2026-06-21-t011-w3-wcag-desaturation-audit.md)
— it had been stranded on branch `claude/stoic-mclaren-ce5ad2` and is now restored to main.
With W1/W2, the `dynamic` off-black fix, and the W4 demo upgrade, **all of T011 is
complete.** The consumer-side counterpart — auditing evaluering's *own* colours (score
scale, shadcn bridge, hardcoded) — is filed as evaluering **T051**.

---


## Summary

Revisit the **semantic surface-token contract itself** (in the shared `themes`
package) so depth is **mode-consistent and role-clear** in both light and dark.
This is the contract-level follow-on to **T010** (kit elevation & surface
discipline), which fixed kit-local elevation geometry and the card accent against
the *existing* ladder; verifying T010 on the new `my-react-shell-theme-demo`
surfaced structural flaws in the ladder the kit sits on.

See **T010** (`docs/2-tasks/T010-kit-elevation-surface-system/task.md`) for the
elevation-geometry + accent work and the current ladder documentation. T010
deliberately kept its changes kit-local (decision D-A) and did **not** touch the
shared `themes` contract — that contract is this task's scope.

## Why — what the theme-demo verification found

Measured live on the `my-react-shell-theme-demo` Surfaces page, light + dark:

1. **Light↔dark inversion (the headline).** `surface-secondary` / `surface-tertiary`
   are documented as recessed "muted inset / well within a card", and they behave
   that way in **light** (Ocean: card `#ffffff`, secondary sky-50, tertiary sky-100
   — darker than the card ✓ recessed). In **dark** they invert: card `#172230`,
   secondary `#243240`, tertiary `#2d3d4e` — **lighter** than the card, i.e. raised,
   not recessed. The same token means "below the card plane" in light and "above it"
   in dark, so a well/input built on it reads inset in light and popped in dark.
2. **`surface-elevated` is indistinct in light.** In light it equals
   `surface-primary` (both `#ffffff`), so a popover/dialog has no colour separation
   from a card — only shadow, and the light card shadow is `0 1px 2px rgba(0,0,0,.05)`,
   effectively invisible. Light mode relies on shadow for depth, so this is the worst
   case.
3. **`dynamic` palette uses a pure-`#000` base** — OLED smear/halation, and no room
   to recess a well below the base.

## The conventions this should follow (researched)

- **Direction flips by mode.** Dark: raised = lighter (Material 3 white tonal
  overlays on a `#121212` base; shadows secondary). Light: raised = shadow (can't go
  lighter than white). Apple HIG: base vs elevated background.
- **Recessed inverts the rule.** Wells/inputs/content go *darker* than the card in
  dark, inset in light — Atlassian ships `surface.sunken` for exactly this.
- **Radix Colors** is the cleanest "which token does which job" reference: a stepped
  scale with explicit roles (app bg → subtle/sidebar/code → component → hover →
  active → borders → solid → text) that steps the **same** direction in both modes.
- **Caps & hygiene.** ~5–6 perceptible elevation levels; a semantic alert is a
  same-plane colour **tint**, not an elevation step; avoid pure `#000`; desaturate
  dark accents ~15–25%; keep text ≥ 4.5:1 on **every** surface in **both** modes.

## Workstreams

- **W1 — decide + implement a mode-consistent surface model.** Recommended: an
  Atlassian/Radix-style role set — `background` → `surface` (card) → `surface-raised`
  (popover/dialog/overlay) → `surface-sunken` (wells/inputs) — plus hover/active as
  interactive *states*, not depth. Wells go **darker** in dark, inset in light, in
  every palette. (Lighter-touch alternative: keep today's names and only flip the
  dark `surface-secondary/tertiary` to go darker than the card.)
- **W2 — light-mode elevation.** Differentiate `surface-raised`/elevated from the
  card (stronger shadow, and/or a slightly greyer base so white cards pop); make
  shadow carry depth where lightness can't.
- **W3 — palette-wide colour fixes** across all six palettes (`ocean`, `forest`,
  `sunset`, `soft`, `dynamic`, `golden`): lift `dynamic` off pure `#000`; desaturate
  dark accents ~15–25%; WCAG 4.5:1 text-on-every-surface audit in both modes.
- **W4 — demo upgrade.** In `my-react-shell-theme-demo`, show the light + dark
  ladders side by side (the inversion becomes self-evident) and add a raised-vs-sunken
  row.

## Cross-project / approval flags

- This is **shared `themes`** work → it **ripples to the SolidJS `foundation`** (D13)
  on its next themes-tag bump. The user chose to darken Ocean knowing this; a contract
  change is larger and needs an explicit decision.
- A token **add / rename** (e.g. introducing `surface-raised` / `surface-sunken`)
  must reach every consumer's CSS barrel + theme registry, the demo's
  `PaletteReference` `PALETTE_GROUPS`, and on the Solid side its `THEME_NAMES`
  validator / translation keys — see the `theme-tokens` skill (the cross-consumer
  change workflow). A pure value change (the lighter-touch alternative) needs none of
  that.
- **W1 needs a user decision** (full role-set redesign vs minimal dark-inset flip)
  before implementation — both carry foundation ripple.

## Out of scope

- Kit-local elevation geometry and the card accent affordance — **done in T010**.
- The shadcn-bridge mapping (consumer wiring, D6).

## Verification

The new `my-react-shell-theme-demo` Surfaces page (light + dark ladders, raised vs
sunken) across every palette, plus the `my-react-shell-demo` kit pages. Both consume
the library over the `link:` loop; the darker-Ocean dev-loop symlink
(`my-react-shell/node_modules/themes` → `~/Developer/themes`) is what makes a local
`themes` edit visible — re-establish it if a `pnpm install` reverts it.

## References

- **T010** — kit elevation & surface discipline (the geometry + accent half; this
  task is the contract half).
- Theme-demo measured values above; `themes/contract.css`, the palette `.css` files,
  `themes/palettes.json`; `docs/guides/theme.md` (**The surface ladder**).
- Material 3 elevation, Atlassian `surface.sunken`, Radix Colors scale, Apple HIG
  Dark Mode (conventions, gathered 2026-06-21).
