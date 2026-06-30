/**
 * <Icon> — the thin icons↔emojis swap.
 *
 * Give it a glyph node (e.g. a sized lucide icon) and that glyph's emoji
 * equivalent; <Icon> renders one or the other based on the active icon-mode (from
 * <IconModeProvider>; defaults to `icon` when there is no provider). This is the
 * whole "icon kit" my-react-shell ships — no registry, no `lucide-react` dependency.
 * The consumer supplies the glyph and the emoji, and typically wraps this in its own
 * key→glyph map (see the demo's `renderIcon`).
 */

import type { CSSProperties, ReactNode } from 'react'
import { useIconModeContextOptional } from './iconModeContext'
import { useEmojiRender } from './emojiRenderContext'

export interface IconProps {
  /** The glyph node shown in `icon` mode — typically a sized lucide icon. */
  icon: ReactNode
  /** The emoji shown in `emoji` mode. */
  emoji: string
  /** Pixel size for the emoji glyph; match your icon's size. Default `20`. */
  size?: number
  /** Accessible label. Omit to render the glyph decoratively (`aria-hidden`). */
  label?: string
  /** Class on the wrapper span (applied in both modes). */
  className?: string
  /**
   * Always render the glyph, even when emoji mode is active. For glyphs whose emoji
   * would misread (a brand mark) or where consistent sizing matters (a spinner).
   * The per-call counterpart to `createIconRenderer`'s `force` list.
   */
  forceIcon?: boolean
}

const EMOJI_STYLE_BASE: CSSProperties = {
  lineHeight: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export function Icon({ icon, emoji, size = 20, label, className, forceIcon = false }: IconProps): ReactNode {
  const ctx = useIconModeContextOptional()
  const renderEmoji = useEmojiRender()
  // Label present → announced (role=img); absent → decorative (aria-hidden).
  const role = label !== undefined ? 'img' : undefined
  const ariaHidden = label === undefined ? true : undefined

  if (!forceIcon && ctx?.iconMode === 'emoji') {
    // With a provider, the consumer's renderer draws the char (e.g. a bundled SVG with a
    // native fallback); without one, the raw char renders in the page font, exactly as
    // before. The wrapper span (className / aria / sizing) is identical either way.
    const content: ReactNode = renderEmoji ? renderEmoji(emoji, size) : emoji
    return (
      <span
        className={className}
        role={role}
        aria-label={label}
        aria-hidden={ariaHidden}
        style={{ ...EMOJI_STYLE_BASE, fontSize: `${size}px` }}
      >
        {content}
      </span>
    )
  }

  return (
    <span
      className={className}
      role={role}
      aria-label={label}
      aria-hidden={ariaHidden}
      style={{ display: 'inline-flex' }}
    >
      {icon}
    </span>
  )
}
