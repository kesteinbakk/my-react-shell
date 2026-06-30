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
import type { ReactNode } from 'react';
import type { EmojiRenderer } from './emojiRenderContext';
export interface EmojiRenderProviderProps {
    children: ReactNode;
    /** Draws an emoji char at a pixel size; its result replaces the raw char in <Icon>. */
    render: EmojiRenderer;
}
export declare function EmojiRenderProvider({ children, render }: EmojiRenderProviderProps): import("react").JSX.Element;
