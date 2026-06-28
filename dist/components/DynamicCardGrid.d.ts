import { type ReactNode } from 'react';
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
export interface DynamicCardGridProps<T> {
    items: T[];
    renderCard: (item: T) => ReactNode;
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
    cardSize?: import('./DynamicGridCard').DynamicGridCardSize;
    minColumnWidth?: string;
}
export declare function DynamicCardGrid<T>({ items, renderCard, getKey, searchFields, searchFn, searchPlaceholder, filterThreshold, filters, filterFn, sortOptions, defaultSort, sortFn, align, loading, emptyState, noResultsMessage, noResultsDescription, cardSize, minColumnWidth, }: DynamicCardGridProps<T>): import("react").JSX.Element;
