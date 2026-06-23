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
    /**
     * Per-cell expansion content. When provided, clicking cells in this column toggles
     * an expandable detail region below the row, keyed to this column. Only one cell
     * across the whole table is open at a time (radio-style). The cell shows a pointer
     * affordance when this is set.
     */
    cellExpand?: (row: Row) => ReactNode;
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
     * disclosure toggle, or per-cell expand cells) do **not** fire this handler.
     */
    onRowClick?: (row: Row, index: number) => void;
    /**
     * Render an expandable detail region beneath a row. When provided, a leading
     * disclosure column appears; the table owns the per-row open/closed state and the
     * toggle, and renders the returned node in a full-width row directly below.
     *
     * Pair with `renderDisclosure` to replace the kit's chevron button with a
     * consumer-supplied control.
     */
    renderExpanded?: (row: Row) => ReactNode;
    /**
     * Custom disclosure control for the leading expand cell. When provided alongside
     * `renderExpanded`, the kit calls this instead of rendering its own chevron button.
     * Receives the row, whether the detail region is currently open, and a `toggle`
     * function to open/close it. The kit still owns the state; the cell loses its
     * fixed `2.5rem` width so the control can size naturally.
     */
    renderDisclosure?: (row: Row, isOpen: boolean, toggle: () => void) => ReactNode;
    /** Per-row semantic emphasis (`muted` / `selected`), themed via tokens. */
    rowVariant?: (row: Row, index: number) => TableRowVariant;
    /**
     * Remove the wrapper's border and border-radius so the table nests cleanly inside
     * a `Card` without a double border. The consumer's card is the single frame.
     */
    frameless?: boolean;
    className?: string;
}
/**
 * Opinionated data table: a column-config API with optional per-column sorting,
 * zebra striping, a sticky header, and an empty state — styled on the theme tokens.
 *
 * Supports whole-row clicks (`onRowClick`), an expandable per-row detail region
 * (`renderExpanded` with optional `renderDisclosure` for a custom toggle), per-cell
 * expansion (`TableColumn.cellExpand`), per-row emphasis (`rowVariant`), and a
 * `frameless` mode for nesting inside a `Card` without a double border.
 */
export declare function Table<Row>({ columns, data, rowKey, striped, empty, onRowClick, renderExpanded, renderDisclosure, rowVariant, frameless, className, }: TableProps<Row>): import("react").JSX.Element;
