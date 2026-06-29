import { forwardRef, isValidElement, useId, type CSSProperties, type ReactNode } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { cn } from './cn'
import { resolveAccentColor } from './accent'
import type { AccentPlacement } from './accent'
import { TONE_COLOR } from './tone'
import type { Tone } from './tone'
declare const process: { env: { NODE_ENV?: string } }

/**
 * Size preset — a fixed-width golden-ratio card (`height = width / φ`). `md` (≈312px,
 * four to a `wide` 1440px row) is the default. Self-contained — no longer derived from `PhiCard`.
 */
export type ContentCardSize = 'sm' | 'md' | 'lg' | 'xl'

/** Leading glyph kind for a footer meta line. */
export type ContentCardFooterLineType = 'date' | 'time' | 'check'

/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface ContentCardFooterLine {
  text: ReactNode
  type?: ContentCardFooterLineType
}

/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface ContentCardFooter {
  lines?: ContentCardFooterLine[]
  badges?: ReactNode[]
}

/** Proportion of the card: `'standard'` is φ:1 (`height = width / φ`); `'landscape'` is the shorter-wider φ²:1 (`height = width / φ²`). */
export type ContentCardShape = 'standard' | 'landscape'

/**
 * Props the card hands the consumer's {@link ContentCardProps.renderLink} callback to spread onto
 * its router `<Link>`. The card supplies the overlay `className` and an auto-wired
 * `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface ContentCardLinkProps {
  className: string
  'aria-labelledby'?: string
}

/**
 * Discriminate the structured `{ lines, badges }` footer from a freeform `ReactNode`.
 * A React element, array, or primitive is freeform; a plain object carrying `lines`/`badges`
 * is structured.
 */
function isStructuredFooter(footer: ReactNode | ContentCardFooter): footer is ContentCardFooter {
  return (
    typeof footer === 'object' &&
    footer !== null &&
    !isValidElement(footer) &&
    !Array.isArray(footer) &&
    ('lines' in footer || 'badges' in footer)
  )
}

const SIZE_WIDTH_PX: Record<ContentCardSize, number> = {
  sm: 240,
  md: 312,
  lg: 400,
  xl: 520,
}

const DEFAULT_DRAG_HANDLE = (
  <svg width="11" height="28" viewBox="0 0 11 28" fill="currentColor" aria-hidden="true" opacity="0.4">
    <rect x="1" y="0" width="3" height="28" rx="1.5" />
    <rect x="7" y="0" width="3" height="28" rx="1.5" />
  </svg>
)

const SIZE_FONT_REM: Record<ContentCardSize, number> = {
  sm: 1.0,
  md: 1.1375,
  lg: 1.40625,
  xl: 1.48958,
}

const PHI = 1.6180339887

export type ContentCardTone = Tone
export type ContentCardVariant = 'warning' | 'danger'

export interface ContentCardBaseProps {
  title: string
  subtitle?: string
  
  contentAlignX?: 'left' | 'center' | 'right'
  contentAlignY?: 'top' | 'center' | 'bottom'

  value?: number
  maxValue?: number

  maxLines?: number

  tone?: ContentCardTone
  color?: string
  accentPlacement?: AccentPlacement
  
  topStripeFollowsGauge?: boolean
  variant?: ContentCardVariant

  /**
   * Footer slot: either a freeform `ReactNode` or a structured `{ lines, badges }`
   * (meta lines on the left, badges on the right).
   */
  footer?: ReactNode | ContentCardFooter

  /**
   * Faint background watermark behind the card content, centred horizontally and dropped a
   * little below the card's vertical centre.
   *
   * - A **string** is an emoji/text watermark (e.g. `'🏆'`), drawn oversized via a pseudo-element.
   * - A **`ReactNode`** (e.g. a `DrawerMark`) is rendered in a faint art layer; the card
   *   root becomes a `mrs-reveal-host`, so a hover-reveal mark dropped here opens on card hover.
   *
   * Ignored when `variant` is set — the variant always shows `⚠️`.
   */
  watermark?: ReactNode
  size?: ContentCardSize
  /**
   * Proportion of the card. Default `'standard'` (`height = width / φ`); `'landscape'` is the
   * shorter-wider `height = width / φ²` — for light cards (no footer, small content) where the
   * standard height reads too tall.
   */
  shape?: ContentCardShape
  onClick?: () => void
  hoverable?: boolean

  dragHandle?: boolean | ReactNode
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  /**
   * Accessible label for the drag handle. No default — pass a translated string (or supply
   * `aria-label` via `dragHandleProps`); absent → no label (the grip glyph stands alone).
   */
  dragHandleLabel?: string
  /**
   * Interactive-root seam. The consumer renders its own router `<Link>` here, spreading the
   * supplied props, and the card mounts it as a **full-bleed block-link overlay** so the whole
   * tile is a real, keyboard-activatable anchor — while the card root stays a `<div>` that owns
   * its hover/border/focus states. The shell imports no router; `to`/`params` type-safety lives
   * at the call site:
   *
   * ```tsx
   * renderLink={(p) => <Link {...p} to="/doc/$id" params={{ id }} />}
   * ```
   *
   * Mutually exclusive with `dragHandle` — throws in dev.
   */
  renderLink?: (linkProps: ContentCardLinkProps) => ReactNode
  className?: string
  style?: CSSProperties
}

