/**
 * Shell contract — pure types for the app-shell module.
 *
 * The config shape an app passes to `defineShellConfig`, the page-entry tree the
 * three navigation layers + breadcrumb chain read, and the page-header options a
 * `usePageHeader` call registers onto shell context. No runtime, no React state —
 * just the contract. The icon library is externalized (`renderIcon`), and every
 * user-facing string is a thunk the consumer wires to its own `t()` — the module
 * never imports i18n.
 */
import type { ReactNode } from 'react';
/**
 * Brand symbol — `Symbol.for` so HMR / multi-bundle duplication compares equal.
 * @internal never import this to forge a brand; go through `defineShellConfig`.
 */
export declare const SHELL_CONFIG_BRAND: unique symbol;
/** Max-width values the shell's content container accepts. */
export type PageContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
/** Visual variant for `PageTabs` + the `PageSections` tab strip. */
export type ShellTabsVariant = 'underline' | 'pill';
/** Browser-tab document-title composition mode. */
export type ShellDocumentTitleMode = 'composed' | 'leaf' | 'app';
/**
 * One navigation entry — a sidebar list row and a breadcrumb-chain level.
 * `subPages` is recursive (the chain descends through it).
 */
export interface PageEntry {
    /** Stable id; unique across the whole tree. */
    id: string;
    /** Pathname. Starts with `/`. A sub-page route starts with its parent route + `/`. */
    route: string;
    /**
     * Display-label resolver. A thunk so the consumer can wire `t('…')` and have
     * it re-evaluate inside a tracked render. Called during render.
     */
    label: () => string;
    /** Icon key — resolved by the consumer-supplied `renderIcon`. */
    icon: string;
    /** Nested entries — render as breadcrumb-chain levels after the parent. */
    subPages?: PageEntry[];
    /**
     * Reactive predicate to **omit this level from the rendered breadcrumb trail**
     * while keeping it structurally in the chain: the URL is unchanged, the chain
     * still descends through it, and its descendants stay navigable. Use it to hide
     * an access-gated ancestor a user can't open even though they can reach a child
     * (`hideCrumb: () => !canAccess(route)`). The shell stays role-agnostic — the
     * consumer supplies the access logic. Called during render. The **leaf (current
     * page) is never hidden**, so the trail can't go empty.
     */
    hideCrumb?: () => boolean;
    /**
     * Reactive predicate to **omit this entry from any sibling dropdowns** in the
     * breadcrumbs trail (e.g. to prevent layout-level or admin pages from leaking
     * into other lists). The crumb itself is still displayed and clickable when active.
     */
    hideFromSiblings?: () => boolean;
    /**
     * Reactive predicate to **render this ancestor as a plain label instead of a
     * clickable link** in the breadcrumb trail. The crumb still appears in the
     * chain and is still visible; it simply has no click target. Use this when
     * the ancestor route has no standalone page worth navigating to — a structural
     * parent that only makes sense as a grouping, not a destination. Called
     * during render. Has no effect on the leaf (which is never rendered as a
     * link).
     */
    disableCrumbLink?: () => boolean;
    /** Sidebar divider before this entry. Ignored on the first visible page. */
    groupBreak?: boolean;
    /** Mobile bottom-bar opt-in (only when `AppShell mobileNav='tabBar'`). Top-level only. */
    tabBar?: boolean;
}
export interface ShellPageContainerConfig {
    defaultMaxWidth: PageContainerMaxWidth;
}
export interface ShellTabsConfig {
    variant: ShellTabsVariant;
}
/**
 * Breadcrumb middle-collapse. When the chain has more than `leading + trailing`
 * levels, the breadcrumb renders the first `leading` crumbs, a single "…" overflow
 * item (a dropdown listing the hidden ancestor crumbs), then the last `trailing`
 * crumbs. `trailing` is clamped to ≥ 1 (the leaf is always shown), `leading` to ≥ 0.
 * Per-crumb truncation always applies regardless of this setting.
 */
