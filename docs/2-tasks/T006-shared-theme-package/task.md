# T006 — shared-theme-package

**Status:** in-progress · **Filed:** 2026-06-20

## Problem

The theme/color layer is duplicated between **my-react-shell** (React) and
**`zingularis/foundation`** (SolidJS). The five palettes
(`ocean/forest/sunset/soft/dynamic`) are currently **byte-for-byte identical**
across both repos — same `.theme-<name>-{light,dark}` class names, same values,
same comments — because the colors are pure framework-neutral CSS custom
properties. Every theme/color edit must be hand-copied to the other repo, and it
drifts: `base.css` has already diverged (my-react-shell added `-border` /
`share-border` tokens its contract declares and both palettes fill, but
foundation's `:root` never declared them).

## Decision

Selected **approach A** (extract a shared package) over **B** (a sync-script +
drift-check guard):

- A new **framework-neutral package `themes`** owns the colors. Both repos
  consume it; neither owns the other.
- It is **pure CSS + JSON, no build** — the colors are framework-agnostic, so
  nothing React/Solid lives in it.
- Distributed as a **Bitbucket git-dep** (`git@bitbucket.org:kesteinbakk/themes.git`),
  tag-pinned, consumed like an npm package — same model as D5.

This **supersedes D4** ("the SolidJS foundation is untouched") and is recorded as
**D13** in `strategy.md`.

## Package shape (`~/Developer/themes`)

| File | Contents |
|---|---|
| `contract.css` | The `:root` semantic `--color-*` contract (value-free apart from `--color-overlay`). The **superset** — my-react-shell's, which includes the `-border`/`share-border` tokens foundation's `:root` was missing. |
| `ocean / forest / sunset / soft / dynamic / golden .css` | The palettes — verbatim what's identical today; `golden` carried from foundation. |
| `index.css` | Barrel: `@import` contract + all six palettes. |
| `palettes.json` | Manifest (name + default English label + description) so the palette **list** can stop drifting too. |
| `package.json` | `name: themes`, `exports` per file, `sideEffects: ["**/*.css"]`, no deps, no build. |
| `README.md` | What it is, the Tailwind-base-vars requirement, how each repo consumes it. |

The palettes reference Tailwind's default `--color-zinc-50` etc.; the **consumer**
provides those via its own `@import 'tailwindcss'`. `themes` never imports
Tailwind — it stays tooling-neutral.

## Consumption

- **my-react-shell** — `src/index.css` keeps its Tailwind imports, then
  `@import 'themes/contract.css'` + the **five** palettes it surfaces (no
  `golden`); `src/styles/base.css` keeps only the baseline element styles (the
  `:root` contract moves to `themes`); `src/styles/themes/*` deleted. `themes`
  added to `dependencies`; `files`/exports updated. Output identical to today.
- **foundation** — `src/themes/index.css` `@import`s `themes/*` instead of its
  local `foundation-*.css` copies; `src/themes/base.css` keeps its utility
  classes + baseline + animations but drops the `:root` contract block (now from
  `themes/contract.css`, which also *adds* the `-border` declarations it lacked).
  Local `foundation-*.css` deleted. `themes` added to `dependencies`. Output
  identical to today (palettes were already the same).

Each framework keeps its own `ThemeProvider` — those are genuinely
framework-specific and are **not** shared.

## Verification

- my-react-shell: `pnpm typecheck` + `pnpm build` (Vite must resolve
  `@import 'themes/...'` — verify via a local symlink/link of `themes`).
- foundation: `pnpm typecheck` (+ a CSS-resolution check).
- Confirm computed colors are unchanged (palettes were byte-identical pre-change).

## Open / user-owned

- **Create the Bitbucket remote** `git@bitbucket.org:kesteinbakk/themes.git` and
  **push + tag** `themes` — only then does the committed git-dep specifier
  resolve on a fresh install. Until then, both repos work via the local link.
- Wiring each repo's TS palette registry to `palettes.json` is optional and left
  for a follow-up (the manifest ships now; registries stay hand-authored for the
  first cut — foundation's labels come from i18n, my-react-shell's are inline).

## Docs to update on completion

`strategy.md` (D13, supersede D4), `concept.md` ("Not the SolidJS foundation"
note), `CLAUDE.md` (the foundation-untouched mention), and the auto-memory note
about syncing theme edits.
