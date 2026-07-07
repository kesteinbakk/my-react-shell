# Branch, commit & dev-loop model

**Maintainer guide — not shipped to consumers.** Project-specific deltas over the
universal work-contract; session/orchestration basics (approval gates, push rules) live
there.

## Branch & commit

- Single long-lived branch: **`main`.** No feature branches unless asked.
- **Many agents commit to `main` concurrently.** Commit history here is **disposable**,
  collisions are normal: your staged work may get swept into another agent's commit, the
  tree may hold other sessions' in-flight changes, commits may land bundled or
  oddly-messaged. Expected and fine.
- **Commit your own work at natural finish points.** Prefer committing only your own
  changes when trivial; **when isolating them isn't trivial, just commit everything in
  the working tree** rather than stall. Never ask the user how to split a commit, never
  leave your work uncommitted to avoid touching another session's changes, never report
  which of the two you chose. This **overrides** the universal "commit your own changes
  only" rule.
- **Never rewrite shared history to tidy up.** No `reset` / `rebase` / `amend` / force on
  commits you didn't just create.
- **Never push** without explicit instruction (a `push` targets this repo only).
- Git remote: `git@github.com:kesteinbakk/my-react-shell.git` (Bitbucket kept as the
  `bitbucket` mirror).

## Pre-commit guards

- A **pre-commit guard** (`.githooks/pre-commit`, enabled via `pnpm setup:hooks`) rejects
  committing a `link:`/`file:` dependency specifier — the local dev-loop redirect must
  never land in a commit. Bypass intentionally with `--no-verify`.
- A **second guard keeps `dist/` in lockstep with `src/`:** when a commit stages *library*
  source (`src/**/*.ts(x)`, excluding the harness — `main.tsx`, `routes/`,
  `routeTree.gen.ts`, `*.test-d.ts`), it runs `pnpm build:lib` and `git add dist`. It only
  ever stages `dist/`, so it can never sweep unrelated *source* into your commit; docs /
  harness / non-lib commits don't trigger it. Wrinkle: if your lib-src change shares the
  tree with *other* uncommitted lib-src, the rebuild compiles the whole tree, so staged
  `dist/` reflects both — harmless (history is disposable), just commit the batch. For a
  clean `dist/`, isolate first (`git stash push -- <files you don't own>`, commit,
  `git stash pop`). Either way **commit — never leave your work uncommitted for the user.**

## Package manager

**pnpm — never `npm install`.** `npm install` desyncs the lockfile and Convex dev then
crash-loops. Use `pnpm add` / `pnpm <script>` / `pnpm dlx`.

## The `link:` dev-loop

- A consumer on the `link:` dev-loop must **dedupe React** in its own Vite config
  (`resolve.dedupe`), or the symlinked shell's own React copy collides with the app's and
  first paint crashes with `Invalid hook call`. Same split hits **Vitest** (it
  externalises `node_modules`, bypassing `resolve.dedupe`), so component-rendering tests
  fail identically — fix: `server.deps.inline: [/my-react-shell/]` + the Radix devDep
  prerequisite (in [docs/guides/distribution-model.md](../../guides/distribution-model.md)
  → Local dev-loop → Vitest). `link:`-only; the git-dep path is unaffected.
- A `link:` consumer's dev server sees shell **and** `themes` edits live — only its
  git-dep/production build lags. `themes` palette CSS is **vendored** into
  `src/themes/*.css` (consumers depend on only `my-react-shell`, never a transitive
  `themes` git-dep); the `rs:watch` sidecar (`scripts/dev-watch.mjs`) mirrors the
  `../themes` checkout → `src/themes/` on save, so one themes edit HMRs into every link
  consumer at once. So a *breaking* shell/`themes` change (a renamed token) hits link
  consumers' dev immediately — migrate them in the same change. Full mechanics + release
  chain: [docs/guides/distribution-model.md](../../guides/distribution-model.md) +
  [release-runbook.md](release-runbook.md).
- **Never call a shell change "done" until you've checked the consumer projects — their
  code AND their TypeScript.** A rename / removed export / changed prop / any API-surface
  edit breaks every `link:` consumer (the demo, `offansk`, any live-linked app) the
  instant `dist/` rebuilds. After any API-surface change: rebuild `dist/`, run each
  consumer's `pnpm typecheck`, load its dev/preview. Migrate consumers in the *same*
  change; verify before reporting done.
- **Keep the consumer-broken window as short as possible.** Sequence a breaking change as
  one tight code step — edit the shell source AND migrate every consumer, let `dist/`
  rebuild once, typecheck/verify all repos — and only *then* do the slow,
  dev-server-irrelevant work (docs, API reference, guides, comments). Never rebuild `dist/`
  then sit in a long docs pass with consumers on the old names.

## Dev servers

Governed by the universal work-contract. Project residue: the shared watcher is the
**`rs:watch` / `build:lib:watch`** sidecar (rebuilds `dist/` on save; started by
`dev start` via `watch = true`). To verify UI use `preview_start("vite")` (wired to serve
the demo) — the sandboxed agent preview, no approval needed; leave it running, never
`preview_stop`. Mechanics: `browser-tools` skill.
