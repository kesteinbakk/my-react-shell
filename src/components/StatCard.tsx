import { forwardRef, isValidElement, useId, type CSSProperties, type ReactNode } from 'react'
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
export type StatCardSize = 'sm' | 'md' | 'lg' | 'xl'

/** Leading glyph kind for a footer meta line. */
export type StatCardFooterLineType = 'date' | 'time' | 'check'

/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface StatCardFooterLine {
  text: ReactNode
  type?: StatCardFooterLineType
}

/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface StatCardFooter {
  lines?: StatCardFooterLine[]
  badges?: ReactNode[]
}

/** Proportion of the card: `'standard'` is φ:1 (`height = width / φ`); `'landscape'` is the shorter-wider φ²:1 (`height = width / φ²`). */
export type StatCardShape = 'standard' | 'landscape'

/**
 * Props the card hands the consumer's {@link StatCardProps.renderLink} callback to spread onto
 * its router `<Link>`. The card supplies the overlay `className` and an auto-wired
 * `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface StatCardLinkProps {
  className: string
  'aria-labelledby'?: string
}

/**
 * Discriminate the structured `{ lines, badges }` footer from a freeform `ReactNode`.
 * A React element, array, or primitive is freeform; a plain object carrying `lines`/`badges`
 * is structured.
 */
function isStructuredFooter(footer: ReactNode | StatCardFooter): footer is StatCardFooter {
  return (
    typeof footer === 'object' &&
    footer !== null &&
    !isValidElement(footer) &&
    !Array.isArray(footer) &&
    ('lines' in footer || 'badges' in footer)
  )
}

const SIZE_WIDTH_PX: Record<StatCardSize, number> = {
  sm: 240,
  md: 312,
  lg: 400,
  xl: 520,
}

const SIZE_FONT_REM: Record<StatCardSize, number> = {
  sm: 0.75,
  md: 0.875,
  lg: 1.125,
  xl: 1.375,
}

// The golden ratio — a card's rendered height is width / PHI.
const PHI = 1.6180339887

/** Semantic accent hue — the kit's canonical {@link Tone}, shared with `PhiCard`. */
export type StatCardTone = Tone

/** Structural alert variant — overrides `tone` to the same value and forces the ⚠️ watermark. */
export type StatCardVariant = 'warning' | 'danger'

// ── Medallion ─────────────────────────────────────────────────────────────────

export interface StatCardMedallion {
  /** Primary value shown in the medallion circle. */
  value: number | string
  /** Short uppercase label below the value. Omit when `max` is present. */
  label?: string
  /**
   * When given: renders an SVG arc-ring showing `value / max` progress.
   * The `label` prop is ignored in arc mode.
   */
  max?: number
  /**
   * Size of the medallion. `'lg'` is the standard size. `'sm'` is a smaller
   * footprint with no label, a smaller font, and value clamped to 99.
   * Default: `'lg'`.
   */
  size?: 'lg' | 'sm'
}

// ── Stat items ────────────────────────────────────────────────────────────────

