import { createFileRoute } from '@tanstack/react-router'
import { useTheme } from '../index'

export const Route = createFileRoute('/')({
  component: ThemeSmokeTest,
})

// The harness's in-browser theme/provider behavior check (strategy D7): drive the
// live useTheme() controls — palette select, light/dark, follow-system, cycle —
// and eyeball one elevated surface to catch FOUC, system-follow, persistence, and
// palette resolution that typecheck can't. The full per-token palette reference is
// the demo's job (my-react-shell-demo → PaletteReference), not the harness.
function ThemeSmokeTest() {
  const { theme, mode, isDark, isSystemMode, themes, setTheme, toggleMode, setSystemMode, cycleTheme } =
    useTheme()

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">my-react-shell · theme smoke-test</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
          Active: <strong>{theme}</strong> · <strong>{mode}</strong>
          {isSystemMode ? ' (following system)' : ''}
        </p>
      </header>

      {/* Palette selector — exercises setTheme + live re-theming */}
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
                  backgroundColor: active ? 'var(--color-primary)' : 'var(--color-surface-sunken-deep)',
                  color: active ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
                  border: '1px solid var(--color-border-primary)',
                }}
              >
                {t.label}
              </button>
            )
          })}
        </div>
      </section>

      {/* Mode + system controls — toggleMode / setSystemMode / cycleTheme */}
      <section className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={toggleMode}
          className="rounded-md px-3 py-1.5 text-sm font-medium"
          style={{
            backgroundColor: 'var(--color-surface-sunken-deep)',
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
            backgroundColor: isSystemMode ? 'var(--color-primary)' : 'var(--color-surface-sunken-deep)',
            color: isSystemMode ? 'var(--color-primary-on)' : 'var(--color-text-primary)',
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
            backgroundColor: 'var(--color-surface-sunken-deep)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-primary)',
          }}
        >
          Cycle palette →
        </button>
      </section>

      {/* One elevated surface — eyeball that the active palette resolves, reads in
          both modes, and applies without a flash. */}
      <section
        className="rounded-lg p-5"
        style={{
          backgroundColor: 'var(--color-surface-raised)',
          border: '1px solid var(--color-border-primary)',
          boxShadow: '0 4px 12px var(--color-shadow-md)',
        }}
      >
        <h3 style={{ color: 'var(--color-text-heading)' }} className="text-lg font-semibold">
          Sample card on surface-raised
        </h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Body text in <span style={{ color: 'var(--color-text-primary)' }}>primary</span>,{' '}
          <span style={{ color: 'var(--color-text-secondary)' }}>secondary</span>, and{' '}
          <span style={{ color: 'var(--color-text-muted)' }}>muted</span> tones, plus a{' '}
          <a href="#smoke-test" className="link">
            themed link
          </a>
          .
        </p>
      </section>
    </main>
  )
}
