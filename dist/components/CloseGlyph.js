import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const svg = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
};
/**
 * The close-affordance glyph shared by the overlay components (`Dialog`, `Sheet`).
 * Renders the lucide-style ✕ icon by default, swapping to the ✖️ emoji once the
 * consumer wires the icons↔emojis seam and the app is in emoji mode
 * (`iconMode === 'emoji'`) — matching `UserPreferences`' own close glyph. Left
 * unwired (`iconMode` omitted) it always renders the icon, so it is non-breaking.
 */
export function CloseGlyph({ iconMode }) {
    if (iconMode === 'emoji') {
        return (_jsx("span", { className: "mrs-close-emoji", "aria-hidden": "true", children: "\u2716\uFE0F" }));
    }
    return (_jsxs("svg", { ...svg, width: 16, height: 16, "aria-hidden": "true", children: [_jsx("path", { d: "M18 6 6 18" }), _jsx("path", { d: "m6 6 12 12" })] }));
}
