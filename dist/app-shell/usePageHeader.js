/**
 * usePageHeader — register a route's page chrome (title / actions / search / tabs /
 * documentTitle / className) onto the shell band.
 *
 * The breadcrumb band itself renders **automatically** from the URL chain — a page
 * does not call this hook just to show breadcrumbs. Call it only to *add* chrome.
 * The hook splits identity from content: a register-once mount effect fixes this
 * contributor's slot under a stable **render-order token** (so the deepest-mounted
 * `usePageHeader` wins — see `shellContext.registerPageHeader`), while a separate
 * effect updates the spec **in place** on any option change — never re-registering,
 * so the winner can't flip at runtime when a component re-renders with fresh inline
 * thunks. The chrome stays reactive while remaining deterministic.
 *
 * Replaces foundation's `<ShellPageHeader>` registration component with a hook (the
 * React-idiomatic shape, consistent with the sibling `useDynamicPages`).
 */
import { useEffect, useRef } from 'react';
import { useShellAPIContext } from './shellContext';
/**
 * Monotonic, module-wide counter handing each `usePageHeader` instance a token in
 * **render order**. React renders ancestors before descendants, so an ancestor's
 * token is lower than a descendant's — the shell picks the highest (deepest) as the
 * band winner. Mutated during render but guarded by a per-instance ref, so each
 * instance claims exactly one token even under StrictMode's double-invoke.
 */
let nextHeaderOrder = 0;
/** Register page chrome onto the shell band. No-op band-wise if every field is absent. */
export function usePageHeader(options) {
    const shell = useShellAPIContext();
    // Claim a render-order token once per instance (ref guard ⇒ StrictMode-safe).
    const orderRef = useRef(-1);
    if (orderRef.current === -1)
        orderRef.current = nextHeaderOrder++;
    const handleRef = useRef(null);
    const buildSpec = () => ({
        title: options.title,
        actions: options.actions,
        search: options.search,
        tabs: options.tabs,
        documentTitle: options.documentTitle,
        className: options.className,
    });
    // Identity — runs once; fixes this contributor's slot + render-order token.
    // `registerPageHeader` is stable (useCallback in AppShell), so this never re-fires.
    useEffect(() => {
        const handle = shell.registerPageHeader(orderRef.current, buildSpec());
        handleRef.current = handle;
        return () => {
            handle.unregister();
            handleRef.current = null;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- register once; registerPageHeader + order are stable
    }, [shell.registerPageHeader]);
    // Content — re-runs on any option change; updates the spec in place, no re-register.
    // The explicit option deps (not `buildSpec`) are the reactive set, by design.
    useEffect(() => {
        handleRef.current?.update(buildSpec());
        // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit option deps are the reactive set
    }, [
        options.title,
        options.actions,
        options.search,
        options.tabs,
        options.documentTitle,
        options.className,
    ]);
}
