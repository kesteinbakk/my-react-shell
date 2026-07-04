import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * AppShell — the outer chrome orchestrator.
 *
 * Renders EITHER an <AppHeader> (top banner) OR an <AppMenu> (sidebar), never
 * both. Splits its content area into a pinned page-header chrome slot (the band,
 * which renders automatically from the URL breadcrumb chain, plus any chrome a
 * `usePageHeader` call contributes) and a single scrolling body cell
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
import { ShellContext, ShellAPIContext, } from './shellContext';
import { ShellPageHeaderUI, findActiveChain } from './ShellPageHeader';
import { ShellAppModeControl } from './ShellAppModeControl';
import { useMenuSizeOptional } from './useMenuSize';
import { AppHeader } from './AppHeader';
import { AppMenu } from './AppMenu';
import { AppBottomNav } from './AppBottomNav';
/**
 * Empty chrome spec — handed to the band renderer when only breadcrumbs exist (no
 * `usePageHeader` contributed chrome). A stable module-level ref so the renderer
 * isn't fed a fresh object every render.
 */
const EMPTY_HEADER_SPEC = {};
function MobileMenuDrawer({ open, onOpenChange, side, title, children }) {
    return (_jsx(Dialog.Root, { open: open, onOpenChange: onOpenChange, children: _jsxs(Dialog.Portal, { children: [_jsx(Dialog.Overlay, { className: "mrs-drawer__overlay" }), _jsxs(Dialog.Content, { className: `mrs-drawer__content mrs-drawer__content--${side}`, "aria-describedby": undefined, children: [_jsx(Dialog.Title, { className: "mrs-visually-hidden", children: title }), children] })] }) }));
}
export function AppShell({ config, useMenu, actions, subtitle, titleAdornment, footer, contentPadding, mobileNav, menuSide, children, }) {
    if (config[SHELL_CONFIG_BRAND] !== true) {
        throw new Error('<AppShell> requires a `config` built by defineShellConfig().');
    }
    const pathname = useRouterState({ select: (s) => s.location.pathname });
    // Soft read of the menu-size preference (header-chrome size). Absent provider →
    // null → 'medium' (normal), so a standalone consumer is unaffected.
    const menuSize = useMenuSizeOptional()?.menuSize ?? 'medium';
    const [scrollEl, setScrollEl] = useState(null);
    // App-mode runtime — seeded from the `appMode` config block (static: modes +
    // labels), then driven at runtime via `useAppMode()`. All four slots are plain
    // React state so a consumer's `setAppMode`/`setVisible`/… re-renders the tree.
    // `appModeRuntime` is `null` when the config declares no `appMode`.
    const appModeConfig = config.appMode;
    const [appModeValue, setAppModeValue] = useState(() => appModeConfig?.defaultMode ?? appModeConfig?.modes[0] ?? '');
    const [appModeOptions, setAppModeOptions] = useState(() => appModeConfig?.modes ?? []);
    const [appModeVisible, setAppModeVisible] = useState(() => appModeConfig?.visible ?? true);
    const [appModeSelectable, setAppModeSelectable] = useState(() => appModeConfig?.selectable ?? true);
    const appModeRuntime = useMemo(() => appModeConfig === undefined
        ? null
        : {
            appMode: appModeValue,
            setAppMode: setAppModeValue,
            modes: appModeOptions,
            setModes: setAppModeOptions,
            visible: appModeVisible,
            setVisible: setAppModeVisible,
            selectable: appModeSelectable,
            setSelectable: setAppModeSelectable,
        }, [appModeConfig, appModeValue, appModeOptions, appModeVisible, appModeSelectable]);
    // Page-chrome contributors (`usePageHeader`), keyed by a stable id + a render-order
    // token. The band renders the chrome of the entry with the HIGHEST order — the
    // deepest-mounted contributor (React renders parent→child, so an ancestor's order
    // is lower than a descendant's), matching foundation's parent-first `onMount`.
    // `update` rewrites an entry's spec in place (same id + order), never reordering,
    // so the winner can't flip when a contributor re-renders with fresh inline thunks.
    const [headerStack, setHeaderStack] = useState([]);
    const pageHeaderSpec = headerStack.reduce((best, e) => (best === null || e.order > best.order ? e : best), null)?.spec ?? null;
    const registerPageHeader = useCallback((order, spec) => {
        const id = Symbol('shell-page-header');
        setHeaderStack((prev) => [...prev, { id, order, spec }]);
        return {
            update: (next) => setHeaderStack((prev) => prev.map((e) => (e.id === id ? { id, order, spec: next } : e))),
            unregister: () => setHeaderStack((prev) => prev.filter((e) => e.id !== id)),
        };
    }, []);
    const [alertStack, setAlertStack] = useState([]);
    const pageAlertSpec = alertStack.at(-1)?.spec ?? null;
    // A plain-string prefix prepended to `document.title` (e.g. an unread badge
    // `(3)`). A single reactive slot — one intended producer — set via
    // `useDocumentTitlePrefix`; `null`/'' means no prefix. Folded into
    // `documentTitleText` below so the single title-owner effect writes it.
    const [documentTitlePrefix, setDocumentTitlePrefix] = useState(null);
    const registerPageAlert = useCallback((spec) => {
        const id = Symbol('shell-page-alert');
        setAlertStack((prev) => [...prev, { id, spec }]);
        return {
            update: (next) => setAlertStack((prev) => prev.map((e) => (e.id === id ? { id, spec: next } : e))),
            unregister: () => setAlertStack((prev) => prev.filter((e) => e.id !== id)),
        };
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
    // The breadcrumb chain for the current URL — drives the document title, and the
    // automatic band-visibility gate below. Pure function of (pages, pathname,
    // dynamic children); the band shows whenever this resolves to ≥1 level, so a page
    // never mounts a header just to surface breadcrumbs.
    const activeChain = useMemo(() => findActiveChain(config.pages, pathname, flatDynamicPages), [config.pages, pathname, flatDynamicPages]);
    const ctx = useMemo(() => ({
        config,
        scrollContainer: scrollEl,
        setScrollContainer: setScrollEl,
        dynamicPages: flatDynamicPages,
        registerDynamicPages,
        pageAlertSpec,
        registerPageAlert,
        pageHeaderSpec,
        registerPageHeader,
        setDocumentTitlePrefix,
        appMode: appModeRuntime,
    }), [config, scrollEl, flatDynamicPages, registerDynamicPages, pageAlertSpec, registerPageAlert, pageHeaderSpec, registerPageHeader, appModeRuntime]);
    const apiCtx = useMemo(() => ({
        setScrollContainer: setScrollEl,
        registerDynamicPages,
        registerPageAlert,
        registerPageHeader,
        setDocumentTitlePrefix,
    }), [setScrollEl, registerDynamicPages, registerPageAlert, registerPageHeader]);
    // Document title — single owner; routes without a header fall through to appName.
    // An optional `documentTitlePrefix` (e.g. an unread badge `(3)`) is prepended with
    // a single space, so a producer never has to touch `document.title` directly (any
    // direct write would be clobbered on the next title recompute — this is the only
    // safe seam for a prefix).
    const documentTitleText = useMemo(() => {
        const spec = pageHeaderSpec;
        const base = (() => {
            if (spec && typeof spec.documentTitle === 'function')
                return spec.documentTitle();
            const mode = (typeof spec?.documentTitle === 'string' ? spec.documentTitle : undefined) ??
                config.shellPageHeader?.documentTitle ??
                'composed';
            if (mode === 'app')
                return config.appName;
            const leaf = spec?.title?.() ?? activeChain.at(-1)?.entry.label() ?? config.appName;
            if (mode === 'leaf')
                return leaf;
            return leaf === config.appName ? config.appName : `${leaf} · ${config.appName}`;
        })();
        return documentTitlePrefix ? `${documentTitlePrefix} ${base}` : base;
    }, [config, pageHeaderSpec, activeChain, documentTitlePrefix]);
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
    const maxWidth = config.pageContainer?.defaultMaxWidth ?? 'x-wide';
    const containerPadding = contentPadding ?? 'default';
    // Automatic band visibility — the band shows whenever the URL resolves to
    // breadcrumbs, OR a `usePageHeader` contributed chrome (actions/search/tabs). No
    // registered spec is needed for breadcrumbs. `title` alone never shows the band
    // (it only relabels an existing leaf crumb). At `/` (empty chain, no chrome) the
    // band is omitted, as before.
    const hasPageChrome = pageHeaderSpec !== null &&
        ((pageHeaderSpec.actions?.length ?? 0) > 0 ||
            pageHeaderSpec.search !== undefined ||
            pageHeaderSpec.tabs !== undefined);
    const showBand = activeChain.length > 0 || hasPageChrome;
    const brand = () => (config.appNameRender ? config.appNameRender() : config.appName);
    const openMenuLabel = config.labels?.openMenu?.();
    const navLabel = config.labels?.mainNavigation?.();
    const menu = (_jsx(AppMenu, { actions: actions, subtitle: subtitle, titleAdornment: titleAdornment }));
    return (_jsx(ShellAPIContext.Provider, { value: apiCtx, children: _jsxs(ShellContext.Provider, { value: ctx, children: [_jsxs("div", { className: "mrs-shell", "data-content-padding": containerPadding, "data-max-width": maxWidth, "data-menu-size": menuSize, children: [!showMenu && (_jsxs("div", { className: "mrs-shell__header-row", children: [_jsx(AppHeader, { actions: actions, subtitle: subtitle, titleAdornment: titleAdornment }), _jsx(ShellAppModeControl, { variant: "header" })] })), _jsxs("div", { className: "mrs-shell__middle", children: [showMenu && menuOnLeft && (_jsx("div", { className: "mrs-shell__sidebar mrs-shell__sidebar--left", children: menu })), _jsxs("div", { className: "mrs-shell__page-area", children: [showBand ? (_jsx("div", { className: "mrs-shell__chrome", children: _jsx("div", { className: "mrs-shell__container", children: _jsx(ShellPageHeaderUI, { spec: pageHeaderSpec ?? EMPTY_HEADER_SPEC, shell: ctx, showMenuButton: showMenu && !useTabBar, onOpenMenu: () => setMobileMenuOpen(true) }) }) })) : (showMenu && (_jsxs("div", { className: "mrs-shell__mobile-brand", children: [!useTabBar && (_jsx("button", { type: "button", className: "mrs-shell__hamburger", onClick: () => setMobileMenuOpen(true), "aria-label": openMenuLabel, children: config.renderIcon('menu', 20) })), _jsx(Link, { to: "/", className: "mrs-shell__brand-link", children: brand() })] }))), _jsx("div", { ref: setScrollEl, className: "mrs-shell__content", "data-shell-content": true, children: _jsx("div", { className: "mrs-shell__container mrs-shell__container--fill", children: children }) })] }), showMenu && !menuOnLeft && (_jsx("div", { className: "mrs-shell__sidebar mrs-shell__sidebar--right", children: menu }))] }), footer && (_jsx("div", { className: useTabBar ? 'mrs-shell__footer mrs-shell__footer--hide-mobile' : 'mrs-shell__footer', children: footer() })), useTabBar && (_jsx(AppBottomNav, { onOpenMore: () => setMobileMenuOpen(true), moreOpen: mobileMenuOpen }))] }), showMenu && (_jsx(MobileMenuDrawer, { open: mobileMenuOpen, onOpenChange: setMobileMenuOpen, side: menuOnLeft ? 'left' : 'right', title: navLabel, children: menu }))] }) }));
}
