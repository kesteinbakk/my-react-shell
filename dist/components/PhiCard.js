import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { cn } from './cn';
import { resolveAccentColor } from './accent';
/**
 * φ — the golden ratio. Exported so a consumer can size a layout against the exact
 * constant the card uses (a card's rendered height is `width / PHI`).
 */
export const PHI = 1.6180339887;
const SIZE_WIDTH_PX = {
    sm: 180,
    md: 240,
    lg: 320,
    xl: 480,
};
// Base font-size (rem) per size — set on the card root so section content inherits it.
const SIZE_FONT_REM = {
    sm: 0.75,
    md: 0.875,
    lg: 1.125,
    xl: 1.375,
};
// Footer caps per size — exceeding either is misuse and throws in dev (fail loud).
const FOOTER_LINE_CAP = { sm: 1, md: 2, lg: 3, xl: 5 };
const FOOTER_BADGE_CAP = { sm: 1, md: 1, lg: 2, xl: 4 };
const FOOTER_GLYPHS = {
    date: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("rect", { x: "3", y: "4", width: "18", height: "18", rx: "2" }), _jsx("path", { d: "M16 2v4M8 2v4M3 10h18" })] })),
    time: (_jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "12", r: "9" }), _jsx("path", { d: "M12 7v5l3 2" })] })),
    check: (_jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true", children: _jsx("path", { d: "M20 6 9 17l-5-5" }) })),
};
// A section counts as empty (→ not rendered) for the common "no content" signals.
function isEmpty(node) {
    return node == null || node === false || node === '';
}
const DEFAULT_MENU_GLYPH = (_jsxs("svg", { width: "18", height: "18", viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true", children: [_jsx("circle", { cx: "12", cy: "5", r: "1.75" }), _jsx("circle", { cx: "12", cy: "12", r: "1.75" }), _jsx("circle", { cx: "12", cy: "19", r: "1.75" })] }));
function PhiCardMenu({ actions, icon, label, }) {
    return (_jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: _jsx("button", { type: "button", className: "mrs-phi-card__menu-trigger", "aria-label": label, children: icon ?? DEFAULT_MENU_GLYPH }) }), _jsx(DropdownMenu.Portal, { children: _jsx(DropdownMenu.Content, { className: "mrs-phi-card__menu", align: "end", sideOffset: 4, children: actions.map((action) => (_jsxs(DropdownMenu.Item, { className: cn('mrs-phi-card__menu-item', action.destructive && 'mrs-phi-card__menu-item--danger'), disabled: action.disabled, onSelect: () => action.onSelect(), children: [action.icon != null ? (_jsx("span", { className: "mrs-phi-card__menu-icon", children: action.icon })) : null, _jsx("span", { children: action.label })] }, action.label))) }) })] }));
}
const DEFAULT_DRAG_HANDLE = (_jsxs("svg", { width: "64", height: "12", viewBox: "0 0 64 12", fill: "currentColor", "aria-hidden": "true", opacity: "0.4", children: [_jsx("rect", { x: "0", y: "1", width: "64", height: "3", rx: "1.5" }), _jsx("rect", { x: "0", y: "8", width: "64", height: "3", rx: "1.5" })] }));
/**
 * Golden-ratio card. Width is the only size knob; height (= width / φ), the φ:1 split,
 * and a base font-size derive from it. The card owns its padding: a figure (`icon` /
 * `image`) fills its column, the text body is centered and flush-left at the split, and
 * the footer (`footer` structured, or `lower` freeform) spreads its rows evenly. The
 * bottom collapses (card shortens) when there's no footer.
 */
