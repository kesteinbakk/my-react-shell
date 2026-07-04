/**
 * usePhase — read and drive the app-phase, the global "what mode is the app in"
 * state declared by the `phase` block of the shell config.
 *
 * The state lives on `<AppShell>` and reaches the whole tree through shell
 * context, so any component can read `phase` (a global app mode) and any
 * component can `setPhase` — from end-user selection *or* from data (a role
 * effect, a data-driven default). Visibility and selectability of the shell's
 * segmented control are runtime flags here too, so a consumer can reveal the
 * switcher to some users, lock it once data commits a phase, or narrow the
 * available `states` by role (the control auto-hides at ≤ 1 available state).
 *
 * The value is loosely typed as `string`; pass your own union for exhaustive
 * typing — `usePhase<'SETUP' | 'MAIN' | 'FINALIZE'>()`.
 */
/** The `usePhase` result — {@link ShellPhaseRuntime} narrowed to a state union `T`. */
export interface ShellPhaseState<T extends string = string> {
    phase: T;
    setPhase: (phase: T) => void;
    states: T[];
    setStates: (states: T[]) => void;
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectable: boolean;
    setSelectable: (selectable: boolean) => void;
}
/**
 * Read/drive the app-phase. Throws if used outside `<AppShell>` or when the shell
 * config declares no `phase` block — use {@link usePhaseOptional} to tolerate the
 * latter in a component that may run in an app without a phase.
 */
export declare function usePhase<T extends string = string>(): ShellPhaseState<T>;
/**
 * Read/drive the app-phase, tolerating its absence. Returns `null` outside
 * `<AppShell>` or when the config declares no `phase` block.
 */
export declare function usePhaseOptional<T extends string = string>(): ShellPhaseState<T> | null;
