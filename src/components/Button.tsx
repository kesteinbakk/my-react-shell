import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './cn'
import type { Tone } from './tone'

export type ButtonVariant = 'solid' | 'soft' | 'outline' | 'ghost' | 'link'
export type ButtonSize = 'sm' | 'md' | 'lg'

const buttonVariants = cva('mrs-btn', {
  variants: {
    variant: {
      solid: 'mrs-btn--solid',
      soft: 'mrs-btn--soft',
      outline: 'mrs-btn--outline',
      ghost: 'mrs-btn--ghost',
      link: 'mrs-btn--link',
    },
    tone: {
      primary: 'mrs-btn--primary',
      neutral: 'mrs-btn--neutral',
      info: 'mrs-btn--info',
      success: 'mrs-btn--success',
      warning: 'mrs-btn--warning',
      danger: 'mrs-btn--danger',
    },
    size: {
      sm: 'mrs-btn--sm',
      md: 'mrs-btn--md',
      lg: 'mrs-btn--lg',
    },
    fullWidth: { true: 'mrs-btn--full' },
  },
  defaultVariants: { variant: 'solid', tone: 'primary', size: 'md' },
})

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Structural style. Defaults to `solid`. */
  variant?: ButtonVariant
  /** Semantic colour. Defaults to `primary`. */
  tone?: Tone
  /** Size — drives padding + font size. Defaults to `md`. */
  size?: ButtonSize
  /** Stretch to the container width. */
  fullWidth?: boolean
  /** Optional leading glyph (icon / emoji), before the label. */
  leadingIcon?: ReactNode
  /** Optional trailing glyph, after the label. */
  trailingIcon?: ReactNode
  children?: ReactNode
}

/**
 * The kit's button. Two orthogonal axes — **`variant`** (structural: `solid` · `soft`
 * · `outline` · `ghost` · `link`) and **`tone`** (semantic colour) — plus **`size`**.
 * Renders a native `<button>`; all native button props (`onClick`, `disabled`,
 * `type`, `aria-*`, …) pass straight through, and the `ref` is forwarded to the
 * `<button>` — so it can be a Radix trigger (Popover / Tooltip / Dropdown `asChild`).
 *
 * ```tsx
 * <Button>Save</Button>                                  // solid primary (default)
 * <Button variant="outline">Cancel</Button>             // outline primary
 * <Button tone="danger">Delete</Button>                 // solid danger
 * <Button variant="ghost" tone="neutral">Dismiss</Button>
 * ```
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'solid',
    tone = 'primary',
    size = 'md',
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    type = 'button',
    className,
    children,
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        buttonVariants({ variant, tone, size, fullWidth: fullWidth || undefined }),
        className,
      )}
      {...rest}
    >
      {leadingIcon != null && (
        <span className="mrs-btn__icon" aria-hidden="true">
          {leadingIcon}
        </span>
      )}
      {children != null && <span className="mrs-btn__label">{children}</span>}
      {trailingIcon != null && (
        <span className="mrs-btn__icon" aria-hidden="true">
          {trailingIcon}
        </span>
      )}
    </button>
  )
})
