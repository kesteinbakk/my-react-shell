/**
 * useAppMode — read and drive the app-mode, the global "what mode is the app in"
 * state declared by the `appMode` block of the shell config.
 *
 * The state lives on `<AppShell>` and reaches the whole tree through shell
 * context, so any component can read `appMode` (a global app mode) and any
 * component can `setAppMode` — from end-user selection *or* from data (a role
 * effect, a data-driven default). Visibility and selectability of the shell's
 * segmented control are runtime flags here too, so a consumer can reveal the
 * switcher to some users, lock it once data commits a mode, or narrow the
 * available `modes` by role (the control auto-hides at ≤ 1 available mode).
 *
 * The value is loosely typed as `string`; pass your own union for exhaustive
 * typing — `useAppMode<'SETUP' | 'MAIN' | 'FINALIZE'>()`.
 */
import { useShellContext, useShellContextOptional } from './shellContext';
function asState(runtime) {
    return runtime;
}
/**
 * Read/drive the app-mode. Throws if used outside `<AppShell>` or when the shell
 * config declares no `appMode` block — use {@link useAppModeOptional} to tolerate
 * the latter in a component that may run in an app without an app-mode.
 */
export function useAppMode() {
    const shell = useShellContext();
    if (shell.appMode === null) {
        throw new Error('useAppMode() requires an `appMode` block in your defineShellConfig — none was declared.');
    }
    return asState(shell.appMode);
}
/**
 * Read/drive the app-mode, tolerating its absence. Returns `null` outside
 * `<AppShell>` or when the config declares no `appMode` block.
 */
export function useAppModeOptional() {
    const shell = useShellContextOptional();
    if (!shell || shell.appMode === null)
        return null;
    return asState(shell.appMode);
}
