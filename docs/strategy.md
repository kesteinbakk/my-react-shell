# my-react-shell — strategy

The standing intent behind my-react-shell and the decisions that still shape it.
It says **why** the project is the way it is; for **what** each module is, see
[concept.md](concept.md), and for stack rationale, the
[react-framework notes](../.claude/skills/react-framework/react-framework-notes.md).

This is a goal and a set of principles, not a rulebook. The numbered decisions
below record choices we'd otherwise re-litigate — when one stops serving the goal,
change it.

## The goal

Reuse with **per-module propagation**. Apps under `~/Developer/` keep re-solving
the same problems — theme, providers, an auth seam, i18n, a shell. The aim is to
solve each once, as an optional **drop-in module**, so every app pulls in only what
it wants and receives improvements on a version bump.

The inspiration is the SolidJS `foundation`'s *model* — one shared foundation many
apps draw from, where core fine-tuning propagates — but delivered as a
**dependency** rather than a sync: an app imports à la carte and updates by bumping
a tag, instead of having a whole foundation copied into it. So my-react-shell is a
**menu of modules**, not a framework, a fixed app template, or a UI kit.

## Principles

Every module is shaped to hold these — the goal restated at module scale:

- **Self-contained.** A module is importable on its own and never hard-depends on
  another module's *runtime*; only small pure types are shared. `theme` works
  without `i18n`, `auth` without `theme`. `AppProviders` composes them for
  convenience, but each stands alone.
- **Contract + default + bring-your-own.** Where an app must supply something, the
  module ships a TS **contract**, a sensible **default**, and a **BYO** path — the
  `auth` seam is the template, `i18n` follows it. Other modules are
  batteries-included drop-ins (theme, the Convex client provider): import and use.
- **Light barrel, optional peers behind sub-paths.** The barrel (`my-react-shell`)
  is the Convex-free theme core. Anything pulling a heavy or optional dependency
  lives at a sub-path (`my-react-shell/providers`, `/auth/convex`, `/app-shell`,
  `/components`, `/icons`), so a theme-only app installs nothing it doesn't use.
- **Semantic tokens only.** Components render against the shared `--color-*` token
  contract, in light *and* dark, across every palette — never a hardcoded color.
- **Reuse drives new modules.** A capability becomes a module on the rule of two —
  the second app that needs it — and reaches every app on the next version bump.
- **One API reference, guides for depth.** The single `docs/specifications/api-reference.md`
  is the authority for every export and its usage — kept in lockstep with the code. It is
  the only copy: it **ships inside the package** (`package.json` → `files`), so consumers
  get the version-matched reference on a tag bump and the `my-react-shell` skill points
  consumer agents at it. A module additionally ships a `docs/guides/<module>.md` for the
  *why* + deeper contract when there's more to say than the reference carries; one whose
  guide would only restate the reference ships none.

## Standing decisions

The decisions still in force, with the reasoning worth keeping. Numbers are stable
IDs other docs reference.

### D2 — Stack: Vite SPA + Convex, auth project-owned

No SSR — consumers live behind auth, and any public marketing surface is a separate
static site. Convex is the backend (`eu-west-1`, GDPR). shadcn/ui + Tailwind v4 are
the consumer's own UI tools, used directly.

**Auth is project-owned.** The `auth` module ships only the Convex Auth
(`@convex-dev/auth`) default — it runs entirely in Convex, with no auth server and
no cross-domain cookies — behind a pluggable seam. An app needing Better Auth
(crossDomain, Convex ≥ 1.25), SSO, or MFA implements the seam itself.

**The router is the consumer's.** No shipped module imports a router except the
optional `app-shell` (D10), so TanStack Router is a dev-harness dependency and an
*optional* peer for that one sub-path — never a barrel peer. It is the recommended
choice, not an imposed one.

### D3 — No registry, no MCP

my-react-shell hosts no shadcn registry and no MCP server. It ships an opinionated
component kit as compiled components (D11), not a registry of copy-in sources; the
un-opinionated primitives stay the consumer's, straight from shadcn.

### D5 — Distribution: a tag-pinned Bitbucket git-dependency

Consumed like an npm package from its Bitbucket repo
(`git+ssh://git@bitbucket.org:kesteinbakk/my-react-shell.git#<tag>`), pinned by tag
— no npm registry or Verdaccio to run. Consumers receive compiled **JS + `.d.ts`**
and import it with no bundler config (`import { … } from 'my-react-shell'`); raw TS
wouldn't work, since bundlers don't transpile `node_modules`. To ship an update:
push + tag; consumers bump the tag and reinstall, receiving updates only to the
modules they import. Git auth is plain git (SSH on dev machines; a Bitbucket
token/deploy key in CI).

