---
name: theme-tokens
description: "Where theme colors come from: the shared, framework-neutral `themes` package owns the semantic --color-* contract + light/dark palettes for both React and Solid.\nTRIGGER when: changing a palette's colors, adding/removing/renaming a --color-* token, wiring a new palette, or reasoning about where theme colors live across projects.\nDO NOT TRIGGER when: applying existing tokens while building a component (Solid → theme-styling; React → my-react-shell theme guide)."
---

# Theme Tokens — Shared Source of Truth

The semantic `--color-*` contract and the light/dark palettes are **not** defined
per project. They live in one framework-neutral package, **`themes`** (a tag-pinned
Bitbucket git-dependency), shared by:

- **zingularis/foundation** (Solid) — all palettes, incl. `golden`.
- **my-react-shell** (React) — the same palettes minus `golden`.

Each framework keeps its own ThemeProvider runtime (the class toggled on `<html>`);
the package owns only the colors. Edit a palette there, bump the tag, and the change
propagates to every consumer — no hand-copying between repos.

## Changing colors or tokens

Do it in the `themes` repo (`~/Developer/themes`), never by patching a consumer:

1. Edit the palette `.css` (or `contract.css` for the token set itself).
2. Add / remove / rename a `--color-*` token → update `contract.css`, **every**
   palette, and the React demo's `PaletteReference` token list (my-react-shell-demo),
   or the token won't render.
3. Commit, push, **tag** a new version.
4. Bump the tag in each consumer's `package.json` and reinstall.

A brand-new palette additionally needs each consumer's CSS barrel + theme registry,
and on the Solid side the Convex `THEME_NAMES` validator, translation keys, and
`dev check themes`. See foundation's `docs/guides/theming-system.md` and
my-react-shell's `docs/guides/theme.md`.

## Universal rule

Never hardcode colors — no hex, no RGB, no `bg-blue-500`. Use the semantic tokens
your framework exposes, pair foreground with background, and verify every palette ×
light/dark. The per-framework usage idiom lives in its own place:

- **Solid** (foundation, sites, zing-admin) → apply tokens as `bg-(--color-primary)`; see `theme-styling`.
- **React** (my-react-shell + apps) → see my-react-shell's `docs/guides/theme.md`.
