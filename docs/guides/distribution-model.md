# Distribution Model

last updated: 2026-06-16

`my-react-shell` (React) and `foundation` (SolidJS) are distributed by **one
shared model**: each is a standalone Bitbucket repo consumed as a **tag-pinned
git-dependency** with a simple package import (`import { … } from 'my-react-shell'`,
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
  - dev machines (SSH): `"my-react-shell": "git+ssh://git@bitbucket.org:kesteinbakk/my-react-shell.git#vX.Y.Z"`
  - Vercel / CI (HTTPS + token): `"my-react-shell": "git+https://x-token-auth:$BITBUCKET_TOKEN@bitbucket.org/kesteinbakk/my-react-shell.git#vX.Y.Z"`
- The consumer imports by **bare specifier**: `import { … } from 'my-react-shell'`
  (plus the documented sub-paths). Never a relative path, never a `~/`-aliased
  copy in the consumer's own `src/`.
- Each consumer stays an independent repo with its own lockfile, its own Convex
  deployment, and its own Vercel project. Distribution adds a dependency edge —
  it never couples deploys or backends.

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

### Build sub-model (differs by language — by necessity)
The *distribution* model is shared; the *build* step differs because the two
compile differently:
- **React (`my-react-shell`):** ships **precompiled `dist/`**. A `prepare` build
  runs `tsc -p tsconfig.lib.json` on install → JS + `.d.ts` (bundlers don't transpile
  `node_modules`, so raw TS can't ship). The **dev-harness build** (`pnpm build` =
  `tsc -b && vite build`) emits to a **separate `dist-harness/`** (`build.outDir` in
  `vite.config.ts`), never `dist/` — Vite empties its `outDir` on every run, so sharing
  `dist/` would wipe the shipped module entry points. **Caveat:** `prepare`-on-install
  is *not* zero-config on pnpm 10/11 — see "Known limitation" below.
- **Solid (`foundation`):** ships **source under the Solid `"solid"` export
  condition** (JSX preserved), compiled by each consumer's `vite-plugin-solid`.
  A precompiled framework-agnostic dist is not viable for Solid (SSR + SPA
  hydration). See foundation's copy of this doc.

---

## This repo: status

`my-react-shell` is the reference implementation of the shared model (strategy
**D5**: git-dep, `prepare`→`dist/`, full `exports` / `peerDependencies`), and
distribution is in place: it ships precompiled `dist/` via `prepare`, the dev-harness
builds separately to `dist-harness/`, the `files` allowlist is narrowed to `dist/`
plus the CSS the `styles.css` export needs, and the committed-`link:` guard (above)
is wired.

### No router peer

No shipped module imports a router — it was harness-only (`main.tsx` / `routes/` /
`routeTree.gen.ts`, all excluded from the library emit) — so `@tanstack/react-router`
is a `devDependency` here, not a peer. Consumers bring their own router (TanStack
Router stays the recommendation — see the `react-framework` guide — but as the
consumer's own dependency, not one this package imposes).

### Known limitation — `prepare`-on-install is not zero-config on pnpm 10/11

The package ships on the `prepare`→`dist/` model and has since `v0.1.0`. The one
rough edge: a consumer installing via the **tag-pinned git-dep path** on pnpm 10/11
does not get a zero-config install. This is currently **latent** — the local `link:`
dev-loop is unaffected (no `prepare`, no git fetch) and is the path
`my-react-shell-demo` uses — but a real git-dep consumer hits two gates:
- **`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`** — pnpm blocks a git dep's `prepare`
  build unless the consumer allowlists it in `pnpm-workspace.yaml`. The only key that
  matches is the full git-spec including the commit hash
  (`my-react-shell@git+ssh://…#<hash>: true`), which changes per tag — so the
  consumer would edit that file every release.
- **`ERR_PNPM_IGNORED_BUILDS: esbuild`** (exit 1) — running `prepare` (`tsc`) pulls
  `my-react-shell`'s entire devDependency tree into the consumer, and esbuild's build
  script trips a second gate; a "successful" install still exits non-zero.

**Workaround** for a git-dep consumer: approve the builds in its
`pnpm-workspace.yaml` (`dangerouslyAllowAllBuilds: true` is the one-line form, at the
cost of pulling in the devDep tree). **Fallback**, if a truly zero-config install
becomes a hard requirement: commit `dist/` (un-gitignore + keep it fresh) so no build
runs on install — that would revise D5's build-on-install detail, trading a clean
working tree for the simpler install.

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
- Configure the Vercel/CI Bitbucket token for the `git+https` specifier.
- Copy the committed-link guard: drop `.githooks/pre-commit` into the consumer repo
  and run `git config core.hooksPath .githooks` (or add the same `setup:hooks`
  script). It blocks committing the dev-loop `link:`/`file:` redirect.
- **When developing against the `link:` loop, dedupe React in the consumer's Vite
  config** so the symlinked shell's own React copy doesn't collide with the app's and
  crash first paint with `Invalid hook call` — see the dedupe step under "Local
  dev-loop" above. This is a `link:`-only dev concern (the tag-pinned git-dep path
  dedupes through normal resolution), so it is **not** a dependency change and needs
  no approval — just a `resolve.dedupe` key.
