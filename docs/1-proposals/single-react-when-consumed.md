# Proposal: Consuming the shell must never introduce a second React

**Date**: 2026-06-23 | **Status**: implemented

## What

Ensure that when a consumer renders shell components — especially the Radix-backed
ones (Dialog, Select, DropdownMenu, Popover, Tooltip) — React resolves to the
**consumer's single copy**, not a second one carried in the shell's own
`node_modules`. Today, consuming the shell via a local `link:` symlink pulls the
shell's React (and its React-using transitive deps) as a separate module instance.

## Why

A consumer (evaluering) finished removing shadcn and moving every component onto the
shell kit. Its app compiles, builds, and runs — the dev server (Vite) dedupes React
fine. But its **test suite** (Vitest + jsdom) breaks with ~90 `Invalid hook call` /
`Cannot read properties of null (reading 'useMemo'/'useRef')` errors the moment a
shell Radix component renders. Root cause: the shell is linked from its own repo,
whose `node_modules` holds a React at a *different realpath* than the consumer's, and
the shell's nested Radix deps (`react-remove-scroll`, `@radix-ui/*`) import React from
**that** copy → two Reacts → split hook dispatcher.

A consumer-side `resolve.dedupe` collapses the shell's *direct* React usage, but not
these *nested transitive* imports; consumer attempts at `server.deps.inline` and
react/react-dom aliases each fixed some cases and broke others. The reliable fix
belongs on the **shell's side / its consumption contract**, so every consumer doesn't
have to re-solve the same dedup puzzle. The shell's own tests pass because they use a
single React — the problem only appears when the shell is *consumed* alongside the
consumer's React.

## User Goals

- **A consumer never ends up with two Reacts because of the shell.** Rendering any
  shell component (including the Radix-backed ones) in a consumer's app *and* its test
  environment uses exactly one React — no `Invalid hook call`, no split dispatcher,
  with no bespoke dedup config required of the consumer.
- **A documented, minimal consumption contract** for React resolution: what the shell
  guarantees, and the one-line config (if any) a consumer needs for Vitest/jsdom.

## Open Questions

- Treat `react` / `react-dom` (and `react/jsx-runtime`) strictly as
  **peerDependencies** so they're never part of the consumed surface — and keep them
  only as devDependencies for the shell's own dev/test? Does the `link:`-symlink
  consumption path still surface the shell's dev copy, and if so how is that prevented?
- Should the fix live in how the shell is published/linked, in a documented consumer
  Vitest recipe (dedupe + the exact inline/alias that actually works for the nested
  Radix deps), or both?
- Is there a shell-side build option (e.g. externalizing React in the dist, which it
  likely already does) plus a consumption note that fully closes this?

## Resolution (2026-06-23)

- **`docs/guides/distribution-model.md` → Local dev-loop → Vitest** — added the
  authoritative recipe: `server.deps.inline: [/my-react-shell/]` +
  `resolve.dedupe: ['react', 'react-dom', 'react/jsx-runtime']`, plus the
  prerequisite that `@radix-ui/*` packages must be in the consumer's `node_modules`
  (either via pnpm peer resolution or explicit devDeps) for Vite's SSR runner to
  route Radix imports to the consumer's React.
- Corrected the false claim in that guide that said "build/test do not catch this" —
  in fact Vitest does catch it and fails with identical errors.
- **`CLAUDE.md`** — extended the `link:` dedupe note to mention the Vitest case and
  point at the guide's new Vitest section.
- Consumer action needed (evaluering T063 follow-up): add the five Radix devDeps to
  evaluering's `package.json` and add `server.deps.inline: [/my-react-shell/]` to its
  `vitest.config.ts` frontend project.

## References

- evaluering task **T063 — remove-shadcn**: after migrating every component to the
  shell, `pnpm test` fails 94/1223 — almost all the React-dup hook split, triggered by
  shell Dialog/Select/DropdownMenu rendering in jsdom. typecheck + build are green; the
  app works. Consumer-side dedupe/inline/alias attempts were insufficient.
