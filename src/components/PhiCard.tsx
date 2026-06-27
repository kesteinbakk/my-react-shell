import { forwardRef, type CSSProperties, type ReactNode } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { cn } from './cn'
import { resolveAccentColor } from './accent'
import type { AccentPlacement } from './accent'
import type { Tone } from './tone'

// Declared locally (browser-only lib, no @types/node). `process.env.NODE_ENV` is
// replaced by the consumer's bundler, so the dev guards below are stripped in prod.
declare const process: { env: { NODE_ENV?: string } }

/**
 * φ — the golden ratio. Exported so a consumer can size a layout against the exact
 * constant the card uses (a card's rendered height is `width / PHI`).
 */
export const PHI = 1.6180339887

export type PhiCardSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_WIDTH_PX: Record<PhiCardSize, number> = {
  sm: 180,
  md: 240,
  lg: 320,
  xl: 480,
}

// Base font-size (rem) per size — set on the card root so section content inherits it.
const SIZE_FONT_REM: Record<PhiCardSize, number> = {
  sm: 0.75,
  md: 0.875,
  lg: 1.125,
  xl: 1.375,
}

// Footer caps per size — exceeding either is misuse and throws in dev (fail loud).
const FOOTER_LINE_CAP: Record<PhiCardSize, number> = { sm: 1, md: 2, lg: 3, xl: 5 }
const FOOTER_BADGE_CAP: Record<PhiCardSize, number> = { sm: 1, md: 1, lg: 2, xl: 4 }

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

/** Leading glyph for a footer line — the kit ships these (no icon registry needed). */
export type PhiCardFooterLineType = 'date' | 'time' | 'check'

/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface PhiCardFooterLine {
  text: ReactNode
  type?: PhiCardFooterLineType
}

/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface PhiCardFooter {
  /** Left column, evenly spread vertically. Cap by size: sm 1 · md 2 · lg 3 · xl 5. */
  lines?: PhiCardFooterLine[]
  /** Right column, stacked + evenly spread. Cap by size: sm/md 1 · lg 2 · xl 4. */
  badges?: ReactNode[]
}

const FOOTER_GLYPHS: Record<PhiCardFooterLineType, ReactNode> = {
  date: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  time: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
}

export interface PhiCardProps {
  /**
   * Top-section heading — typically a title + subtitle. The card pads it (no padding
   * of your own); it's vertically centered and flush-left at the split (or the edge
   * padding when there's no figure). With `image`/`icon` present it's the wide content
   * column of the 1 : φ top split.
   */
  upper?: ReactNode
  /** Main content, stacked under `upper` in the same centered, flush-left text body. */
  content?: ReactNode
  /** Image URL — rendered full-bleed (`object-fit: cover`) as the top section. */
  image?: string
  /** Alt text for `image`. Defaults to `''` (decorative). */
  imageAlt?: string
  /**
   * Icon / figure node for the top section. Alone it's centered; with `upper`/`content`
   * the top splits 1 : φ — a narrow figure column (centered so the border→figure gap
   * equals the figure→content gap) and the content column. Pair with `iconFill` to fill.
   */
  icon?: ReactNode
  /**
   * Scale `icon` to **fill** its column (aspect preserved, a small inset, never
   * overflows), overriding the icon node's own width/height.
   */
  iconFill?: boolean
  /**
   * Freeform bottom section (a footer) — the bring-your-own escape hatch. Use `footer`
   * for the structured meta-lines + badges layout. **Throws if both are given.** When
   * neither is present the card **collapses** to the top band's height (`width / φ²`).
   */
  lower?: ReactNode
  /**
   * Structured footer: `lines` (left, with optional `date`/`time`/`check` glyphs) and
   * `badges` (right, stacked) — both evenly spread vertically. Per-size caps throw in
   * dev (lines: sm 1·md 2·lg 3·xl 5 · badges: sm/md 1·lg 2·xl 4).
   */
  footer?: PhiCardFooter
  /** Draw the inset divider line between the top and footer sections. Default `false`. */
  divider?: boolean
  /** Size preset — sets the width (height = width / φ) and a base inherited font-size. */
  size?: PhiCardSize
  /** Actions for the built-in top-right ⋮ overflow menu. Ignored when `corner` is set. */
  actions?: PhiCardAction[]
  /** Override the ⋮ trigger glyph. */
  menuIcon?: ReactNode
  /** Accessible name for the menu trigger. Default: `'Actions'`. */
  menuLabel?: string
  /** Bring-your-own top-right node; replaces the built-in `actions` menu. */
  corner?: ReactNode
  /**
   * Semantic accent hue, shown as a stripe (see `accentPlacement`). Opt-in — no
   * accent when unset. One of `primary`·`info`·`success`·`warning`·`danger`·`neutral`.
   * `color` overrides it.
   */
  tone?: Tone
  /** Raw CSS color for the accent stripe; overrides `tone`. E.g. `'#7c3aed'`. */
  color?: string
  /** Where the accent reads: a `'top'` stripe (default) or a `'left'` bar. */
  accentPlacement?: AccentPlacement
  /** Click handler for the whole card. The corner area never triggers it. */
  onClick?: () => void
  /** Hover affordance. Defaults to `true` when `onClick` is set. */
  hoverable?: boolean
  /** Extra classes on the outer card, merged via `cn()`. */
  className?: string
  /**
   * Enables the drag handler. If `true`, renders a built-in top-center grip handle.
   * If a `ReactNode`, renders your custom handle.
   */
  dragHandle?: boolean | ReactNode
  /**
   * The event listeners and attributes from your DND library (e.g. `@dnd-kit`),
   * spread onto the drag handle element.
   */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  /** Optional style override. */
  style?: CSSProperties
}

