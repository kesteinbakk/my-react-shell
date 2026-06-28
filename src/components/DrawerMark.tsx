import { cn } from './cn'
import { RevealMark } from './RevealMark'

export interface DrawerMarkProps {
  /** Force the open drawer regardless of hover — e.g. to mark the active route. */
  open?: boolean
  className?: string
}

/**
 * Closed drawer — a solid isometric box with a knob.
 */
function ClosedDrawer() {
  return (
    <svg className="mrs-drawer-mark__art" viewBox="0 0 150 128" aria-hidden="true">
      <polygon className="mrs-drawer-mark__side mrs-drawer-mark__edge" points="18,46 70,72 70,106 18,80" />
      <polygon className="mrs-drawer-mark__top mrs-drawer-mark__edge" points="70,20 122,46 70,72 18,46" />
      <polygon className="mrs-drawer-mark__front mrs-drawer-mark__edge" points="70,72 122,46 122,80 70,106" />
      <circle className="mrs-drawer-mark__knob" cx="96" cy="76" r="3" />
    </svg>
  )
}

/**
 * Open drawer — the same box with its tray pulled out: a dark slot, gray inner walls and floor,
 * and one sheet lying flat inside.
 */
function OpenDrawer() {
  return (
    <svg className="mrs-drawer-mark__art" viewBox="0 0 150 128" aria-hidden="true">
      <polygon className="mrs-drawer-mark__top mrs-drawer-mark__edge" points="66,28 118,54 66,80 14,54" />
      <polygon className="mrs-drawer-mark__side mrs-drawer-mark__edge" points="14,54 66,80 66,108 14,82" />
      <polygon className="mrs-drawer-mark__slot" points="66,80 118,54 118,82 66,108" />
      <polygon className="mrs-drawer-mark__wall mrs-drawer-mark__edge" points="68,80 116,56 116,65 68,89" />
      <polygon className="mrs-drawer-mark__wall mrs-drawer-mark__edge" points="116,56 142,69 142,78 116,65" />
      <polygon className="mrs-drawer-mark__floor mrs-drawer-mark__edge" points="68,89 116,65 142,78 94,102" />
      <polygon className="mrs-drawer-mark__sheet mrs-drawer-mark__edge" points="82,87 112,72 128,80 98,95" />
      <line className="mrs-drawer-mark__line" x1="96" y1="84" x2="114" y2="79" />
      <line className="mrs-drawer-mark__line" x1="99" y1="88" x2="117" y2="83" />
      <polygon className="mrs-drawer-mark__side mrs-drawer-mark__edge" points="94,93 68,80 68,107 94,120" />
      <polygon className="mrs-drawer-mark__front mrs-drawer-mark__edge" points="94,93 142,69 142,96 94,120" />
      <circle className="mrs-drawer-mark__knob" cx="118" cy="94" r="3" />
    </svg>
  )
}

/**
 * Drawer mark — an isometric drawer box that rests closed and slides open on hover, built on the
 * {@link RevealMark} seam. Drop it into a card's `watermark` slot: it renders faint behind the
 * content and opens when the card is hovered, or stays open when `open` is set (active route).
 *
 * Fully theme-token-driven (surfaces, borders, text) — the gray interior comes from a
 * `color-mix` of `--color-text-primary` into the surface, so it inverts naturally between light
 * and dark mode. Decorative only (`aria-hidden`); pass real labels through the card's `title`.
 */
export function DrawerMark({ open, className }: DrawerMarkProps) {
  return (
    <RevealMark
      open={open}
      className={cn('mrs-drawer-mark', className)}
      closed={<ClosedDrawer />}
      revealed={<OpenDrawer />}
    />
  )
}
