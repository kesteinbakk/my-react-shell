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
implements the seam itself. shadcn/ui + Tailwind v4 — and **TanStack Router** — are
consumer-side choices, not shipped by my-react-shell: the router is recommended and
used by the dev-harness, but no shipped module imports it, so it is **not a peer
dependency** (consumers bring their own). *(Amended by D10: the optional `app-shell`
module DOES import the router, so TanStack Router is an **optional** peer for the
`my-react-shell/app-shell` sub-path — still not a barrel peer.)* Source:
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
**harness Vite app** (test routes) that renders the modules for development and
behavior verification — **not** a feature showcase. Visual showcasing of modules
lives in the sister `my-react-shell-demo` project (see CLAUDE.md → Demos & visual
showcasing). The harness (`main.tsx`, `routes/**`,
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
  client) and **seam + default + bring-your-own** (auth and i18n). New
  modules are contributed back on rule-of-two and reach every app on version bump.

**Dropped from the earlier plan:** the shadcn registry host + MCP, all bespoke
composites, and the "build on the mandated app-shell" requirement. **Deferred:** a
shared app-shell and page/tab primitives may return later as *optional* modules,
built when an app needs them — not the centerpiece. *(Un-deferred by [D10](#d10--app-shell-module-react-port-of-the-foundation-shell): the
app-shell ships as one **optional** module among others — never mandated, never the
centerpiece, exactly as this clause envisioned.)*

## D9 — Convex is optional and isolated behind sub-paths (barrel = Convex-free core)

`convex` is an **optional** peer, and every Convex-coupled export lives behind a
sub-path — the Convex client providers at `my-react-shell/providers`, the Convex Auth
default at `my-react-shell/auth/convex`. The barrel (`my-react-shell`) is the
**Convex-free theme core**, so a theme-only consumer never installs Convex. Rationale:
the providers were originally in the barrel with `convex` a *required* peer, which
forced every consumer (even theme-only) to install it — the same "barrel drags an
optional concern" trap as the dropped router peer. This mirrors the SolidJS
`foundation`, which already keeps `convex`/`convex-solidjs` optional and walled off in
its `zing-shell` module. Applies the standing rule "optional/heavy peers behind
sub-paths" ([concept.md](concept.md)) to Convex.

## D10 — app-shell module (React port of the foundation shell)

my-react-shell ships an **optional `app-shell` module** at the sub-path
`my-react-shell/app-shell` — a React (SPA) re-implementation of the SolidJS
`foundation` app shell. It carries the shell chrome (`AppShell` header-or-sidebar
mode + responsive mobile drawer + optional bottom nav + the single scrolling body
cell), `ShellPageHeader` (URL-derived breadcrumbs + actions + search + `subPages`
title dropdown), `defineShellConfig` (the pages tree + the three navigation layers),
and the page-tab primitives (`PageSections` in-page `?tab=` + route-based
`PageTabs`). It **excludes** the app-specific glue (notification system, feedback
modal, command-bar/action registry) — a consumer wires its own into the page-header
action slot.

Decisions (un-defers the app-shell from [D8](#d8--the-modular-pivot-supersedes-the-above-shadcn-foundation-framing); it returns as one optional module, not the
centerpiece):

- **Router coupling.** The shell is inherently router-coupled (breadcrumbs are a
  pure function of the URL pathname; `?tab=` is a deep-link contract; route tabs are
  routes). **TanStack Router** is therefore an **optional peer** for the `app-shell`
  sub-path (amends [D2](#d2--stack-vite-spa--tanstack-router--convex-auth-project-owned)) — the barrel and every other module stay router-free; only an app
  importing the shell installs the router. Same isolation pattern as Convex ([D9](#d9--convex-is-optional-and-isolated-behind-sub-paths-barrel--convex-free-core)).
  Rejected the alternative (a router seam) — heavier, and the breadcrumb / scroll /
  deep-link machinery leaks router semantics into the contract anyway.
- **Primitives.** The module depends on **Radix** headless primitives (Sheet/Drawer,
  DropdownMenu, Popover) — declared as **optional peers** behind the sub-path (with
  devDependencies so the harness + lib build compile), keeping theme-only consumers
  Radix-free.
- **Strings.** The shell takes all display strings via its **config/props** — it is
  self-contained and never hard-imports the [i18n](#) module; the consumer translates
  at the call site.

Renders against the existing `theme` token contract. Ships `docs/guides/app-shell.md`.
Origin: the approved proposal `docs/1-proposals/app-shell-module.md`.

## D11 — opinionated component kit (`my-react-shell/components`)

my-react-shell ships an **optional opinionated component kit** at the sub-path
`my-react-shell/components` — React composites that bake a design / layout / behavior
decision on top of shadcn/Radix primitives and render against the semantic theme
token contract (light + dark, every palette). It mirrors the SolidJS `foundation` kit
(`@foundation/kit`) for the React era.

**The scope line:** the kit ships **only components that need an opinion**. The
un-opinionated shadcn primitives (Button, Input, Checkbox, Label, Switch, Separator,
plain Tabs/Dialog/Select, Tooltip, Popover) are **not** shipped — a consumer uses
shadcn directly for those, and the demo shows them as plain examples.

This **supersedes D3's "no UI components"** and resolves the [D8](#d8--the-modular-pivot-supersedes-the-above-shadcn-foundation-framing)
"deferred composites" clause: composites return, but as one opt-in module — never a
mandated kit, and never a registry host (D3's "no registry" stands; we ship compiled
components, not a shadcn registry). Follows the **D10** pattern exactly — a component
module behind a sub-path with optional peers, isolated from the barrel ([D9](#d9--convex-is-optional-and-isolated-behind-sub-paths-barrel--convex-free-core)).

Decisions (owner, 2026-06-20):

- **Build approach → Radix + CVA + tokens, self-contained.** Components are built on
  Radix headless primitives (optional peers, shared with app-shell) + `class-variance-authority`
  variants + a `cn()` (`clsx` + `tailwind-merge`) helper, styled with `mrs-`-prefixed
  semantic classes. "Based on shadcn" = the same Radix/Tailwind/CVA foundation and
  variant API — **not** a copy-in registry. The kit never imports the consumer's
  `@/components/ui`; where a composite needs a thin primitive it builds a minimal
  token-styled one internally. The plain primitives stay consumer-owned (demo-only).
- **Styling ships as CSS, not utilities.** Like `app-shell.css`, the kit ships
  `components.css` (`my-react-shell/components/styles.css`) — a consumer's Tailwind
  never scans `node_modules`, so styles are stable token-based classes, not utilities.
  Keeps the D5 zero-bundler-config promise.
- **New optional peers:** `class-variance-authority`, `clsx`, `tailwind-merge` (tiny,
  and already present in any shadcn consumer) — optional, behind this sub-path.
- **Drift follow-up:** the app-shell module predates CVA and styles without it; align
  it to the kit's CVA / `cn()` conventions at the end of the kit work (tracked in T004).

Renders against the existing `theme` token contract, incl. the neutral `secondary` and
the `-strong` semantic text tokens. Ships `docs/guides/component-kit.md`. Origin: T004
(`docs/2-tasks/T004-component-kit/task.md`).

## D12 — user-preferences component + icons↔emojis display-mode seam

my-react-shell ships a **`<UserPreferences>`** component in the kit
(`my-react-shell/components`) and a small **`icons` module** (`my-react-shell/icons`) — the
React-era answer to how the SolidJS `foundation` surfaces a theme picker + an "use emojis
instead of icons" toggle (`shell/actionRow.tsx` `ThemeAction` + the central
`kit/icons/Icon.tsx`).

The shaping constraint: `foundation`'s emoji switch works because it **owns** a central
`<Icon>` every glyph renders through. my-react-shell deliberately owns no icon kit (D3; the
app-shell renders via the consumer's `config.renderIcon`). So we ship the **seam**, not a
registry.

Decisions (owner, 2026-06-20):

- **Switcher → a preference seam + a thin `<Icon>`, not a full Icon module.** `icons` ships
  `IconModeProvider` + `useIconMode` + `<Icon icon emoji>` (swaps a glyph for its emoji on
  the active mode). **No baked-in registry and no `lucide-react` dependency** — the consumer
  brings glyphs and typically routes its existing `renderIcon` through `<Icon>`. Keeps the
  "no icon kit" boundary (D3) intact. (Rejected: porting `foundation`'s lucide-backed Icon
  registry — a peer dep + a large surface against the boundary.)
- **Scope → preferences-only, auth-free.** `<UserPreferences>` ships theme palette +
  light/dark/system + the icons↔emojis toggle, and never imports the auth seam. Account
  actions (sign out / profile) go through an optional `accountActions` slot, mirroring
  `foundation`'s split of a preferences modal from its identity menu.
- **Controlled, persistence-agnostic.** `<UserPreferences>` reads each value and emits an
  `onChange`, persisting nothing itself — the consumer chooses storage (localStorage via the
  shipped providers, or a per-user account / Convex). `IconModeProvider` is likewise
  controllable (localStorage default; `value` + `onChange` to redirect), and `ThemeProvider`
  gains a non-breaking `onChange` so theme can be mirrored too.
- **Presentation → Radix Dialog (modal).** Matches `foundation`'s `ThemeAction` and reuses
  the `@radix-ui/react-dialog` peer `ConfirmDialog` already uses — no
  `@radix-ui/react-popover` dependency.

Renders against the existing `theme` token contract. Ships `docs/guides/icons.md` and a
`<UserPreferences>` entry in `docs/guides/component-kit.md`. Origin: T005
(`docs/2-tasks/T005-user-preferences/task.md`).

## D13 — shared theme package (`themes`): one source of truth for tokens + palettes (supersedes [D4](#d4--the-solidjs-foundation-is-untouched))

The semantic `--color-*` token contract and the palettes are extracted into a
**separate, framework-neutral package `themes`** (`~/Developer/themes`,
`git+ssh://git@bitbucket.org:kesteinbakk/themes.git`, tag-pinned exactly like
[D5](#d5--distribution-bitbucket-git-dependency-consumed-like-an-npm-package))
that **both my-react-shell (React) and `zingularis/foundation` (SolidJS)
consume**. The colors are pure CSS custom properties — framework-agnostic — so a
single copy serves both ecosystems; each repo keeps only its own
framework-specific `ThemeProvider` and its own baseline element styles.

**This supersedes [D4](#d4--the-solidjs-foundation-is-untouched)** ("the SolidJS
foundation is untouched"): foundation is refactored to consume `themes` instead of
carrying its own palette copies. The copies had already drifted — the five shared
palettes (`ocean/forest/sunset/soft/dynamic`) were byte-for-byte identical across
both repos, yet my-react-shell's `base.css` contract had added the `-border` /
`share-border` tokens foundation's `:root` never declared (its palettes filled
them anyway). Extracting the contract ends that drift at the source. Selected
**approach A** (extract a package) over **B** (keep two copies behind a
drift-check guard) — a true single source beats enforced duplication, and it
reuses the D5 git-dep model already in place.

Decisions:

- **Pure CSS + JSON, no build.** `themes` ships `contract.css` (the superset
  `:root`, value-free apart from `--color-overlay`), the six palettes
  (`ocean/forest/sunset/soft/dynamic` + `golden`), an `index.css` barrel, and a
  `palettes.json` manifest (name/label/description, so a consumer's theme registry
  can stop duplicating the list). No TS, no React/Solid, no `prepare`.
- **A regular `dependencies` git-dep in both consumers**, not a dev/peer dep — it
  must resolve **transitively** for the consumers of a library that re-exports its
  CSS. The barrel stays otherwise dependency-light; this is CSS, not a runtime peer.
- **Tailwind stays the consumer's.** The palettes resolve Tailwind's `--color-*`
  ramp from the consumer's own `@import 'tailwindcss'`; `themes` imports nothing
  and stays tooling-neutral. Import Tailwind before the palettes.
- **Subset selection per consumer.** my-react-shell surfaces five palettes (omits
  `golden`, the literal Zingularis brand gold — [D6](#d6--theme-module-token-contract--5-palettes)); foundation surfaces all
  six. The package ships the superset; each app imports the palette files it wants.
- **Providers + baseline stay per-repo.** The class-toggling runtime is genuinely
  framework-specific; foundation's baseline also carries app utility classes +
  animations that don't belong in a neutral package.

my-react-shell: `src/index.css` imports `themes/contract.css` + its five palettes;
`src/styles/base.css` keeps only the baseline; `src/styles/themes/*` removed.
foundation: `src/themes/index.css` imports `themes/*`; `src/themes/base.css` keeps
its utilities/baseline/animations minus the contract; `foundation-*.css` removed.
Editing a color now happens once in `themes`; a tag bump propagates it (D5-style)
to every consumer. Origin: T006 (`docs/2-tasks/T006-shared-theme-package/task.md`).
