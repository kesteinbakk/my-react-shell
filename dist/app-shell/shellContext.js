/**
 * Shell context — React context for the app-shell.
 *
 * Replaces the SolidJS signal-based context. The value shape is React-idiomatic:
 * the scroll container is a **state value** (element-or-null), not an accessor —
 * consumers read it directly and React re-renders them when it resolves. The
 * page-header spec and dynamic-pages map are plain React state too. `<AppShell>`
 * owns and rebuilds the value via `useMemo` keyed on its reactive pieces.
 */
import { createContext, useContext } from 'react';
export const ShellContext = createContext(null);
/** Read the shell context. Throws if used outside `<AppShell>`. */
export function useShellContext() {
    const ctx = useContext(ShellContext);
    if (!ctx) {
        throw new Error('useShellContext must be called inside <AppShell>');
    }
    return ctx;
}
/**
 * Read the shell context, tolerating its absence. Returns `null` for components
 * that legitimately work standalone (`AppHeader`, `PageSections`, `PageTabs`,
 * the section tab strip).
 */
export function useShellContextOptional() {
    return useContext(ShellContext);
}
