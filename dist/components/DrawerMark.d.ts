export interface DrawerMarkProps {
    /** Force the open drawer regardless of hover — e.g. to mark the active route. */
    open?: boolean;
    className?: string;
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
export declare function DrawerMark({ open, className }: DrawerMarkProps): import("react").JSX.Element;
