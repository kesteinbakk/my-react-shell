# T018 — complete-component-surface

**Filed 2026-06-23 · Status: planning**

Re-found my-react-shell as a **complete, opinionated support and starting base for
React projects** — the React counterpart to what the SolidJS `foundation` is for
Solid — and **drop shadcn entirely**, shipping the whole component surface ourselves
on Radix + the theme tokens so a new project starts fast from one front door.

---

## Why

Agents building on the library (evaluering) get confused at the boundary between two
component sources. The reported symptom: two `Badge`s with the same name and different
APIs —

- **Shell `Badge`** (`my-react-shell/components`) — `tone`-based: `<Badge tone="success" dot>`.
- **shadcn `Badge`** (`@/components/ui/badge`) — `variant`-based: `<Badge variant="secondary">`.

That collision is one instance of a structural cost in the old "menu of modules,
primitives stay the consumer's" model: for every component an agent must decide *which
source*, and where both sources ship the same name the two APIs clash.

Two findings turned this from "document it better" into "change the model":

1. **shadcn was never a dependency of this library.** Every interactive kit component
   already builds **directly on `@radix-ui/*`** + `class-variance-authority` + `mrs-`
   CSS + the `--color-*` tokens. shadcn appears only in comments and as the
   *consumer's* copy-in source for un-opinionated primitives. shadcn *is* Radix + cva +
   Tailwind — exactly the idiom we already use. So "shadcn vs Radix" is a false choice;
   we are 100% Radix already.
2. **The "consumer owns the primitive source" value is one our consumers don't cash
   in.** shadcn's whole pitch is "you own and edit the component source." These
   consumers are largely agent-built apps under `~/Developer/`; they almost never
   hand-edit a Button's internals. They pay the collision + which-source cost for a
   benefit they don't use.

**User decision (2026-06-23):** go opinionated and complete. *"I do not want 'the
consumer owns their primitive source'. I want us here to pick and prepare, so building
new projects goes fast. Do we really need shadcn?"* — No. Ship everything ourselves.

---

## The decision

- **Thesis:** my-react-shell is a **support + starting base for React projects**, the
  way `foundation` is for Solid. Opinionated, batteries-included, modular.
- **Drop shadcn.** Consumers add no shadcn, keep no `components/ui/`, run no
  `npx shadcn add`, maintain no `components.json`.
- **Ship the full component surface** from `my-react-shell/components`: the existing
  opinionated composites **plus** the un-opinionated primitives, all in the same Radix +
  `--color-*` + `mrs-` idiom.
- **Unify the prop convention:** `tone` = semantic color; `variant` = structural style.
- **Re-found the docs:** delete `strategy.md` (the `Dx` decision/rule log) and rewrite
  `concept.md` to the new thesis; purge every dangling reference.

### What dropping shadcn buys

1. **No cssVar bridge.** Today consumers hand-roll CSS mapping shadcn's `--background`
   / `--muted-foreground` to our `--color-*` contract (the old strategy doc itself
   called this un-shippable per-app latitude and a drift source). Our primitives render
   against `--color-*` directly — the bridge disappears.
2. **No name collisions.** One `Badge`, one `Button`. The evaluering confusion is gone
   at the root.
3. **No "which source?" decision.** Everything imports from `my-react-shell/components`.
4. **One convention** across primitives and composites.
5. **Less consumer setup.** Tailwind becomes the consumer's choice for *their own*
   markup, not a prerequisite to render a button.

### The cost (accepted)

- We own ~12–15 more small, stable components.
- We lose `npx shadcn add <exotic>` for free; anything exotic we build on Radix
  ourselves (same idiom) and rule-of-two pulls it into the kit.

---

## Scope

### W1 — Doc re-founding *(done in the filing turn)*

- **Delete** `docs/strategy.md`.
- **Rewrite** `docs/concept.md` to the support/starting-base thesis.
- Create this task doc; reserve T018 in the index.

### W2 — Reference purge (live docs only)

Remove every dangling `strategy.md` / `Dx` / "use shadcn directly" / "consumer owns
primitives" reference and reconcile each doc to the new model:

- `CLAUDE.md` — the project charter block, the stack/auth/UI sections, the "How
  consumers use my-react-shell" snippet (drop the shadcn import line).
- `README.md`
- `docs/demo.md` — the `/components` route is no longer "consumer-owned shadcn
  primitives"; it becomes a kit-owned primitives showcase.
