import type { ReactNode } from 'react';
/**
 * φ — the golden ratio. Exported so a consumer can size a layout against the exact
 * constant the card uses (a card's rendered height is `width / PHI`).
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
/** Leading glyph for a footer line — the kit ships these (no icon registry needed). */
export type PhiCardFooterLineType = 'date' | 'time' | 'check';
/** One left-side footer line: text with an optional kit-shipped leading glyph. */
export interface PhiCardFooterLine {
    text: ReactNode;
    type?: PhiCardFooterLineType;
}
/** Structured footer: meta lines on the left, badges stacked on the right. */
export interface PhiCardFooter {
    /** Left column, evenly spread vertically. Cap by size: sm 1 · md 2 · lg 3 · xl 5. */
    lines?: PhiCardFooterLine[];
    /** Right column, stacked + evenly spread. Cap by size: sm/md 1 · lg 2 · xl 4. */
    badges?: ReactNode[];
}
export interface PhiCardProps {
    /**
     * Top-section heading — typically a title + subtitle. The card pads it (no padding
     * of your own); it's vertically centered and flush-left at the split (or the edge
     * padding when there's no figure). With `image`/`icon` present it's the wide content
     * column of the 1 : φ top split.
     */
    upper?: ReactNode;
    /** Main content, stacked under `upper` in the same centered, flush-left text body. */
    content?: ReactNode;
    /** Image URL — rendered full-bleed (`object-fit: cover`) as the top section. */
    image?: string;
    /** Alt text for `image`. Defaults to `''` (decorative). */
    imageAlt?: string;
    /**
     * Icon / figure node for the top section. Alone it's centered; with `upper`/`content`
     * the top splits 1 : φ — a narrow figure column (centered so the border→figure gap
     * equals the figure→content gap) and the content column. Pair with `iconFill` to fill.
     */
    icon?: ReactNode;
    /**
     * Scale `icon` to **fill** its column (aspect preserved, a small inset, never
     * overflows), overriding the icon node's own width/height.
     */
    iconFill?: boolean;
    /**
     * Freeform bottom section (a footer) — the bring-your-own escape hatch. Use `footer`
     * for the structured meta-lines + badges layout. **Throws if both are given.** When
     * neither is present the card **collapses** to the top band's height (`width / φ²`).
     */
    lower?: ReactNode;
    /**
     * Structured footer: `lines` (left, with optional `date`/`time`/`check` glyphs) and
     * `badges` (right, stacked) — both evenly spread vertically. Per-size caps throw in
     * dev (lines: sm 1·md 2·lg 3·xl 5 · badges: sm/md 1·lg 2·xl 4).
     */
    footer?: PhiCardFooter;
    /** Size preset — sets the width (height = width / φ) and a base inherited font-size. */
    size?: PhiCardSize;
    /** Actions for the built-in top-right ⋮ overflow menu. Ignored when `corner` is set. */
    actions?: PhiCardAction[];
    /** Override the ⋮ trigger glyph. */
    menuIcon?: ReactNode;
    /** Accessible name for the menu trigger. Default: `'Actions'`. */
    menuLabel?: string;
    /** Bring-your-own top-right node; replaces the built-in `actions` menu. */
    corner?: ReactNode;
    /** Color for a 3px left accent border. Pass any CSS color string. */
    leftBorderColor?: string;
    /** Click handler for the whole card. The corner area never triggers it. */
    onClick?: () => void;
    /** Hover affordance. Defaults to `true` when `onClick` is set. */
    hoverable?: boolean;
    /** Extra classes on the outer card, merged via `cn()`. */
    className?: string;
}
/**
 * Golden-ratio card. Width is the only size knob; height (= width / φ), the φ:1 split,
 * and a base font-size derive from it. The card owns its padding: a figure (`icon` /
 * `image`) fills its column, the text body is centered and flush-left at the split, and
 * the footer (`footer` structured, or `lower` freeform) spreads its rows evenly. The
 * bottom collapses (card shortens) when there's no footer.
 */
export declare function PhiCard({ upper, content, image, imageAlt, icon, iconFill, lower, footer, size, actions, menuIcon, menuLabel, corner, leftBorderColor, onClick, hoverable, className, }: PhiCardProps): import("react").JSX.Element;
