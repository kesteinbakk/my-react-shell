/**
 * Shell context — React context for the app-shell.
 *
 * Replaces the SolidJS signal-based context. The value shape is React-idiomatic:
 * the scroll container is a **state value** (element-or-null), not an accessor —
 * consumers read it directly and React re-renders them when it resolves. The
 * page-header spec and dynamic-pages map are plain React state too. `<AppShell>`
 * owns and rebuilds the value via `useMemo` keyed on its reactive pieces.
 */
import type { PageEntry, ShellConfig, ShellPageHeaderSpec } from './shellContract';
/** One dynamic page — same fields as `PageEntry`, produced at runtime. */
export interface DynamicPagesEntry extends PageEntry {
}
export interface ShellContextValue {
    config: ShellConfig;
    /**
     * The body-cell element, or `null` before mount. A state value (re-renders
     * consumers when it resolves) — not an accessor.
     */
    scrollContainer: HTMLElement | null;
    /** Internal — `<AppShell>`'s body-cell ref callback calls this. */
    setScrollContainer: (el: HTMLElement | null) => void;
    /** Map keyed by parent route → that parent's dynamic children (merged across all registrants). */
    dynamicPages: Record<string, DynamicPagesEntry[]>;
    /** Internal — `useDynamicPages` registers a registrant's children under a parent. Returns an unregister. */
    registerDynamicPages: (registrantId: string, parent: string, items: DynamicPagesEntry[]) => () => void;
    /** The winning page-header spec (deepest-mounted contributor), or `null`. */
    pageHeaderSpec: ShellPageHeaderSpec | null;
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
        update: (next: ShellPageHeaderSpec) => void;
        unregister: () => void;
    };
}
export declare const ShellContext: import("react").Context<ShellContextValue | null>;
/** Read the shell context. Throws if used outside `<AppShell>`. */
export declare function useShellContext(): ShellContextValue;
/**
 * Read the shell context, tolerating its absence. Returns `null` for components
 * that legitimately work standalone (`AppHeader`, `PageSections`, `PageTabs`,
 * the section tab strip).
 */
export declare function useShellContextOptional(): ShellContextValue | null;
