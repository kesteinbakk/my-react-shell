import { type HTMLAttributes } from 'react';
export type BaseCardSize = 'sm' | 'md' | 'lg' | 'xl';
export type BaseCardVariant = 'standard' | 'landscape';
export interface BaseCardProps extends HTMLAttributes<HTMLDivElement> {
    size?: BaseCardSize;
    variant?: BaseCardVariant;
}
/**
 * A purely structural card establishing the Phi golden ratio and size boundaries,
 * without any opinionated content layout. It stretches fully within its min/max boundaries.
 */
export declare const BaseCard: import("react").ForwardRefExoticComponent<BaseCardProps & import("react").RefAttributes<HTMLDivElement>>;
