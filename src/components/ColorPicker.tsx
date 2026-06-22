import { useState } from 'react'
import type { ReactNode } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { HexColorPicker, HexColorInput } from 'react-colorful'
import { SegmentedControl } from './SegmentedControl'
import { cn } from './cn'

/**
 * The built-in theme accent vocabulary — the swatch set offered by the Theme tab
 * unless the consumer passes its own `swatches`. These are exactly the accent tokens
 * the shared `themes` contract guarantees in **every** palette, so each one always
 * resolves; each name maps to `--color-accent-<name>` (shipped by
 * `my-react-shell/styles.css`), keeping a pick theme-adaptive — it tracks light/dark
 * and the active palette. A palette that defines further accents (or a consumer with
 * its own) can pass a wider `swatches` list.
 */
export const ACCENT_SWATCHES = ['rose', 'amber', 'emerald', 'sky', 'violet'] as const

type ColorPickerMode = 'swatch' | 'custom'

export interface ColorPickerProps {
  /**
   * Selected color as a directly-usable CSS color string — either a theme swatch
   * reference `var(--color-accent-<name>)` (theme-adaptive) or a custom `#rrggbb`
   * hex. Drop it straight into a `style`/`background`. Omit for "nothing picked yet".
   */
  value?: string
  /** Emits the new CSS color string (a swatch `var(...)` or a `#rrggbb` hex). */
  onChange: (value: string) => void
  /**
   * Accent swatch names offered in the Theme tab. Defaults to {@link ACCENT_SWATCHES};
   * each renders as `var(--color-accent-<name>)`. Pass `[]` to hide the Theme tab
   * (custom-only).
   */
  swatches?: readonly string[]
  /** Show the full-range (custom hex) tab. Default `true`. Set `false` for swatch-only. */
  allowCustom?: boolean
  /** Field label above the trigger. */
  label?: ReactNode
  /** Helper text below the label. */
  description?: ReactNode
  /** Popover alignment relative to the trigger. Default `start`. */
  align?: 'start' | 'center' | 'end'
  /** Trigger text when nothing is selected. Default `'Pick a color'`. */
  placeholder?: string
  disabled?: boolean
  /** Accessible label for the trigger (falls back to `label` when a string). */
  'aria-label'?: string
  /** Tab labels (English defaults; pass translated strings via your `t()`). */
  swatchesLabel?: ReactNode
  customLabel?: ReactNode
  className?: string
}

