import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AppShell — the outer chrome orchestrator.
 *
 * Renders EITHER an <AppHeader> (top banner) OR an <AppMenu> (sidebar), never
 * both. Splits its content area into a pinned page-header chrome slot (where a
 * registered <ShellPageHeader> lands) and a single scrolling body cell
 * (`[data-shell-content]`, the only scroller — Hard Rule #1). Owns the shell
 * context (config + scroll container + page-header registration + dynamic
 * pages), the document title, and the mobile drawer.
 *
 * SPA only — no SSR scars. Responsive show/hide is CSS media queries (app-shell.css);
 * the only breakpoint JS is the auto-close-drawer-past-1024px effect.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useRouterState } from '@tanstack/react-router';
import * as Dialog from '@radix-ui/react-dialog';
import { SHELL_CONFIG_BRAND } from './shellContract';
import { ShellContext } from './shellContext';
import { ShellPageHeaderUI, findActiveChain } from './ShellPageHeader';
import { AppHeader } from './AppHeader';
import { AppMenu } from './AppMenu';
import { AppBottomNav } from './AppBottomNav';
function MobileMenuDrawer({ open, onOpenChange, side, title, children }) {
    return (_jsx(Dialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "mrs-drawer__overlay" }), _jsxs(Dialog.Content, { className: `mrs-drawer__content mrs-drawer__content--${side}`, "aria-describedby": undefined, children: [_jsx(Dialog.Title, { className: "mrs-visually-hidden", children: title }), children] })] }) }));
}
export function AppShell({ config, useMenu, actions, subtitle, titleAdornment, footer, contentPadding, mobileNav, menuSide, children, }) {
    if (config[SHELL_CONFIG_BRAND] !== true) {
        throw new Error('<AppShell> requires a `config` built by defineShellConfig().');
    }
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    const [scrollEl, setScrollEl] = useState(null);
    const [headerStack, setHeaderStack] = useState([]);
    const pageHeaderSpec = headerStack.at(-1) ?? null;
    const registerPageHeader = useCallback((spec) => {
        setHeaderStack((prev) => [...prev, spec]);
        return () => setHeaderStack((prev) => prev.filter((s) => s !== spec));
    }, []);
    // Per-registrant state: parent → registrantId → items.
    // Multiple layout components can each contribute children to the same parent
    // route without clobbering each other. The flat view below is what context
    // and findActiveChain read.
    const [dynamicPages, setDynamicPages] = useState({});
    const registerDynamicPages = useCallback((registrantId, parent, items) => {
        setDynamicPages((prev) => ({
            ...prev,
            [parent]: { ...(prev[parent] ?? {}), [registrantId]: items },
        }));
        return () => setDynamicPages((prev) => {
            const byRegistrant = { ...(prev[parent] ?? {}) };
            delete byRegistrant[registrantId];
            const next = { ...prev };
            if (Object.keys(byRegistrant).length === 0) {
                delete next[parent];
            }
            else {
                next[parent] = byRegistrant;
            }
            return next;
        });
    }, []);
    // Flat view: parent → merged children across all registrants.
    const flatDynamicPages = useMemo(() => Object.fromEntries(Object.entries(dynamicPages).map(([parent, byId]) => [
        parent,
        Object.values(byId).flat(),
    ])), [dynamicPages]);
    const ctx = useMemo(() => ({
        config,
        scrollContainer: scrollEl,
        setScrollContainer: setScrollEl,
        dynamicPages: flatDynamicPages,
        registerDynamicPages,
        pageHeaderSpec,
        registerPageHeader,
    }), [config, scrollEl, flatDynamicPages, registerDynamicPages, pageHeaderSpec, registerPageHeader]);
    // Document title — single owner; routes without a header fall through to appName.
    const documentTitleText = useMemo(() => {
        const spec = pageHeaderSpec;
        if (spec && typeof spec.documentTitle === 'function')
            return spec.documentTitle();
        const mode = (typeof spec?.documentTitle === 'string' ? spec.documentTitle : undefined) ??
            config.shellPageHeader?.documentTitle ??
            'composed';
        if (mode === 'app')
            return config.appName;
        const chain = findActiveChain(config.pages, pathname, flatDynamicPages);
        const leaf = spec?.title?.() ?? chain.at(-1)?.entry.label() ?? config.appName;
        if (mode === 'leaf')
            return leaf;
        return leaf === config.appName ? config.appName : `${leaf} · ${config.appName}`;
    }, [config, pageHeaderSpec, pathname, dynamicPages]);
    useEffect(() => {
        document.title = documentTitleText;
    }, [documentTitleText]);
    // Mobile drawer.
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);
    useEffect(() => {
        const mq = window.matchMedia('(min-width: 1024px)');
        const onChange = (e) => {
            if (e.matches)
                setMobileMenuOpen(false);
        };
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);
    const showMenu = useMenu;
    const useTabBar = showMenu && (mobileNav ?? 'drawer') === 'tabBar';
    const menuOnLeft = (menuSide ?? 'left') !== 'right';
    const maxWidth = config.pageContainer?.defaultMaxWidth ?? '2xl';
    const containerPadding = contentPadding ?? 'default';
    const brand = () => (config.appNameRender ? config.appNameRender() : config.appName);
    const openMenuLabel = config.labels?.openMenu?.() ?? 'Open menu';
    const navLabel = config.labels?.mainNavigation?.() ?? 'Main navigation';
    const menu = (_jsx(AppMenu, { actions: actions, subtitle: subtitle, titleAdornment: titleAdornment }));
    return (_jsxs(ShellContext.Provider, { value: ctx, children: [_jsxs("div", { className: "mrs-shell", "data-content-padding": containerPadding, "data-max-width": maxWidth, children: [!showMenu && (_jsx("div", { className: "mrs-shell__header-row", children: _jsx(AppHeader, { actions: actions, subtitle: subtitle, titleAdornment: titleAdornment }) })), _jsxs("div", { className: "mrs-shell__middle", children: [showMenu && menuOnLeft && (_jsx("div", { className: "mrs-shell__sidebar mrs-shell__sidebar--left", children: menu })), _jsxs("div", { className: "mrs-shell__page-area", children: [pageHeaderSpec ? (_jsx("div", { className: "mrs-shell__chrome", children: _jsx("div", { className: "mrs-shell__container", children: _jsx(ShellPageHeaderUI, { spec: pageHeaderSpec, shell: ctx, showMenuButton: showMenu && !useTabBar, onOpenMenu: () => setMobileMenuOpen(true) }) }) })) : (showMenu && (_jsxs("div", { className: "mrs-shell__mobile-brand", children: [!useTabBar && (_jsx("button", { type: "button", className: "mrs-shell__hamburger", onClick: () => setMobileMenuOpen(true), "aria-label": openMenuLabel, children: config.renderIcon('menu', 20) })), _jsx(Link, { to: "/", className: "mrs-shell__brand-link", children: brand() })] }))), _jsx("div", { ref: setScrollEl, className: "mrs-shell__content", "data-shell-content": true, children: _jsx("div", { className: "mrs-shell__container mrs-shell__container--fill", children: children }) })] }), showMenu && !menuOnLeft && (_jsx("div", { className: "mrs-shell__sidebar mrs-shell__sidebar--right", children: menu }))] }), footer && (_jsx("div", { className: useTabBar ? 'mrs-shell__footer mrs-shell__footer--hide-mobile' : 'mrs-shell__footer', children: footer() })), useTabBar && (_jsx(AppBottomNav, { onOpenMore: () => setMobileMenuOpen(true), moreOpen: mobileMenuOpen }))] }), showMenu && (_jsx(MobileMenuDrawer, { open: mobileMenuOpen, onOpenChange: setMobileMenuOpen, side: menuOnLeft ? 'left' : 'right', title: navLabel, children: menu }))] }));
}