export interface ShellBreadcrumbCollapseConfig {
    /** Crumbs kept at the start (after the home icon). Default `1`. */
    leading?: number;
    /** Crumbs kept at the end, including the leaf. Default `2`. */
    trailing?: number;
}
export interface ShellPageHeaderConfig {
    /** Header band gets a bottom border. Default `true`. */
    border: boolean;
    /** Project-wide default browser-tab mode. Default `'composed'`. */
    documentTitle?: ShellDocumentTitleMode;
    /**
     * Breadcrumb middle-collapse. Default `{ leading: 1, trailing: 2 }`; pass
     * `false` to disable collapse (per-crumb truncation still applies).
     */
    breadcrumbCollapse?: ShellBreadcrumbCollapseConfig | false;
}
/**
 * Icon renderer. The shell is icon-library-agnostic: the consumer passes one
 * function that turns an icon key + pixel size into a node. The module ships no
 * icon kit, so this is required.
 */
export type ShellIconRenderer = (key: string, size: number) => ReactNode;
/**
 * Aria-label / tooltip strings the chrome needs. The consumer supplies
 * translated thunks; the module never imports i18n. All optional — sensible
 * English fallbacks apply when omitted.
 */
export interface ShellChromeLabels {
    home?: () => string;
    breadcrumb?: () => string;
    openMenu?: () => string;
    mainNavigation?: () => string;
    more?: () => string;
}
/** Author-facing config — passed to `defineShellConfig`. */
export interface ShellConfigInput {
    /** App name — home-link text + document-title suffix. */
    appName: string;
    /** Optional custom wordmark render for the brand area. */
    appNameRender?: () => ReactNode;
    /** Top-level nav entries. May be empty — a card-dashboard app navigates via
     *  the home cards + breadcrumbs and has no fixed sidebar nav. */
    pages: PageEntry[];
    /** Page-container defaults. Omitted → `'2xl'`. */
    pageContainer?: ShellPageContainerConfig;
    /** Tab strip variant. Omitted → `'underline'`. */
    tabs?: ShellTabsConfig;
    /** Page-header band visual options. `border` defaults `true`. */
    shellPageHeader?: ShellPageHeaderConfig;
    /** Renders icon keys. Required — sidebar / breadcrumb / tabs all need it. */
    renderIcon: ShellIconRenderer;
    /** Aria-label / tooltip strings the chrome needs. */
    labels?: ShellChromeLabels;
}
/** Validated, branded config — what `<AppShell>` accepts. */
export interface ShellConfig extends ShellConfigInput {
    readonly [SHELL_CONFIG_BRAND]: true;
}
/** Page-level search slot for `usePageHeader`. */
export interface ShellPageHeaderSearchSlot {
    onChange: (value: string) => void;
    placeholder?: () => string;
    initialValue?: string;
}
/**
 * Public options for the `usePageHeader` hook — the page chrome a route contributes
 * to the shell band. Every field is optional; a route that contributes none still
 * gets the automatic breadcrumb band (band visibility derives from the URL chain /
 * chrome, not from calling this hook). Fields are thunks (not plain values) so
 * labels/actions re-resolve on a language flip and the chrome stays reactive —
 * matching `PageEntry.label` and the rest of the config.
 */
export interface PageHeaderOptions {
    /** Overrides the leaf breadcrumb label (only when the leaf is the current page). */
    title?: () => string;
    /**
     * Action cluster rendered on the right of the band. An `ActionButton` here always
     * lays out inline (glyph before label) — the band's stylesheet overrides its
     * `layout` prop, since the kit default `vertical` would stack the label under the
     * glyph and blow out the band height. Pass `layout="inline"` anyway for clarity.
     */
    actions?: Array<() => ReactNode>;
    /** Page-level search slot. */
    search?: ShellPageHeaderSearchSlot;
    /** Pinned tab strip rendered under the breadcrumbs. */
    tabs?: () => ReactNode;
    /** Per-page browser-tab title mode, or an explicit resolver. */
    documentTitle?: ShellDocumentTitleMode | (() => string);
    /** Extra classes on the band's outer container. */
    className?: string;
}
/**
 * Internal — the spec a `usePageHeader` call registers onto shell context, consumed
 * by `<AppShell>`. Structurally identical to {@link PageHeaderOptions}.
 */
export type ShellPageHeaderSpec = PageHeaderOptions;