export interface StatItem {
  value: number | string
  /**
   * Label shown above the number.
   * **Cannot be combined with `max`** — throws in dev.
   */
  label?: string
  /**
   * When given: renders the item as a compact arc-ring.
   * **Cannot be combined with `label`** — throws in dev.
   */
  max?: number
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface StatCardProps {
  /** Card title. */
  title: string
  /** Optional subtitle shown below the title. */
  subtitle?: string
  /** Circle medallion in the top-right corner. */
  medallion?: StatCardMedallion
  /**
   * Semantic tone — drives the accent stripe color and medallion tint.
   * Ignored when `color` is set.
   */
  tone?: StatCardTone
  /** Raw CSS color string for the accent stripe and medallion; overrides `tone`. */
  color?: string
  /** Where the accent reads: a `'top'` stripe (default) or a `'left'` bar. */
  accentPlacement?: AccentPlacement
  /**
   * Left-edge completion gauge — a vertical bar whose colored fill rises from the
   * bottom to `value × height`, interpolating **red → amber → green**
   * (`danger → warning → success` tokens) as it climbs. A `0`–`1` fraction
   * (clamped). Independent of `accentPlacement`, so a top accent stripe and this
   * side gauge can read at once.
   *
   * **Checked, not defaulted:** `undefined` renders no gauge; `0` renders the gauge
   * (faint track, empty fill).
   *
   * Combining with `accentPlacement='left'` throws in dev (both occupy the left
   * edge); in production the gauge takes precedence and the left accent stripe is
   * suppressed, so they never overlap.
   */
  sideBarCompleteness?: number
  /**
   * When `true`, the whole accent — top stripe, medallion tint, and stat numbers —
   * takes the **gauge's** completeness color (red → amber → green) instead of
   * `tone`/`color`, so the card reads as one coherent color, and the stripe is
   * forced to the top edge.
   *
   * Bound to `sideBarCompleteness`: the top stripe renders only when a gauge is
   * present — `sideBarCompleteness === undefined` → **no top stripe** (medallion and
   * stat numbers fall back to `tone`/`color`). Throws in dev if combined with
   * `accentPlacement='left'`. Default `false`.
   */
  topStripeFollowsGauge?: boolean
  /**
   * Data stat items displayed below the header.
   * Each item has a `value` with either a `label` OR a `max` — not both (throws in dev).
   */
  stats?: StatItem[]
  /**
   * Structural variant — overrides `tone` to the same value (so the accent stripe,
   * badge tint, and body text all reflect the variant hue) and forces `⚠️` as the
   * watermark background emoji, ignoring the `watermark` prop.
   */
  variant?: StatCardVariant
  /**
   * Footer slot: either a freeform `ReactNode` (e.g. a CTA pill) or a structured
   * `{ lines, badges }` (meta lines on the left, badges on the right).
   */
  footer?: ReactNode | StatCardFooter
  /**
   * Emoji or text rendered as a faint background watermark. E.g. `'🏆'`.
   * Ignored when `variant` is set — the variant always shows `⚠️`.
   */
  watermark?: string
  /** Size preset — fixed-width golden-ratio card. Default: `'md'` (≈312px). */
  size?: StatCardSize
  /**
   * Proportion of the card. Default `'standard'` (`height = width / φ`); `'landscape'` is the
   * shorter-wider `height = width / φ²` — for light cards (no footer, small content) where the
   * standard height reads too tall. A full stats row + footer can overflow the shorter box.
   */
  shape?: StatCardShape
  /** Click handler; makes the whole card interactive. */
  onClick?: () => void
  /** Hover lift effect. Defaults to `true` when `onClick` is set. */
  hoverable?: boolean
  /** Click handler for the medallion. */
  onMedallionPress?: () => void
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
  /**
   * Interactive-root seam. The consumer renders its own router `<Link>` here, spreading the
   * supplied props, and the card mounts it as a **full-bleed block-link overlay** so the whole
   * tile is a real, keyboard-activatable anchor — while the card root stays a `<div>` that owns
   * its hover/border/focus states. Nested controls (the medallion button, drag handle) stay
   * clickable above the overlay. The shell imports no router; `to`/`params` type-safety lives
   * at the call site:
   *
   * ```tsx
   * renderLink={(p) => <Link {...p} to="/entity/$id" params={{ id }} />}
   * ```
   *
   * Mutually exclusive with `dragHandle` (a nav tile isn't drag-reorderable) — throws in dev.
   */
  renderLink?: (linkProps: StatCardLinkProps) => ReactNode
  /** Extra classes on the outer card element. */
  className?: string
  /** Optional style override. */
  style?: CSSProperties
}

// ── Footer glyphs ───────────────────────────────────────────────────────────

const FOOTER_GLYPHS: Record<NonNullable<StatCardFooterLine['type']>, ReactNode> = {
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

// ── Arc ring SVG ──────────────────────────────────────────────────────────────

function ArcRing({
  value,
  max,
  className,
}: {
  value: number | string
  max: number
  className?: string
}) {
  const numVal = typeof value === 'number' ? value : parseFloat(String(value))
  const pct = Math.min(1, Math.max(0, isNaN(numVal) ? 0 : numVal / max))
  const SIZE = 48
  const STROKE = 4.5
  const r = (SIZE - STROKE) / 2
  const circum = 2 * Math.PI * r
  const offset = circum * (1 - pct)
  const cx = SIZE / 2
  const pctInt = Math.round(pct * 100)

  // Fully complete → checkmark
  if (pct >= 1) {
    return (
      <svg
        className={cn('mrs-stat-card__arc', className)}
        viewBox="0 0 24 24"
        role="img"
        aria-label="100%"
      >
        <path
          d="M4 12.5l5 5L20 6.5"
          fill="none"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ stroke: 'var(--mrs-stat-accent, currentColor)' }}
        />
      </svg>
    )
  }

