---
name: react-framework
description: "Bootstrap a new React project on the recommended stack — Vite SPA + TanStack Router + Convex + shadcn/ui, auth = Convex Auth (default) or Better Auth (scale-up), static on Vercel. Points at the bundled reference guide + the non-negotiables agents get wrong.\nTRIGGER when: creating/scaffolding a NEW React app or project; setting up Vite + TanStack Router, shadcn, Convex, or Convex Auth / Better Auth from scratch; deciding the framework/stack for a new front end.\nDO NOT TRIGGER when: working on features in an already-set-up project; on a SolidJS Zingularis site (use create-new-site); on the SolidJS foundation/sites ecosystem."
---

# react-framework

Bootstrapping a new React project? The recommended stack is **Vite SPA + TanStack
Router + Convex (eu-west-1) + shadcn/ui**, auth = Convex Auth (default) / Better
Auth (scale-up), static on Vercel.

**Read the full guide first — recommendations + the why + the pitfalls:**
the `react-framework-notes.md` file beside this skill.

## Non-negotiables (agents get these wrong from training-data defaults)

- **pnpm only.** Never `npm install` — it desyncs the lockfile and crash-loops
  Convex dev.
- **Don't run dev servers / `convex dev`** (user owns them). React-specific
  consequence: `routeTree.gen.ts` and `convex/_generated/` only exist after the
  user runs dev — don't "fix" missing-module errors by starting a server.
  (Deps / `.env*` approval: root CLAUDE.md.)
- **Auth: decide first, follow one column.** Convex Auth (default, simplest,
  auth-server-less) vs Better Auth (scale-up: orgs/RBAC/passkeys/2FA). Don't
  interleave.
- **vite.config: `tanstackRouter()` BEFORE `react()`.**
- **Convex env: check, never default** (`if (!VITE_CONVEX_URL) throw`), and **no
  trailing slash** (breaks the sync websocket, code 1006).
- **`convex/tsconfig.json` needs `"types": ["node"]` + `@types/node`** (TS 6.0).
- **Build = `tsc -b && vite build`** (Vercel runs `pnpm build`; type errors must
  gate the deploy).

## Convex specifics

For schema, functions, auth setup, migrations, performance — use the existing
`convex-*` skills + the generated `convex/_generated/ai/guidelines.md`. This
skill only covers *bootstrapping the React side* and wiring Convex in.
