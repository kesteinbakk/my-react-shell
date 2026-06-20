---
name: my-react-shell
description: "How to consume the my-react-shell library — what every module exports, which import path it lives behind, and how to wire each one (theme, providers, auth seam, i18n, component kit, icons, app-shell). The full export surface ships inside the package — read node_modules/my-react-shell/docs/specifications/api-reference.md; this card is the map + the gotchas that cost agents the most time.\nTRIGGER when: importing from `my-react-shell` or any sub-path (`/providers`, `/auth/convex`, `/i18n`, `/components`, `/icons`, `/app-shell`); wiring AppProviders / ThemeProvider / the i18n `t()` seam / the component kit / the app-shell in a React app; deciding which my-react-shell export or import path to use; needing to know what my-react-shell exports or how a module is configured.\nDO NOT TRIGGER when: bootstrapping a brand-new React project from scratch (use react-framework); building or maintaining the my-react-shell library internals (the repo's own docs/guides are authoritative there); SolidJS / foundation projects."
---

# my-react-shell — using the library

A **modular React foundation** consumed as a tag-pinned git-dependency: a menu of
optional, self-contained drop-in modules. Import only what you need.

**Read the full export surface first — every export, signature, and minimal usage.** It
**ships inside the package**, version-matched to the tag you've pinned:

- In a **consumer project**: `node_modules/my-react-shell/docs/specifications/api-reference.md`
- In the **my-react-shell repo** itself: `docs/specifications/api-reference.md`

This card below is the map + the gotchas.

## Mental model

The barrel `my-react-shell` is the **Convex-free theme core**. Everything heavier sits
behind a **sub-path**, so a theme-only app installs nothing it doesn't use. Modules
never hard-depend on each other's runtime — take only what you want.

## Which import path do I need?

| You want… | Import from | Optional peer to install | CSS |
|---|---|---|---|
| Light/dark + palettes | `my-react-shell` | — | `my-react-shell/styles.css` |
| Convex client + the one app wrapper | `my-react-shell/providers` | `convex` | — |
| The shipped Convex Auth default | `my-react-shell/auth/convex` | `convex`, `@convex-dev/auth`, `@auth/core` | — |
| Translations (`t()` seam) | `my-react-shell/i18n` | — (zero-dep) | — |
| Opinionated composites (Alert, Table, dialogs, …) | `my-react-shell/components` | `class-variance-authority`, `clsx`, `tailwind-merge`, some `@radix-ui/*` | `my-react-shell/components/styles.css` + `my-react-shell/styles.css` |
| Icons↔emojis preference + `<Icon>` swap | `my-react-shell/icons` | — | — |
| Header/sidebar chrome + page header + tabs | `my-react-shell/app-shell` | `@tanstack/react-router`, `@radix-ui/react-{dialog,dropdown-menu,popover}` | `my-react-shell/app-shell/styles.css` |

`react`/`react-dom ^19` are the only always-required peers. **`import type`** the
`…Props` / contract types (erased at runtime).

## Gotchas that cost the most time

- **It ships only *opinionated* composites.** Button, Input, Checkbox, plain Dialog,
  Tooltip, Card, … are **not** exported — use shadcn directly. The kit ships Alert,
  InfoBox, EmptyState, Spinner, ConfirmDialog, Toast, ActionButton, Badge, Chip,
  Avatar, Table, PhiCard, InputField, SegmentedControl, Select, UserPreferences, `cn`.
- **No router peer in the barrel.** Only `app-shell` couples to TanStack Router. Pick
  your own router for everything else.
- **`my-react-shell/styles.css` is NOT zero-config.** It's raw Tailwind v4 source
  (token contract + palettes) — your build must run **Tailwind v4** and have
  **`tw-animate-css`** installed. The compiled JS *is* zero-config; the stylesheet
  isn't. The `components`/`app-shell` stylesheets *are* plain prebuilt CSS.
- **shadcn token bridge isn't shipped.** shadcn primitives read `--background` etc.,
  not the `--color-*` contract — map them once in your `index.css` (canonical mapping
  is in the my-react-shell repo's `docs/guides/theme.md`).
- **`VITE_CONVEX_URL`: never defaulted, no trailing slash** — `createConvexClient`
  throws on absent and rejects a trailing slash (close code 1006).
- **Auth ships no UI and needs the Convex side configured.** `ConvexAuthDefaultProvider`
  wires only the React client; bring-your-own auth = implement the `AuthProvider` type.
- **i18n central-key policy.** Every user-facing string through `t()` against the
  central catalog; typed keys are opt-in via `createTypedI18n`.
- **app-shell breadcrumbs are a pure function of the URL** — only a registered route
  (`pages`/`subPages`/`useDynamicPages`) adds a crumb. Strings arrive as `() => t('…')`
  thunks; the shell never imports i18n.
- **Updating the library:** bump the pinned git tag (`#vX.Y.Z`) and reinstall — you
  receive only the modules you import. The `link:` dev-loop must dedupe React in the
  consumer's Vite config or first paint throws `Invalid hook call`.

## Deep guides

The API reference (paths above) is the **single source of truth** — it ships inside the
package, version-matched to the installed tag, so there is no copy to drift. The library
repo (`~/Developer/my-react-shell`) additionally carries a per-module guide in
`docs/guides/` for the *why* + deeper contract (theme, providers, auth, i18n, icons,
app-shell — the `components` module has no separate guide, the reference covers it).