Builds ship as a **committed `dist/`** (compiled by `build:lib`, source maps off), so
a git-dep install runs no build step and is zero-config — a pre-commit guard keeps
`dist/` in lockstep with `src/`. Details in
[distribution-model.md](guides/distribution-model.md).

### D6 + D13 — Theme tokens live in the shared `themes` package

The semantic `--color-*` token contract and the palettes are not owned here. They
live in a separate, **framework-neutral** package, `themes` (`~/Developer/themes`,
tag-pinned like D5), that **both my-react-shell (React) and `zingularis/foundation`
(SolidJS) consume** — pure CSS custom properties serve both ecosystems from one
source. This module is the React `ThemeProvider` + registry on top: it lets a
consumer **select** a palette, **define its own**
(`.theme-<name>-{light,dark}`), and follow light/dark/system with localStorage
persistence.

my-react-shell surfaces **five** palettes (`dynamic`, `forest`, `ocean`, `soft`,
`sunset`) and omits `golden` (literal Zingularis brand gold). Extracting the
contract ended real drift — the palettes had been duplicated byte-for-byte across
both repos and were starting to diverge. A color is now edited once in `themes`,
and a tag bump propagates it everywhere. The Solid `foundation` otherwise stays
independent and the source of truth for its own Solid modules.

**`themes` is consumed by my-react-shell via build-time vendoring, not as a
transitive runtime dep.** The palettes are copied into the shell's shipped
`src/themes/*.css` at release time (`pnpm sync:themes`) and imported relatively, so
a **consumer depends on only `my-react-shell`** — no second Bitbucket repo for CI to
authenticate to, no second tag to bump in lockstep, and no way for the shell and
themes to drift into an incompatible pair (the failure that rendered surfaces
transparent in a real install while dev looked fine). `themes` is a `devDependency`
of the shell whose pin records which tag the release vendors; foundation keeps
consuming `themes` its own way. Mechanics + the release chain:
[distribution-model.md](guides/distribution-model.md) and
[release-runbook.md](guides/release-runbook.md).

**What this module does not own — the shadcn bridge.** shadcn/ui primitives consume
their own cssVar names (`--background`, `--muted-foreground`, …), not the `--color-*`
contract. Mapping the two is **documented consumer wiring** — the canonical mapping
lives in [theme.md](guides/theme.md) → *Using these tokens with shadcn/ui* —
deliberately **not shipped**: both current consumers hand-roll it, but the mapping
carries real per-app latitude (how `secondary` / `popover` / `accent` / `input`
render, which optional shadcn surfaces — charts, sidebar — get mapped), so a shipped
one-size CSS would force those choices. Document now; if the latitude narrows,
rule-of-two can still promote it to a shipped `@import`.

### D7 — Repo shape: library + dev-harness, showcase elsewhere

One repo, two roles: the **library** consumers import, and a dev-only **harness**
Vite app of test routes that renders the modules for behavior verification — never a
feature showcase. The harness (`main.tsx`, `routes/**`, `routeTree.gen.ts`) is
excluded from the library emit and the package `exports`, so consumers never receive
it. Visual showcasing lives in the sister `my-react-shell-demo` project. Rationale:
theme/provider behavior (FOUC-free application, system-follow, provider composition)
is only fully catchable in-browser, not by typecheck.

### D9 — Convex is optional, isolated behind sub-paths

`convex` is an optional peer, and every Convex-coupled export sits behind a sub-path
— the client providers at `my-react-shell/providers`, the Convex Auth default at
`my-react-shell/auth/convex`. The barrel stays the Convex-free theme core, so a
theme-only consumer never installs Convex. This is the "light barrel" principle
applied to the heaviest peer, and it mirrors how the Solid `foundation` walls Convex
off in its `zing-shell` module.

### D10 — app-shell: an optional, router-coupled module

An optional `app-shell` module at `my-react-shell/app-shell` re-implements the
SolidJS foundation's shell for React: the chrome (`AppShell` header-or-sidebar +
mobile drawer + optional bottom nav + the single scrolling body), `ShellPageHeader`
(URL-derived breadcrumbs + actions + search + subPages dropdown),
`defineShellConfig`, and the page-tab primitives. It **excludes** app-specific glue
(notifications, feedback modal, command bar) — the consumer wires its own into the
header's action slot.

The shell is inherently **router-coupled** (breadcrumbs are a function of the URL;
`?tab=` is a deep-link contract), so TanStack Router is an optional peer *for this
sub-path only*, alongside the Radix primitives it uses (Sheet, DropdownMenu,
Popover). A router *seam* was rejected as heavier — the breadcrumb / scroll /
deep-link machinery leaks router semantics into the contract anyway. Display strings
arrive via config/props; the shell never imports the i18n module. It is one optional
module among others — never mandated, never the centerpiece.

### D11 — Component kit: opinionated composites only

