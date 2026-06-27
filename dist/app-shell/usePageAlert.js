import { useEffect, useRef } from 'react';
import { useShellAPIContext } from './shellContext';
/**
 * usePageAlert — register a global page-level alert into the shell header band.
 *
 * If `hideOtherActions` is true, the renderer will hide any actions or search inputs
 * registered by `usePageHeader`.
 */
export function usePageAlert(spec) {
    const shell = useShellAPIContext();
    const handleRef = useRef(null);
    useEffect(() => {
        if (spec === null) {
            if (handleRef.current) {
                handleRef.current.unregister();
                handleRef.current = null;
            }
            return;
        }
        if (!handleRef.current) {
            handleRef.current = shell.registerPageAlert(spec);
        }
        else {
            handleRef.current.update(spec);
        }
    }, [shell.registerPageAlert, spec?.label, spec?.tone, spec?.hideOtherActions]);
    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (handleRef.current) {
                handleRef.current.unregister();
                handleRef.current = null;
            }
        };
    }, []);
}
