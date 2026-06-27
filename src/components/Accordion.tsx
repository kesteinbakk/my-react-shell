import { type CSSProperties, type ReactNode } from 'react'
import * as RadixAccordion from '@radix-ui/react-accordion'
import { cn } from './cn'

export interface AccordionItem {
  /** Stable identifier used to track which panels are open. */
  value: string
  /** The always-visible header content. */
  trigger: ReactNode
  /** The content revealed when this item is expanded. */
  content: ReactNode
  /** Disable this item's trigger. */
  disabled?: boolean
  /** Actions rendered before the trigger label. Interacting with them won't toggle the accordion. */
  actionsStart?: ReactNode
  /** Actions rendered before the chevron. Interacting with them won't toggle the accordion. */
  actionsEnd?: ReactNode
}

export type AccordionVariant = 'default' | 'bordered' | 'separated'
export type AccordionSize = 'sm' | 'md' | 'lg'

export interface AccordionProps {
  /** The panels, in display order. */
  items: AccordionItem[]
  /**
   * `single` — one panel open at a time (opening one closes the rest).
   * `multiple` — panels open independently. Defaults to `single`.
   */
  type?: 'single' | 'multiple'
  /**
   * For `type="single"`, allow collapsing the open panel so none is open.
   * Ignored for `type="multiple"`. Defaults to `true`.
   */
  collapsible?: boolean
  /**
   * Controlled open value(s): a `string` for `type="single"`, a `string[]` for
   * `type="multiple"`.
   */
  value?: string | string[]
  /** Uncontrolled initial open value(s) — same shape as `value`. */
  defaultValue?: string | string[]
  /** Fired when the open set changes — receives the same shape as `value`. */
  onValueChange?: (value: string | string[]) => void
  /** Item surface treatment. Defaults to `default`. */
  variant?: AccordionVariant
  /** Trigger padding + type scale. Defaults to `md`. */
  size?: AccordionSize
  /** Render the rotating chevron on each item. Defaults to `true`. */
  showArrow?: boolean
  /** Expand/collapse animation duration in milliseconds. Defaults to `200`. */
  animationDuration?: number
  /** Extra classes merged onto the root. */
  className?: string
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
 * A vertical set of disclosures with group behavior, on Radix Accordion: roving
 * arrow-key focus between headers, single (one-open-at-a-time) or multiple-open
 * mode, and the `--radix-accordion-content-height` var each panel's height
 * animation reads. Data-driven via `items`; the open set is controlled
 * (`value` / `onValueChange`) or uncontrolled (`defaultValue`). For a lone
 * trigger+region, use `Collapsible` instead.
 */
export function Accordion({
  items,
  type = 'single',
  collapsible = true,
  value,
  defaultValue,
  onValueChange,
  variant = 'default',
  size = 'md',
  showArrow = true,
  animationDuration = 200,
  className,
}: AccordionProps) {
  const rootClassName = cn(
    'mrs-accordion',
    `mrs-accordion--${variant}`,
    `mrs-accordion--${size}`,
    className,
  )

  const rootStyle = {
    '--mrs-accordion-duration': `${animationDuration}ms`,
  } as unknown as CSSProperties

  const renderedItems = items.map((item) => (
    <RadixAccordion.Item
      key={item.value}
      value={item.value}
      disabled={item.disabled}
      className="mrs-accordion__item"
    >
      <RadixAccordion.Header className="mrs-accordion__header">
        <RadixAccordion.Trigger className="mrs-accordion__trigger">
          <div className="mrs-accordion__trigger-main">
            {item.actionsStart && (
              <div
                className="mrs-accordion__actions"
                onClick={(e) => e.stopPropagation()}
                onPointerDown={(e) => e.stopPropagation()}
              >
                {item.actionsStart}
              </div>
            )}
            <span className="mrs-accordion__label">{item.trigger}</span>
          </div>
          {(item.actionsEnd || showArrow) && (
            <div className="mrs-accordion__trigger-end">
              {item.actionsEnd && (
                <div
                  className="mrs-accordion__actions"
                  onClick={(e) => e.stopPropagation()}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  {item.actionsEnd}
                </div>
              )}
              {showArrow && (
                <span className="mrs-accordion__chevron" aria-hidden="true">
                  {chevronDown}
                </span>
              )}
            </div>
          )}
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="mrs-accordion__content">
        <div className="mrs-accordion__body">{item.content}</div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  ))

  // Radix discriminates Root props on `type`, so the two modes render as distinct
  // elements. The unified `string | string[]` value/handler narrow cleanly into
  // each branch — a handler taking the wider union is assignable to Radix's
  // per-mode handler, and the value is narrowed by shape.
  if (type === 'multiple') {
    return (
      <RadixAccordion.Root
        type="multiple"
        value={Array.isArray(value) ? value : undefined}
        defaultValue={Array.isArray(defaultValue) ? defaultValue : undefined}
        onValueChange={onValueChange}
        className={rootClassName}
        style={rootStyle}
      >
        {renderedItems}
      </RadixAccordion.Root>
    )
  }

  return (
    <RadixAccordion.Root
      type="single"
      collapsible={collapsible}
      value={typeof value === 'string' ? value : undefined}
      defaultValue={typeof defaultValue === 'string' ? defaultValue : undefined}
      onValueChange={onValueChange}
      className={rootClassName}
      style={rootStyle}
    >
      {renderedItems}
    </RadixAccordion.Root>
  )
}
