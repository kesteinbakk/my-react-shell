/**
 * MenuSizeProvider — owns the header-chrome size preference (`small` · `medium` ·
 * `large`). Mirrors <IconModeProvider>: uncontrolled by default (seeds from
 * localStorage and persists there, zero-config) and controllable via `value` +
 * `onChange` (own the state yourself, e.g. mirror it to a per-user account /
 * Convex; the provider then stops touching localStorage). SPA-only (no SSR).
 *
 * <AppShell> reads this softly (`useMenuSizeOptional`), so a consumer that never
 * mounts the provider is entirely unaffected — the size is `small` (normal). Pair
 * it with <UserPreferences> (`menuSize` / `onMenuSizeChange`) to give users the
 * control.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { MenuSizeContext } from './menuSizeContext'
import type { MenuSize, MenuSizeContextValue } from './menuSizeContext'

export type { MenuSize } from './menuSizeContext'

const DEFAULT_STORAGE_KEY = 'my-react-shell.menu-size'

export interface MenuSizeProviderProps {
  children: ReactNode
  /** Controlled value. Provide with `onChange` to own state + persistence yourself. */
  value?: MenuSize
  /**
   * Change handler. In controlled mode it is the only writer; in uncontrolled mode
   * it fires alongside the internal update (so a consumer can additionally sync).
   */
  onChange?: (size: MenuSize) => void
  /** Initial size when uncontrolled and nothing is persisted. Default `'small'`. */
  defaultSize?: MenuSize
  /** localStorage key for uncontrolled persistence. Default `'my-react-shell.menu-size'`. */
  storageKey?: string
}

function readPersisted(storageKey: string): MenuSize | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(storageKey)
  } catch {
    return null // storage blocked (e.g. privacy mode)
  }
  return raw === 'small' || raw === 'medium' || raw === 'large' ? raw : null
}

export function MenuSizeProvider({
  children,
  value,
  onChange,
  defaultSize = 'small',
  storageKey = DEFAULT_STORAGE_KEY,
}: MenuSizeProviderProps) {
  const controlled = value !== undefined

  // Seeded once; ignored while controlled (where `value` is the source of truth).
  const [internal, setInternal] = useState<MenuSize>(() =>
    controlled ? value : (readPersisted(storageKey) ?? defaultSize),
  )

  const menuSize = controlled ? value : internal

  // Persist — uncontrolled only; a controlled consumer owns persistence.
  useEffect(() => {
    if (controlled) return
    try {
      window.localStorage.setItem(storageKey, internal)
    } catch {
      /* ignore */
    }
  }, [controlled, internal, storageKey])

  const setMenuSize = useCallback(
    (size: MenuSize) => {
      if (!controlled) setInternal(size)
      onChange?.(size)
    },
    [controlled, onChange],
  )

  const ctx = useMemo<MenuSizeContextValue>(
    () => ({ menuSize, setMenuSize }),
    [menuSize, setMenuSize],
  )

  return <MenuSizeContext.Provider value={ctx}>{children}</MenuSizeContext.Provider>
}
