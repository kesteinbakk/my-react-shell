import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, isValidElement, useId } from 'react';
import { cn } from './cn';
/** φ — the golden ratio. The dynamic card's shape is `aspect-ratio: φ : 1` (or `φ² : 1` for landscape). */
const PHI = 1.6180339887;
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
 * Fluid card for the {@link DynamicCardGrid}: it stretches to `width: 100%` of its
 * grid column and inherits the grid's max-width cap, keeping the golden-ratio shape via
 * `aspect-ratio`. Accepts optional named slots (`title`, `subtitle`, `figure`, `footer`)
 * with the primary content passed as `children`.
 *
 * It can act as a **whole-card navigation link** without the shell depending on any router:
 * pass `renderLink` and the card mounts the consumer's `<Link>` as a full-bleed block-link
 * overlay, with `corner` controls raised above it so they stay independently clickable.
 */
export const DynamicGridCard = forwardRef(function DynamicGridCard({ size, shape = 'standard', title, subtitle, figure, hoverable, watermark, corner, footer, renderLink, tint, className, style, children, ...props }, ref) {
    const minWidth = size ? DYNAMIC_GRID_CARD_MIN_WIDTH[size] : undefined;
    const maxWidth = size ? DYNAMIC_GRID_CARD_MAX_WIDTH[size] : undefined;
    const aspectRatio = shape === 'landscape' ? `${PHI * PHI} / 1` : `${PHI} / 1`;
    // Auto-wire the overlay anchor's accessible name from the card title.
    const titleId = useId();
    const hasTitle = title != null;
    const hasHeader = title != null || subtitle != null || figure != null;
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
        ...(tint != null ? { '--mrs-card-tint': tint } : {}),
        ...style,
    };
    return (_jsxs("div", { ref: ref, className: cn('mrs-dynamic-grid-card', hoverable && 'mrs-dynamic-grid-card--hoverable', renderLink && 'mrs-dynamic-grid-card--linked', hasWatermark && 'mrs-dynamic-grid-card--watermark', hasArtWatermark && 'mrs-reveal-host', tint != null && 'mrs-dynamic-grid-card--tinted', className), style: cssVars, "data-watermark": watermarkIsString ? watermark : undefined, ...props, children: [renderLink
                ? renderLink({
                    className: 'mrs-dynamic-grid-card__link-overlay',
                    ...(hasTitle ? { 'aria-labelledby': titleId } : {}),
                })
                : null, hasArtWatermark ? (_jsx("div", { className: "mrs-dynamic-grid-card__watermark", "aria-hidden": "true", children: watermark })) : null, corner != null ? _jsx("div", { className: "mrs-dynamic-grid-card__corner", children: corner }) : null, hasHeader ? (_jsxs("div", { className: "mrs-dynamic-grid-card__header", children: [figure != null ? _jsx("div", { className: "mrs-dynamic-grid-card__figure", children: figure }) : null, title != null || subtitle != null ? (_jsxs("div", { className: "mrs-dynamic-grid-card__heading", children: [title != null ? (_jsx("div", { className: "mrs-dynamic-grid-card__title", id: hasTitle ? titleId : undefined, children: title })) : null, subtitle != null ? _jsx("div", { className: "mrs-dynamic-grid-card__subtitle", children: subtitle }) : null] })) : null] })) : null, _jsx("div", { className: "mrs-dynamic-grid-card__body", children: children }), hasFooter ? (_jsx("div", { className: "mrs-dynamic-grid-card__footer", children: structuredFooter ? _jsx(StructuredFooter, { footer: structuredFooter }) : footer })) : null] }));
});
