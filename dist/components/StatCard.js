import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from './cn';
import { resolveAccentColor } from './accent';
import { TONE_COLOR } from './tone';
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
// ── Completion gauge ──────────────────────────────────────────────────────────
/**
 * Completion-gauge fill paint: interpolate the semantic signal tokens
 * `danger → warning → success` across `[0,1]` with `color-mix`, in two segments
 * (`0→0.5` danger→warning, `0.5→1` warning→success). The stops are theme tokens,
 * so the fill stays palette- and dark-mode-correct. Input is clamped.
 */
function completenessFill(value) {
    const v = Math.min(1, Math.max(0, value));
    if (v <= 0.5) {
        const t = (v / 0.5) * 100;
        return `color-mix(in srgb, var(--color-warning) ${t}%, var(--color-danger))`;
    }
    const t = ((v - 0.5) / 0.5) * 100;
    return `color-mix(in srgb, var(--color-success) ${t}%, var(--color-warning))`;
}
// ── Title auto-fit ──────────────────────────────────────────────────────────
/**
 * Very long titles step the font size down (up to three steps) so they stay within
 * roughly two lines without changing the card geometry. Length-based: the title font
 * scales with `size`, so characters-per-line is roughly constant across presets, and
 * raw `title.length` is a good cross-size proxy for "is this title very long".
 * Returns `0` (no reduction) through `3` (smallest).
 */
function titleFitStep(title) {
    const n = title.length;
    if (n > 68)
        return 3;
    if (n > 48)
        return 2;
    if (n > 32)
        return 1;
    return 0;
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
export function StatCard({ title, subtitle, badge, tone = 'neutral', color, accentPlacement = 'top', sideBarCompleteness, topStripeFollowsGauge = false, stats, body, variant, footer, lower, watermark, size = 'md', onClick, hoverable, className, }) {
    // variant overrides tone to the same value; ⚠️ always used as the watermark.
    const effectiveTone = variant ?? tone;
    const effectiveWatermark = variant ? '⚠️' : watermark;
    const width = SIZE_WIDTH_PX[size];
    const height = width / PHI;
    const isHoverable = hoverable ?? !!onClick;
    // `undefined` → no gauge; `0` → gauge with an empty fill. Checked, never
    // truthy-tested, so `0` is rendered rather than swallowed.
    const hasGauge = sideBarCompleteness !== undefined;
    const gaugeFraction = hasGauge ? Math.min(1, Math.max(0, sideBarCompleteness)) : 0;
    const gaugePct = Math.round(gaugeFraction * 100);
    // `topStripeFollowsGauge`: the whole accent (top stripe + badge tint + stat
    // numbers) takes the gauge's completeness colour, so the card reads as one
    // coherent colour, and the stripe is forced to the top edge.
    const followGauge = topStripeFollowsGauge && hasGauge;
    const effectiveAccentPlacement = topStripeFollowsGauge ? 'top' : accentPlacement;
    // Accent paint: the gauge colour when following it, else tone/color (tone/color
    // is also the fallback when the mode is on but there's no gauge to follow). tone
    // defaults to 'neutral', so the non-follow branch is always defined.
    const accentColor = followGauge
        ? completenessFill(gaugeFraction)
        : resolveAccentColor(effectiveTone, color) ?? TONE_COLOR.neutral;
    // When to drop the accent stripe entirely:
    //  • mode on but no gauge → the top stripe has nothing to follow (no stripe);
    //  • gauge + a left accent → the gauge owns the left edge (suppress the stripe).
    // Dev throws on both contradictions below; these are the prod-safe fallbacks.
    const accentSuppressed = (topStripeFollowsGauge && !hasGauge) ||
        (!topStripeFollowsGauge && hasGauge && accentPlacement === 'left');
    // Dev guards
    if (process.env.NODE_ENV !== 'production') {
        if (footer && lower != null) {
            throw new Error('StatCard: provide either `footer` or `lower`, not both.');
        }
        if (hasGauge && accentPlacement === 'left') {
            throw new Error("StatCard: `sideBarCompleteness` can't combine with `accentPlacement='left'` — both occupy the left edge. Keep the default `accentPlacement='top'` (or omit it) alongside the gauge.");
        }
        if (topStripeFollowsGauge && accentPlacement === 'left') {
            throw new Error("StatCard: `topStripeFollowsGauge` drives the top stripe — it can't combine with `accentPlacement='left'`. Keep the default `accentPlacement='top'` (or omit it).");
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
    return (_jsxs("div", { className: cn('mrs-stat-card', !accentSuppressed && `mrs-stat-card--accent-${effectiveAccentPlacement}`, hasGauge && 'mrs-stat-card--gauge', isHoverable && 'mrs-stat-card--hoverable', effectiveWatermark && 'mrs-stat-card--watermark', className), style: style, "data-watermark": effectiveWatermark, onClick: onClick, children: [hasGauge ? (_jsx("div", { className: "mrs-stat-card__gauge", role: "meter", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": gaugePct, "aria-label": `${gaugePct}%`, children: _jsx("div", { className: "mrs-stat-card__gauge-fill", style: { height: `${gaugeFraction * 100}%`, background: completenessFill(gaugeFraction) } }) })) : null, _jsxs("div", { className: "mrs-stat-card__inner", children: [_jsxs("div", { className: "mrs-stat-card__header", children: [_jsxs("div", { className: "mrs-stat-card__head-text", children: [_jsx("p", { className: "mrs-stat-card__title", "data-fit": titleFitStep(title) || undefined, children: title }), subtitle ? _jsx("p", { className: "mrs-stat-card__subtitle", children: subtitle }) : null] }), badgeNode] }), stats && stats.length > 0 ? (_jsx("dl", { className: "mrs-stat-card__stats", children: stats.map((item, i) => {
                            if (item.max != null) {
                                // Arc-ring stat
                                return (_jsx("div", { className: "mrs-stat-card__stat mrs-stat-card__stat--arc", children: _jsx(ArcRing, { value: item.value, max: item.max }) }, i));
                            }
                            return (_jsxs("div", { className: "mrs-stat-card__stat", children: [item.label ? (_jsx("dt", { className: "mrs-stat-card__stat-label", children: item.label })) : null, _jsx("dd", { className: "mrs-stat-card__stat-value", children: item.value })] }, i));
                        }) })) : null, hasFooter ? (_jsx("div", { className: "mrs-stat-card__lower", children: footer ? footerNode : lower })) : null] })] }));
}
