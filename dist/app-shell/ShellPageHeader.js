import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useRouterState } from '@tanstack/react-router';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useShellContext } from './shellContext';
/**
 * Registers its spec onto shell context and renders nothing. The effect
 * re-registers whenever a prop changes (deps below), pushing a fresh spec and
 * re-rendering the chrome; the cleanup pops it.
 */
export function ShellPageHeader(props) {
    const shell = useShellContext();
    useEffect(() => {
        const spec = {
            title: props.title,
            actions: props.actions,
            search: props.search,
            tabs: props.tabs,
            documentTitle: props.documentTitle,
            className: props.className,
        };
        return shell.registerPageHeader(spec);
    }, [
        shell.registerPageHeader,
        props.title,
        props.actions,
        props.search,
        props.tabs,
        props.documentTitle,
        props.className,
    ]);
    return null;
}
/**
 * Resolve the breadcrumb chain for a pathname. PURE — a function of the URL
 * pathname plus the static `roots` tree and the runtime `dynamicByParent` map.
 * At each level it merges the parent's dynamic children into the candidate pool,
 * picks the longest route that prefixes the pathname, then descends via that
 * entry's `subPages`. Stops at a leaf with no further match.
 */
export function findActiveChain(roots, pathname, dynamicByParent) {
    const chain = [];
    let pool = roots;
    // The parent route whose dynamic children merge into the next level. '' keys
    // the top-level dynamic registrations (parent is the shell root).
    let parentKey = '';
    while (true) {
        const dynamicHere = dynamicByParent[parentKey] ?? [];
        const merged = [...pool, ...dynamicHere];
        let best;
        for (const entry of merged) {
            if (pathname === entry.route ||
                (entry.route !== '/' && pathname.startsWith(entry.route + '/'))) {
                if (best === undefined || entry.route.length > best.route.length) {
                    best = entry;
                }
            }
        }
        if (best === undefined)
            break;
        chain.push({ entry: best, siblings: merged });
        parentKey = best.route;
        pool = best.subPages ?? [];
        if (pool.length === 0 && !(parentKey in dynamicByParent))
            break;
    }
    return chain;
}
/**
 * Renders the page-header band: breadcrumbs (optional leading hamburger), the
 * actions cluster, the search input, and an optional pinned tabs row.
 */
export function ShellPageHeaderUI(props) {
    const { spec, shell, showMenuButton, onOpenMenu } = props;
    const config = shell.config;
    const pathname = useRouterState({ select: s => s.location.pathname });
    const chain = useMemo(() => findActiveChain(config.pages, pathname, shell.dynamicPages), [config.pages, pathname, shell.dynamicPages]);
    const leaf = chain.at(-1);
    // The resolved leaf truly matches the current path (not just an ancestor).
    const leafMatchesPath = leaf !== undefined && leaf.entry.route === pathname;
    // DEV warning when the route resolves to no registered leaf: the breadcrumb
    // can only show ancestors, never this page. Surfaced once per resolution.
    // Exempt: dynamic parents (the child is transient/data-driven, not a config
    // bug) and the site root (a chrome-only header at "/" is the correct pattern
    // since registering "/" as a page now throws).
    useEffect(() => {
        if (!import.meta.env.DEV)
            return;
        if (leafMatchesPath)
            return;
        if (leaf && leaf.entry.route in shell.dynamicPages)
            return;
        if (!leaf && pathname === '/')
            return;
        const ancestor = leaf ? leaf.entry.route : '(none)';
        console.warn(`[AppShell] No registered page for "${pathname}" (nearest ancestor: ${ancestor}). ` +
            'Register it in shell config `pages` or via useDynamicPages.');
    }, [pathname, leafMatchesPath, leaf, shell.dynamicPages]);
    const border = config.shellPageHeader?.border ?? true;
    // The band exists only to host the mobile hamburger when there is nothing
    // else to show: no crumbs beyond home, no actions, no search, no tabs.
    const hasActions = (spec.actions?.length ?? 0) > 0;
    const hasSearch = spec.search !== undefined;
    const hasTabs = spec.tabs !== undefined;
    const menuOnly = chain.length === 0 && !hasActions && !hasSearch && !hasTabs;
    const className = spec.className
        ? `mrs-page-header ${spec.className}`
        : 'mrs-page-header';
    return (_jsxs("div", { className: className, "data-border": border, "data-menu-only": menuOnly, children: [_jsxs("div", { className: "mrs-page-header__row", children: [_jsx(Breadcrumbs, { chain: chain, shell: shell, spec: spec, leafMatchesPath: leafMatchesPath, showMenuButton: showMenuButton, onOpenMenu: onOpenMenu }), hasActions ? (_jsx("div", { className: "mrs-page-header__actions", children: spec.actions.map((thunk, i) => (_jsx("span", { children: thunk() }, i))) })) : null, spec.search ? _jsx(SearchInput, { slot: spec.search, shell: shell }) : null] }), spec.tabs ? (_jsx("div", { className: "mrs-page-header__tabs", children: spec.tabs() })) : null] }));
}
/** Default middle-collapse: keep the first crumb + the last two (incl. leaf). */
const DEFAULT_BREADCRUMB_COLLAPSE = {
    leading: 1,
    trailing: 2,
};
/**
 * Collapse the middle of a long chain. With `collapse === false`, every level is
 * shown. Otherwise, when the chain has more than `leading + trailing` levels, the
 * middle ones fold into a single overflow slot. `trailing` is clamped to ≥ 1 so the
 * leaf always survives, `leading` to ≥ 0.
 */
