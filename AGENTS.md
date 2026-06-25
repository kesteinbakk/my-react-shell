# AGENTS.md — my-react-shell
> Orientation for AI agents. Full detail in ~/Developer/CLAUDE.md, ./CLAUDE.md, and ./docs/concept.md.


## This Project
- **Role:** `my-react-shell-master` — React counterpart to SolidJS `foundation`; opinionated, complete base for React + Convex apps
- **Distribution:** tag-pinned GitHub git-dep (`import { … } from 'my-react-shell'`); changes ripple to all consumers on version bump
- **Stack:** React 19 + Vite + TypeScript 6 + Radix (no shadcn) + TanStack Router (dev-harness only)
- **Modules** (each independently importable): `theme`, `providers`, `auth`, `i18n`, `icons`, `components`, `app-shell`
- **No hardcoded user-facing text** — every visible string must be a prop or mandatory consumer prop
- **API reference:** `docs/specifications/api-reference.md` ships inside the package; **must be updated in the same change as any public API change**
- **`dist/` is precompiled and committed;** pre-commit hook auto-rebuilds dist/ when lib source is staged
- **Demos** live in `my-react-shell-demo` (never in this repo); never fake the product in demos
- **Theme tokens** shared with SolidJS `foundation` via the `themes` package — read `theme-tokens` skill before any token work
- **Dev server:** owned by user; never run `pnpm dev` or the `rs:watch` sidecar
- **Release:** `pnpm release <bump> --push` (auto-cascades themes); always an agent responsibility

## Concept
- Opinionated, complete support and starting base for React + Convex apps under ~/Developer/
- Same role as SolidJS `foundation` but for React — solve once, propagate everywhere via dependency
- Built on Radix (not shadcn); components share one `tone`/`variant` convention
- Semantic tokens only; renders correctly in light + dark across all palettes
- **Modules:**
  - `theme` — `--color-*` contract + React provider
  - `providers` — Convex client
  - `auth` — seam + Convex Auth default
  - `i18n` — `t()` seam + typed keys
  - `icons` — glyph↔emoji toggle
  - `components` — full surface
  - `app-shell` — optional chrome
- Each module is independently importable and self-contained; heavy optional deps behind sub-paths
- Distributed as tag-pinned GitHub git-dep with committed `dist/` — zero-config install, no registry

## Input Auto-Save UX Rule
- **No manual Save buttons/indicators**: Do not implement manual Save/Submit buttons, or layout-shifting status labels for input fields on settings/config screens. Use debounced auto-saves instead.
- **Visual saveStatus feedback**:
  - Bind inputs (`Input`, `Textarea`, `InputField`, `Select`) to the `saveStatus` prop: `'idle' | 'pending' | 'saving' | 'saved' | 'error'`.
  - On save success (`'saved'`), the border transitions gradually to green (using `1000ms` fade).
  - When the user starts typing/editing again, the status instantly clears back to `'idle'` (using `120ms` transition).
  - **Shared Hook / Multi-Field Isolation**: If multiple inputs share a single `useDebouncedAutoSave` hook, you must NOT pass `saveStatus={state}` directly to all inputs (doing so makes them all flash green together when a single change saves). Instead, track a `lastModifiedField` state mapping to the edited field's key (set in `onChange`), and bind dynamically: `saveStatus={lastModifiedField === fieldKey ? state : 'idle'}`.
- **Toasts rule**: When auto-save fails, trigger a permanent/persistent error toast (`toast.error`). Successful saves must NEVER display a success toast.
- **Exceptions**: Entity creation dialogs/modals (e.g. "Invite Member", "Create Project") are transactional and retain their Submit/Create buttons.
