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
    let candidates = roots;
    // The parent route whose dynamic children merge into the next level. '' keys
    // the top-level dynamic registrations (parent is the shell root).
    let parentKey = '';
    while (candidates.length > 0) {
        const dynamic = dynamicByParent[parentKey] ?? [];
        const pool = dynamic.length > 0 ? [...candidates, ...dynamic] : candidates;
        let best;
        for (const entry of pool) {
            if (pathname === entry.route || pathname.startsWith(entry.route + '/')) {
                if (best === undefined || entry.route.length > best.route.length) {
                    best = entry;
                }
            }
        }
        if (best === undefined)
            break;
        chain.push({ entry: best, siblings: pool });
        candidates = best.subPages ?? [];
        parentKey = best.route;
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
    useEffect(() => {
        if (!import.meta.env.DEV)
            return;
        if (leafMatchesPath)
            return;
        const ancestor = leaf ? leaf.entry.route : '(none)';
        console.warn(`[AppShell] No registered page for "${pathname}" (nearest ancestor: ${ancestor}). ` +
            'Register it in shell config `pages` or via useDynamicPages.');
    }, [pathname, leafMatchesPath, leaf]);
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
    return (_jsxs("nav", { className: "mrs-breadcrumbs", "aria-label": navLabel, children: [showMenuButton ? (_jsx("button", { type: "button", className: "mrs-page-header__hamburger", "aria-label": openMenuLabel, onClick: onOpenMenu, children: config.renderIcon('menu', 20) })) : null, _jsx(Link, { to: "/", className: "mrs-breadcrumbs__home", title: homeLabel, children: config.renderIcon('home', 18) }), chain.map((level, i) => {
                const isLeaf = i === lastIndex;
                const label = isLeaf && leafOverride !== undefined
                    ? leafOverride
                    : level.entry.label();
                return (_jsxs("span", { style: { display: 'inline-flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }, children: [_jsx("span", { className: "mrs-breadcrumbs__chevron", children: config.renderIcon('chevronRight', 14) }), isLeaf ? (level.siblings.length > 1 ? (_jsx(LeafDropdown, { shell: shell, label: label, siblings: level.siblings, selectedId: level.entry.id })) : (_jsx("span", { className: "mrs-breadcrumbs__leaf", children: label }))) : (_jsx(Link, { to: level.entry.route, className: "mrs-breadcrumbs__link", children: label }))] }, level.entry.id));
            })] }));
}
function LeafDropdown(props) {
    const { shell, label, siblings, selectedId } = props;
    const navigate = useNavigate();
    return (_jsxs(DropdownMenu.Root, { children: [_jsx(DropdownMenu.Trigger, { asChild: true, children: _jsxs("button", { type: "button", className: "mrs-breadcrumbs__leaf", children: [label, shell.config.renderIcon('chevronDown', 16)] }) }), _jsx(DropdownMenu.Portal, { children: _jsx(DropdownMenu.Content, { className: "mrs-breadcrumbs__menu", children: siblings.map(s => (_jsxs(DropdownMenu.Item, { className: "mrs-breadcrumbs__menu-item", "data-current": s.id === selectedId, onSelect: () => navigate({ to: s.route }), children: [shell.config.renderIcon(s.icon, 16), s.label()] }, s.id))) }) })] }));
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
