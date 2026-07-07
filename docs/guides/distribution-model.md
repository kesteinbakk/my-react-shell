# Distribution Model

last updated: 2026-06-21

`my-react-shell` (React) and `foundation` (SolidJS) are distributed by **one
shared model**: each is a standalone repo (`my-react-shell` on GitHub, `foundation` on
Bitbucket) consumed as a **tag-pinned git-dependency** with a simple package import (`import { … } from 'my-react-shell'`,
`import { kit } from 'foundation'`). No file-copy sync, no npm / Verdaccio
registry, no pnpm workspace.

> `my-react-shell` already implements this model; `foundation` is being **migrated
> onto it** (off file-copy sync) — see foundation's copy of this doc for the
> required changes.

This doc is the authority for *how this package is shipped and consumed*.
Per-module exports and contracts live in the other `docs/guides/` files.

## The model (shared by both repos)

### Consumption contract
- A consumer adds a tag-pinned git dependency. `my-react-shell` is **public**, so one
  tokenless HTTPS spec works everywhere (dev machines and Vercel/CI):
  `"my-react-shell": "git+https://github.com/kesteinbakk/my-react-shell.git#vX.Y.Z"`
- The consumer imports by **bare specifier**: `import { … } from 'my-react-shell'`
  (plus the documented sub-paths). Never a relative path, never a `~/`-aliased
  copy in the consumer's own `src/`.
- Each consumer stays an independent repo with its own lockfile, its own Convex
  deployment, and its own Vercel project. Distribution adds a dependency edge —
  it never couples deploys or backends.

### Vendored `themes` (a consumer depends on ONLY my-react-shell)
- The `--color-*` token contract + palettes are **authored** in the shared **`themes`**
  package (one framework-neutral source of truth, shared with the SolidJS `foundation`)
  but are **vendored into the shell's shipped CSS** at release
  time — copied into committed `src/themes/*.css` by `pnpm sync:themes`, and imported
  **relatively** from `src/index.css` (`@import './themes/ocean.css'`). So a consumer
  receives the palettes **inside** `my-react-shell`; `themes` is **not** a transitive
  dependency. A consumer adds nothing and authenticates to nothing extra.
- **Why vendored, not transitive.** A transitive `themes` git-dep made CI authenticate
  to a *second* Bitbucket repo, forced *two* tags to be bumped in lockstep, and let the
  shell and themes drift into an **incompatible pair** (shell consuming newer surface
  tokens while pinning an older `themes` that lacks them → every surface renders
  transparent in a real install, masked by the dev symlink). Vendoring makes shell+themes
  **one versioned unit**
  at the shell's tag, so that drift is structurally impossible. It adds **no** propagation
  latency — consumers only ever got themes changes via a shell tag bump anyway (the shell
  pins themes).
- `themes` is now a **`devDependency`** of the shell (the pin records *which* themes the
  release vendors). The vendor pipeline reads the **sibling `../themes` checkout**, never
  `node_modules/themes` — the latter is re-materialized to the pinned tag by every `pnpm
  install`, so sourcing it would silently revert the vendored CSS to an older themes.
- `themes` is **pure CSS** — not a `resolve.dedupe` concern. The dedupe step below stays
  React/Radix/router-only.
- **`link:` loop:** the relative `@import './themes/…'` resolves into the shell's own
  `src/themes/`, kept live by the `rs:watch` sidecar (`scripts/dev-watch.mjs`), which
  mirrors `../themes` → `src/themes/` on every save. So a themes edit HMRs into link
  consumers with **no tag and no install** — see [release-runbook.md](../maintainers/release-runbook.md)
  → *Development*. The release re-vendors from the pinned tag; a pre-commit guard keeps
  `src/themes/` in lockstep between times.

### Versioning / release
- Tag-pinned (`vX.Y.Z`). To ship an update: push, then tag. Consumers bump the
  tag and reinstall, and receive only the modules they import (tree-shaken).
- Pre-1.0 alpha policy: break cleanly, no back-compat shims; callers are updated
  in the same change that changes the API.

### Local dev-loop (no push → tag → bump → reinstall)
The release loop is for *releases*. To iterate locally, point the consumer at the
local checkout — this is a **dev-only** redirect:
- In the consumer, set the dependency to a local link:
  `"my-react-shell": "link:../my-react-shell"` (or `pnpm link --dir ../my-react-shell`), then `pnpm install`.
