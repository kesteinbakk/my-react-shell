# my-react-shell — concept

## What this is

**my-react-shell is a support and starting base for React + Convex apps** under
`~/Developer/` — **the React counterpart to what the SolidJS `foundation` is for
Solid projects.** It is the opinionated, batteries-included base a new app starts
from: pick it up, and the theme, providers, auth seam, i18n, icons, app shell, and a
**complete component surface** are already prepared, so building a real app goes fast.

It is consumed like a standard npm package from a tag-pinned GitHub git-dependency.
A change to the base ripples to every app that imports it on the next version bump —
the same "solve it once, propagate everywhere" model `foundation` gives Solid, but
delivered as a **dependency** (import à la carte, update by bumping a tag) rather than
a copied-in foundation.

It stays **modular**: an app takes only the capabilities it wants. But within what it
ships, it is **opinionated and complete** — we pick and prepare so the consumer
doesn't have to assemble primitives from elsewhere.

## The model

- **Opinionated + complete.** The base makes the design and wiring decisions up front.
  The component module ships the **whole surface** — the un-opinionated primitives
  (Button, Input, Checkbox, …) **and** the opinionated composites (Alert, dialogs,
  structured cards, form fields, `UserPreferences`, …) — so a consumer imports
  everything from one place and never assembles a primitive layer separately.
