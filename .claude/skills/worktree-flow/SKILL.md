---
name: worktree-flow
description: "Branch and merge rules for git worktrees: branch from and merge back to the project's working branch, squash on merge, working agent performs the merge after explicit user approval.\nTRIGGER when: creating a git worktree for a task, spawning a code agent with worktree isolation, working inside a worktree, or merging worktree work back.\nDO NOT TRIGGER when: editing directly on a long-lived branch without a worktree."
---

# Worktree Flow

Keeps stable branches untouched and keeps merge history legible. Applies to every worktree the agent creates or works in.

## Base/target branch — per project

The base/target is the **project's working branch** — both the branch the worktree forks from and the branch the squash-merge lands on. Each project's CLAUDE.md declares its working branch explicitly; consult it if unsure (or run `git branch --list main dev prod`).

Branch-model conventions in play:

- **3-branch model** (working branch `main`, production `prod`, optional `dev`): `prod` is off-limits — only `release-flow` advances it. `dev` is force-reset on every release — never base or merge worktrees on `dev`.
- **2-branch model** (working branch `dev` if it exists, else `main`): branch from and merge to the working branch.
- **Single-branch model** (working branch `main`): branch from and merge to `main`.

See the `release-flow` skill for production-branch handling. Deployment shape (Vercel-watched or not) is per-project — see the project's CLAUDE.md.

## Creating the worktree

Manual (preferred — deterministic base):

```bash
git worktree add .claude/worktrees/<task-slug> -b wt/<task-slug> <base-branch>
```

Example with `dev` as base:
```bash
git worktree add .claude/worktrees/<task-slug> -b wt/<task-slug> dev
```

Hand the worktree path and branch name to the spawned agent.

If using `Agent(isolation: "worktree")`: Claude branches from `origin/HEAD` and names the branch `claude/<slug>`. Verify `origin/HEAD` matches the project's working branch (`git symbolic-ref refs/remotes/origin/HEAD`) — if not, use the manual flow. The same finish/cleanup rules below apply to `claude/*` branches; substitute the auto-generated slug wherever this skill writes `wt/<task-slug>`.

## Link node_modules (required immediately after creation)

`node_modules` is gitignored, so a fresh worktree has no dependencies — `pnpm typecheck`, `pnpm build`, and `pnpm test:run` will all fail until you link them. Symlink the project root's `node_modules` into the worktree:

```bash
ln -s ../../../node_modules .claude/worktrees/<task-slug>/node_modules
```

The relative target (`../../../node_modules`) resolves from the symlink's location (`.claude/worktrees/<task-slug>/`) back to the project root. Reuse, don't reinstall — `pnpm install` inside a worktree wastes minutes and disk for no gain.

For `Agent(isolation: "worktree")`: the auto-isolation creates the worktree before the spawned agent enters it. The agent's first action inside the worktree is to create this symlink — before any pnpm command. Same `ln -s` command, same target.

## During work

Commit inside the worktree on `wt/<task-slug>`. Run typecheck/build/tests inside the worktree. Don't touch the base branch or anything above it.

## Reading gitignored files

Worktrees contain tracked files only. Gitignored files in the main repo — `.env.local`, `.env.deploy`, `.env.vercel-prod`, build artifacts, anything in `.gitignore` — do not exist in the worktree. An `ls` or `Read` inside the worktree that reports such a file missing does **not** mean it's missing from the project; it lives at `~/Developer/zingularis/<project>/<file>`.

Before claiming a file doesn't exist, check `git check-ignore -v <path>`. If it's ignored, read from the main checkout:

```bash
grep RESEND ~/Developer/zingularis/.env.local
```

## Finish — squash-merge on user approval

The agent that did the work performs the merge. No approval, no merge.

**Propose the merge explicitly at finish.** End your turn with a clear ask, not with claims the user can verify yet:

> Work is committed on `wt/<slug>`. Ready to squash-merge to `<working-branch>`. Diff: \<one-liner\>. Approve?

**State branch location in every test/verify handoff.** Any message that asks the user to test, verify, confirm a fix, reproduce a bug, or look at something in their browser must open by stating where the work currently lives. Two shapes only:

