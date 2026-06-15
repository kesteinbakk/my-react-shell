# T001 — port-and-rebuild-on-shadcn

**Status:** planning | **Type:** feature | **Branch:** main
**Origin:** [react-framework-guide.md](../../../../notes/react-framework-guide.md) §2 + §5 — shadcn owns the primitive layer; this project owns everything above it.
**Depends on:** nothing. **Blocks:** every react-shell consumer.

## Goal

Stand up **react-shell** as the non-shadcn React foundation: **port** the parts of
`zingularis/foundation-react` that survive the shadcn decision, and **rebuild on
top of shadcn** the parts that should not be hand-maintained primitives. After
this task a consumer app gets app-shell + providers + i18n + contracts from
react-shell and **all UI primitives from react-shell's shared shadcn registry** —
with no overlap between the two layers.

## Background

See [react-framework-guide.md](../../../../notes/react-framework-guide.md): §2
establishes that shadcn (react-shell's shared registry + MCP + `CLAUDE.md` reuse
rules) owns the UI-primitive/composite layer; §1/§5 land the stack on Vite SPA +
TanStack Router + Convex + shadcn, and §4 sets auth to **Convex Auth (default) /
Better Auth (scale-up)**. **This project is the layer the guide says shadcn does
NOT provide — and it ships that shared registry.**

`foundation-react` today is ~62 leaf primitives on Base UI + CVA (exactly the
layer shadcn now replaces) plus 8 brand-theme CSS files; its app-shell /
providers / i18n / theme-provider slices are planned-but-unbuilt. So this is a
**port of the durable parts, not a wholesale copy** — and the SolidJS
`foundation` stays untouched as the source of truth for Solid consumers.

## Scope / deliverables

1. **Do NOT port the primitives.** The ~62 Base-UI/CVA leaf components in
   `zingularis/foundation-react/src/foundation/kit/` are superseded by shadcn —
   do not bring them across. (shadcn now supports the same Base UI headless
   layer, so the underlying primitives are the same.)
2. **Shared shadcn registry (the UI contribution):** stand up react-shell's
   shared registry + shadcn MCP + the `CLAUDE.md` reuse rule. Carry across the
   brand token *values* (the 6 themes) as a `registry:base`, and the handful of
   bespoke composites shadcn lacks (GoldenCard, CompactColorPicker /
   CompactIconPicker, InlineEditText, ReactionPill, the imperative `alertDialog`
   API) as registry items.
3. **App-shell (the hard, durable core):** build the React shell on shadcn —
   AppShell, header/footer/menu/bottom-nav, page chrome, the single shell scroll
   container, page-level tabs + in-page tabs. Carry the framework-agnostic
   contracts from the SolidJS foundation's `app-shell-rules.md` **verbatim**:
   single shell scroll container, breadcrumb as a pure function of the URL, the
   three non-substitutable nav layers, and `?tab=` deep-link contracts.
4. **Providers:** Convex client + auth + theme providers. Support **both** auth
   paths — **Convex Auth (`@convex-dev/auth`) as the default** (auth-server-less,
   no cross-domain) and **Better Auth (`@convex-dev/better-auth`, crossDomain,
   Convex ≥ 1.25) as the scale-up**. For the Better Auth path, spike the
   cross-domain wiring before relying on it.
5. **i18n:** the `t()` seam + central-key policy + missing-key dev surface.
6. **Contracts:** the `~/config/*` inversion-of-control pattern and the
   no-silent-defaults / break-cleanly discipline, written up as this project's
   standing guides in `docs/guides/`.

## Exit criteria

- A consumer can install react-shell + point shadcn at its shared registry and
  get a booting, themed, authenticated app shell with type-safe routing —
  pulling **every UI primitive from shadcn** and **every shell / provider /
  contract from react-shell**, with no duplicated component layer.
- App-shell contracts documented in `docs/guides/`; no primitive clone present in
  the repo.

## Out of scope

- Any consumer feature UI.
- The SolidJS `foundation` (unchanged — it serves Solid consumers).
- Migrating existing apps (e.g. evaluering) onto react-shell.
