import type { IconMode } from '../icons/iconModeContext';
/**
 * The close-affordance glyph shared by the overlay components (`Dialog`, `Sheet`).
 * Renders the lucide-style ✕ icon by default, swapping to the ✖️ emoji when the app
 * is in emoji display mode — matching `UserPreferences`' own close glyph.
 *
 * Resolution order for the display mode:
 *   1. the explicit `iconMode` prop (an override), else
 *   2. the app's icons↔emojis seam, read *softly* via `useIconModeContextOptional()`
 *      — so the ✕ follows the toggle automatically with zero wiring, else
 *   3. `'icon'` when neither is present (a consumer that never installs the icons
 *      module is unaffected — the context read returns `null`, no provider required).
 *
 * This is the sanctioned **soft optional integration** exception to module
 * self-containment — see docs/maintainers/module-authoring.md → "Self-contained".
 */
export declare function CloseGlyph({ iconMode }: {
    iconMode?: IconMode;
}): import("react").JSX.Element;
