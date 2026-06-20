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

// Base font-size (rem) per size — set on the card root so section content inherits
// it: a larger card gets larger text by default. The consumer overrides per element
// (e.g. `em`-relative or an explicit class) as needed.
const SIZE_FONT_REM: Record<PhiCardSize, number> = {
  sm: 0.75,
  md: 0.875,
  lg: 1.125,
  xl: 1.375,
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
   * Top-section heading — typically a title + subtitle. The **card pads it** (don't
   * add your own padding); it's top-aligned, with `content` (if any) stacked below.
   * For a full-bleed figure use `image` / `icon` instead. Ignored when `image` is set;
   * with `icon` also present it's the content column of a 1 : φ top split.
   */
  upper?: ReactNode
  /**
   * Main content for the top section, rendered **below** `upper` (the title/subtitle)
   * and card-padded along with it. The classic card title → subtitle → body stack.
   */
  content?: ReactNode
  /**
   * Image URL — rendered full-bleed (full width, `object-fit: cover`) as the top
   * section, giving the classic figure-over-content card with `lower` below. Takes
   * precedence over `icon` and `upper`.
   */
  image?: string
  /** Alt text for `image`. Defaults to `''` (treated as decorative). */
  imageAlt?: string
  /**
   * Icon / figure node for the top section (below `image` in precedence). Alone it's
   * centered. With `upper`/`content` present the top splits 1 : φ — a narrow icon
   * column (left) and the body column (right): the original logo-and-title layout.
   * Pair with `iconFill` to scale it to fill the column.
   */
  icon?: ReactNode
  /**
   * Scale `icon` to **fill** its area (full-width figure, aspect preserved) instead
   * of rendering at its intrinsic size — overrides the icon node's own width/height.
   */
  iconFill?: boolean
  /**
   * Bottom section (a footer) — **card-padded**. When empty (absent / `null` /
   * `false`) it's **not rendered at all** and the **card shrinks to the top band's
   * height** (`width / φ²`) — shorter by exactly the bottom split, not a full-height
   * card with the top content centered.
   */
  lower?: ReactNode
  /**
   * Size preset — sets the width (height = width / φ) **and** a base `font-size` the
   * section content inherits, so larger cards get larger text by default (override
   * per element as needed). `sm`/`md`/`lg`/`xl` = 180/240/320/480px. Default: `'md'`.
   */
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
 * Golden-ratio card. Width is the only size knob; height (= width / φ), the φ:1 split,
 * and a base font-size derive from it. The card pads its text content (`upper` title/
 * subtitle + `content`, and the `lower` footer); figures (`image` / `icon`) are
 * full-bleed. The bottom collapses (card shortens) when `lower` is empty. Optional
 * top-right overflow menu.
 */
export function PhiCard({
  upper,
  content,
  image,
  imageAlt = '',
  icon,
  iconFill = false,
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
  const hasLower = !isEmpty(lower)
  // No bottom section → the card collapses to the top band's height (W/φ²) — shorter
  // by exactly the bottom split — NOT a full-height φ:1 box with the top content
  // centered in the leftover space. (Full card H = W/φ; the φ:1 split makes the top
  // band W/φ², so a collapsed card ends right where the split was.)
  const height = hasLower ? width / PHI : width / (PHI * PHI)
  const isHoverable = hoverable ?? !!onClick

  const hasIcon = !isEmpty(icon)
  const hasContent = !isEmpty(content)
  const hasBody = !isEmpty(upper) || hasContent

  // The card-padded text body: the title/subtitle (`upper`) with `content` stacked
  // below it. Centered by default (logo-and-title); top-aligned when there's content.
  const body = hasBody ? (
    <div className={cn('mrs-phi-card__body', hasContent && 'mrs-phi-card__body--top')}>
      {upper}
      {content}
    </div>
  ) : null

  const figure = (
    <div className={cn('mrs-phi-card__figure', iconFill && 'mrs-phi-card__figure--fill')}>
      {icon}
    </div>
  )

  // Top section. `image` is the only full-bleed (edge-to-edge) case; a figure, the
  // body, or the figure+body split all sit in card padding so a figure's top lines up
  // with the title. The figure+body split is the original 1:φ logo-and-title layout.
  let topContent: ReactNode
  let topPadded = false
  if (image) {
    topContent = <img className="mrs-phi-card__image" src={image} alt={imageAlt} />
  } else if (hasIcon && hasBody) {
    topContent = (
      <div className="mrs-phi-card__split">
        {figure}
        {body}
      </div>
    )
    topPadded = true
  } else if (hasIcon) {
    topContent = figure
    topPadded = true
  } else {
    topContent = body
    topPadded = hasBody
  }

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
    fontSize: `${SIZE_FONT_REM[size]}rem`,
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
      <div className={cn('mrs-phi-card__section', topPadded && 'mrs-phi-card__section--padded')}>
        {topContent}
      </div>
      {hasLower ? (
        <div className="mrs-phi-card__section mrs-phi-card__section--padded">{lower}</div>
      ) : null}
      {cornerNode != null ? (
        <div className="mrs-phi-card__corner" onClick={(e) => e.stopPropagation()}>
          {cornerNode}
        </div>
      ) : null}
    </div>
  )
}
