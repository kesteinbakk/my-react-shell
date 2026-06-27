import { useState, type CSSProperties, type ReactNode } from 'react'
import * as RadixCollapsible from '@radix-ui/react-collapsible'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './cn'

const triggerVariants = cva('mrs-collapsible__trigger', {
  variants: {
    variant: {
      default: 'mrs-collapsible__trigger--default',
      bordered: 'mrs-collapsible__trigger--bordered',
      ghost: 'mrs-collapsible__trigger--ghost',
      filled: 'mrs-collapsible__trigger--filled',
    },
    size: {
      sm: 'mrs-collapsible__trigger--sm',
      md: 'mrs-collapsible__trigger--md',
      lg: 'mrs-collapsible__trigger--lg',
    },
    layout: {
      // Chevron pushed to the right edge (the default) vs. sitting directly after
      // the trigger content.
      spread: 'mrs-collapsible__trigger--spread',
      inline: 'mrs-collapsible__trigger--inline',
    },
  },
  defaultVariants: { variant: 'default', size: 'md', layout: 'spread' },
})

export type CollapsibleVariant = NonNullable<VariantProps<typeof triggerVariants>['variant']>
export type CollapsibleSize = NonNullable<VariantProps<typeof triggerVariants>['size']>

export interface CollapsibleProps {
  /** Controlled open state. Omit for an uncontrolled collapsible. */
  expanded?: boolean
  /** Initial open state when uncontrolled. Defaults to `false`. */
  defaultExpanded?: boolean
  /** Fired whenever the open state changes — in both controlled and uncontrolled mode. */
  onExpandedChange?: (expanded: boolean) => void
  /** Static trigger content. */
  trigger?: ReactNode
  /**
   * Trigger content as a function of the open state — use when the trigger must
   * itself reflect expansion. Takes precedence over `trigger`.
   */
  renderTrigger?: (expanded: boolean) => ReactNode
  /** The content revealed when expanded. */
  children?: ReactNode
  /** Actions rendered before the trigger label. Interacting with them won't toggle the collapsible. */
  actionsStart?: ReactNode
  /** Actions rendered before the chevron. Interacting with them won't toggle the collapsible. */
  actionsEnd?: ReactNode
  /** Render the rotating chevron. Defaults to `true`. */
  showArrow?: boolean
  /** Expand/collapse animation duration in milliseconds. Defaults to `200`. */
  animationDuration?: number
  /** Disable the trigger. */
  disabled?: boolean
  /** Trigger surface treatment. Defaults to `default`. */
  variant?: CollapsibleVariant
  /** Trigger padding + type scale. Defaults to `md`. */
  size?: CollapsibleSize
  /**
   * Place the chevron directly after the trigger content (left-aligned) instead
   * of pushing it to the right edge. Defaults to `false`.
   */
  inlineChevron?: boolean
  /** Extra classes merged onto the root. */
  className?: string
  /** Extra classes merged onto the trigger button. */
  triggerClassName?: string
  /** Extra classes merged onto the content region. */
  contentClassName?: string
  /** Extra classes merged onto the chevron. */
  arrowClassName?: string
}

const chevronDown = (
  <svg
    width={16}
    height={16}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

/**
 * A single disclosure: a trigger that toggles one collapsible region, on Radix
 * Collapsible (open-state management, `aria-expanded`/`aria-controls`, the
 * `--radix-collapsible-content-height` var the height animation reads). Works
 * controlled (`expanded` / `onExpandedChange`) or uncontrolled (`defaultExpanded`).
 * For a set of disclosures with one-open-at-a-time / roving-focus behavior, use
 * `Accordion` instead.
 */
export function Collapsible({
  expanded,
  defaultExpanded = false,
  onExpandedChange,
  trigger,
  renderTrigger,
  children,
  actionsStart,
  actionsEnd,
  showArrow = true,
  animationDuration = 200,
  disabled,
  variant,
  size,
  inlineChevron = false,
  className,
  triggerClassName,
  contentClassName,
  arrowClassName,
}: CollapsibleProps) {
  const [internalOpen, setInternalOpen] = useState(defaultExpanded)
  const isControlled = expanded !== undefined
  const open = isControlled ? expanded : internalOpen

  const handleOpenChange = (next: boolean) => {
    if (!isControlled) setInternalOpen(next)
    onExpandedChange?.(next)
  }

  const contentStyle = {
    '--mrs-collapsible-duration': `${animationDuration}ms`,
  } as unknown as CSSProperties

  return (
    <RadixCollapsible.Root
      open={open}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      className={cn('mrs-collapsible', className)}
    >
      <RadixCollapsible.Trigger
        className={cn(
          triggerVariants({ variant, size, layout: inlineChevron ? 'inline' : 'spread' }),
          triggerClassName,
        )}
      >
        <div className="mrs-collapsible__trigger-main">
          {actionsStart && (
            <div
              className="mrs-collapsible__actions"
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {actionsStart}
            </div>
          )}
          <span className="mrs-collapsible__label">
            {renderTrigger ? renderTrigger(open) : trigger}
          </span>
        </div>
        {(actionsEnd || showArrow) && (
          <div className="mrs-collapsible__trigger-end">
            {actionsEnd && (
              <div
                className="mrs-collapsible__actions"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {actionsEnd}
              </div>
            )}
            {showArrow && (
              <span
                className={cn(
                  'mrs-collapsible__chevron',
                  open && 'mrs-collapsible__chevron--open',
                  arrowClassName,
                )}
                aria-hidden="true"
              >
                {chevronDown}
              </span>
            )}
          </div>
        )}
      </RadixCollapsible.Trigger>
      <RadixCollapsible.Content
        className={cn('mrs-collapsible__content', contentClassName)}
        style={contentStyle}
      >
        <div className="mrs-collapsible__body">{children}</div>
      </RadixCollapsible.Content>
    </RadixCollapsible.Root>
  )
}
