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
- **Strip the link before committing.** A committed `link:`/`file:` specifier
  breaks every other clone and all Vercel/CI installs (the path won't exist).
  This is enforced by a **pre-commit guard** (`.githooks/pre-commit`, enabled via
  `pnpm setup:hooks`), not by memory.

### Build sub-model (differs by language — by necessity)
The *distribution* model is shared; the *build* step differs because the two
compile differently:
- **React (`my-react-shell`):** ships **precompiled `dist/`**. A `prepare` build
  runs `tsc -p tsconfig.lib.json` on install → JS + `.d.ts` (bundlers don't transpile
  `node_modules`, so raw TS can't ship). **Caveat:** `prepare`-on-install is *not*
  zero-config on pnpm 10/11 — see "Open decision — `prepare`-on-install vs committed
  `dist/`" below.
- **Solid (`foundation`):** ships **source under the Solid `"solid"` export
  condition** (JSX preserved), compiled by each consumer's `vite-plugin-solid`.
  A precompiled framework-agnostic dist is not viable for Solid (SSR + SPA
  hydration). See foundation's copy of this doc.

---

## Required changes — `my-react-shell`

This repo is already the reference implementation of the model (strategy **D5**:
git-dep, `prepare`→`dist/`, full `exports`/`peerDependencies`). The remaining work
is hardening, not redesign:

1. **Add a named watch script** for the dev-loop. The package exports `dist/`
   (not `src/`) and `prepare` does **not** run for a `link:` dep, so a bare link
   serves stale/missing output until `dist/` is emitted. Add:
   ```jsonc
   "build:lib:watch": "tsc -p tsconfig.lib.json --watch"
   ```
   Dev-loop = `pnpm build:lib` once, then `pnpm build:lib:watch`, then link in the
   consumer.
2. **Fix the stale `vite.config.ts` header comment** (it still describes the
   superseded "ship raw TS, consumer's Vite transpiles" model). State that
   `vite.config.ts` builds only the dev-harness, and the library ships compiled
   `dist/` via `prepare` / `tsconfig.lib.json`.
3. **Document the CSS requirement.** `my-react-shell/styles.css` ships **raw
   Tailwind v4 source** (`@import 'tailwindcss'`, `tw-animate-css`,
   token-referencing palettes) — it is *not* zero-config like the JS. The
   consumer must run Tailwind v4 / PostCSS and have `tw-animate-css` installed.
   Record this in the theme guide and the package README.
4. **Committed-link guard — done (machine gate).** A `pre-commit` git hook
   (`.githooks/pre-commit`, enabled per clone with `pnpm setup:hooks` →
   `core.hooksPath`) rejects committing a staged `package.json` that carries **any**
   `link:`/`file:` dependency specifier (generalized — no shipped self-dependency
   exists to make a `my-react-shell`-specific check fire here). No husky / extra
   dependency. Intentional bypass: `git commit --no-verify`. Each consumer gets the
   same guard by copying `.githooks/pre-commit` and running the same setup — see
   Consumer adoption.
5. **Verify the release path once, end to end — done, with a finding.** Tag
   `v0.1.0` was pushed and installed from a scratch dir via
   `pnpm add 'git+ssh://…#v0.1.0'`. Result: once builds are allowed, (a) `prepare`
   runs, (b) `dist/` is emitted, (c) `my-react-shell`, `my-react-shell/styles.css`,
   and `my-react-shell/auth/convex` all resolve, and the narrowed `files` holds
   (only `index.css` + `styles/` under `src`). **But the install is not zero-config
   on pnpm 10/11** — see the Open decision below.
6. **Narrow the `files` allowlist** (optional, recommended). `files: ["dist", "src"]`
   ships the entire raw `src` tree (including the dev-harness) into every install.
   Narrow to `["dist", "src/index.css", "src/styles"]` so only `dist/` plus the
   CSS the `styles.css` export needs is packed.

### Resolved decision — router peer
- **Router peer: removed entirely.** No shipped module imports a router (it was
  harness-only — `main.tsx` / `routes/` / `routeTree.gen.ts`, all excluded from the
  library emit), so `@tanstack/react-router` is **not** a peer dependency. It stays a
  `devDependency` for the dev-harness; there was no routing sub-path to gate it
  behind. Consumers pick their own router (TanStack Router remains the recommended
  choice — see the `react-framework` guide — but as the consumer's own dependency,
  not one this package imposes).

### Open decision — `prepare`-on-install vs committed `dist/`
The `prepare`→`dist/` model (D5) is **not zero-config on pnpm 10/11**, surfaced by
the item-5 release verification:
- **`ERR_PNPM_GIT_DEP_PREPARE_NOT_ALLOWED`** — pnpm blocks a git dep's `prepare`
  build unless the consumer allowlists it in `pnpm-workspace.yaml`. The only key that
  matches is the **full git-spec including the commit hash** (`my-react-shell@git+ssh://…#<hash>: true`);
  a glob or version key is rejected — so the consumer must edit that file **every
  release** (the hash changes per tag).
- **`ERR_PNPM_IGNORED_BUILDS: esbuild`** (exit 1) — to run `prepare` (`tsc`), pnpm
  installs `my-react-shell`'s **entire devDependency tree** into the consumer, and
  esbuild's build script trips a second gate. A "successful" install still exits
  non-zero (CI reads it as failure).

Options (a decision is needed; not yet taken):
- **B — commit `dist/`** (recommended): un-gitignore + commit built output; no build
  script runs on install → genuinely zero-config, no devDep tree pulled, no allowlist.
  Revises D5. Cost: build artifacts in git + keep `dist/` fresh (enforceable).
- **A — keep `prepare`-on-install, document the allowlist**: consumer adds the
  hash-pinned `allowBuilds` key per release + allows esbuild (fragile, heavy install).
- **C — `dangerouslyAllowAllBuilds: true`** as the documented consumer step: stable,
  one line, but still drags the full devDep tree in and globally allows build scripts.

`v0.1.0` is published but stands as the "not-yet-zero-config" data point; the chosen
fix ships as `v0.1.1`. **The local `link:` dev-loop is unaffected** (no `prepare`,
no git fetch) — it is the path the `my-react-shell-demo` app uses.

---

## Consumer adoption (applies when an app adopts either package)

These are **dependency changes** and need explicit approval before they land:
- Satisfy peer floors (e.g. for `my-react-shell`: `convex ≥1.41`, plus
  `@convex-dev/auth ≥0.0.94` + `@auth/core ≥0.41.1` only if using the Convex Auth
  default at `my-react-shell/auth/convex`). No router peer — the consumer brings its
  own router.
- One package manager only — **pnpm**. Settle any repo that still has an `npm`
  `package-lock.json` onto `pnpm` before adopting.
- Configure the Vercel/CI Bitbucket token for the `git+https` specifier.
- Copy the committed-link guard: drop `.githooks/pre-commit` into the consumer repo
  and run `git config core.hooksPath .githooks` (or add the same `setup:hooks`
  script). It blocks committing the dev-loop `link:`/`file:` redirect.
