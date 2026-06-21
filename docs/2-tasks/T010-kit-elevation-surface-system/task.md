# T010 — kit elevation & surface discipline

Status: planning

## Summary

Make the opinionated kit's **cards and other components read as lifted layers
that sit well on the theme surface ladder**, instead of looking flat and "stuck"
to the page — and tighten **which surface token each component uses for which
role**, which currently feels arbitrary. Two related workstreams (A elevation, B
surface discipline) sharing one design pass.

## Why — the measured gap

Driven by a side-by-side of the kons-ev reference app (the look we want to match)
against an evaluering screen built on this kit, both in dark mode. The mechanism,
measured from the live DOM:

| | kons-ev (rich) | my-react-shell kit (flat) |
|---|---|---|
| Card fill vs page | steps up in lightness **and** blue saturation (`#0f1620` → `#182230`) | steps in lightness only; on `soft` it is near-achromatic grey |
| Border | visible lighter border (`#2b3a4b`), 12px radius | 1px border, 8px radius |
| Accent | 4px colored **gradient top-stripe**, hue per card type | none — colour lives only in the icon |
| Shadow | soft ambient `0 8px 30px rgba(0,0,0,.45)` — card floats | `0 1px 2px rgba(0,0,0,.3)` — invisible on a dark page |

`PhiCard`/`StatCard` currently render `shadow-sm` (`0 1px 2px`); the dark
shadow-*token* opacities were already lifted in T004, but the shadow **geometry**
is too timid to register. (Ocean's dark palette has separately been retuned to the
kons-ev surface values — that closes the palette half of the gap; this task closes
the component half.)

## Workstream A — elevation

- Give cards (`PhiCard`, `StatCard`) and floating surfaces (popover/dropdown,
  dialog, toast) **real shadow geometry** in both light and dark, tuned per surface
  role — a soft default lift for cards, a stronger ambient shadow for prominent
  panels. Drive it off the existing `--color-shadow-*` tokens.
- Add an optional **accent affordance** to `PhiCard`/`StatCard` — a top stripe or
  left border mapped to a semantic hue (info/success/warning/danger or a palette
  accent) — so a card can carry identity the way kons-ev's stripes do. Opt-in
  prop, default off; non-breaking.
- Decide whether an explicit **elevation token** (e.g. `--shadow-card` /
  `--shadow-popover` as full box-shadow values, not just the colour) belongs in the
  shared `themes` contract or stays kit-local CSS. (Open — see Decisions.)

## Workstream B — surface discipline

- Audit every kit component for **which `--color-surface-*` token it uses for which
  role**. Usage today is inconsistent — some surfaces look picked ad hoc.
- Establish and document the intended ladder semantics:
  - `background-primary` — the page.
  - `surface-primary` — the default card / panel.
  - `surface-elevated` — floating chrome that lifts above the page (popover,
    dropdown, dialog).
  - `surface-secondary` — muted inset regions (e.g. table header, input wells).
  - `surface-tertiary` — accent / hover surface.
- Align components to the rule and document it in `docs/guides/theme.md` (surface
  ladder) and `docs/guides/component-kit.md`, so consumers reason about surfaces
  the same way.

## Out of scope

- The shadcn-bridge mapping (consumer wiring, strategy D6) — unchanged.
- Adding/removing/renaming `--color-*` tokens, **unless** Decision D below adds an
  elevation token; a pure value/geometry change needs no registry edits.

## Decisions (open)

- **D-A** Elevation as a shared `themes` token vs kit-local CSS. Token = shared
  with the Solid foundation (consistent elevation across both); kit-local = no
  ripple, but each ecosystem re-derives it. Lean: kit-local first, promote on
  rule-of-two.
- **D-B** Accent API shape on the cards (`accent="info" | "success" | …` semantic
  key vs a free colour vs a stripe/left-border variant).

## Verification

Visual, in light + dark across at least Ocean + Soft (the achromatic worst case):

- The new **`my-react-shell-theme-demo`** Surfaces page — cards on each surface
  rung, elevation legible.
- The existing **`my-react-shell-demo`** kit pages (`tables-cards`, etc.).

Both consume the library over the `link:` loop, so rebuild `dist/` (or run the
`rs:watch` sidecar) while iterating.

## References

- kons-ev (`~/Developer/kons-ev`) `.criterion-card` / `.completion-card` — the
  reference recipe (accent stripe `::before`, ambient panel shadow).
- `src/components/PhiCard.tsx`, `StatCard.tsx`, `components.css` — the kit cards.
- `themes/ocean.css` (retuned dark surfaces), `themes/contract.css` (shadow
  tokens), `docs/guides/theme.md`.
- T004 (component kit + the dark shadow-token opacity fix this builds on).
