# my-react-shell

A **modular React foundation** for React + Convex apps: a menu of optional,
self-contained, versioned **drop-in modules** an app imports à la carte — **theme**
(semantic-token contract + palettes + light/dark/system), **providers** (Convex
client + the single `AppProviders` wrapper), an **auth seam** (a TypeScript contract
plus a Convex Auth default and a bring-your-own path), **i18n** (the `t()` seam —
central catalog, `{{param}}` interpolation, opt-in compile-time typed keys, dev
missing-key overlay), and an
opinionated **component kit** (`my-react-shell/components` — Alert, dialogs, structured
cards, form fields, … on shadcn/Radix + the theme tokens). It is **not** a framework or
a fixed app template, and ships only the *opinionated* composites — consumers use
shadcn/ui directly for the un-opinionated primitives. It is consumed like a standard npm
package, as a **tag-pinned GitHub git-dependency**.

**The fast path for "what's exported and how do I use it":**
[`docs/specifications/api-reference.md`](docs/specifications/api-reference.md) — every
export, per import path, with signatures and minimal usage. See
[`docs/concept.md`](https://github.com/kesteinbakk/my-react-shell/blob/main/docs/concept.md)
for what this is and its boundary, and
[`docs/strategy.md`](https://github.com/kesteinbakk/my-react-shell/blob/main/docs/strategy.md)
for the standing decisions. The distribution model is documented in
[`docs/guides/distribution-model.md`](docs/guides/distribution-model.md).

## Install

Add it as a tag-pinned git dependency (`#vX.Y.Z`). **pnpm only** — never `npm
install` (it desyncs the lockfile and Convex dev then crash-loops).

**Public repo — one spec everywhere, no token:**

```jsonc
"my-react-shell": "git+https://github.com/kesteinbakk/my-react-shell.git#vX.Y.Z"
```

It clones over HTTPS with no credentials, on dev machines and on Vercel/CI alike. (Only
if you fork the shell *private* do you need an SSH spec on dev + a `GITHUB_TOKEN`
install-command rewrite on CI.)

The package ships a **committed, precompiled `dist/`** (JS + `.d.ts`), so the install
is zero-config — pnpm checks out pre-built files and runs no build step; you receive
compiled JS + types with no bundler config. To take an update, bump the tag and
reinstall; you receive only the modules you import (tree-shaken).

## Usage

```ts
import { ThemeProvider } from 'my-react-shell'                       // theme — the Convex-free core
import { AppProviders, createConvexClient } from 'my-react-shell/providers' // needs `convex`
import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'      // needs `@convex-dev/auth`
import 'my-react-shell/styles.css'
```

The barrel (`my-react-shell`) is the **Convex-free core** — only the theme module — so
a theme-only app never pulls Convex. Anything that imports Convex lives behind a
sub-path:
- **`my-react-shell/providers`** — the Convex client context (`AppProviders`,
  `ConvexClientProvider`, `createConvexClient`) and the `AuthProvider` seam type. Needs
  the optional `convex` peer.
- **`my-react-shell/auth/convex`** — the Convex Auth default. Needs the optional
  `@convex-dev/auth` peer; a consumer bringing its own auth (Better Auth, SSO, …) never
  imports it.

Wrap your own router in `AppProviders` and pass an auth provider:

```tsx
<AppProviders authProvider={ConvexAuthDefaultProvider}>{/* … */}</AppProviders>
```

## CSS requirement — `my-react-shell/styles.css` is NOT zero-config

Unlike the compiled JS, the stylesheet ships **raw Tailwind v4 source**, not a
precompiled CSS file. `my-react-shell/styles.css` is `src/index.css`, which begins
with:

```css
@import 'tailwindcss';
@import 'tw-animate-css';
```

…followed by the semantic-token contract and the palettes. For this import to
**resolve and process**, the consumer must:

1. **Run Tailwind v4** in its own build — via PostCSS or the `@tailwindcss/vite`
   plugin. my-react-shell does not pre-bundle Tailwind output; the consumer's
   Tailwind pipeline is what processes these `@import`s.
2. **Have `tw-animate-css` installed** as a dependency, so `@import 'tw-animate-css'`
   resolves.

Without a Tailwind v4 pipeline and `tw-animate-css` present, importing
`my-react-shell/styles.css` will fail to resolve or process. (The theme module's full
CSS / token contract — palettes, the `.theme-<name>-{light,dark}` classes, and how to
define your own palette — is documented in
[`docs/guides/theme.md`](docs/guides/theme.md).)

## Peer requirements

From `package.json` `peerDependencies`:

| Peer | Range | Needed for |
|------|-------|------------|
| `react` | `^19.0.0` | **required** (every module) |
| `react-dom` | `^19.0.0` | **required** (every module) |
| `convex` | `^1.41.0` | `my-react-shell/providers`, `my-react-shell/auth/convex` |
| `@convex-dev/auth` | `^0.0.94` | `my-react-shell/auth/convex` (Convex Auth default) |
| `@auth/core` | `^0.41.1` | `my-react-shell/auth/convex` (Convex Auth default) |
| `@tanstack/react-router` | `^1.170.0` | `my-react-shell/app-shell` |
| `@radix-ui/react-dialog` | `^1.1.17` | `my-react-shell/app-shell`, `my-react-shell/components` |
| `@radix-ui/react-dropdown-menu` | `^2.1.18` | `my-react-shell/app-shell`, `my-react-shell/components` |
| `@radix-ui/react-popover` | `^1.1.17` | `my-react-shell/components` |
| `@radix-ui/react-select` | `^2.3.1` | `my-react-shell/components` |
| `@radix-ui/react-accordion` | `^1.2.14` | `my-react-shell/components` |
| `@radix-ui/react-collapsible` | `^1.1.14` | `my-react-shell/components` |
| `class-variance-authority` | `^0.7.1` | `my-react-shell/components` |
| `clsx` | `^2.1.1` | `my-react-shell/components` |
| `tailwind-merge` | `^3.6.0` | `my-react-shell/components` |
| `react-colorful` | `^5.7.0` | `my-react-shell/components` (only `ColorPicker`) |

Only `react` / `react-dom` are required. **Everything else is declared `optional` in
`peerDependenciesMeta`** — a **theme-only** consumer (importing just the barrel) needs
none of them. Add a peer only when you import the module that needs it (right-hand
column); your package manager's warnings about the unused ones are safe to ignore.

> **Router is an optional peer — and only for `app-shell`.** The barrel, providers,
> auth, i18n, components, and icons import no router, so a theme-only or kit-only
> consumer brings none. `@tanstack/react-router` is declared as an **optional** peer for
> the one module that imports it — `my-react-shell/app-shell` — so install it only when
> you use the app-shell. TanStack Router is also the *recommended* router for a consumer
> app overall (see the `react-framework` guide), but everywhere except app-shell that is
> the consumer's own choice, not one this package imposes.

## Local dev-loop

To iterate on a module against a real consumer without the push → tag → bump →
reinstall cycle:

1. In this repo, build once: `pnpm build:lib`.
2. Keep it rebuilding on change: `pnpm build:lib:watch`.
3. In the consumer, point the dependency at this checkout —
   `"my-react-shell": "link:../my-react-shell"` (or `pnpm link --dir
   ../my-react-shell`) — then `pnpm install`.
4. **Dedupe React in the consumer's `vite.config.ts`** — `link:`-only step:
   ```ts
   resolve: {
     dedupe: ['react', 'react-dom', 'react/jsx-runtime'],
     // + 'convex', 'convex/react', '@convex-dev/auth' if you use
     //   my-react-shell/providers or my-react-shell/auth/convex
   },
   ```

> The package exports `dist/` (not `src/`). A fresh clone already ships a committed
> `dist/`, but a `link:` consumer sees your live edits only after `dist/` is rebuilt —
> hence the `build:lib` + `build:lib:watch` steps. (On commit, the pre-commit guard
> rebuilds `dist/`, so the committed copy always matches `src/`.)

> **Why step 4 — the `Invalid hook call` footgun.** A `link:` symlinks this
> checkout, which carries its **own** `node_modules/react` (a devDependency, for the
> dev-harness, build, and tests). The consumer's Vite dev pre-bundler then resolves
> **two physically distinct React copies** — the app's, and the linked package's
> reached through the symlink — which share no hook dispatcher. The first
> my-react-shell component to call a hook throws `Invalid hook call` /
> `Cannot read properties of null (reading 'useContext')` at first paint. The
> `resolve.dedupe` collapses them to one copy. This bites the **`link:` loop only**;
> a tag-pinned git-dep install resolves a single React through normal node
> resolution and needs none of it. `vite build` and tests resolve React differently
> than the dev pre-bundler, so neither catches this — only a live dev-server boot does.

**Strip the link before committing.** A committed `link:` / `file:` specifier breaks
every other clone and all Vercel/CI installs, because the path won't exist there.
This is enforced by a **pre-commit guard**, not by memory.

## Repo setup (contributors)

After cloning, enable the git hooks once:

```bash
pnpm setup:hooks   # sets core.hooksPath to .githooks
```

This installs a **pre-commit committed-link guard** (`.githooks/pre-commit`) that
rejects any staged `package.json` carrying a `link:` / `file:` dependency specifier —
the local dev-loop redirect above must never be committed. Bypass intentionally with
`git commit --no-verify`. A consumer of my-react-shell gets the same protection with
the **committed-link guard only** — the shell's `.githooks/pre-commit` *also* carries
dist/ + themes guards specific to this repo (they run `pnpm build:lib` / `sync-themes`,
which a consumer does not have and which would block its commits), so a consumer
installs a **trimmed hook containing just the link check**, not the whole file, then
runs the same `core.hooksPath` setup.