const caretGlyph = (
  <svg
    width={14}
    height={14}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const swatchVar = (name: string) => `var(--color-accent-${name})`

/** The swatch name whose `var(...)` equals `value`, or `null` when `value` is custom/absent. */
function matchSwatch(value: string | undefined, swatches: readonly string[]): string | null {
  if (!value) return null
  const normalized = value.replace(/\s+/g, '')
  for (const name of swatches) {
    if (normalized === swatchVar(name).replace(/\s+/g, '')) return name
  }
  return null
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/**
 * Resolve any CSS color (`var(...)`, named, `oklch`, `hsl`, `rgb`, or a hex) to a
 * `#rrggbb` hex, so the full-range picker can be seeded from the current value.
 * A hidden probe resolves the cascade (so `var(--color-accent-*)` becomes concrete),
 * then a canvas normalizes the concrete color to hex. SPA-only (no SSR), so `document`
 * is always present; falls back when resolution isn't possible.
 */
function resolveToHex(input: string | undefined, fallback: string): string {
  const raw = (input ?? '').trim()
  if (!raw) return fallback
  if (typeof document === 'undefined') return fallback

  // 1) Resolve var()/named/relative colors to a concrete computed color.
  let concrete = raw
  if (raw.includes('var(') || !/^(#|rgb)/i.test(raw)) {
    const probe = document.createElement('span')
    probe.style.color = raw
    probe.style.position = 'absolute'
    probe.style.opacity = '0'
    probe.style.pointerEvents = 'none'
    document.body.appendChild(probe)
    concrete = getComputedStyle(probe).color || raw
    probe.remove()
  }

  // 2) Normalize the concrete color to #rrggbb via a canvas.
  const ctx = document.createElement('canvas').getContext('2d')
  if (!ctx) return fallback
  ctx.fillStyle = fallback
  try {
    ctx.fillStyle = concrete
  } catch {
    return fallback
  }
  const out = ctx.fillStyle
  return /^#[0-9a-f]{6}$/i.test(out) ? out.toLowerCase() : fallback
}

/**
 * <ColorPicker> — a compact, controlled color picker with two modes behind a popover
 * trigger: **Theme** (pick a theme accent swatch — semantic, theme-adaptive) and
 * **Custom** (a full hue/saturation range + hex input, via `react-colorful`).
 *
 * Controlled via `value` / `onChange`; `value` is always a directly-usable CSS color
 * string (`var(--color-accent-<name>)` for a swatch, `#rrggbb` for custom). Persists
 * nothing itself. The full-range tab uses the `react-colorful` optional peer — install
 * it when you use this component (swatch styling and the popover stay shell-owned).
 */
export function ColorPicker({
  value,
  onChange,
  swatches = ACCENT_SWATCHES,
  allowCustom = true,
  label,
  description,
  align = 'start',
  placeholder = 'Pick a color',
  disabled,
  swatchesLabel = 'Theme',
  customLabel = 'Custom',
  className,
  ...rest
}: ColorPickerProps) {
  const showSwatches = swatches.length > 0
  const showCustom = allowCustom
  const showToggle = showSwatches && showCustom

  const activeSwatch = matchSwatch(value, swatches)
  const ariaLabel = rest['aria-label'] ?? (typeof label === 'string' ? label : undefined)

  const seedFallback = () =>
    resolveToHex(showSwatches ? swatchVar(swatches[0]) : undefined, '#888888')

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<ColorPickerMode>(showSwatches ? 'swatch' : 'custom')
  const [customHex, setCustomHex] = useState<string>(() => resolveToHex(value, seedFallback()))

  const handleOpenChange = (next: boolean) => {
    if (next) {
      // Re-derive the active tab + the full-range seed each time it opens, so both
      // reflect the latest value and theme.
      const startCustom = showCustom && (!showSwatches || (!activeSwatch && value != null))
      setMode(startCustom ? 'custom' : showSwatches ? 'swatch' : 'custom')
      setCustomHex(resolveToHex(value, seedFallback()))
    }
    setOpen(next)
  }

  const pickSwatch = (name: string) => onChange(swatchVar(name))

  const pickCustom = (hex: string) => {
    setCustomHex(hex)
    onChange(hex)
  }

  const triggerText = activeSwatch ? capitalize(activeSwatch) : (value ?? placeholder)

  return (
    <div className={cn('mrs-color-picker', className)}>
      {label != null && <span className="mrs-color-picker__label">{label}</span>}
      {description != null && <p className="mrs-color-picker__desc">{description}</p>}

      <Popover.Root open={open} onOpenChange={handleOpenChange}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="mrs-color-picker__trigger"
            disabled={disabled}
            aria-label={ariaLabel}
          >
            <span
              className="mrs-color-picker__preview"
              data-empty={value == null || value === ''}
              style={value ? { background: value } : undefined}
              aria-hidden="true"
            />
            <span className="mrs-color-picker__value" data-placeholder={value == null}>
              {triggerText}
            </span>
            <span className="mrs-color-picker__caret">{caretGlyph}</span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            className="mrs-color-picker__panel"
            sideOffset={6}
            align={align}
          >
            {showToggle && (
              <SegmentedControl
                size="sm"
                aria-label="Color mode"
                value={mode}
                onChange={setMode}
                className="mrs-color-picker__tabs"
                options={[
                  { value: 'swatch', label: swatchesLabel },
                  { value: 'custom', label: customLabel },
                ]}
              />
            )}

            {mode === 'swatch' && showSwatches && (
              <div
                className="mrs-color-picker__swatches"
                role="radiogroup"
                aria-label={typeof swatchesLabel === 'string' ? swatchesLabel : 'Theme colors'}
              >
                {swatches.map((name) => {
                  const selected = activeSwatch === name
                  return (
                    <button
                      key={name}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={name}
                      title={name}
                      className={cn(
                        'mrs-color-picker__chip',
                        selected && 'mrs-color-picker__chip--selected',
                      )}
                      style={{ background: swatchVar(name) }}
                      onClick={() => pickSwatch(name)}
                    />
                  )
                })}
              </div>
            )}

            {mode === 'custom' && showCustom && (
              <div className="mrs-color-picker__custom">
                <HexColorPicker color={customHex} onChange={pickCustom} />
                <label className="mrs-color-picker__hex">
                  <span className="mrs-color-picker__hex-hash" aria-hidden="true">
                    #
                  </span>
                  <HexColorInput
                    color={customHex}
                    onChange={pickCustom}
                    className="mrs-color-picker__hex-input"
                    aria-label="Hex color"
                  />
                </label>
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
