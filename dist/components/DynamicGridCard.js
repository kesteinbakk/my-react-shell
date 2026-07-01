import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, forwardRef, isValidElement, useContext, useId, useRef, useState } from 'react';
import { cn } from './cn';
import { resolveAccentColor } from './accent';
import { isIconConfig, resolveCardIconPlacement } from './card-icon';
/** φ — the golden ratio. The dynamic card's shape is `aspect-ratio: φ : 1` (or `φ² : 1` for landscape). */
const PHI = 1.6180339887;
/**
 * Carries the enclosing `DynamicCardGrid`'s `cardSize` down to each `DynamicGridCard` so it
 * can resolve its own effective size (for the icon/title scale below) without the consumer
 * having to repeat `size` on every card — the grid is still what drives the column width.
 */
export const DynamicCardGridSizeContext = createContext(undefined);
export const DYNAMIC_GRID_CARD_MIN_WIDTH = {
    sm: 180,
    md: 240,
    lg: 400,
};
export const DYNAMIC_GRID_CARD_MAX_WIDTH = {
    sm: 210,
    md: 320,
    lg: 500,
};
/** Default grip glyph — vertical stripes, for the right-edge centred drag handle. */
const DEFAULT_DRAG_HANDLE = (_jsxs("svg", { width: "15", height: "36", viewBox: "0 0 15 36", fill: "currentColor", "aria-hidden": "true", opacity: "0.4", children: [_jsx("rect", { x: "1", y: "0", width: "4", height: "36", rx: "2" }), _jsx("rect", { x: "10", y: "0", width: "4", height: "36", rx: "2" })] }));
// ── Footer glyphs ───────────────────────────────────────────────────────────
const FOOTER_GLYPHS = {
    date: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { d: "M16 2v4M8 2v4M3 10h18" })] })),
    time: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 7v5l3 2" })] })),
    check: (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M20 6 9 17l-5-5" }) })),
};
/**
 * Discriminate the structured `{ lines, badges }` footer from a freeform `ReactNode`.
 * A structured footer is a plain object carrying `lines`/`badges`; a React element, array,
 * or primitive is freeform.
 */
function isStructuredFooter(footer) {
    return (typeof footer === 'object' &&
        footer !== null &&
        !isValidElement(footer) &&
        !Array.isArray(footer) &&
        ('lines' in footer || 'badges' in footer));
}
function StructuredFooter({ footer }) {
    const lines = footer.lines ?? [];
    const badges = footer.badges ?? [];
    const rowCount = Math.max(lines.length, badges.length);
    return (_jsx("div", { className: "mrs-phi-card__footer", children: Array.from({ length: rowCount }, (_, i) => {
            const line = lines[i];
            const badgeRow = badges[i];
            return (_jsxs("div", { className: "mrs-phi-card__footer-row", children: [_jsxs("span", { className: "mrs-phi-card__footer-line", children: [line?.type ? (_jsx("span", { className: "mrs-phi-card__footer-icon", children: FOOTER_GLYPHS[line.type] })) : null, line ? _jsx("span", { className: "mrs-phi-card__footer-text", children: line.text }) : null] }), badgeRow != null ? _jsx("span", { className: "mrs-phi-card__footer-badge", children: badgeRow }) : null] }, i));
        }) }));
}
/**
 * `sm`-size title auto-fit: a long string title steps the font size down (3 steps) so it
 * doesn't blow out the card's reserved heading height. Returns `0` (no reduction) through
 * `3` (smallest); a non-string title (e.g. a `ReactNode`) always gets `0` since there's no
 * length to measure. Thresholds tuned for the `sm` column's ~180–210px width.
 */
function titleFitStep(title) {
    if (typeof title !== 'string')
        return 0;
    const n = title.length;
    if (n > 34)
        return 3;
    if (n > 24)
        return 2;
    if (n > 14)
        return 1;
    return 0;
}
/**
 * Fluid card for the {@link DynamicCardGrid}: it stretches to `width: 100%` of its
 * grid column and inherits the grid's max-width cap, keeping the golden-ratio shape via
 * `aspect-ratio`. Accepts optional named slots (`title`, `subtitle`, `icon`, `footer`)
 * with the primary content passed as `children`.
 *
 * It can act as a **whole-card navigation link** without the shell depending on any router:
 * pass `renderLink` and the card mounts the consumer's `<Link>` as a full-bleed block-link
 * overlay, with `corner` controls raised above it so they stay independently clickable.
 */
