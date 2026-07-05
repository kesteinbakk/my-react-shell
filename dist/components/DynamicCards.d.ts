import { type ReactNode } from 'react';
import { type DynamicCardProps, type DynamicCardSize } from './DynamicCard';
export interface ToggleFilter {
    key: string;
    label: string;
    defaultOn?: boolean;
}
export interface SortOption {
    key: string;
    label?: string;
    labelKey?: string;
    dir?: 'asc' | 'desc';
}
/**
 * Builds the tile for one item, deferred so wrapper-injected props reach it at the right
 * tree depth. Call it inside {@link DynamicCardsProps.wrapCard} — optionally passing a
 * `Partial<DynamicCardProps>` override (e.g. a drag library's `dragHandleProps`, which are
 * only known *inside* the per-item wrapper). See `wrapCard`.
 */
export type DynamicCardBuilder = (override?: Partial<DynamicCardProps>) => ReactNode;
/** Grid-level props shared by both the `getCard` and `renderCard` forms. */
export interface DynamicCardsCommonProps<T> {
    items: T[];
    getKey: (item: T) => string;
    searchFields?: (keyof T)[];
    searchFn?: (item: T, query: string) => boolean;
    searchPlaceholder?: string;
    filterThreshold?: number;
    filters?: ToggleFilter[];
    filterFn?: (item: T, activeFilters: Set<string>) => boolean;
    sortOptions?: SortOption[];
    defaultSort?: {
        key: string;
        dir: 'asc' | 'desc';
    };
    sortFn?: (a: T, b: T, key: string, dir: 'asc' | 'desc') => number;
    align?: 'start' | 'center';
    loading?: boolean;
    emptyState?: ReactNode;
    noResultsMessage?: string;
    noResultsDescription?: string;
    cardSize?: DynamicCardSize;
    minColumnWidth?: string;
}
/**
 * Props for {@link DynamicCards}. The grid engine (search / filter / sort / size / empty
 * states) plus exactly one of two card seams:
 *
 * - **`getCard`** — map each item to a {@link DynamicCardProps}; the grid renders the
 *   `DynamicCard` for you (the "one level up" ergonomic path). Optionally pair with
 *   **`wrapCard`** to wrap each tile (e.g. a drag `Sortable`) without dropping to
 *   `renderCard` — `wrapCard` receives a lazy {@link DynamicCardBuilder} so wrapper-injected
 *   props (a DnD library's `dragHandleProps`) reach the card at the correct depth.
 * - **`renderCard`** — the raw escape hatch: render any node per item (a foreign card type,
 *   a fully custom layout). No `wrapCard` (you already own the full node).
 */
export type DynamicCardsProps<T> = DynamicCardsCommonProps<T> & ({
    getCard: (item: T) => DynamicCardProps;
    wrapCard?: (item: T, buildCard: DynamicCardBuilder) => ReactNode;
    renderCard?: never;
} | {
    renderCard: (item: T) => ReactNode;
    getCard?: never;
    wrapCard?: never;
});
export declare function DynamicCards<T>({ items, getCard, renderCard, wrapCard, getKey, searchFields, searchFn, searchPlaceholder, filterThreshold, filters, filterFn, sortOptions, defaultSort, sortFn, align, loading, emptyState, noResultsMessage, noResultsDescription, cardSize, minColumnWidth, }: DynamicCardsProps<T>): import("react").JSX.Element;
