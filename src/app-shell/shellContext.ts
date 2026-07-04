/**
 * Shell context — React context for the app-shell.
 *
 * Replaces the SolidJS signal-based context. The value shape is React-idiomatic:
 * the scroll container is a **state value** (element-or-null), not an accessor —
 * consumers read it directly and React re-renders them when it resolves. The
 * page-header spec and dynamic-pages map are plain React state too. `<AppShell>`
 * owns and rebuilds the value via `useMemo` keyed on its reactive pieces.
 */

import { createContext, useContext } from 'react'
import type { PageEntry, ShellConfig, ShellPageHeaderSpec, PageHeaderAlertSpec } from './shellContract'

/** One dynamic page — same fields as `PageEntry`, produced at runtime. */
export interface DynamicPagesEntry extends PageEntry {}

/**
 * Runtime app-mode state — the live value, the currently-available modes, and
 * the visibility / selectability flags. Owned by `<AppShell>` (seeded from the
 * `appMode` block of the shell config) and exposed to the whole tree via
 * `useAppMode()`. `null` on the context when the config declares no `appMode`.
 */
export interface ShellAppModeRuntime {
  /** The current app-mode — a value from {@link modes}. */
  appMode: string
  /** Set the current app-mode — from end-user selection or a data-driven effect. */
  setAppMode: (mode: string) => void
  /**
   * The modes available *right now* (seeded from `config.appMode.modes`, narrowable
   * at runtime — e.g. by role). The control auto-hides when fewer than two remain.
   */
  modes: string[]
  /** Replace the available modes at runtime (≤ 1 auto-hides the control). */
  setModes: (modes: string[]) => void
  /** Whether the control is shown. */
  visible: boolean
  setVisible: (visible: boolean) => void
  /** Whether the end-user may change the app-mode (`false` → read-only indicator). */
  selectable: boolean
  setSelectable: (selectable: boolean) => void
}

export interface ShellContextValue {
  config: ShellConfig
  /**
   * The body-cell element, or `null` before mount. A state value (re-renders
   * consumers when it resolves) — not an accessor.
   */
  scrollContainer: HTMLElement | null
  /** Internal — `<AppShell>`'s body-cell ref callback calls this. */
  setScrollContainer: (el: HTMLElement | null) => void
  /** Map keyed by parent route → that parent's dynamic children (merged across all registrants). */
  dynamicPages: Record<string, DynamicPagesEntry[]>
  /** Internal — `useDynamicPages` registers a registrant's children under a parent. Returns an unregister. */
  registerDynamicPages: (registrantId: string, parent: string, items: DynamicPagesEntry[]) => () => void
  /** The global page-level alert spec, or `null`. */
  pageAlertSpec: PageHeaderAlertSpec | null
  /** Internal — `usePageAlert` registers a global page-level alert. Returns an unregister. */
  registerPageAlert: (spec: PageHeaderAlertSpec) => {
    update: (next: PageHeaderAlertSpec) => void
    unregister: () => void
  }
  /** The winning page-header spec (deepest-mounted contributor), or `null`. */
  pageHeaderSpec: ShellPageHeaderSpec | null
  /**
   * Internal — `usePageHeader` registers its spec under a render-order token
   * (`order`). `<AppShell>` renders the chrome of the entry with the **highest**
   * token — i.e. the **deepest-mounted** `usePageHeader` (React renders parent→child,
   * so an ancestor's order is lower than a descendant's), matching foundation's
   * parent-first `onMount`. Returns a handle that splits **identity** (a fixed slot,
   * set once on mount) from **content**: `update` replaces this slot's spec in place
   * without changing its order, so the winner can't flip when a header re-renders;
   * `unregister` removes the slot (the next-deepest then wins).
   */
  registerPageHeader: (order: number, spec: ShellPageHeaderSpec) => {
    update: (next: ShellPageHeaderSpec) => void
    unregister: () => void
  }
  /**
   * Set (or clear) a plain-string prefix prepended to `document.title`, separated
   * from the composed title by a single space (`"(3) Leaf · App"`). `null` clears
   * it. A single reactive slot with exactly one intended producer (e.g. an unread
   * badge) — not a register/unregister stack. Wired via `useDocumentTitlePrefix`.
   */
  setDocumentTitlePrefix: (prefix: string | null) => void
  /**
   * Runtime app-mode state, or `null` when the config declares no `appMode` block.
   * Read/driven via `useAppMode()`; the shell renders its segmented control from it.
   */
  appMode: ShellAppModeRuntime | null
}

export interface ShellAPIContextValue {
  setScrollContainer: (el: HTMLElement | null) => void
  registerDynamicPages: (registrantId: string, parent: string, items: DynamicPagesEntry[]) => () => void
  registerPageAlert: (spec: PageHeaderAlertSpec) => {
    update: (next: PageHeaderAlertSpec) => void
    unregister: () => void
  }
  registerPageHeader: (order: number, spec: ShellPageHeaderSpec) => {
    update: (next: ShellPageHeaderSpec) => void
    unregister: () => void
  }
  /** Set (or clear, with `null`) the `document.title` prefix. See {@link ShellContextValue.setDocumentTitlePrefix}. */
  setDocumentTitlePrefix: (prefix: string | null) => void
}

export const ShellAPIContext = createContext<ShellAPIContextValue | null>(null)

export function useShellAPIContext(): ShellAPIContextValue {
  const ctx = useContext(ShellAPIContext)
  if (!ctx) {
    throw new Error('useShellAPIContext must be called inside <AppShell>')
  }
  return ctx
}

export const ShellContext = createContext<ShellContextValue | null>(null)

/** Read the shell context. Throws if used outside `<AppShell>`. */
export function useShellContext(): ShellContextValue {
  const ctx = useContext(ShellContext)
  if (!ctx) {
    throw new Error('useShellContext must be called inside <AppShell>')
  }
  return ctx
}

/**
 * Read the shell context, tolerating its absence. Returns `null` for components
 * that legitimately work standalone (`AppHeader`, `PageSections`, `PageTabs`,
 * the section tab strip).
 */
export function useShellContextOptional(): ShellContextValue | null {
  return useContext(ShellContext)
}
