import { useContext, useId, type CSSProperties, type MouseEventHandler, type ReactNode } from 'react'
import { cn } from './cn'
import { resolveAccentColor } from './accent'
import type { AccentPlacement } from './accent'
import type { Tone } from './tone'
import { DynamicCardGrid, type DynamicCardGridProps } from './DynamicCardGrid'
import { DynamicCardGridSizeContext } from './DynamicGridCard'

/**
 * Props the tile hands the consumer's {@link DynamicNavCard.renderLink} callback to spread
 * onto its router `<Link>`. The tile supplies the overlay `className` and an auto-wired
 * `aria-labelledby` pointing at the tile's title; the consumer adds `to`/`params`.
 */
export interface DynamicNavCardLinkProps {
  className: string
  'aria-labelledby'?: string
}

/**
 * One navigation tile's content, returned by {@link DynamicNavCardsProps.getCard}. A
 * **lean** nav tile — its own element (it does **not** wrap `DynamicGridCard`) whose single
 * `title` renders as large, centred main content that scales up when the label is short and
 * steps down (clamped at two lines) as it grows.
 */
export interface DynamicNavCard {
  /**
   * The tile's label — its **centred main content**. **Required, no default** — it's
   * user-facing text, so the consumer supplies a translated string. Rendered large when the
   * label is short and stepped down as it lengthens, clamped at two lines.
   */
  title: ReactNode
  /**
   * Whole-tile navigation seam. The consumer renders its own router `<Link>` here, spreading
   * the supplied props, and the tile mounts it as a **full-bleed block-link overlay** so the
   * whole tile is a real, keyboard-activatable anchor — while the tile root stays a `<div>`
   * that owns its hover/border/focus states. The overlay's accessible name is auto-wired from
   * `title`. The shell imports no router; `to`/`params` type-safety lives at the call site:
   *
   * ```tsx
   * renderLink={(p) => <Link {...p} to="/setup/$id" params={{ id }} />}
   * ```
   */
  renderLink?: (linkProps: DynamicNavCardLinkProps) => ReactNode
  /** Click handler for a non-link tile. Sets the hoverable affordance by default. */
  onClick?: MouseEventHandler<HTMLDivElement>
  /**
   * Cursor + hover feedback + `:focus-visible` ring. Defaults to `true` when `onClick` is
   * set. The default hover feedback is a subtle background tint — see `lift` to additionally
   * move the tile. A `renderLink` tile always carries the linked hover state.
   */
  hoverable?: boolean
  /** Adds a `translateY` lift + stronger shadow on top of the hover tint. No effect unless hoverable. */
  lift?: boolean
  /** Semantic tone — drives an optional accent stripe. Default **none**. Ignored when `color` is set. */
  tone?: Tone
  /** Raw CSS color string for the accent stripe; overrides `tone`. */
  color?: string
  /** Where the accent reads when `tone`/`color` is set: a `'top'` stripe (default) or a `'left'` bar. */
  accentPlacement?: AccentPlacement
  /** Footer slot — a freeform node (e.g. a meta line) pinned to the bottom of the tile. */
  footer?: ReactNode
  /** Top-corner action slot (e.g. a menu trigger). Raised above the link overlay so it stays clickable. */
  corner?: ReactNode
  /**
   * Faint background watermark behind the content, centred horizontally and dropped a little
   * below centre. A **string** is an emoji/text watermark drawn via a pseudo-element; a
   * **`ReactNode`** renders in a faint art layer (the tile root becomes a `mrs-reveal-host`).
   */
  watermark?: ReactNode
  /**
   * For a **`ReactNode`** watermark only: scales the node's intrinsic `<svg>`/`<img>`/`<span>`
   * up to watermark scale, oversized and faint. Set `false` for a self-sized illustration
   * (e.g. `DrawerMark`). Default `true`.
   */
  autoscaleWatermark?: boolean
  /** Extra class on the tile root. */
  className?: string
}

/**
 * Props for {@link DynamicNavCards}. The full {@link DynamicCardGridProps} surface — items,
 * search / filter / sort, `cardSize`, `align`, loading / empty states, `minColumnWidth` —
 * **minus** `renderCard`, which is replaced by `getCard`: a map from each item to its
 * {@link DynamicNavCard} spec.
 */
export interface DynamicNavCardsProps<T> extends Omit<DynamicCardGridProps<T>, 'renderCard'> {
  /** Maps one item to its nav tile's content — the nav equivalent of the grid's `renderCard`. */
  getCard: (item: T) => DynamicNavCard
}

/**
 * `title` fit ladder: a short label renders very large (step `0`) and steps down through
 * progressively smaller sizes as it grows (`4` = smallest). Length-based; a non-string node
 * (no length to measure) takes the middle step. Pairs with the two-line clamp in CSS — the
 * smaller the font, the more of a long label the two-line box holds before it ellipsizes.
 */
