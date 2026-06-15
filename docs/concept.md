# react-shell — concept

## What this is

**react-shell** is the React application foundation that sits **on top of
shadcn/ui** — everything a React + Convex app needs that shadcn does not provide.
shadcn (used via react-shell's shared private registry + its MCP server +
`CLAUDE.md` reuse rules) owns the UI-primitive and composite layer; react-shell
owns the layer above it:

- **App-shell** — routing chrome, header / footer / menu / bottom-nav, page
  chrome, the single shell scroll container, page-level and in-page tabs.
- **Providers** — Convex client, auth (Convex Auth by default; Better Auth for
  scale-up), theme.
- **i18n** — the `t()` seam and central-key policy.
- **Contracts** — the `~/config/*` inversion-of-control pattern, the app-shell
  rules (single scroll container, breadcrumb-from-URL, the three non-substitutable
  nav layers, `?tab=` deep-link contracts), and the no-silent-defaults /
  break-cleanly discipline.

react-shell also **hosts the shared shadcn registry** that new apps point at —
the brand tokens as a `registry:base` plus the bespoke composites shadcn lacks —
so the UI layer is shared, not re-derived per app. Base primitives come from
shadcn upstream.

## What it is NOT

- **Not a component library.** It does not ship Button / Dialog / Table / etc.
  Those come from shadcn. react-shell never hand-maintains primitives.
- **Not the SolidJS `foundation`.** That stays the source of truth for SolidJS
  consumers. react-shell is the React/shadcn-era equivalent of the layer the
  Solid foundation provides *above* its kit.
- **Not `foundation-react`.** foundation-react was a React port of the SolidJS
  *primitive kit*; with shadcn owning primitives that layer is redundant, and
  only its non-primitive, not-yet-built parts move here.

## Why it exists

The framework decision ([../../notes/react-framework-guide.md](../../notes/react-framework-guide.md))
concluded that component consistency for agent-built apps is solved by shadcn's
registry / MCP / rules **regardless of framework** — which removes the reason to
maintain an own primitive kit, but leaves the shell / providers / i18n /
contracts layer that shadcn never touches. react-shell is exactly that remaining
layer (plus the shared registry), built once and consumed by every new React app.

## Stack

Vite SPA + TanStack Router + Convex + shadcn/ui (react-shell's shared private
registry). Auth is **Convex Auth (`@convex-dev/auth`) by default** —
auth-server-less, no cross-domain — with **Better Auth (`@convex-dev/better-auth`,
crossDomain, Convex ≥ 1.25) as the scale-up** for orgs / RBAC / passkeys / 2FA /
SSO. pnpm · React 19 · TS 6 · Tailwind v4. Full rationale in the decision guide.
