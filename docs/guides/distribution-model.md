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
  This is enforced by a pre-push guard (see Required changes), not by memory.

### Build sub-model (differs by language — by necessity)
The *distribution* model is shared; the *build* step differs because the two
compile differently:
- **React (`my-react-shell`):** ships **precompiled `dist/`**. A `prepare` build
  runs `tsc -p tsconfig.lib.json` on install → JS + `.d.ts`. Consumers get
  zero-config JS (bundlers don't transpile `node_modules`, so raw TS can't ship).
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
4. **Add a committed-link guard.** Extend the `pre-push-checks` gate (or a
   pre-commit hook) in this repo and in each consumer to reject a staged
   `package.json` whose dependency on `my-react-shell` uses a `link:`/`file:`
   specifier. Machine gate over checklist.
5. **Verify the release path once, end to end.** From a scratch dir, after
   cutting a real tag: `pnpm add 'git+ssh://git@bitbucket.org:kesteinbakk/my-react-shell.git#vX.Y.Z'`
   and confirm (a) `prepare` runs, (b) `dist/` is emitted, (c) both
   `import { ThemeProvider } from 'my-react-shell'` and
   `import 'my-react-shell/styles.css'` resolve. No consumer has installed this
   yet; "landed" means code-present, not proven-consumable.
6. **Narrow the `files` allowlist** (optional, recommended). `files: ["dist", "src"]`
   ships the entire raw `src` tree (including the dev-harness) into every install.
   Narrow to `["dist", "src/index.css", "src/styles"]` so only `dist/` plus the
   CSS the `styles.css` export needs is packed.

### Open decision (needs approval before acting)
- **Router peer.** `@tanstack/react-router` is currently a **mandatory** peer, so
  even the router-agnostic modules (theme / providers / auth) drag it in. Consider
  moving it behind the sub-path(s) that actually use routing (mirroring how
  `@convex-dev/auth` is isolated behind `my-react-shell/auth/convex` +
  `peerDependenciesMeta.optional`). This is a dependency-surface change.

---

## Consumer adoption (applies when an app adopts either package)

These are **dependency changes** and need explicit approval before they land:
- Satisfy peer floors (e.g. for `my-react-shell`: `convex ≥1.41`,
  `@convex-dev/auth ≥0.0.94`, `@auth/core ≥0.41.1`, and a router decision).
- One package manager only — **pnpm**. Settle any repo that still has an `npm`
  `package-lock.json` onto `pnpm` before adopting.
- Configure the Vercel/CI Bitbucket token for the `git+https` specifier.