- **Allow Vite to serve fonts from the shell's `node_modules` (`server.fs.allow`).**
  The optional font CSS exports (`my-react-shell/fonts/geist.css`,
  `my-react-shell/fonts/inter.css`) import from `@fontsource-variable/*` packages
  installed in the shell's own `node_modules`. On the `link:` loop, Vite resolves
  the `.woff2` url references to paths inside the shell's `node_modules` — outside
  the consumer's project root — and blocks them with **403 Forbidden** because they
  are outside the default `server.fs.allow` allowlist. Fix by whitelisting the shell
  directory:
  ```ts
  // vite.config.ts in the consumer
  server: {
    fs: { allow: ['.', '../my-react-shell'] },
  },
  ```
  `'.'` must be included alongside `'../my-react-shell'`: setting `fs.allow` explicitly
  replaces Vite's auto-detected roots (which normally include the project root), so
  omitting it blocks the consumer's own `index.html` with the same 403.
  This only affects the `link:` dev-loop. The tag-pinned git-dep install is
  unaffected: Vite resolves `.woff2` files from the consumer's own `node_modules`
  (the fontsource package is hoisted there on install) and serves them within the
  project root.
- **Keep `dist/` fresh while iterating.** A `link:` consumer reads the shell's
  committed `dist/`, never its `src/` — so a `src/` edit is invisible until `dist/`
  rebuilds. `dev start` handles this automatically: my-react-shell carries `watch = true`
  in the dev registry (`~/Developer/scripts/projects.toml`), so a `tsc --watch` sidecar
  (`rs:watch`) rebuilds `dist/` on every save and the demo's Vite hot-reloads. Outside a
  `dev start` session, run `pnpm build:lib:watch` in the shell checkout yourself. The
  pre-commit guard still rebuilds `dist/` at commit time — the watcher only covers the
  in-between iteration.
- **A breaking change breaks every link consumer's dev *the instant `dist/` rebuilds* —
  keep that window short.** Because a `link:` consumer reads `dist/` live (previous
  bullet), a rename or removed/renamed export takes down every running consumer dev server
  (`does not provide an export named …`) the moment the `rs:watch` sidecar rebuilds on
  save — not at release, *now*. So sequence a breaking change as one tight code step:
  **edit the shell source AND migrate every consumer that imports the changed surface
  (the demos, `offansk`, any live-linked app) together, let `dist/` rebuild once, then
  typecheck + load all of them.** Do the slow, dev-server-irrelevant polish — docs, the
  API reference, guides, comments — *only after* the code is migrated and green. The
  anti-pattern is rebuilding `dist/` and then spending a long docs pass while consumers
  still reference the old names: their dev servers sit broken for that entire detour. Code
  (shell + consumers, migrated together) → rebuild → verify → **then** docs.
