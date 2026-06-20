# T004 — component-kit (opinionated React component kit)

**Status:** planning · **Filed:** 2026-06-20

## What

Add an **opinionated component kit** to my-react-shell — a set of React components
that bake real design / layout / behavior decisions on top of shadcn/Radix
primitives and render against our semantic theme tokens (light + dark, every
palette). Shipped as an optional module at the sub-path **`my-react-shell/components`**,
mirroring `@foundation/kit` (the SolidJS `foundation` kit) but for the React era.

**Scope line (owner rule):** the kit ships **only components that require an
opinion** — a design, layout, or behavior decision on top of the primitive.
Components that work out of the box from shadcn (Button, Input, Checkbox, Label,
Switch, Separator, plain Tabs/Dialog/Select primitives, Tooltip, Popover) are **not
shipped** — they stay consumer-owned and are shown only as **examples in the demo**,
exactly as the demo's `ComponentSections` does today.

## Why

This reverses a standing decision. Today my-react-shell deliberately ships **no UI
component kit** — concept.md "What it is NOT" ("Not a component library… ships no
Button/Dialog/Table"), strategy **D3** ("no UI components, no registry"), **D8** (the
modular pivot dropped the foundation-composite port), and CLAUDE.md ("does not ship a
UI component kit"). The owner now wants the opinionated layer as a real capability so
a consumer app gets foundation-grade composites (alerts, dialogs, structured cards,
form fields, tables) out of the box instead of rebuilding them per app, while still
using plain shadcn directly for the un-opinionated primitives.

Precedent already exists: the **`app-shell` module (D10, T003)** ships real React
components behind a sub-path with **Radix** as an optional peer. The component kit
follows that exact, sanctioned pattern — one more opt-in module, not a charter break
back to "everything-above-shadcn."

This also completes issue #3 from the theme review: the `-strong` semantic text
tokens just landed are the correctness substrate, and a shipped `<Alert>` consumes
them so consumers can't get the soft-alert contrast wrong by hand.

## Architecture (proposed — owner to confirm)

- **Build on Radix + CVA + tokens, self-contained.** Each kit component is built on
  the relevant **Radix** headless primitive (optional peer, already incoming via
  app-shell) + **class-variance-authority** variants + semantic token classes
  (`bg-(--color-…)`), matching shadcn's conventions and aesthetic. "Based on shadcn"
  = the same Radix+Tailwind+CVA foundation and variant API, **not** a copy-in
  registry (D3 keeps us out of registry-hosting). The kit is self-contained: it never
  imports the consumer's `@/components/ui`.
- **Sub-path + optional peers.** Exported at `my-react-shell/components`; peers
  (`@radix-ui/*` per component, `class-variance-authority`, `tailwind-merge`, `clsx`)
  are **optional** and behind the sub-path, so the barrel/theme core stays
  dependency-light (same isolation rule as Convex D9 and the app-shell router D10).
- **Themed only via tokens.** No hardcoded colors; renders in every palette, light +
  dark. Uses the semantic contract incl. the new `secondary` (neutral soft) and
  `-strong` (legible-on-tint) tokens.
- **Strings via props.** Components take display strings via props (no hard i18n
  dependency), like the app-shell.

## Proposed initial component set

Classified from foundation's kit (opinionated → **ship**; thin/out-of-box →
**demo-only**). Boundary is the owner's to confirm.

**Ship (opinionated composites):**

- *Feedback:* `Alert` (inline, semantic variants + dismiss), `ConfirmDialog`
  (+ imperative `confirm()`), `Toast` (store + provider/portal + `toast.success/…`),
  `InfoBox`/`Callout`, `EmptyState`, `Spinner` set (page/section/inline).
- *Data display:* `Card` (structured header/content/footer), `Badge` (semantic),
  `Chip` + `ChipGroup`, `Avatar` + `AvatarGroup`, `Table` (sortable/striped).
- *Forms (opinionated wrappers):* `InputField` (label + description + error + optional
  autosave), `Select` (opinionated), `SegmentedControl`.

**Demo-only (out of the box from shadcn — examples, not shipped):** Button, Input,
Textarea, Checkbox, RadioGroup, Switch, Label, Separator, Tabs, Dialog primitive,
Select primitive, Tooltip, Popover, DropdownMenu, Slider.

