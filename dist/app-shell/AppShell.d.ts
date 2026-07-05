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
 * the only breakpoint JS is the auto-close-drawer-past-`screen` (≥1024px) effect,
 * driven off the shared breakpoint scale (`breakpoints.ts`) so it can't drift from
 * the sidebar's CSS cutoff.
 */
import type { ReactNode } from 'react';
import type { ShellConfig, HeaderAction } from './shellContract';
export type AppShellContentPadding = 'default' | 'none';
export type AppShellMobileNav = 'drawer' | 'tabBar';
export interface AppShellProps {
    /** Must be built by `defineShellConfig` (branded — checked at runtime). */
    config: ShellConfig;
    /** `true` → sidebar (`AppMenu`); `false` → top banner (`AppHeader`). */
    useMenu: boolean;
    /** Declarative chrome actions (theme toggle, language, bell, …). `[]` for none. */
    actions: HeaderAction[];
    /** Under the brand. */
    subtitle?: () => ReactNode;
    /** Right of the brand (badge/pill). */
    titleAdornment?: () => ReactNode;
    footer?: () => ReactNode;
    /** Content container padding. Default `'default'`. */
    contentPadding?: AppShellContentPadding;
    /** Mobile nav style (menu mode only). Default `'drawer'`. */
    mobileNav?: AppShellMobileNav;
    /** Sidebar side — a user preference, not a route decision. Default `'left'`. */
    menuSide?: 'left' | 'right';
    children: ReactNode;
}
export declare function AppShell({ config, useMenu, actions, subtitle, titleAdornment, footer, contentPadding, mobileNav, menuSide, children, }: AppShellProps): import("react").JSX.Element;
