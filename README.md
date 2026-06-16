# my-react-shell

A **modular React foundation** for React + Convex apps: a menu of optional,
self-contained, versioned **drop-in modules** an app imports à la carte — **theme**
(semantic-token contract + palettes + light/dark/system), **providers** (Convex
client + the single `AppProviders` wrapper), an **auth seam** (a TypeScript contract
plus a Convex Auth default and a bring-your-own path), and **i18n** (planned). It is
**not** a framework, a fixed app template, or a UI component kit — consumers build
their own components with shadcn/ui directly. It is consumed like a standard npm
package, as a **tag-pinned Bitbucket git-dependency**.

See [`docs/concept.md`](docs/concept.md) for what this is and its boundary, and
[`docs/strategy.md`](docs/strategy.md) for the standing decisions. The distribution
model is documented in [`docs/guides/distribution-model.md`](docs/guides/distribution-model.md).

## Install

Add it as a tag-pinned git dependency (`#vX.Y.Z`). **pnpm only** — never `npm
install` (it desyncs the lockfile and Convex dev then crash-loops).

- **Dev machines (SSH):**
  ```jsonc
  "my-react-shell": "git+ssh://git@bitbucket.org:kesteinbakk/my-react-shell.git#vX.Y.Z"
  ```
- **Vercel / CI (HTTPS + token):**
  ```jsonc
  "my-react-shell": "git+https://x-token-auth:$BITBUCKET_TOKEN@bitbucket.org/kesteinbakk/my-react-shell.git#vX.Y.Z"
  ```

On install, the package's `prepare` build compiles `src/ → dist/` (JS + `.d.ts`), so
the importable library is zero-config — consumers receive compiled JS + types with no
bundler config. To take an update, bump the tag and reinstall; you receive only the
modules you import (tree-shaken).

## Usage

```ts
import { AppProviders, ThemeProvider, createConvexClient } from 'my-react-shell'
import { ConvexAuthDefaultProvider } from 'my-react-shell/auth/convex'
import 'my-react-shell/styles.css'
```

The Convex Auth default provider lives at the `my-react-shell/auth/convex` sub-path
(not the main barrel) so `@convex-dev/auth` stays an *optional* peer — a consumer that
brings its own auth (Better Auth, SSO, …) never imports it. Wrap your own TanStack
Router in `AppProviders` and pass an auth provider:

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
define your own palette — is documented in the theme guide once it lands in Phase G.)

## Peer requirements

From `package.json` `peerDependencies`:

| Peer | Range | Notes |
|------|-------|-------|
| `react` | `^19.0.0` | required |
| `react-dom` | `^19.0.0` | required |
| `convex` | `^1.41.0` | required |
| `@convex-dev/auth` | `^0.0.94` | **optional** — only for the `my-react-shell/auth/convex` sub-path |
| `@auth/core` | `^0.41.1` | **optional** — only for the `my-react-shell/auth/convex` sub-path |

`@convex-dev/auth` and `@auth/core` are declared `optional` in
`peerDependenciesMeta`: a consumer that doesn't use the Convex Auth default never
needs them.

> **No router peer.** my-react-shell ships no code that imports a router, so
> `@tanstack/react-router` is **not** a peer dependency — a consumer picks (or
> omits) a router on its own. TanStack Router is still the *recommended* router for
> a consumer app (see the `react-framework` guide), but that's the consumer's own
> dependency, not one this package imposes.

## Local dev-loop

To iterate on a module against a real consumer without the push → tag → bump →
reinstall cycle:

1. In this repo, build once: `pnpm build:lib`.
2. Keep it rebuilding on change: `pnpm build:lib:watch`.
3. In the consumer, point the dependency at this checkout —
   `"my-react-shell": "link:../my-react-shell"` (or `pnpm link --dir
   ../my-react-shell`) — then `pnpm install`.

> The package exports `dist/` (not `src/`) and `prepare` does **not** run for a
> `link:` dependency, so the link serves stale/missing output until `dist/` is
> emitted — hence the `build:lib` + `build:lib:watch` steps.

**Strip the link before committing.** A committed `link:` / `file:` specifier breaks
every other clone and all Vercel/CI installs, because the path won't exist there.
