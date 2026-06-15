---
name: dead-code-audit
description: "Two-tier dead-code detection and cleanup. Tier 1 = knip reachability (unused files/exports/deps/duplicate exports). Tier 2 = small custom AST scripts for what knip cannot see (Convex string refs, i18n keys, icon registry). Always uses the tool — never grep — and always splits scan from cleanup into two TM tasks.\nTRIGGER when: user asks to find dead code, scan for orphans, dead-code audit, cleanup unused; an agent is asked to verify whether a function/file/dep is in use; a TM is planning a cleanup sprint or quarterly hygiene pass.\nDO NOT TRIGGER when: removing a single specific file the user named (just delete it); fixing a TypeScript unused-variable error inside one file (lint, not dead-code); reviewing a PR that already deletes code (spawn `code-investigator` instead)."
---

# dead-code-audit

Two-tier system. Don't grep. Use the tool.

For a real-world `knip.json` to copy from, look at any project that has already adopted this skill (e.g. `~/Developer/zingularis/knip.json`).

## Tier 1 — knip baseline

Always start here. `npx knip` is a reachability analyzer with framework plugins (Vite, Vinxi/SolidStart, Vitest, etc.). It finds what graph traversal can find: unused files, unused exports, unused deps, duplicate exports, unlisted deps.

### Setup (per project, one-off)

1. `pnpm add -D knip` in the project root.
2. Write `knip.json` with these slots filled in:
   - **entry** — the real roots, which depend on the framework. *SolidStart:* framework config (`app.config.ts`), entry files (`src/entry-{client,server}.tsx`, `src/middleware.ts`, `src/app.tsx`), file-routing globs (`src/routes/**/*.{ts,tsx}`). *Vite SPA (React/vanilla):* the HTML entry (`index.html`) and its module root (`src/main.tsx`). Either way add Convex backend globs (`convex/**/*.ts` — every Convex file is callable by string from the client) and test-file globs.
   - **project** — `src/**`, `convex/**`, `scripts/**` (the source set knip considers "yours").
   - **ignore** — generated output and anything synced from upstream, NEVER editable here: `convex/_generated/**`, plus your project's synced dirs (Zingularis: `src/foundation/**`, `src/locales/synced/**`).
3. `npx knip` — first run prints "Configuration hints" telling you which entries/projects/ignores are redundant. Apply them and re-run.

### Why these specific entries

- SolidStart/Vinxi loads from `app.config.ts` → entry files → `FileRoutes` → routes globs. Knip's auto-detection misses the routes glob; declare it explicitly.
- Convex client calls `api.module.fn` as a string. Knip can't see those. Treating every `convex/**/*.ts` as entry means knip won't flag Convex internal helpers as unused — Tier 2 covers that.
- Synced folders are owned by upstream. Listing them in `ignore` prevents both false positives AND wrong-project deletion suggestions.

## Tier 2 — custom AST scripts

Knip cannot see string-keyed references. For each, a small script in `scripts/` is the right answer:

- **Convex internal helpers.** Walk `convex/**/*.ts` collecting every exported function. Walk again collecting every `internal.foo.bar` / `api.foo.bar` reference. Diff. (`api.*` strings are also referenced from `src/**` — include both.)
- **i18n keys.** Walk `src/locales/**/*.json` collecting all keys (with namespace path). Walk `src/**/*.{ts,tsx}` for `t("…")` literal arguments AND for const/let declarations assigned a dotted-namespace string literal — if referenced more than once, register their value as a dynamic prefix (keeps `` t(`${NS}.${type}`) `` template-literal call sites alive). Guard: only accept root segments that are real locale namespaces, not test tokens or fixtures. Diff.
- **Icon registry.** If the project has a centralized icon registry, walk it and walk `<Icon name="…">` JSX usages.

Wire into `dev analyze dead-code` or `pnpm dead-code:tier2`. Keep each under ~100 lines — they're project-specific by definition.

## Task pattern: split scan from cleanup

NEVER do detection and deletion in one task. The user must see the classified report before deletions land.

### Task 1 — detection (`TXXX-dead-code-detection`)

1. Install + configure knip (Tier 1).
2. (Optional now) Add Tier 2 scripts.
3. Run, classify, write `findings.md`.
4. Commit setup + report.
5. Hand back to user — NO deletions in this task.

### Task 2 — cleanup (`TYYY-dead-code-cleanup`)

Phases, one commit per phase. Gate between phases is **`pnpm typecheck` AND `pnpm build` AND `pnpm test:run`** — typecheck alone misses framework-virtual-import breakage (see Gotchas). Re-run knip between phases (capture shrinking numbers in the task file as proof):

1. **A1 — dead barrels.** Trivial. In zingularis, barrel `index.ts` is banned outright; if knip says zero importers, delete.
2. **A2 — rename-residue duplicate exports.** Same thing under both old and new names. Break-cleanly: drop the old form.
3. **A3 — named-vs-default duplicates.** Same thing as `Foo` and `default` in one file. Pick the form callers use.
4. **B — non-barrel orphan files.** 30s eyeball each: git log, grep basename + exported symbols. Auth-flavored or provider-mounting files get extra scrutiny.
5. **C — unused dependencies.** Per-package verification before `pnpm remove` (esp. CSS-only deps like `tailwindcss` that knip can't see).
6. **Final re-baseline.** `npx knip` again, capture counts, run `pnpm typecheck` + `pnpm build`.

### Optional follow-up — CI gate

Once the clean baseline is committed, wire `pnpm knip` into pre-push or CI. Without this, dead code accumulates again. Only this prevents long-term regression.

## Reviews

The cleanup task plan goes through `code-investigator` (design pass) before phase 1 starts. Auth/security-flavored deletions also go through `review-security` (parallel). Reviewers anchor on the committed planning state, so commit task.md before spawning reviewers.

## Gotchas

- **Framework virtual imports — knip's biggest blind spot.** Knip follows static `import` only. Anything resolved by framework convention or virtual modules is invisible:
  - **SolidStart**: `src/app.tsx` is resolved by `@solidjs/start`'s `#start/app` virtual import. Always add it to `entry`.
  - **Vinxi**: `vinxi:fs-router`, anything under `vinxi:`.
  - **Vite**: anything under `virtual:*`.
  - **Next.js (App Router)**: implicit page/route resolution.
  - **Astro / Nuxt / SvelteKit**: similar virtual-module conventions.

  Symptom: knip reports a file as unused, but dev runs fine deleted (HMR keeps it cached) — only `pnpm build` from a cold cache surfaces breakage. **Therefore:** always run `pnpm build`, not just `pnpm typecheck`, between cleanup phases.

- **Synced-upstream shadowed by a local stub.** The synced folder is the real source, but a same-basename stub exists from before sync was set up. Knip flags the stub's exports as duplicate / unused — delete the stub entirely; don't rename or merge. Always grep synced folders for the same basename before resolving a duplicate.

- **CSS-only deps invisible to knip.** `tailwindcss`, PostCSS plugins, `@import`-only modules. Always grep CSS imports before `pnpm remove` (look for `@import "<pkg>"` and `@use "<pkg>"` in `src/**/*.css`).

- **The 360+ "unused exports" first-run number is misleading.** Most are barrel re-exports that disappear once Bucket A1 lands. Re-run knip after Phase 1 to see the real number.

- **Synced-upstream findings are not actionable here.** If knip surfaces anything in a synced dir (Zingularis: `src/foundation/**`), it's the upstream project's task, not yours. The `ignore` glob should prevent this from happening at all.
