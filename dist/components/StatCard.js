import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
const SIZE_WIDTH_PX = {
    sm: 180,
    md: 240,
    lg: 320,
    xl: 480,
};
const SIZE_FONT_REM = {
    sm: 0.75,
    md: 0.875,
    lg: 1.125,
    xl: 1.375,
};
// The golden ratio — height = width / PHI (same constant as PhiCard).
const PHI = 1.6180339887;
const TONE_COLOR = {
    success: 'var(--color-success)',
    info: 'var(--color-info)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    neutral: 'var(--color-text-secondary)',
};
// ── Footer glyphs (same kit-shipped icons as PhiCard) ────────────────────────
const FOOTER_GLYPHS = {
    date: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { d: "M16 2v4M8 2v4M3 10h18" })] })),
    time: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 7v5l3 2" })] })),
    check: (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M20 6 9 17l-5-5" }) })),
};
// ── Arc ring SVG ──────────────────────────────────────────────────────────────
function ArcRing({ value, max, className, }) {
    const numVal = typeof value === 'number' ? value : parseFloat(String(value));
    const pct = Math.min(1, Math.max(0, isNaN(numVal) ? 0 : numVal / max));
    const SIZE = 48;
    const STROKE = 4.5;
    const r = (SIZE - STROKE) / 2;
    const circum = 2 * Math.PI * r;
    const offset = circum * (1 - pct);
    const cx = SIZE / 2;
    const pctInt = Math.round(pct * 100);
    // Fully complete → checkmark
    if (pct >= 1) {
        return (_jsx("svg", { className: cn('mrs-stat-card__arc', className), viewBox: "0 0 24 24", role: "img", "aria-label": "100%", children: _jsx("path", { d: "M4 12.5l5 5L20 6.5", fill: "none", strokeWidth: 2.6, strokeLinecap: "round", strokeLinejoin: "round", style: { stroke: 'var(--mrs-stat-accent, currentColor)' } }) }));
    }
    return (_jsxs("svg", { className: cn('mrs-stat-card__arc', className), viewBox: `0 0 ${SIZE} ${SIZE}`, role: "img", "aria-label": `${pctInt}%`, children: [_jsx("circle", { cx: cx, cy: cx, r: r, fill: "none", strokeWidth: STROKE, className: "mrs-stat-card__arc-track" }), _jsx("circle", { cx: cx, cy: cx, r: r, fill: "none", strokeWidth: STROKE, strokeDasharray: circum, strokeDashoffset: offset, strokeLinecap: "round", transform: `rotate(-90 ${cx} ${cx})`, style: { stroke: 'var(--mrs-stat-accent, currentColor)' } }), _jsxs("text", { x: cx, y: cx, textAnchor: "middle", dominantBaseline: "central", fontSize: 12, fontWeight: "700", fill: "currentColor", className: "mrs-stat-card__arc-text", children: [pctInt, "%"] })] }));
}
// ── Component ─────────────────────────────────────────────────────────────────
/**
 * Stat card — a φ-framed KPI/status card with a title, an optional accent
 * badge circle (plain number or arc-ring progress), a row of data stats, and an
 * optional footer or freeform lower slot. Shares the same size system as PhiCard.
 *
 * The accent stripe, badge tint, and watermark are driven by `tone` (mapped to
 * semantic tokens) or overridden with a raw CSS `color` string.
 */
export function StatCard({ title, subtitle, badge, tone = 'neutral', color, stats, footer, lower, watermark, size = 'md', onClick, hoverable, className, }) {
    const accentColor = color ?? TONE_COLOR[tone];
    const width = SIZE_WIDTH_PX[size];
    const height = width / PHI;
    const isHoverable = hoverable ?? !!onClick;
    // Dev guards
    if (process.env.NODE_ENV !== 'production') {
        if (footer && lower != null) {
            throw new Error('StatCard: provide either `footer` or `lower`, not both.');
        }
        stats?.forEach((item, i) => {
            if (item.label !== undefined && item.max !== undefined) {
                throw new Error(`StatCard: stats[${i}] cannot have both \`label\` and \`max\` — use one layout or the other.`);
            }
        });
    }
    const hasFooter = (footer && ((footer.lines?.length ?? 0) > 0 || (footer.badges?.length ?? 0) > 0)) ||
        lower != null;
    // PhiCard footer renderer reused (same JSX structure, same CSS classes)
    let footerNode = null;
    if (footer) {
        const lines = footer.lines ?? [];
        const badges = footer.badges ?? [];
        const rowCount = Math.max(lines.length, badges.length);
        footerNode = (_jsx("div", { className: "mrs-phi-card__footer", children: Array.from({ length: rowCount }, (_, i) => {
                const line = lines[i];
                const badge_row = badges[i];
                return (_jsxs("div", { className: "mrs-phi-card__footer-row", children: [_jsxs("span", { className: "mrs-phi-card__footer-line", children: [line?.type ? (_jsx("span", { className: "mrs-phi-card__footer-icon", children: FOOTER_GLYPHS[line.type] })) : null, line ? _jsx("span", { className: "mrs-phi-card__footer-text", children: line.text }) : null] }), badge_row != null ? (_jsx("span", { className: "mrs-phi-card__footer-badge", children: badge_row })) : null] }, i));
            }) }));
    }
    const style = {
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${SIZE_FONT_REM[size]}rem`,
        '--mrs-stat-accent': accentColor,
    };
    // Badge circle or arc ring
    let badgeNode = null;
    if (badge) {
        if (badge.max != null) {
            badgeNode = (_jsx("div", { className: "mrs-stat-card__badge mrs-stat-card__badge--arc", children: _jsx(ArcRing, { value: badge.value, max: badge.max }) }));
        }
        else {
            badgeNode = (_jsxs("div", { className: "mrs-stat-card__badge", children: [_jsx("span", { className: "mrs-stat-card__badge-value", children: badge.value }), badge.label ? _jsx("span", { className: "mrs-stat-card__badge-label", children: badge.label }) : null] }));
        }
    }
    return (_jsx("div", { className: cn('mrs-stat-card', isHoverable && 'mrs-stat-card--hoverable', watermark && 'mrs-stat-card--watermark', className), style: style, "data-watermark": watermark, onClick: onClick, children: _jsxs("div", { className: "mrs-stat-card__inner", children: [_jsxs("div", { className: "mrs-stat-card__header", children: [_jsxs("div", { className: "mrs-stat-card__head-text", children: [_jsx("p", { className: "mrs-stat-card__title", children: title }), subtitle ? _jsx("p", { className: "mrs-stat-card__subtitle", children: subtitle }) : null] }), badgeNode] }), stats && stats.length > 0 ? (_jsx("dl", { className: "mrs-stat-card__stats", children: stats.map((item, i) => {
                        if (item.max != null) {
                            // Arc-ring stat
                            return (_jsx("div", { className: "mrs-stat-card__stat mrs-stat-card__stat--arc", children: _jsx(ArcRing, { value: item.value, max: item.max }) }, i));
                        }
                        return (_jsxs("div", { className: "mrs-stat-card__stat", children: [item.label ? (_jsx("dt", { className: "mrs-stat-card__stat-label", children: item.label })) : null, _jsx("dd", { className: "mrs-stat-card__stat-value", children: item.value })] }, i));
                    }) })) : null, hasFooter ? (_jsx("div", { className: "mrs-stat-card__lower", children: footer ? footerNode : lower })) : null] }) }));
}
