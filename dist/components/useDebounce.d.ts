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
export declare function useDebounce<T extends unknown[]>(callback: ((...args: T) => void) | undefined, delayMs: number): (...args: T) => void;
