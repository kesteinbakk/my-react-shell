import { createContext, forwardRef, isValidElement, useContext, useId, useRef, useState, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { resolveAccentColor } from './accent'
import type { AccentPlacement } from './accent'
import type { Tone } from './tone'
import { isIconConfig, resolveCardIconPlacement, type CardIconPlacement, type CardIconConfig } from './card-icon'

// Declared locally (browser-only lib, no @types/node). `process.env.NODE_ENV` is
// replaced by the consumer's bundler, so the dev guards below are stripped in prod.
declare const process: { env: { NODE_ENV?: string } }

/** φ — the golden ratio. The dynamic card's shape is `aspect-ratio: φ : 1` (or `φ² : 1` for landscape). */
const PHI = 1.6180339887

export type DynamicGridCardSize = 'sm' | 'md' | 'lg'

/**
 * Carries the enclosing `DynamicCardGrid`'s `cardSize` down to each `DynamicGridCard` so it
 * can resolve its own effective size (for the icon/title scale below) without the consumer
 * having to repeat `size` on every card — the grid is still what drives the column width.
 */
export const DynamicCardGridSizeContext = createContext<DynamicGridCardSize | undefined>(undefined)

/** Proportion of the card: `'standard'` is φ:1; `'landscape'` is the shorter-wider φ²:1. */
export type DynamicGridCardShape = 'standard' | 'landscape'

/** Where a `DynamicGridCard` `icon` renders — see {@link CardIconPlacement}. */
export type DynamicGridCardIconPlacement = CardIconPlacement

/** The `{ content, placement }` object form of `icon` — see {@link DynamicGridCardIconPlacement}. */
export type DynamicGridCardIconConfig = CardIconConfig

/** Leading glyph kind for a structured footer meta line. */
export type DynamicGridCardFooterLineType = 'date' | 'time' | 'check'

/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface DynamicGridCardFooterLine {
  text: ReactNode
  type?: DynamicGridCardFooterLineType
}

/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface DynamicGridCardFooter {
  lines?: DynamicGridCardFooterLine[]
  badges?: ReactNode[]
}

/**
 * Props the card hands the consumer's {@link DynamicGridCardProps.renderLink} callback to
 * spread onto its router `<Link>`. The card supplies the overlay `className` and an
 * auto-wired `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface DynamicGridCardLinkProps {
  className: string
  'aria-labelledby'?: string
}

export interface DynamicGridCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  size?: DynamicGridCardSize
  /** Proportion of the card. Default `'standard'` (φ:1); `'landscape'` is φ²:1 (shorter, wider). */
  shape?: DynamicGridCardShape
  title?: ReactNode
  subtitle?: ReactNode
  /**
   * Icon/emoji glyph. A bare `ReactNode` is shorthand for `{ content, placement: 'title' }`
   * (today's behavior: rendered beside the title block). Pass the full
   * `{ content, placement }` form to place it in a corner (never affects layout) or `'center'`
   * (replaces `children`) — see {@link DynamicGridCardIconPlacement}.
   */
  icon?: ReactNode | DynamicGridCardIconConfig
  /**
   * Cursor + hover feedback + `:focus-visible` ring on the card root. Defaults to `true` when
   * `onClick` is set. The default hover feedback is a subtle background tint
   * (`--color-surface-raised`) — see `lift` to additionally move the card.
   */
  hoverable?: boolean
  /**
   * Adds a `translateY` lift + stronger shadow on top of the default hover tint. Defaults to
   * `false` — the tint alone is the hover feedback for most cards; opt into the extra movement
   * for cards where a more pronounced affordance reads better. No effect unless `hoverable`.
   */
  lift?: boolean
  /**
   * Faint background watermark behind the card content, centred horizontally and dropped a
   * little below the card's vertical centre.
   *
   * - A **string** is an emoji/text watermark (e.g. `'🚀'`), drawn oversized via a pseudo-element.
   * - A **`ReactNode`** (e.g. a {@link DrawerMark}) is rendered in a faint art layer; the card
   *   root becomes a `mrs-reveal-host`, so a hover-reveal mark dropped here opens on card hover.
   */
  watermark?: ReactNode
  /**
   * For a **`ReactNode`** watermark only (ignored for a string watermark): scales the node's
   * intrinsic `<svg>` / `<img>` / `<span>` size up to watermark scale, oversized and faint, mirroring
   * the string-emoji watermark — the right behavior for a small icon-kit glyph: a lucide `<svg>`, an
   * emoji drawn as a bundled `<img>` asset, or a native-char span (e.g. `<AppIcon>`).
   *
   * Set `false` for a self-sized illustration (e.g. `DrawerMark`) that already lays itself out
   * at watermark scale and shouldn't be force-scaled. Default `true`.
   */
  autoscaleWatermark?: boolean
  /**
   * Top-corner action slot (e.g. a `DropdownMenu` trigger). Rendered above the link overlay
   * (`z-index`) so it stays independently clickable — a sibling of the anchor, never nested in it.
   */
  corner?: ReactNode
  /**
   * Footer slot: either a freeform node (e.g. a meta row) or a structured
   * `{ lines, badges }` (meta lines on the left, badges stacked on the right).
   */
  footer?: ReactNode | DynamicGridCardFooter
  /**
   * Interactive-root seam. The consumer renders its own router `<Link>` here, spreading the
   * supplied props, and the card mounts it as a **full-bleed block-link overlay** so the whole
   * tile is a real, keyboard-activatable anchor — while the card root stays a `<div>` that owns
   * its hover/border/focus states. The shell imports no router; `to`/`params` type-safety lives
   * at the call site:
   *
   * ```tsx
   * renderLink={(p) => <Link {...p} to="/setup/$id" params={{ id }} />}
   * ```
   */
  renderLink?: (linkProps: DynamicGridCardLinkProps) => ReactNode
  /**
   * Shows the built-in grip handle — vertical stripes pinned to the right edge,
   * vertically centred. Pair with `dragHandleProps` to wire your DND library.
   *
   * Mutually exclusive with `renderLink` (a nav tile isn't drag-reorderable).
   */
  showDragHandle?: boolean
  /**
   * A custom drag handle node, rendered in place of the built-in grip (implies a
   * visible handle, so `showDragHandle` isn't also needed). Wire it with `dragHandleProps`.
   */
  dragHandle?: ReactNode
  /**
   * The event listeners and attributes from your DND library (e.g. `@dnd-kit`),
   * spread onto the drag handle element.
   */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  /**
   * Accessible label for the drag handle. No default — pass a translated string (or supply
   * `aria-label` via `dragHandleProps`); absent → no label (the grip glyph stands alone).
   */
  dragHandleLabel?: string
  /**
   * Switches the root cursor to grab/grabbing and spreads `dragHandleProps` onto the card root
   * (suppressing the default visual drag handle).
   */
  dragWholeCard?: boolean
  /**
   * Semantic tone — drives an optional accent stripe. Default **none** (no accent).
   * Ignored when `color` is set. Same accent vocabulary as `StatCard`/`PaperCard`.
   */
  tone?: Tone
  /** Raw CSS color string for the accent stripe; overrides `tone`. */
  color?: string
  /** Where the accent reads when `tone`/`color` is set: a `'top'` stripe (default) or a `'left'` bar. */
  accentPlacement?: AccentPlacement
}

