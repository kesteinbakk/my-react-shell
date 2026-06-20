/**
 * MissingTranslationsOverlay — dev-only surface for missing translation keys.
 *
 * Drop it once near the app root. While any key fails to resolve it shows a
 * fixed, warning-styled panel listing the misses (key + locale) with copy-keys
 * and clear actions, reading the module-level <missingKeyStore> via
 * `useSyncExternalStore`. Renders nothing in production (gated on
 * `import.meta.env.DEV`) or when nothing is missing. Styled with semantic theme
 * tokens only, so it tracks the active palette in light and dark.
 */

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { CSSProperties } from 'react'
import { missingKeyStore } from './missingKeys'

export interface MissingTranslationsOverlayProps {
  /** Force the overlay on/off. Defaults to `import.meta.env.DEV` (dev only). */
  enabled?: boolean
}

const panelStyle: CSSProperties = {
  position: 'fixed',
  bottom: 16,
  right: 16,
  zIndex: 2147483647,
  display: 'flex',
  flexDirection: 'column',
  width: 380,
  maxWidth: 'calc(100vw - 32px)',
  maxHeight: 320,
  overflow: 'hidden',
  borderRadius: 10,
  background: 'var(--color-surface-elevated)',
  color: 'var(--color-text-primary)',
  border: '2px solid var(--color-warning)',
  boxShadow: 'var(--color-shadow-lg)',
  font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
}

const headerStyle: CSSProperties = {
  flexShrink: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  padding: '9px 12px',
  background: 'var(--color-warning-bg)',
  borderBottom: '1px solid var(--color-warning-border)',
  color: 'var(--color-warning-content)',
  fontWeight: 700,
}

const titleStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8 }
const iconStyle: CSSProperties = { fontSize: 15, lineHeight: 1 }
const actionsStyle: CSSProperties = { display: 'flex', gap: 6 }

const buttonStyle: CSSProperties = {
  cursor: 'pointer',
  padding: '3px 8px',
  borderRadius: 6,
  border: '1px solid var(--color-warning-border)',
  background: 'var(--color-surface-elevated)',
  color: 'var(--color-warning-content)',
  font: 'inherit',
  fontWeight: 600,
}

const bodyStyle: CSSProperties = {
  flex: '1 1 auto',
  minHeight: 0,
  overflow: 'auto',
  padding: '8px 12px 10px',
  listStyle: 'none',
  margin: 0,
}

const itemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  gap: 8,
  padding: '2px 0',
}

const keyStyle: CSSProperties = { color: 'var(--color-text-primary)' }
const localeStyle: CSSProperties = { color: 'var(--color-text-muted)', flexShrink: 0 }

export function MissingTranslationsOverlay({ enabled }: MissingTranslationsOverlayProps = {}) {
  const missing = useSyncExternalStore(
    missingKeyStore.subscribe,
    missingKeyStore.getSnapshot,
    missingKeyStore.getSnapshot,
  )
  const [copied, setCopied] = useState(false)
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(
    () => () => {
      if (resetTimer.current !== null) clearTimeout(resetTimer.current)
    },
    [],
  )

  const show = enabled ?? import.meta.env.DEV
  if (!show || missing.length === 0) return null

  const copyKeys = () => {
    // The distinct missing keys, sorted, one per line — paste-ready for the catalog.
    const text = Array.from(new Set(missing.map((m) => m.key)))
      .sort()
      .join('\n')
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(text).then(
      () => {
        setCopied(true)
        if (resetTimer.current !== null) clearTimeout(resetTimer.current)
        resetTimer.current = setTimeout(() => setCopied(false), 1500)
      },
      () => {
        /* clipboard blocked (insecure context / denied) — leave the label as-is */
      },
    )
  }

  return (
    <div style={panelStyle} role="log" aria-label="Missing translations">
      <div style={headerStyle}>
        <span style={titleStyle}>
          <span style={iconStyle} aria-hidden="true">
            ⚠️
          </span>
          Missing translations ({missing.length})
        </span>
        <span style={actionsStyle}>
          <button type="button" style={buttonStyle} onClick={copyKeys}>
            {copied ? 'Copied!' : 'Copy keys'}
          </button>
          <button type="button" style={buttonStyle} onClick={() => missingKeyStore.clear()}>
            Clear
          </button>
        </span>
      </div>
      <ul style={bodyStyle}>
        {missing.map((m) => (
          <li key={`${m.key}@${m.locale}`} style={itemStyle}>
            <span style={keyStyle}>{m.key}</span>
            <span style={localeStyle}>· {m.locale}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
