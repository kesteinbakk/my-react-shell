import type { IconMode } from '../icons/iconModeContext';
/**
 * The close-affordance glyph shared by the overlay components (`Dialog`, `Sheet`).
 * Renders the lucide-style ✕ icon by default, swapping to the ✖️ emoji once the
 * consumer wires the icons↔emojis seam and the app is in emoji mode
 * (`iconMode === 'emoji'`) — matching `UserPreferences`' own close glyph. Left
 * unwired (`iconMode` omitted) it always renders the icon, so it is non-breaking.
 */
export declare function CloseGlyph({ iconMode }: {
    iconMode?: IconMode;
}): import("react").JSX.Element;
