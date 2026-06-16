# T001 — port-and-rebuild-on-shadcn

**Status:** in-progress | **Type:** feature | **Branch:** main
**Origin:** [react-framework-guide.md](../../../../notes/react-framework-guide.md) §2 + §5 — shadcn owns the primitive layer; this project owns everything above it.
**Depends on:** nothing. **Blocks:** every my-react-shell consumer.

## Goal

Stand up **my-react-shell** as the non-shadcn React foundation: **port** the parts of
`zingularis/foundation-react` that survive the shadcn decision, and **rebuild on
top of shadcn** the parts that should not be hand-maintained primitives. After
this task a consumer app gets app-shell + providers + i18n + contracts from
my-react-shell and **all UI primitives from my-react-shell's shared shadcn registry** —
with no overlap between the two layers.

## Background

See [react-framework-guide.md](../../../../notes/react-framework-guide.md): §2
establishes that shadcn (my-react-shell's shared registry + MCP + `CLAUDE.md` reuse
rules) owns the UI-primitive/composite layer; §1/§5 land the stack on Vite SPA +
TanStack Router + Convex + shadcn, and §4 sets auth to **Convex Auth (default) /
Better Auth (scale-up)**. **This project is the layer the guide says shadcn does
NOT provide — and it ships that shared registry.**

`foundation-react` today is ~62 leaf primitives on Base UI + CVA (exactly the
layer shadcn now replaces) plus 8 brand-theme CSS files; its app-shell /
providers / i18n / theme-provider slices are planned-but-unbuilt. So this is a
**port of the durable parts, not a wholesale copy** — and the SolidJS
`foundation` stays untouched as the source of truth for Solid consumers.

## Scope / deliverables

1. **Do NOT port the primitives.** The ~62 Base-UI/CVA leaf components in
   `zingularis/foundation-react/src/foundation/kit/` are superseded by shadcn —
   do not bring them across. (shadcn now supports the same Base UI headless
   layer, so the underlying primitives are the same.)
2. **Shared shadcn registry (the UI contribution):** stand up my-react-shell's
   shared registry + shadcn MCP + the `CLAUDE.md` reuse rule. Carry across the
   `base.css` semantic-token contract + **5 themes** (`dynamic` / `forest` /
   `ocean` / `soft` / `sunset`) as a `registry:base` — `foundation-golden` is
   **dropped** (Zingularis brand), and `ThemeProvider` lets a consumer select a
   palette *and* define its own. Carry the bespoke composites shadcn lacks
   (**`PhiCard`** — φ/golden-*ratio* geometry, the canonical Solid-`foundation`
   name, not `foundation-react`'s "GoldenCard" — `CompactColorPicker` /
   `CompactIconPicker`, `InlineEditText`, the imperative `alertDialog` API) as
   registry items. `ReactionPill`/`ReactionGroup` are **dropped** (a feature, not
   a primitive). See strategy D6.
3. **App-shell (the hard, durable core):** build the React shell on shadcn —
   AppShell, header/footer/menu/bottom-nav, page chrome, the single shell scroll
   container, page-level tabs + in-page tabs. Carry the framework-agnostic
   contracts from the SolidJS foundation's `app-shell-rules.md` **verbatim**:
   single shell scroll container, breadcrumb as a pure function of the URL, the
   three non-substitutable nav layers, and `?tab=` deep-link contracts.
