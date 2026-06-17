# T002 — De-risk the `link:` dev-loop against duplicate-React crashes

- **Status:** finished (owner-confirmed 2026-06-17)
- **Filed:** 2026-06-16
- **Working branch:** `main` (no worktree — cross-repo config + docs, small scope)
- **Origin:** `background.md` (the approved proposal `react-dedupe-link-dev-loop.md`)
- **Affects repos:** `my-react-shell` (docs), `evaluering` (consumer config), `my-react-shell-demo` (reference-consumer config)

## Main goal

Close the gap where a consumer following the documented local `link:` dev-loop
faithfully still hits a hard `Invalid hook call` crash at first paint. The fix is
**consumer-side bundler dedupe** (Vite `resolve.dedupe`), baked into the reference
consumer configs and documented next to the existing peers / Tailwind /
strip-the-link steps — **not** package-level elimination of the shell's own React
(the dev-harness, build, and tests need it). Scoped explicitly to the `link:` loop;
the tag-pinned git-dep path is unaffected.

## User's goals (from the approved proposal + owner decisions)

- A developer can stand up a my-react-shell consumer using **only** the documented
  `link:` dev-loop and have it boot and render — no undocumented step required.
- The reference consumer (`my-react-shell-demo`) demonstrates the working config, so
  a consumer can copy it with confidence rather than rediscover the requirement by
  crashing. (Demo confirmed **latently broken** — see Baseline — so it must be fixed,
  not just trusted.)
- Whatever the consumer must do is stated **once**, in the consumer-adoption section,
  next to the peers / Tailwind / strip-the-link steps.
- The failure mode is **named** in the docs (`Invalid hook call` / two physically
  distinct React copies), so the next consumer recognizes it instead of debugging cold.

### Owner-approved decisions (do NOT re-litigate)

1. **Document + encode, NOT package-level elimination.** The shell keeps its own
   React; the fix is consumer-side bundler dedupe, documented and baked into the
   reference configs.
2. **Verify the exact dedupe package list empirically** against `evaluering` (which
   actually uses `my-react-shell/auth/convex`). Derive — don't guess.
3. **Check `my-react-shell-demo` directly** for latent breakage (theme-only, no
   Convex/auth/router).
4. **Confirm the git-dep path dedupes via peers** and is unaffected; scope guidance
   to the `link:` loop only.

## Baseline (current state — empirically confirmed)

Full inventory in this section (task is small; no separate `baseline-review.md`).

### The mechanism, confirmed from compiled `dist/`

Every compiled `dist/*.js` emits bare specifiers that, under a symlink, resolve
through the **shell's** `node_modules` and drag in the shell's own copies:

- `dist/theme/ThemeProvider.js`, `dist/providers/*.js`, `dist/auth/convex-auth.js`
  all begin `import { jsx as _jsx } from "react/jsx-runtime"` → **`react/jsx-runtime`
  is in the dedupe list**, not just `react`/`react-dom`.
- `dist/providers/*.js` import `convex/react` (`ConvexProvider`, `ConvexReactClient`).
- `dist/auth/convex-auth.js` imports `@convex-dev/auth/react` (`ConvexAuthProvider`).

Peers stay **external** in `dist/` (not bundled). Under a real package install
(git-dep) bare specifiers walk up to the consumer's own `node_modules` → single
copy. Under a **symlink** (`link:`), the same specifiers resolve through the linked
package's own `node_modules`, giving a second physically distinct React. Two Reacts
share no hook dispatcher → `Invalid hook call` on the first shell component that
calls a hook.

### What each consumer actually shares with the shell across the symlink

- **evaluering** (`src/.../*` imports `my-react-shell/auth/convex`; package.json carries
  `react`, `react-dom`, `convex`, `@convex-dev/auth`, `@auth/core`; `link:../my-react-shell`):
  shares the full React + Convex-React surface beneath the auth seam.
- **my-react-shell-demo** (`src/App.tsx` imports only `ThemeProvider, useTheme,
  BUILT_IN_THEMES` from the barrel; **zero** Convex/auth imports in `src/` despite an
  unused `convex` dep; `link:../my-react-shell`): shares only React. The barrel's
  theme module **calls hooks** (`createContext`, `useContext`, `useState`,
  `useEffect`, `useLayoutEffect`, `useCallback`, `useMemo` in
  `src/theme/themeContext.ts` + `src/theme/ThemeProvider.tsx`) → **latently broken**,
  not known-good.

