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

/* ── Icon glyph size ─────────────────────────────────────────────────────────
   The pixel size a rendered glyph (an inline `<svg>` or emoji) draws at — the
   `<Icon>` / `renderIcon(name, px)` counterpart to the icon-button box scale. */
export type IconSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Pixel size per icon-glyph step. `md` (24) is the default glyph size. */
export const ICON_GLYPH_PX: Record<IconSize, number> = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
}

/* ── UI text size ────────────────────────────────────────────────────────────
   Font-size steps for shell/body text (not display headings). `md` (1rem) is the
   base body size; `sm` (0.875rem) is the most common UI-control size. */
export type TextSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** rem font-size per text step, as a CSS length string. */
export const TEXT_SIZE_REM: Record<TextSize, string> = {
  xs: '0.75rem',
  sm: '0.875rem',
  md: '1rem',
  lg: '1.125rem',
  xl: '1.25rem',
}
