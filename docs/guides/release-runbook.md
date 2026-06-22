# Release rulebook (for agents)

last updated: 2026-06-22

**This is an instruction set for agents, not a how-to for the human.** Releasing
`themes` / `my-react-shell` / a consumer is an **agent responsibility** — you run
the commands, every time. Never hand a list of release steps to the user and never
say "here's your runbook." The user expects 100% dev↔prod visual parity and an
unfailable, fully-scripted release; the scripts below enforce it. This file must
make sense to an agent that has none of this conversation's context.

## Model in one paragraph

A consumer depends on **only `my-react-shell`**. The shared `themes` palette CSS is
**vendored into the shell's shipped `src/themes/`** at release time, so there is no
transitive `themes` git-dep for a consumer to resolve or authenticate to. The
shell↔themes pair is contract-coupled, so the shell release **owns** the themes
release: `pnpm release` in the shell auto-cascades into themes. See
[distribution-model.md](distribution-model.md).

## The chain

```
themes  ──(vendored at shell release)──►  my-react-shell  ──(git-dep tag)──►  consumer (evaluering)
```

## Rule 1 — to ship shell and/or themes changes, run ONE command

```bash
cd ~/Developer/my-react-shell && pnpm release minor --push    # [major|minor|patch|X.Y.Z]
```

`pnpm release` (script: `scripts/release.mjs`) does, in order, automatically:

1. **Cascades themes.** Inspects the sibling `../themes` checkout. If it has
   unreleased commits (or no tag), it **releases themes** (`pnpm release` in
   `../themes`) and — with `--push` — pushes it. If themes is already at its latest
   tag, it just makes sure that tag is on origin. Bump level for a cascade themes
   release defaults to `patch`; override with `--themes minor`.
2. **Pins** the shell's `devDependencies.themes` to the resolved themes tag and
   reconciles the lockfile.
3. **Vendors** themes → `src/themes/`, rebuilds `dist/`, runs typecheck (and a full
   build before pushing).
4. **Bumps** the shell version (based on the latest shell **tag**), commits, tags,
   and — with `--push` — pushes branch + tag.

So you do **not** release themes separately. Releasing the shell handles it.

**It aborts only when a human must decide** — and you relay the message, you don't
work around it:
- `../themes` has **uncommitted** changes → a person must commit them with a real
  message (the release won't author themes content commits).
- `../themes` is **behind/divergent** from its latest tag → reconcile the checkout.

`--push` is required to publish. Without it, everything is local (tag not pushed) —
use that only for a dry run. Pushing is gated by the `pre-push-checks` skill
(clean tree, typecheck, build); the script performs the equivalent.

## Rule 2 — to release themes ALONE (rare)

Only when you want a themes tag without a shell release (e.g. for `foundation`):

```bash
cd ~/Developer/themes && pnpm release minor --push
```

Normally you don't — Rule 1 cascades it.

## Rule 3 — to deploy a consumer (evaluering)

```bash
cd ~/Developer/evaluering && pnpm release v0.X.Y --push   # the my-react-shell tag to pin
```

Pins `my-react-shell` to the tag (the consumer's only foundation dep — no themes),
updates the lockfile, commits, pushes → triggers a **Vercel preview build** from the
real pinned tag.

**Then the parity gate (do not skip):** open the Vercel **preview** URL and look at
it. It is the actual production artifact, so it is what prod will be. When it matches
dev, **promote the preview to production**. This is how parity is *seen*, not trusted.

## One-time setup (NOT a per-release step — ops/human, can't be scripted from here)

- **Vercel project:** env var `BITBUCKET_TOKEN` = a Bitbucket Repository/Workspace
  Access Token (`repo:read`); **Install Command**:
  ```bash
  git config --global url."https://x-token-auth:$BITBUCKET_TOKEN@bitbucket.org/".insteadOf "git@bitbucket.org:" && pnpm install --frozen-lockfile
  ```
  One repo to auth (just the shell — themes is vendored).
- **Each consumer repo:** copy the committed-link pre-commit guard
  (`cp ~/Developer/my-react-shell/.githooks/pre-commit .githooks/ && git config core.hooksPath .githooks`).
- **Each dev clone:** check out `themes` at `~/Developer/themes` (the shell's vendor
  + watcher read `../themes`).

## Development (no releases, no tags)

The `link:` loop shows every shell and themes edit live with **no tagging**: the
`rs:watch` sidecar rebuilds `dist/` and mirrors `../themes` → `src/themes/` on save,
so colour edits HMR into link consumers. Tags exist only for releases.