function buildCrumbSlots(chain, collapse) {
    const all = chain.map((level, index) => ({
        kind: 'level',
        level,
        index,
    }));
    if (collapse === false)
        return all;
    const leading = Math.max(0, collapse?.leading ?? DEFAULT_BREADCRUMB_COLLAPSE.leading);
    const trailing = Math.max(1, collapse?.trailing ?? DEFAULT_BREADCRUMB_COLLAPSE.trailing);
    if (chain.length <= leading + trailing)
        return all;
    const hidden = chain.slice(leading, chain.length - trailing);
    return [
        ...all.slice(0, leading),
        { kind: 'overflow', hidden },
        ...all.slice(chain.length - trailing),
    ];
}
function Breadcrumbs(props) {
    const { chain, shell, spec, leafMatchesPath, showMenuButton, onOpenMenu } = props;
    const config = shell.config;
    const homeLabel = config.labels?.home?.() ?? 'Home';
    const navLabel = config.labels?.breadcrumb?.() ?? 'Breadcrumb';
    const openMenuLabel = config.labels?.openMenu?.() ?? 'Open menu';
    const lastIndex = chain.length - 1;
    // The spec title overrides only the leaf label, and only when the resolved
    // leaf is the current page (Hard Rule #2: title never adds a level).
    const leafOverride = spec.title && leafMatchesPath ? spec.title() : undefined;
    const slots = buildCrumbSlots(chain, config.shellPageHeader?.breadcrumbCollapse);
    return (_jsxs("nav", { className: "mrs-breadcrumbs", "aria-label": navLabel, children: [showMenuButton ? (_jsx("button", { type: "button", className: "mrs-page-header__hamburger", "aria-label": openMenuLabel, onClick: onOpenMenu, children: config.renderIcon('menu', 20) })) : null, _jsx(Link, { to: "/", className: "mrs-breadcrumbs__home", title: homeLabel, children: config.renderIcon('home', 18) }), slots.map(slot => {
                const chevron = (_jsx("span", { className: "mrs-breadcrumbs__chevron", children: config.renderIcon('chevronRight', 14) }));
                if (slot.kind === 'overflow') {
                    return (_jsxs("span", { className: "mrs-breadcrumbs__crumb", children: [chevron, _jsx(OverflowCrumb, { shell: shell, hidden: slot.hidden })] }, "overflow"));
                }
                const { level, index } = slot;
                const isLeaf = index === lastIndex;
                const label = isLeaf && leafOverride !== undefined
                    ? leafOverride
                    : level.entry.label();
                return (_jsxs("span", { className: "mrs-breadcrumbs__crumb", children: [chevron, isLeaf ? (level.siblings.length > 1 ? (_jsx(LeafDropdown, { shell: shell, label: label, siblings: level.siblings, selectedId: level.entry.id })) : (_jsx("span", { className: "mrs-breadcrumbs__leaf", title: label, children: _jsx("span", { className: "mrs-breadcrumbs__label", children: label }) }))) : (_jsx(Link, { to: level.entry.route, className: "mrs-breadcrumbs__link", title: label, children: _jsx("span", { className: "mrs-breadcrumbs__label", children: label }) }))] }, level.entry.id));
            })] }));
}
/**
 * The "…" placeholder standing in for the collapsed middle of a long chain. Opens a
 * dropdown listing the hidden ancestor crumbs, each a link back up the chain.
 */
function OverflowCrumb(props) {
    const { shell, hidden } = props;
    const navigate = useNavigate();
    const moreLabel = shell.config.labels?.more?.() ?? 'More';
    return (_jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: _jsx("button", { type: "button", className: "mrs-breadcrumbs__overflow", "aria-label": moreLabel, children: "\u2026" }) }), _jsx(DropdownMenu.Portal, { children: _jsx(DropdownMenu.Content, { className: "mrs-breadcrumbs__menu", children: hidden.map(level => (_jsxs(DropdownMenu.Item, { className: "mrs-breadcrumbs__menu-item", onSelect: () => navigate({ to: level.entry.route }), children: [shell.config.renderIcon(level.entry.icon, 16), level.entry.label()] }, level.entry.id))) }) })] }));
}
function LeafDropdown(props) {
    const { shell, label, siblings, selectedId } = props;
    const navigate = useNavigate();
    return (_jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: _jsxs("button", { type: "button", className: "mrs-breadcrumbs__leaf", title: label, children: [_jsx("span", { className: "mrs-breadcrumbs__label", children: label }), _jsx("span", { className: "mrs-breadcrumbs__caret", children: shell.config.renderIcon('chevronDown', 16) })] }) }), _jsx(DropdownMenu.Portal, { children: _jsx(DropdownMenu.Content, { className: "mrs-breadcrumbs__menu", children: siblings.map(s => (_jsxs(DropdownMenu.Item, { className: "mrs-breadcrumbs__menu-item", "data-current": s.id === selectedId, onSelect: () => navigate({ to: s.route }), children: [shell.config.renderIcon(s.icon, 16), s.label()] }, s.id))) }) })] }));
}
function SearchInput(props) {
    const { slot, shell } = props;
    const [value, setValue] = useState(slot.initialValue ?? '');
    const placeholder = slot.placeholder?.();
    return (_jsxs("div", { className: "mrs-page-header__search", children: [_jsx("span", { className: "mrs-page-header__search-icon", children: shell.config.renderIcon('search', 16) }), _jsx("input", { type: "search", className: "mrs-page-header__search-input", value: value, placeholder: placeholder, onInput: e => {
                    const next = e.currentTarget.value;
                    setValue(next);
                    slot.onChange(next);
                } })] }));
}
