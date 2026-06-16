import { useEffect, useRef, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useTheme } from '../index'
import type { ThemeName } from '../index'

export const Route = createFileRoute('/palette')({
  component: PaletteReference,
})

// Every token in the contract (src/styles/base.css), grouped for display. This
// is the full surface a palette must fill — rendering it per theme in both modes
// is how we eyeball that every variable resolves and reads with enough contrast.
const GROUPS: { title: string; tokens: string[] }[] = [
  { title: 'Surfaces', tokens: ['surface-primary', 'surface-secondary', 'surface-tertiary', 'surface-elevated', 'surface-neutral'] },
  { title: 'Backgrounds', tokens: ['background-primary', 'background-secondary'] },
  { title: 'Borders', tokens: ['border-primary', 'border-secondary', 'border-hover'] },
  { title: 'Text', tokens: ['text-primary', 'text-secondary', 'text-tertiary', 'text-muted', 'text-heading'] },
  { title: 'Interactive', tokens: ['hover', 'active', 'selected'] },
  { title: 'Primary', tokens: ['primary', 'primary-hover', 'primary-active', 'primary-content', 'primary-bg'] },
  { title: 'Secondary', tokens: ['secondary', 'secondary-hover', 'secondary-content', 'secondary-bg'] },
  { title: 'Success', tokens: ['success', 'success-hover', 'success-content', 'success-bg', 'success-border'] },
  { title: 'Warning', tokens: ['warning', 'warning-hover', 'warning-content', 'warning-bg', 'warning-border'] },
  { title: 'Danger', tokens: ['danger', 'danger-hover', 'danger-content', 'danger-bg', 'danger-border'] },
  { title: 'Info', tokens: ['info', 'info-hover', 'info-content', 'info-bg', 'info-border'] },
  { title: 'Focus', tokens: ['focus', 'focus-ring'] },
  {
    title: 'Accents',
    tokens: [
      'accent-sky', 'accent-sky-bg', 'accent-sky-hover',
      'accent-emerald', 'accent-emerald-bg', 'accent-emerald-hover',
      'accent-amber', 'accent-amber-bg', 'accent-amber-hover',
      'accent-violet', 'accent-violet-bg', 'accent-violet-hover',
      'accent-rose', 'accent-rose-bg', 'accent-rose-hover',
    ],
  },
  {
    title: 'Extended accents (Dynamic only)',
    tokens: [
      'accent-indigo', 'accent-indigo-bg', 'accent-indigo-hover',
      'accent-purple', 'accent-purple-bg', 'accent-purple-hover',
      'accent-pink', 'accent-pink-bg', 'accent-pink-hover',
      'accent-teal', 'accent-teal-bg', 'accent-teal-hover',
      'accent-orange', 'accent-orange-bg', 'accent-orange-hover',
    ],
  },
  {
    title: 'Share status',
    tokens: [
      'share-public', 'share-public-bg', 'share-public-border',
      'share-shared', 'share-shared-bg', 'share-shared-border',
      'share-private', 'share-private-bg', 'share-private-border',
    ],
  },
  { title: 'Shadows', tokens: ['shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl'] },
]

const TRANSPARENT = 'rgba(0, 0, 0, 0)'

// One token: a swatch whose fill is the live var, plus the name and the value
// the browser actually resolves it to (read back from the rendered element).
function Swatch({ token }: { token: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [value, setValue] = useState('')
  useEffect(() => {
    if (ref.current) setValue(getComputedStyle(ref.current).backgroundColor)
  }, [])
  const unset = value === '' || value === TRANSPARENT
  return (
    <div className="flex items-center gap-2">
      <div
        ref={ref}
        className="h-9 w-9 shrink-0 rounded-md"
        style={{
          backgroundColor: `var(--color-${token})`,
          border: '1px solid var(--color-border-secondary)',
          // A faint checker shows through tokens with alpha (shadows, focus-ring).
          backgroundImage: unset
            ? 'repeating-linear-gradient(45deg, var(--color-border-primary) 0 4px, transparent 4px 8px)'
            : undefined,
        }}
      />
      <div className="flex min-w-0 flex-col leading-tight">
        <code className="truncate text-xs" style={{ color: 'var(--color-text-primary)' }}>
          {token}
        </code>
        <code className="truncate text-[11px]" style={{ color: unset ? 'var(--color-text-muted)' : 'var(--color-text-tertiary)' }}>
          {unset ? 'unset' : value}
        </code>
      </div>
    </div>
  )
}

// One mode of one theme: the contract rendered inside a scoped `.theme-x-mode`
// wrapper, so every token resolves to that palette/mode regardless of the
// globally-active theme on <html>.
function ModeColumn({ theme, mode }: { theme: ThemeName; mode: 'light' | 'dark' }) {
  return (
    <div
      className={`theme-${theme}-${mode} flex-1 rounded-lg p-5`}
      style={{
        backgroundColor: 'var(--color-background-primary)',
        border: '1px solid var(--color-border-primary)',
        colorScheme: mode,
      }}
    >
      <div className="mb-4 flex items-center gap-2">
        <span className="text-sm font-semibold" style={{ color: 'var(--color-text-heading)' }}>
          {mode === 'light' ? '☀ Light' : '☾ Dark'}
        </span>
        <code className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
          .theme-{theme}-{mode}
        </code>
      </div>
      <div className="flex flex-col gap-5">
        {GROUPS.map((g) => (
          <section key={g.title} className="flex flex-col gap-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
              {g.title}
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {g.tokens.map((t) => (
                <Swatch key={t} token={t} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function PaletteReference() {
  const { theme: activeTheme, themes } = useTheme()
  const [selected, setSelected] = useState<ThemeName>(activeTheme)

  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-6 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Color palette reference</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Every token in the contract, for the selected palette, in both modes side by side. Each
          theme renders in its own scoped class, so this page is independent of the active theme above.
        </p>
      </header>

      {/* Theme tabs */}
      <div
        className="flex flex-wrap gap-1 border-b"
        style={{ borderColor: 'var(--color-border-primary)' }}
        role="tablist"
        aria-label="Palette"
      >
        {themes.map((t) => {
          const active = t.name === selected
          return (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setSelected(t.name)}
              title={t.description}
              className="px-4 py-2 text-sm font-medium transition-colors"
              style={{
                color: active ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                borderBottom: active ? '2px solid var(--color-primary)' : '2px solid transparent',
                marginBottom: '-1px',
              }}
            >
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Light + dark, remounted per tab so computed values re-read. */}
      <div key={selected} className="flex flex-col gap-5 lg:flex-row">
        <ModeColumn theme={selected} mode="light" />
        <ModeColumn theme={selected} mode="dark" />
      </div>
    </main>
  )
}
