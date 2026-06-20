// my-react-shell/icons — the icons↔emojis display-mode seam (sub-path
// `my-react-shell/icons`).
//
// my-react-shell ships no icon registry; consumers render their own glyphs (lucide,
// etc.). This module adds only the *preference* (render icons or emojis) and a thin
// <Icon> that swaps a glyph for its emoji per that preference — the React-era take on
// foundation's `useEmojis` Icon switch, without a lucide dependency. Pair it with the
// <UserPreferences> component (my-react-shell/components) to give users the toggle.
// Pure React: no heavy peers, no stylesheet to import. See docs/guides/icons.md.
export { IconModeProvider } from './IconModeProvider';
export { Icon } from './Icon';
export { useIconMode } from './useIconMode';
