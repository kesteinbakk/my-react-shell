import type { CSSProperties, ReactNode } from 'react'
import { cn } from './cn'

/**
 * φ — the golden ratio. Exported so a consumer can size a layout against the exact
 * constant the card uses (a card's rendered height is `width / PHI`).
 *
 * The card is one scaling unit driven entirely by its width:
 *   Outer:      width : height  = φ : 1
 *   Bands:      upperH : lowerH  = φ : 1   (horizontal split)
 *   Upper band: leftW  : rightW  = 1 : φ   (narrow logo · wide title)
 *   Lower band: leftW  : rightW  = φ : 1   (wide footer · narrow badge)
 *
 * The internal splits live in components.css as `fr` ratios; the `1.6180339887fr`
 * literals there are this same φ, kept in lockstep with this constant.
 */
export const PHI = 1.6180339887

export type PhiCardSize = 'sm' | 'md' | 'lg' | 'xl'

const SIZE_WIDTH_PX: Record<PhiCardSize, number> = {
  sm: 180,
  md: 240,
  lg: 320,
  xl: 480,
}

export interface PhiCardProps {
  /** Width preset. Height auto-derives as width / φ. Default: `'md'`. */
  size?: PhiCardSize
  /**
   * Upper-left slot — narrow top-band column, centered (a logo / avatar). When
   * absent the column collapses and the title spans the full band.
   */
  upperLeft?: ReactNode
  /** Upper-right slot — wide top-band column, the title area (vertically centered). */
  upperRight?: ReactNode
  /** Lower-left slot — wide bottom-band column (a footer / meta line). */
  lowerLeft?: ReactNode
  /** Lower-right slot — narrow bottom-band column (a badge / action), right-aligned. */
  lowerRight?: ReactNode
  /** Color for a 3px left accent border. Pass any CSS color string (e.g. a token). */
  leftBorderColor?: string
  /** Click handler for the whole card. */
  onClick?: () => void
  /** Hover affordance (shadow lift + pointer). Defaults to `true` when `onClick` is set. */
  hoverable?: boolean
  /** Extra classes on the outer card, merged via `cn()`. */
  className?: string
  /** Draw inset separator lines: between the bands, and between the lower cells. */
  dividers?: boolean
  /** Center every slot's content on both axes, overriding the per-slot alignment. */
  centerContent?: boolean
  /**
   * Collapse to a single band: drop the lower band so the upper fills the height.
   * The outer φ:1 ratio is kept, so single-band cards match full ones in a grid.
   */
  singleBand?: boolean
}

type SlotAlign = 'center' | 'center-y' | 'end' | 'start'

interface SlotCellProps {
  children?: ReactNode
  align: SlotAlign
  /** Let content overflow horizontally instead of clipping (the lower-left line). */
  overflowX?: boolean
  divider?: boolean
}

function SlotCell({ children, align, overflowX, divider }: SlotCellProps) {
  return (
    <div
      className={cn(
        'mrs-phi-card__cell',
        `mrs-phi-card__cell--${align}`,
        overflowX ? 'mrs-phi-card__cell--overflow-x' : 'mrs-phi-card__cell--clip',
        divider && 'mrs-phi-card__cell--divider',
      )}
    >
      {children}
    </div>
  )
}

/**
 * Golden-ratio–locked card with four fixed slots and φ-proportioned bands. Width is
 * the only size knob — height and every slot size derive from it. See the components
 * guide for the slot map and examples.
 */
export function PhiCard({
  size = 'md',
  upperLeft,
  upperRight,
  lowerLeft,
  lowerRight,
  leftBorderColor,
  onClick,
  hoverable,
  className,
  dividers = false,
  centerContent = false,
  singleBand = false,
}: PhiCardProps) {
  const width = SIZE_WIDTH_PX[size]
  const height = width / PHI
  const isHoverable = hoverable ?? !!onClick
  const hasUpperLeft = !!upperLeft

  const style: CSSProperties = {
    width: `${width}px`,
    height: `${height}px`,
    ...(leftBorderColor ? { borderLeft: `3px solid ${leftBorderColor}` } : {}),
  }

  return (
    <div
      className={cn(
        'mrs-phi-card',
        singleBand && 'mrs-phi-card--single',
        isHoverable && 'mrs-phi-card--hoverable',
        className,
      )}
      style={style}
      onClick={onClick}
    >
      {/* Upper band — 1:φ split (narrow logo · wide title); collapses to one
          column when there's no upper-left slot, so the title spans the band. */}
      <div
        className={cn(
          'mrs-phi-card__band',
          hasUpperLeft ? 'mrs-phi-card__band--upper' : 'mrs-phi-card__band--upper-full',
        )}
      >
        {hasUpperLeft ? (
          <SlotCell align="center" divider={dividers}>
            {upperLeft}
          </SlotCell>
        ) : null}
        <SlotCell align={centerContent ? 'center' : 'center-y'}>{upperRight}</SlotCell>
      </div>

      {/* Lower band — φ:1 split (wide footer · narrow badge). Dropped in
          single-band mode; the left cell allows horizontal overflow so a long
          line (e.g. a date) stays readable. */}
      {!singleBand ? (
        <div
          className={cn(
            'mrs-phi-card__band',
            'mrs-phi-card__band--lower',
            dividers && 'mrs-phi-card__band--divider-top',
          )}
        >
          <SlotCell align={centerContent ? 'center' : 'start'} overflowX divider={dividers}>
            {lowerLeft}
          </SlotCell>
          <SlotCell align={centerContent ? 'center' : 'end'}>{lowerRight}</SlotCell>
        </div>
      ) : null}
    </div>
  )
}
