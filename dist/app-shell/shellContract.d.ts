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
import type { ActionType, ActionButtonTone, ActionButtonSize, ActionButtonLayout } from '../components/ActionButton';
import type { SearchInputProps } from '../components/SearchInput';
import type { AlertTone } from '../components/Alert';
import type { Tone } from '../components/tone';
/**
 * Consumer-extensible interface for strict icon typing.
 * By default it is empty, meaning the shell falls back to `string`.
 * Consumers can augment this in their own `.d.ts` file:
 * ```ts
 * declare module 'my-react-shell/app-shell' {
 *   interface AppShellIcons extends Record<MyIconName, true> {}
 * }
 * ```
 */
export interface AppShellIcons {
}
/**
 * The strictly-typed icon key.
 * If `AppShellIcons` is empty, this resolves to `string`.
 * If augmented, this strictly resolves to the consumer's keys.
 */
export type ShellIcon = keyof AppShellIcons extends never ? string : keyof AppShellIcons;
/**
 * Brand symbol — `Symbol.for` so HMR / multi-bundle duplication compares equal.
 * @internal never import this to forge a brand; go through `defineShellConfig`.
 */
export declare const SHELL_CONFIG_BRAND: unique symbol;
/** Max-width values the shell's content container accepts. */
export type PageContainerMaxWidth = 'narrow' | 'medium' | 'wide' | 'x-wide' | 'full';
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
    icon: ShellIcon;
    /** Nested entries — render as breadcrumb-chain levels after the parent. */
    subPages?: PageEntry[];
    /**
     * App-modes this page supports (values from `appMode.modes`). **Undefined → the
     * page supports every mode** (no narrowing — landing here does nothing). When the
     * active breadcrumb **leaf** declares this, the app-mode control shows only these
     * modes (intersected with any runtime `setModes` narrowing), and arriving here
     * while the current mode is *not* in the set triggers `appMode.onUnsupportedMode`.
     * Requires an `appMode` block; ignored without one.
     */
    supportedModes?: string[];
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
 * App-mode declaration — an optional single-select "what mode is the app in"
 * control the shell renders in its own section directly under the app title
 * (header mode) or under the sidebar brand, above the nav (menu mode).
 *
 * Only the **static** parts are declared here: the ordered set of modes and how
 * to label each. The **live** value, visibility, selectability, and the currently
 * available modes are runtime state, read and driven anywhere under `<AppShell>`
 * via `useAppMode()`. A consumer sets the app-mode from end-user selection *or*
 * from data (e.g. a role effect calling `setAppMode`), and reads `appMode` as a
 * global app mode. The shell renders **no** control when fewer than two modes are
 * available or `visible` is false — the value stays readable either way.
 */
