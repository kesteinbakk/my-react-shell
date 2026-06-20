import type { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'

const alertVariants = cva('mrs-alert', {
  variants: {
    variant: {
      info: 'mrs-alert--info',
      success: 'mrs-alert--success',
      warning: 'mrs-alert--warning',
      danger: 'mrs-alert--danger',
    },
  },
  defaultVariants: { variant: 'info' },
})

export type AlertVariant = NonNullable<VariantProps<typeof alertVariants>['variant']>

export interface AlertProps {
  /** Visual + semantic tone. Defaults to `info`. */
  variant?: AlertVariant
  /** Optional bold lead line above the body. */
  title?: ReactNode
  /** The alert body / description. */
  children?: ReactNode
  /** Override the default leading icon, or pass `false` to drop it. */
  icon?: ReactNode | false
  /** When set, renders a dismiss button that calls this handler. */
  onDismiss?: () => void
  /** Accessible label for the dismiss button. Defaults to `"Dismiss"`. */
  dismissLabel?: string
  /** ARIA role. `alert` (default) is assertive; use `status` for non-urgent notices. */
  role?: 'alert' | 'status'
  /** Extra classes merged onto the root. */
  className?: string
}

const iconProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const

const DEFAULT_ICONS: Record<AlertVariant, ReactNode> = {
  info: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  ),
  success: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
  warning: (
    <svg {...iconProps}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  ),
  danger: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  ),
}

/**
 * Inline alert / callout box. An opinionated composite on the semantic theme
 * tokens: a tinted surface (`--color-<tone>-bg`), a matching border
 * (`--color-<tone>-border`), and AA-legible on-tint text (`--color-<tone>-strong`),
 * with a per-tone leading icon and an optional dismiss control.
 */
export function Alert({
  variant = 'info',
  title,
  children,
  icon,
  onDismiss,
  dismissLabel = 'Dismiss',
  role = 'alert',
  className,
}: AlertProps) {
  const leading = icon === false ? null : (icon ?? DEFAULT_ICONS[variant])
  return (
    <div role={role} className={cn(alertVariants({ variant }), className)}>
      {leading != null && (
        <span className="mrs-alert__icon" aria-hidden="true">
          {leading}
        </span>
      )}
      <div className="mrs-alert__content">
        {title != null && <div className="mrs-alert__title">{title}</div>}
        {children != null && <div className="mrs-alert__body">{children}</div>}
      </div>
      {onDismiss != null && (
        <button
          type="button"
          className="mrs-alert__dismiss"
          onClick={onDismiss}
          aria-label={dismissLabel}
        >
          <svg {...iconProps} width={16} height={16}>
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
