import type { ReactNode } from 'react';
/**
 * φ — the golden ratio. Exported so a consumer can size a layout against the exact
 * constant the card uses (a card's rendered height is `width / PHI`).
 *
 * The card is one scaling unit driven entirely by its width:
 *   Outer:  width : height  = φ : 1
 *   Split:  upperH : lowerH  = φ : 1   (the two sections)
 *
 * The split lives in components.css as an `fr` ratio; the `1.6180339887fr` literal
 * there is this same φ, kept in lockstep with this constant.
 */
export declare const PHI = 1.6180339887;
export type PhiCardSize = 'sm' | 'md' | 'lg' | 'xl';
/** One entry in the built-in top-right overflow menu. */
export interface PhiCardAction {
    /** Leading glyph — you bring it (the kit ships no icon registry). Optional. */
    icon?: ReactNode;
    /** Row text + accessible name. You translate it (the kit never imports i18n). */
    label: string;
    /** Invoked when the item is chosen. */
    onSelect: () => void;
    /** Destructive styling (a delete, etc.). */
    destructive?: boolean;
    disabled?: boolean;
}
export interface PhiCardProps {
    /**
     * Top section. You own its content and inner layout; it's full-bleed (a single
     * cell that stretches your node to fill both axes — a figure/image fills it
     * edge-to-edge). Add your own padding for inset content. Ignored when `image` or
     * `icon` is set — those render the top section instead.
     */
    upper?: ReactNode;
    /**
     * Image URL — rendered full-bleed (full width, `object-fit: cover`) as the top
     * section, giving the classic figure-over-content card with `lower` below. Takes
     * precedence over `icon` and `upper`.
     */
    image?: string;
    /** Alt text for `image`. Defaults to `''` (treated as decorative). */
    imageAlt?: string;
    /**
     * Icon / figure node — rendered centered, full-width, as the top section (used
     * when there's no `image`). Takes precedence over `upper`.
     */
    icon?: ReactNode;
    /**
     * Bottom section, same contract as `upper`. When it's empty (absent / `null` /
     * `false`) the section is **not rendered at all** — the top section fills the
     * whole card, and the outer φ:1 ratio is kept so collapsed cards still line up
     * in a grid.
     */
    lower?: ReactNode;
    /** Width preset. Height auto-derives as width / φ. Default: `'md'`. */
    size?: PhiCardSize;
    /**
     * Actions for the built-in top-right overflow menu — a ⋮ trigger that opens a
     * dropdown of these items. Empty / absent → no trigger is rendered. Ignored when
     * `corner` is set (that replaces the built-in menu).
     */
    actions?: PhiCardAction[];
    /** Override the ⋮ trigger glyph (its own chrome — defaults to a vertical ellipsis). */
    menuIcon?: ReactNode;
    /** Accessible name for the menu trigger. Default: `'Actions'`. */
    menuLabel?: string;
    /**
     * Bring-your-own top-right node (your own icon buttons, a custom menu, …). Replaces
     * the built-in `actions` menu entirely; rendered only when set.
     */
    corner?: ReactNode;
    /** Color for a 3px left accent border. Pass any CSS color string (e.g. a token). */
    leftBorderColor?: string;
    /** Click handler for the whole card. The corner area never triggers it. */
    onClick?: () => void;
    /** Hover affordance (shadow lift + pointer). Defaults to `true` when `onClick` is set. */
    hoverable?: boolean;
    /** Extra classes on the outer card, merged via `cn()`. */
    className?: string;
}
/**
 * Golden-ratio card with two consumer-owned sections. Width is the only size knob —
 * height (width / φ) and the φ:1 section split derive from it. The bottom section
 * collapses when empty; an optional top-right overflow menu takes consumer-supplied
 * actions. See the components guide for examples.
 */
export declare function PhiCard({ upper, image, imageAlt, icon, lower, size, actions, menuIcon, menuLabel, corner, leftBorderColor, onClick, hoverable, className, }: PhiCardProps): import("react").JSX.Element;
