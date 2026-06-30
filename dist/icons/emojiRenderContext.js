/**
 * Emoji-render context — an optional seam for swapping how an emoji *char* is drawn,
 * isolated from the effectful <EmojiRenderProvider> (same split as iconModeContext)
 * so editing the provider doesn't mint a new context identity on hot reload. Keep this
 * file free of effects and component imports.
 *
 * The shell ships NO renderer of its own. When no provider is present, <Icon>'s emoji
 * branch renders the raw char in the page font, exactly as before — every consumer that
 * doesn't opt in is unchanged. A consumer that wants a custom emoji surface (e.g. a
 * bundled Noto SVG per codepoint, with a native fallback) supplies the renderer via
 * <EmojiRenderProvider>; <Icon> then calls it and renders its result in the same wrapper
 * span (className / aria / size preserved).
 */
import { createContext, useContext } from 'react';
export const EmojiRenderContext = createContext(null);
/**
 * Read the active emoji renderer, or `null` when used outside an <EmojiRenderProvider>.
 * `null` is the backward-compatible default — <Icon> falls back to the raw char.
 */
export function useEmojiRender() {
    return useContext(EmojiRenderContext);
}
