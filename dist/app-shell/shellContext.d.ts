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
    /** Map keyed by parent route → that parent's dynamic children. */
    dynamicPages: Record<string, DynamicPagesEntry[]>;
    /** Internal — `useDynamicPages` registers/replaces a parent's children. Returns an unregister. */
    registerDynamicPages: (parent: string, items: DynamicPagesEntry[]) => () => void;
    /** Currently-registered page-header spec, or `null`. */
    pageHeaderSpec: ShellPageHeaderSpec | null;
    /** Internal — `<ShellPageHeader>` registers its spec. Returns an unregister. Last-mounted wins. */
    registerPageHeader: (spec: ShellPageHeaderSpec) => () => void;
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
