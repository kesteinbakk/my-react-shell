/**
 * LargeMenuProvider — owns the "large menu" display preference (enlarged header
 * chrome). Mirrors <IconModeProvider>: uncontrolled by default (seeds from
 * localStorage and persists there, zero-config) and controllable via `value` +
 * `onChange` (own the state yourself, e.g. mirror it to a per-user account /
 * Convex; the provider then stops touching localStorage). SPA-only (no SSR).
 *
 * <AppShell> reads this softly (`useLargeMenuOptional`), so a consumer that never
 * mounts the provider is entirely unaffected — the preference is off. Pair it with
 * <UserPreferences> (`largeMenu` / `onLargeMenuChange`) to give users the toggle.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { LargeMenuContext } from './largeMenuContext'
import type { LargeMenuContextValue } from './largeMenuContext'

const DEFAULT_STORAGE_KEY = 'my-react-shell.large-menu'

export interface LargeMenuProviderProps {
  children: ReactNode
  /** Controlled value. Provide with `onChange` to own state + persistence yourself. */
  value?: boolean
  /**
   * Change handler. In controlled mode it is the only writer; in uncontrolled mode
   * it fires alongside the internal update (so a consumer can additionally sync).
   */
  onChange?: (large: boolean) => void
  /** Initial value when uncontrolled and nothing is persisted. Default `false` (off). */
  defaultLarge?: boolean
  /** localStorage key for uncontrolled persistence. Default `'my-react-shell.large-menu'`. */
  storageKey?: string
}

function readPersisted(storageKey: string): boolean | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(storageKey)
  } catch {
    return null // storage blocked (e.g. privacy mode)
  }
  return raw === 'true' ? true : raw === 'false' ? false : null
}

export function LargeMenuProvider({
  children,
  value,
  onChange,
  defaultLarge = false,
  storageKey = DEFAULT_STORAGE_KEY,
}: LargeMenuProviderProps) {
  const controlled = value !== undefined

  // Seeded once; ignored while controlled (where `value` is the source of truth).
  const [internal, setInternal] = useState<boolean>(() =>
    controlled ? value : (readPersisted(storageKey) ?? defaultLarge),
  )

  const largeMenu = controlled ? value : internal

  // Persist — uncontrolled only; a controlled consumer owns persistence.
  useEffect(() => {
    if (controlled) return
    try {
      window.localStorage.setItem(storageKey, String(internal))
    } catch {
      /* ignore */
    }
  }, [controlled, internal, storageKey])

  const setLargeMenu = useCallback(
    (large: boolean) => {
      if (!controlled) setInternal(large)
      onChange?.(large)
    },
    [controlled, onChange],
  )

  const ctx = useMemo<LargeMenuContextValue>(
    () => ({ largeMenu, setLargeMenu }),
    [largeMenu, setLargeMenu],
  )

  return <LargeMenuContext.Provider value={ctx}>{children}</LargeMenuContext.Provider>
}