- `docs/guides/distribution-model.md` — `Dx` cites.
- `docs/guides/theme.md` — **delete the shadcn-bridge section** ("Using these tokens
  with shadcn/ui").
- `docs/specifications/api-reference.md` — drop "primitives are NOT shipped — use
  shadcn directly"; document the new primitives.

> Point-in-time records are **not** rewritten: the historical `docs/2-tasks/T0xx/task.md`
> files and `docs/4-reports/status/2026-06-17-away-report.md` keep their `Dx` references.

### W3 — Build the primitive set

Ship the un-opinionated primitives in the kit idiom. Two implementation tiers:

- **Plain element + cva + `mrs-` CSS** (no new peer): `Button`, `Input`, `Textarea`,
  `Label`, `Card`, `Separator`, `Skeleton`.
- **Radix-wrapped** (new optional peers, approval-gated at install — same pattern as
  the existing Radix peers): `Checkbox`, `Switch`, `RadioGroup`, `Tooltip`, `Tabs`, a
  general `Dialog`. Plus **expose** the `DropdownMenu` and `Popover` we already wrap
  internally (PhiCard / ColorPicker) as first-class exports.

Each ships its `…Props` type, a `components.css` block, an `index.ts` export, an
api-reference row, and a demo section.

### W4 — Convention unification (`tone`)

Rule: **`tone`** carries semantic color (`neutral` · `info` · `success` · `warning` ·
`danger`); **`variant`** carries structural/emphasis style only.

- `Alert` (`variant: info/success/warning/danger`) → **`tone`**. Pure semantic; clean
  rename. **Breaking.**
- `ConfirmDialog` (`variant="danger"`) → **`tone="danger"`**. **Breaking.**
- `ActionButton` — **needs a design decision (see open questions).** Its current
  `variant` (`neutral/primary/secondary/success/warning/danger/info`) *mixes* emphasis
  (`primary`/`secondary`/`neutral`) with semantic color — not a clean rename.
- Already correct (keep): `Badge`, `StatCard`, `Toast` use `tone`. `Collapsible` /
  `Accordion` use `variant` for structural style — correct, leave.

### W5 — Demo (`my-react-shell-demo`)

- The `/components` route stops being "consumer-owned shadcn primitives" and becomes a
  **kit primitives** showcase (Button/Input/Checkbox/…), imported from
  `my-react-shell/components`.
- New/changed components reach their kit pages (`InputsActionsPage`, etc.) with their
  scroll-spy `icon` keys registered in both `ICONS` and `EMOJIS` (`shell-config.tsx`).

### W6 — Consumer migration (`evaluering`) — separate consumer task

- Remove `components/ui/` (shadcn) and `components.json`.
- Repoint imports to `my-react-shell/components`.
- Delete the hand-rolled shadcn cssVar bridge.
- Migrate the `tone`-rename breakages (`Alert`, `ConfirmDialog`, `ActionButton`).
- File as an evaluering-side task; it depends on this shipping + a tag bump.

---

## Open decisions (need a call before/while building)

1. **Rollout breadth** — complete primitive set in one pass, or seed the always-needed
   ones (`Button`, `Input`, `Textarea`, `Label`, `Checkbox`, `Switch`, `Tooltip`,
   `Card`) and let rule-of-two pull the rest? *(User leaning: go full now.)*
2. **`Button` API** — mirror shadcn's API (`variant: default/destructive/outline/
   secondary/ghost/link` + `size`) for near-mechanical consumer migration, **or** impose
   our `tone`/`variant` convention and rewrite call sites? Trade-off: migration cost vs
   convention purity.
3. **`ActionButton`** — keep `variant` as a pure *emphasis* axis and drop the semantic
   values, **or** split into `variant` (emphasis) + `tone` (semantic)? It's the one
   component where the two axes are genuinely entangled.
4. **`tone` rename is breaking** — confirm we migrate evaluering in lockstep (link-loop
   dev sees the break immediately; the git-dep/prod build lags until a tag bump).

---

## Ground truth (verified 2026-06-23)

- Radix imports across the kit: `Accordion`, `Collapsible`, `ConfirmDialog`,
  `UserPreferences` (Dialog), `Select`, `ColorPicker` (Popover), `PhiCard`
  (DropdownMenu). No `components/ui/` import anywhere; "shadcn" only in comments.
- `package.json`: Radix packages are **optional peers** already; no shadcn dependency.
- Semantic-color prop split today: `tone` in `Badge`/`StatCard`/`Toast`; `variant` in
  `Alert`/`ActionButton`/`ConfirmDialog`. Color **values** are already uniform
  (`danger`/`success`/`warning`/`info`); only the prop *name* splits.

## References

- evaluering's two-Badge confusion note (the trigger).
- The retired `strategy.md` decisions this supersedes/folds: the kit boundary
  ("opinionated composites only"; "primitives stay the consumer's"), "no registry", and
  the shadcn cssVar bridge.
- The SolidJS `foundation` (`~/Developer/zingularis/foundation`) as the model for a
  complete, opinionated base.
