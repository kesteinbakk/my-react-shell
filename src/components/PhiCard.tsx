import type { CSSProperties, ReactNode } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from './cn'

/**
 * φ — the golden ratio. Exported so a consumer can size a layout against the exact
 * constant the card uses (a card's rendered height is `width / PHI`).
 *
 * The card is one scaling unit driven entirely by its width:
 *   Outer:  width : height  = φ : 1
 *   Split:  upperH : lowerH  = φ : 1   (the two sections)
 *
 * The split lives in components.css as an `fr` ratio; the `1.6180339887fr` literal
 * there is this same φ, kept in lockstep with this constant.
 */
export const PHI = 1.6180339887

export type PhiCardSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_WIDTH_PX: Record<PhiCardSize, number> = {
  sm: 180,
  md: 240,
  lg: 320,
  xl: 480,
}

/** One entry in the built-in top-right overflow menu. */
export interface PhiCardAction {
  /** Leading glyph — you bring it (the kit ships no icon registry). Optional. */
  icon?: ReactNode
  /** Row text + accessible name. You translate it (the kit never imports i18n). */
  label: string
  /** Invoked when the item is chosen. */
  onSelect: () => void
  /** Destructive styling (a delete, etc.). */
  destructive?: boolean
  disabled?: boolean
}

export interface PhiCardProps {
  /**
   * Top section. You own its content and inner layout; it's full-bleed (a single
   * cell that stretches your node to fill both axes — a figure/image fills it
   * edge-to-edge). Add your own padding for inset content. Ignored when `image` or
   * `icon` is set — those render the top section instead.
   */
  upper?: ReactNode
  /**
   * Image URL — rendered full-bleed (full width, `object-fit: cover`) as the top
   * section, giving the classic figure-over-content card with `lower` below. Takes
   * precedence over `icon` and `upper`.
   */
  image?: string
  /** Alt text for `image`. Defaults to `''` (treated as decorative). */
  imageAlt?: string
  /**
   * Icon / figure node — rendered centered, full-width, as the top section (used
   * when there's no `image`). Takes precedence over `upper`.
   */
  icon?: ReactNode
  /**
   * Bottom section, same contract as `upper`. When it's empty (absent / `null` /
   * `false`) the section is **not rendered at all** — the top section fills the
   * whole card, and the outer φ:1 ratio is kept so collapsed cards still line up
   * in a grid.
   */
  lower?: ReactNode
  /** Width preset. Height auto-derives as width / φ. Default: `'md'`. */
  size?: PhiCardSize
  /**
   * Actions for the built-in top-right overflow menu — a ⋮ trigger that opens a
   * dropdown of these items. Empty / absent → no trigger is rendered. Ignored when
   * `corner` is set (that replaces the built-in menu).
   */
  actions?: PhiCardAction[]
  /** Override the ⋮ trigger glyph (its own chrome — defaults to a vertical ellipsis). */
  menuIcon?: ReactNode
  /** Accessible name for the menu trigger. Default: `'Actions'`. */
  menuLabel?: string
  /**
   * Bring-your-own top-right node (your own icon buttons, a custom menu, …). Replaces
   * the built-in `actions` menu entirely; rendered only when set.
   */
  corner?: ReactNode
  /** Color for a 3px left accent border. Pass any CSS color string (e.g. a token). */
  leftBorderColor?: string
  /** Click handler for the whole card. The corner area never triggers it. */
  onClick?: () => void
  /** Hover affordance (shadow lift + pointer). Defaults to `true` when `onClick` is set. */
  hoverable?: boolean
  /** Extra classes on the outer card, merged via `cn()`. */
  className?: string
}

// A section counts as empty (→ not rendered) for the common "no content" signals:
// an absent prop (undefined), an explicit null, a `false` from `{cond && <X/>}`, or
// an empty string. Anything else is content.
function isEmpty(node: ReactNode): boolean {
  return node == null || node === false || node === ''
}

const DEFAULT_MENU_GLYPH = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <circle cx="12" cy="5" r="1.75" />
    <circle cx="12" cy="12" r="1.75" />
    <circle cx="12" cy="19" r="1.75" />
  </svg>
)

function PhiCardMenu({
  actions,
  icon,
  label,
}: {
  actions: PhiCardAction[]
  icon: ReactNode
  label: string
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="mrs-phi-card__menu-trigger" aria-label={label}>
          {icon ?? DEFAULT_MENU_GLYPH}
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content className="mrs-phi-card__menu" align="end" sideOffset={4}>
          {actions.map((action) => (
            <DropdownMenu.Item
              key={action.label}
              className={cn(
                'mrs-phi-card__menu-item',
                action.destructive && 'mrs-phi-card__menu-item--danger',
              )}
              disabled={action.disabled}
              onSelect={() => action.onSelect()}
            >
              {action.icon != null ? (
                <span className="mrs-phi-card__menu-icon">{action.icon}</span>
              ) : null}
              <span>{action.label}</span>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}

/**
 * Golden-ratio card with two consumer-owned sections. Width is the only size knob —
 * height (width / φ) and the φ:1 section split derive from it. The bottom section
 * collapses when empty; an optional top-right overflow menu takes consumer-supplied
 * actions. See the components guide for examples.
 */
export function PhiCard({
  upper,
  image,
  imageAlt = '',
  icon,
  lower,
  size = 'md',
  actions,
  menuIcon,
  menuLabel = 'Actions',
  corner,
  leftBorderColor,
  onClick,
  hoverable,
  className,
}: PhiCardProps) {
  const width = SIZE_WIDTH_PX[size]
  const height = width / PHI
  const isHoverable = hoverable ?? !!onClick
  const hasLower = !isEmpty(lower)

  // Top section content: an `image` (full-bleed) or `icon` (centered figure) takes
  // it over for the figure-over-content pattern; otherwise it's the `upper` node.
  const topContent = image ? (
    <img className="mrs-phi-card__image" src={image} alt={imageAlt} />
  ) : !isEmpty(icon) ? (
    <div className="mrs-phi-card__figure">{icon}</div>
  ) : (
    upper
  )

  // `corner` wins over the built-in menu; otherwise the menu shows only when there
  // are actions. Either way the corner overlay renders only when non-empty. The
  // inline `actions &&` (not a derived flag) lets TS narrow `actions` to non-null.
  const cornerNode =
    corner ??
    (actions && actions.length > 0 ? (
      <PhiCardMenu actions={actions} icon={menuIcon} label={menuLabel} />
    ) : null)

  const style: CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    ...(leftBorderColor ? { borderLeft: `3px solid ${leftBorderColor}` } : {}),
  }

  return (
    <div
      className={cn(
        'mrs-phi-card',
        !hasLower && 'mrs-phi-card--single',
        isHoverable && 'mrs-phi-card--hoverable',
        className,
      )}
      style={style}
      onClick={onClick}
    >
      <div className="mrs-phi-card__section">{topContent}</div>
      {hasLower ? <div className="mrs-phi-card__section">{lower}</div> : null}
      {cornerNode != null ? (
        <div className="mrs-phi-card__corner" onClick={(e) => e.stopPropagation()}>
          {cornerNode}
        </div>
      ) : null}
    </div>
  )
}