// A section counts as empty (→ not rendered) for the common "no content" signals.
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

const DEFAULT_DRAG_HANDLE = (
  <svg width="64" height="12" viewBox="0 0 64 12" fill="currentColor" aria-hidden="true" opacity="0.4">
    <rect x="0" y="1" width="64" height="3" rx="1.5" />
    <rect x="0" y="8" width="64" height="3" rx="1.5" />
  </svg>
)

/**
 * Golden-ratio card. Width is the only size knob; height (= width / φ), the φ:1 split,
 * and a base font-size derive from it. The card owns its padding: a figure (`icon` /
 * `image`) fills its column, the text body is centered and flush-left at the split, and
 * the footer (`footer` structured, or `lower` freeform) spreads its rows evenly. The
 * bottom collapses (card shortens) when there's no footer.
 */
export const PhiCard = forwardRef<HTMLDivElement, PhiCardProps>(function PhiCard(
  {
    upper,
    content,
    image,
    imageAlt = '',
    icon,
    iconFill = false,
    lower,
    footer,
    divider = false,
    size = 'md',
    actions,
    menuIcon,
    menuLabel = 'Actions',
    corner,
    tone,
    color,
    accentPlacement = 'top',
    onClick,
    hoverable,
    dragHandle,
    dragHandleProps,
    className,
    style: styleProp,
  },
  ref,
) {
  const accent = resolveAccentColor(tone, color)
  const width = SIZE_WIDTH_PX[size]
  const hasIcon = !isEmpty(icon)
  const hasBody = !isEmpty(upper) || !isEmpty(content)
  const hasLowerContent = !isEmpty(lower)
  const lineCount = footer?.lines?.length ?? 0
  const badgeCount = footer?.badges?.length ?? 0
  const hasFooter = !!footer && (lineCount > 0 || badgeCount > 0)

  // Dev guards — fail loud on misuse (stripped from production builds).
  if (process.env.NODE_ENV !== 'production') {
    if (footer && hasLowerContent) {
      throw new Error('PhiCard: provide either `footer` or `lower`, not both.')
    }
    if (lineCount > FOOTER_LINE_CAP[size]) {
      throw new Error(`PhiCard: size="${size}" allows ${FOOTER_LINE_CAP[size]} footer line(s), got ${lineCount}.`)
    }
    if (badgeCount > FOOTER_BADGE_CAP[size]) {
      throw new Error(`PhiCard: size="${size}" allows ${FOOTER_BADGE_CAP[size]} footer badge(s), got ${badgeCount}.`)
    }
  }

  const hasBottom = hasFooter || hasLowerContent
  // No bottom section → collapse to the top band's height (W/φ²), shorter by exactly
  // the bottom split rather than a full-height φ:1 box.
  const height = hasBottom ? width / PHI : width / (PHI * PHI)
  const isHoverable = hoverable ?? !!onClick

  // The card-padded text body: title/subtitle (`upper`) + `content`, vertically
  // centered, flush-left.
  const body = hasBody ? (
    <div className="mrs-phi-card__body">
      {upper}
      {content}
    </div>
  ) : null

  const figure = (
    <div className={cn('mrs-phi-card__figure', iconFill && 'mrs-phi-card__figure--fill')}>
      {icon}
    </div>
  )

  // Top section. `image` is full-bleed; a figure+body splits 1 : φ (the figure column
  // runs to the card edge so it centers with equal border/content gaps); a lone figure
  // or a lone body sits in the edge padding.
  let topContent: ReactNode
  let topSectionMod: string | undefined
  if (image) {
    topContent = <img className="mrs-phi-card__image" src={image} alt={imageAlt} />
    topSectionMod = undefined
  } else if (hasIcon && hasBody) {
    topContent = (
      <div className="mrs-phi-card__split">
        {figure}
        {body}
      </div>
    )
    topSectionMod = 'mrs-phi-card__section--split'
  } else if (hasIcon) {
    topContent = figure
    topSectionMod = 'mrs-phi-card__section--padded mrs-phi-card__section--lone-figure'
  } else {
    topContent = body
    topSectionMod = hasBody ? 'mrs-phi-card__section--padded' : undefined
  }

  // Footer = evenly-spread rows, each pairing the line at index `i` (left) with the
  // badge at index `i` (right) — so an equal-count footer aligns line-to-badge by row,
  // and the badge spacing is just the row spacing.
  let footerNode: ReactNode = null
  if (footer && hasFooter) {
    const lines = footer.lines ?? []
    const badges = footer.badges ?? []
    const rowCount = Math.max(lines.length, badges.length)
    footerNode = (
      <div className="mrs-phi-card__footer">
        {Array.from({ length: rowCount }, (_, i) => {
          const line = lines[i]
          const badge = badges[i]
          return (
            <div key={i} className="mrs-phi-card__footer-row">
              <span className="mrs-phi-card__footer-line">
                {line?.type ? (
                  <span className="mrs-phi-card__footer-icon">{FOOTER_GLYPHS[line.type]}</span>
                ) : null}
                {line ? <span className="mrs-phi-card__footer-text">{line.text}</span> : null}
              </span>
              {badge != null ? (
                <span className="mrs-phi-card__footer-badge">{badge}</span>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }

  // `corner` wins over the built-in menu; the inline `actions &&` lets TS narrow.
  const cornerNode =
    corner ??
    (actions && actions.length > 0 ? (
      <PhiCardMenu actions={actions} icon={menuIcon} label={menuLabel} />
    ) : null)

  const style = {
    ...styleProp,
    width: `${width}px`,
    height: `${height}px`,
    fontSize: `${SIZE_FONT_REM[size]}rem`,
    ...(accent != null ? { '--mrs-phi-accent': accent } : {}),
  } as unknown as CSSProperties

  return (
    <div
      ref={ref}
      className={cn(
        'mrs-phi-card',
        !hasBottom && 'mrs-phi-card--single',
        isHoverable && 'mrs-phi-card--hoverable',
        accent != null && 'mrs-phi-card--accent',
        accent != null && `mrs-phi-card--accent-${accentPlacement}`,
        className,
      )}
      style={style}
      onClick={onClick}
    >
      {dragHandle ? (
        <button
          type="button"
          className="mrs-phi-card__drag-handle"
          aria-label="Drag to reorder"
          {...dragHandleProps}
          onClick={(e) => {
            e.stopPropagation()
            dragHandleProps?.onClick?.(e as any)
          }}
        >
          {dragHandle === true ? DEFAULT_DRAG_HANDLE : dragHandle}
        </button>
      ) : null}
      <div className={cn('mrs-phi-card__section', topSectionMod)}>{topContent}</div>
      {hasBottom ? (
        <div
          className={cn(
            'mrs-phi-card__section',
            'mrs-phi-card__section--lower',
            divider && 'mrs-phi-card__section--divider',
          )}
        >
          {hasFooter ? footerNode : lower}
        </div>
      ) : null}
      {cornerNode != null ? (
        <div className="mrs-phi-card__corner" onClick={(e) => e.stopPropagation()}>
          {cornerNode}
        </div>
      ) : null}
    </div>
  )
})
