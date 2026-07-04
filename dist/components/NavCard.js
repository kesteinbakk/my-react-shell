import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useId } from 'react';
import { cn } from './cn';
import { DynamicGridCard, } from './DynamicGridCard';
/**
 * A small **navigation-tile** variant of {@link DynamicGridCard}. It carries no `icon`;
 * its single `title` renders as the card's centred main content rather than a header.
 * Reach for it to build a grid of navigation links — pair it with `renderLink` for
 * whole-card navigation.
 *
 * Everything beyond icon/content is inherited from `DynamicGridCard`: typography/icon
 * scale follows the enclosing `DynamicCardGrid`'s `cardSize` (or `'md'` standalone),
 * `sizeLimit` to step its own width cap down, `renderLink` whole-card navigation (with
 * the accessible name auto-wired from `title`), `footer`, `corner`, `tone`/`color` accent,
 * `watermark`, the drag-reorder seam, `hoverable`/`lift`, and `shape`.
 */
export const NavCard = forwardRef(function NavCard({ title, renderLink, className, ...props }, ref) {
    // Preserve the card family's auto-wired accessible name. The title lives in the body
    // (not `DynamicGridCard`'s own header title), so give it an id and point the link
    // overlay at it via `aria-labelledby`.
    const titleId = useId();
    const wrappedRenderLink = renderLink
        ? (linkProps) => renderLink({ ...linkProps, 'aria-labelledby': titleId })
        : undefined;
    return (_jsx(DynamicGridCard, { ref: ref, ...props, className: cn('mrs-nav-card', className), renderLink: wrappedRenderLink, children: _jsx("span", { className: "mrs-nav-card__title", id: titleId, children: title }) }));
});
