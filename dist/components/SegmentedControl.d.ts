import { type ReactNode, type CSSProperties } from 'react';
import { type Tone } from './tone';
export interface SegmentedOption<T extends string> {
    value: T;
    label: ReactNode;
    /** Optional icon node rendered beside the label. */
    icon?: ReactNode;
    /** Which side of the label the icon sits. Default `'leading'`. */
    iconPosition?: 'leading' | 'trailing';
    /**
     * Semantic tone — colours this option's label + icon (an `icon` using
     * `currentColor` inherits it), across active and inactive states. Omitted →
     * the default neutral chrome (secondary → primary on hover/active).
     */
    tone?: Tone;
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
    style?: CSSProperties;
}
/**
 * Single-select segmented control — a row of mutually-exclusive options on a track,
 * the active one lifted onto a surface chip. Controlled via `value` / `onChange`.
 */
export declare function SegmentedControl<T extends string>({ options, value, onChange, size, fullWidth, className, style, ...rest }: SegmentedControlProps<T>): import("react").JSX.Element;
