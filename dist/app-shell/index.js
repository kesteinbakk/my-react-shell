// my-react-shell/app-shell — the app-shell module (sub-path `my-react-shell/app-shell`).
//
// A React (SPA) port of the SolidJS foundation app shell: header-or-sidebar chrome
// with a responsive mobile drawer + optional bottom nav and a single scrolling body
// cell, a URL-derived page header (breadcrumbs + actions + search + subPages
// dropdown), the shell-config contract (the three navigation layers), and the
// page-tab primitives (PageSections in-page + route-based PageTabs). Router-coupled
// (TanStack Router) and Radix-using — both optional peers behind this sub-path, so
// the package barrel stays the theme core. Ship the stylesheet too:
//   import 'my-react-shell/app-shell/styles.css'
// Strings come via config/props — the module never imports i18n. See
// docs/guides/app-shell.md.
// ── chrome ────────────────────────────────────────────────────────────────────
export { AppShell } from './AppShell';
export { AppHeader } from './AppHeader';
export { AppMenu } from './AppMenu';
export { AppBottomNav } from './AppBottomNav';
// ── page header + config ──────────────────────────────────────────────────────
export { usePageHeader } from './usePageHeader';
export { usePageAlert } from './usePageAlert';
export { useDocumentTitlePrefix } from './useDocumentTitlePrefix';
export { findActiveChain } from './ShellPageHeader';
export { useDynamicPages } from './useDynamicPages';
export { defineShellConfig, ShellConfigError } from './defineShellConfig';
export { useShellContext, useShellContextOptional } from './shellContext';
// ── app-mode (single-select "what mode is the app in", under the app title) ────
export { useAppMode, useAppModeOptional } from './useAppMode';
// ── menu-size preference (header-chrome size: small · medium · large) ─────────
export { MenuSizeProvider } from './MenuSizeProvider';
export { useMenuSize, useMenuSizeOptional } from './useMenuSize';
// ── page tabs ─────────────────────────────────────────────────────────────────
export { PageTabs } from './PageTabs';
export { PageSections } from './PageSections';
export { PageSection } from './PageSectionExport';
