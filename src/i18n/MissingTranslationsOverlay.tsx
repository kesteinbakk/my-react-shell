/**
 * MissingTranslationsOverlay — dev-only surface for missing translation keys.
 *
 * Drop it once near the app root. While any key fails to resolve it shows a
 * fixed panel listing the misses (key + locale) with a clear button, reading
 * the module-level <missingKeyStore> via `useSyncExternalStore`. Renders
 * nothing in production (gated on `import.meta.env.DEV`) or when nothing is
 * missing. Styled with semantic theme tokens only.
 */

import { useSyncExternalStore } from 'react'
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
  width: 360,
  maxWidth: 'calc(100vw - 32px)',
  maxHeight: 280,
  overflow: 'auto',
  padding: 12,
  borderRadius: 8,
  background: 'var(--color-surface-elevated)',
  color: 'var(--color-text-primary)',
  border: '1px solid var(--color-warning-border)',
  boxShadow: 'var(--color-shadow-lg)',
  font: '12px/1.5 ui-monospace, SFMono-Regular, Menlo, monospace',
}

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 8,
  color: 'var(--color-warning-content)',
  fontWeight: 600,
}

const buttonStyle: CSSProperties = {
  cursor: 'pointer',
  padding: '2px 8px',
  borderRadius: 6,
  border: '1px solid var(--color-border-primary)',
  background: 'var(--color-surface-secondary)',
  color: 'var(--color-text-secondary)',
  font: 'inherit',
}

const keyStyle: CSSProperties = { color: 'var(--color-text-primary)' }
const localeStyle: CSSProperties = { color: 'var(--color-text-muted)' }

export function MissingTranslationsOverlay({ enabled }: MissingTranslationsOverlayProps = {}) {
  const missing = useSyncExternalStore(
    missingKeyStore.subscribe,
    missingKeyStore.getSnapshot,
    missingKeyStore.getSnapshot,
  )
  const show = enabled ?? import.meta.env.DEV
  if (!show || missing.length === 0) return null

  return (
    <div style={panelStyle} role="log" aria-label="Missing translations">
      <div style={headerStyle}>
        <span>Missing translations ({missing.length})</span>
        <button type="button" style={buttonStyle} onClick={() => missingKeyStore.clear()}>
          Clear
        </button>
      </div>
      <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
        {missing.map((m) => (
          <li key={`${m.key}@${m.locale}`} style={{ padding: '2px 0' }}>
            <span style={keyStyle}>{m.key}</span> <span style={localeStyle}>· {m.locale}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
