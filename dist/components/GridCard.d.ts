import { type HTMLAttributes, type ReactNode } from 'react';
export type GridCardSize = 'sm' | 'md' | 'lg' | 'xl';
export type GridCardVariant = 'standard' | 'landscape';
export interface GridCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    size?: GridCardSize;
    variant?: GridCardVariant;
    title?: ReactNode;
    subtitle?: ReactNode;
    footer?: ReactNode;
}
/**
 * A structural card establishing the Phi golden ratio and size boundaries.
 * Accepts optional named slots (title, subtitle, footer) while preserving children for main body.
 */
export declare const GridCard: import("react").ForwardRefExoticComponent<GridCardProps & import("react").RefAttributes<HTMLDivElement>>;
