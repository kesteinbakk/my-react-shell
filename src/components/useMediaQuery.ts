import { useSyncExternalStore } from 'react'

/**
 * Subscribe to a CSS media query and return whether it currently matches. Reads the
 * value synchronously on first render (no flash, no post-mount effect) via
 * `useSyncExternalStore`, and re-renders when the match state changes.
 *
 * Pass `null` to disable the subscription (the hook still runs — so it can be called
 * unconditionally — and returns `false`).
 */
export function useMediaQuery(query: string | null): boolean {
  return useSyncExternalStore(
    (onStoreChange) => {
      if (query == null) return () => {}
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onStoreChange)
      return () => mql.removeEventListener('change', onStoreChange)
    },
    () => (query == null ? false : window.matchMedia(query).matches),
    () => false,
  )
}
