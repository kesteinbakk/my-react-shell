/**
 * IconModeProvider — owns the "icons vs emojis" display preference.
 *
 * Uncontrolled by default: seeds from localStorage and persists changes there,
 * zero-config. Controllable: pass `value` + `onChange` to own the state yourself
 * (e.g. mirror it to a per-user account / Convex), and the provider stops touching
 * localStorage. SPA-only (no SSR), matching <ThemeProvider>.
 */

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { IconModeContext } from './iconModeContext'
import type { IconMode, IconModeContextValue } from './iconModeContext'

export type { IconMode } from './iconModeContext'

const DEFAULT_STORAGE_KEY = 'my-react-shell.icon-mode'

export interface IconModeProviderProps {
  children: ReactNode
  /** Controlled value. Provide with `onChange` to own state + persistence yourself. */
  value?: IconMode
  /**
   * Change handler. In controlled mode it is the only writer; in uncontrolled mode
   * it fires alongside the internal update (so a consumer can additionally sync).
   */
  onChange?: (mode: IconMode) => void
  /** Initial mode when uncontrolled and nothing is persisted. Default `'icon'`. */
  defaultMode?: IconMode
  /** localStorage key for uncontrolled persistence. Default `'my-react-shell.icon-mode'`. */
  storageKey?: string
}

function readPersisted(storageKey: string): IconMode | null {
  let raw: string | null
  try {
    raw = window.localStorage.getItem(storageKey)
  } catch {
    return null // storage blocked (e.g. privacy mode)
  }
  return raw === 'icon' || raw === 'emoji' ? raw : null
}

export function IconModeProvider({
  children,
  value,
  onChange,
  defaultMode = 'icon',
  storageKey = DEFAULT_STORAGE_KEY,
}: IconModeProviderProps) {
  const controlled = value !== undefined

  // Seeded once; ignored while controlled (where `value` is the source of truth).
  const [internal, setInternal] = useState<IconMode>(() =>
    controlled ? value : (readPersisted(storageKey) ?? defaultMode),
  )

  const iconMode = controlled ? value : internal

  // Persist — uncontrolled only; a controlled consumer owns persistence.
  useEffect(() => {
    if (controlled) return
    try {
      window.localStorage.setItem(storageKey, internal)
    } catch {
      /* ignore */
    }
  }, [controlled, internal, storageKey])

  const setIconMode = useCallback(
    (mode: IconMode) => {
      if (!controlled) setInternal(mode)
      onChange?.(mode)
    },
    [controlled, onChange],
  )

  const ctx = useMemo<IconModeContextValue>(
    () => ({ iconMode, setIconMode }),
    [iconMode, setIconMode],
  )

  return <IconModeContext.Provider value={ctx}>{children}</IconModeContext.Provider>
}
