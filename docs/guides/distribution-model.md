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
- A consumer adds a tag-pinned git dependency:
  - dev machines (SSH): `"my-react-shell": "git+ssh://git@github.com:kesteinbakk/my-react-shell.git#vX.Y.Z"`
  - Vercel / CI (HTTPS + token): `"my-react-shell": "git+https://x-access-token:$GITHUB_TOKEN@github.com/kesteinbakk/my-react-shell.git#vX.Y.Z"`
- The consumer imports by **bare specifier**: `import { … } from 'my-react-shell'`
  (plus the documented sub-paths). Never a relative path, never a `~/`-aliased
  copy in the consumer's own `src/`.
- Each consumer stays an independent repo with its own lockfile, its own Convex
  deployment, and its own Vercel project. Distribution adds a dependency edge —
  it never couples deploys or backends.

### Vendored `themes` (a consumer depends on ONLY my-react-shell)
- The `--color-*` token contract + palettes are **authored** in the shared **`themes`**
  package (strategy D6+D13) but are **vendored into the shell's shipped CSS** at release
  time — copied into committed `src/themes/*.css` by `pnpm sync:themes`, and imported
  **relatively** from `src/index.css` (`@import './themes/ocean.css'`). So a consumer
  receives the palettes **inside** `my-react-shell`; `themes` is **not** a transitive
  dependency. A consumer adds nothing and authenticates to nothing extra.
- **Why vendored, not transitive.** A transitive `themes` git-dep made CI authenticate
  to a *second* Bitbucket repo, forced *two* tags to be bumped in lockstep, and let the
  shell and themes drift into an **incompatible pair** (shell consuming D15 surface
  tokens while pinning a pre-D15 `themes` → every surface renders transparent in a real
  install, masked by the dev symlink). Vendoring makes shell+themes **one versioned unit**
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
  consumers with **no tag and no install** — see [release-runbook.md](release-runbook.md)
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
- **Keep `dist/` fresh while iterating.** A `link:` consumer reads the shell's
  committed `dist/`, never its `src/` — so a `src/` edit is invisible until `dist/`
  rebuilds. `dev start` handles this automatically: my-react-shell carries `watch = true`
  in the dev registry (`~/Developer/scripts/projects.toml`), so a `tsc --watch` sidecar
  (`rs:watch`) rebuilds `dist/` on every save and the demo's Vite hot-reloads. Outside a
  `dev start` session, run `pnpm build:lib:watch` in the shell checkout yourself. The
  pre-commit guard still rebuilds `dist/` at commit time — the watcher only covers the
  in-between iteration.
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

  > **Build/test do not catch this.** `vite build` and vitest resolve React
  > differently than the dev pre-bundler, so a green build/test run does **not**
  > exercise the failing path. Only a live dev-server boot does.
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

`my-react-shell` is the reference implementation of the shared model (strategy
**D5**: git-dep, committed `dist/`, full `exports` / `peerDependencies`), and
distribution is in place: it ships a **committed, precompiled `dist/`** (built by
`build:lib`, no source maps), the dev-harness builds separately to `dist-harness/`,
the `files` allowlist is narrowed to `dist/` plus the authored CSS (`src/**/*.css`,
globbed so it self-maintains — see the CSS note above), and two pre-commit guards
(above) are wired — the committed-`link:` guard and the `dist/` freshness guard.

### No router peer

No shipped module imports a router — it was harness-only (`main.tsx` / `routes/` /
`routeTree.gen.ts`, all excluded from the library emit) — so `@tanstack/react-router`
is a `devDependency` here, not a peer. Consumers bring their own router (TanStack
Router stays the recommendation — see the `react-framework` guide — but as the
consumer's own dependency, not one this package imposes).

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
- Satisfy peer floors **only for the modules used** — all of Convex is optional now
  (D9): `convex ≥1.41` for `my-react-shell/providers`; `@convex-dev/auth ≥0.0.94` +
  `@auth/core ≥0.41.1` for the Convex Auth default at `my-react-shell/auth/convex`. A
  theme-only consumer (the barrel) needs none of them. No router peer — the consumer
  brings its own router.
- One package manager only — **pnpm**. Settle any repo that still has an `npm`
  `package-lock.json` onto `pnpm` before adopting.
- Configure the Vercel/CI GitHub token (`GITHUB_TOKEN`) for the `git+https` specifier.
- Copy the committed-link guard: drop `.githooks/pre-commit` into the consumer repo
  and run `git config core.hooksPath .githooks` (or add the same `setup:hooks`
  script). It blocks committing the dev-loop `link:`/`file:` redirect.
- **When developing against the `link:` loop, dedupe React in the consumer's Vite
  config** so the symlinked shell's own React copy doesn't collide with the app's and
  crash first paint with `Invalid hook call` — see the dedupe step under "Local
  dev-loop" above. This is a `link:`-only dev concern (the tag-pinned git-dep path
  dedupes through normal resolution), so it is **not** a dependency change and needs
  no approval — just a `resolve.dedupe` key.
