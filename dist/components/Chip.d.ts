import type { ReactNode } from 'react';
interface ChipBaseProps {
    children?: ReactNode;
    /** Selected styling (for toggle chips). */
    selected?: boolean;
    /** Makes the label a toggle button calling this. */
    onClick?: () => void;
    className?: string;
}
/**
 * Remove-button props: when `onRemove` is set the ✕ renders, its accessible label
 * defaulting to the shell's built-in "Remove" (`mrs.action.remove`); pass
 * `removeLabel` to override. Omit both for a non-removable chip.
 */
type ChipRemoveProps = {
    onRemove: () => void;
    removeLabel?: string;
} | {
    onRemove?: undefined;
    removeLabel?: undefined;
};
export type ChipProps = ChipBaseProps & ChipRemoveProps;
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
export {};