- **Built on Radix, not shadcn.** Every component is built directly on
  [Radix](https://www.radix-ui.com/) primitives + `class-variance-authority` + plain
  `mrs-`-prefixed CSS, rendered against the semantic `--color-*` theme tokens. **A
  consumer needs no shadcn** — no copy-in registry, no `components/ui/`, no
  `components.json`, no cssVar bridge. (shadcn itself is just Radix + cva + Tailwind;
  we ship that idiom directly, themed against our token contract.)
- **One front door, one convention.** Components come from `my-react-shell/components`
  and share one prop convention: **`tone`** for semantic color
  (`neutral`/`info`/`success`/`warning`/`danger`), **`variant`** for structural style.
  No name collisions, no per-component "which source?" decision.
- **Semantic tokens only.** Components render against the shared `--color-*` contract,
  in light *and* dark across every palette — never a hardcoded color.

## The modules

Each is one capability an app can opt into:

- **theme** — light/dark/system, palette selection, and consumer-defined palettes, as
  a batteries-included drop-in. The `--color-*` token contract and the palettes come
  from the shared, framework-neutral `themes` package — one source of truth shared with
  the SolidJS `foundation`; this module is the React provider + registry on top.
- **providers** — the Convex client provider and the single `AppProviders` wrapper that
  composes theme + Convex + (optional) auth. At the `my-react-shell/providers` sub-path
  so `convex` stays an *optional* peer and the barrel stays Convex-free.
- **auth** — a pluggable auth **seam** (a TypeScript contract) plus the Convex Auth
  default implementation, at a sub-path so its dependency stays optional.
- **i18n** — the `t()` seam at `my-react-shell/i18n`: `<I18nProvider>` +
  `useTranslation`, a central-key catalog, `{{param}}` interpolation, opt-in
  compile-time typed keys (`createTypedI18n`, defaulting to `string` so it stays
  non-breaking), and a dev-only missing-key overlay. Convex- and router-free;
  bring-your-own engine via `resolve`. Unlike the other modules it is **core**: it
  ships the shell's own `mrs.*` chrome catalog (per-locale, regioned codes) that
  components read for their built-in copy, a `LOCALE_META` registry (native name +
  flag), and a shipped `<LanguagePicker>` — so language selection is as smooth as
  theme selection.
- **components** — the **complete, opinionated component surface** at
  `my-react-shell/components`: un-opinionated primitives **and** opinionated composites,
  all on Radix + the theme tokens. Components ship **built-in translated chrome copy**
  (Close, Cancel, …) from the i18n core, so obvious labels are optional props with
  defaults; app-specific content stays a mandatory prop. Includes **`UserPreferences`**
  (a controlled theme/language/display panel) and **`LanguagePicker`**.
- **icons** — the icons↔emojis display-mode seam: a preference (`IconModeProvider` /
  `useIconMode`) plus a thin `<Icon>` that swaps a glyph for its emoji, and an optional
  `createIconRenderer` that wires a consumer's maps into one `renderIcon` with a
  compile-time + dev missing-emoji guardrail and a `force` (icon-only) list — at
  `my-react-shell/icons`. No icon registry and no `lucide-react` dep — consumers bring
  their own glyphs.
- **app-shell** — an optional, router-coupled shell at `my-react-shell/app-shell`: the
  chrome (header-or-sidebar + mobile drawer + optional bottom nav + the single scrolling
  body), the URL-derived breadcrumb band, the `usePageHeader` hook for page chrome, and
  the page-tab primitives. Never mandated, never the centerpiece.

## The two module flavors

The base offers both ready-made drop-ins *and* contracts to implement:

- **Batteries-included drop-in** — import the provider and use it; no app input
  required (theme, the Convex client provider, the component surface).
- **Seam + default + bring-your-own** — the module exports a TS **contract** the app
  fills, with a shipped default and a BYO path (auth: `AuthProvider` contract + Convex
  Auth default + your own provider; i18n follows the same shape).

## Module rules

1. **Independently importable** — from the barrel (`import { ThemeProvider } from
   'my-react-shell'`) or a sub-path (`my-react-shell/providers`, `/components`,
   `/auth/convex`, …). The barrel is the Convex-free theme core; anything pulling Convex
   lives behind a sub-path so a theme-only app never installs it.
2. **Self-contained** — a module never hard-depends on another module's *runtime*; only
   small pure types are shared. `theme` works without `i18n`; `auth` without `theme`.
   `AppProviders` *composes* them for convenience, but each stands alone. The one
   sanctioned exception is **soft optional integration**: a module may read a sibling's
   context to follow it automatically, but only via a `…Optional()` hook that returns
   `null` with no provider mounted, with a sensible default when absent and an explicit
   prop that overrides — so it still stands alone (e.g. the `Dialog`/`Sheet` close ✕
   following the icons↔emojis mode). The other exception is that **i18n is core**:
   `components` may depend on it at runtime for built-in chrome copy (Close, Cancel, …)
   — a soft context read plus the shell's bundled `mrs.*` catalog. See
   `docs/maintainers/module-authoring.md`.
3. **Optional/heavy peers behind sub-paths** — anything pulling an optional dependency
   lives at `my-react-shell/<module>[/<impl>]`, keeping the barrel dependency-light.
4. **Documented** — every export is in the single API reference
   (`docs/specifications/api-reference.md`), the authority for *what* each module exports
   and how to use it. A module additionally ships a `docs/guides/<module>.md` for the
   *why* + deeper contract when there is more to say than the reference carries.

**Adding to the base:** an app builds a capability locally; when a second app needs it
(rule of two), it is contributed back as a new module or component. Every app gets it
on the next version bump.

## Relationship to the SolidJS `foundation`

`foundation` (`~/Developer/zingularis/foundation`) is the opinionated base for SolidJS
apps; **my-react-shell is its React-era sibling** — the same role for React + Convex
apps. Much of my-react-shell is a faithful React re-implementation of foundation's
shell, kit, and primitives (the idiom changes — signals→hooks, inline utilities→`mrs-`
CSS — the feature set does not). The two **share their theme tokens** through the
framework-neutral `themes` package — colors are edited once and propagate to both — but
otherwise stay independent, each the source of truth for its own framework's modules.

## Distribution

Consumed as a **tag-pinned GitHub git-dependency**, like an npm package:

```ts
import { ThemeProvider } from 'my-react-shell'
```

A **committed, precompiled `dist/`** (JS + types) ships with the package, so install is
zero-config — no build runs on the consumer's machine. To ship an update: push + tag;
consumers bump the tag and reinstall, receiving updates only to the modules they import.
No npm registry, no Verdaccio, no sync system.

## Stack

Vite SPA + TanStack Router + Convex (`eu-west-1`). **Auth is project-owned:** the `auth`
module ships the **Convex Auth (`@convex-dev/auth`) default** behind the seam; a project
needing Better Auth (`@convex-dev/better-auth`, crossDomain, Convex ≥ 1.25) or SSO / MFA
implements the seam itself. pnpm · React 19 · TS 6 · Tailwind v4. Full framework
rationale in the
[react-framework guide](../.claude/skills/react-framework/react-framework-notes.md).
