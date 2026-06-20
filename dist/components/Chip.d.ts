import type { ReactNode } from 'react';
export interface ChipProps {
    children?: ReactNode;
    /** Selected styling (for toggle chips). */
    selected?: boolean;
    /** Makes the label a toggle button calling this. */
    onClick?: () => void;
    /** Shows a remove (×) button calling this. */
    onRemove?: () => void;
    /** Accessible label for the remove button. Defaults to `"Remove"`. */
    removeLabel?: string;
    className?: string;
}
/**
 * A tag / chip — plain, toggleable (`onClick` + `selected`), or removable
 * (`onRemove`). The label and the remove control are separate buttons, so a
 * removable toggle chip never nests interactive elements.
 */
export declare function Chip({ children, selected, onClick, onRemove, removeLabel, className, }: ChipProps): import("react").JSX.Element;
export interface ChipGroupProps {
    children?: ReactNode;
    className?: string;
}
/** Wrapping flex layout for a set of chips. Selection state lives at the call site. */
export declare function ChipGroup({ children, className }: ChipGroupProps): import("react").JSX.Element;
