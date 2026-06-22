# T013 — vendor-themes-into-shell

Status: in-progress · Filed 2026-06-22

## Goal

A consumer (evaluering, the demos) depends on **only `my-react-shell`** — never the
transitive `themes` git-dep. Make releases repeatable and unfailable, with no manual
steps to remember, so prod looks exactly like dev.

## Why (the cause of the pain)

`themes` shipped as a *second, independently-tagged* Bitbucket git-dep every consumer
resolved transitively. That spawned: CI auth to two repos; two tags bumped in lockstep;
and — the live bug — shell + themes are **contract-coupled but versioned separately**, so
shell `v0.2.0`/`v0.3.0` consume the D15 surface tokens (`--color-surface-raised/sunken/
sunken-deep`) while pinning `themes#v0.1.0`, which defines only the *old* tokens. A real
git-dep install therefore renders **every surface transparent**; the dev `link:` symlink
masked it. The auth question (SSH key vs git+https) was a symptom, not the disease.

## Design

- `themes` → **devDependency** of the shell (the pin records which tag the release vendors).
- `pnpm sync:themes` **vendors** the curated palette CSS into committed `src/themes/*.css`
  (shipped via the existing `src/**/*.css` files glob); `src/index.css` imports relatively.
- **Vendor source = the sibling `../themes` checkout**, never `node_modules/themes` (which
  `pnpm install` re-materializes to the pinned tag — sourcing it would silently revert dev).
- **Dev liveness, no tagging:** `build:lib:watch` → `scripts/dev-watch.mjs` runs
  `tsc --watch` (dist) **and** mirrors `../themes` → `src/themes/` on save, so themes edits
  HMR into link consumers exactly as before.
- **Pre-commit themes guard** (sibling of the dist guard) re-vendors + stages `src/themes`
  when `src/index.css` / `src/themes/` / `package.json` is staged.
- **`release` script per repo**, preflight-gated:
  - themes: refuses on uncommitted changes; bumps version, commits, tags, pushes.
  - shell: **refuses unless `../themes` is clean + the pinned tag is on origin + HEAD == that
    tag** — so the shell can never ship against unreleased/mismatched themes. Then vendors,
    builds dist, typechecks, bumps, commits, tags, pushes.
  - evaluering: pins `my-react-shell` to a published tag (only dep), commits, pushes →
    Vercel preview; restores `link:` for local dev.
- **Parity gate:** the Vercel preview is the real pinned-tag build — eyeball it, then promote.
- **One-time setup:** Vercel `BITBUCKET_TOKEN` + `git insteadOf` SSH→HTTPS rewrite (one repo
  now); consumer copies the committed-link pre-commit guard.

Full operator guide: `docs/guides/release-runbook.md`.

## Status

- **Done + verified (shell + themes):** vendoring, dev-watch mirror, sibling-source
  resolution (pnpm-proof — proven by re-vendoring D15 with `node_modules/themes` pointed at
  the v0.1.0 store), pre-commit themes guard, `sync:themes`/`release` scripts, shell release
  preflight (correctly aborts today: `../themes` is ahead of pinned `v0.1.0`). Built CSS went
  1 → 53 D15-token occurrences. themes `release` script added.
- **Pending user:** release `themes` (push + tag the D15 work, e.g. `v0.2.0`), bump the
  shell's themes pin to it, `pnpm release` the shell, then the evaluering prod transition
  (release script + link guard + one-time Vercel token/insteadOf) and the promote-after-
  preview gate. evaluering edits intentionally deferred to an evaluering session (it has its
  own role + in-flight commits; its deps change needs its own verify pass).
