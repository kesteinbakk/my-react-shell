import { forwardRef, isValidElement, useId, type CSSProperties, type ReactNode } from 'react'
import { cn } from './cn'
import { resolveAccentColor } from './accent'
import type { AccentPlacement } from './accent'
import type { Tone } from './tone'
declare const process: { env: { NODE_ENV?: string } }

/**
 * Size preset — a fixed-width A4-portrait card (`height = width × √2`). `md` (≈168px) is
 * the default: a small **preview / thumbnail** sheet, not a full page. `sm` is a smaller,
 * denser thumbnail; `lg` is literally A4's millimetre figures (210 × 297).
 */
export type PaperCardSize = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

/** Leading glyph kind for a footer meta line (shared shape with `StatCard`/`ContentCard`). */
export type PaperCardFooterLineType = 'date' | 'time' | 'check'

/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface PaperCardFooterLine {
  text: ReactNode
  type?: PaperCardFooterLineType
}

/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface PaperCardFooter {
  lines?: PaperCardFooterLine[]
  badges?: ReactNode[]
}

/**
 * Props the card hands the consumer's {@link PaperCardProps.renderLink} callback to spread onto
 * its router `<Link>`. The card supplies the overlay `className` and an auto-wired
 * `aria-labelledby` pointing at the card's title; the consumer adds `to`/`params`.
 */
export interface PaperCardLinkProps {
  className: string
  'aria-labelledby'?: string
}

export type PaperCardTone = Tone

/**
 * Discriminate the structured `{ lines, badges }` footer from a freeform `ReactNode`.
 * A React element, array, or primitive is freeform; a plain object carrying `lines`/`badges`
 * is structured.
 */
function isStructuredFooter(footer: ReactNode | PaperCardFooter): footer is PaperCardFooter {
  return (
    typeof footer === 'object' &&
    footer !== null &&
    !isValidElement(footer) &&
    !Array.isArray(footer) &&
    ('lines' in footer || 'badges' in footer)
  )
}

const SIZE_WIDTH_PX: Record<PaperCardSize, number> = {
  sm: 134,
  md: 168,
  lg: 210,
  xl: 264,
  xxl: 320,
}

/** Folded-corner size per preset (px) — scales with the sheet so the dog-ear reads at every size. */
const SIZE_FOLD_PX: Record<PaperCardSize, number> = {
  sm: 22,
  md: 26,
  lg: 30,
  xl: 34,
  xxl: 40,
}

const SIZE_FONT_REM: Record<PaperCardSize, number> = {
  // `sm` shares `md`'s font-size — the smaller sheet keeps readable text, just less of it.
  sm: 0.75,
  md: 0.75,
  lg: 0.875,
  xl: 1.0,
  xxl: 1.25,
}

// A4 / ISO 216 portrait aspect: height = width × √2.
const SQRT2 = 1.4142135624

const DEFAULT_DRAG_HANDLE = (
  <svg width="64" height="12" viewBox="0 0 64 12" fill="currentColor" aria-hidden="true" opacity="0.4">
    <rect x="0" y="1" width="64" height="3" rx="1.5" />
    <rect x="0" y="8" width="64" height="3" rx="1.5" />
  </svg>
)

