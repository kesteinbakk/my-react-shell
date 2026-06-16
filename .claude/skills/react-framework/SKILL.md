---
name: react-framework
description: "Bootstrap a new React project on the decided stack — Vite SPA + TanStack Router + Convex + shadcn, built on the shared my-react-shell foundation (app-shell + providers + i18n + registry), auth = Convex Auth (default) or Better Auth (scale-up), static on Vercel. Points to the full guide and the non-negotiables.\nTRIGGER when: creating/scaffolding a NEW React app or project; setting up Vite + TanStack Router, shadcn, Convex, or Convex Auth / Better Auth from scratch; deciding the framework/stack for a new front end.\nDO NOT TRIGGER when: working on features in an already-set-up project; on a SolidJS Zingularis site (use create-new-site); on the SolidJS foundation/sites ecosystem."
---

# react-framework

Bootstrapping a new React project? The decided stack is **Vite SPA + TanStack
Router + Convex (eu-west-1) + shadcn**, built on the shared **my-react-shell**
foundation, auth = Convex Auth (default) / Better Auth (scale-up), static on
Vercel.

**Read the full guide first — follow it, don't improvise:**
`~/Developer/notes/react-framework-guide.md` (verified, copy-paste steps).
`~/Developer/evaluering/` is the closest in-practice reference (kit/modules,
reuse rules, convex tsconfig, vercel.json) — copy its discipline, not its router.

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
- **Build on my-react-shell — don't rebuild it.** my-react-shell owns app-shell,
  providers (Convex/auth/theme), i18n, and the `~/config/*` contracts, and ships
  the shared shadcn registry. Wrap the router in its providers; render routes in
  its AppShell; pull UI from its registry via MCP. No hand-rolled shell, no local
  primitive kit.
- **Reuse-first UI.** Browse my-react-shell's registry via MCP before building any
  component; rule-of-two ⇒ contribute to the registry, never a local copy. No
  hardcoded strings (use the `t()` seam) or colors (semantic tokens). Seed these
  rules into the project CLAUDE.md.

## Convex specifics

For schema, functions, auth setup, migrations, performance — use the existing
`convex-*` skills + the generated `convex/_generated/ai/guidelines.md`. This
skill only covers *bootstrapping the React side* and wiring Convex in.