- **On the working branch** (`main` or `dev`, depending on project): "Committed on `<working-branch>` — please test." This is the only shape that may ask the user to test.
- **On a worktree branch** (`wt/*` or `claude/*`): "Committed on `<worktree-branch>` — your dev server can't see it yet. Ready to squash-merge to `<working-branch>`? Approve and I'll merge." Do NOT ask the user to test/verify/confirm in this shape — request merge approval instead. After they approve and the merge lands, then ask for testing.

The mistake to avoid: asking "please test" or "let me know if this fixes it" while the work sits on a worktree, with no mention of the branch state. The user can't test — their dev server watches the primary working tree (`~/Developer/zingularis/<project>/`), not `.claude/worktrees/<slug>/`. A worktree commit is invisible to that server until it lands on the working branch. Equivalent banned phrasings: "ready to test", "HMR should pick this up", "live on your dev server", "verify in browser", "confirm the fix" — none of them while on a worktree.

Explicit approval ("merge it", "ship it", "yes", "go") is required; "let me see the diff first" or silence is not approval.

```bash
# From the project root (not the worktree)
git checkout <base-branch>
git merge --squash wt/<task-slug>
git commit -m "<one-line summary>"
```

**Run `pnpm typecheck` on the working branch after the merge.** A squash that applies cleanly at the diff level can still leave a non-compiling tip — the worktree's base has drifted since it branched, and semantic conflicts the textual merge didn't catch surface only on the merged tip. Typecheck is the cheap guard that the tip you hand back actually compiles before the user tests it in the browser.

**Don't run the full test suite or `pnpm build` here.** They're minutes, not seconds, and a merge to the working branch is integration, not a release. `pnpm build` re-runs on every push via `pre-push-checks`; `pnpm test:run` / `pnpm test:flows` run at release time via `release-flow` (for the 3-branch projects that carry the heavy suites). Deferring both to those gates is intentional — don't reintroduce them at merge.

**Post-merge typecheck fixes auto-commit.** If typecheck fails, fix in place on the working branch and commit each fix as a **new commit** — never amend the squash-merge commit (it stays the clean task landmark). Use clear messages like `fix: <thing> after merge of <task>`. These auto-commits are **pre-authorized as part of the worktree merge sequence** — no per-fix approval needed. Re-run typecheck after each fix; only proceed when it's clean.

If a fix turns into a real investigation (root cause unclear, scope keeps growing), stop and report — don't keep stacking commits on guesses. The worktree stays in place either way so the failing change has a clean home for revert or fix-forward — the user decides which.

**Cleanup is mandatory and part of the same finish step — not an optional follow-up:**

```bash
git worktree remove .claude/worktrees/<task-slug>
git branch -D wt/<task-slug>
```

A merged worktree that's still on disk is an unfinished task. If you're TM orchestrating: even if a subagent did the merge, verify cleanup happened before declaring the task done — don't trust that the working agent removed it.

Report what was merged and that the worktree is gone.

If the squash merge has conflicts, stop and report — don't resolve silently.

## After the merge — release is separate

For `zingularis` and `zing-sdk`: merging into `main` is integration, not release. Vercel previews from `main`, but production deploys only when `main` is later released to `prod` via the `release-flow` skill. Don't conflate the two — a worktree merge into `main` is done; the release that follows is a separate, user-triggered step.

## Don't

- Branch from or merge to `prod` (zingularis, zing-sdk) — `prod` only advances via `release-flow`.
- Branch from or merge to `dev` (zingularis) — `dev` is force-reset on every release.
- Use `--ff` or merge commits on the way back — squash only.
- Merge before explicit user approval.
- Leave the worktree or its branch (`wt/*` for manual, `claude/*` for `Agent(isolation: "worktree")`) around after merging.
- Push as part of merging — pushing is its own approval.
- Skip the post-merge `pnpm typecheck`, or clean up the worktree before it passes on the working branch.
- Reintroduce `pnpm test:run` / `pnpm test:flows` / `pnpm build` at merge — those run at push (`pre-push-checks`) and release (`release-flow`), not at squash-merge.
- Amend the squash-merge commit with post-merge fixes — each fix is its own new commit.
- Reinstall dependencies inside a worktree (`pnpm install`) — symlink the project root's `node_modules` instead (see "Link node_modules" above).
