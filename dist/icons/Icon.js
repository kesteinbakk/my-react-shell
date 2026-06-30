import { jsx as _jsx } from "react/jsx-runtime";
import { useIconModeContextOptional } from './iconModeContext';
import { useEmojiRender } from './emojiRenderContext';
const EMOJI_STYLE_BASE = {
    lineHeight: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
};
export function Icon({ icon, emoji, size = 20, label, className, forceIcon = false }) {
    const ctx = useIconModeContextOptional();
    const renderEmoji = useEmojiRender();
    // Label present → announced (role=img); absent → decorative (aria-hidden).
    const role = label !== undefined ? 'img' : undefined;
    const ariaHidden = label === undefined ? true : undefined;
    if (!forceIcon && ctx?.iconMode === 'emoji') {
        // With a provider, the consumer's renderer draws the char (e.g. a bundled SVG with a
        // native fallback); without one, the raw char renders in the page font, exactly as
        // before. The wrapper span (className / aria / sizing) is identical either way.
        const content = renderEmoji ? renderEmoji(emoji, size) : emoji;
        return (_jsx("span", { className: className, role: role, "aria-label": label, "aria-hidden": ariaHidden, style: { ...EMOJI_STYLE_BASE, fontSize: `${size}px` }, children: content }));
    }
    return (_jsx("span", { className: className, role: role, "aria-label": label, "aria-hidden": ariaHidden, style: { display: 'inline-flex' }, children: icon }));
}
