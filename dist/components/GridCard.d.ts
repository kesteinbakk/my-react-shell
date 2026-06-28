import { type HTMLAttributes, type ReactNode } from 'react';
export type GridCardSize = 'sm' | 'md' | 'lg';
export type GridCardVariant = 'standard' | 'landscape';
export interface GridCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    size?: GridCardSize;
    variant?: GridCardVariant;
    title?: ReactNode;
    subtitle?: ReactNode;
}
export declare const GRID_CARD_MIN_WIDTH: Record<GridCardSize, number>;
export declare const GRID_CARD_MAX_WIDTH: Record<GridCardSize, number>;
/**
 * A structural card establishing the Phi golden ratio and size boundaries.
 * Accepts optional named slots (title, subtitle, footer) while preserving children for main body.
 */
export declare const GridCard: import("react").ForwardRefExoticComponent<GridCardProps & import("react").RefAttributes<HTMLDivElement>>;
