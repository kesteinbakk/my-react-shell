/**
 * Shared design size scales — the glyph and text step ladders.
 *
 * The counterparts to the icon-BUTTON box scale (`IconButtonSize` /
 * `ICON_BUTTON_GLYPH_PX` in components/iconButton.ts). One vocabulary so an icon
 * glyph and a run of UI text are sized from a fixed ladder rather than an ad-hoc
 * literal. Each maps to a CSS token in styles/base.css (`--mrs-icon-*` /
 * `--mrs-text-*`) — keep the two in sync.
 *
 * These establish the ladder; they are NOT yet wired into the component kit (the
 * components keep their own per-component `size` maps for now). Use them directly,
 * or adopt them over time.
 */
/** Pixel size per icon-glyph step. `md` (24) is the default glyph size. */
export const ICON_GLYPH_PX = {
    xs: 16,
    sm: 20,
    md: 24,
    lg: 32,
    xl: 40,
};
/** rem font-size per text step, as a CSS length string. */
export const TEXT_SIZE_REM = {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
};
