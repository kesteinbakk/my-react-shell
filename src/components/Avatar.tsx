import { Children, useState, type ReactNode } from 'react'
import { cn } from './cn'

export type AvatarSize = 'sm' | 'md' | 'lg'

export interface AvatarProps {
  /** Image URL. Falls back to `fallback` if absent or it fails to load. */
  src?: string
  alt?: string
  /** Initials / short text shown when there's no image. */
  fallback?: ReactNode
  size?: AvatarSize
  className?: string
}

/** Avatar — image with an initials / text fallback (on image error too). */
export function Avatar({ src, alt = '', fallback, size = 'md', className }: AvatarProps) {
  const [errored, setErrored] = useState(false)
  const showImage = src != null && src !== '' && !errored
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
        <span className="mrs-avatar__fallback">{fallback}</span>
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