function titleFit(title: ReactNode): 0 | 1 | 2 | 3 | 4 {
  if (typeof title !== 'string') return 2
  const n = title.trim().length
  if (n <= 6) return 0
  if (n <= 12) return 1
  if (n <= 20) return 2
  if (n <= 30) return 3
  return 4
}

/**
 * One independent nav tile — the single-tile primitive behind `DynamicNavCards`.
 * Exported so a consumer can place a lone tile outside the grid (e.g. wrapped in a
 * drag handle), keeping the exact tile look without a `DynamicGridCard`. Props are
 * one {@link DynamicNavCard}.
 */
export function NavTile({
  title,
  renderLink,
  onClick,
  hoverable,
  lift = false,
  tone,
  color,
  accentPlacement = 'top',
  footer,
  corner,
  watermark,
  autoscaleWatermark = true,
  className,
}: DynamicNavCard) {
  const titleId = useId()

  // Typography scale follows the enclosing grid's `cardSize` (via context), falling back to
  // `'md'` with no enclosing grid — a tile never overrides its own scale.
  const gridSize = useContext(DynamicCardGridSizeContext)
  const effectiveSize = gridSize ?? 'md'

  const isHoverable = hoverable ?? !!onClick

  const accentColor = resolveAccentColor(tone, color)
  const hasAccent = accentColor != null

  const watermarkIsString = typeof watermark === 'string'
  const hasWatermark = watermarkIsString ? watermark.length > 0 : watermark != null
  const hasArtWatermark = hasWatermark && !watermarkIsString

  // Preserve the overlay anchor's accessible name: point it at the title span.
  const wrappedRenderLink = renderLink
    ? (linkProps: DynamicNavCardLinkProps) => renderLink({ ...linkProps, 'aria-labelledby': titleId })
    : undefined

  const cssVars = { ...(hasAccent ? { '--mrs-stat-accent': accentColor } : {}) } as CSSProperties

  return (
    <div
      className={cn(
        'mrs-dynamic-nav-card',
        `mrs-dynamic-nav-card--${effectiveSize}`,
        hasAccent && `mrs-dynamic-nav-card--accent-${accentPlacement}`,
        isHoverable && 'mrs-dynamic-nav-card--hoverable',
        isHoverable && lift && 'mrs-dynamic-nav-card--lift',
        renderLink && 'mrs-dynamic-nav-card--linked',
        hasWatermark && 'mrs-dynamic-nav-card--watermark',
        hasArtWatermark && 'mrs-reveal-host',
        className,
      )}
      style={cssVars}
      data-watermark={watermarkIsString ? watermark : undefined}
      onClick={onClick}
    >
      {wrappedRenderLink
        ? wrappedRenderLink({ className: 'mrs-dynamic-nav-card__link-overlay' })
        : null}

      {hasArtWatermark ? (
        <div
          className={cn(
            'mrs-dynamic-nav-card__watermark',
            autoscaleWatermark && 'mrs-dynamic-nav-card__watermark--glyph',
          )}
          aria-hidden="true"
        >
          {watermark}
        </div>
      ) : null}

      {corner != null ? <div className="mrs-dynamic-nav-card__corner">{corner}</div> : null}

      <div className="mrs-dynamic-nav-card__body">
        <span className="mrs-dynamic-nav-card__title" id={titleId} data-fit={titleFit(title) || undefined}>
          {title}
        </span>
      </div>

      {footer != null ? <div className="mrs-dynamic-nav-card__footer">{footer}</div> : null}
    </div>
  )
}

/**
 * A **self-contained grid of navigation tiles**. Unlike the card family it renders its own
 * lean tile element (it does **not** use `DynamicGridCard`), but it drives that grid through
 * the same {@link DynamicCardGrid} — so it inherits its fluid `1fr` columns, `cardSize`
 * scale, and the built-in search / filter / sort toolbar. Each tile's single `title` grows
 * large when the label is short and steps down (clamped at two lines) as it lengthens, so a
 * grid of short nav labels reads big and bold.
 *
 * Drive it like `DynamicCardGrid`, but map each item to a tile with `getCard` instead of
 * `renderCard`:
 *
 * ```tsx
 * <DynamicNavCards
 *   items={areas}
 *   getKey={(a) => a.id}
 *   cardSize="md"
 *   getCard={(a) => ({ title: a.name, renderLink: (p) => <Link {...p} to={a.to} /> })}
 * />
 * ```
 */
export function DynamicNavCards<T>({ getCard, ...gridProps }: DynamicNavCardsProps<T>) {
  return <DynamicCardGrid {...gridProps} renderCard={(item) => <NavTile {...getCard(item)} />} />
}
