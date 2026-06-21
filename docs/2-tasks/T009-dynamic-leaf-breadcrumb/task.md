# T009 — dynamic-leaf breadcrumb parity (app-shell port regression)

- **Status:** planning
- **Filed:** 2026-06-21
- **Working branch:** `main` (no worktree — single-file edit in `src/app-shell/ShellPageHeader.tsx` + rebuild, no parallel mutation)
- **Origin:** discovered while building the nested-pages demo page in `my-react-shell-demo`; T003 (app-shell module) is the code being corrected. `src/app-shell/ShellPageHeader.tsx` (the file holding both bugs) is unchanged since 2026-06-17 (`111c10b`).
- **Depends on:** nothing. Pure restore-parity fix against the SolidJS `foundation` original.
- **Pairs with `40f5fd1`** (`fix(app-shell): throw ShellConfigError when route '/' is registered as a page`, 2026-06-21): that commit forbids `/` in `pages`; this commit's dev-warn fix is its complement — see "Relation to `40f5fd1`" below.

## Goal

Restore breadcrumb parity with the canonical SolidJS `foundation` shell. The React
port of `findActiveChain` (T003) **regressed two behaviors** that the foundation
gets right, both in `src/app-shell/ShellPageHeader.tsx`:

1. A **dynamic-only leaf** (a `useDynamicPages` child whose parent route has **no
   static `subPages`**) never resolves into the breadcrumb chain — the crumb is
   silently dropped.
2. The dev "no registered page" warning lacks the foundation's **root (`/`)** and
   **dynamic-parent** exemptions, so a legitimate chrome-only header at `/` (a page
   with no `/` entry — the correct pattern, since the shell already renders a `[house]`
   home affordance) falsely warns on every home-page visit.

## Root cause

### 1. Chain loop gates on static children only

React `findActiveChain` (`src/app-shell/ShellPageHeader.tsx`):

```ts
let candidates = roots
let parentKey = ''
while (candidates.length > 0) {                 // ← only static subPages keep the loop alive
  const dynamic = dynamicByParent[parentKey] ?? []
  const pool = dynamic.length > 0 ? [...candidates, ...dynamic] : candidates
  // …pick longest-prefix best…
  candidates = best.subPages ?? []
  parentKey = best.route
}
```

When the resolved entry has no static `subPages`, `candidates` becomes `[]` and the
loop exits **before** the next iteration would merge `dynamicByParent[parentKey]`.
So the dynamic children registered under that parent are never consulted.

Foundation original (`~/Developer/zingularis/foundation/src/shell/ShellPageHeader.tsx`)
keeps descending whenever the parent has static children **or** a dynamic
registration:

```ts
let pool = roots
let parentKey = ''
while (true) {
  const dynamicHere = dynamicByParent[parentKey] ?? []
  const merged = [...pool, ...dynamicHere]
  // …pick longest-prefix best (route !== "/" guarded on the prefix match)…
  if (!best) break
  chain.push({ entry: best, siblings: merged })
  parentKey = best.route
  pool = best.subPages ?? []
  if (pool.length === 0 && !(parentKey in dynamicByParent)) break   // ← the missing condition
}
```

The exit condition `pool.length === 0 && !(parentKey in dynamicByParent)` is what the
React port dropped.

### 2. Dev-warn missing exemptions

Foundation's dev warning exempts two cases the React port does not:

```ts
if (leaf && leaf.route in props.shell.dynamicPages()) return; // dynamic parent: transient child, not a bug
if (!leaf && pathname === "/") return;                        // chrome-only root header is legitimate
```

The React port warns whenever `!leafMatchesPath`, with no exemption for either.

## Impact

- **Every consumer** using `useDynamicPages` for a dynamic leaf whose parent has no
  static `subPages` gets a missing crumb. **Both** examples in the current
  `docs/guides/app-shell.md` (expanded today in `8697845`) are affected:
  `useDynamicPages({ parent: '/sites' })` → `/sites/$siteId`, and
  `useDynamicPages({ parent: '/data/core/items' })` → `/data/core/items/$invId`.
  Neither parent carries a static subPage, so neither record crumb resolves.
