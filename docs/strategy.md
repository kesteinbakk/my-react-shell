# react-shell — strategy (decision log)

Standing decisions for this project. Newest on top. Full framework rationale:
[../../notes/react-framework-guide.md](../../notes/react-framework-guide.md).

## D1 — react-shell is the "everything above shadcn" layer

shadcn/ui (used via react-shell's **shared private registry** + MCP + `CLAUDE.md`
reuse rules) owns UI primitives and composites. react-shell **hosts that shared
registry** (brand tokens as a `registry:base` + the bespoke composites shadcn
lacks) and owns what shadcn does not: app-shell, providers, i18n, and the
cross-app contracts. We do **not** maintain an own primitive kit. Source:
react-framework-guide §2/§5.

## D2 — Stack: Vite SPA + TanStack Router + Convex + shadcn; dual auth

Per the guide's Option C. No SSR (consumers are behind auth; a separate Astro
site handles any public marketing surface). **Auth = Convex Auth
(`@convex-dev/auth`) by default** — runs entirely in Convex, no auth server, no
cross-domain — with **Better Auth (`@convex-dev/better-auth`, crossDomain plugin,
Convex ≥ 1.25) as the scale-up** for orgs / RBAC / passkeys / 2FA / SSO.
react-shell's provider layer supports both paths; for the Better Auth path, spike
the cross-domain wiring before relying on it. Source: react-framework-guide §1, §4.

## D3 — foundation-react's primitives are not ported

The ~62 Base-UI/CVA leaf components are superseded by shadcn (which now supports
the same Base UI headless layer). Only the durable, non-primitive parts move
here; the brand token values and the few bespoke composites shadcn lacks become
shadcn registry items. Source: foundation-react investigation.

## D4 — The SolidJS `foundation` is untouched

`zingularis/foundation` remains the source of truth for SolidJS consumers.
react-shell is its React/shadcn-era sibling for the above-the-kit layer, not a
replacement.