export type ContentCardProps =
  | (ContentCardBaseProps & {
      content: string
      html?: boolean
      children?: never
    })
  | (ContentCardBaseProps & {
      content?: never
      html?: never
      children: ReactNode
    })

const FOOTER_GLYPHS: Record<NonNullable<ContentCardFooterLine['type']>, ReactNode> = {
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
 * Steps a long title's font size down (up to five steps) so it stays within ~two lines
 * without changing the card geometry; the deeper steps let a much longer title fit before
 * it ellipsizes. Shared ladder with `StatCard`/`PaperCard`. Returns `0` (no reduction) → `5`.
 */
function titleFitStep(title: string): -2 | -1 | 0 | 1 | 2 | 3 | 4 | 5 {
  const n = title.length
  if (n > 116) return 5
  if (n > 90) return 4
  if (n > 68) return 3
  if (n > 48) return 2
  if (n > 32) return 1
  if (n > 22) return 0
  if (n > 12) return -1
  return -2
}

function completenessFill(fraction: number): string {
  if (fraction < 0.33) return 'var(--color-danger)'
  if (fraction < 0.66) return 'var(--color-warning)'
  return 'var(--color-success)'
}

export const ContentCard = forwardRef<HTMLDivElement, ContentCardProps>(function ContentCard(
  {
    title,
    subtitle,
    content,
    html = false,
    contentAlignX = 'center',
    contentAlignY = 'center',
    value,
    maxValue,
    tone = 'neutral',
    color,
    accentPlacement = 'top',
    topStripeFollowsGauge = false,
    variant,
    footer,
    maxLines,
    watermark,
    size = 'md',
    shape = 'standard',
    onClick,
    hoverable,
    dragHandle,
    dragHandleProps,
    dragHandleLabel,
    renderLink,
    className,
    style: styleProp,
    children,
  },
  ref,
) {
  const effectiveTone: ContentCardTone = variant ?? tone
  const effectiveWatermark = variant ? '⚠️' : watermark
  const watermarkIsString = typeof effectiveWatermark === 'string'
  const hasWatermark = watermarkIsString ? effectiveWatermark.length > 0 : effectiveWatermark != null
  const hasArtWatermark = hasWatermark && !watermarkIsString

  const width = SIZE_WIDTH_PX[size]
  // landscape = φ²:1 (shorter box at the same width); standard = φ:1.
  const height = shape === 'landscape' ? width / (PHI * PHI) : width / PHI
  const isHoverable = hoverable ?? !!onClick

  // Auto-wire the overlay anchor's accessible name from the (required) card title.
  const titleId = useId()

  const structuredFooter = isStructuredFooter(footer) ? footer : null
  const hasFooter = structuredFooter
    ? (structuredFooter.lines?.length ?? 0) > 0 || (structuredFooter.badges?.length ?? 0) > 0
    : footer != null

  const defaultMaxLines = (!subtitle && !hasFooter) ? 5 : ((subtitle && hasFooter) ? 3 : 4)
  const effectiveMaxLines = maxLines ?? defaultMaxLines
 
  const hasGauge = value !== undefined && maxValue !== undefined
  const gaugeFraction = hasGauge ? Math.min(1, Math.max(0, value / maxValue)) : 0
  const gaugePct = Math.round(gaugeFraction * 100)
 
  const followGauge = topStripeFollowsGauge && hasGauge
  const effectiveAccentPlacement = (topStripeFollowsGauge || variant) ? 'top' : accentPlacement
 
  const accentColor = followGauge
    ? completenessFill(gaugeFraction)
    : resolveAccentColor(effectiveTone, color) ?? TONE_COLOR.neutral
 
  const accentSuppressed =
    !variant && (
      (topStripeFollowsGauge && !hasGauge) ||
      (!topStripeFollowsGauge && hasGauge && accentPlacement === 'left')
    )
 
  const showVariantLeftStripe = !!variant && !hasGauge
 
  if (process.env.NODE_ENV !== 'production') {
    if (dragHandle && renderLink) {
      throw new Error('ContentCard: `dragHandle` and `renderLink` are mutually exclusive — a navigable tile cannot also be drag-reordered.')
    }
    if (hasGauge && accentPlacement === 'left') {
      throw new Error(
        "ContentCard: left gauge can't combine with `accentPlacement='left'` — both occupy the left edge. Keep the default `accentPlacement='top'` (or omit it) alongside the gauge.",
      )
    }
    if (topStripeFollowsGauge && accentPlacement === 'left') {
      throw new Error(
        "ContentCard: `topStripeFollowsGauge` drives the top stripe — it can't combine with `accentPlacement='left'`. Keep the default `accentPlacement='top'` (or omit it).",
      )
    }
    if (content !== undefined && children !== undefined) {
      throw new Error(
        'ContentCard: `content` and `children` are mutually exclusive — pass either `content` or `children`, but not both.',
      )
    }
    if (content === undefined && children === undefined) {
      throw new Error(
        'ContentCard: one of `content` or `children` must be supplied.',
      )
    }
  }
 
  let footerNode: ReactNode = null
  if (structuredFooter) {
    const lines = structuredFooter.lines ?? []
    const badges = structuredFooter.badges ?? []
    const rowCount = Math.max(lines.length, badges.length)
    footerNode = (
      <div className="mrs-phi-card__footer">
        {Array.from({ length: rowCount }, (_, i) => {
          const line = lines[i]
          const badge_row = badges[i]
          return (
            <div key={i} className="mrs-phi-card__footer-row">
              <span className="mrs-phi-card__footer-line">
                {line?.type ? (
                  <span className="mrs-phi-card__footer-icon">{FOOTER_GLYPHS[line.type]}</span>
                ) : null}
                {line ? <span className="mrs-phi-card__footer-text">{line.text}</span> : null}
              </span>
              {badge_row != null ? (
                <span className="mrs-phi-card__footer-badge">{badge_row}</span>
              ) : null}
            </div>
          )
        })}
      </div>
    )
  }
 
  const style = {
    ...styleProp,
    width: `${width}px`,
    height: `${height}px`,
    fontSize: `${SIZE_FONT_REM[size]}rem`,
    '--mrs-stat-accent': accentColor,
  } as unknown as CSSProperties
 
  const contentStyle = {
    display: '-webkit-box',
    WebkitLineClamp: effectiveMaxLines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  }

  const contentNode =
    content !== undefined ? (
      html ? (
        <div
          className="mrs-content-card__content"
          style={contentStyle}
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
        />
      ) : (
        <div className="mrs-content-card__content" style={contentStyle}>
          {content}
        </div>
      )
    ) : null
 
  return (
    <div
      ref={ref}
      className={cn(
        'mrs-content-card',
        !accentSuppressed && `mrs-content-card--accent-${effectiveAccentPlacement}`,
        hasGauge && 'mrs-content-card--gauge',
        variant && 'mrs-content-card--variant',
        isHoverable && 'mrs-content-card--hoverable',
        hasWatermark && 'mrs-content-card--watermark',
        hasArtWatermark && 'mrs-reveal-host',
        dragHandle && 'mrs-content-card--draggable',
        shape === 'landscape' && 'mrs-content-card--landscape',
        renderLink && 'mrs-content-card--linked',
        className,
      )}
      style={style}
      data-watermark={watermarkIsString ? effectiveWatermark : undefined}
      onClick={onClick}
    >
      {renderLink
        ? renderLink({ className: 'mrs-content-card__link-overlay', 'aria-labelledby': titleId })
        : null}
      {hasArtWatermark ? (
        <div className="mrs-content-card__watermark" aria-hidden="true">{effectiveWatermark}</div>
      ) : null}
      {dragHandle ? (
        <button
          type="button"
          className="mrs-content-card__drag-handle"
          aria-label={dragHandleLabel}
          {...dragHandleProps}
          onClick={(e) => {
            e.stopPropagation()
            dragHandleProps?.onClick?.(e as any)
          }}
        >
          {dragHandle === true ? DEFAULT_DRAG_HANDLE : dragHandle}
        </button>
      ) : null}
      {showVariantLeftStripe ? (
        <div className="mrs-content-card__variant-stripe" aria-hidden="true" />
      ) : null}
      {hasGauge ? (
        <div
          className="mrs-content-card__gauge"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={gaugePct}
          aria-label={`${gaugePct}%`}
        >
          <div
            className="mrs-content-card__gauge-fill"
            style={{ height: `${gaugeFraction * 100}%`, background: completenessFill(gaugeFraction) }}
          />
        </div>
      ) : null}
      <div className="mrs-content-card__inner">
        <div className="mrs-content-card__header">
          <div className="mrs-content-card__head-text">
            <p className="mrs-content-card__title" id={titleId} data-fit={titleFitStep(title) || undefined}>{title}</p>
            {subtitle ? <p className="mrs-content-card__subtitle">{subtitle}</p> : null}
          </div>
        </div>
 
        <div
          className={cn('mrs-content-card__body', variant && 'mrs-content-card__body--variant')}
          data-align-x={contentAlignX}
          data-align-y={contentAlignY}
        >
          {children !== undefined ? children : contentNode}
        </div>
 
        {hasFooter ? (
          <div className="mrs-content-card__lower">
            {structuredFooter ? footerNode : (footer as ReactNode)}
          </div>
        ) : null}
      </div>
    </div>
  )
})