- A consumer that omits `home` from `config.pages` gets a spurious DEV console warning
  on `/`. As of `40f5fd1` this is no longer a choice — registering `/` now **throws**,
  so `/` is *always* a chrome-only header with an empty chain, and the warning fires on
  every home-page visit.

## Relation to `40f5fd1`

`40f5fd1` added a `defineShellConfig` guard that throws when `/` is registered as a
top-level page (home is reached only via the brand link + breadcrumb `[house]` icon).
That fix is **config-validation only** — it does not touch `ShellPageHeader.tsx`. Its
direct consequence is that `/` can never produce a breadcrumb leaf, so the dev-warn
**must** gain the `!leaf && pathname === '/'` exemption (part 2 of this task) or it
false-positives on every home page. The two commits are complementary: `40f5fd1`
forbids the bad config; T009 stops the breadcrumb code from mis-reporting the now-
guaranteed empty `/` chain (and fixes the unrelated dynamic-leaf descent).

Verified against the **installed** `dist/app-shell/ShellPageHeader.js` (identical to
`src`), with a standalone reproduction of the exact algorithm:

| Case | Result |
|------|--------|
| Country with **no** static subPages + dynamic cities → `/…/norway/oslo` | chain stops at `norway` — **city crumb dropped** |
| Country with **one** static subPage + dynamic cities → `/…/norway/bergen` | city crumb **resolves** |
| Dynamic under `/sites` (no static subPages) → `/sites/abc` | chain stops at `sites` — **record crumb dropped** |

## The fix

Mirror the two foundation snippets in `src/app-shell/ShellPageHeader.tsx`:

1. **`findActiveChain` loop** → `while (true)`, merge `dynamicByParent[parentKey]`
   every iteration, descend, and exit at the bottom only when
   `candidates.length === 0 && !(parentKey in dynamicByParent)`. (Optionally adopt the
   explicit `entry.route !== '/'` guard on the prefix match; the React code's
   `startsWith(route + '/')` already excludes `/`, so this is cosmetic alignment.)
2. **Dev-warn** → add the `leaf.route in dynamicPages` and `!leaf && pathname === '/'`
   exemptions.

No public API change; no signature change. `subPages`, `useDynamicPages`, and the
breadcrumb-is-the-URL invariant are unchanged — this only makes the chain consult
dynamic registrations at a childless level, as documented.

## Distribution note

`my-react-shell-demo` consumes the library via `link:../my-react-shell` resolving to
this repo's `dist/` (`exports['./app-shell'].import → ./dist/app-shell/index.js`). So
the fix reaches the demo after **`pnpm build`** here + a Vite restart on the consumer.
A tag/version bump is only needed to release to non-link consumers.

## Verification

- Standalone node check of the corrected `findActiveChain` against all three cases
  above (pure function — no React needed), plus a top-level dynamic page and a fully
  static deep chain to confirm no regression.
- `tsc -b` typecheck + `pnpm build` (regenerate `dist/app-shell/`).
- In-browser confirmation via `my-react-shell-demo`'s nested-pages page (a genuine
  dynamic leaf shows its crumb; the home page no longer logs the dev warning) —
  **user-owned** (dev servers are user-owned, project rule).

## Exit criteria

- A dynamic leaf whose parent has no static `subPages` resolves to its own breadcrumb
  crumb (and sibling dropdown), matching foundation behavior.
- A chrome-only header at `/` (no `/` page registered) produces **no** dev warning.
- Existing static and top-level-dynamic chains are unchanged (no regression).
- `docs/guides/app-shell.md` dynamic-pages section reflects that a dynamic leaf no
  longer requires a static sibling, if any wording implied otherwise.
