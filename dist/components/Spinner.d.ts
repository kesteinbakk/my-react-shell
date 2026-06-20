export type SpinnerSize = 'sm' | 'md' | 'lg';
export interface SpinnerProps {
    /** Visual size. Defaults to `md`. */
    size?: SpinnerSize;
    /** Accessible label. Defaults to `"Loading"`. */
    label?: string;
    className?: string;
}
/** Inline loading indicator — a rotating ring on the current text color. */
export declare function Spinner({ size, label, className }: SpinnerProps): import("react").JSX.Element;
export interface SpinnerBlockProps {
    size?: SpinnerSize;
    label?: string;
    className?: string;
}
/** Full-height centered spinner for a page / route loading state. */
export declare function PageSpinner({ size, label, className }: SpinnerBlockProps): import("react").JSX.Element;
/** Centered spinner for a content section or card body. */
export declare function SectionSpinner({ size, label, className }: SpinnerBlockProps): import("react").JSX.Element;
