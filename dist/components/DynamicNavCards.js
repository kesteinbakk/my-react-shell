import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useContext, useId } from 'react';
import { cn } from './cn';
import { resolveAccentColor } from './accent';
import { DynamicCardGrid } from './DynamicCardGrid';
import { DynamicCardGridSizeContext } from './DynamicGridCard';
/**
 * `title` fit ladder: a short label renders very large (step `0`) and steps down through
 * progressively smaller sizes as it grows (`4` = smallest). Length-based; a non-string node
 * (no length to measure) takes the middle step. Pairs with the two-line clamp in CSS — the
 * smaller the font, the more of a long label the two-line box holds before it ellipsizes.
 */
function titleFit(title) {
    if (typeof title !== 'string')
        return 2;
    const n = title.trim().length;
    if (n <= 6)
        return 0;
    if (n <= 12)
        return 1;
    if (n <= 20)
        return 2;
    if (n <= 30)
        return 3;
    return 4;
}
/** One independent nav tile — its own element, never a `DynamicGridCard`. */
function NavTile({ title, renderLink, onClick, hoverable, lift = false, tone, color, accentPlacement = 'top', footer, corner, watermark, autoscaleWatermark = true, className, }) {
    const titleId = useId();
    // Typography scale follows the enclosing grid's `cardSize` (via context), falling back to
    // `'md'` with no enclosing grid — a tile never overrides its own scale.
    const gridSize = useContext(DynamicCardGridSizeContext);
    const effectiveSize = gridSize ?? 'md';
    const isHoverable = hoverable ?? !!onClick;
    const accentColor = resolveAccentColor(tone, color);
    const hasAccent = accentColor != null;
    const watermarkIsString = typeof watermark === 'string';
    const hasWatermark = watermarkIsString ? watermark.length > 0 : watermark != null;
    const hasArtWatermark = hasWatermark && !watermarkIsString;
    // Preserve the overlay anchor's accessible name: point it at the title span.
    const wrappedRenderLink = renderLink
        ? (linkProps) => renderLink({ ...linkProps, 'aria-labelledby': titleId })
        : undefined;
    const cssVars = { ...(hasAccent ? { '--mrs-stat-accent': accentColor } : {}) };
    return (_jsxs("div", { className: cn('mrs-dynamic-nav-card', `mrs-dynamic-nav-card--${effectiveSize}`, hasAccent && `mrs-dynamic-nav-card--accent-${accentPlacement}`, isHoverable && 'mrs-dynamic-nav-card--hoverable', isHoverable && lift && 'mrs-dynamic-nav-card--lift', renderLink && 'mrs-dynamic-nav-card--linked', hasWatermark && 'mrs-dynamic-nav-card--watermark', hasArtWatermark && 'mrs-reveal-host', className), style: cssVars, "data-watermark": watermarkIsString ? watermark : undefined, onClick: onClick, children: [wrappedRenderLink
                ? wrappedRenderLink({ className: 'mrs-dynamic-nav-card__link-overlay' })
                : null, hasArtWatermark ? (_jsx("div", { className: cn('mrs-dynamic-nav-card__watermark', autoscaleWatermark && 'mrs-dynamic-nav-card__watermark--glyph'), "aria-hidden": "true", children: watermark })) : null, corner != null ? _jsx("div", { className: "mrs-dynamic-nav-card__corner", children: corner }) : null, _jsx("div", { className: "mrs-dynamic-nav-card__body", children: _jsx("span", { className: "mrs-dynamic-nav-card__title", id: titleId, "data-fit": titleFit(title) || undefined, children: title }) }), footer != null ? _jsx("div", { className: "mrs-dynamic-nav-card__footer", children: footer }) : null] }));
}
/**
 * A **self-contained grid of navigation tiles**. Unlike the card family it renders its own
 * lean tile element (it does **not** use `DynamicGridCard`), but it drives that grid through
 * the same {@link DynamicCardGrid} — so it inherits its fluid `1fr` columns, `cardSize`
 * scale, and the built-in search / filter / sort toolbar. Each tile's single `title` grows
 * large when the label is short and steps down (clamped at two lines) as it lengthens, so a
 * grid of short nav labels reads big and bold.
 *
 * Drive it like `DynamicCardGrid`, but map each item to a tile with `getCard` instead of
 * `renderCard`:
 *
 * ```tsx
 * <DynamicNavCards
 *   items={areas}
 *   getKey={(a) => a.id}
 *   cardSize="md"
 *   getCard={(a) => ({ title: a.name, renderLink: (p) => <Link {...p} to={a.to} /> })}
 * />
 * ```
 */
export function DynamicNavCards({ getCard, ...gridProps }) {
    return _jsx(DynamicCardGrid, { ...gridProps, renderCard: (item) => _jsx(NavTile, { ...getCard(item) }) });
}