export const PhiCard = forwardRef(function PhiCard({ upper, content, image, imageAlt = '', icon, iconFill = false, lower, footer, divider = false, size = 'md', actions, menuIcon, menuLabel, corner, tone, color, accentPlacement = 'top', onClick, hoverable, dragHandle, dragHandleProps, dragHandleLabel, className, style: styleProp, }, ref) {
    const accent = resolveAccentColor(tone, color);
    const width = SIZE_WIDTH_PX[size];
    const hasIcon = !isEmpty(icon);
    const hasBody = !isEmpty(upper) || !isEmpty(content);
    const hasLowerContent = !isEmpty(lower);
    const lineCount = footer?.lines?.length ?? 0;
    const badgeCount = footer?.badges?.length ?? 0;
    const hasFooter = !!footer && (lineCount > 0 || badgeCount > 0);
    // Dev guards — fail loud on misuse (stripped from production builds).
    if (process.env.NODE_ENV !== 'production') {
        if (footer && hasLowerContent) {
            throw new Error('PhiCard: provide either `footer` or `lower`, not both.');
        }
        if (lineCount > FOOTER_LINE_CAP[size]) {
            throw new Error(`PhiCard: size="${size}" allows ${FOOTER_LINE_CAP[size]} footer line(s), got ${lineCount}.`);
        }
        if (badgeCount > FOOTER_BADGE_CAP[size]) {
            throw new Error(`PhiCard: size="${size}" allows ${FOOTER_BADGE_CAP[size]} footer badge(s), got ${badgeCount}.`);
        }
    }
    const hasBottom = hasFooter || hasLowerContent;
    // No bottom section → collapse to the top band's height (W/φ²), shorter by exactly
    // the bottom split rather than a full-height φ:1 box.
    const height = hasBottom ? width / PHI : width / (PHI * PHI);
    const isHoverable = hoverable ?? !!onClick;
    // The card-padded text body: title/subtitle (`upper`) + `content`, vertically
    // centered, flush-left.
    const body = hasBody ? (_jsxs("div", { className: "mrs-phi-card__body", children: [upper, content] })) : null;
    const figure = (_jsx("div", { className: cn('mrs-phi-card__figure', iconFill && 'mrs-phi-card__figure--fill'), children: icon }));
    // Top section. `image` is full-bleed; a figure+body splits 1 : φ (the figure column
    // runs to the card edge so it centers with equal border/content gaps); a lone figure
    // or a lone body sits in the edge padding.
    let topContent;
    let topSectionMod;
    if (image) {
        topContent = _jsx("img", { className: "mrs-phi-card__image", src: image, alt: imageAlt });
        topSectionMod = undefined;
    }
    else if (hasIcon && hasBody) {
        topContent = (_jsxs("div", { className: "mrs-phi-card__split", children: [figure, body] }));
        topSectionMod = 'mrs-phi-card__section--split';
    }
    else if (hasIcon) {
        topContent = figure;
        topSectionMod = 'mrs-phi-card__section--padded mrs-phi-card__section--lone-figure';
    }
    else {
        topContent = body;
        topSectionMod = hasBody ? 'mrs-phi-card__section--padded' : undefined;
    }
    // Footer = evenly-spread rows, each pairing the line at index `i` (left) with the
    // badge at index `i` (right) — so an equal-count footer aligns line-to-badge by row,
    // and the badge spacing is just the row spacing.
    let footerNode = null;
    if (footer && hasFooter) {
        const lines = footer.lines ?? [];
        const badges = footer.badges ?? [];
        const rowCount = Math.max(lines.length, badges.length);
        footerNode = (_jsx("div", { className: "mrs-phi-card__footer", children: Array.from({ length: rowCount }, (_, i) => {
                const line = lines[i];
                const badge = badges[i];
                return (_jsxs("div", { className: "mrs-phi-card__footer-row", children: [_jsxs("span", { className: "mrs-phi-card__footer-line", children: [line?.type ? (_jsx("span", { className: "mrs-phi-card__footer-icon", children: FOOTER_GLYPHS[line.type] })) : null, line ? _jsx("span", { className: "mrs-phi-card__footer-text", children: line.text }) : null] }), badge != null ? (_jsx("span", { className: "mrs-phi-card__footer-badge", children: badge })) : null] }, i));
            }) }));
    }
    // `corner` wins over the built-in menu; the inline `actions &&` lets TS narrow.
    const cornerNode = corner ??
        (actions && actions.length > 0 ? (_jsx(PhiCardMenu, { actions: actions, icon: menuIcon, label: menuLabel })) : null);
    const style = {
        ...styleProp,
        width: `${width}px`,
        height: `${height}px`,
        fontSize: `${SIZE_FONT_REM[size]}rem`,
        ...(accent != null ? { '--mrs-phi-accent': accent } : {}),
    };
    return (_jsxs("div", { ref: ref, className: cn('mrs-phi-card', !hasBottom && 'mrs-phi-card--single', isHoverable && 'mrs-phi-card--hoverable', accent != null && 'mrs-phi-card--accent', accent != null && `mrs-phi-card--accent-${accentPlacement}`, className), style: style, onClick: onClick, children: [dragHandle ? (_jsx("button", { type: "button", className: "mrs-phi-card__drag-handle", "aria-label": dragHandleLabel, ...dragHandleProps, onClick: (e) => {
                    e.stopPropagation();
                    dragHandleProps?.onClick?.(e);
                }, children: dragHandle === true ? DEFAULT_DRAG_HANDLE : dragHandle })) : null, _jsx("div", { className: cn('mrs-phi-card__section', topSectionMod), children: topContent }), hasBottom ? (_jsx("div", { className: cn('mrs-phi-card__section', 'mrs-phi-card__section--lower', divider && 'mrs-phi-card__section--divider'), children: hasFooter ? footerNode : lower })) : null, cornerNode != null ? (_jsx("div", { className: "mrs-phi-card__corner", onClick: (e) => e.stopPropagation(), children: cornerNode })) : null] }));
});
