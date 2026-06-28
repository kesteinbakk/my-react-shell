export interface PreviewProps {
    /** Controlled open state. */
    open: boolean;
    /** Open-state change handler. */
    onOpenChange: (open: boolean) => void;
    /** Dialog heading. */
    title: string;
    /** The source URL, Blob, or File for the PDF. */
    file: string | Blob | File | null;
    /** Optional content to render in the header, like a select menu. */
    headerContent?: React.ReactNode;
    /** Classes applied to the content container. */
    className?: string;
}
/**
 * A modal PDF Preview component styled like a piece of paper.
 * It takes the full viewport height and adjusts width dynamically.
 * Renders pages using `react-pdf`.
 */
export declare function Preview({ open, onOpenChange, title, file, headerContent, className, }: PreviewProps): import("react").JSX.Element;
