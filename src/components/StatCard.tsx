import type { CSSProperties, ReactNode } from 'react'
import { cn } from './cn'
import { ACCENT_TONE_COLOR, resolveAccentColor } from './accent'
import type { AccentPlacement, AccentTone } from './accent'
import type { PhiCardFooter, PhiCardFooterLine, PhiCardFooterLineType, PhiCardSize } from './PhiCard'

// Re-export the footer types (same shape as PhiCard) so consumers import from one place.
export type { PhiCardFooter as StatCardFooter, PhiCardFooterLine as StatCardFooterLine, PhiCardFooterLineType as StatCardFooterLineType }

declare const process: { env: { NODE_ENV?: string } }

const SIZE_WIDTH_PX: Record<PhiCardSize, number> = {
  sm: 180,
  md: 240,
  lg: 320,
  xl: 480,
}

const SIZE_FONT_REM: Record<PhiCardSize, number> = {
  sm: 0.75,
  md: 0.875,
  lg: 1.125,
  xl: 1.375,
}

// The golden ratio — height = width / PHI (same constant as PhiCard).
const PHI = 1.6180339887

/** Semantic accent hue — shared with `PhiCard` (adds `primary` to the original set). */
export type StatCardTone = AccentTone

// ── Badge ─────────────────────────────────────────────────────────────────────

export interface StatCardBadge {
  /** Primary value shown in the badge circle. */
  value: number | string
  /** Short uppercase label below the value. Omit when `max` is present. */
  label?: string
  /**
   * When given: renders an SVG arc-ring showing `value / max` progress.
   * The `label` prop is ignored in arc mode.
   */
  max?: number
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
  /** Circle badge in the top-right corner. */
  badge?: StatCardBadge
  /**
   * Semantic tone — drives the accent stripe color and badge tint.
   * Ignored when `color` is set.
   */
  tone?: StatCardTone
  /** Raw CSS color string for the accent stripe and badge; overrides `tone`. */
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
   * Data stat items displayed below the header.
   * Each item has a `value` with either a `label` OR a `max` — not both (throws in dev).
   */
  stats?: StatItem[]
  /**
   * Structured footer (same shape as PhiCard): meta lines on the left, badges on the right.
   * Throws in dev if given alongside `lower`.
   */
  footer?: PhiCardFooter
  /**
   * Freeform footer node — e.g. a CTA pill.
   * Throws in dev if given alongside `footer`.
   */
  lower?: ReactNode
  /** Emoji or text rendered as a faint background watermark. E.g. `'🏆'`. */
  watermark?: string
  /** Size preset — same widths as `PhiCard`. Default: `'md'`. */
  size?: PhiCardSize
  /** Click handler; makes the whole card interactive. */
  onClick?: () => void
  /** Hover lift effect. Defaults to `true` when `onClick` is set. */
  hoverable?: boolean
  /** Extra classes on the outer card element. */
  className?: string
}

// ── Footer glyphs (same kit-shipped icons as PhiCard) ────────────────────────

const FOOTER_GLYPHS: Record<NonNullable<PhiCardFooterLine['type']>, ReactNode> = {
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

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Stat card — a φ-framed KPI/status card with a title, an optional accent
 * badge circle (plain number or arc-ring progress), a row of data stats, and an
 * optional footer or freeform lower slot. Shares the same size system as PhiCard.
 *
 * The accent stripe, badge tint, and watermark are driven by `tone` (mapped to
 * semantic tokens) or overridden with a raw CSS `color` string.
 */
export function StatCard({
  title,
  subtitle,
  badge,
  tone = 'neutral',
  color,
  accentPlacement = 'top',
  sideBarCompleteness,
  stats,
  footer,
  lower,
  watermark,
  size = 'md',
  onClick,
  hoverable,
  className,
}: StatCardProps) {
  // tone defaults to 'neutral', so this is always defined (StatCard always accents).
  const accentColor = resolveAccentColor(tone, color) ?? ACCENT_TONE_COLOR.neutral
  const width = SIZE_WIDTH_PX[size]
  const height = width / PHI
  const isHoverable = hoverable ?? !!onClick

  // `undefined` → no gauge; `0` → gauge with an empty fill. Checked, never
  // truthy-tested, so `0` is rendered rather than swallowed.
  const hasGauge = sideBarCompleteness !== undefined
  const gaugeFraction = hasGauge ? Math.min(1, Math.max(0, sideBarCompleteness)) : 0
  const gaugePct = Math.round(gaugeFraction * 100)

  // The gauge owns the left edge. If a consumer also forces the accent stripe there
  // (`accentPlacement='left'`), the gauge wins and the stripe is suppressed, so they
  // can never overlap. Dev throws below; this is the prod-safe fallback.
  const accentSuppressed = hasGauge && accentPlacement === 'left'

  // Dev guards
  if (process.env.NODE_ENV !== 'production') {
    if (footer && lower != null) {
      throw new Error('StatCard: provide either `footer` or `lower`, not both.')
    }
    if (hasGauge && accentPlacement === 'left') {
      throw new Error(
        "StatCard: `sideBarCompleteness` can't combine with `accentPlacement='left'` — both occupy the left edge. Keep the default `accentPlacement='top'` (or omit it) alongside the gauge.",
      )
    }
    stats?.forEach((item, i) => {
      if (item.label !== undefined && item.max !== undefined) {
        throw new Error(
          `StatCard: stats[${i}] cannot have both \`label\` and \`max\` — use one layout or the other.`,
        )
      }
    })
  }

  const hasFooter =
    (footer && ((footer.lines?.length ?? 0) > 0 || (footer.badges?.length ?? 0) > 0)) ||
    lower != null

  // PhiCard footer renderer reused (same JSX structure, same CSS classes)
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
    width: `${width}px`,
    height: `${height}px`,
    fontSize: `${SIZE_FONT_REM[size]}rem`,
    '--mrs-stat-accent': accentColor,
  } as unknown as CSSProperties

  // Badge circle or arc ring
  let badgeNode: ReactNode = null
  if (badge) {
    if (badge.max != null) {
      badgeNode = (
        <div className="mrs-stat-card__badge mrs-stat-card__badge--arc">
          <ArcRing value={badge.value} max={badge.max} />
        </div>
      )
    } else {
      badgeNode = (
        <div className="mrs-stat-card__badge">
          <span className="mrs-stat-card__badge-value">{badge.value}</span>
          {badge.label ? <span className="mrs-stat-card__badge-label">{badge.label}</span> : null}
        </div>
      )
    }
  }

  return (
    <div
      className={cn(
        'mrs-stat-card',
        !accentSuppressed && `mrs-stat-card--accent-${accentPlacement}`,
        hasGauge && 'mrs-stat-card--gauge',
        isHoverable && 'mrs-stat-card--hoverable',
        watermark && 'mrs-stat-card--watermark',
        className,
      )}
      style={style}
      data-watermark={watermark}
      onClick={onClick}
    >
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
        {/* Header: title block + badge */}
        <div className="mrs-stat-card__header">
          <div className="mrs-stat-card__head-text">
            <p className="mrs-stat-card__title">{title}</p>
            {subtitle ? <p className="mrs-stat-card__subtitle">{subtitle}</p> : null}
          </div>
          {badgeNode}
        </div>

        {/* Stats */}
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

        {/* Footer / lower */}
        {hasFooter ? (
          <div className="mrs-stat-card__lower">
            {footer ? footerNode : lower}
          </div>
        ) : null}
      </div>
    </div>
  )
}
