/**
 * The shared square icon-button size scale.
 *
 * One vocabulary for every square, icon-only trigger in the kit — the
 * `DropdownMenu` icon-trigger, the `UserPreferences` trigger, `LanguagePicker`,
 * and the app-shell `HeaderActionButton`. Each renders the same box at the same
 * `data-size`, so an icon button is the same size everywhere unless a caller opts
 * into a different step. `md` is the default. Sizes map to `--mrs-icon-btn-*` in
 * components.css; keep the two in sync.
 */
export type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl'

/** Glyph pixel size that pairs with each icon-button box size. */
export const ICON_BUTTON_GLYPH_PX: Record<IconButtonSize, number> = {
  sm: 18,
  md: 20,
  lg: 22,
  xl: 26,
}
