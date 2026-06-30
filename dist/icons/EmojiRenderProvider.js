import { jsx as _jsx } from "react/jsx-runtime";
/**
 * EmojiRenderProvider — installs an optional emoji-render function for the subtree.
 *
 * Stateless and effect-free: it just publishes the consumer's `render` callback on the
 * context. When mounted, <Icon>'s emoji branch (and everything that renders through it —
 * createIconRenderer, the chrome's renderIcon, every <AppIcon>) draws each emoji char by
 * calling `render(emoji, size)` instead of printing the raw char. When NOT mounted, those
 * sites render the raw char in the page font, unchanged.
 *
 * The shell intentionally ships no renderer; the consumer owns the policy (e.g. a bundled
 * Noto SVG per codepoint with a native fallback). SPA-only, matching the other providers.
 */
import { useMemo } from 'react';
import { EmojiRenderContext } from './emojiRenderContext';
export function EmojiRenderProvider({ children, render }) {
    // Stabilise the context value on `render` identity so consumers can pass an inline
    // function without re-rendering the whole subtree every parent render.
    const value = useMemo(() => render, [render]);
    return _jsx(EmojiRenderContext.Provider, { value: value, children: children });
}
