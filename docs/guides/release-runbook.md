# Release runbook

last updated: 2026-06-22

How to ship a change from `themes` and/or `my-react-shell` all the way to a
consumer in production, repeatably and **without remembering manual steps**. Each
repo has one `pnpm release` command; the preflight checks make the chain
unfailable. The single human judgement left is *looking at the Vercel preview
before promoting* — which is how you get "prod looks exactly like dev."

> **Why this is simple now.** A consumer depends on **only `my-react-shell`**. The
> shared `themes` palette CSS is **vendored** into the shell's shipped `src/themes/`
> at release time, so there is no transitive `themes` git-dep — no second repo for
> CI to authenticate to, no second tag to keep in lockstep, and no way for the shell
> and themes to drift into an incompatible pair. See
> [distribution-model.md](distribution-model.md) → *Transitive `themes` dependency*.

---

## The dependency chain

```
themes  ──(vendored at shell release)──►  my-react-shell  ──(git-dep tag)──►  consumer (evaluering, demos)
```

- A `themes` change reaches consumers **only** after themes is tagged **and** the
  shell re-releases (re-vendoring the new tag).
- A `my-react-shell` change reaches a consumer **only** after the shell is tagged
  **and** the consumer bumps its pin.
- Dev (the `link:` loop) sees both live, with no tagging — see *Development* below.

---

## Release `themes` (only when colours/tokens changed)

```bash
cd ~/Developer/themes
pnpm release minor --push        # or: patch | major | X.Y.Z
```

What it does: refuses if you have uncommitted palette changes (the tag must
contain the colours you edited), bumps the version, commits, tags `vX.Y.Z`, and
pushes. Then it prints the next step: bump the pin in the shell.

After it: set the shell's themes pin to the new tag (one edit), then release the
shell (next section):

```jsonc
// ~/Developer/my-react-shell/package.json → devDependencies.themes:
"themes": "git+ssh://git@bitbucket.org:kesteinbakk/themes.git#vX.Y.Z"
```

Right after a themes release, `../themes` HEAD is already at `vX.Y.Z`, so the shell
release preflight passes with no further checkout. (foundation, the other themes
consumer, bumps its own pin independently — themes stays the shared source of
truth, D13.)

---

## Release `my-react-shell`

```bash
cd ~/Developer/my-react-shell
pnpm release minor --push        # or: patch | major | X.Y.Z
```

**Preflight (this is the guarantee).** It refuses unless the `themes` it will
vendor is:
- **clean** — no uncommitted changes in `../themes`,
- **released** — the pinned tag exists on `themes` origin (so it's reproducible), and
- **matched** — `../themes` HEAD is *exactly* the pinned tag.

So the shell can **never** ship against unreleased or mismatched themes — the
class of bug that rendered every surface transparent in prod while dev looked
fine. If it aborts, it tells you precisely what to fix (usually: release themes,
or bump/checkout the pin).

Then it: vendors `themes` → `src/themes/`, rebuilds `dist/`, runs typecheck (and a
full build before pushing), bumps the version, commits, tags, and pushes.

After it: bump the pin in each consumer.

---

## Release a consumer (evaluering)

```bash
cd ~/Developer/evaluering
pnpm release v0.4.0 --push       # the my-react-shell tag to pin; omit to use the latest
```

What it does: verifies the shell tag is on origin, pins
`my-react-shell` to `git+ssh://…#vX.Y.Z` (the consumer depends on **only** this —
no themes), updates the lockfile, commits, and pushes. The push triggers a
**Vercel preview deployment** built from the real pinned tag, then restores the
local `link:` for continued development.

**The parity gate — do not skip.** Open the Vercel **preview** URL and look at it.
It is the actual production artifact (real pinned-tag install, real build), so what
you see is what prod will be. When it matches dev, **promote the preview to
production** in Vercel. This is the step that makes "looks good in dev, broken in
prod" structurally impossible — you are looking at prod before it is prod.

---

## One-time setup (per machine / per Vercel project)

These are done **once**, not per release.

**Vercel project (one repo to auth — just the shell):**
1. Add an env var `BITBUCKET_TOKEN` = a Bitbucket **Repository/Workspace Access
   Token** with `repo:read` (one credential; it only needs to reach the
   `my-react-shell` repo now — themes is vendored, so no second repo).
2. Set the **Install Command** to rewrite SSH→HTTPS+token before install, so the
   committed `git+ssh://…` spec resolves on CI without an SSH key:
   ```bash
   git config --global url."https://x-token-auth:$BITBUCKET_TOKEN@bitbucket.org/".insteadOf "git@bitbucket.org:" && pnpm install --frozen-lockfile
   ```

**Each consumer repo (once):** copy the committed-link pre-commit guard so the
local `link:` redirect can never be committed (it would break Vercel installs):
```bash
cp ~/Developer/my-react-shell/.githooks/pre-commit .githooks/pre-commit
git config core.hooksPath .githooks
```

**Each dev clone (once):** check out `themes` beside the shell
(`~/Developer/themes`) — the shell's dev watcher and release vendor read it from
`../themes`.

---

## Development (no releases, no tags)

The `link:` dev-loop shows **every** shell and themes edit live, with no tagging:

- **Shell CSS / TS edits** — the `rs:watch` sidecar (`pnpm dev` via `dev start`)
  rebuilds `dist/` and the consumer's Vite hot-reloads.
- **themes edits** (`~/Developer/themes/*.css`) — the same sidecar
  (`scripts/dev-watch.mjs`) mirrors the themes checkout into the shell's
  `src/themes/` on save, so the colour change HMRs straight into link consumers.

Tags exist only for releases. You never tag to see a change in dev.

> The vendor sources the **sibling `../themes` checkout**, never
> `node_modules/themes` — the latter is re-materialized to the pinned tag by every
> `pnpm install`, so sourcing it would silently revert dev to an older themes.
