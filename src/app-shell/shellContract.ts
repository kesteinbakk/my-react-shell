/**
 * Shell contract — pure types for the app-shell module.
 *
 * The config shape an app passes to `defineShellConfig`, the page-entry tree the
 * three navigation layers + breadcrumb chain read, and the page-header spec a
 * `<ShellPageHeader>` registers onto shell context. No runtime, no React state —
 * just the contract. The icon library is externalized (`renderIcon`), and every
 * user-facing string is a thunk the consumer wires to its own `t()` — the module
 * never imports i18n.
 */

import type { ReactNode } from 'react'

/**
 * Brand symbol — `Symbol.for` so HMR / multi-bundle duplication compares equal.
 * @internal never import this to forge a brand; go through `defineShellConfig`.
 */
export const SHELL_CONFIG_BRAND: unique symbol = Symbol.for('mrs.shell.config')

/** Max-width values the shell's content container accepts. */
export type PageContainerMaxWidth = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'

/** Visual variant for `PageTabs` + the `PageSections` tab strip. */
export type ShellTabsVariant = 'underline' | 'pill'

/** Browser-tab document-title composition mode. */
export type ShellDocumentTitleMode = 'composed' | 'leaf' | 'app'

/**
 * One navigation entry — a sidebar list row and a breadcrumb-chain level.
 * `subPages` is recursive (the chain descends through it).
 */
export interface PageEntry {
  /** Stable id; unique across the whole tree. */
  id: string
  /** Pathname. Starts with `/`. A sub-page route starts with its parent route + `/`. */
  route: string
  /**
   * Display-label resolver. A thunk so the consumer can wire `t('…')` and have
   * it re-evaluate inside a tracked render. Called during render.
   */
  label: () => string
  /** Icon key — resolved by the consumer-supplied `renderIcon`. */
  icon: string
  /** Nested entries — render as breadcrumb-chain levels after the parent. */
  subPages?: PageEntry[]
  /** Sidebar divider before this entry. Ignored on the first visible page. */
  groupBreak?: boolean
  /** Mobile bottom-bar opt-in (only when `AppShell mobileNav='tabBar'`). Top-level only. */
  tabBar?: boolean
}

export interface ShellPageContainerConfig {
  defaultMaxWidth: PageContainerMaxWidth
}

export interface ShellTabsConfig {
  variant: ShellTabsVariant
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
  leading?: number
  /** Crumbs kept at the end, including the leaf. Default `2`. */
  trailing?: number
}

export interface ShellPageHeaderConfig {
  /** Header band gets a bottom border. Default `true`. */
  border: boolean
  /** Project-wide default browser-tab mode. Default `'composed'`. */
  documentTitle?: ShellDocumentTitleMode
  /**
   * Breadcrumb middle-collapse. Default `{ leading: 1, trailing: 2 }`; pass
   * `false` to disable collapse (per-crumb truncation still applies).
   */
  breadcrumbCollapse?: ShellBreadcrumbCollapseConfig | false
}

/**
 * Icon renderer. The shell is icon-library-agnostic: the consumer passes one
 * function that turns an icon key + pixel size into a node. The module ships no
 * icon kit, so this is required.
 */
export type ShellIconRenderer = (key: string, size: number) => ReactNode

/**
 * Aria-label / tooltip strings the chrome needs. The consumer supplies
 * translated thunks; the module never imports i18n. All optional — sensible
 * English fallbacks apply when omitted.
 */
export interface ShellChromeLabels {
  home?: () => string
  breadcrumb?: () => string
  openMenu?: () => string
  mainNavigation?: () => string
  more?: () => string
}

/** Author-facing config — passed to `defineShellConfig`. */
export interface ShellConfigInput {
  /** App name — home-link text + document-title suffix. */
  appName: string
  /** Optional custom wordmark render for the brand area. */
  appNameRender?: () => ReactNode
  /** Top-level nav entries. May be empty — a card-dashboard app navigates via
   *  the home cards + breadcrumbs and has no fixed sidebar nav. */
  pages: PageEntry[]
  /** Page-container defaults. Omitted → `'2xl'`. */
  pageContainer?: ShellPageContainerConfig
  /** Tab strip variant. Omitted → `'underline'`. */
  tabs?: ShellTabsConfig
  /** `ShellPageHeader` visual options. `border` defaults `true`. */
  shellPageHeader?: ShellPageHeaderConfig
  /** Renders icon keys. Required — sidebar / breadcrumb / tabs all need it. */
  renderIcon: ShellIconRenderer
  /** Aria-label / tooltip strings the chrome needs. */
  labels?: ShellChromeLabels
}

/** Validated, branded config — what `<AppShell>` accepts. */
export interface ShellConfig extends ShellConfigInput {
  readonly [SHELL_CONFIG_BRAND]: true
}

/** Page-level search slot for `ShellPageHeader`. */
export interface ShellPageHeaderSearchSlot {
  onChange: (value: string) => void
  placeholder?: () => string
  initialValue?: string
}

/**
 * Spec a `<ShellPageHeader>` registers onto shell context, consumed by
 * `<AppShell>`. Plain values carrying thunks (not Solid getter proxies): the
 * registration effect re-runs on prop change and re-registers, re-rendering the
 * chrome.
 */
export interface ShellPageHeaderSpec {
  title?: () => string
  actions?: Array<() => ReactNode>
  search?: ShellPageHeaderSearchSlot
  tabs?: () => ReactNode
  documentTitle?: ShellDocumentTitleMode | (() => string)
  className?: string
}
