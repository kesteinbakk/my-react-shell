import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useShellContext } from './shellContext';
/** Longest-prefix match of `pathname` against the given pages. */
function findActivePageId(pages, pathname) {
    let activeId = null;
    let bestLength = -1;
    for (const page of pages) {
        const matches = pathname === page.route || pathname.startsWith(page.route + '/');
        if (matches && page.route.length > bestLength) {
            activeId = page.id;
            bestLength = page.route.length;
        }
    }
    return activeId;
}
export function AppBottomNav(props) {
    const shell = useShellContext();
    const { config } = shell;
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const barPages = useMemo(() => config.pages.filter((p) => p.tabBar), [config.pages]);
    const activePageId = useMemo(() => findActivePageId(config.pages, pathname), [config.pages, pathname]);
    const barPageIds = useMemo(() => new Set(barPages.map((p) => p.id)), [barPages]);
    const moreActive = (props.moreOpen ?? false) ||
        (activePageId !== null && !barPageIds.has(activePageId));
    useEffect(() => {
        if (!import.meta.env.DEV)
            return;
        if (barPages.length > 5) {
            console.warn(`[AppShell] AppBottomNav has ${barPages.length} pages marked tabBar; ` +
                'the bar is cramped beyond ~5. Mark fewer pages tabBar and let the rest fall to "More".');
        }
        if (barPages.length === 0) {
            console.warn('[AppShell] AppBottomNav has no pages marked tabBar; the bar shows only "More". ' +
                'Mark top-level pages with `tabBar: true` in shell config.');
        }
    }, [barPages.length]);
    const moreLabel = config.labels?.more?.() ?? 'More';
    const className = props.className
        ? `mrs-bottom-nav ${props.className}`
        : 'mrs-bottom-nav';
    return (_jsxs("nav", { className: className, children: [barPages.map((page) => (_jsxs(Link, { to: page.route, className: "mrs-bottom-nav__tab", "data-active": page.id === activePageId, children: [config.renderIcon(page.icon, 22), _jsx("span", { className: "mrs-bottom-nav__label", children: page.label() })] }, page.id))), _jsxs("button", { type: "button", className: "mrs-bottom-nav__tab", "data-active": moreActive, onClick: props.onOpenMore, "aria-label": moreLabel, children: [config.renderIcon('menu', 22), _jsx("span", { className: "mrs-bottom-nav__label", children: moreLabel })] })] }));
}
