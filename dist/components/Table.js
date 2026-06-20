import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo, useState } from 'react';
import { cn } from './cn';
/**
 * Opinionated data table: a column-config API with optional per-column sorting,
 * zebra striping, a sticky header, and an empty state — styled on the theme tokens.
 */
export function Table({ columns, data, rowKey, striped = true, empty = 'No data', className, }) {
    const [sort, setSort] = useState(null);
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
    return (_jsx("div", { className: cn('mrs-table-wrap', className), children: _jsxs("table", { className: "mrs-table", children: [_jsx("thead", { children: _jsx("tr", { children: columns.map((col) => {
                            const sortable = col.sortValue != null;
                            const activeDir = sort !== null && sort.key === col.key ? sort.dir : null;
                            return (_jsx("th", { className: cn(col.align != null && `mrs-table__cell--${col.align}`), "aria-sort": activeDir === null
                                    ? undefined
                                    : activeDir === 'asc'
                                        ? 'ascending'
                                        : 'descending', children: sortable ? (_jsxs("button", { type: "button", className: "mrs-table__sort", onClick: () => toggleSort(col), children: [col.header, _jsx("span", { className: "mrs-table__sort-icon", "aria-hidden": "true", children: activeDir === null ? '↕' : activeDir === 'asc' ? '▲' : '▼' })] })) : (col.header) }, col.key));
                        }) }) }), _jsx("tbody", { className: cn(striped && 'mrs-table__body--striped'), children: sorted.length === 0 ? (_jsx("tr", { children: _jsx("td", { className: "mrs-table__empty", colSpan: columns.length, children: empty }) })) : (sorted.map((row, index) => (_jsx("tr", { children: columns.map((col) => (_jsx("td", { className: cn(col.align != null && `mrs-table__cell--${col.align}`), children: col.render(row) }, col.key))) }, rowKey(row, index))))) })] }) }));
}
