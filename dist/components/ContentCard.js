import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, isValidElement, useId } from 'react';
import DOMPurify from 'isomorphic-dompurify';
import { cn } from './cn';
import { resolveAccentColor } from './accent';
import { TONE_COLOR } from './tone';
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
    sm: 240,
    md: 312,
    lg: 400,
    xl: 520,
};
const DEFAULT_DRAG_HANDLE = (_jsxs("svg", { width: "64", height: "12", viewBox: "0 0 64 12", fill: "currentColor", "aria-hidden": "true", opacity: "0.4", children: [_jsx("rect", { x: "0", y: "1", width: "64", height: "3", rx: "1.5" }), _jsx("rect", { x: "0", y: "8", width: "64", height: "3", rx: "1.5" })] }));
const SIZE_FONT_REM = {
    sm: 0.75,
    md: 0.875,
    lg: 1.125,
    xl: 1.375,
};
const PHI = 1.6180339887;
const FOOTER_GLYPHS = {
    date: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { d: "M16 2v4M8 2v4M3 10h18" })] })),
    time: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 7v5l3 2" })] })),
    check: (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M20 6 9 17l-5-5" }) })),
};
function titleFitStep(text) {
    if (text.length <= 14)
        return 0;
    if (text.length <= 22)
        return 1;
    return 2;
}
function completenessFill(fraction) {
    if (fraction < 0.33)
        return 'var(--color-danger)';
    if (fraction < 0.66)
        return 'var(--color-warning)';
    return 'var(--color-success)';
}
export const ContentCard = forwardRef(function ContentCard({ title, subtitle, content, html = false, contentAlignX = 'center', contentAlignY = 'center', value, maxValue, tone = 'neutral', color, accentPlacement = 'top', topStripeFollowsGauge = false, variant, footer, maxLines, watermark, size = 'md', shape = 'standard', onClick, hoverable, dragHandle, dragHandleProps, renderLink, className, style: styleProp, }, ref) {
    const effectiveTone = variant ?? tone;
    const effectiveWatermark = variant ? '⚠️' : watermark;
    const width = SIZE_WIDTH_PX[size];
    // landscape = φ²:1 (shorter box at the same width); standard = φ:1.
    const height = shape === 'landscape' ? width / (PHI * PHI) : width / PHI;
    const isHoverable = hoverable ?? !!onClick;
    // Auto-wire the overlay anchor's accessible name from the (required) card title.
    const titleId = useId();
    const structuredFooter = isStructuredFooter(footer) ? footer : null;
    const hasFooter = structuredFooter
        ? (structuredFooter.lines?.length ?? 0) > 0 || (structuredFooter.badges?.length ?? 0) > 0
        : footer != null;
    const defaultMaxLines = (!subtitle && !hasFooter) ? 5 : ((subtitle && hasFooter) ? 3 : 4);
    const effectiveMaxLines = maxLines ?? defaultMaxLines;
    const hasGauge = value !== undefined && maxValue !== undefined;
    const gaugeFraction = hasGauge ? Math.min(1, Math.max(0, value / maxValue)) : 0;
    const gaugePct = Math.round(gaugeFraction * 100);
    const followGauge = topStripeFollowsGauge && hasGauge;
    const effectiveAccentPlacement = (topStripeFollowsGauge || variant) ? 'top' : accentPlacement;
    const accentColor = followGauge
        ? completenessFill(gaugeFraction)
        : resolveAccentColor(effectiveTone, color) ?? TONE_COLOR.neutral;
    const accentSuppressed = !variant && ((topStripeFollowsGauge && !hasGauge) ||
        (!topStripeFollowsGauge && hasGauge && accentPlacement === 'left'));
    const showVariantLeftStripe = !!variant && !hasGauge;
    if (process.env.NODE_ENV !== 'production') {
        if (dragHandle && renderLink) {
            throw new Error('ContentCard: `dragHandle` and `renderLink` are mutually exclusive — a navigable tile cannot also be drag-reordered.');
        }
        if (hasGauge && accentPlacement === 'left') {
            throw new Error("ContentCard: left gauge can't combine with `accentPlacement='left'` — both occupy the left edge. Keep the default `accentPlacement='top'` (or omit it) alongside the gauge.");
        }
        if (topStripeFollowsGauge && accentPlacement === 'left') {
            throw new Error("ContentCard: `topStripeFollowsGauge` drives the top stripe — it can't combine with `accentPlacement='left'`. Keep the default `accentPlacement='top'` (or omit it).");
        }
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
        '--mrs-stat-accent': accentColor,
    };
    const contentStyle = {
        display: '-webkit-box',
        WebkitLineClamp: effectiveMaxLines,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '100%',
    };
    const contentNode = html ? (_jsx("div", { className: "mrs-content-card__content", style: contentStyle, dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(content) } })) : (_jsx("div", { className: "mrs-content-card__content", style: contentStyle, children: content }));
    return (_jsxs("div", { ref: ref, className: cn('mrs-content-card', !accentSuppressed && `mrs-content-card--accent-${effectiveAccentPlacement}`, hasGauge && 'mrs-content-card--gauge', variant && 'mrs-content-card--variant', isHoverable && 'mrs-content-card--hoverable', effectiveWatermark && 'mrs-content-card--watermark', dragHandle && 'mrs-content-card--draggable', shape === 'landscape' && 'mrs-content-card--landscape', renderLink && 'mrs-content-card--linked', className), style: style, "data-watermark": effectiveWatermark, onClick: onClick, children: [renderLink
                ? renderLink({ className: 'mrs-content-card__link-overlay', 'aria-labelledby': titleId })
                : null, dragHandle ? (_jsx("button", { type: "button", className: "mrs-content-card__drag-handle", "aria-label": "Drag to reorder", ...dragHandleProps, onClick: (e) => {
                    e.stopPropagation();
                    dragHandleProps?.onClick?.(e);
                }, children: dragHandle === true ? DEFAULT_DRAG_HANDLE : dragHandle })) : null, showVariantLeftStripe ? (_jsx("div", { className: "mrs-content-card__variant-stripe", "aria-hidden": "true" })) : null, hasGauge ? (_jsx("div", { className: "mrs-content-card__gauge", role: "meter", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": gaugePct, "aria-label": `${gaugePct}%`, children: _jsx("div", { className: "mrs-content-card__gauge-fill", style: { height: `${gaugeFraction * 100}%`, background: completenessFill(gaugeFraction) } }) })) : null, _jsxs("div", { className: "mrs-content-card__inner", children: [_jsx("div", { className: "mrs-content-card__header", children: _jsxs("div", { className: "mrs-content-card__head-text", children: [_jsx("p", { className: "mrs-content-card__title", id: titleId, "data-fit": titleFitStep(title) || undefined, children: title }), subtitle ? _jsx("p", { className: "mrs-content-card__subtitle", children: subtitle }) : null] }) }), _jsx("div", { className: cn('mrs-content-card__body', variant && 'mrs-content-card__body--variant'), "data-align-x": contentAlignX, "data-align-y": contentAlignY, children: contentNode }), hasFooter ? (_jsx("div", { className: "mrs-content-card__lower", children: structuredFooter ? footerNode : footer })) : null] })] }));
});
