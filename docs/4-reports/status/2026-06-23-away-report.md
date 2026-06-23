# Away report — 2026-06-23 — T018 complete-component-surface

Autonomous run (`/independent-work`). Branch `claude/zen-shannon-7abaec` (9 commits).

## Completed — the shell library is done

- **W1 — doc re-founding.** Deleted `docs/strategy.md`; rewrote `docs/concept.md` to the
  *support & starting base for React* thesis (React counterpart to the SolidJS
  `foundation`); created the T018 task doc.
- **W2 — reference purge.** Swept every live doc — `CLAUDE.md`, `README.md`, `demo.md`,
  `guides/theme.md` (removed the shadcn cssVar-bridge section), `guides/distribution-model.md`
  (purged Dx cites), `specifications/api-reference.md`, the skill card. Zero dangling
  `strategy.md`/`Dx`/shadcn-direction refs remain in live docs. *(`f7f33a3`)*
- **W4 — tone/variant cleanup.** Canonical `Tone` + `TONE_COLOR` (`src/components/tone.ts`);
  `Alert`/`ConfirmDialog`/`ActionButton` `variant`→`tone` (type renames; dropped unused
  `secondary`); `Toast` follows `AlertTone`; `Badge` gained `primary`; `StatCard`/`PhiCard`
  on the shared `Tone`; `Collapsible`/`Accordion` keep `variant` (structural). *(`7e78155`)*
- **W3 — the COMPLETE primitive surface (done).**
  - No new deps: `Button` (variant×tone×size via a CSS-var matrix), `Input`, `Textarea`,
    `Label`, `Card` (+subparts), `Separator`, `Skeleton`, `Dialog`, `Popover`, `DropdownMenu`.
    *(`dbc63c7`, `5839f39`)*
  - **Dependency approved by user → built:** `Checkbox` (tri-state), `Switch`, `RadioGroup`,
    `Tooltip` (self-contained Provider), `Tabs`. Five new optional `@radix-ui/*` peers added
    (peer + dev, like the existing ones). *(`c854281`)*
  - Every component on Radix + theme tokens, `mrs-` CSS, a11y, light+dark. api-reference in
    lockstep; `dist/` rebuilt each step. **Lib typecheck clean throughout; every CSS
    `--color-*` / `--mrs-elevation-*` token validated against the contract.**

## Remaining — consumer migrations (BLOCKED on landing T018 on main)

The user asked for the demo + evaluering migrations. They are **gated on the new shell
reaching the consumers**, and that integration is not safe to do blind autonomously:

- **Both consumers link to the *primary tree* (`link:../my-react-shell` = `main`).** Until
  T018 is on `main`, migrating their source to the new API (`variant`→`tone`, new imports)
  would make them **red against the old shell they currently resolve** — i.e. shipping a
  broken state. So the migrations can only be done coherently *after* T018 lands on `main`.
- **Landing T018 on `main` is a conflict-heavy merge.** Branch is 9 ahead; `main` is 6
  ahead with concurrent **T019** (a new `CountPill` + `Badge` span-attrs) that edited the
  **same files** this task did: `Alert.tsx`, `Badge.tsx`, `components.css`, `index.ts`,
  `api-reference.md`, `theme.md`. Resolving those conflicts means reconciling another
  agent's in-flight feature — best done with you aware (and ideally once T019 settles),
  not by me blind. The primary tree also holds a third session's uncommitted
  `app-shell.css`.

**Recommended integration order:** (1) merge/reconcile T018 + T019 onto `main`
(coordinate — both touch Badge/Alert/index/css/api-ref); (2) `pnpm release` a shell tag;
(3) migrate consumers against it.

### Migration plan (ready to execute once the shell is on main / released)

- **my-react-shell-demo (W5).** `tone` rename: **13** `variant=` usages on
  `Alert`/`ActionButton`/`ConfirmDialog` → `tone=` (no old type-name refs). Then the W5
  showcase: add kit pages/sections for the new primitives (Button, Input, Textarea, Label,
  Card, Separator, Skeleton, Dialog, Popover, DropdownMenu, Checkbox, Switch, RadioGroup,
  Tooltip, Tabs) + register their scroll-spy icons in `shell-config.tsx`; convert the
  `/components` route from shadcn examples to kit primitives. Verify by temporarily
  repointing `node_modules/my-react-shell` at this worktree, then `pnpm typecheck`.
- **evaluering (W6).** Small: **2** `variant=`→`tone=` on renamed comps. Large: **drop
  shadcn** — `components.json` + `src/components/ui` + **68 files** importing
  `@/components/ui`, plus the cssVar bridge in `src/index.css`. Repoint those imports to
  `my-react-shell/components` and rewrite props to our convention (e.g. shadcn
  `Button variant="destructive"` → `Button tone="danger"`). This is a **major** migration
  that warrants its own evaluering-side task and careful per-file testing — not a blind
  sweep. Needs the new `@radix-ui` peers installed in evaluering for any Checkbox/Switch/
  Tooltip/Tabs/RadioGroup it adopts.

## Concerns found mid-work

- **`primary` lacks a tint token set** (no `-bg`-paired `-strong`/`-border`). Badge
  `primary` renders solid; Button's soft/outline/ghost use `--color-primary` as tint-fg
  (legible, not `-strong`-backed). Add `--color-primary-strong`/`-border` to the `themes`
  contract if a softer primary is wanted.
- **The `my-react-shell` skill card (`.claude/skills/.../SKILL.md`) is stale again** — a
  concurrent session (T019) overwrote my W2 update, so it once more says "ships only
  opinionated composites — not primitives" and lists CountPill. It's gitignored
  (environment-local) and will keep churning until T018+T019 settle; the shipped
  api-reference is correct. Re-sync it after integration.
- `pnpm typecheck` (tsc -b, includes the harness) shows 2 pre-existing errors from the
  git-ignored `src/routeTree.gen.ts` (dev-server-generated). Library typecheck is clean.

## Suggested cleanup

- `ConfirmDialog` still renders its own `mrs-dialog__btn` buttons; could use `<Button>`
  now that it ships (cosmetic; left as-is).

## Dev env / file changes

- **Dependencies added (user-approved):** `@radix-ui/react-checkbox`,
  `@radix-ui/react-switch`, `@radix-ui/react-radio-group`, `@radix-ui/react-tooltip`,
  `@radix-ui/react-tabs` — added to the shell's `devDependencies` *and* `peerDependencies`
  (optional), with `pnpm-lock.yaml` updated. No env vars, no `.env*` edits, no deploys, no
  dev servers started. Nothing pushed.

## Recommended next step

Reconcile T018 + T019 onto `main` (coordinate the Badge/Alert/index/css/api-ref overlap),
release a shell tag, then run the migration plan above (demo first — small; evaluering's
drop-shadcn as its own task).
