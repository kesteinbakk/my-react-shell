import { forwardRef, isValidElement, useId, type HTMLAttributes, type ReactNode } from 'react'
import { cn } from './cn'
import { resolveAccentColor } from './accent'
import type { AccentPlacement } from './accent'
import type { Tone } from './tone'

/** φ — the golden ratio. The dynamic card's shape is `aspect-ratio: φ : 1` (or `φ² : 1` for landscape). */
const PHI = 1.6180339887

export type DynamicGridCardSize = 'sm' | 'md' | 'lg'

/** Proportion of the card: `'standard'` is φ:1; `'landscape'` is the shorter-wider φ²:1. */
export type DynamicGridCardShape = 'standard' | 'landscape'

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
  /** Icon/emoji column rendered beside the title (a figure-split header). */
  figure?: ReactNode
  /** Cursor + hover-lift + `:focus-visible` ring on the card root. */
  hoverable?: boolean
  /**
   * Whether the `hoverable` card lifts (`translateY`) on hover. Defaults to `true`. Set `false`
   * to keep the card interactive — cursor, `onClick`, and a subtle hover elevation — **without**
   * the movement (e.g. when the card carries a `DrawerMark` whose own open-on-hover is the
   * feedback). No effect unless `hoverable` is set.
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
 * Fluid card for the {@link DynamicCardGrid}: it stretches to `width: 100%` of its
 * grid column and inherits the grid's max-width cap, keeping the golden-ratio shape via
 * `aspect-ratio`. Accepts optional named slots (`title`, `subtitle`, `figure`, `footer`)
 * with the primary content passed as `children`.
 *
 * It can act as a **whole-card navigation link** without the shell depending on any router:
 * pass `renderLink` and the card mounts the consumer's `<Link>` as a full-bleed block-link
 * overlay, with `corner` controls raised above it so they stay independently clickable.
 */
export const DynamicGridCard = forwardRef<HTMLDivElement, DynamicGridCardProps>(function DynamicGridCard(
  { size, shape = 'standard', title, subtitle, figure, hoverable, lift = true, watermark, corner, footer, renderLink, tone, color, accentPlacement = 'top', className, style, children, ...props },
  ref,
) {
  const minWidth = size ? DYNAMIC_GRID_CARD_MIN_WIDTH[size] : undefined
  const maxWidth = size ? DYNAMIC_GRID_CARD_MAX_WIDTH[size] : undefined
  const aspectRatio = shape === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`

  // No accent unless tone/color is given.
  const accentColor = resolveAccentColor(tone, color)
  const hasAccent = accentColor != null

  // Auto-wire the overlay anchor's accessible name from the card title.
  const titleId = useId()
  const hasTitle = title != null
  const hasHeader = title != null || subtitle != null || figure != null

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

  return (
    <div
      ref={ref}
      className={cn(
        'mrs-dynamic-grid-card',
        hasAccent && `mrs-dynamic-grid-card--accent-${accentPlacement}`,
        hoverable && 'mrs-dynamic-grid-card--hoverable',
        hoverable && !lift && 'mrs-dynamic-grid-card--no-lift',
        renderLink && 'mrs-dynamic-grid-card--linked',
        hasWatermark && 'mrs-dynamic-grid-card--watermark',
        hasArtWatermark && 'mrs-reveal-host',
        className,
      )}
      style={cssVars}
      data-watermark={watermarkIsString ? watermark : undefined}
      {...props}
    >
      {renderLink
        ? renderLink({
            className: 'mrs-dynamic-grid-card__link-overlay',
            ...(hasTitle ? { 'aria-labelledby': titleId } : {}),
          })
        : null}

      {hasArtWatermark ? (
        <div className="mrs-dynamic-grid-card__watermark" aria-hidden="true">{watermark}</div>
      ) : null}

      {corner != null ? <div className="mrs-dynamic-grid-card__corner">{corner}</div> : null}

      {hasHeader ? (
        <div className="mrs-dynamic-grid-card__header">
          {figure != null ? <div className="mrs-dynamic-grid-card__figure">{figure}</div> : null}
          {title != null || subtitle != null ? (
            <div className="mrs-dynamic-grid-card__heading">
              {title != null ? (
                <div className="mrs-dynamic-grid-card__title" id={hasTitle ? titleId : undefined}>{title}</div>
              ) : null}
              {subtitle != null ? <div className="mrs-dynamic-grid-card__subtitle">{subtitle}</div> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mrs-dynamic-grid-card__body">{children}</div>

      {hasFooter ? (
        <div className="mrs-dynamic-grid-card__footer">
          {structuredFooter ? <StructuredFooter footer={structuredFooter} /> : (footer as ReactNode)}
        </div>
      ) : null}
    </div>
  )
})
