import { type ReactNode } from 'react';
export interface TableColumn<Row> {
    /** Stable column id (and React key). */
    key: string;
    header: ReactNode;
    /** Cell renderer for a row. */
    render: (row: Row) => ReactNode;
    /** Provide a comparable value to make the column sortable. */
    sortValue?: (row: Row) => string | number;
    align?: 'left' | 'right' | 'center';
}
/** Per-row semantic emphasis, themed via the `--color-*` tokens. */
export type TableRowVariant = 'default' | 'muted' | 'selected';
export interface TableProps<Row> {
    columns: TableColumn<Row>[];
    data: Row[];
    /** Stable key per row. */
    rowKey: (row: Row, index: number) => string | number;
    /** Zebra striping. Defaults to `true`. */
    striped?: boolean;
    /** Shown in place of rows when `data` is empty. Defaults to `"No data"`. */
    empty?: ReactNode;
    /**
     * Whole-row click. The row shows a pointer affordance + hover state. Clicks that
     * originate from interactive cell content (buttons, links, form controls, the
     * disclosure toggle) do **not** fire this handler, so in-cell controls keep working.
     */
    onRowClick?: (row: Row, index: number) => void;
    /**
     * Render an expandable detail region beneath a row. When provided, a leading
     * disclosure column appears; the table owns the per-row open/closed state and the
     * toggle, and renders the returned node in a full-width row directly below.
     */
    renderExpanded?: (row: Row) => ReactNode;
    /** Per-row semantic emphasis (`muted` / `selected`), themed via tokens. */
    rowVariant?: (row: Row, index: number) => TableRowVariant;
    className?: string;
}
/**
 * Opinionated data table: a column-config API with optional per-column sorting,
 * zebra striping, a sticky header, and an empty state — styled on the theme tokens.
 *
 * Supports whole-row clicks (`onRowClick`, guarded against in-cell controls), an
 * expandable per-row detail region (`renderExpanded`, with a kit-owned disclosure
 * toggle), and per-row emphasis (`rowVariant`). Columns are an ordinary array, so a
 * dynamic column set can be built at render time.
 */
export declare function Table<Row>({ columns, data, rowKey, striped, empty, onRowClick, renderExpanded, rowVariant, className, }: TableProps<Row>): import("react").JSX.Element;
