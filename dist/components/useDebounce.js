import { useCallback, useEffect, useRef } from 'react';
/**
 * Returns a stable debounced wrapper for `callback`. The wrapper schedules `callback`
 * to fire `delayMs` after the last call; a new call within the window resets the timer.
 * The pending timer is automatically cancelled on unmount.
 *
 * Both `callback` and `delayMs` are read via refs at fire-time, so changing them
 * between renders does not affect the stable function reference.
 *
 * ```ts
 * const scheduleSearch = useDebounce(onSearch, 300)
 * <input onChange={(e) => scheduleSearch(e.target.value)} />
 * ```
 */
export function useDebounce(callback, delayMs) {
    const timerRef = useRef(undefined);
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    const delayRef = useRef(delayMs);
    delayRef.current = delayMs;
    useEffect(() => () => clearTimeout(timerRef.current), []);
    return useCallback((...args) => {
        if (!callbackRef.current)
            return;
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => callbackRef.current?.(...args), delayRef.current);
    }, []);
}
