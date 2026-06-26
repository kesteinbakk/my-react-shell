import { useState } from 'react'
import { type ReactNode, type CSSProperties } from 'react'
import * as Popover from '@radix-ui/react-popover'
import {
  HexColorPicker,
  HexColorInput,
  RgbStringColorPicker,
  HslStringColorPicker,
} from 'react-colorful'
import { cn } from './cn'

/** Output format of the free picker — what `onChange` emits and `value` is read as. */
export type ColorFormat = 'hex' | 'rgb' | 'hsl'

export interface ColorPickerProps {
  /**
   * Selected color (controlled). A CSS color string: in free mode it is in `format`
   * (`#rrggbb`, `rgb(…)`, or `hsl(…)`); in constrained mode it is whichever entry of
   * `colors` is selected. Omit for "nothing picked yet".
   */
  value?: string
  /** Emits the new color string (in `format`, or the picked `colors` entry verbatim). */
  onChange: (value: string) => void
  /**
   * Constrain selection to a fixed set of colors, shown as a swatch grid. Each may be
   * **any** CSS color string (hex, `rgb()`, `hsl()`, `var(--token)`, a named color).
   * Omit (or pass `[]`) for a free full-range pick.
   */
  colors?: readonly string[]
  /** Output format of the free picker. Default `'hex'`. Ignored when `colors` is set. */
  format?: ColorFormat
  /** Field label above the trigger. */
  label?: ReactNode
  /** Helper text below the label. */
  description?: ReactNode
  /** Popover alignment relative to the trigger. Default `start`. */
  align?: 'start' | 'center' | 'end'
  /** Trigger text when nothing is selected. Pass a translated string via your i18n seam. */
  placeholder: string
  disabled?: boolean
  /** Accessible label for the trigger (falls back to a string `label`). */
  'aria-label'?: string
  /** Stretch to fill the available container width. Defaults to `false`. */
  fullWidth?: boolean
  className?: string
  style?: CSSProperties
}

/** Neutral starting point for the free picker when no `value` is provided yet. */
const DEFAULT_SEED: Record<ColorFormat, string> = {
  hex: '#808080',
  rgb: 'rgb(128, 128, 128)',
  hsl: 'hsl(0, 0%, 50%)',
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

function FreePicker({
  format,
  color,
  onChange,
}: {
  format: ColorFormat
  color: string
  onChange: (color: string) => void
}) {
  switch (format) {
    case 'rgb':
      return <RgbStringColorPicker color={color} onChange={onChange} />
    case 'hsl':
      return <HslStringColorPicker color={color} onChange={onChange} />
    default:
      return <HexColorPicker color={color} onChange={onChange} />
  }
}

/**
 * <ColorPicker> — a general, controlled color picker behind a compact popover trigger.
 *
 * - **Free** (default): a full hue/saturation range (via `react-colorful`, an optional
 *   peer). `onChange` emits a CSS color string in `format` (`hex` · `rgb` · `hsl`).
 * - **Constrained**: pass a `colors` set and the picker is limited to that set, shown as
 *   a swatch grid; `onChange` emits the picked entry verbatim.
 *
 * Controlled via `value` / `onChange`; persists nothing. `value` is always a
 * directly-usable CSS color string — drop it into a `style`/`background`.
 */
export function ColorPicker({
  value,
  onChange,
  colors,
  format = 'hex',
  label,
  description,
  align = 'start',
  placeholder,
  disabled,
  fullWidth = false,
  className,
  style,
  ...rest
}: ColorPickerProps) {
  const [open, setOpen] = useState(false)

  const constrained = colors != null && colors.length > 0
  const ariaLabel = rest['aria-label'] ?? (typeof label === 'string' ? label : undefined)
  const isEmpty = value == null || value === ''
  const triggerText = isEmpty ? placeholder : value
  // react-colorful needs a concrete color at all times; seed from the value, else neutral.
  const current = value && value !== '' ? value : DEFAULT_SEED[format]

  return (
    <div className={cn('mrs-color-picker', fullWidth && 'mrs-color-picker--full', className)} style={style}>
      {label != null && <span className="mrs-color-picker__label">{label}</span>}
      {description != null && <p className="mrs-color-picker__desc">{description}</p>}

      <Popover.Root open={open} onOpenChange={setOpen}>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="mrs-color-picker__trigger"
            disabled={disabled}
            aria-label={ariaLabel}
          >
            <span
              className="mrs-color-picker__preview"
              data-empty={isEmpty}
              style={isEmpty ? undefined : { background: value }}
              aria-hidden="true"
            />
            <span className="mrs-color-picker__value" data-placeholder={isEmpty}>
              {triggerText}
            </span>
            <span className="mrs-color-picker__caret">{caretGlyph}</span>
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content className="mrs-color-picker__panel" sideOffset={6} align={align}>
            {constrained ? (
              <div
                className="mrs-color-picker__swatches"
                role="radiogroup"
                aria-label={ariaLabel ?? 'Colors'}
              >
                {colors!.map((color, i) => {
                  const selected = !isEmpty && value!.trim() === color.trim()
                  return (
                    <button
                      key={`${i}-${color}`}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      aria-label={color}
                      title={color}
                      className={cn(
                        'mrs-color-picker__chip',
                        selected && 'mrs-color-picker__chip--selected',
                      )}
                      style={{ background: color }}
                      onClick={() => onChange(color)}
                    />
                  )
                })}
              </div>
            ) : (
              <div className="mrs-color-picker__custom">
                <FreePicker format={format} color={current} onChange={onChange} />
                {format === 'hex' ? (
                  <label className="mrs-color-picker__hex">
                    <span className="mrs-color-picker__hex-hash" aria-hidden="true">
                      #
                    </span>
                    <HexColorInput
                      color={current}
                      onChange={onChange}
                      className="mrs-color-picker__hex-input"
                      aria-label="Hex color"
                    />
                  </label>
                ) : (
                  <code className="mrs-color-picker__readout">{current}</code>
                )}
              </div>
            )}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  )
}
