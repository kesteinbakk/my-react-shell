export interface PreviewProps {
    /** Controlled open state. */
    open: boolean;
    /** Open-state change handler. */
    onOpenChange: (open: boolean) => void;
    /** Dialog heading. */
    title: string;
    /** The source URL, Blob, or File for the PDF. */
    file: string | Blob | File | null;
    /** Optional action buttons or content to render in the header. */
    actions?: React.ReactNode;
    /** Whether to show the print button. Defaults to true. */
    showPrintButton?: boolean;
    /** Label for the print button. */
    printLabel: string;
    /** Label for the close button. */
    closeLabel: string;
    /** Label shown when the document is loading. */
    loadingLabel: string;
    /** Label shown when document loading fails. */
    errorLabel: string;
    /** Label shown when the document has no data/pages. */
    noDataLabel: string;
    /** Label shown when no file is provided. */
    noFileLabel: string;
    /** 1-based page to open scrolled to. Omit or `≤ 1` opens at the top. Re-aligns
     *  over a short window as pages paint, so it lands accurately on lazy-rendered
     *  documents. */
    initialPage?: number;
    /**
     * Show the loading state in the body even when no `file` is set yet — so the
     * modal + backdrop can open instantly while the consumer fetches the document
     * (e.g. an auth-gated blob). Overrides the no-file state; once the file arrives
     * pass `loading={false}` with the `file`.
     */
    loading?: boolean;
    /** Classes applied to the content container. */
    className?: string;
}
/**
 * A modal PDF Preview component styled like a piece of paper.
 * It takes the full viewport height and adjusts width dynamically.
 * Renders pages using `react-pdf`.
 */
export declare function Preview({ open, onOpenChange, title, file, actions, showPrintButton, printLabel, closeLabel, loadingLabel, errorLabel, noDataLabel, noFileLabel, initialPage, loading, className, }: PreviewProps): import("react").JSX.Element;