### Derived dedupe lists (empirical, not guessed)

- **evaluering:** `react`, `react-dom`, `react/jsx-runtime`, `convex`, `convex/react`,
  `@convex-dev/auth`
- **my-react-shell-demo:** `react`, `react-dom`, `react/jsx-runtime`

### Existing consumer Vite configs (match each style)

- `evaluering/vite.config.ts`: `defineConfig` with `define`, `plugins`
  (`tanstackRouter`, `react`, `tailwindcss`, `devBridgePlugin`), `resolve.alias`.
  Add a `resolve.dedupe` key alongside the existing `alias`.
- `my-react-shell-demo/vite.config.ts`: `defineConfig` with `plugins` (`react`,
  `tailwindcss`), `resolve.alias`, `server.port`. Add `resolve.dedupe` alongside `alias`.

### Git-dep path — confirmed unaffected

Peers externalized in `dist/`; a tag-pinned git-dep is a real (non-symlinked) package,
so bare specifiers resolve to the consumer's own single copy. No dedupe needed there.
Guidance is scoped to `link:` only.

### Supersession kill-list

**None.** This task adds a `resolve.dedupe` key and new doc paragraphs. It removes no
prior code path — there is no pre-existing dedupe config or guard to replace. (Walked
both consumer Vite configs and the shell's distribution doc / README: nothing prior
did this job.)

## Plan

Config + docs only. No dependency changes, no `.env` edits, no worktree.

| Phase | Scope |
|-------|-------|
| P1 | `evaluering/vite.config.ts` — add `resolve.dedupe` with the 6-entry list, matching existing style. Typecheck. Commit in evaluering. |
| P2 | `my-react-shell-demo/vite.config.ts` — add `resolve.dedupe` with the 3-entry React triple. Typecheck. Commit in demo. |
| P3 | my-react-shell docs — `docs/guides/distribution-model.md` (Local dev-loop + Consumer adoption), `README.md` (Local dev-loop), and a `CLAUDE.md` pointer. Name the failure mode, scope to `link:` only, no task IDs / dated annotations in guides/README. Commit in my-react-shell. |

Each phase commits in its **own repo** on `main`. Never push.

### Verification limit (critical)

`vite build` and vitest resolve React differently than Vite's dev pre-bundler, so a
green build does **not** exercise the failing path. We can verify config validity,
typecheck, and that builds still pass — but **cannot** prove "first paint no longer
crashes." The live dev-server boot is the **user's** to run (dev servers are
user-owned). Flagged in the final report.

## Implementation Status

| Phase | Status | Agent | Summary | Detail |
|-------|--------|-------|---------|--------|
| P1 evaluering config | done | tm | `resolve.dedupe` (6 entries) added; `vite.config.ts` typechecks clean (a pre-existing, unrelated `convex/devLogin.ts` TS error remains — spun off as a separate chip); committed | inline |
| P2 demo config | done | tm | `resolve.dedupe` (React triple) added; `pnpm typecheck` passes clean. NB: `my-react-shell-demo` is **not a git repo** (throwaway scratch) — edit lives on disk, nothing to commit | inline |
| P3 shell docs | done | tm | dist guide (Local dev-loop + Consumer adoption) + README (Local dev-loop) + CLAUDE.md pointer; failure mode named; `link:`-scoped; no specs drift (no spec covers the dev-loop); committed | inline |

## Follow-ups

- `my-react-shell-demo` carries an **unused `convex` dependency** (no Convex import in
  `src/`). Not in scope here (dependency change needs approval). `deferred → proposal/owner-decision`.

## Live check the user must run (gate)

In a consumer wired with the `link:` loop (`pnpm build:lib` + `pnpm build:lib:watch`
in the shell, `link:../my-react-shell` + `pnpm install` in the consumer), start the
**dev server** (`pnpm dev` — user-owned) and confirm first paint renders with **no**
`Invalid hook call` / `Cannot read properties of null (reading 'useContext')` in the
browser console. This is the only check that exercises Vite's dev pre-bundler, which
is where the bug lived.
