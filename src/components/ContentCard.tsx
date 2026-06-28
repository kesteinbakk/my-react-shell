import { forwardRef, type CSSProperties, type ReactNode } from 'react'
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

const SIZE_WIDTH_PX: Record<ContentCardSize, number> = {
  sm: 240,
  md: 312,
  lg: 400,
  xl: 520,
}

const DEFAULT_DRAG_HANDLE = (
  <svg width="64" height="12" viewBox="0 0 64 12" fill="currentColor" aria-hidden="true" opacity="0.4">
    <rect x="0" y="1" width="64" height="3" rx="1.5" />
    <rect x="0" y="8" width="64" height="3" rx="1.5" />
  </svg>
)

const SIZE_FONT_REM: Record<ContentCardSize, number> = {
  sm: 0.75,
  md: 0.875,
  lg: 1.125,
  xl: 1.375,
}

const PHI = 1.6180339887

export type ContentCardTone = Tone
export type ContentCardVariant = 'warning' | 'danger'

export interface ContentCardProps {
  title: string
  subtitle?: string
  
  content: string
  html?: boolean
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
  
  footer?: ContentCardFooter
  lower?: ReactNode
  
  watermark?: string
  size?: ContentCardSize
  onClick?: () => void
  hoverable?: boolean
  
  dragHandle?: boolean | ReactNode
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  className?: string
  style?: CSSProperties
}

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

function titleFitStep(text: string): number {
  if (text.length <= 14) return 0
  if (text.length <= 22) return 1
  return 2
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
    lower,
    maxLines,
    watermark,
    size = 'md',
    onClick,
    hoverable,
    dragHandle,
    dragHandleProps,
    className,
    style: styleProp,
  },
  ref,
) {
  const effectiveTone: ContentCardTone = variant ?? tone
  const effectiveWatermark = variant ? '⚠️' : watermark
 
  const width = SIZE_WIDTH_PX[size]
  const height = width / PHI
  const isHoverable = hoverable ?? !!onClick

  const defaultMaxLines = (!subtitle && !footer && !lower) ? 5 : ((subtitle && (footer || lower)) ? 3 : 4)
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
    if (footer && lower != null) {
      throw new Error('ContentCard: provide either `footer` or `lower`, not both.')
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
  }
 
  const hasFooter =
    (footer && ((footer.lines?.length ?? 0) > 0 || (footer.badges?.length ?? 0) > 0)) ||
    lower != null
 
  let footerNode: ReactNode = null
  if (footer) {
    const lines = footer.lines ?? []
    const badges = footer.badges ?? []
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

  const contentNode = html ? (
    <div 
      className="mrs-content-card__content" 
      style={contentStyle}
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} 
    />
  ) : (
    <div className="mrs-content-card__content" style={contentStyle}>{content}</div>
  )
 
  return (
    <div
      ref={ref}
      className={cn(
        'mrs-content-card',
        !accentSuppressed && `mrs-content-card--accent-${effectiveAccentPlacement}`,
        hasGauge && 'mrs-content-card--gauge',
        variant && 'mrs-content-card--variant',
        isHoverable && 'mrs-content-card--hoverable',
        effectiveWatermark && 'mrs-content-card--watermark',
        dragHandle && 'mrs-content-card--draggable',
        className,
      )}
      style={style}
      data-watermark={effectiveWatermark}
      onClick={onClick}
    >
      {dragHandle ? (
        <button
          type="button"
          className="mrs-content-card__drag-handle"
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
            <p className="mrs-content-card__title" data-fit={titleFitStep(title) || undefined}>{title}</p>
            {subtitle ? <p className="mrs-content-card__subtitle">{subtitle}</p> : null}
          </div>
        </div>
 
        <div
          className={cn('mrs-content-card__body', variant && 'mrs-content-card__body--variant')}
          data-align-x={contentAlignX}
          data-align-y={contentAlignY}
        >
          {contentNode}
        </div>
 
        {hasFooter ? (
          <div className="mrs-content-card__lower">
            {footer ? footerNode : lower}
          </div>
        ) : null}
      </div>
    </div>
  )
})
