import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, isValidElement, useId } from 'react';
import { cn } from './cn';
import { resolveAccentColor } from './accent';
/**
 * Discriminate the structured `{ lines, badges }` footer from a freeform `ReactNode`.
 * A React element, array, or primitive is freeform; a plain object carrying `lines`/`badges`
 * is structured.
 */
function isStructuredFooter(footer) {
    return (typeof footer === 'object' &&
        footer !== null &&
        !isValidElement(footer) &&
        !Array.isArray(footer) &&
        ('lines' in footer || 'badges' in footer));
}
const SIZE_WIDTH_PX = {
    sm: 134,
    md: 168,
    lg: 210,
    xl: 264,
    xxl: 320,
};
/** Folded-corner size per preset (px) — scales with the sheet so the dog-ear reads at every size. */
const SIZE_FOLD_PX = {
    sm: 22,
    md: 26,
    lg: 30,
    xl: 34,
    xxl: 40,
};
const SIZE_FONT_REM = {
    // `sm` shares `md`'s font-size — the smaller sheet keeps readable text, just less of it.
    sm: 0.75,
    md: 0.75,
    lg: 0.875,
    xl: 1.0,
    xxl: 1.25,
};
// A4 / ISO 216 portrait aspect: height = width × √2.
const SQRT2 = 1.4142135624;
const DEFAULT_DRAG_HANDLE = (_jsxs("svg", { width: "64", height: "12", viewBox: "0 0 64 12", fill: "currentColor", "aria-hidden": "true", opacity: "0.4", children: [_jsx("rect", { x: "0", y: "1", width: "64", height: "3", rx: "1.5" }), _jsx("rect", { x: "0", y: "8", width: "64", height: "3", rx: "1.5" })] }));
const FOOTER_GLYPHS = {
    date: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { d: "M16 2v4M8 2v4M3 10h18" })] })),
    time: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 7v5l3 2" })] })),
    check: (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M20 6 9 17l-5-5" }) })),
};
/**
 * Paper card — a small **preview / thumbnail** card styled as a dog-eared sheet of paper at
 * A4 portrait proportions (`height = width × √2`). The folded top-right corner is genuinely
 * cut out of the sheet (`clip-path`) with a folded triangle sitting in the notch; the drop
 * shadow is carried on the wrapper via `filter: drop-shadow()` so it follows the dog-eared
 * silhouette rather than being clipped away.
 *
 * Optional `tone`/`color` adds an accent stripe (none by default). Shares the card-family
 * footer, watermark, hover-lift, drag-handle, and `renderLink` block-link seams.
 */
export const PaperCard = forwardRef(function PaperCard({ title, subtitle, content, contentAlignX = 'left', contentAlignY = 'top', maxLines, tone, color, accentPlacement = 'top', footer, corner, watermark, size = 'md', onClick, hoverable, showDragHandle, dragHandle, dragHandleProps, dragHandleLabel, renderLink, className, style: styleProp, }, ref) {
    // A visible grip shows when toggled on, or when a custom handle node is supplied.
    const hasDragHandle = showDragHandle || dragHandle != null;
    const width = SIZE_WIDTH_PX[size];
    const height = width * SQRT2;
    const fold = SIZE_FOLD_PX[size];
    const isHoverable = hoverable ?? !!onClick;
    // Auto-wire the overlay anchor's accessible name from the (required) card title.
    const titleId = useId();
    const structuredFooter = isStructuredFooter(footer) ? footer : null;
    const hasFooter = structuredFooter
        ? (structuredFooter.lines?.length ?? 0) > 0 || (structuredFooter.badges?.length ?? 0) > 0
        : footer != null;
    const defaultMaxLines = (!subtitle && !hasFooter) ? 7 : ((subtitle && hasFooter) ? 4 : 5);
    const effectiveMaxLines = maxLines ?? defaultMaxLines;
    // No accent unless tone/color is given — a paper card defaults to plain stock.
    const accentColor = resolveAccentColor(tone, color);
    const hasAccent = accentColor != null;
    if (process.env.NODE_ENV !== 'production') {
    }
    let footerNode = null;
    if (structuredFooter) {
        const lines = structuredFooter.lines ?? [];
        const badges = structuredFooter.badges ?? [];
        const rowCount = Math.max(lines.length, badges.length);
        footerNode = (_jsx("div", { className: "mrs-phi-card__footer", children: Array.from({ length: rowCount }, (_, i) => {
                const line = lines[i];
                const badge_row = badges[i];
                return (_jsxs("div", { className: "mrs-phi-card__footer-row", children: [_jsxs("span", { className: "mrs-phi-card__footer-line", children: [line?.type ? (_jsx("span", { className: "mrs-phi-card__footer-icon", children: FOOTER_GLYPHS[line.type] })) : null, line ? _jsx("span", { className: "mrs-phi-card__footer-text", children: line.text }) : null] }), badge_row != null ? (_jsx("span", { className: "mrs-phi-card__footer-badge", children: badge_row })) : null] }, i));
            }) }));
    }
    const style = {
        ...styleProp,
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${SIZE_FONT_REM[size]}rem`,
        '--mrs-paper-fold': `${fold}px`,
        ...(hasAccent ? { '--mrs-stat-accent': accentColor } : {}),
    };
    const contentStyle = {
        display: '-webkit-box',
        WebkitLineClamp: effectiveMaxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
    };
    return (_jsxs("div", { ref: ref, className: cn('mrs-paper-card', hasAccent && `mrs-paper-card--accent-${accentPlacement}`, isHoverable && 'mrs-paper-card--hoverable', watermark && 'mrs-paper-card--watermark', hasDragHandle && 'mrs-paper-card--draggable', corner != null && 'mrs-paper-card--cornered', renderLink && 'mrs-paper-card--linked', className), style: style, onClick: onClick, children: [renderLink
                ? renderLink({ className: 'mrs-paper-card__link-overlay', 'aria-labelledby': titleId })
                : null, hasDragHandle ? (_jsx("button", { type: "button", className: "mrs-paper-card__drag-handle", "aria-label": dragHandleLabel, ...dragHandleProps, onClick: (e) => {
                    e.stopPropagation();
                    dragHandleProps?.onClick?.(e);
                }, children: dragHandle ?? DEFAULT_DRAG_HANDLE })) : null, corner != null ? _jsx("div", { className: "mrs-paper-card__corner", children: corner }) : null, _jsxs("div", { className: "mrs-paper-card__sheet", "data-watermark": watermark, children: [_jsx("span", { className: "mrs-paper-card__fold", "aria-hidden": "true" }), _jsxs("div", { className: "mrs-paper-card__inner", children: [_jsx("div", { className: "mrs-paper-card__header", children: _jsxs("div", { className: "mrs-paper-card__head-text", children: [_jsx("p", { className: "mrs-paper-card__title", id: titleId, children: title }), subtitle ? _jsx("p", { className: "mrs-paper-card__subtitle", children: subtitle }) : null] }) }), content != null ? (_jsx("div", { className: "mrs-paper-card__body", "data-align-x": contentAlignX, "data-align-y": contentAlignY, children: _jsx("div", { className: "mrs-paper-card__content", style: contentStyle, children: content }) })) : null, hasFooter ? (_jsx("div", { className: "mrs-paper-card__lower", children: structuredFooter ? footerNode : footer })) : null] })] })] }));
});