export interface ShellAppModeConfig {
    /**
     * Ordered mode values — the consumer's own constants (e.g. the values of
     * `{ setup: 'SETUP', main: 'MAIN', finalize: 'FINALIZE' }`). At least one; the
     * control only renders once two or more are *available* at runtime.
     */
    modes: string[];
    /**
     * Label resolver for a mode — consumer **content**, wired to the consumer's
     * own `t()`. Called during render so it re-resolves on a language flip.
     */
    label: (mode: string) => string;
    /**
     * Optional per-mode icon key — resolved through `config.renderIcon` and rendered
     * beside the label. Return `null`/`undefined` for a mode with no icon (so only
     * some modes carry one). Omit the resolver entirely for no icons at all.
     */
    icon?: (mode: string) => ShellIcon | null | undefined;
    /** Which side of the label the icon sits. Default `'leading'`. */
    iconPosition?: 'leading' | 'trailing';
    /**
     * Optional per-mode semantic tone — colours a mode's label + icon (e.g. a
     * `warning`-toned "Finalize" step). Return `null`/`undefined` for the default
     * neutral chrome. Omit the resolver for no toning.
     */
    tone?: (mode: string) => Tone | null | undefined;
    /** Initial app-mode on mount. Omitted → the first entry in `modes`. */
    defaultMode?: string;
    /**
     * Accessible label for the segmented-control group — a thunk the consumer wires
     * to its own `t()`. Omitted → the group is unlabeled (the app-shell module never
     * imports i18n; like the other chrome labels this is a consumer-supplied thunk).
     */
    ariaLabel?: () => string;
    /** Whether the control is shown initially. Default `true`. Runtime-overridable via `useAppMode().setVisible`. */
    visible?: boolean;
    /**
     * Whether the end-user may change the app-mode initially. Default `true`; `false`
     * renders a read-only indicator (visible, not interactive). Runtime-overridable
     * via `useAppMode().setSelectable`.
     */
    selectable?: boolean;
    /**
     * What to do when the active page's `supportedModes` excludes the current mode:
     * - `'warn'` (**default**) — auto-switch to the first supported mode and emit a
     *   `console.warn`.
     * - `'jump'` — auto-switch to the first supported mode, silently (no warning).
     * - `'throw'` — treat it as a routing/config bug and throw, so the consumer gates
     *   navigation instead of landing in an impossible state.
     *
     * Only fires when the breadcrumb **leaf** page declares `supportedModes` and the
     * current mode is not in it; pages without `supportedModes` never trigger it.
     */
    onUnsupportedMode?: 'warn' | 'jump' | 'throw';
    /**
     * localStorage key the selected mode persists under, so a reload restores the
     * user's choice (same best-effort try/catch as the theme/i18n/menu-size
     * persistence — a blocked store just falls back to `defaultMode`). Default
     * `'my-react-shell.app-mode'`.
     */
    storageKey?: string;
}
/**
 * Icon renderer. The shell is icon-library-agnostic: the consumer passes one
 * function that turns an icon key + pixel size into a node. The module ships no
 * icon kit, so this is required.
 */
export type ShellIconRenderer = (key: ShellIcon, size: number) => ReactNode;
/**
 * Aria-label / tooltip strings the chrome needs. The consumer supplies
 * translated thunks; the module never imports i18n. All optional — sensible
 * English fallbacks apply when omitted.
 */
export interface ShellChromeLabels {
    home?: () => string;
    /** Accessible name for the breadcrumb "up one level" arrow next to the home icon. */
    up?: () => string;
    breadcrumb?: () => string;
    openMenu?: () => string;
    mainNavigation?: () => string;
    more?: () => string;
    /** Accessible name for the tab-strip "scroll left" arrow (a mouse-only affordance). No default — absent → the chevron stands alone. */
    scrollTabsLeft?: () => string;
    /** Accessible name for the tab-strip "scroll right" arrow (a mouse-only affordance). No default — absent → the chevron stands alone. */
    scrollTabsRight?: () => string;
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
    /**
     * Optional app-mode control — a single-select segmented control the shell
     * renders in its own section under the app title. Declares the modes + labels;
     * the live value is driven/read via `useAppMode()`. Omitted → no app-mode surface.
     */
    appMode?: ShellAppModeConfig;
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
export interface PageHeaderSearchAction extends Omit<SearchInputProps, 'action'> {
    action: 'search';
}
export interface PageHeaderPresetAction {
    action: Exclude<ActionType, 'search'>;
    onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    label?: string;
    showEmoji?: boolean;
    tone?: ActionButtonTone;
    size?: ActionButtonSize;
    layout?: ActionButtonLayout;
    disabled?: boolean;
    hint?: string;
}
export interface PageHeaderAlertSpec {
    label: string;
    tone: AlertTone;
    hideOtherActions?: boolean;
}
export type PageHeaderAction = (() => ReactNode) | ActionType | PageHeaderSearchAction | PageHeaderPresetAction;
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
     * Action items cluster rendered on the right of the band. An `ActionButton` here always
     * lays out inline (glyph before label) — the band's stylesheet overrides its
     * `layout` prop, since the kit default `vertical` would stack the label under the
     * glyph and blow out the band height. Pass `layout="inline"` anyway for clarity.
     */
    actions?: Array<PageHeaderAction>;
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
