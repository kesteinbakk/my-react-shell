import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cn } from './cn'
import type { IconButtonSize } from './iconButtonScale'

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * The icon glyph, centered in the square. Size it from the paired glyph scale
   * (`ICON_BUTTON_GLYPH_PX`) so the icon tracks the box across the size steps.
   */
  children: ReactNode
  /** Box size step — sm · md · lg · xl. Defaults to `md`. */
  size?: IconButtonSize
  /** Pressed / toggled state → `aria-pressed`. */
  active?: boolean
  /** Accessible name. Required for any non-decorative icon button. */
  'aria-label'?: string
  className?: string
}

/**
 * The canonical square **icon-only button** — a ghost button that wraps a single
 * icon glyph in a fixed square hit-area (the box scale, `--mrs-icon-btn-*`), lit on
 * hover / open / focus. One component for every icon trigger in the kit; `DropdownMenu`
 * renders it for its `iconTrigger`.
 *
 * It forwards its `ref` and spreads native button props, so it drops straight into a
 * Radix `asChild` trigger (Dropdown / Popover / Tooltip). The glyph size is the
 * caller's to set — pair it with `ICON_BUTTON_GLYPH_PX[size]`:
 *
 * ```tsx
 * <IconButton size="md" aria-label={t('action.settings')} onClick={openSettings}>
 *   <Settings size={ICON_BUTTON_GLYPH_PX.md} />
 * </IconButton>
 * ```
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton({ children, size = 'md', active, type = 'button', className, ...rest }, ref) {
    return (
      <button
        ref={ref}
        {...rest}
        type={type}
        data-size={size}
        aria-pressed={active}
        className={cn('mrs-icon-btn', className)}
      >
        {children}
      </button>
    )
  },
)
