/**
 * AppBottomNav — the mobile bottom tab bar (menu mode, `mobileNav='tabBar'`).
 *
 * `<AppShell>` renders it only when tab-bar nav is active; CSS hides it at the
 * `lg` breakpoint where the static sidebar takes over. The bar shows the pages
 * opted in via `PageEntry.tabBar`, each an icon-over-label `<Link>`, plus a
 * trailing "More" tab — a `<button>` that opens the same drawer the hamburger
 * does. Requires shell context. No per-page presence dots / badges. Icons via
 * `config.renderIcon`; chrome label via `config.labels` with an English
 * fallback; the module never imports i18n.
 *
 * DEV guardrails (effect-scoped, dev-only `console.warn`): warns when more than
 * five pages are marked `tabBar` (the bar gets cramped) and when zero pages are
 * marked (the bar then shows only "More").
 */
import type { ReactNode } from 'react';
export interface AppBottomNavProps {
    /** Opens the overflow drawer (the "More" tab + the hamburger share it). */
    onOpenMore: () => void;
    /** Whether the overflow drawer is currently open (highlights the "More" tab). */
    moreOpen?: boolean;
    className?: string;
}
export declare function AppBottomNav(props: AppBottomNavProps): ReactNode;