export const DynamicGridCard = forwardRef(function DynamicGridCard({ size, shape = 'standard', title, subtitle, icon, hoverable, lift = false, watermark, autoscaleWatermark = true, corner, footer, renderLink, showDragHandle, dragHandle, dragHandleProps, dragHandleLabel, dragWholeCard, tone, color, accentPlacement = 'top', className, style, children, ...props }, ref) {
    // A visible grip shows when toggled on, or when a custom handle node is supplied.
    const hasDragHandle = showDragHandle || dragHandle != null;
    // Mirrors StatCard/ContentCard: a card with an `onClick` is hoverable by default — without
    // this, a clickable `dragWholeCard` card never gets `--hoverable`, so the drag-whole cursor
    // rules (keyed off that class) read it as drag-only and show `grab` instead of `pointer`.
    const isHoverable = hoverable ?? !!props.onClick;
    const [isHolding, setIsHolding] = useState(false);
    const holdTimerRef = useRef(null);
    function startHold() {
        holdTimerRef.current = setTimeout(() => setIsHolding(true), 200);
    }
    function clearHold() {
        if (holdTimerRef.current) {
            clearTimeout(holdTimerRef.current);
            holdTimerRef.current = null;
        }
        setIsHolding(false);
    }
    // The card's own `size` wins; absent that, fall back to the enclosing grid's `cardSize`
    // (provided via context) so the icon/title scale below resolves without the consumer
    // having to repeat `size` on every card.
    const gridSize = useContext(DynamicCardGridSizeContext);
    const effectiveSize = size ?? gridSize;
    const minWidth = size ? DYNAMIC_GRID_CARD_MIN_WIDTH[size] : undefined;
    const maxWidth = size ? DYNAMIC_GRID_CARD_MAX_WIDTH[size] : undefined;
    const aspectRatio = shape === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`;
    // No accent unless tone/color is given.
    const accentColor = resolveAccentColor(tone, color);
    const hasAccent = accentColor != null;
    // Resolve the `icon` shorthand to its full `{ content, placement }` form.
    const hasIcon = icon != null;
    const iconContent = hasIcon ? (isIconConfig(icon) ? icon.content : icon) : null;
    const requestedIconPlacement = hasIcon && isIconConfig(icon) ? (icon.placement ?? 'title') : 'title';
    const iconPlacement = resolveCardIconPlacement(requestedIconPlacement, title != null || subtitle != null);
    const isTitleIcon = hasIcon && iconPlacement === 'title';
    const isCornerIcon = hasIcon && (iconPlacement === 'upperLeft' || iconPlacement === 'upperRight' || iconPlacement === 'lowerLeft' || iconPlacement === 'lowerRight');
    const isCenterIcon = hasIcon && iconPlacement === 'center';
    // Auto-wire the overlay anchor's accessible name from the card title.
    const titleId = useId();
    const hasTitle = title != null;
    const hasHeader = title != null || subtitle != null || isTitleIcon;
    // A string watermark uses the emoji `::after` path; any other node renders in an art layer.
    const watermarkIsString = typeof watermark === 'string';
    const hasWatermark = watermarkIsString ? watermark.length > 0 : watermark != null;
    const hasArtWatermark = hasWatermark && !watermarkIsString;
    const structuredFooter = isStructuredFooter(footer) ? footer : null;
    const hasFooter = structuredFooter
        ? (structuredFooter.lines?.length ?? 0) > 0 || (structuredFooter.badges?.length ?? 0) > 0
        : footer != null;
    const cssVars = {
        '--mrs-dynamic-grid-card-aspect-ratio': aspectRatio,
        ...(minWidth != null ? { '--mrs-dynamic-grid-card-min-width': `${minWidth}px` } : {}),
        ...(maxWidth != null ? { '--mrs-dynamic-grid-card-max-width': `${maxWidth}px` } : {}),
        ...(hasAccent ? { '--mrs-stat-accent': accentColor } : {}),
        ...style,
    };
    // Dev guards
    if (process.env.NODE_ENV !== 'production') {
        if (iconPlacement === 'upperRight' && corner != null) {
            throw new Error("DynamicGridCard: icon placement 'upperRight' collides with the `corner` slot — both render in the top-right corner. Use a different icon placement (e.g. 'upperLeft') or drop `corner`.");
        }
        if (isCenterIcon && children != null) {
            throw new Error("DynamicGridCard: icon placement 'center' replaces the card body — it can't combine with `children`. Drop one of the two.");
        }
    }
    return (_jsxs("div", { ref: ref, className: cn('mrs-dynamic-grid-card', effectiveSize && `mrs-dynamic-grid-card--${effectiveSize}`, hasAccent && `mrs-dynamic-grid-card--accent-${accentPlacement}`, isHoverable && 'mrs-dynamic-grid-card--hoverable', isHoverable && lift && 'mrs-dynamic-grid-card--lift', renderLink && 'mrs-dynamic-grid-card--linked', hasDragHandle && 'mrs-dynamic-grid-card--draggable', hasWatermark && 'mrs-dynamic-grid-card--watermark', hasArtWatermark && 'mrs-reveal-host', dragWholeCard && 'mrs-dynamic-grid-card--drag-whole', dragWholeCard && isHolding && 'mrs-dynamic-grid-card--holding', className), style: cssVars, "data-watermark": watermarkIsString ? watermark : undefined, ...props, ...(dragWholeCard ? {
            ...dragHandleProps,
            onPointerDown: (e) => {
                startHold();
                dragHandleProps?.onPointerDown?.(e);
            },
            onPointerUp: (e) => {
                clearHold();
                dragHandleProps?.onPointerUp?.(e);
            },
            onPointerLeave: (e) => {
                clearHold();
                dragHandleProps?.onPointerLeave?.(e);
            },
        } : {}), children: [renderLink
                ? renderLink({
                    className: 'mrs-dynamic-grid-card__link-overlay',
                    ...(hasTitle ? { 'aria-labelledby': titleId } : {}),
                })
                : null, hasArtWatermark ? (_jsx("div", { className: cn('mrs-dynamic-grid-card__watermark', autoscaleWatermark && 'mrs-dynamic-grid-card__watermark--glyph'), "aria-hidden": "true", children: watermark })) : null, hasDragHandle ? (_jsx("button", { type: "button", className: "mrs-dynamic-grid-card__drag-handle", "aria-label": dragHandleLabel, ...dragHandleProps, onClick: (e) => {
                    e.stopPropagation();
                    dragHandleProps?.onClick?.(e);
                }, children: dragHandle ?? DEFAULT_DRAG_HANDLE })) : null, corner != null ? _jsx("div", { className: "mrs-dynamic-grid-card__corner", children: corner }) : null, isCornerIcon ? (_jsx("div", { className: cn('mrs-dynamic-grid-card__icon', `mrs-dynamic-grid-card__icon--${iconPlacement}`), children: iconContent })) : null, hasHeader ? (_jsxs("div", { className: "mrs-dynamic-grid-card__header", children: [isTitleIcon ? _jsx("div", { className: "mrs-dynamic-grid-card__icon", children: iconContent }) : null, title != null || subtitle != null ? (_jsxs("div", { className: "mrs-dynamic-grid-card__heading", children: [title != null ? (_jsx("div", { className: "mrs-dynamic-grid-card__title", id: hasTitle ? titleId : undefined, "data-fit": titleFitStep(title) || undefined, children: title })) : null, subtitle != null ? _jsx("div", { className: "mrs-dynamic-grid-card__subtitle", children: subtitle }) : null] })) : null] })) : null, _jsx("div", { className: cn('mrs-dynamic-grid-card__body', isCenterIcon && 'mrs-dynamic-grid-card__body--icon-center'), children: isCenterIcon ? iconContent : children }), hasFooter ? (_jsx("div", { className: "mrs-dynamic-grid-card__footer", children: structuredFooter ? _jsx(StructuredFooter, { footer: structuredFooter }) : footer })) : null] }));
});
