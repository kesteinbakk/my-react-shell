import { forwardRef, useId, type ReactNode } from 'react'
import { cn } from './cn'
import {
  DynamicGridCard,
  type DynamicGridCardProps,
  type DynamicGridCardShape,
  type DynamicGridCardFooter,
  type DynamicGridCardFooterLine,
  type DynamicGridCardFooterLineType,
  type DynamicGridCardLinkProps,
} from './DynamicGridCard'

/** Proportion of the card — the same axis as {@link DynamicGridCardShape}. */
export type NavCardShape = DynamicGridCardShape
/** Structured footer — inherited from {@link DynamicGridCardFooter}. */
export type NavCardFooter = DynamicGridCardFooter
/** One left-side footer line — inherited from {@link DynamicGridCardFooterLine}. */
export type NavCardFooterLine = DynamicGridCardFooterLine
/** Leading glyph kind for a footer line — inherited from {@link DynamicGridCardFooterLineType}. */
export type NavCardFooterLineType = DynamicGridCardFooterLineType
/** Props the card hands the consumer's `renderLink` callback — see {@link DynamicGridCardLinkProps}. */
export type NavCardLinkProps = DynamicGridCardLinkProps

/**
 * Props for {@link NavCard}. The full {@link DynamicGridCardProps} surface **minus**
 * `icon` (unsupported) and `subtitle`/`children` (its only content is `title`).
 * Everything else — `sizeLimit`, `renderLink`, `footer`, `corner`, `tone`/`color` accent,
 * `watermark`, the drag seam, `hoverable`/`lift`, `shape` — is inherited.
 */
export interface NavCardProps
  extends Omit<DynamicGridCardProps, 'icon' | 'subtitle' | 'children' | 'title'> {
  /**
   * The nav tile's label. Rendered as the card's **centred main content** (passed into
   * `DynamicGridCard`'s body), not a header. **Required, no default** — it's user-facing
   * text, so the consumer supplies a translated string.
   */
  title: ReactNode
}

/**
 * A small **navigation-tile** variant of {@link DynamicGridCard}. It carries no `icon`;
 * its single `title` renders as the card's centred main content rather than a header.
 * Reach for it to build a grid of navigation links — pair it with `renderLink` for
 * whole-card navigation.
 *
 * Everything beyond icon/content is inherited from `DynamicGridCard`: typography/icon
 * scale follows the enclosing `DynamicCardGrid`'s `cardSize` (or `'md'` standalone),
 * `sizeLimit` to step its own width cap down, `renderLink` whole-card navigation (with
 * the accessible name auto-wired from `title`), `footer`, `corner`, `tone`/`color` accent,
 * `watermark`, the drag-reorder seam, `hoverable`/`lift`, and `shape`.
 */
export const NavCard = forwardRef<HTMLDivElement, NavCardProps>(function NavCard(
  { title, renderLink, className, ...props },
  ref,
) {
  // Preserve the card family's auto-wired accessible name. The title lives in the body
  // (not `DynamicGridCard`'s own header title), so give it an id and point the link
  // overlay at it via `aria-labelledby`.
  const titleId = useId()
  const wrappedRenderLink = renderLink
    ? (linkProps: NavCardLinkProps) => renderLink({ ...linkProps, 'aria-labelledby': titleId })
    : undefined

  return (
    <DynamicGridCard
      ref={ref}
      {...props}
      className={cn('mrs-nav-card', className)}
      renderLink={wrappedRenderLink}
    >
      <span className="mrs-nav-card__title" id={titleId}>
        {title}
      </span>
    </DynamicGridCard>
  )
})
