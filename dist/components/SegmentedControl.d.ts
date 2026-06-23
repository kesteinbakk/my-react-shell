import type { ReactNode } from 'react';
export interface SegmentedOption<T extends string> {
    value: T;
    label: ReactNode;
    disabled?: boolean;
}
export interface SegmentedControlProps<T extends string> {
    options: SegmentedOption<T>[];
    /** Selected value (controlled). */
    value: T;
    onChange: (value: T) => void;
    size?: 'sm' | 'md';
    /** Stretch to fill the available container width. Defaults to `false`. */
    fullWidth?: boolean;
    /** Accessible label for the group. */
    'aria-label'?: string;
    className?: string;
}
/**
 * Single-select segmented control — a row of mutually-exclusive options on a track,
 * the active one lifted onto a surface chip. Controlled via `value` / `onChange`.
 */
export declare function SegmentedControl<T extends string>({ options, value, onChange, size, fullWidth, className, ...rest }: SegmentedControlProps<T>): import("react").JSX.Element;
