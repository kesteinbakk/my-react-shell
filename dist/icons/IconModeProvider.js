import { jsx as _jsx } from "react/jsx-runtime";
/**
 * IconModeProvider — owns the "icons vs emojis" display preference.
 *
 * Uncontrolled by default: seeds from localStorage and persists changes there,
 * zero-config. Controllable: pass `value` + `onChange` to own the state yourself
 * (e.g. mirror it to a per-user account / Convex), and the provider stops touching
 * localStorage. SPA-only (no SSR), matching <ThemeProvider>.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import { IconModeContext } from './iconModeContext';
const DEFAULT_STORAGE_KEY = 'my-react-shell.icon-mode';
function readPersisted(storageKey) {
    let raw;
    try {
        raw = window.localStorage.getItem(storageKey);
    }
    catch {
        return null; // storage blocked (e.g. privacy mode)
    }
    return raw === 'icon' || raw === 'emoji' ? raw : null;
}
export function IconModeProvider({ children, value, onChange, defaultMode = 'icon', storageKey = DEFAULT_STORAGE_KEY, }) {
    const controlled = value !== undefined;
    // Seeded once; ignored while controlled (where `value` is the source of truth).
    const [internal, setInternal] = useState(() => controlled ? value : (readPersisted(storageKey) ?? defaultMode));
    const iconMode = controlled ? value : internal;
    // Persist — uncontrolled only; a controlled consumer owns persistence.
    useEffect(() => {
        if (controlled)
            return;
        try {
            window.localStorage.setItem(storageKey, internal);
        }
        catch {
            /* ignore */
        }
    }, [controlled, internal, storageKey]);
    const setIconMode = useCallback((mode) => {
        if (!controlled)
            setInternal(mode);
        onChange?.(mode);
    }, [controlled, onChange]);
    const ctx = useMemo(() => ({ iconMode, setIconMode }), [iconMode, setIconMode]);
    return _jsx(IconModeContext.Provider, { value: ctx, children: children });
}
