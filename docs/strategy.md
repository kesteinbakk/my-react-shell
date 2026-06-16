# my-react-shell — strategy (decision log)

Standing decisions for this project. Numbered in the order taken; a later decision
supersedes an earlier one where it says so. Full framework rationale:
[react-framework-notes.md](../.claude/skills/react-framework/react-framework-notes.md).

## D1 — my-react-shell is a modular drop-in foundation

my-react-shell is a **library of optional, self-contained modules** (theme,
providers, auth seam, i18n, …) that apps import à la carte — not a framework, a
fixed app template, or a UI kit. Each module is independently importable and never
hard-depends on another module's runtime. It does **not** own UI primitives, a
component kit, or a registry; consumers use shadcn/ui directly. *(Supersedes the
original D1: "everything above shadcn, hosts a shared shadcn registry." See D8.)*

## D2 — Stack: Vite SPA + TanStack Router + Convex (auth project-owned)

No SSR (consumers are behind auth; any public marketing surface is a separate
static site). Convex is the backend. **Auth is project-owned:** the `auth` module
ships **only the Convex Auth (`@convex-dev/auth`) default** — runs entirely in
Convex, no auth server, no cross-domain — behind a pluggable seam. A project needing
Better Auth (`@convex-dev/better-auth`, crossDomain, Convex ≥ 1.25), SSO, or MFA
implements the seam itself. shadcn/ui + Tailwind v4 are consumer-side choices, not
shipped by my-react-shell. Source:
[react-framework-notes.md](../.claude/skills/react-framework/react-framework-notes.md).

## D3 — No component kit, no registry

my-react-shell ships **no UI components** (no Button/Dialog/Table, no bespoke
composites) and **hosts no registry / MCP**. New apps build their own components
with shadcn; a component reused across apps (rule of two) may later become a module,
added then — not pre-built now. *(Supersedes the original D3/D6 plan to port
`foundation` composites — `PhiCard`, pickers, `InlineEditText`, `alertDialog` — as
registry items. See D8.)*

## D4 — The SolidJS `foundation` is untouched

`zingularis/foundation` remains the source of truth for SolidJS consumers.
my-react-shell is its React-era sibling. The Solid foundation's **model** is the
inspiration — a shared foundation many apps consume, where core fine-tuning
propagates — but my-react-shell propagates per-module on version bump (D5), rather
than by syncing the whole foundation into every app. It is not a component port.

## D5 — Distribution: Bitbucket git-dependency, consumed like an npm package

my-react-shell is consumed as a versioned **git dependency** from its Bitbucket repo
(`git+ssh://git@bitbucket.org:kesteinbakk/my-react-shell.git#<tag>`), pinned by tag
— no npm registry / Verdaccio to run. A **`prepare` build** (`tsc -p
tsconfig.lib.json`) compiles `src/ → dist/` on install, so a consumer receives
compiled **JS + `.d.ts`** and imports it like any npm package (`import { … } from
'my-react-shell'`) with zero bundler config — `dist/` is gitignored, built on
install. To ship an update: push + tag; consumers bump the tag and reinstall, and
receive updates only to the modules they import. Git auth is plain git (SSH on dev
machines; a Bitbucket app-password / access token / deploy key in Vercel CI). *(The
prebuilt-dist mechanism supersedes the original D5's "ship raw TS source, rely on
the consumer's Vite to transpile" — bundlers don't transpile `node_modules`. The
"separate shadcn registry host" clause is dropped with D3.)*

## D6 — theme module: token contract + 5 palettes

The `theme` module carries (from the Solid `foundation`, values verbatim) the
`base.css` semantic-token contract + **5 palettes** (`dynamic`, `forest`, `ocean`,
`soft`, `sunset`); **`foundation-golden` is dropped** (literal Zingularis brand
gold). `ThemeProvider` lets a consumer **select** a palette *and* **define its own**
(a `.theme-<name>-{light,dark}` class filling the token contract), with light/dark/
system-follow and localStorage persistence. The Tailwind `@theme` exposure / shadcn
token bridge is a consumer concern, not shipped here. *(The composite carry-list
from the original D6 is dropped — see D3.)*

## D7 — Repo shape: library + dev-harness app

One repo, two roles: the **library** consumers import (the modules) and a dev-only
**harness Vite app** (showcase + test routes) that renders the modules for
development and behavior verification. The harness (`main.tsx`, `routes/**`,
`routeTree.gen.ts`) is excluded from the library emit (`tsconfig.lib.json`) and from
the package `exports`, so consumers never receive it. Rationale: theme/provider
behavior (FOUC-free theme application, system-follow, provider composition) is only
fully catchable in-browser, never by typecheck.

## D8 — The modular pivot (supersedes the "above-shadcn foundation" framing)

The project began as "the everything-above-shadcn layer" — app-shell + a hosted
shadcn registry + bespoke composites + a mandated build-on-this setup. That is
replaced by the **modular drop-in** model above (D1/D3/D5). Rationale:

- The value wanted is **reuse with per-module propagation**, like the Solid
  `foundation`, but as a *dependency* so each app gets only what it imports and
  updates on bump — not a sync that touches every app.
- A **fixed app setup and a component/registry kit are not wanted.** New apps build
  their own components and choose their own structure; my-react-shell supplies
  optional capabilities (theme, providers, auth seam, i18n) and the **contracts** to
  wire or replace them.
- Modules come in two flavors: **batteries-included drop-ins** (theme, Convex
  client) and **seam + default + bring-your-own** (auth today; i18n next). New
  modules are contributed back on rule-of-two and reach every app on version bump.

**Dropped from the earlier plan:** the shadcn registry host + MCP, all bespoke
composites, and the "build on the mandated app-shell" requirement. **Deferred:** a
shared app-shell and page/tab primitives may return later as *optional* modules,
built when an app needs them — not the centerpiece.
