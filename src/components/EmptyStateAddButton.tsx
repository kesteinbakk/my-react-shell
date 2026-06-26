import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { cva } from 'class-variance-authority'

import { cn } from './cn'
import type { Tone } from './tone'

/* ── Tone / size ─────────────────────────────────────────────────────────── */

export type EmptyStateAddButtonTone = Tone
export type EmptyStateAddButtonSize = 'sm' | 'md' | 'lg'

const emptyStateAddButtonVariants = cva('mrs-empty-add-btn', {
  variants: {
    tone: {
      neutral: 'mrs-empty-add-btn--neutral',
      primary: 'mrs-empty-add-btn--primary',
      success: 'mrs-empty-add-btn--success',
      warning: 'mrs-empty-add-btn--warning',
      danger: 'mrs-empty-add-btn--danger',
      info: 'mrs-empty-add-btn--info',
    },
    size: {
      sm: 'mrs-empty-add-btn--sm',
      md: 'mrs-empty-add-btn--md',
      lg: 'mrs-empty-add-btn--lg',
    },
    showBorder: {
      true: 'mrs-empty-add-btn--border',
    },
  },
  defaultVariants: { tone: 'success', size: 'sm', showBorder: true },
})

/** Default icon is a plus sign. */
const DefaultAddIcon = ({ px }: { px: number }) => (
  <svg
    width={px}
    height={px}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14" />
    <path d="M5 12h14" />
  </svg>
)

const ICON_PX: Record<EmptyStateAddButtonSize, number> = {
  sm: 32,
  md: 48,
  lg: 64,
}

/* ── Props ────────────────────────────────────────────────────────────────── */

export interface EmptyStateAddButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Click handler. */
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void
  /**
   * Label displayed below the button.
   * Use a descriptive label about what is being added, for instance "Add new message".
   */
  label: string
  /**
   * Optional secondary description rendered below the label. Use when the
   * empty state is a "hero" surface that needs to explain *why* (e.g.
   * "No conversations yet — pick an identity to start chatting").
   */
  description?: ReactNode
  /** Native tooltip shown on hover (the `title` attribute). */
  hint?: string
  /** Disabled state. */
  disabled?: boolean
  /** Button `type` attribute. Defaults to `button`. */
  type?: 'button' | 'submit' | 'reset'
  /** Size of the button (sm, md, lg). Default: sm (80px button) */
  size?: EmptyStateAddButtonSize
  /**
   * Icon shown inside the button. Defaults to a plus sign. Pass a custom icon
   * to communicate the *what* alongside the "add" affordance.
   */
  icon?: ReactNode
  /**
   * Semantic tone. Defaults to `success` so the standard "add" affordance reads green.
   * Use `primary` (or another theme accent) when the empty state belongs to
   * a domain with its own brand color.
   */
  tone?: EmptyStateAddButtonTone
  /**
   * Whether to render the outer full-width dashed-border container.
   * Default: `true` — gives the in-list / inline empty-state look. Set
   * `false` for "hero" empty states (full-page void with title +
   * description) where the outer rectangle would be visual noise.
   */
  showBorder?: boolean
  /** Extra classes, merged via `cn()`. */
  className?: string
}

/* ── Component ────────────────────────────────────────────────────────────── */

/**
 * Add button tailored for empty states.
 *
 * Two shapes from one component:
 *   - `showBorder` (default `true`) → in-list / inline shape: full-width
 *     dashed rectangle wrapping the button + label. Use for sidebar / list
 *     empty states where the surface is constrained.
 *   - `showBorder={false}` → "hero" shape: just the button + label (+
 *     optional description), centered without an outer frame. Use for
 *     full-page void states.
 *
 * The inner circle is the click target in both shapes — the `showBorder`
 * prop only controls the *outer* rectangle.
 */
export const EmptyStateAddButton = forwardRef<HTMLButtonElement, EmptyStateAddButtonProps>(
  function EmptyStateAddButton(props, ref) {
    const {
      onClick,
      label,
      description,
      hint,
      disabled = false,
      type = 'button',
      size = 'sm',
      icon,
      tone = 'success',
      showBorder = true,
      className,
      ...rest
    } = props

    const px = ICON_PX[size]

    return (
      <div
        className={cn(
          emptyStateAddButtonVariants({ tone, size, showBorder }),
          className,
        )}
        title={hint}
      >
        <div className="mrs-empty-add-btn__inner">
          <button
            ref={ref}
            type={type}
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            className="mrs-empty-add-btn__btn"
            {...rest}
          >
            <span className="mrs-empty-add-btn__icon">
              {icon ?? <DefaultAddIcon px={px} />}
            </span>
          </button>
          <span className="mrs-empty-add-btn__label">{label}</span>
          {description != null && (
            <p className="mrs-empty-add-btn__desc">{description}</p>
          )}
        </div>
      </div>
    )
  },
)
