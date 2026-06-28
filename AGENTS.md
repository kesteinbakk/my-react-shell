# AGENTS.md — my-react-shell

## Part 1: Context (information)

**my-react-shell** is the opinionated, complete base a new React app starts from under `~/Developer/` — the React counterpart to the SolidJS `foundation`. It solves common UI/UX patterns once so they can propagate everywhere via dependency updates.

- **Stack:** React 19 + Vite SPA (TypeScript 6). No SSR. Built on Radix primitives (no shadcn) and TanStack Router (for dev-harness only).
- **Backend:** Convex (`eu-west-1`, GDPR). 
- **Package Manager:** `pnpm`.
- **Distribution:** Tag-pinned GitHub git-dependency (`import { … } from 'my-react-shell'`). Ships a committed, precompiled `dist/` for zero-config install.
- **Styling:** Semantic tokens only. Renders correctly in light + dark across all palettes.

**Modules:**
Each module is self-contained and independently importable.
- `theme` — `--color-*` contract + React provider.
- `providers` — Convex client provider + the single `AppProviders` wrapper.
- `auth` — A pluggable auth seam (TS contract) + Convex Auth default.
- `i18n` — `t()` seam, central-key catalog, typed keys, dev missing overlay.
- `icons` — Glyph↔emoji toggle preference. No `lucide-react` dependency.
- `components` — Full surface of un-opinionated primitives and opinionated composites.
- `app-shell` — Optional chrome/layout.

---

## Part 2: Working contract (rules)

### Module Architecture Conventions
- **Self-contained:** Modules must never hard-depend on another module's runtime.
- **Contract + Default + BYO:** Export a TS contract, provide a shipped default where sensible, and allow consumers to bring their own.
- **Heavy peers behind sub-paths:** Anything pulling optional heavy dependencies (like `convex` or `@convex-dev/auth`) lives behind a sub-path, keeping the main barrel dependency-light.
- **No silent defaults for absent values:** Check, don't default. Throw on required-but-absent values.

### UI/UX Rules
- **No hardcoded user-facing text:** Components cannot call `t()` directly. Every visible or audible string must be a prop with an emoji/icon-only default, or a mandatory consumer prop (no default). Never hardcode English strings.
- **Input Auto-Save UX Rule:**
  - **No manual Save buttons/indicators:** Use debounced auto-saves for settings/config screens instead of explicit "Save" buttons.
  - **Visual `saveStatus` feedback:** Bind inputs to the `saveStatus` prop (`'idle' | 'pending' | 'saving' | 'saved' | 'error'`). On success (`'saved'`), the border transitions to green (1000ms fade). On typing/editing, the status clears to `'idle'` (120ms transition).
  - **Multi-Field Isolation:** If multiple inputs share one `useDebouncedAutoSave` hook, track `lastModifiedField` so they don't all flash green together. Bind dynamically: `saveStatus={lastModifiedField === fieldKey ? state : 'idle'}`.
  - **Toasts:** Trigger permanent error toasts for failures. NEVER display a success toast for auto-saves.
  - **Exceptions:** Transactional entity creation dialogs (e.g. "Create Project") retain their explicit Submit buttons.

### Porting from SolidJS `foundation`
- **Port faithfully:** Port every feature, scroll affordance, keyboard behavior, ARIA wiring, sizing contract, and edge/empty state. The feature set must not change.
- **Change implementation idiom only:** SolidJS → React (signals → hooks) and foundation's inline Tailwind utilities → my-react-shell's `mrs-`-prefixed plain CSS.
- **Do not drop features silently:** If a feature genuinely shouldn't carry over, STOP and ask the user for approval. 

### Git & Workflow Rules
- **Disposable History on `main`:** Many agents commit concurrently. Commit your own work at natural finish points. If isolating changes isn't trivial, commit everything in the working tree rather than stall. Never rewrite shared history (no reset/rebase/amend).
- **Never push:** Only push when explicitly instructed.
- **Pre-commit hook:** Auto-builds `dist/` and stages it when library source changes. If `dist/` sweeps other uncommitted library source, just commit the batch.

### Documentation Rules
- **API Reference is mandatory:** Any change touching the public API (exports, props, signatures, defaults, CSS) MUST update the API reference in the same change.
  - **Planning:** You should also mention updating `api/components` documentation. This should be present as a separate item in all plans in this project if relevant.
- **Guides:** Update a module's guide if a change affects its behavior, constraints, or contract.

### Dev Servers & Releases
- **Dev Servers:** Owned by the user. Never run `pnpm dev` or the `rs:watch` sidecar.
- **Releases:** Releasing is ALWAYS an agent responsibility. See references below for the runbook.

---

## Part 3: References

### MUST BE READ at startup before solving any coding task:
- `docs/specifications/api-reference.md` — The single source of truth for the public API. It ships inside the package.
- `docs/concept.md` — Explains what this project is and its architectural boundaries.

### Might be relevant (read when needed):
- `docs/maintainers/release-runbook.md` — Read this EXACTLY when asked to perform a release. It contains all commands (`pnpm release <bump> --push`).
- `docs/demo.md` — Documentation for the demo and verification surface.
- `docs/guides/<module>.md` — Deep dives and contracts for specific modules.
- `.claude/skills/react-framework/react-framework-notes.md` — Framework decision and consumer guide.

### Relevant external projects:
- **Shell Demo** (`~/Developer/my-react-shell-demo`): The visual showcase and agent test/bug-reproduction surface. **Never add showcase files to the `my-react-shell` repo.** All visual showcasing lives in the demo project.
- **offansk-ev** (`~/Developer/offansk-ev`): A real consumer application that uses this shell.
- **zingularis/foundation** (`~/Developer/zingularis/foundation`): The SolidJS counterpart. Used as the authoritative source when porting UI components over to React.
- **Scripts** (`~/Developer/scripts`): Global ecosystem scripts.
- **Themes** (`~/Developer/themes`): Shared token contract and palettes. (Ensure you read the `theme-tokens` skill before doing token work).