An optional kit at `my-react-shell/components` ships React composites that bake a
design/layout/behavior decision on top of Radix + the theme tokens (Alert, dialogs,
structured cards, form fields, `UserPreferences`, …). The scope line: it ships
**only components that need an opinion**. The un-opinionated shadcn primitives
(Button, Input, Checkbox, plain Dialog, …) are not shipped — consumers use shadcn
directly, and the demo shows them as plain examples.

It is built on the same Radix / Tailwind / `class-variance-authority` foundation as
shadcn, but is **not** a copy-in registry (D3 stands) — it ships compiled
components styled with `mrs-`-prefixed semantic classes. Like the shell, it ships
its own CSS (`my-react-shell/components/styles.css`) rather than utilities, so a
consumer's Tailwind never has to scan `node_modules`.

### D12 — Icons↔emojis: a seam, not a registry

my-react-shell owns no icon kit, so the "use emojis instead of icons" preference
ships as a **seam**: the `icons` module (`my-react-shell/icons`) gives
`IconModeProvider` / `useIconMode` and a thin `<Icon icon emoji>` that swaps a glyph
for its emoji on the active mode — no baked-in registry, no `lucide-react`
dependency. Consumers bring their glyphs and route their existing `renderIcon`
through it. An optional `createIconRenderer(icons, emojis)` builds that `renderIcon`
from a consumer's maps and ports `foundation`'s two registry guardrails *without* a
registry: a missing-emoji check (compile-time via key-typed `emojis`, plus a dev
warning for dynamic maps) and a `force` (icon-only) list — `<Icon>` alone can't do
this, since it sees one resolved glyph+emoji pair, never the map. The paired
`<UserPreferences>` component (in the kit) is controlled and
persistence-agnostic — it reads each value and emits `onChange`, leaving storage to
the consumer — and stays auth-free, with account actions behind an optional slot.

### D14 — i18n: opt-in compile-time typed keys

The i18n seam is **stringly-typed by default, typed by choice**. Every public type
and hook (`TFunction`, `I18nContextValue`, `useTranslation`, `translateNow`) takes a
key type parameter `K extends string` that **defaults to `string`** — so the untyped
seam (`useTranslation()`, `t('any.dotted.key')`, `translateNow('x')`) compiles and
runs exactly as before. A consumer that wants a typo or a missing key caught at
compile time binds a key union once with `createTypedI18n<K>()` and gets every call
site typed with no per-call ceremony; one with a nested catalog derives the union
from it via the exported `DotPaths<typeof catalog>`.

`createTypedI18n` is pure typing sugar — no new context, no new runtime. The single
`<I18nProvider>` still owns all lifecycle, and the bound key type is only a
compile-time view over the same `string`-keyed translator. The point is that the
shared hub should be at least as strong as its strongest consumer: compile-time key
safety a consumer would otherwise hand-roll (a key union plus locale parity) is now
the seam's own, so adopting the shell seam never means downgrading. Binding a key
union (the factory) was chosen over per-call generics — where a forgotten type
argument silently degrades back to `string` — and over a catalog-only API, which is
awkward when a consumer already keeps a flat union; `DotPaths` is exported so the
catalog-derived path stays available without being forced.

### D15 — Surface ladder: mode-consistent roles (`raised` + two `sunken` levels)

The surface tokens are addressed by **role**, and each role means the same **depth**
in both light and dark. The contract is `surface-primary` (card) with
`surface-raised` *above* it (popovers, dropdowns, dialogs, toasts) and
`surface-sunken` / `surface-sunken-deep` *below* it (wells, inputs, table headers,
neutral notes, chips; then filled neutral badges/avatars and nested wells). This
**replaces** the earlier `surface-elevated` / `surface-secondary` / `surface-tertiary`
set, which inverted between modes — the "muted inset" tokens were darker than the card
in light (recessed, correct) but lighter than it in dark (raised, wrong), so a well
read inset in light and popped in dark. `surface-elevated` was also indistinct from the
card in light (both white). The new model keeps direction fixed: dark mode carries depth
with lightness (raised lighter, sunken darker); light mode can't exceed white, so
`surface-raised` is pure white over a hair-off-white card plus a stronger shadow, and
the sunken rungs go to a darker grey. Two sunken levels (not one) are kept because the
SolidJS `foundation` uses two distinct recessed tones in the same element (e.g. a
rest/hover pair), which a single token would flatten. This is shared-`themes` work, so
it ripples to `foundation` (D6+D13) on its next themes bump; `dynamic` was also lifted
off pure black at the same time (OLED smear, and to leave headroom to recess a well).

---

*Retired log entries, folded into the sections above: **D1** (the modular drop-in
thesis) is now **The goal**; **D4** (Solid `foundation` untouched) and **D8** (the
pivot to this model) are superseded — the current model is the result. Their
numbers are not reused.*