export const DYNAMIC_GRID_CARD_MIN_WIDTH: Record<DynamicGridCardSize, number> = {
  sm: 180,
  md: 240,
  lg: 400,
}

export const DYNAMIC_GRID_CARD_MAX_WIDTH: Record<DynamicGridCardSize, number> = {
  sm: 210,
  md: 320,
  lg: 500,
}

/** Default grip glyph — vertical stripes, for the right-edge centred drag handle. */
const DEFAULT_DRAG_HANDLE = (
  <svg width="15" height="36" viewBox="0 0 15 36" fill="currentColor" aria-hidden="true" opacity="0.4">
    <rect x="1" y="0" width="4" height="36" rx="2" />
    <rect x="10" y="0" width="4" height="36" rx="2" />
  </svg>
)

// ── Footer glyphs ───────────────────────────────────────────────────────────

const FOOTER_GLYPHS: Record<DynamicGridCardFooterLineType, ReactNode> = {
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

/**
 * Discriminate the structured `{ lines, badges }` footer from a freeform `ReactNode`.
 * A structured footer is a plain object carrying `lines`/`badges`; a React element, array,
 * or primitive is freeform.
 */
function isStructuredFooter(footer: ReactNode | DynamicGridCardFooter): footer is DynamicGridCardFooter {
  return (
    typeof footer === 'object' &&
    footer !== null &&
    !isValidElement(footer) &&
    !Array.isArray(footer) &&
    ('lines' in footer || 'badges' in footer)
  )
}

function StructuredFooter({ footer }: { footer: DynamicGridCardFooter }) {
  const lines = footer.lines ?? []
  const badges = footer.badges ?? []
  const rowCount = Math.max(lines.length, badges.length)
  return (
    <div className="mrs-phi-card__footer">
      {Array.from({ length: rowCount }, (_, i) => {
        const line = lines[i]
        const badgeRow = badges[i]
        return (
          <div key={i} className="mrs-phi-card__footer-row">
            <span className="mrs-phi-card__footer-line">
              {line?.type ? (
                <span className="mrs-phi-card__footer-icon">{FOOTER_GLYPHS[line.type]}</span>
              ) : null}
              {line ? <span className="mrs-phi-card__footer-text">{line.text}</span> : null}
            </span>
            {badgeRow != null ? <span className="mrs-phi-card__footer-badge">{badgeRow}</span> : null}
          </div>
        )
      })}
    </div>
  )
}

/**
 * `sm`-size title auto-fit: a long string title steps the font size down (3 steps) so it
 * doesn't blow out the card's reserved heading height. Returns `0` (no reduction) through
 * `3` (smallest); a non-string title (e.g. a `ReactNode`) always gets `0` since there's no
 * length to measure. Thresholds tuned for the `sm` column's ~180–210px width.
 */
function titleFitStep(title: ReactNode): 0 | 1 | 2 | 3 {
  if (typeof title !== 'string') return 0
  const n = title.length
  if (n > 34) return 3
  if (n > 24) return 2
  if (n > 14) return 1
  return 0
}

/**
 * Fluid card for the {@link DynamicCardGrid}: it stretches to `width: 100%` of its
 * grid column and inherits the grid's max-width cap, keeping the golden-ratio shape via
 * `aspect-ratio`. Accepts optional named slots (`title`, `subtitle`, `icon`, `footer`)
 * with the primary content passed as `children`.
 *
 * It can act as a **whole-card navigation link** without the shell depending on any router:
 * pass `renderLink` and the card mounts the consumer's `<Link>` as a full-bleed block-link
 * overlay, with `corner` controls raised above it so they stay independently clickable.
 */
export const DynamicGridCard = forwardRef<HTMLDivElement, DynamicGridCardProps>(function DynamicGridCard(
  { size, shape = 'standard', title, subtitle, icon, hoverable, lift = false, watermark, autoscaleWatermark = true, corner, footer, renderLink, showDragHandle, dragHandle, dragHandleProps, dragHandleLabel, dragWholeCard, tone, color, accentPlacement = 'top', className, style, children, ...props },
  ref,
) {

  // A visible grip shows when toggled on, or when a custom handle node is supplied.
  const hasDragHandle = showDragHandle || dragHandle != null

  // Mirrors StatCard/ContentCard: a card with an `onClick` is hoverable by default — without
  // this, a clickable `dragWholeCard` card never gets `--hoverable`, so the drag-whole cursor
  // rules (keyed off that class) read it as drag-only and show `grab` instead of `pointer`.
  const isHoverable = hoverable ?? !!props.onClick

  const [isHolding, setIsHolding] = useState(false)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function startHold() {
    holdTimerRef.current = setTimeout(() => setIsHolding(true), 200)
  }
  function clearHold() {
    if (holdTimerRef.current) { clearTimeout(holdTimerRef.current); holdTimerRef.current = null }
    setIsHolding(false)
  }

  // The card's own `size` wins; absent that, fall back to the enclosing grid's `cardSize`
  // (provided via context) so the icon/title scale below resolves without the consumer
  // having to repeat `size` on every card.
  const gridSize = useContext(DynamicCardGridSizeContext)
  const effectiveSize = size ?? gridSize

  const minWidth = size ? DYNAMIC_GRID_CARD_MIN_WIDTH[size] : undefined
  const maxWidth = size ? DYNAMIC_GRID_CARD_MAX_WIDTH[size] : undefined
  const aspectRatio = shape === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`

  // No accent unless tone/color is given.
  const accentColor = resolveAccentColor(tone, color)
  const hasAccent = accentColor != null

  // Resolve the `icon` shorthand to its full `{ content, placement }` form.
  const hasIcon = icon != null
  const iconContent = hasIcon ? (isIconConfig(icon) ? icon.content : icon) : null
  const requestedIconPlacement: DynamicGridCardIconPlacement = hasIcon && isIconConfig(icon) ? (icon.placement ?? 'title') : 'title'
  const iconPlacement = resolveCardIconPlacement(requestedIconPlacement, title != null || subtitle != null)
  const isTitleIcon = hasIcon && iconPlacement === 'title'
  const isCornerIcon = hasIcon && (iconPlacement === 'upperLeft' || iconPlacement === 'upperRight' || iconPlacement === 'lowerLeft' || iconPlacement === 'lowerRight')
  const isCenterIcon = hasIcon && iconPlacement === 'center'

  // Auto-wire the overlay anchor's accessible name from the card title.
  const titleId = useId()
  const hasTitle = title != null
  const hasHeader = title != null || subtitle != null || isTitleIcon

  // A string watermark uses the emoji `::after` path; any other node renders in an art layer.
  const watermarkIsString = typeof watermark === 'string'
  const hasWatermark = watermarkIsString ? watermark.length > 0 : watermark != null
  const hasArtWatermark = hasWatermark && !watermarkIsString

  const structuredFooter = isStructuredFooter(footer) ? footer : null
  const hasFooter = structuredFooter
    ? (structuredFooter.lines?.length ?? 0) > 0 || (structuredFooter.badges?.length ?? 0) > 0
    : footer != null

  const cssVars = {
    '--mrs-dynamic-grid-card-aspect-ratio': aspectRatio,
    ...(minWidth != null ? { '--mrs-dynamic-grid-card-min-width': `${minWidth}px` } : {}),
    ...(maxWidth != null ? { '--mrs-dynamic-grid-card-max-width': `${maxWidth}px` } : {}),
    ...(hasAccent ? { '--mrs-stat-accent': accentColor } : {}),
    ...style,
  } as React.CSSProperties

  // Dev guards
  if (process.env.NODE_ENV !== 'production') {
    if (iconPlacement === 'upperRight' && corner != null) {
      throw new Error(
        "DynamicGridCard: icon placement 'upperRight' collides with the `corner` slot — both render in the top-right corner. Use a different icon placement (e.g. 'upperLeft') or drop `corner`.",
      )
    }
    if (isCenterIcon && children != null) {
      throw new Error(
        "DynamicGridCard: icon placement 'center' replaces the card body — it can't combine with `children`. Drop one of the two.",
      )
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        'mrs-dynamic-grid-card',
        effectiveSize && `mrs-dynamic-grid-card--${effectiveSize}`,
        hasAccent && `mrs-dynamic-grid-card--accent-${accentPlacement}`,
        isHoverable && 'mrs-dynamic-grid-card--hoverable',
        isHoverable && lift && 'mrs-dynamic-grid-card--lift',
        renderLink && 'mrs-dynamic-grid-card--linked',
        hasDragHandle && 'mrs-dynamic-grid-card--draggable',
        hasWatermark && 'mrs-dynamic-grid-card--watermark',
        hasArtWatermark && 'mrs-reveal-host',
        dragWholeCard && 'mrs-dynamic-grid-card--drag-whole',
        dragWholeCard && isHolding && 'mrs-dynamic-grid-card--holding',
        className,
      )}
      style={cssVars}
      data-watermark={watermarkIsString ? watermark : undefined}
      {...props}
      {...(dragWholeCard ? {
        ...(dragHandleProps as any),
        onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
          startHold()
          ;(dragHandleProps as any)?.onPointerDown?.(e)
        },
        onPointerUp: (e: React.PointerEvent<HTMLDivElement>) => {
          clearHold()
          ;(dragHandleProps as any)?.onPointerUp?.(e)
        },
        onPointerLeave: (e: React.PointerEvent<HTMLDivElement>) => {
          clearHold()
          ;(dragHandleProps as any)?.onPointerLeave?.(e)
        },
      } : {})}
    >
      {renderLink
        ? renderLink({
            className: 'mrs-dynamic-grid-card__link-overlay',
            ...(hasTitle ? { 'aria-labelledby': titleId } : {}),
          })
        : null}

      {hasArtWatermark ? (
        <div
          className={cn(
            'mrs-dynamic-grid-card__watermark',
            autoscaleWatermark && 'mrs-dynamic-grid-card__watermark--glyph',
          )}
          aria-hidden="true"
        >
          {watermark}
        </div>
      ) : null}

      {hasDragHandle ? (
        <button
          type="button"
          className="mrs-dynamic-grid-card__drag-handle"
          aria-label={dragHandleLabel}
          {...dragHandleProps}
          onClick={(e) => {
            e.stopPropagation()
            dragHandleProps?.onClick?.(e as React.MouseEvent<HTMLButtonElement>)
          }}
        >
          {dragHandle ?? DEFAULT_DRAG_HANDLE}
        </button>
      ) : null}

      {corner != null ? <div className="mrs-dynamic-grid-card__corner">{corner}</div> : null}

      {isCornerIcon ? (
        <div className={cn('mrs-dynamic-grid-card__icon', `mrs-dynamic-grid-card__icon--${iconPlacement}`)}>
          {iconContent}
        </div>
      ) : null}

      {hasHeader ? (
        <div className="mrs-dynamic-grid-card__header">
          {isTitleIcon ? <div className="mrs-dynamic-grid-card__icon">{iconContent}</div> : null}
          {title != null || subtitle != null ? (
            <div className="mrs-dynamic-grid-card__heading">
              {title != null ? (
                <div
                  className="mrs-dynamic-grid-card__title"
                  id={hasTitle ? titleId : undefined}
                  data-fit={titleFitStep(title) || undefined}
                >
                  {title}
                </div>
              ) : null}
              {subtitle != null ? <div className="mrs-dynamic-grid-card__subtitle">{subtitle}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className={cn('mrs-dynamic-grid-card__body', isCenterIcon && 'mrs-dynamic-grid-card__body--icon-center')}>
        {isCenterIcon ? iconContent : children}
      </div>

      {hasFooter ? (
        <div className="mrs-dynamic-grid-card__footer">
          {structuredFooter ? <StructuredFooter footer={structuredFooter} /> : (footer as ReactNode)}
        </div>
      ) : null}
    </div>
  )
})
