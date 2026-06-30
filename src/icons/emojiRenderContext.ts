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

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'

/**
 * Draw an emoji char at a pixel size. The returned node replaces the raw `{emoji}` that
 * <Icon> would otherwise render — typically an `<img>` (a per-codepoint asset) with a
 * native-char fallback, but any node is valid. The shell never sizes the result; size it
 * to `size` inside the renderer if it matters.
 */
export type EmojiRenderer = (emoji: string, size: number) => ReactNode

export const EmojiRenderContext = createContext<EmojiRenderer | null>(null)

/**
 * Read the active emoji renderer, or `null` when used outside an <EmojiRenderProvider>.
 * `null` is the backward-compatible default — <Icon> falls back to the raw char.
 */
export function useEmojiRender(): EmojiRenderer | null {
  return useContext(EmojiRenderContext)
}
