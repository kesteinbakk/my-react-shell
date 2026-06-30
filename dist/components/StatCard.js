import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, isValidElement, useId, useRef, useState } from 'react';
import { cn } from './cn';
import { resolveAccentColor } from './accent';
import { TONE_COLOR } from './tone';
import { Dialog } from './Dialog';
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
const SIZE_FONT_REM = {
    sm: 1.0,
    md: 1.1375,
    lg: 1.40625,
    xl: 1.48958,
};
// The golden ratio — a card's rendered height is width / PHI.
const PHI = 1.6180339887;
// ── Footer glyphs ───────────────────────────────────────────────────────────
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
// ── Medallion content (shared by the corner medallion and per-stat medallions) ─
/**
 * Builds a medallion's inner circle/arc — a plain circle (`value` + `label`) when
 * `max` is absent, an SVG arc-ring (`value / max` progress) when `max` is set. Shared
 * by the card's corner medallion (arc-only — `max` is mandatory there) and any
 * `stats[]` item with `medallion: true` (both modes, same as a freestanding medallion).
 */
function renderMedallionContent({ value, label, max, size, pressable, onPress, }) {
    const MedallionTag = pressable ? 'button' : 'div';
    const medallionProps = pressable
        ? {
            type: 'button',
            onClick: (e) => {
                e.stopPropagation();
                onPress?.();
            },
        }
        : {};
    if (max != null) {
        const numVal = typeof value === 'number' ? value : parseFloat(String(value));
        const pct = Math.min(1, Math.max(0, isNaN(numVal) ? 0 : numVal / max));
        if (pct >= 1) {
            return (_jsx(MedallionTag, { className: cn('mrs-stat-card__medallion', size === 'sm' && 'mrs-stat-card__medallion--sm', pressable && 'mrs-stat-card__medallion--pressable'), ...medallionProps, children: _jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "3.5", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", style: { width: '1.8em', height: '1.8em' }, children: _jsx("path", { d: "M20 6 9 17l-5-5" }) }) }));
        }
        return (_jsx(MedallionTag, { className: cn('mrs-stat-card__medallion mrs-stat-card__medallion--arc', size === 'sm' && 'mrs-stat-card__medallion--sm', pressable && 'mrs-stat-card__medallion--pressable'), ...medallionProps, children: _jsx(ArcRing, { value: value, max: max }) }));
    }
    let displayValue = value;
    if (size === 'sm') {
        const num = typeof displayValue === 'number' ? displayValue : Number(displayValue);
        if (!isNaN(num) && num > 99) {
            displayValue = 99;
        }
    }
    if (typeof displayValue === 'number') {
        displayValue = Math.round(displayValue);
    }
    else if (typeof displayValue === 'string' && !isNaN(Number(displayValue)) && displayValue.trim() !== '') {
        displayValue = Math.round(Number(displayValue)).toString();
    }
    const valueStr = String(displayValue);
    if (process.env.NODE_ENV !== 'production') {
        if (valueStr.length > 4) {
            throw new Error(`StatCard: medallion value cannot exceed 4 characters (got "${valueStr}").`);
        }
    }
    return (_jsxs(MedallionTag, { className: cn('mrs-stat-card__medallion', size === 'sm' && 'mrs-stat-card__medallion--sm', pressable && 'mrs-stat-card__medallion--pressable'), ...medallionProps, children: [_jsx("span", { className: "mrs-stat-card__medallion-value", "data-len": valueStr.length, children: displayValue }), size !== 'sm' && label ? _jsx("span", { className: "mrs-stat-card__medallion-label", "data-len": label.length, children: label }) : null] }));
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
 * Very long titles step the font size down (up to five steps) so they stay within
 * roughly two lines without changing the card geometry. Length-based: the title font
 * scales with `size`, so characters-per-line is roughly constant across presets, and
 * raw `title.length` is a good cross-size proxy for "is this title very long". The
 * extra deep steps let the card swallow a much longer title before it has to ellipsize.
 * Returns `0` (no reduction) through `5` (smallest). Shared ladder across the
 * string-title cards (`StatCard`/`ContentCard`/`PaperCard`).
 */
function titleFitStep(title) {
    const n = title.length;
    if (n > 116)
        return 5;
    if (n > 90)
        return 4;
    if (n > 68)
        return 3;
    if (n > 48)
        return 2;
    if (n > 32)
        return 1;
    if (n > 22)
        return 0;
    if (n > 12)
        return -1;
    return -2;
}
// ── Component ─────────────────────────────────────────────────────────────────
const DEFAULT_DRAG_HANDLE = (_jsxs("svg", { width: "11", height: "28", viewBox: "0 0 11 28", fill: "currentColor", "aria-hidden": "true", opacity: "0.4", children: [_jsx("rect", { x: "1", y: "0", width: "3", height: "28", rx: "1.5" }), _jsx("rect", { x: "7", y: "0", width: "3", height: "28", rx: "1.5" })] }));
/**
 * Stat card — a φ-framed KPI/status card with a title, an optional accent
 * medallion arc-ring (`value / max` progress) in the corner, a row of data stats,
 * and an optional footer or freeform lower slot.
 *
 * The accent stripe, medallion tint, and watermark are driven by `tone` (mapped to
 * semantic tokens) or overridden with a raw CSS `color` string.
 */
export const StatCard = forwardRef(function StatCard({ title, subtitle, medallion, tone = 'neutral', color, accentPlacement = 'top', sideBarCompleteness, topStripeFollowsGauge = false, stats, variant, footer, watermark, watermarkMode = 'art', size = 'md', shape = 'standard', onClick, onMedallionPress, hoverable, showDragHandle, dragHandle, dragHandleProps, dragHandleLabel, dragWholeCard, renderLink, className, style: styleProp, info, }, ref) {
    const [infoOpen, setInfoOpen] = useState(false);
    // A visible grip shows when toggled on, or when a custom handle node is supplied.
    const hasDragHandle = showDragHandle || dragHandle != null;
    // Whole-card drag: the grabbing cursor engages only after a short hold, so a
    // quick click never changes the cursor (see the `--drag-whole` cursor rules).
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
    // variant overrides tone to the same value; ⚠️ always used as the watermark.
    const effectiveTone = variant ?? tone;
    const effectiveWatermark = variant ? '⚠️' : watermark;
    const watermarkIsString = typeof effectiveWatermark === 'string';
    const hasWatermark = watermarkIsString ? effectiveWatermark.length > 0 : effectiveWatermark != null;
    const hasArtWatermark = hasWatermark && !watermarkIsString;
    const width = SIZE_WIDTH_PX[size];
    // landscape = φ²:1 (shorter box at the same width); standard = φ:1.
    const height = shape === 'landscape' ? width / (PHI * PHI) : width / PHI;
    const isHoverable = hoverable ?? !!onClick;
    // Auto-wire the overlay anchor's accessible name from the (required) card title.
    const titleId = useId();
    const structuredFooter = isStructuredFooter(footer) ? footer : null;
    // `undefined` → no gauge; `0` → gauge with an empty fill. Checked, never
    // truthy-tested, so `0` is rendered rather than swallowed.
    const hasGauge = sideBarCompleteness !== undefined;
    const gaugeFraction = hasGauge ? Math.min(1, Math.max(0, sideBarCompleteness)) : 0;
    const gaugePct = Math.round(gaugeFraction * 100);
    // `topStripeFollowsGauge`: the whole accent (top stripe + medallion tint + stat
    // numbers) takes the gauge's completeness colour, so the card reads as one
    // coherent colour, and the stripe is forced to the top edge.
    const followGauge = topStripeFollowsGauge && hasGauge;
    // variant forces the top stripe; topStripeFollowsGauge also forces top.
    const effectiveAccentPlacement = (topStripeFollowsGauge || variant) ? 'top' : accentPlacement;
    // Accent paint: the gauge colour when following it, else tone/color (tone/color
    // is also the fallback when the mode is on but there's no gauge to follow). tone
    // defaults to 'neutral', so the non-follow branch is always defined.
    const accentColor = followGauge
        ? completenessFill(gaugeFraction)
        : resolveAccentColor(effectiveTone, color) ?? TONE_COLOR.neutral;
    // When to drop the accent stripe entirely:
    //  • mode on but no gauge → the top stripe has nothing to follow (no stripe);
    //  • gauge + a left accent → the gauge owns the left edge (suppress the stripe).
    // variant always shows the accent (top stripe + DOM left stripe), so it's never suppressed.
    // Dev throws on both contradictions below; these are the prod-safe fallbacks.
    const accentSuppressed = !variant && ((topStripeFollowsGauge && !hasGauge) ||
        (!topStripeFollowsGauge && hasGauge && accentPlacement === 'left'));
    // variant left stripe: shown alongside the top stripe unless the gauge already
    // occupies the left edge (6px gauge > 4px stripe; they'd overlap).
    const showVariantLeftStripe = !!variant && !hasGauge;
    // Dev guards
    if (process.env.NODE_ENV !== 'production') {
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
    const hasFooter = structuredFooter
        ? (structuredFooter.lines?.length ?? 0) > 0 || (structuredFooter.badges?.length ?? 0) > 0
        : footer != null;
    // Footer renderer (shared JSX structure + CSS classes with ContentCard)
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
    // Corner medallion — arc-ring only (`max` is mandatory on `StatCardMedallion`).
    const medallionNode = medallion
        ? renderMedallionContent({
            value: medallion.value,
            max: medallion.max,
            size: medallion.size,
            pressable: !!onMedallionPress,
            onPress: onMedallionPress,
        })
        : null;
    return (_jsxs("div", { ref: ref, className: cn('mrs-stat-card', !accentSuppressed && `mrs-stat-card--accent-${effectiveAccentPlacement}`, hasGauge && 'mrs-stat-card--gauge', variant && 'mrs-stat-card--variant', isHoverable && 'mrs-stat-card--hoverable', hasWatermark && 'mrs-stat-card--watermark', hasArtWatermark && 'mrs-reveal-host', hasDragHandle && 'mrs-stat-card--draggable', shape === 'landscape' && 'mrs-stat-card--landscape', renderLink && 'mrs-stat-card--linked', dragWholeCard && 'mrs-stat-card--drag-whole', dragWholeCard && isHolding && 'mrs-stat-card--holding', className), style: style, "data-watermark": watermarkIsString ? effectiveWatermark : undefined, "data-has-medallion": medallion != null ? "true" : undefined, "data-medallion-size": medallion?.size ?? 'lg', onClick: onClick, ...(dragWholeCard ? {
            ...dragHandleProps,
            onPointerDown: (e) => { startHold(); dragHandleProps?.onPointerDown?.(e); },
            onPointerUp: (e) => { clearHold(); dragHandleProps?.onPointerUp?.(e); },
            onPointerLeave: (e) => { clearHold(); dragHandleProps?.onPointerLeave?.(e); },
        } : {}), children: [renderLink
                ? renderLink({ className: 'mrs-stat-card__link-overlay', 'aria-labelledby': titleId })
                : null, hasArtWatermark ? (_jsx("div", { className: cn('mrs-stat-card__watermark', watermarkMode === 'glyph' && 'mrs-stat-card__watermark--glyph'), "aria-hidden": "true", children: effectiveWatermark })) : null, hasDragHandle ? (_jsx("button", { type: "button", className: "mrs-stat-card__drag-handle", "aria-label": dragHandleLabel, ...dragHandleProps, onClick: (e) => {
                    e.stopPropagation();
                    dragHandleProps?.onClick?.(e);
                }, children: dragHandle ?? DEFAULT_DRAG_HANDLE })) : null, showVariantLeftStripe ? (_jsx("div", { className: "mrs-stat-card__variant-stripe", "aria-hidden": "true" })) : null, hasGauge ? (_jsx("div", { className: "mrs-stat-card__gauge", role: "meter", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": gaugePct, "aria-label": `${gaugePct}%`, children: _jsx("div", { className: "mrs-stat-card__gauge-fill", style: { height: `${gaugeFraction * 100}%`, background: completenessFill(gaugeFraction) } }) })) : null, _jsxs("div", { className: "mrs-stat-card__inner", children: [_jsxs("div", { className: "mrs-stat-card__header", children: [_jsxs("div", { className: "mrs-stat-card__head-text", children: [_jsx("p", { className: "mrs-stat-card__title", id: titleId, "data-fit": titleFitStep(title) || undefined, children: title }), subtitle ? _jsx("p", { className: "mrs-stat-card__subtitle", children: subtitle }) : null] }), medallionNode] }), stats && stats.length > 0 ? (_jsx("dl", { className: "mrs-stat-card__stats", children: stats.map((item, i) => {
                            if (item.max != null) {
                                // Arc-ring stat
                                return (_jsx("div", { className: "mrs-stat-card__stat mrs-stat-card__stat--arc", children: _jsx(ArcRing, { value: item.value, max: item.max }) }, i));
                            }
                            return (_jsxs("div", { className: "mrs-stat-card__stat", children: [item.label ? (_jsx("dt", { className: "mrs-stat-card__stat-label", children: item.label })) : null, _jsx("dd", { className: "mrs-stat-card__stat-value", children: item.value })] }, i));
                        }) })) : null, hasFooter ? (_jsx("div", { className: "mrs-stat-card__lower", children: structuredFooter ? footerNode : footer })) : null] }), info ? (_jsx("button", { type: "button", className: cn('mrs-stat-card__info', info.corner === 'left' && 'mrs-stat-card__info--left'), "aria-label": info.label, onClick: (e) => {
                    e.stopPropagation();
                    setInfoOpen(true);
                }, children: _jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "10" }), _jsx("path", { d: "M12 16v-4M12 8h.01" })] }) })) : null, info ? (_jsx(Dialog, { open: infoOpen, onOpenChange: setInfoOpen, title: info.title, description: info.description, closeLabel: info.closeLabel, size: "lg", children: info.content != null ? (typeof info.content === 'string' ? (_jsx("p", { className: "mrs-stat-card__info-text", children: info.content })) : (_jsx("div", { className: "mrs-stat-card__info-sections", children: info.content.map((section, i) => (_jsxs("div", { className: "mrs-stat-card__info-section", children: [_jsxs("div", { className: "mrs-stat-card__info-section-header", children: [info.numbered !== false ? _jsx("span", { className: "mrs-stat-card__info-badge", children: i + 1 }) : null, _jsx("strong", { className: "mrs-stat-card__info-section-title", children: section.title })] }), section.description ? (_jsx("p", { className: "mrs-stat-card__info-section-desc", children: section.description })) : null] }, i))) }))) : null })) : null] }));
});
