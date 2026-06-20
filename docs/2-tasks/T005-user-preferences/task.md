# T005 — user-preferences component + icon/emoji display-mode seam

**Status:** in-progress · **Filed:** 2026-06-20 · **Worktree:** main

## Goal

Ship a **default user-preferences component** (theme picker + light/dark/system +
an icons↔emojis switch) and the **icon/emoji display-mode seam** that makes the
switch mean something — inspired by how the SolidJS `zingularis/foundation` solves
it, adapted to my-react-shell's module boundaries.

Foundation references:
- `src/shell/actionRow.tsx` → `ThemeAction` (a modal: palette grid + emoji toggle + light/dark).
- `src/kit/icons/Icon.tsx` → a central `<Icon>` that swaps a lucide glyph ↔ emoji on a global `useEmojis` flag.

## Key constraint that shapes the design

Unlike foundation, **my-react-shell ships no icon kit** — the app-shell renders
icons via a consumer-supplied `config.renderIcon(key, size)` ([AppMenu.tsx](../../../src/app-shell/AppMenu.tsx)),
consumers use lucide directly, and `concept.md` states this explicitly. So there is
no central `<Icon>` for an emoji switch to hook into. We therefore ship the
**preference seam** (and a thin Icon helper), not a 150-icon registry.

## Decisions (owner, 2026-06-20)

- **Q1 — how the switcher swaps icons → seam + thin `<Icon>` helper (option B).**
  The library owns the *preference* and the *swap mechanism*; the consumer owns the
  actual icons/emojis. No `lucide-react` dependency enters the library; the "no icon
  kit" boundary holds. (Rejected: a full foundation-style Icon module with a
  lucide-backed registry — adds a peer dep and breaks the boundary.)
- **Q2 — scope → preferences-only (option A).** The component ships theme +
  light/dark/system + the icons↔emojis toggle, and stays **auth-free / Convex-free**.
  Account actions (sign out / profile) are surfaced via an optional `accountActions`
  render slot, so the consumer wires identity without the kit importing the auth seam.
- **Persistence → the component is controlled.** It exposes the current value *and*
  an `onChange` for every preference and persists nothing itself, so the project
  decides where state lives (localStorage / Convex / per-user account). The shipped
  providers give the batteries-included default.
- **Presentation → Radix Dialog (modal).** Matches foundation's `ThemeAction`
  (a modal) and reuses the `@radix-ui/react-dialog` peer that `ConfirmDialog`
  already uses and the demo already installs — no `@radix-ui/react-popover` dep.

## Deliverables

### my-react-shell

1. **New module `my-react-shell/icons`** (`src/icons/`, pure React, no heavy deps):
   - `IconModeProvider` — holds `iconMode: 'icon' | 'emoji'`. Uncontrolled by default
     (localStorage, zero-config); controllable via `value` + `onChange` to redirect to
     a backend. Optional `storageKey`, `defaultMode`.
   - `useIconMode()` → `{ iconMode, setIconMode, isEmoji }`.
   - `<Icon icon={<svg/>} emoji="🎨" />` — thin swap; renders the SVG node or an emoji
     span sized by `size`, reading the active mode from context (defaults to `icon` with
     no provider). No baked-in registry.
2. **New component `<UserPreferences>`** (`src/components/UserPreferences.tsx`):
   controlled theme/display panel in a Radix Dialog; trigger icon-button; segmented
   controls for mode + icon-mode; palette grid; optional `accountActions` slot; labels
   via props (English defaults, no runtime i18n).
3. **`ThemeProvider`** — additive, non-breaking optional `onChange` fired on
   theme/mode/followSystem change (lets a consumer mirror theme to a backend).
4. **Packaging** — `exports["./icons"]`, `CLAUDE.md` consumer example, `components/index.ts` export.

### my-react-shell-demo

- `main.tsx` — wrap in `IconModeProvider`.
- `chrome.tsx` — replace `PaletteSelect` + `ThemeModeToggle` with `<UserPreferences>`
  wired to `useTheme()` + `useIconMode()`.
- `shell-config.tsx` — `renderIcon` returns `<Icon icon={<Lucide/>} emoji={…} />` so the
  whole demo flips icons↔emojis; add an emoji map for the keys in use.

### Docs

- `concept.md` (module list), `strategy.md` (new **D12**), `CLAUDE.md` (exports + usage),
  a new `docs/guides/icons.md`, and a `<UserPreferences>` entry in the component-kit guide.

## Verification

- `pnpm typecheck` green in **both** repos.
- Demo: opening preferences changes palette/mode live; toggling emojis flips every
  shell icon (verified in-browser by the user — agents don't run the dev server).

## Notes

- Concurrent T004 (P4 forms) is active in the same `main` tree; this task touches
  mostly new files + targeted edits, and commits only its own paths.
