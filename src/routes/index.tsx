import { createFileRoute } from '@tanstack/react-router'
import { useTheme } from '../index'

export const Route = createFileRoute('/')({
  component: ThemePlayground,
})

// Token groups rendered as swatches, to verify every palette resolves the
// contract in both modes. Names are the `--color-<name>` suffix.
const SURFACE_TOKENS = [
  'surface-primary',
  'surface-secondary',
  'surface-tertiary',
  'surface-elevated',
  'surface-neutral',
  'background-primary',
  'background-secondary',
]
const BORDER_TOKENS = ['border-primary', 'border-secondary', 'border-hover']
const BRAND_TOKENS = ['primary', 'primary-hover', 'primary-active', 'secondary', 'secondary-hover']
const SEMANTIC_TOKENS = ['success', 'warning', 'danger', 'info']
const ACCENT_TOKENS = ['accent-sky', 'accent-emerald', 'accent-amber', 'accent-violet', 'accent-rose']
const TEXT_TOKENS = ['text-primary', 'text-secondary', 'text-tertiary', 'text-muted', 'text-heading']

function ColorSwatch({ token }: { token: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div
        className="h-12 rounded-md"
        style={{
          backgroundColor: `var(--color-${token})`,
          border: '1px solid var(--color-border-primary)',
        }}
      />
      <code className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
        {token}
      </code>
    </div>
  )
}

function SwatchGroup({ title, tokens }: { title: string; tokens: readonly string[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {tokens.map((t) => (
          <ColorSwatch key={t} token={t} />
        ))}
      </div>
    </section>
  )
}

function ThemePlayground() {
  const { theme, mode, isDark, isSystemMode, themes, setTheme, toggleMode, setSystemMode, cycleTheme } =
    useTheme()

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">my-react-shell · theme playground</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Active: <strong>{theme}</strong> · <strong>{mode}</strong>
          {isSystemMode ? ' (following system)' : ''}
        </p>
      </header>

      {/* Palette selector */}
      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
          Palette
        </h2>
        <div className="flex flex-wrap gap-2">
          {themes.map((t) => {
            const active = t.name === theme
            return (
              <button
                key={t.name}
                type="button"
                onClick={() => setTheme(t.name)}
                title={t.description}
                className="rounded-md px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface-tertiary)',
                  color: active ? 'var(--color-primary-content)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Mode + system controls */}
      <section className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleMode}
          className="rounded-md px-3 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-surface-tertiary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          {isDark ? '☾ Dark' : '☀ Light'} — toggle
        </button>
        <button
          type="button"
          onClick={() => setSystemMode(!isSystemMode)}
          className="rounded-md px-3 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: isSystemMode ? 'var(--color-primary)' : 'var(--color-surface-tertiary)',
            color: isSystemMode ? 'var(--color-primary-content)' : 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          Follow system
        </button>
        <button
          type="button"
          onClick={cycleTheme}
          className="rounded-md px-3 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-surface-tertiary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          Cycle palette →
        </button>
      </section>

      {/* Elevated-surface sample card */}
      <section
        className="rounded-lg p-5"
        style={{
          backgroundColor: 'var(--color-surface-elevated)',
          border: '1px solid var(--color-border-primary)',
          boxShadow: '0 4px 12px var(--color-shadow-md)',
        }}
      >
        <h3 style={{ color: 'var(--color-text-heading)' }} className="text-lg font-semibold">
          Sample card on surface-elevated
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Body text in <span style={{ color: 'var(--color-text-primary)' }}>primary</span>,{' '}
          <span style={{ color: 'var(--color-text-secondary)' }}>secondary</span>, and{' '}
          <span style={{ color: 'var(--color-text-muted)' }}>muted</span> tones, plus a{' '}
          <a href="#playground" className="link">
            themed link
          </a>
          .
        </p>
      </section>

      <SwatchGroup title="Surfaces & backgrounds" tokens={SURFACE_TOKENS} />
      <SwatchGroup title="Borders" tokens={BORDER_TOKENS} />
      <SwatchGroup title="Brand" tokens={BRAND_TOKENS} />
      <SwatchGroup title="Semantic" tokens={SEMANTIC_TOKENS} />
      <SwatchGroup title="Accents" tokens={ACCENT_TOKENS} />

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: 'var(--color-text-secondary)' }}>
          Text hierarchy
        </h2>
        <div className="flex flex-col gap-1">
          {TEXT_TOKENS.map((t) => (
            <span key={t} style={{ color: `var(--color-${t})` }} className="text-base">
              {t} — The quick brown fox jumps over the lazy dog
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}