## Demo showcase

- A new **Kit showcase page/route** in `my-react-shell-demo` (e.g. `pages/KitPage.tsx`
  + a `router.tsx` route + a landing card in `HomePage` + a `shell-config` nav entry),
  one section per shipped component, mirroring the existing `ComponentSections` /
  `PaletteReference` pattern and the demo's card-landing + router + nav structure.
- The existing `ComponentSections` (out-of-box shadcn examples) stays as the
  "plain shadcn" reference; the new page is the **opinionated kit** gallery.
- Each kit component is shown across palettes in light + dark.

## Docs & commands to change (the charter update)

- `concept.md` — rewrite "What it is NOT → Not a component library" to "ships an
  optional opinionated kit of composites; un-opinionated primitives stay consumer-owned."
- `strategy.md` — new decision **D11** (ship the opinionated component kit; supersedes
  D3's "no UI components", extends the D8 "deferred composites" clause, follows the
  D10 sub-path/optional-peer pattern).
- `CLAUDE.md` (project) — revise "does not ship a UI component kit" + the stack/UI
  lines; add the kit to "How consumers use my-react-shell."
- `README.md` — add the kit to the module list.
- `docs/guides/component-kit.md` (new) — what it ships, the opinionated/out-of-box
  line, how to wire it, theming, BYO; plus a line in the module-authoring guide.
- *("commands"): confirm whether this means the project CLAUDE.md guidance (covered
  above) or something else, e.g. skills/slash-commands — flagged as an open decision.*

## Dependencies (approval-gated at install)

Per-component Radix primitives (`@radix-ui/react-*`), `class-variance-authority`,
`tailwind-merge`, `clsx` — all **optional peers**. Each `pnpm add` is gated on
explicit owner approval at install time (root CLAUDE.md → Mandatory User Approval).

## Sequencing

- Builds on the just-landed theme work (secondary neutral, `-strong` tokens).
- Coordinates with **T003 app-shell** (shares Radix; align CVA/variant conventions and
  the optional-peer packaging so the two modules are consistent).
- Suggested first component: **`Alert`** (where this thread started, and it exercises
  the semantic `-bg`/`-border`/`-strong` tokens end to end).

## Phases (proposed)

1. **Charter + scaffold** — docs/strategy/CLAUDE update (D11), module skeleton at
   `src/components/`, packaging (`exports`, optional peers, lib emit), CVA+token+merge
   utils, the demo Kit page shell. Ship `Alert` as the first component + its demo section.
2. **Feedback set** — `ConfirmDialog` (+ `confirm()`), `Toast` (+ provider), `InfoBox`,
   `EmptyState`, `Spinner` set; demo sections.
3. **Data display** — `Card`, `Badge`, `Chip`/`ChipGroup`, `Avatar`/`AvatarGroup`,
   `Table`; demo sections.
4. **Forms** — `InputField`, `Select`, `SegmentedControl`; demo sections.
5. **Guide + polish** — `docs/guides/component-kit.md`, cross-palette light/dark
   verification in the demo, a11y pass.

## Open decisions (owner)

1. **Sub-path name:** `my-react-shell/components` (proposed) vs `/kit` (echoes
   foundation) vs `/ui`.
2. **Build approach:** Radix + CVA + tokens, self-contained (proposed) vs a thinner
   "style shadcn copies" approach.
3. **Ship boundary:** confirm the ship vs demo-only split above (esp. Table, Select,
   InputField autosave scope, Toast's provider requirement).
4. **"Commands":** what besides CLAUDE.md/docs does "change the commands" cover?

## References

- Foundation kit: `~/Developer/zingularis/foundation/src/kit/` (feedback/Alert,
  ConfirmDialog, toast, Modal; shared/Card, Chip, Badge, Avatar, Table; forms/InputField,
  Select, SegmentedControl) — the opinionated/thin classification this plan follows.
- Precedent: `docs/1-proposals/app-shell-module.md` + strategy **D10** (component module
  behind a sub-path with optional Radix peer); **D9** (optional/heavy peers isolation).
- Supersedes/amends: concept "What it is NOT", strategy **D3** / **D8**; CLAUDE.md UI lines.
- Theme substrate: the secondary-neutral + `-strong` token work (this session).
