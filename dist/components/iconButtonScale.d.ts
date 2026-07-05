/**
 * The shared square icon-button size scale.
 *
 * One vocabulary for every square, icon-only trigger in the kit — the `IconButton`
 * (and the `DropdownMenu` icon-trigger / `LanguagePicker` built on it), the
 * `UserPreferences` trigger, and the app-shell `HeaderActionButton`. Each renders
 * the same box at the same `data-size`, so an icon button is the same size
 * everywhere unless a caller opts into a step. `md` is the default. The box grows as
 * `glyph + 2·padding` (padding steps up with size), mapped to `--mrs-icon-btn-*` in
 * components.css — keep the two in sync.
 */
export type IconButtonSize = 'sm' | 'md' | 'lg' | 'xl';
/**
 * Glyph pixel size per icon-button step — **drawn from the shared icon-glyph scale**
 * (`ICON_GLYPH_PX`), so a glyph inside a button is the same size as the same-named
 * bare glyph. `IconButton` sizes its own glyph from this; it is not something callers
 * normally pass.
 */
export declare const ICON_BUTTON_GLYPH_PX: Record<IconButtonSize, number>;
