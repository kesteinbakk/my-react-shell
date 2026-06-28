import { type HTMLAttributes, type ReactNode } from 'react';
export type DynamicGridCardSize = 'sm' | 'md' | 'lg';
export type DynamicGridCardVariant = 'standard' | 'landscape';
export interface DynamicGridCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    size?: DynamicGridCardSize;
    variant?: DynamicGridCardVariant;
    title?: ReactNode;
    subtitle?: ReactNode;
}
export declare const DYNAMIC_GRID_CARD_MIN_WIDTH: Record<DynamicGridCardSize, number>;
export declare const DYNAMIC_GRID_CARD_MAX_WIDTH: Record<DynamicGridCardSize, number>;
/**
 * Fluid card for the {@link DynamicCardGrid}: it stretches to `width: 100%` of its
 * grid column and inherits the grid's max-width cap, keeping the golden-ratio shape via
 * `aspect-ratio`. Accepts optional named slots (`title`, `subtitle`) with the primary
 * content passed as `children`.
 */
export declare const DynamicGridCard: import("react").ForwardRefExoticComponent<DynamicGridCardProps & import("react").RefAttributes<HTMLDivElement>>;
