import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Fragment, useMemo, useState } from 'react';
import { cn } from './cn';
/** Click targets that should suppress a whole-row `onRowClick`. */
const INTERACTIVE_SELECTOR = 'button, a, input, select, textarea, label, [role="button"]';
/**
 * Opinionated data table: a column-config API with optional per-column sorting,
 * zebra striping, a sticky header, and an empty state — styled on the theme tokens.
 *
 * Supports whole-row clicks (`onRowClick`, guarded against in-cell controls), an
 * expandable per-row detail region (`renderExpanded`, with a kit-owned disclosure
 * toggle), and per-row emphasis (`rowVariant`). Columns are an ordinary array, so a
 * dynamic column set can be built at render time.
 */
export function Table({ columns, data, rowKey, striped = true, empty = 'No data', onRowClick, renderExpanded, rowVariant, className, }) {
    const [sort, setSort] = useState(null);
    const [openRows, setOpenRows] = useState(() => new Set());
    const sorted = useMemo(() => {
        if (sort === null)
            return data;
        const col = columns.find((c) => c.key === sort.key);
        if (col?.sortValue == null)
            return data;
        const sortValue = col.sortValue;
        return [...data].sort((a, b) => {
            const av = sortValue(a);
            const bv = sortValue(b);
            if (av < bv)
                return sort.dir === 'asc' ? -1 : 1;
            if (av > bv)
                return sort.dir === 'asc' ? 1 : -1;
            return 0;
        });
    }, [data, columns, sort]);
    function toggleSort(col) {
        if (col.sortValue == null)
            return;
        setSort((prev) => prev !== null && prev.key === col.key
            ? { key: col.key, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
            : { key: col.key, dir: 'asc' });
    }
    function toggleRow(key) {
        setOpenRows((prev) => {
            const next = new Set(prev);
            if (next.has(key))
                next.delete(key);
            else
                next.add(key);
            return next;
        });
    }
    function handleRowClick(row, index, e) {
        if (onRowClick == null)
            return;
        if (e.target.closest(INTERACTIVE_SELECTOR) != null)
            return;
        onRowClick(row, index);
    }
    const expandable = renderExpanded != null;
    const totalCols = columns.length + (expandable ? 1 : 0);
    return (_jsx("div", { className: cn('mrs-table-wrap', className), children: _jsxs("table", { className: "mrs-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [expandable ? _jsx("th", { className: "mrs-table__expand-cell", "aria-hidden": "true" }) : null, columns.map((col) => {
                                const sortable = col.sortValue != null;
                                const activeDir = sort !== null && sort.key === col.key ? sort.dir : null;
                                return (_jsx("th", { className: cn(col.align != null && `mrs-table__cell--${col.align}`), "aria-sort": activeDir === null
                                        ? undefined
                                        : activeDir === 'asc'
                                            ? 'ascending'
                                            : 'descending', children: sortable ? (_jsxs("button", { type: "button", className: "mrs-table__sort", onClick: () => toggleSort(col), children: [col.header, _jsx("span", { className: "mrs-table__sort-icon", "aria-hidden": "true", children: activeDir === null ? '↕' : activeDir === 'asc' ? '▲' : '▼' })] })) : (col.header) }, col.key));
                            })] }) }), _jsx("tbody", { className: cn(striped && 'mrs-table__body--striped'), children: sorted.length === 0 ? (_jsx("tr", { children: _jsx("td", { className: "mrs-table__empty", colSpan: totalCols, children: empty }) })) : (sorted.map((row, index) => {
                        const key = rowKey(row, index);
                        const variant = rowVariant?.(row, index) ?? 'default';
                        const isOpen = expandable && openRows.has(key);
                        return (_jsxs(Fragment, { children: [_jsxs("tr", { className: cn(variant !== 'default' && `mrs-table__row--${variant}`, onRowClick != null && 'mrs-table__row--clickable'), onClick: onRowClick != null ? (e) => handleRowClick(row, index, e) : undefined, children: [expandable ? (_jsx("td", { className: "mrs-table__expand-cell", children: _jsx("button", { type: "button", className: "mrs-table__expand-toggle", "aria-expanded": isOpen, "aria-label": isOpen ? 'Collapse row' : 'Expand row', onClick: () => toggleRow(key), children: _jsx("span", { className: cn('mrs-table__expand-chevron', isOpen && 'mrs-table__expand-chevron--open'), "aria-hidden": "true", children: "\u203A" }) }) })) : null, columns.map((col) => (_jsx("td", { className: cn(col.align != null && `mrs-table__cell--${col.align}`), children: col.render(row) }, col.key)))] }), isOpen ? (_jsx("tr", { className: "mrs-table__expanded-row", children: _jsx("td", { className: "mrs-table__expanded-cell", colSpan: totalCols, children: renderExpanded(row) }) })) : null] }, key));
                    })) })] }) }));
}
