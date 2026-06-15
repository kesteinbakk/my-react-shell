---
name: pre-push-checks
description: "Gate every `git push` on a clean tree, a passing typecheck, and (for Vercel-deploy branches) a passing build. Aborts and reports if any check fails.\nTRIGGER when: about to run `git push` from any agent, on any branch, for any reason — own commits, another agent's commits, merge target, release target.\nDO NOT TRIGGER when: only committing locally without pushing."
---

# Pre-Push Checks

A broken push wastes a Vercel build minute at best and lands a broken deploy at worst. The cost of running these checks locally is tiny compared to the cost of finding out in the cloud. Run them every time, from every agent.

## The gate

Run these in order. **Each step aborts the push on failure** and reports back to the user with the failing output.

### 1. Working tree clean

```bash
git status --porcelain
```

If non-empty: **stop**. Do not push. Report the uncommitted files. Ask the user whether to commit them first, stash, or revert. Pushing with a dirty tree is almost always a mistake — either the commit that was supposed to be in the push isn't in it yet, or the agent is about to push commits while uncommitted work sits beside them in confusing state.

### 2. Typecheck

```bash
pnpm typecheck
```

If it exits non-zero: **stop**. Report the TypeScript errors verbatim. Either fix them, or ask the user before pushing past them. TypeScript has no warning level, so this is a binary check.

If the project has no `typecheck` script (docs-only / source-only repos): skip this step and continue. Don't invent a substitute.

(Why `pnpm typecheck` and not raw `tsc --noEmit`: the project's script passes `--skipLibCheck` to filter dependency noise. See the `typecheck` skill.)

### 3. Build (only when pushing to a Vercel-deploy branch)

Each project's CLAUDE.md states which branches Vercel watches (typically the working branch, the production branch, or both — and some projects have no Vercel project at all). If the target is a Vercel-deploy branch:

```bash
pnpm build
```

If it exits non-zero: **stop**. Report the build error verbatim.

If it exits 0, scan the captured stdout for `warn`/`warning` lines and surface them in the report (non-blocking — push still goes through). Example:

> Build passed. 2 warnings worth noting:
> - `src/foo.tsx:42` — unused import `Bar`
> - `tailwind` — unknown utility `text-(--color-danger)` on line 88
> Pushing now.

The user can decide whether to fix-before-push or fix-after.

### 4. Outside-project imports (only when step 3 ran)

Vercel only ships the project's own git tree. Imports resolved outside that tree work locally and fail in the cloud.

```bash
grep -rEn "(from|import)[[:space:]]+['\"](~/Developer/|/Users/)" src/
```

If it matches: **stop**. Report the offending `file:line`. Synced code (foundation, sdk, translations) must be imported from the project's own `src/` copy, not from absolute paths under `~/Developer/<source-repo>/...`.

## Then push

Only after every applicable step passes:

```bash
git push
```

## After a successful push

Append one closing line to the user, naming the branch and the implication:

> Pushed to `<branch>`. Vercel will rebuild from the new commit — check the dashboard once the deploy is done. Local build passing does not guarantee the Vercel build will: env-driven code paths and platform differences can still bite.

For production pushes (the production branch declared in the project's CLAUDE.md — `prod` for the 3-branch flow used by zingularis/zing-sdk, `main` for everything else), say so — production deploys are user-visible the moment the build completes.

For pushes to a non-Vercel branch (docs/source repos), skip the Vercel line.

## Notes

- Applies to every `git push`, regardless of which agent (`git`, `code`, `tm`, anything) is doing the pushing. The freeform `git push` path is not exempt.
- Applies whether the push happens via `/git merge`, `/git release`, a direct `git push` from another role, or a one-off command.
- `git push --tags` and similar variants count as a push — run the same gate.
- The grep patterns in step 4 are intentionally narrow. They target deterministic Vercel failure modes, not every possible bundling issue.
