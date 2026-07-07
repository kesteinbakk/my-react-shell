import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { isValidElement, useContext, useId } from 'react';
import { cn } from './cn';
import { resolveAccentColor } from './accent';
import { DynamicCards } from './DynamicCards';
import { DynamicCardsSizeContext } from './DynamicCard';
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
/**
 * One independent nav tile — the single-tile primitive behind `DynamicNavCards`.
 * Exported so a consumer can place a lone tile outside the grid (e.g. wrapped in a
 * drag handle), keeping the exact tile look without a `DynamicCard`. Props are
 * one {@link DynamicNavCard}.
 */
export function NavTile({ title, contentPlacement = 'top', renderLink, onClick, hoverable, lift = false, tone, color, accentPlacement = 'top', footer, corner, watermark, watermarkVariant = 'faint', autoscaleWatermark = true, className, }) {
    const titleId = useId();
    // Typography scale follows the enclosing grid's `cardSize` (via context), falling back to
    // `'md'` with no enclosing grid — a tile never overrides its own scale.
    const gridSize = useContext(DynamicCardsSizeContext);
    const effectiveSize = gridSize ?? 'md';
    const isHoverable = hoverable ?? !!onClick;
    const accentColor = resolveAccentColor(tone, color);
    const hasAccent = accentColor != null;
    // Resolve the `footer` shorthand: a bare node is `{ center: node }`; a plain (non-element,
    // non-array) object is already the three-slot form.
    const footerSlots = footer == null
        ? null
        : typeof footer === 'object' && !isValidElement(footer) && !Array.isArray(footer)
            ? footer
            : { center: footer };
    const watermarkIsString = typeof watermark === 'string';
    const hasWatermark = watermarkIsString ? watermark.length > 0 : watermark != null;
    const hasArtWatermark = hasWatermark && !watermarkIsString;
    // Preserve the overlay anchor's accessible name: point it at the title span.
    const wrappedRenderLink = renderLink
        ? (linkProps) => renderLink({ ...linkProps, 'aria-labelledby': titleId })
        : undefined;
    const cssVars = { ...(hasAccent ? { '--mrs-stat-accent': accentColor } : {}) };
    return (_jsxs("div", { className: cn('mrs-dynamic-nav-card', `mrs-dynamic-nav-card--${effectiveSize}`, `mrs-dynamic-nav-card--content-${contentPlacement}`, hasAccent && `mrs-dynamic-nav-card--accent-${accentPlacement}`, isHoverable && 'mrs-dynamic-nav-card--hoverable', isHoverable && lift && 'mrs-dynamic-nav-card--lift', renderLink && 'mrs-dynamic-nav-card--linked', hasWatermark && 'mrs-dynamic-nav-card--watermark', hasWatermark && watermarkVariant === 'solid' && 'mrs-dynamic-nav-card--watermark-solid', hasArtWatermark && 'mrs-reveal-host', className), style: cssVars, "data-watermark": watermarkIsString ? watermark : undefined, onClick: onClick, children: [wrappedRenderLink
                ? wrappedRenderLink({ className: 'mrs-dynamic-nav-card__link-overlay' })
                : null, hasArtWatermark ? (_jsx("div", { className: cn('mrs-dynamic-nav-card__watermark', autoscaleWatermark && 'mrs-dynamic-nav-card__watermark--glyph'), "aria-hidden": "true", children: watermark })) : null, corner != null ? _jsx("div", { className: "mrs-dynamic-nav-card__corner", children: corner }) : null, _jsx("div", { className: "mrs-dynamic-nav-card__body", children: _jsx("span", { className: "mrs-dynamic-nav-card__title", id: titleId, "data-fit": titleFit(title) || undefined, children: title }) }), footerSlots != null ? (_jsxs("div", { className: "mrs-dynamic-nav-card__footer", children: [_jsx("span", { className: "mrs-dynamic-nav-card__footer-left", children: footerSlots.left }), _jsx("span", { className: "mrs-dynamic-nav-card__footer-center", children: footerSlots.center }), _jsx("span", { className: "mrs-dynamic-nav-card__footer-right", children: footerSlots.right })] })) : null] }));
}
/**
 * A **self-contained grid of navigation tiles**. Unlike the card family it renders its own
 * lean tile element (it does **not** use `DynamicCard`), but it drives that grid through
 * the same {@link DynamicCards} — so it inherits its fluid `1fr` columns, `cardSize`
 * scale, and the built-in search / filter / sort toolbar. Each tile's single `title` grows
 * large when the label is short and steps down (clamped at two lines) as it lengthens, so a
 * grid of short nav labels reads big and bold.
 *
 * Drive it like `DynamicCards`, but map each item to a tile with `getCard` instead of
 * `renderCard`. Pass `wrapCard` to wrap each tile (e.g. a drag `Sortable`):
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
export function DynamicNavCards({ getCard, wrapCard, ...gridProps }) {
    return (_jsx(DynamicCards, { ...gridProps, renderCard: (item) => {
            const buildCard = (override) => _jsx(NavTile, { ...getCard(item), ...override });
            return wrapCard ? wrapCard(item, buildCard) : buildCard();
        } }));
}
