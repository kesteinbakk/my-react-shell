import type { IconMode } from '../icons/iconModeContext';
/**
 * The close-affordance glyph shared by the overlay components (`Dialog`, `Sheet`).
 * Renders the lucide-style ✕ icon by default, swapping to the ❌ emoji when the app
 * is in emoji display mode — matching `UserPreferences`' own close glyph.
 *
 * The emoji is ❌ (cross mark), not ✖️ (heavy multiplication x). ✖️ carries an
 * emoji-presentation variation selector that forces the platform's *monochrome* glyph,
 * which renders near-black and ignores `currentColor` — so on a dark surface it is
 * almost invisible. ❌ is a genuinely coloured emoji, legible on light and dark alike.
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
