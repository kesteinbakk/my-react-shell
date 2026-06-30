import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useMemo, Fragment } from 'react';
import { useTranslation } from '../i18n';
import { SearchInput } from './SearchInput';
import { SectionSpinner } from './Spinner';
import { Select } from './Select';
import { Switch } from './Switch';
import { Icon } from '../icons';
import { cn } from './cn';
import { DYNAMIC_GRID_CARD_MIN_WIDTH, DYNAMIC_GRID_CARD_MAX_WIDTH, DynamicCardGridSizeContext } from './DynamicGridCard';
const FILTER_VISIBILITY_MIN_ITEMS = 6;
function defaultSortCompare(a, b, key, dir) {
    const aVal = a[key];
    const bVal = b[key];
    let result = 0;
    if (typeof aVal === 'string' && typeof bVal === 'string') {
        result = aVal.localeCompare(bVal);
    }
    else if (typeof aVal === 'number' && typeof bVal === 'number') {
        result = aVal - bVal;
    }
    else {
        result = String(aVal ?? '').localeCompare(String(bVal ?? ''));
    }
    return dir === 'desc' ? -result : result;
}
function defaultSearchMatch(item, query, fields) {
    const lower = query.toLowerCase();
    return fields.some((field) => {
        const val = item[field];
        if (typeof val === 'string') {
            return val.toLowerCase().includes(lower);
        }
        return false;
    });
}
export function DynamicCardGrid({ items, renderCard, getKey, searchFields, searchFn, searchPlaceholder, filterThreshold = FILTER_VISIBILITY_MIN_ITEMS, filters, filterFn, sortOptions, defaultSort, sortFn, align = 'start', loading, emptyState, noResultsMessage, noResultsDescription, cardSize, minColumnWidth, }) {
    const { t } = useTranslation();
    const showFilterToolbar = filterThreshold === 0 || items.length >= filterThreshold;
    const [searchQuery, setSearchQuery] = useState('');
    const hasSearch = !!(searchFields?.length || searchFn);
    const showSearch = hasSearch && showFilterToolbar;
    const [filterState, setFilterState] = useState(() => {
        const state = {};
        for (const f of filters ?? []) {
            state[f.key] = f.defaultOn ?? true;
        }
        return state;
    });
    const toggleFilter = (key, checked) => {
        setFilterState((prev) => ({ ...prev, [key]: checked }));
    };
    const defaultSortKey = defaultSort?.key ?? sortOptions?.[0]?.key ?? '';
    const defaultSortDir = defaultSort?.dir ?? sortOptions?.[0]?.dir ?? 'asc';
    const [sortKey, setSortKey] = useState(defaultSortKey);
    const [sortDir, setSortDir] = useState(defaultSortDir);
    const resolveSortLabel = (opt) => {
        if (opt.label)
            return opt.label;
        const suffix = opt.labelKey ?? opt.key;
        const capitalised = suffix.charAt(0).toUpperCase() + suffix.slice(1);
        return t(`mrs.cardGrid.sortBy${capitalised}`);
    };
    const sortSelectOptions = useMemo(() => {
        return (sortOptions ?? []).map((opt) => ({
            value: opt.key,
            label: resolveSortLabel(opt),
        }));
    }, [sortOptions, t]);
    const handleSortChange = (value) => {
        if (typeof value !== 'string')
            return;
        const option = sortOptions?.find((o) => o.key === value);
        setSortKey(value);
        if (option?.dir) {
            setSortDir(option.dir);
        }
    };
    const toggleSortDir = () => {
        setSortDir((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    };
    const processedItems = useMemo(() => {
        let result = [...items];
        const query = searchQuery.trim();
        if (query) {
            if (searchFn) {
                result = result.filter((item) => searchFn(item, query));
            }
            else if (searchFields?.length) {
                result = result.filter((item) => defaultSearchMatch(item, query, searchFields));
            }
        }
        if (filterFn && filters?.length) {
            const active = new Set();
            for (const [key, on] of Object.entries(filterState)) {
                if (on)
                    active.add(key);
            }
            result = result.filter((item) => filterFn(item, active));
        }
        if (sortKey) {
            const comparator = sortFn ?? defaultSortCompare;
            result.sort((a, b) => comparator(a, b, sortKey, sortDir));
        }
        return result;
    }, [items, searchQuery, searchFn, searchFields, filterFn, filters, filterState, sortKey, sortDir, sortFn]);
    const hasItems = items.length > 0;
    const hasResults = processedItems.length > 0;
    const hasFilters = (filters?.length ?? 0) > 0;
    const hasSortOptions = (sortOptions?.length ?? 0) > 0;
    const showFilterGroup = showFilterToolbar && hasFilters;
    const showSortGroup = showFilterToolbar && hasSortOptions;
    const hasToolbar = hasItems && (showSearch || showFilterGroup || showSortGroup);
    return (_jsxs("div", { className: "mrs-dynamic-card-grid", children: [hasToolbar ? (_jsx("div", { className: "mrs-dynamic-card-grid__toolbar-wrap", children: _jsxs("div", { className: "mrs-dynamic-card-grid__toolbar", children: [showSearch ? (_jsx("div", { className: "mrs-dynamic-card-grid__search", children: _jsx(SearchInput, { inputSize: "sm", placeholder: searchPlaceholder ?? t('mrs.cardGrid.searchPlaceholder'), value: searchQuery, onChange: (e) => setSearchQuery(e.target.value) }) })) : null, showFilterGroup ? (_jsxs("div", { className: "mrs-dynamic-card-grid__filter-group", children: [_jsx(Icon, { icon: _jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" }), _jsx("circle", { cx: "12", cy: "12", r: "3" })] }), emoji: "\uD83D\uDC41\uFE0F", size: 14, className: "mrs-dynamic-card-grid__filter-icon" }), filters?.map((filter) => (_jsx(Switch, { label: filter.label, checked: filterState[filter.key] ?? true, onCheckedChange: (checked) => toggleFilter(filter.key, checked) }, filter.key)))] })) : null, showSortGroup ? (_jsxs("div", { className: "mrs-dynamic-card-grid__sort-group", children: [_jsx(Icon, { icon: _jsxs("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [_jsx("path", { d: "M3 6h18" }), _jsx("path", { d: "M7 12h10" }), _jsx("path", { d: "M10 18h4" })] }), emoji: "\u2195\uFE0F", size: 14, className: "mrs-dynamic-card-grid__filter-icon" }), _jsx("div", { className: "mrs-dynamic-card-grid__sort-select", children: _jsx(Select, { size: "sm", className: "mrs-dynamic-card-grid__sort-select-inner", options: sortSelectOptions, value: sortKey, onValueChange: handleSortChange, 
                                        // The sort control always has a selected value, so the placeholder never shows.
                                        placeholder: "" }) }), _jsx("button", { type: "button", className: "mrs-dynamic-card-grid__sort-dir", onClick: toggleSortDir, title: sortDir === 'asc' ? t('mrs.cardGrid.sortAsc') : t('mrs.cardGrid.sortDesc'), children: _jsx(Icon, { icon: sortDir === 'asc' ? _jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "m18 15-6-6-6 6" }) }) : _jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("path", { d: "m6 9 6 6 6-6" }) }), emoji: sortDir === 'asc' ? "⬆️" : "⬇️", size: 14 }) })] })) : null] }) })) : null, _jsx("div", { className: "mrs-dynamic-card-grid__scroll", children: loading ? (_jsx(SectionSpinner, {})) : !hasItems ? (_jsx("div", { className: "mrs-dynamic-card-grid__empty", children: emptyState ?? _jsx("p", { className: "mrs-dynamic-card-grid__empty-text", children: t('mrs.cardGrid.empty') }) })) : !hasResults ? (_jsxs("div", { className: "mrs-dynamic-card-grid__no-results", children: [_jsx("div", { className: "mrs-dynamic-card-grid__no-results-icon", children: _jsx(Icon, { icon: _jsx("svg", { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: _jsx("polygon", { points: "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" }) }), emoji: "\uD83C\uDF9B\uFE0F", size: 32 }) }), _jsx("p", { className: "mrs-dynamic-card-grid__no-results-msg", children: noResultsMessage ?? t('mrs.cardGrid.noResults') }), noResultsDescription ? (_jsx("p", { className: "mrs-dynamic-card-grid__no-results-desc", children: noResultsDescription })) : null] })) : (_jsx("div", { className: cn('mrs-dynamic-card-grid__cards', align === 'center' && 'mrs-dynamic-card-grid__cards--center'), style: (() => {
                        const vars = {};
                        if (minColumnWidth) {
                            vars['--mrs-dynamic-card-grid-min'] = minColumnWidth;
                        }
                        else if (cardSize) {
                            vars['--mrs-dynamic-card-grid-min'] = `${DYNAMIC_GRID_CARD_MIN_WIDTH[cardSize]}px`;
                            vars['--mrs-dynamic-card-grid-item-max'] = `${DYNAMIC_GRID_CARD_MAX_WIDTH[cardSize]}px`;
                        }
                        return Object.keys(vars).length > 0 ? vars : undefined;
                    })(), children: _jsx(DynamicCardGridSizeContext.Provider, { value: cardSize, children: processedItems.map((item) => (_jsx(Fragment, { children: renderCard(item) }, getKey(item)))) }) })) })] }));
}
