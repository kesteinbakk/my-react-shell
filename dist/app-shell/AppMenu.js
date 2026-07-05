import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMemo } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import { useShellContext } from './shellContext';
import { ShellAppModeControl } from './ShellAppModeControl';
import { HeaderActions } from './HeaderActions';
/** Longest-prefix match of `pathname` against the top-level pages. */
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
export function AppMenu(props) {
    const shell = useShellContext();
    const { config } = shell;
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const activePageId = useMemo(() => findActivePageId(config.pages, pathname), [config.pages, pathname]);
    const size = props.size ?? 'md';
    const dense = props.actions.length <= 3;
    const className = props.className
        ? `mrs-app-menu ${props.className}`
        : 'mrs-app-menu';
    const brand = config.appNameRender
        ? config.appNameRender()
        : config.appName;
    return (_jsxs("div", { className: className, "data-size": size, children: [_jsxs("div", { className: "mrs-app-menu__head", children: [_jsx(Link, { to: "/", className: "mrs-app-menu__brand", children: brand }), props.titleAdornment?.(), props.subtitle ? (_jsx("div", { className: "mrs-app-menu__subtitle", children: props.subtitle() })) : null] }), _jsx(ShellAppModeControl, { variant: "menu" }), _jsx("nav", { className: "mrs-app-menu__nav", children: config.pages.map((page, i) => (_jsxs("span", { children: [page.groupBreak && i > 0 ? (_jsx("div", { className: "mrs-app-menu__divider" })) : null, _jsxs(Link, { to: page.route, className: "mrs-app-menu__item", "data-active": page.id === activePageId, children: [config.renderIcon(page.icon, 18), page.label()] })] }, page.id))) }), _jsx("div", { className: "mrs-app-menu__actions", "data-dense": dense, children: _jsx(HeaderActions, { actions: props.actions }) })] }));
}
