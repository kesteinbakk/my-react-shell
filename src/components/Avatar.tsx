import { Children, useState, type ReactNode } from 'react'
import { cn } from './cn'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  /** Image URL. Falls back to `fallback` if absent or it fails to load. */
  src?: string
  alt?: string
  /** Initials / short text shown when there's no image. When omitted, a person icon/emoji is shown. */
  fallback?: ReactNode
  size?: AvatarSize
  /**
   * Render the person emoji (`👤`) instead of the SVG icon when no `fallback` is set.
   * Wire to `useIconMode().isEmoji` to follow the icons↔emojis seam.
   */
  showEmoji?: boolean
  className?: string
}

const svgBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

const FALLBACK_ICON_PX: Record<AvatarSize, number> = { sm: 16, md: 20, lg: 28 }

function PersonIcon({ px }: { px: number }) {
  return (
    <svg width={px} height={px} {...svgBase} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.58-7 8-7s8 3 8 7" />
    </svg>
  )
}

/** Avatar — image with an initials / text fallback (on image error too). */
export function Avatar({ src, alt = '', fallback, size = 'md', showEmoji = false, className }: AvatarProps) {
  const [errored, setErrored] = useState(false)
  const showImage = src != null && src !== '' && !errored

  const resolvedFallback =
    fallback != null ? fallback : showEmoji ? (
      <span aria-hidden="true" style={{ fontSize: FALLBACK_ICON_PX[size] }}>👤</span>
    ) : (
      <PersonIcon px={FALLBACK_ICON_PX[size]} />
    )

  return (
    <span className={cn('mrs-avatar', `mrs-avatar--${size}`, className)}>
      {showImage ? (
        <img
          className="mrs-avatar__img"
          src={src}
          alt={alt}
          onError={() => setErrored(true)}
        />
      ) : (
        <span className="mrs-avatar__fallback">{resolvedFallback}</span>
      )}
    </span>
  )
}

export interface AvatarGroupProps {
  children?: ReactNode
  /** Max avatars shown before a `+N` overflow badge. */
  max?: number
  className?: string
}

/** Overlapping stack of avatars with an optional `+N` overflow badge. */
export function AvatarGroup({ children, max, className }: AvatarGroupProps) {
  const items = Children.toArray(children)
  const shown = max != null ? items.slice(0, max) : items
  const overflow = items.length - shown.length
  return (
    <div className={cn('mrs-avatar-group', className)}>
      {shown}
      {overflow > 0 && (
        <span className="mrs-avatar mrs-avatar--md mrs-avatar-group__more">
          <span className="mrs-avatar__fallback">+{overflow}</span>
        </span>
      )}
    </div>
  )
}
