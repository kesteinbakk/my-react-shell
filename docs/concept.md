# my-react-shell — concept

## What this is

**my-react-shell** is a **modular React foundation** for React + Convex apps under
`~/Developer/` — a menu of optional, self-contained **drop-in modules** an app
imports à la carte, consumed like a standard npm package from a Bitbucket
git-dependency. It is **not** a framework or a fixed app template, and not a *full*
component library — it ships only the **opinionated** composites that need a design
decision (see `components` below), leaving un-opinionated shadcn primitives to the consumer.

Each module is one capability an app can opt into:

- **theme** — the semantic-token contract, 5 palettes, light/dark/system, and
  consumer-defined palettes. A batteries-included drop-in: import the provider, done.
- **providers** — the Convex client provider and the single `AppProviders` wrapper
  that composes theme + Convex + (optional) auth. Shipped at the
  `my-react-shell/providers` sub-path so `convex` stays an *optional* peer and the
  barrel stays Convex-free.
- **auth** — a pluggable auth **seam** (a TypeScript contract) plus the Convex Auth
  default implementation, shipped at a sub-path so its dependency stays optional.
- **i18n** *(planned)* — the `t()` seam, central-key policy, and missing-key surface.
- **components** — an opinionated component kit (Alert, dialogs, structured cards, form
  fields, …) built on shadcn/Radix + the theme tokens, at `my-react-shell/components`.
  Ships only the composites that need an opinion; un-opinionated shadcn primitives stay
  consumer-owned.

## The two module flavors

The user explicitly wants both "drop-ins like translation" *and* "contracts on how
to implement." Modules come in two flavors:

- **Batteries-included drop-in** — import the provider and use it; no app input
  required (theme, the Convex client provider).
- **Seam + default + bring-your-own** — the module exports a TS **contract** the app
  fills, with a shipped default and a BYO path (auth: `AuthProvider` contract +
  Convex Auth default + your own provider; i18n will follow the same shape).

## Module rules

1. **Independently importable** — from the barrel (`import { ThemeProvider } from
   'my-react-shell'`) or a sub-path (`my-react-shell/providers`,
   `my-react-shell/auth/convex`). The barrel is the Convex-free theme core; anything
   pulling Convex lives behind a sub-path so a theme-only app never installs it.
2. **Self-contained** — a module never hard-depends on another module's *runtime*;
   only small pure types are shared. `theme` works without `i18n`; `auth` without
   `theme`. `AppProviders` *composes* them for convenience, but each stands alone.
3. **Optional/heavy peers behind sub-paths** — anything pulling an optional
   dependency lives at `my-react-shell/<module>/<impl>`, keeping the main barrel
   dependency-light.
4. **Documented** — each module ships a `docs/guides/<module>.md`: what it does, the
   contract to fill, how to wire it, how to bring your own.

**Adding modules / reusing what others built:** an app builds a capability locally;
when a second app needs it (rule of two), it is contributed back as a new module
(folder + export + guide). Every app gets it on the next version bump.

## What it is NOT

- **Not a *full* component library.** It ships an **opinionated** kit — the composites
  that need a design/layout/behavior decision (`my-react-shell/components`) — but **not**
  the un-opinionated primitives: consumers use shadcn/ui directly for Button / Input /
  Checkbox / plain Dialog / etc. It also ships the **theme token contract** every
  component renders against.
- **Not a registry host.** It does not host a shadcn registry or an MCP server.
- **Not a *fixed* app-shell.** There is no mandated layout/shell. A shared app-shell
  ships as one *optional* module among others (`my-react-shell/app-shell`, strategy
  D10) — a consumer uses it, swaps it, or builds its own. Never mandated, never the
  centerpiece.
- **Not the SolidJS `foundation`.** That stays the source of truth for SolidJS
  consumers. my-react-shell is the React-era sibling for the reusable-module layer.

## Distribution

Consumed as a **tag-pinned Bitbucket git-dependency**, like an npm package:

```ts
import { ThemeProvider } from 'my-react-shell'
```

A `prepare` build compiles `src/ → dist/` on install, so consumers receive compiled
JS + types with zero bundler config. To ship an update: push + tag; consumers bump
the tag and reinstall. Apps receive updates only to the modules they actually
import. No npm registry, no Verdaccio, no sync system. Full rationale in
[strategy.md](strategy.md) D5.

## Stack

Vite SPA + TanStack Router + Convex (`eu-west-1`). **Auth is project-owned:** the
`auth` module ships the **Convex Auth (`@convex-dev/auth`) default** behind the seam;
a project needing Better Auth (`@convex-dev/better-auth`, crossDomain, Convex ≥ 1.25)
or SSO / MFA implements the seam itself. pnpm · React 19 · TS 6 · Tailwind v4.
Full framework rationale in the
[react-framework guide](../.claude/skills/react-framework/react-framework-notes.md).
