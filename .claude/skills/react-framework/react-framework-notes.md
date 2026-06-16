# React Framework Notes — reference for new projects

*last updated: 2026-06-16*

A starting point when spinning up a **new React app** behind auth with a
reactive, edit-to-DB UX. These are recommendations and the pitfalls worth
knowing — not a fixed runbook. Adapt per project; nothing here ties you to a
specific foundation or internal package.

## Recommended stack

| Area | Pick | Notes |
|---|---|---|
| Package manager | **pnpm** | Not npm — see pitfalls. |
| Build | **Vite** | `@vitejs/plugin-react`. |
| Router | **TanStack Router** | File-based, type-safe. Scaffold SPA-only (no SSR). |
| UI | **shadcn/ui** + **Tailwind v4** | Copy-in components via CLI/MCP; CSS-first Tailwind (`@tailwindcss/vite`), no `tailwind.config`. |
| Backend | **Convex** | Reactive: read = `useQuery` subscription, write = mutation. Pick the EU region (`eu-west-1`) if GDPR applies. |
| Auth | **Convex Auth** (default) / **Better Auth** (scale-up) | Decide before scaffolding auth — see Auth below. |
| Deploy | **Vercel** (static) + `convex deploy` | Frontend and backend deploy separately. |
| Runtime | React 19 · TypeScript · Node (pin via `.nvmrc`) | |

## Why this shape

- **Vite SPA + TanStack Router over Next.js.** A live reactive, edit-to-DB app
  is almost entirely client-side; Next's RSC / Server Actions model fights that —
  you spend effort suppressing framework defaults rather than using them.
- **SPA over TanStack Start.** When Convex *is* the backend (queries, mutations,
  file storage, HTTP actions, secrets) and there's no SSR/SEO requirement, a
  server layer is mostly redundant. The SPA is the smaller surface and cheaper to
  run (static assets, no server runtime).
- **Escape hatch:** if you later genuinely need SSR/SEO, TanStack Start uses the
  same router — the route code carries over. (For a public marketing surface, a
  separate static site is usually simpler than adding SSR to the app.)

## Setup essentials

```bash
# 1. Scaffold a router-only (no SSR) React SPA
pnpm dlx @tanstack/cli@latest create my-app --framework React --router-only --package-manager pnpm

# 2. UI: shadcn + Tailwind v4
pnpm add -D @tailwindcss/vite
pnpm dlx shadcn@latest init                       # components.json, @/ alias, components/ui, lib/utils
pnpm dlx shadcn@latest mcp init --client claude   # optional: let agents browse/install components via MCP
pnpm dlx shadcn@latest add button dialog input table

# 3. Backend: Convex (the USER runs convex dev — it's long-running + interactive on first run)
pnpm add convex
pnpm exec convex dev          # creates the dev deployment, writes VITE_CONVEX_URL, generates convex/_generated
```

`vite.config.ts` — **`tanstackRouter()` must come before `react()`**:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

export default defineConfig({
  plugins: [
    tanstackRouter({ target: 'react', autoCodeSplitting: true }), // BEFORE react()
    react(),
    tailwindcss(),
  ],
  resolve: { alias: { '@': '/src' } },
})
```

The `@tanstack/router-plugin` generates and watches `src/routeTree.gen.ts` from
`src/routes/` — no separate route-generator CLI. Type safety comes from
`createRouter` + a `Register` module augmentation.

## Auth — decide first, follow one path

| | **Convex Auth** (default) | **Better Auth** (scale-up) |
|---|---|---|
| Package | `@convex-dev/auth` | `@convex-dev/better-auth` |
| Best for | Private SPA: password / OAuth / magic-link / OTP | Orgs/teams, RBAC, passkeys, 2FA, SSO, plugins |
| Runs | Entirely in Convex — no auth server, no cross-domain cookies | In Convex; an SPA needs the `crossDomain` plugin (app origin ≠ `*.convex.site`) |
| Cost | Low (it's beta — pin the version) | Higher: crossDomain + extra env vars + CORS |

The two need different convex-side files and env vars, so **pick one before
wiring auth — don't interleave them.** Reach for Better Auth only when you
actually need orgs/RBAC/passkeys/2FA/SSO; otherwise the smaller surface wins. For
SSO/MFA at scale, a third-party provider (Clerk/Auth0/WorkOS) is also an option.

Auth secrets and provider config live on the Convex deployment (`SITE_URL`,
client id/secret), never in the repo. Use **separate OAuth apps per
environment**; callback is `https://<deployment>.convex.site/api/auth/callback/<provider>`.

> **Route gates are cosmetic.** A client-side `<Authenticated>` gate decides what
> to *render*; it is not a security boundary. Every Convex function must re-check
> authorization server-side at a single choke point.

## Pitfalls worth knowing

- **pnpm only.** `npm install` writes `package-lock.json`, desyncs the pnpm
  lockfile, and Convex dev's startup deps-check then crash-loops. On pnpm 11, add
  `allowBuilds: { esbuild: true }` to `pnpm-workspace.yaml` or install fails on
  esbuild's native-build script.
- **Generated files appear only after dev runs.** `src/routeTree.gen.ts` and
  `convex/_generated/` don't exist until the dev server has run — missing-module
  type errors before that are expected, not a bug to "fix." Don't hand-edit or
  lint these files (`routeTree.gen.ts` is single-quoted by the plugin; a
  formatter will fight it — add both to ESLint `ignores`).
- **`VITE_CONVEX_URL`: no trailing slash** — a trailing slash breaks the sync
  websocket (close code 1006). And **check it, don't default it** — a
  `localhost`-shaped fallback passes locally and fails only in production; throw
  on absence instead.
- **`convex/tsconfig.json` needs node types** — `"types": ["node"]` plus
  `@types/node` as a devDependency (required since TS 6.0, since auth providers
  read `process.env.*`).
- **Build must type-check.** Set `"build": "tsc -b && vite build"` so type errors
  gate the Vercel build (Vercel runs `pnpm build`).
- **SPA needs a catch-all rewrite on Vercel** — without
  `{ "source": "/(.*)", "destination": "/index.html" }` in `vercel.json`, deep
  links and refresh 404. Add security headers and `Disallow: /` (robots) for a
  private app.
- **Pin fast-moving / beta deps.** Convex Auth is beta — pin it and point at the
  installed-version docs (stale examples are the main failure mode). Pin
  `@auth/core` to the exact version Convex Auth requires; pin `better-auth` to a
  tilde range. Verify versions against current docs rather than `@latest`.
- **Keep a data-access seam.** Read Convex through one `src/data/` hooks layer
  rather than calling `useQuery`/`useMutation` from feature components — keeps the
  data source swappable and components thin.

## Sources

- TanStack Router (file-based routing): <https://tanstack.com/router/latest/docs/framework/react/routing/file-based-routing>
- TanStack CLI (`create … --router-only`): <https://tanstack.com/start/latest/docs/framework/react/cli>
- shadcn CLI / registry / MCP: <https://ui.shadcn.com/docs/cli> · <https://ui.shadcn.com/docs/registry> · <https://ui.shadcn.com/docs/mcp>
- Convex + React (Vite) quickstart: <https://docs.convex.dev/quickstart/react>
- Convex Auth: <https://labs.convex.dev/auth>
- Convex + Better Auth (React/Vite): <https://labs.convex.dev/better-auth/framework-guides/react>
- Deploy Vite SPA to Vercel: <https://vercel.com/docs/frameworks/vite>