- **Dedupe React (and the shared Convex-React layer) in the consumer's bundler.**
  This step applies **only to the `link:` loop** — not the tag-pinned git-dep path.
  A `link:` symlinks the shell's checkout, which carries its **own**
  `node_modules/react` (React is a devDependency here for the dev-harness, build, and
  tests). The consumer's Vite dev pre-bundler then resolves **two physically distinct
  React copies** — the app's own, and the linked package's reached through the
  symlink. Two Reacts share no hook dispatcher, so the **first my-react-shell
  component to call a hook** throws `Invalid hook call` /
  `Cannot read properties of null (reading 'useContext')` at first paint and the whole
  tree falls to the error boundary. Collapse to one copy in the consumer's
  `vite.config.ts`:
  ```ts
  resolve: {
    // theme-only consumer (the barrel): the React triple is enough
    dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    // consumer that uses `my-react-shell/providers`: also dedupe the shared
    // Convex-React layer; add `@convex-dev/auth` when using `/auth/convex` —
    // dedupe: ['react', 'react-dom', 'react/jsx-runtime',
    //          'convex', 'convex/react',
    //          '@convex-dev/auth'],  // only for /auth/convex
    // consumer that uses `my-react-shell/app-shell`: also dedupe the router
    // (a split @tanstack/react-router context breaks the shell's breadcrumbs /
    // active-nav) and the two Radix primitives the shell renders —
    // dedupe: ['react', 'react-dom', 'react/jsx-runtime',
    //          '@tanstack/react-router',
    //          '@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
  },
  ```
  The exact list is **what the consumer shares with the shell across the symlink**:
  always the React triple (every compiled module imports `react/jsx-runtime`); plus
  `convex` / `convex/react` / `@convex-dev/auth` when the consumer imports
  `my-react-shell/providers` or `my-react-shell/auth/convex`, and
  `@tanstack/react-router` / `@radix-ui/react-dialog` / `@radix-ui/react-dropdown-menu`
  when it imports `my-react-shell/app-shell` (those are the bare specifiers the
  compiled `dist/` externalizes). The router is **correctness-critical** for the
  same reason React is — a second copy means a second context, so the shell's
  `useRouterState` can't see the consumer's `RouterProvider`. The tag-pinned
  **git-dep path does not need any of this** — a real (non-symlinked) install resolves
  each bare specifier to the consumer's single copy through normal node resolution;
  the duplication is a symlink-only artifact.

  > **`vite build` does not catch this** — a production build never executes hook
  > code, so a green build is no signal either way. **Vitest does.** Tests that
  > render Radix-backed shell components (Dialog, Select, DropdownMenu, Popover,
  > Tooltip, …) fail with identical `Invalid hook call` /
  > `Cannot read properties of null (reading 'useContext')` errors — see the
  > Vitest section below.

