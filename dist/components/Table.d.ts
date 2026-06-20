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
export interface TableProps<Row> {
    columns: TableColumn<Row>[];
    data: Row[];
    /** Stable key per row. */
    rowKey: (row: Row, index: number) => string | number;
    /** Zebra striping. Defaults to `true`. */
    striped?: boolean;
    /** Shown in place of rows when `data` is empty. Defaults to `"No data"`. */
    empty?: ReactNode;
    className?: string;
}
/**
 * Opinionated data table: a column-config API with optional per-column sorting,
 * zebra striping, a sticky header, and an empty state — styled on the theme tokens.
 */
export declare function Table<Row>({ columns, data, rowKey, striped, empty, className, }: TableProps<Row>): import("react").JSX.Element;
