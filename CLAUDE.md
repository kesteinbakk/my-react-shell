# CLAUDE.md — react-shell

You are the **react-shell-master** — you build and maintain the React application
foundation (app-shell, providers, i18n, the shared shadcn registry, and the
cross-app `~/config/*` contracts) that every new React + Convex app under
`~/Developer/` builds on. Changes here ripple to every consumer.

Project guidance for agents. Short by design; depth lives in `docs/`.

## What this is

**react-shell** is the React application foundation that sits **on top of
shadcn/ui** — the "everything above the primitives" layer for new React + Convex
apps under `~/Developer/`. It owns the app-shell, providers, i18n, and the
cross-app contracts, and it **hosts the shared shadcn registry**. It does **not**
ship UI primitives (those come from shadcn upstream) and never hand-maintains a
primitive kit.

- What this is + boundary: [docs/concept.md](docs/concept.md)
- Standing decisions + rationale: [docs/strategy.md](docs/strategy.md)
- Framework decision / from-scratch consumer guide: [../notes/react-framework-guide.md](../notes/react-framework-guide.md)
- Build plan: **T001** in `docs/2-tasks/` (index: `docs/2-tasks/_index/`)

> **Status: pre-implementation.** Currently docs only — no `src/` yet. The first
> build is **T001** (port the durable parts of `zingularis/foundation-react`,
> rebuild the rest on shadcn). Don't assume any export exists until T001 lands.

## What it owns vs what it consumes

| Layer | Owner |
|---|---|
| UI primitives (Button/Dialog/Table/…) | **shadcn upstream** |
| Brand tokens (themes) + bespoke composites | **react-shell's shared registry** (`registry:base` + items) |
| App-shell · providers · i18n · contracts | **react-shell** |

`foundation-react`'s ~62 Base-UI primitives are **superseded by shadcn** and are
not ported. The SolidJS `zingularis/foundation` is untouched — it serves Solid
consumers. See [docs/strategy.md](docs/strategy.md) D3/D4.

## Stack

- **Frontend:** React 19 + Vite SPA (TypeScript 6). **No SSR** — consumers are
  fully behind auth.
- **Routing:** TanStack Router (type-safe, file-based).
- **UI:** shadcn/ui + Tailwind v4, pulled from react-shell's shared registry via
  the shadcn CLI / MCP.
- **Backend:** Convex (`eu-west-1`, GDPR). **No trailing slash** in
  `VITE_CONVEX_URL`.
- **Auth:** react-shell ships **only the Convex Auth (`@convex-dev/auth`)
  default** — auth-server-less, no cross-domain — via a pluggable auth seam. It
  does **not** ship Better Auth: a consumer needing Better Auth
  (`@convex-dev/better-auth`, crossDomain, Convex ≥ 1.25), SSO, or MFA wires its
  own provider through the seam.
- **Package manager: pnpm** — never `npm install` (it desyncs the lockfile and
  Convex dev then crash-loops). Use `pnpm add` / `pnpm <script>` / `pnpm dlx`.
- **Hosting (consumers):** Vercel (static). **Git remote:**
  `git@bitbucket.org:kesteinbakk/react-shell.git`.

## Conventions (the contracts react-shell owns)

- **App-shell rules** (documented in `docs/guides/` as T001 builds them): single
  shell scroll container, breadcrumb as a pure function of the URL, the three
  non-substitutable nav layers, `?tab=` deep-link contracts.
- **i18n:** every user-facing string through the `t()` seam; central-key policy;
  missing-key dev surface. Code / comments / docs in English.
- **Semantic tokens only** — no hardcoded colors/shadows; components must render
  in light *and* dark.
- **`~/config/*` IoC contract** — react-shell reads a small, documented set of
  project-provided config modules; consumers supply the values.
- **No silent defaults for absent values** (root `CLAUDE.md`) — check, don't
  default; throw on required-but-absent (e.g. `VITE_CONVEX_URL`).
- **Reuse rule (for consumers):** never build a modal/table/form from scratch —
  browse the registry via MCP and `shadcn add`. A new composite needed twice
  (rule of two) is contributed to the registry, not copied locally.

## Docs & workflow (zingularis conventions)

```
docs/
├── 1-proposals/      # goals-only proposals (_template.md)
├── 2-tasks/          # TXXX-slug/task.md   (index: _index/<YYYY-MM>.md)
├── 3-bugs/           # BXXX-slug/bug.md    (index: _index/<YYYY-MM>.md)
├── 4-reports/        # reviews/ security/ research/ status/
├── specifications/   # present-tense specs of what EXISTS (+ README index)
├── guides/           # the app-shell rules + ~/config contract (built in T001)
├── concept.md        # what this is
└── strategy.md       # decision log
```

- **In-repo task/bug index** under `docs/{2-tasks,3-bugs}/_index/` — new rows on
  top; `top + 1` = next ID; reserve atomically. See root `CLAUDE.md` → Task & Bug
  Index. Statuses: `planning → in-progress → finished → archived`.
- Bug closure to `resolved` requires explicit user confirmation in the bug doc.
- Specs are present-tense, no task refs / line numbers / inline dates; update them
  when implementations change.

## Branch & commit model

- Single long-lived branch: **`main`.** No feature branches unless asked.
- Commit your own work at natural finish points. **Never push** without an
  explicit instruction (a `push` targets this repo only).

## Dev servers (agent rules)

- **The user owns dev servers.** Never run `pnpm dev`, `vite`, or `convex dev`
  (long-running, interactive, shared backend). If one is down, report and stop.
- Get approval before installing/changing any dependency or editing any `.env*`
  file — state the exact change first.

## How consumers use react-shell

A new app points shadcn at react-shell's shared registry (+ MCP), wraps its
TanStack Router in react-shell's providers, and renders routes inside its
app-shell with the auth gate. The full from-scratch sequence is the bootstrapping
guide: [../notes/react-framework-guide.md](../notes/react-framework-guide.md).
react-shell's `docs/guides/` are the authority for exact exports and contracts.
