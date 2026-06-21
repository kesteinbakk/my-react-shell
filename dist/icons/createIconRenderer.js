import { jsx as _jsx } from "react/jsx-runtime";
import { Icon } from './Icon';
/** DEV-only one-time audit of the maps at construction. */
function auditMaps(iconKeys, emojis, forced, fallbackEmoji) {
    const emojiKeys = Object.keys(emojis);
    const hasEmoji = new Set(emojiKeys);
    const missing = iconKeys.filter((k) => !hasEmoji.has(k) && !forced.has(k));
    if (missing.length > 0) {
        console.warn(`[my-react-shell/icons] createIconRenderer: ${missing.length} icon key(s) have no emoji and ` +
            `will render the fallback "${fallbackEmoji}" in emoji mode:\n  ${missing.join(', ')}\n` +
            `Add an emoji for each, or list them in \`force\` to keep them as glyphs.`);
    }
    const iconKeySet = new Set(iconKeys);
    const orphans = emojiKeys.filter((k) => !iconKeySet.has(k));
    if (orphans.length > 0) {
        console.warn(`[my-react-shell/icons] createIconRenderer: ${orphans.length} emoji key(s) have no matching glyph ` +
            `(likely a typo or a renamed key):\n  ${orphans.join(', ')}`);
    }
}
/**
 * Build a `renderIcon(key, size, label?)` from a key→glyph map and a key→emoji map.
 * Typing `emojis` as `Record<keyof typeof icons, string>` makes a missing emoji a
 * compile error; for dynamically-built maps the dev warning is the backstop.
 */
export function createIconRenderer(icons, emojis, options = {}) {
    const { force, fallbackEmoji = '●', fallbackGlyph } = options;
    const forced = new Set(force);
    // Index access by arbitrary string at call time (key: string for app-shell drop-in).
    const iconsByKey = icons;
    const emojisByKey = emojis;
    if (import.meta.env.DEV) {
        auditMaps(Object.keys(icons), emojis, forced, fallbackEmoji);
    }
    const warnedUnknown = import.meta.env.DEV ? new Set() : undefined;
    return function renderIcon(key, size, label) {
        const glyphFactory = iconsByKey[key];
        const emoji = emojisByKey[key] ?? fallbackEmoji;
        if (import.meta.env.DEV && glyphFactory === undefined && !warnedUnknown.has(key)) {
            warnedUnknown.add(key);
            console.warn(`[my-react-shell/icons] renderIcon: no glyph registered for key "${key}".`);
        }
        const glyphNode = glyphFactory ? glyphFactory(size) : fallbackGlyph ? fallbackGlyph(size) : emoji;
        return _jsx(Icon, { icon: glyphNode, emoji: emoji, size: size, label: label, forceIcon: forced.has(key) });
    };
}
