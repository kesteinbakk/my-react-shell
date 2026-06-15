# react-shell — strategy (decision log)

Standing decisions for this project. Newest on top. Full framework rationale:
[../../notes/react-framework-guide.md](../../notes/react-framework-guide.md).

## D1 — react-shell is the "everything above shadcn" layer

shadcn/ui (used via react-shell's **shared private registry** + MCP + `CLAUDE.md`
reuse rules) owns UI primitives and composites. react-shell **hosts that shared
registry** (brand tokens as a `registry:base` + the bespoke composites shadcn
lacks) and owns what shadcn does not: app-shell, providers, i18n, and the
cross-app contracts. We do **not** maintain an own primitive kit. Source:
react-framework-guide §2/§5.

## D2 — Stack: Vite SPA + TanStack Router + Convex + shadcn (auth project-owned)

Per the guide's Option C. No SSR (consumers are behind auth; a separate Astro
site handles any public marketing surface). **Auth is project-owned:**
react-shell ships **only the Convex Auth (`@convex-dev/auth`) default** — runs
entirely in Convex, no auth server, no cross-domain — via a pluggable auth seam.
It does **not** ship Better Auth: a project needing Better Auth
(`@convex-dev/better-auth`, crossDomain, Convex ≥ 1.25), SSO, or MFA wires its
own provider through the seam. Source: react-framework-guide §1, §4.

## D3 — foundation-react's primitives are not ported

The ~62 Base-UI/CVA leaf components are superseded by shadcn (which now supports
the same Base UI headless layer). Only the durable, non-primitive parts move
here; the brand token values and the few bespoke composites shadcn lacks become
shadcn registry items. Source: foundation-react investigation.

## D4 — The SolidJS `foundation` is untouched

`zingularis/foundation` remains the source of truth for SolidJS consumers.
react-shell is its React/shadcn-era sibling for the above-the-kit layer, not a
replacement. **The Solid `foundation` — never the abandoned `foundation-react` —
is the canonical reference for what react-shell ports** (`foundation-react`
renamed/degraded components, e.g. `PhiCard` → "GoldenCard"; see D6).

## D5 — Distribution: Bitbucket git-dependency, tag-pinned

react-shell is consumed as a versioned **git dependency** from its Bitbucket repo
(`git+ssh://git@bitbucket.org:kesteinbakk/react-shell.git#<tag>`), pinned by tag —
no npm registry / Verdaccio server to run and keep reachable. It ships
**TypeScript source** and relies on the consumer's Vite to transpile it (every
consumer is Vite + React); a `prepare` build is the fallback if a non-Vite consumer
ever needs prebuilt output. Auth is plain git (SSH on dev machines; a Bitbucket
app-password / deploy key in Vercel CI). The shadcn registry is a **separate**
static-JSON host + bearer token — the git-dep delivers only the importable package,
not the `{name}.json` registry items. Source: distribution evaluation (git-dep vs
Verdaccio vs source-sync).

## D6 — Theming + composite carry list (what moves from `foundation`)

From the Solid `foundation` (D4 — never `foundation-react`): carry the `base.css`
semantic-token contract + **5 palettes** (`dynamic`, `forest`, `ocean`, `soft`,
`sunset`); **drop `foundation-golden`** (literal Zingularis brand gold).
`ThemeProvider` lets a consumer **select** a palette *and* **define its own** (a
class filling the token contract). Bespoke composites carried as registry items:
**`PhiCard`** (φ / golden-*ratio* geometry — not `foundation-react`'s brand-sounding
"GoldenCard" rename), `CompactColorPicker`, `CompactIconPicker`, `InlineEditText`,
and the imperative `alertDialog`. **Drop** `ReactionPill` / `ReactionGroup` (a
feature, not a foundation primitive). The ~62 Base-UI/CVA primitives are not carried
(D3).

## D7 — Repo shape: library + dev-harness app

react-shell is one repo serving two roles: the **library** consumers import (shell,
providers, i18n, contracts) and a **dev-harness Vite app** (showcase + test routes)
that renders the shell for development and behavior verification. The harness is
dev-only — not in the package `exports`, absent from what consumers git-dep.
Rationale: app-shell contracts (single scroll container, breadcrumb-from-URL,
`?tab=` deep links) are only catchable in-browser, never by typecheck — the Solid
`foundation` is itself a runnable app for exactly this reason.
