import type { ReactNode } from 'react';
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
export declare const PHI = 1.6180339887;
export type PhiCardSize = 'sm' | 'md' | 'lg' | 'xl';
export interface PhiCardProps {
    /** Width preset. Height auto-derives as width / φ. Default: `'md'`. */
    size?: PhiCardSize;
    /**
     * Upper-left slot — narrow top-band column, centered (a logo / avatar). When
     * absent the column collapses and the title spans the full band.
     */
    upperLeft?: ReactNode;
    /** Upper-right slot — wide top-band column, the title area (vertically centered). */
    upperRight?: ReactNode;
    /** Lower-left slot — wide bottom-band column (a footer / meta line). */
    lowerLeft?: ReactNode;
    /** Lower-right slot — narrow bottom-band column (a badge / action), right-aligned. */
    lowerRight?: ReactNode;
    /** Color for a 3px left accent border. Pass any CSS color string (e.g. a token). */
    leftBorderColor?: string;
    /** Click handler for the whole card. */
    onClick?: () => void;
    /** Hover affordance (shadow lift + pointer). Defaults to `true` when `onClick` is set. */
    hoverable?: boolean;
    /** Extra classes on the outer card, merged via `cn()`. */
    className?: string;
    /** Draw inset separator lines: between the bands, and between the lower cells. */
    dividers?: boolean;
    /** Center every slot's content on both axes, overriding the per-slot alignment. */
    centerContent?: boolean;
    /**
     * Collapse to a single band: drop the lower band so the upper fills the height.
     * The outer φ:1 ratio is kept, so single-band cards match full ones in a grid.
     */
    singleBand?: boolean;
}
/**
 * Golden-ratio–locked card with four fixed slots and φ-proportioned bands. Width is
 * the only size knob — height and every slot size derive from it. See the components
 * guide for the slot map and examples.
 */
export declare function PhiCard({ size, upperLeft, upperRight, lowerLeft, lowerRight, leftBorderColor, onClick, hoverable, className, dividers, centerContent, singleBand, }: PhiCardProps): import("react").JSX.Element;