4. **Providers + auth seam:** Convex client + theme providers, plus a **pluggable
   auth seam** the consumer fills. my-react-shell ships **only the Convex Auth
   (`@convex-dev/auth`) default** (auth-server-less, no cross-domain) — the
   batteries-included path for the common private-SPA case. It does **NOT** ship
   Better Auth or any other provider: a project that needs Better Auth / SSO /
   MFA / orgs implements its own auth provider through the seam (incl. Better
   Auth's `@convex-dev/better-auth` crossDomain wiring, Convex ≥ 1.25). Auth
   beyond the Convex Auth default is the project's responsibility.
5. **i18n:** the `t()` seam + central-key policy + missing-key dev surface.
6. **Contracts:** the `~/config/*` inversion-of-control pattern and the
   no-silent-defaults / break-cleanly discipline, written up as this project's
   standing guides in `docs/guides/`.

## Distribution & repo shape

- **Consumed as a tag-pinned Bitbucket git-dependency** (ships TS source for the
  consumer's Vite to transpile; `prepare`-build fallback). No npm registry to run.
  The shadcn registry is a separate static-JSON host. See strategy D5.
- **One repo, two roles:** the importable **library** + a dev-only **harness Vite
  app** (showcase + test routes) that renders the shell for behavior verification —
  app-shell contracts are only catchable in-browser. See strategy D7.

## Build sequence

Each phase is a commit point.

- [x] **0 — record + scope** — decisions D5–D7 in [strategy.md](../../strategy.md);
  scope refined; index → `in-progress`.
- [x] **A — scaffold** — Vite 8 + TanStack Router + Tailwind v4 + TS6
  project-references; git-dep `package.json` (TS-source `exports`, peers + dev
  mirrors); dev-harness entry (`main.tsx` + `routes/{__root,index}`); empty library
  barrel `src/index.ts`. Node-side typecheck (`vite.config`) passes. **Harness boot
  + `routeTree.gen.ts` generation pend the user's first `pnpm dev`** (router plugin
  generates the route tree; until then the app-project typecheck reports a missing
  `./routeTree.gen` — expected).
- [x] **B — theming** — token contract `src/styles/base.css` (`:root` semantic
  `--color-*` contract + themed base styles) and the 5 palettes
  `src/styles/themes/{ocean,forest,sunset,soft,dynamic}.css` as
  `.theme-<name>-{light,dark}` classes (values ported verbatim from the Solid
  `foundation`; `golden` dropped). React `ThemeProvider` + `useTheme` +
  `themeContext` under `src/theme/` (light/dark, system-follow, palette
  selection, **open theme set** for consumer-defined palettes, localStorage
  persistence), exported from the barrel; harness wired (root provider + theme
  playground on `/`). `tsc -b` passes; CSS compiles and all palette `var(--color-*)`
  references resolve. No new deps. **Notes:** (1) the foundation's hand-rolled
  color *utility classes* (`.text-primary`, `.bg-primary`, …) are deliberately
  **not** ported — several collide semantically with shadcn/Tailwind conventions;
  proper Tailwind v4 `@theme` exposure + the shadcn token **bridge**
  (`--background`/`--primary`/… names) land with the registry wiring in **G**. The
  *contract* (the variables) is fully carried. (2) Added the universal `*-border`
  tokens to the `:root` contract (every palette already fills them). (3) Fixed a
  pre-existing scaffold issue: dropped deprecated `baseUrl` from
  `tsconfig.app.json` (TS6 TS5101) so the app project typechecks. **Pends the
  user's in-browser check via `pnpm dev`.**
- [x] **C — providers + auth seam** — `createConvexClient` + `ConvexClientProvider`
  (`src/providers/`; throws on absent `VITE_CONVEX_URL` *and* on a trailing slash —
  no silent default). `AppProviders` composes `ThemeProvider` + Convex client +
  the optional auth seam. The **auth seam** (`src/auth/seam.ts`: `AuthProvider` /
  `AuthProviderProps`) is auth-agnostic; the **Convex Auth default**
  (`ConvexAuthDefaultProvider`, `src/auth/convex-auth.tsx`) ships at the
  **`my-react-shell/auth/convex` sub-path export** — the only place `@convex-dev/auth`
  is imported, so it + `@auth/core` stay **optional peers** (a Better-Auth consumer
  never imports them). `VITE_CONVEX_URL` typed in `vite-env.d.ts`. Deps added in a
  prior commit (peer + dev; betas pinned exact). `tsc -b` passes. **Note:** the
  harness root stays `ThemeProvider`-only so it boots without `VITE_CONVEX_URL`;
  live Convex/auth verification needs the consumer's env + `convex dev` (user-owned).
- [ ] **D — app-shell core** *(next)* — `AppShell` (single `[data-shell-content]` scroll
  container, pinned chrome slot + body cell), header/menu/bottom-nav/footer,
  `ShellPageHeader` (breadcrumb = pure function of URL), `defineShellConfig` +
  `useDynamicPages` + the three nav layers.
- [ ] **E — page/tab primitives** — `PageSections` (in-page `?tab=`, sticky strip,
  scrollspy on the body cell), `PageTabs` (route-level), `LocalTabs`; the `?tab=`
  deep-link contract; `sections-playground` / `tabs-playground` test routes.
- [ ] **F — i18n seam** — `t()` + central-key policy + missing-key dev surface.
- [ ] **G — registry composites** — `PhiCard`, `CompactColorPicker` /
  `CompactIconPicker`, `InlineEditText`, imperative `alertDialog` as shadcn registry
  items + registry-host wiring.
- [ ] **H — guides/specs** — app-shell-rules (verbatim minus the SSR/Solid-reactivity
  rules), `~/config` contract, theming, providers, consumer bootstrapping.

The no-SSR stack drops `foundation`'s Kobalte-focus / thunk-children / Portal-SSR
rules, halving D/E.

## Exit criteria

- A consumer can install my-react-shell + point shadcn at its shared registry and
  get a booting, themed, authenticated app shell with type-safe routing —
  pulling **every UI primitive from shadcn** and **every shell / provider /
  contract from my-react-shell**, with no duplicated component layer.
- App-shell contracts documented in `docs/guides/`; no primitive clone present in
  the repo.

## Out of scope

- Any consumer feature UI.
- The SolidJS `foundation` (unchanged — it serves Solid consumers).
- Migrating existing apps (e.g. evaluering) onto my-react-shell.
