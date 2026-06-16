# Distribution hardening — items 1, 2, 3, 6

Hardening of the existing git-dep package model, per the "Required changes —
`my-react-shell`" section of `docs/guides/distribution-model.md`. Items 4
(committed-link guard) and 5 (release verification) were out of scope, as was any
dependency / peer change.

## Item 1 — `build:lib:watch` script

`package.json`: added `"build:lib:watch": "tsc -p tsconfig.lib.json --watch"`
directly below the existing `build:lib` script (and above `prepare`). Enables the
local dev-loop where `dist/` must be kept fresh for a `link:` consumer (`prepare`
does not run for a linked dep).

## Item 2 — `vite.config.ts` header comment

Rewrote the stale header comment. It previously described the superseded model
("the published library ships TS source via `exports` … transpiled by the
*consumer's* Vite"). It now states that this config builds **only** the dev-harness
app (showcase + test routes, D7), and that the importable library ships precompiled
`dist/` (JS + `.d.ts`) emitted by the `prepare` build via `tsc -p tsconfig.lib.json`
— not raw TS. No code changed, comment only.

## Item 3 — README.md

Created `README.md` at the repo root (none existed). Sections:

- **What this is** — one paragraph: modular React foundation; optional drop-in
  modules (theme, providers, auth seam, i18n-planned); not a framework / template /
  component kit; consumed as a tag-pinned Bitbucket git-dependency. Links to
  `docs/concept.md`, `docs/strategy.md`, `docs/guides/distribution-model.md`.
- **Install** — both git-dep specifiers reproduced verbatim from
  distribution-model.md (SSH for dev machines; `git+https` + `$BITBUCKET_TOKEN` for
  Vercel/CI), tag-pinned `#vX.Y.Z`, pnpm-only with the npm-desync warning.
- **Usage** — the three import lines, with the verified exported names (below). Notes
  the `auth/convex` sub-path keeps `@convex-dev/auth` optional.
- **CSS requirement** — prominent, its own H2. States that `my-react-shell/styles.css`
  ships raw Tailwind v4 source (`@import 'tailwindcss'`, `@import 'tw-animate-css'`,
  then token-contract palettes) and is **not** zero-config like the JS: the consumer
  must run Tailwind v4 (PostCSS / `@tailwindcss/vite`) and have `tw-animate-css`
  installed for the import to resolve and process.
- **Peer requirements** — table of all `peerDependencies` from package.json, with
  `@convex-dev/auth` + `@auth/core` flagged optional (only for the `auth/convex`
  sub-path), matching `peerDependenciesMeta`.
- **Local dev-loop** — `pnpm build:lib` once → `pnpm build:lib:watch` → `link:` in
  the consumer → strip the link before committing.

Did **not** create the theme guide (Phase G). Added a one-line note in the CSS
section that the theme module's full CSS / token contract is documented in the theme
guide once it lands in Phase G.

### Exported names verified against source

- `src/index.ts` (barrel, `exports["."]`): `AppProviders`, `ThemeProvider`,
  `createConvexClient` — all present. (Also exports `useTheme`, `BUILT_IN_THEMES`,
  `ConvexClientProvider`, and types; the README uses the three from the task brief.)
- `src/auth/convex-auth.tsx` (`exports["./auth/convex"]`): `ConvexAuthDefaultProvider`
  — present.
- `package.json` `exports["./styles.css"]` → `./src/index.css` — present;
  `src/index.css` opens with `@import 'tailwindcss';` + `@import 'tw-animate-css';`
  then `@import './styles/base.css';` and the five `./styles/themes/*.css` palettes.

## Item 6 — narrow `files` allowlist

`package.json`: changed `"files": ["dist", "src"]` to
`"files": ["dist", "src/index.css", "src/styles"]`. The only runtime-needed `src`
is the `styles.css` export (`src/index.css`), which `@import`s `./styles/base.css`
and `./styles/themes/*.css` (confirmed present: `src/styles/base.css`,
`src/styles/themes/{ocean,forest,sunset,soft,dynamic}.css`). Everything else ships
compiled in `dist/`.

## Files changed

- `package.json` — added `build:lib:watch`; narrowed `files`.
- `vite.config.ts` — header comment rewrite (no code change).
- `README.md` — created.

## Not touched (out of scope / gated)

- Item 4 (committed-link guard) and item 5 (release verification).
- No dependency change; `peerDependencies` / `peerDependenciesMeta` /
  `devDependencies` untouched (the `@tanstack/react-router` peer decision is gated on
  user approval).
