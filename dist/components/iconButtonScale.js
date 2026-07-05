import { ICON_GLYPH_PX } from '../sizes';
/**
 * Glyph pixel size per icon-button step — **drawn from the shared icon-glyph scale**
 * (`ICON_GLYPH_PX`), so a glyph inside a button is the same size as the same-named
 * bare glyph. `IconButton` sizes its own glyph from this; it is not something callers
 * normally pass.
 */
export const ICON_BUTTON_GLYPH_PX = {
    sm: ICON_GLYPH_PX.sm,
    md: ICON_GLYPH_PX.md,
    lg: ICON_GLYPH_PX.lg,
    xl: ICON_GLYPH_PX.xl,
};