  return (
    <svg
      className={cn('mrs-stat-card__arc', className)}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${pctInt}%`}
    >
      {/* Track */}
      <circle cx={cx} cy={cx} r={r} fill="none" strokeWidth={STROKE} className="mrs-stat-card__arc-track" />
      {/* Progress arc */}
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        strokeWidth={STROKE}
        strokeDasharray={circum}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ stroke: 'var(--mrs-stat-accent, currentColor)' }}
      />
      {/* Center percentage */}
      <text
        x={cx} y={cx}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="700"
        fill="currentColor"
        className="mrs-stat-card__arc-text"
      >
        {pctInt}%
      </text>
    </svg>
  )
}

// ── Completion gauge ──────────────────────────────────────────────────────────

/**
 * Completion-gauge fill paint: interpolate the semantic signal tokens
 * `danger → warning → success` across `[0,1]` with `color-mix`, in two segments
 * (`0→0.5` danger→warning, `0.5→1` warning→success). The stops are theme tokens,
 * so the fill stays palette- and dark-mode-correct. Input is clamped.
 */
function completenessFill(value: number): string {
  const v = Math.min(1, Math.max(0, value))
  if (v <= 0.5) {
    const t = (v / 0.5) * 100
    return `color-mix(in srgb, var(--color-warning) ${t}%, var(--color-danger))`
  }
  const t = ((v - 0.5) / 0.5) * 100
  return `color-mix(in srgb, var(--color-success) ${t}%, var(--color-warning))`
}

// ── Title auto-fit ──────────────────────────────────────────────────────────

/**
 * Very long titles step the font size down (up to five steps) so they stay within
 * roughly two lines without changing the card geometry. Length-based: the title font
 * scales with `size`, so characters-per-line is roughly constant across presets, and
 * raw `title.length` is a good cross-size proxy for "is this title very long". The
 * extra deep steps let the card swallow a much longer title before it has to ellipsize.
 * Returns `0` (no reduction) through `5` (smallest). Shared ladder across the
 * string-title cards (`StatCard`/`ContentCard`/`PaperCard`).
 */
function titleFitStep(title: string): 0 | 1 | 2 | 3 | 4 | 5 {
  const n = title.length
  if (n > 116) return 5
  if (n > 90) return 4
  if (n > 68) return 3
  if (n > 48) return 2
  if (n > 32) return 1
  return 0
}

// ── Component ─────────────────────────────────────────────────────────────────

const DEFAULT_DRAG_HANDLE = (
  <svg width="64" height="12" viewBox="0 0 64 12" fill="currentColor" aria-hidden="true" opacity="0.4">
    <rect x="0" y="1" width="64" height="3" rx="1.5" />
    <rect x="0" y="8" width="64" height="3" rx="1.5" />
  </svg>
)

/**
 * Stat card — a φ-framed KPI/status card with a title, an optional accent
 * medallion circle (plain number or arc-ring progress), a row of data stats, and an
 * optional footer or freeform lower slot.
 *
 * The accent stripe, medallion tint, and watermark are driven by `tone` (mapped to
 * semantic tokens) or overridden with a raw CSS `color` string.
 */
export const StatCard = forwardRef<HTMLDivElement, StatCardProps>(function StatCard(
  {
    title,
    subtitle,
    medallion,
    tone = 'neutral',
    color,
    accentPlacement = 'top',
    sideBarCompleteness,
    topStripeFollowsGauge = false,
    stats,
    variant,
    footer,
    watermark,
    size = 'md',
    shape = 'standard',
    onClick,
    onMedallionPress,
    hoverable,
    dragHandle,
    dragHandleProps,
    renderLink,
    className,
    style: styleProp,
  },
  ref,
) {
  // variant overrides tone to the same value; ⚠️ always used as the watermark.
  const effectiveTone: StatCardTone = variant ?? tone
  const effectiveWatermark = variant ? '⚠️' : watermark

  const width = SIZE_WIDTH_PX[size]
  // landscape = φ²:1 (shorter box at the same width); standard = φ:1.
  const height = shape === 'landscape' ? width / (PHI * PHI) : width / PHI
  const isHoverable = hoverable ?? !!onClick

  // Auto-wire the overlay anchor's accessible name from the (required) card title.
  const titleId = useId()

  const structuredFooter = isStructuredFooter(footer) ? footer : null
 
  // `undefined` → no gauge; `0` → gauge with an empty fill. Checked, never
  // truthy-tested, so `0` is rendered rather than swallowed.
  const hasGauge = sideBarCompleteness !== undefined
  const gaugeFraction = hasGauge ? Math.min(1, Math.max(0, sideBarCompleteness)) : 0
  const gaugePct = Math.round(gaugeFraction * 100)
 
  // `topStripeFollowsGauge`: the whole accent (top stripe + medallion tint + stat
  // numbers) takes the gauge's completeness colour, so the card reads as one
  // coherent colour, and the stripe is forced to the top edge.
  const followGauge = topStripeFollowsGauge && hasGauge
  // variant forces the top stripe; topStripeFollowsGauge also forces top.
  const effectiveAccentPlacement = (topStripeFollowsGauge || variant) ? 'top' : accentPlacement
 
  // Accent paint: the gauge colour when following it, else tone/color (tone/color
  // is also the fallback when the mode is on but there's no gauge to follow). tone
  // defaults to 'neutral', so the non-follow branch is always defined.
  const accentColor = followGauge
    ? completenessFill(gaugeFraction)
    : resolveAccentColor(effectiveTone, color) ?? TONE_COLOR.neutral
 
  // When to drop the accent stripe entirely:
  //  • mode on but no gauge → the top stripe has nothing to follow (no stripe);
  //  • gauge + a left accent → the gauge owns the left edge (suppress the stripe).
  // variant always shows the accent (top stripe + DOM left stripe), so it's never suppressed.
  // Dev throws on both contradictions below; these are the prod-safe fallbacks.
  const accentSuppressed =
    !variant && (
      (topStripeFollowsGauge && !hasGauge) ||
      (!topStripeFollowsGauge && hasGauge && accentPlacement === 'left')
    )
 
  // variant left stripe: shown alongside the top stripe unless the gauge already
  // occupies the left edge (6px gauge > 4px stripe; they'd overlap).
  const showVariantLeftStripe = !!variant && !hasGauge
 
  // Dev guards
  if (process.env.NODE_ENV !== 'production') {
    if (dragHandle && renderLink) {
      throw new Error('StatCard: `dragHandle` and `renderLink` are mutually exclusive — a navigable tile cannot also be drag-reordered.')
    }
    if (hasGauge && accentPlacement === 'left') {
      throw new Error(
        "StatCard: `sideBarCompleteness` can't combine with `accentPlacement='left'` — both occupy the left edge. Keep the default `accentPlacement='top'` (or omit it) alongside the gauge.",
      )
    }
    if (topStripeFollowsGauge && accentPlacement === 'left') {
      throw new Error(
        "StatCard: `topStripeFollowsGauge` drives the top stripe — it can't combine with `accentPlacement='left'`. Keep the default `accentPlacement='top'` (or omit it).",
      )
    }
    stats?.forEach((item, i) => {
      if (item.label !== undefined && item.max !== undefined) {
        throw new Error(
          `StatCard: stats[${i}] cannot have both \`label\` and \`max\` — use one layout or the other.`,
        )
      }
    })
    if (medallion?.label) {
      if (medallion.label.length > 8) {
        console.warn(
          `StatCard: medallion.label exceeds 8 characters — the card may not render correctly. (Got "${medallion.label}")`
        )
      }
      if (/\s/.test(medallion.label.trim())) {
        throw new Error(
          `StatCard: medallion.label must be a single word without spaces. (Got "${medallion.label}")`
        )
      }
    }
  }
 
  const hasFooter = structuredFooter
    ? (structuredFooter.lines?.length ?? 0) > 0 || (structuredFooter.badges?.length ?? 0) > 0
    : footer != null

  // Footer renderer (shared JSX structure + CSS classes with ContentCard)
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
 
  // Medallion circle or arc ring
  let medallionNode: ReactNode = null
  if (medallion) {
    const isPressable = !!onMedallionPress
    const MedallionTag = isPressable ? 'button' : 'div'
    const medallionProps = isPressable
      ? {
          type: 'button' as const,
          onClick: (e: React.MouseEvent) => {
            e.stopPropagation()
            onMedallionPress()
          },
        }
      : {}

    if (medallion.max != null) {
      const numVal = typeof medallion.value === 'number' ? medallion.value : parseFloat(String(medallion.value))
      const pct = Math.min(1, Math.max(0, isNaN(numVal) ? 0 : numVal / medallion.max))

      if (pct >= 1) {
        medallionNode = (
          <MedallionTag
            className={cn(
              'mrs-stat-card__medallion',
              medallion.size === 'sm' && 'mrs-stat-card__medallion--sm',
              isPressable && 'mrs-stat-card__medallion--pressable'
            )}
            {...medallionProps}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: '1.8em', height: '1.8em' }}>
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </MedallionTag>
        )
      } else {
        medallionNode = (
          <MedallionTag
            className={cn(
              'mrs-stat-card__medallion mrs-stat-card__medallion--arc',
              medallion.size === 'sm' && 'mrs-stat-card__medallion--sm',
              isPressable && 'mrs-stat-card__medallion--pressable'
            )}
            {...medallionProps}
          >
            <ArcRing value={medallion.value} max={medallion.max} />
          </MedallionTag>
        )
      }
    } else {
      let displayValue = medallion.value
      if (medallion.size === 'sm') {
        const num = typeof displayValue === 'number' ? displayValue : Number(displayValue)
        if (!isNaN(num) && num > 99) {
          displayValue = 99
        }
      }

      if (typeof displayValue === 'number') {
        displayValue = Math.round(displayValue)
      } else if (typeof displayValue === 'string' && !isNaN(Number(displayValue)) && displayValue.trim() !== '') {
        displayValue = Math.round(Number(displayValue)).toString()
      }
      const valueStr = String(displayValue)

      if (process.env.NODE_ENV !== 'production') {
        if (valueStr.length > 4) {
          throw new Error(`StatCard: medallion.value cannot exceed 4 characters (got "${valueStr}").`)
        }
      }

      medallionNode = (
        <MedallionTag
          className={cn(
            'mrs-stat-card__medallion',
            medallion.size === 'sm' && 'mrs-stat-card__medallion--sm',
            isPressable && 'mrs-stat-card__medallion--pressable'
          )}
          {...medallionProps}
        >
          <span className="mrs-stat-card__medallion-value" data-len={valueStr.length}>{displayValue}</span>
          {medallion.size !== 'sm' && medallion.label ? <span className="mrs-stat-card__medallion-label" data-len={medallion.label.length}>{medallion.label}</span> : null}
        </MedallionTag>
      )
    }
  }
 
  return (
    <div
      ref={ref}
      className={cn(
        'mrs-stat-card',
        !accentSuppressed && `mrs-stat-card--accent-${effectiveAccentPlacement}`,
        hasGauge && 'mrs-stat-card--gauge',
        variant && 'mrs-stat-card--variant',
        isHoverable && 'mrs-stat-card--hoverable',
        effectiveWatermark && 'mrs-stat-card--watermark',
        dragHandle && 'mrs-stat-card--draggable',
        shape === 'landscape' && 'mrs-stat-card--landscape',
        renderLink && 'mrs-stat-card--linked',
        className,
      )}
      style={style}
      data-watermark={effectiveWatermark}
      data-has-medallion={medallion != null ? "true" : undefined}
      data-medallion-size={medallion?.size ?? 'lg'}
      onClick={onClick}
    >
      {renderLink
        ? renderLink({ className: 'mrs-stat-card__link-overlay', 'aria-labelledby': titleId })
        : null}
      {dragHandle ? (
        <button
          type="button"
          className="mrs-stat-card__drag-handle"
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
        <div className="mrs-stat-card__variant-stripe" aria-hidden="true" />
      ) : null}
      {hasGauge ? (
        <div
          className="mrs-stat-card__gauge"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={gaugePct}
          aria-label={`${gaugePct}%`}
        >
          <div
            className="mrs-stat-card__gauge-fill"
            style={{ height: `${gaugeFraction * 100}%`, background: completenessFill(gaugeFraction) }}
          />
        </div>
      ) : null}
      <div className="mrs-stat-card__inner">
        {/* Header: title block + medallion */}
        <div className="mrs-stat-card__header">
          <div className="mrs-stat-card__head-text">
            <p className="mrs-stat-card__title" id={titleId} data-fit={titleFitStep(title) || undefined}>{title}</p>
            {subtitle ? <p className="mrs-stat-card__subtitle">{subtitle}</p> : null}
          </div>
          {medallionNode}
        </div>
 
        {/* Stats grid */}
        {stats && stats.length > 0 ? (
          <dl className="mrs-stat-card__stats">
            {stats.map((item, i) => {
              if (item.max != null) {
                // Arc-ring stat
                return (
                  <div key={i} className="mrs-stat-card__stat mrs-stat-card__stat--arc">
                    <ArcRing value={item.value} max={item.max} />
                  </div>
                )
              }
              return (
                <div key={i} className="mrs-stat-card__stat">
                  {item.label ? (
                    <dt className="mrs-stat-card__stat-label">{item.label}</dt>
                  ) : null}
                  <dd className="mrs-stat-card__stat-value">{item.value}</dd>
                </div>
              )
            })}
          </dl>
        ) : null}

        {/* Footer — structured lines/badges or a freeform node */}
        {hasFooter ? (
          <div className="mrs-stat-card__lower">
            {structuredFooter ? footerNode : (footer as ReactNode)}
          </div>
        ) : null}
      </div>
    </div>
  )
})
