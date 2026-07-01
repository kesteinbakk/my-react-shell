import { isValidElement } from 'react';
/**
 * Discriminate the `{ content, placement }` icon config from a bare `ReactNode` shorthand.
 * A config is a plain object carrying `content`; a React element, array, or primitive is the
 * shorthand (implies `{ content: icon, placement: 'title' }`).
 */
export function isIconConfig(icon) {
    return typeof icon === 'object' && icon !== null && !isValidElement(icon) && !Array.isArray(icon) && 'content' in icon;
}
/**
 * Resolve the requested placement to the one actually rendered. `'upperLeft'` sits at the same
 * top-left corner where the `title`/`subtitle` block starts — with either present, the corner
 * overlay would land on top of that text, so it falls back to `'title'` (in-flow, beside the
 * title) instead. Silent, not a dev-throw: unlike the per-card slot collisions (e.g. `'upperRight'`
 * vs `medallion`), this isn't an opt-in combination the consumer chose to combine — `title` is
 * mandatory on three of the four cards, so treating it as an error would make `'upperLeft'`
 * effectively unusable there.
 */
export function resolveCardIconPlacement(placement, hasTitleOrSubtitle) {
    if (placement === 'upperLeft' && hasTitleOrSubtitle)
        return 'title';
    return placement;
}