- **Vitest (`link:` loop only).** The Vite dev server collapses React via
  `resolve.dedupe` at the pre-bundler stage. Vitest 4.x does not: it externalises
  all `node_modules` packages by default, loading them via Node's native resolution
  and bypassing Vite's resolver entirely. The shell's Radix transitive chain
  (`@radix-ui/*` → `react-remove-scroll` → its CJS files) resolves `react` from
  the shell's own `node_modules/react`, not the consumer's — the hook dispatcher
  splits and tests fail with `Invalid hook call` / `Cannot read properties of null`.

  `resolve.dedupe` and `resolve.alias` alone do not fix this. When Vitest inlines
  a CJS package, Vite wraps it with `createRequire(import.meta.url)` — subsequent
  `require()` calls inside that file bypass Vite's resolver entirely (no
  `resolveId`, no aliases, no dedupe). The fix needs two parts:

  **Part 1 — `vitest.config.ts`** (inline the shell and its Radix chain through
  Vite's transform pipeline for the ESM parts, plus a transform plugin that
  patches CJS `require("react")` calls Vite's transform hook can reach):

  ```ts
  import { fileURLToPath, URL } from 'node:url'
  import react from '@vitejs/plugin-react'
  import type { Plugin } from 'vite'

  // Patches CJS require("react") calls in shell files that DO reach the
  // transform hook (index.js entries). Belt-and-suspenders alongside the
  // Module._resolveFilename patch in vitest.setup.ts.
  function fixShellReactRequires(): Plugin {
    const dir = fileURLToPath(new URL('.', import.meta.url))
    const map: [RegExp, string][] = [
      [/require\(["']react\/jsx-runtime["']\)/g,    `require(${JSON.stringify(dir + 'node_modules/react/jsx-runtime.js')})`],
      [/require\(["']react\/jsx-dev-runtime["']\)/g, `require(${JSON.stringify(dir + 'node_modules/react/jsx-dev-runtime.js')})`],
      [/require\(["']react-dom\/client["']\)/g,     `require(${JSON.stringify(dir + 'node_modules/react-dom/client.js')})`],
      [/require\(["']react-dom\/server["']\)/g,     `require(${JSON.stringify(dir + 'node_modules/react-dom/server.js')})`],
      [/require\(["']react-dom["']\)/g,             `require(${JSON.stringify(dir + 'node_modules/react-dom/index.js')})`],
      [/require\(["']react["']\)/g,                 `require(${JSON.stringify(dir + 'node_modules/react/index.js')})`],
    ]
    return {
      name: 'fix-shell-react-requires',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/my-react-shell/')) return null
        let out = code
        for (const [re, replacement] of map) out = out.replace(re, replacement)
        if (out === code) return null
        return { code: out, map: null }
      },
    }
  }

  // vitest.config.ts frontend project config:
  {
    plugins: [react(), fixShellReactRequires()],
    resolve: {
      alias: [
        { find: '@', replacement: fileURLToPath(new URL('./src', import.meta.url)) },
      ],
      dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
    },
    test: {
      server: {
        deps: {
          inline: [
            /my-react-shell/,
            /@radix-ui\//,
            /react-remove-scroll/,
            /use-callback-ref/,
            /@floating-ui\/react-dom/,
          ],
        },
      },
    },
  }
  ```

  **Part 2 — `vitest.setup.ts`** (the critical fix — intercepts Node's native CJS
  resolution for `require()` calls that bypass Vite entirely via `createRequire`):

  ```ts
  import { createRequire } from 'node:module'
  import Module from 'node:module'

  // Vite's CJS inlining uses createRequire(import.meta.url), which bypasses
  // Vite's resolver. require("react") inside transitively-loaded CJS files
  // (e.g. react-remove-scroll/dist/es5/UI.js) resolves from the shell's pnpm
  // store — a different instance than the consumer's. Redirect any react/react-dom
  // resolved under the shell's node_modules to the consumer's copies.
  const consumerRequire = createRequire(import.meta.url)
  const consumerPaths: Record<string, string> = {
    react: consumerRequire.resolve('react'),
    'react-dom': consumerRequire.resolve('react-dom'),
    'react/jsx-runtime': consumerRequire.resolve('react/jsx-runtime'),
    'react/jsx-dev-runtime': consumerRequire.resolve('react/jsx-dev-runtime'),
  }
  const shellMarker = '/my-react-shell/node_modules/'

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const origResolve = (Module as any)._resolveFilename.bind(Module)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(Module as any)._resolveFilename = function (
    request: string,
    parent: NodeJS.Module | null,
    isMain: boolean,
    options?: Record<string, unknown>,
  ) {
    const resolved: string = origResolve(request, parent, isMain, options)
    if (resolved.includes(shellMarker) && request in consumerPaths) {
      return consumerPaths[request]
    }
    return resolved
  }
  ```

  **Prerequisite — Radix must be in the consumer's `node_modules`.** When Vite
  processes the shell's `@radix-ui/*` ESM imports, it resolves them from the
  consumer's root. If they are absent, Vite falls back to the shell's realpath
  where Radix finds the shell's React and the dedup fails. Consumers who
  removed shadcn must add the packages the components module exercises:

  ```bash
  pnpm add -D \
    @radix-ui/react-dialog \
    @radix-ui/react-dropdown-menu \
    @radix-ui/react-popover \
    @radix-ui/react-select \
    @radix-ui/react-tooltip
  ```

  A consumer that imports only `my-react-shell` (theme), `my-react-shell/i18n`,
  or `my-react-shell/icons` — and renders no Radix-backed components in tests —
  needs neither the explicit Radix devDeps nor this override.

- **Strip the link before committing.** A committed `link:`/`file:` specifier
  breaks every other clone and all Vercel/CI installs (the path won't exist).
  This is enforced by a **pre-commit guard** (`.githooks/pre-commit`, enabled via
  `pnpm setup:hooks`), not by memory.

### Worktrees on the `link:` dev-loop
Iterating from a git worktree (`.claude/worktrees/<slug>/`) is fine on the `link:`
loop — but a fresh worktree has **no `node_modules`** (it's gitignored), so
`my-react-shell`, React, and everything else are unresolvable until you link them.
The standard worktree step is the *whole* fix; there is nothing my-react-shell-specific
to add to it beyond knowing *why* it matters:
```bash
ln -s ../../../node_modules .claude/worktrees/<slug>/node_modules
```
That one symlink also carries the `link:` redirect **and** the dedupe across intact:
`node_modules/my-react-shell` is an absolute symlink to the shell checkout, so it still
resolves through the worktree → root → checkout chain, and `resolve.dedupe` lives in the
**tracked** `vite.config.ts`, so the single-React / single-Radix guarantee is already
present in the worktree. No extra config, no second dedupe list.

> **But a `link:` consumer reads the *primary* checkout, not your worktree.**
> `link:../my-react-shell` resolves to the primary working tree's path, so any edit you
> make **inside** a `.claude/worktrees/<slug>/` worktree — JS *or* CSS — is invisible to
> the demo until it lands on the branch the primary tree has checked out (`main`).
> Rebuilding `dist/` in the worktree doesn't help: the demo isn't reading the worktree at
> all. So verify worktree changes by landing them on `main` first (then the `rs:watch`
> rebuild + Vite hot-reload pick them up), not by staring at a demo that can't see them.

- **Never `pnpm install` inside the worktree — this is the actual trap.** A
  missing-module error in a fresh worktree tempts a reinstall, but that materializes a
  *second*, independent `node_modules` — a second React and a second copy of every Radix
  peer the shell renders. `resolve.dedupe` can no longer collapse them (the worktree now
  resolves its own freshly-installed copies first), and first paint throws `Invalid hook
  call` (or Radix's `composeRefs` recursion in the shell's breadcrumb dropdown). Symlink
  the root `node_modules`; do not reinstall.
- **Auto `claude/*` worktrees** (`Agent(isolation: "worktree")`) are created *without*
  this symlink. Make the `ln -s` above the first action inside the worktree, before any
  pnpm command — the `link:` dep is invisible otherwise. (This is the `worktree-flow`
  rule; it bites doubly here because the linked package vanishes with it.)

> Same blind spot as the dedupe note above: a green `vite build` / vitest run does **not**
> exercise this — only a live dev-server boot *from the worktree* does.

### Build sub-model (differs by language — by necessity)
The *distribution* model is shared; the *build* step differs because the two
compile differently:
- **React (`my-react-shell`):** ships a **precompiled, committed `dist/`**. `build:lib`
  (`tsc -p tsconfig.lib.json`) emits JS + `.d.ts` (no source maps — `src/` isn't
  shipped, so maps would dangle), and that `dist/` is committed, so a git-dep install
  runs **no build**: no `prepare`, no devDependency tree, none of pnpm's build-script
  gates (bundlers don't transpile `node_modules`, so raw TS can't ship anyway). A
  pre-commit guard rebuilds `dist/` whenever library source is staged, keeping it in
  lockstep with `src/`. The **dev-harness build** (`pnpm build` = `tsc -b && vite
  build`) emits to a **separate `dist-harness/`** (`build.outDir` in `vite.config.ts`),
  never `dist/` — Vite empties its `outDir` on every run, so sharing `dist/` would wipe
  the shipped module entry points.
  - **CSS ships uncompiled, straight from `src/` — never `dist/`.** The flagship CSS
    export `./styles.css` → `src/index.css` is a **Tailwind v4 source entry**
    (`@import 'tailwindcss'` + the vendored `./themes/*` palettes), expanded by the *consumer's*
    build against *their* content scan — it has no precompiled form, so it **must** ship
    as source. The finished kit/app-shell stylesheets (`./components/styles.css` →
    `src/components/components.css`, `./app-shell/styles.css` → `src/app-shell/app-shell.css`)
    are static `mrs-`-prefixed token CSS; they ship from `src/` too, so the rule is
    uniform — **authored CSS in `src/`, compiled JS + `.d.ts` in `dist/`**. Two
    consequences: (1) **rebuilding `dist/` never updates a CSS export** — `build:lib`
    only touches JS + `.d.ts`, so a CSS-only change that "won't show up" is never a
    stale-`dist/` problem; (2) on the `link:` loop CSS is therefore **live** (the demo
    reads `src/` and Vite hot-reloads on save), while JS still needs the `dist/` rebuild
    the `rs:watch` sidecar provides.
  - **Packing is self-maintaining — `files` ships `src/**/*.css` by glob, not a
    per-file list.** Because a CSS export resolves into `src/`, the file must also sit in
    the `files` allowlist or it resolves on the `link:` loop (whole checkout is visible)
    yet is **absent from the git-dep tarball** — a dev/prod skew that only bites the first
    real consumer. The glob removes that footgun mechanically: any `.css` under `src/` is
    packed automatically, so adding a CSS export is a **one-list** change (the `exports`
    map), not two. Verify a packing change with `npm pack --dry-run` (read-only — no
    install, no lockfile touch).
- **Solid (`foundation`):** ships **source under the Solid `"solid"` export
  condition** (JSX preserved), compiled by each consumer's `vite-plugin-solid`.
  A precompiled framework-agnostic dist is not viable for Solid (SSR + SPA
  hydration). See foundation's copy of this doc.

---

## This repo: status

`my-react-shell` is the reference implementation of the shared model (git-dep,
committed `dist/`, full `exports` / `peerDependencies`), and
distribution is in place: it ships a **committed, precompiled `dist/`** (built by
`build:lib`, no source maps), the dev-harness builds separately to `dist-harness/`,
the `files` allowlist is narrowed to `dist/` plus the authored CSS (`src/**/*.css`,
globbed so it self-maintains — see the CSS note above), and two pre-commit guards
(above) are wired — the committed-`link:` guard and the `dist/` freshness guard.

### Router peer — optional, app-shell only

Only `my-react-shell/app-shell` imports a router (`@tanstack/react-router`, externalized
in its compiled `dist/`); every other shipped module — the barrel, providers, auth,
i18n, components, icons — is router-free. So `@tanstack/react-router` is declared an
**optional** peer (also a `devDependency` here, for the dev-harness and the app-shell
build), installed by a consumer only when it imports the app-shell, never by a
theme-only or kit-only app. TanStack Router stays the overall recommendation for a
consumer app (see the `react-framework` guide); everywhere except app-shell that is the
consumer's own dependency, not one this package imposes.

### Zero-config installs — committed `dist/`

`dist/` is **committed** (built by `build:lib`, source maps off), so a git-dep install
is genuinely zero-config: pnpm checks out pre-built files and runs **no** lifecycle
build. Because there is no `prepare`, pnpm pulls **no** devDependency tree into the
consumer, and none of pnpm 10/11's build-script gates fire — neither
`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED` (no `prepare` to block) nor
`ERR_PNPM_IGNORED_BUILDS: esbuild` (esbuild is never installed there). The consumer
needs no `allowBuilds` entry and no per-release edit.

The trade-off is the standard committed-artifact cost: built files live in git, and
`dist/` must stay in lockstep with `src/`. That freshness is **enforced, not trusted**
— the `dist/` pre-commit guard rebuilds and stages `dist/` whenever library source is
staged (`.githooks/pre-commit`; intentional bypass `--no-verify`). `tsc` doesn't
prune, so after deleting or renaming a src module, do a one-time clean rebuild:
`rm -rf dist && pnpm build:lib && git add dist`.

---

## Consumer adoption (applies when an app adopts either package)

These are **dependency changes** and need explicit approval before they land:
- Satisfy peer floors **only for the modules used** — all of Convex is optional:
  `convex ≥1.41` for `my-react-shell/providers`; `@convex-dev/auth ≥0.0.94` +
  `@auth/core ≥0.41.1` for the Convex Auth default at `my-react-shell/auth/convex`. A
  theme-only consumer (the barrel) needs none of them. The router
  (`@tanstack/react-router`) is an optional peer too — only for `my-react-shell/app-shell`.
- One package manager only — **pnpm**. Settle any repo that still has an `npm`
  `package-lock.json` onto `pnpm` before adopting.
- No Vercel/CI token — `my-react-shell` is public, so the `git+https` specifier clones
  without auth. (A private shell fork would need a `GITHUB_TOKEN` + SSH→HTTPS install rewrite.)
- Install the committed-link guard in the consumer — a pre-commit hook that blocks
  committing the dev-loop `link:`/`file:` redirect, then `git config core.hooksPath
  .githooks`. Use the **link-check logic only**: the shell's own `.githooks/pre-commit`
  also runs dist/ + themes guards (`pnpm build:lib`, `sync-themes`) that a consumer
  lacks and that would block its commits — copy just the link guard, not the whole file.
- **When developing against the `link:` loop, dedupe React in the consumer's Vite
  config** so the symlinked shell's own React copy doesn't collide with the app's and
  crash first paint with `Invalid hook call` — see the dedupe step under "Local
  dev-loop" above. This is a `link:`-only dev concern (the tag-pinned git-dep path
  dedupes through normal resolution), so it is **not** a dependency change and needs
  no approval — just a `resolve.dedupe` key.