const FOOTER_GLYPHS: Record<NonNullable<PaperCardFooterLine['type']>, ReactNode> = {
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
 * without changing the sheet geometry; the deeper steps let a much longer title fit before
 * it ellipsizes. Shared ladder with `StatCard`/`ContentCard`. Returns `0` (no reduction) → `5`.
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

export interface PaperCardProps {
  /** Card title. */
  title: string
  /** Optional subtitle / meta line shown below the title. */
  subtitle?: string

  /** Freeform body text. Optional — a thumbnail can carry just a title. */
  content?: string
  contentAlignX?: 'left' | 'center' | 'right'
  contentAlignY?: 'top' | 'center' | 'bottom'
  /** Clamp the body to N lines (CSS line-clamp). */
  maxLines?: number

  /**
   * Semantic tone — drives an optional accent stripe. Default **none** (no accent): a
   * paper card reads from its proportion, fold, and shadow alone. The folded corner stays
   * a neutral surface tint even when an accent is set.
   */
  tone?: PaperCardTone
  /** Raw CSS color string for the accent stripe; overrides `tone`. */
  color?: string
  /** Where the accent reads when `tone`/`color` is set: a `'top'` stripe (default) or a `'left'` bar. */
  accentPlacement?: AccentPlacement

  /**
   * Footer slot: either a freeform `ReactNode` or a structured `{ lines, badges }`
   * (meta lines on the left, badges on the right). Same shape as `StatCard`/`ContentCard`.
   */
  footer?: ReactNode | PaperCardFooter

  /** Emoji or text rendered as a faint background watermark. E.g. `'📄'`. */
  watermark?: string
  /** Size preset — fixed-width A4-portrait card. Default: `'md'` (≈168px). */
  size?: PaperCardSize

  /** Click handler; makes the whole card interactive. */
  onClick?: () => void
  /** Hover lift effect. Defaults to `true` when `onClick` is set. */
  hoverable?: boolean

  /**
   * Enables the drag handler. If `true`, renders a built-in top-center grip handle.
   * If a `ReactNode`, renders your custom handle.
   */
  dragHandle?: boolean | ReactNode
  /** Event listeners / attributes from your DND library, spread onto the drag handle. */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
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
  renderLink?: (linkProps: PaperCardLinkProps) => ReactNode
  /**
   * Raw CSS color string mixed *faintly* into the sheet's surface as a background tint.
   * Dark-mode-safe: it `color-mix`es against the surface token (not white), so the tint
   * reads correctly in both themes. Omit ⇒ no tint (today's behavior). Independent of the
   * existing `tone`/`color` accent — a sheet can carry both an accent stripe and a tint.
   */
  tint?: string
  className?: string
  style?: CSSProperties
}

/**
 * Paper card — a small **preview / thumbnail** card styled as a dog-eared sheet of paper at
 * A4 portrait proportions (`height = width × √2`). The folded top-right corner is genuinely
 * cut out of the sheet (`clip-path`) with a folded triangle sitting in the notch; the drop
 * shadow is carried on the wrapper via `filter: drop-shadow()` so it follows the dog-eared
 * silhouette rather than being clipped away.
 *
 * Optional `tone`/`color` adds an accent stripe (none by default). Shares the card-family
 * footer, watermark, hover-lift, drag-handle, and `renderLink` block-link seams.
 */
export const PaperCard = forwardRef<HTMLDivElement, PaperCardProps>(function PaperCard(
  {
    title,
    subtitle,
    content,
    contentAlignX = 'left',
    contentAlignY = 'top',
    maxLines,
    tone,
    color,
    accentPlacement = 'top',
    footer,
    watermark,
    size = 'md',
    onClick,
    hoverable,
    dragHandle,
    dragHandleProps,
    renderLink,
    tint,
    className,
    style: styleProp,
  },
  ref,
) {
  const width = SIZE_WIDTH_PX[size]
  const height = width * SQRT2
  const fold = SIZE_FOLD_PX[size]
  const isHoverable = hoverable ?? !!onClick

  // Auto-wire the overlay anchor's accessible name from the (required) card title.
  const titleId = useId()

  const structuredFooter = isStructuredFooter(footer) ? footer : null
  const hasFooter = structuredFooter
    ? (structuredFooter.lines?.length ?? 0) > 0 || (structuredFooter.badges?.length ?? 0) > 0
    : footer != null

  const defaultMaxLines = (!subtitle && !hasFooter) ? 7 : ((subtitle && hasFooter) ? 4 : 5)
  const effectiveMaxLines = maxLines ?? defaultMaxLines

  // No accent unless tone/color is given — a paper card defaults to plain stock.
  const accentColor = resolveAccentColor(tone, color)
  const hasAccent = accentColor != null

  if (process.env.NODE_ENV !== 'production') {
    if (dragHandle && renderLink) {
      throw new Error('PaperCard: `dragHandle` and `renderLink` are mutually exclusive — a navigable tile cannot also be drag-reordered.')
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
    '--mrs-paper-fold': `${fold}px`,
    ...(hasAccent ? { '--mrs-stat-accent': accentColor } : {}),
    ...(tint != null ? { '--mrs-card-tint': tint } : {}),
  } as unknown as CSSProperties

  const contentStyle = {
    display: '-webkit-box',
    WebkitLineClamp: effectiveMaxLines,
    WebkitBoxOrient: 'vertical' as const,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '100%',
  }

  return (
    <div
      ref={ref}
      className={cn(
        'mrs-paper-card',
        hasAccent && `mrs-paper-card--accent-${accentPlacement}`,
        isHoverable && 'mrs-paper-card--hoverable',
        watermark && 'mrs-paper-card--watermark',
        dragHandle && 'mrs-paper-card--draggable',
        renderLink && 'mrs-paper-card--linked',
        tint != null && 'mrs-paper-card--tinted',
        className,
      )}
      style={style}
      onClick={onClick}
    >
      {renderLink
        ? renderLink({ className: 'mrs-paper-card__link-overlay', 'aria-labelledby': titleId })
        : null}
      {dragHandle ? (
        <button
          type="button"
          className="mrs-paper-card__drag-handle"
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
      {/* The sheet: clip-path cuts the notch; the fold triangle sits in it. */}
      <div className="mrs-paper-card__sheet" data-watermark={watermark}>
        <span className="mrs-paper-card__fold" aria-hidden="true" />
        <div className="mrs-paper-card__inner">
          <div className="mrs-paper-card__header">
            <div className="mrs-paper-card__head-text">
              <p className="mrs-paper-card__title" id={titleId} data-fit={titleFitStep(title) || undefined}>{title}</p>
              {subtitle ? <p className="mrs-paper-card__subtitle">{subtitle}</p> : null}
            </div>
          </div>

          {content != null ? (
            <div
              className="mrs-paper-card__body"
              data-align-x={contentAlignX}
              data-align-y={contentAlignY}
            >
              <div className="mrs-paper-card__content" style={contentStyle}>{content}</div>
            </div>
          ) : null}

          {hasFooter ? (
            <div className="mrs-paper-card__lower">
              {structuredFooter ? footerNode : (footer as ReactNode)}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
})
