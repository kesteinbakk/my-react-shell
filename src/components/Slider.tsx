import { type CSSProperties } from 'react'
import * as RadixSlider from '@radix-ui/react-slider'
import { type Tone, TONE_COLOR } from './tone'
import { cn } from './cn'

export interface SliderProps {
  /** Selected value(s) (controlled). One number = a single thumb; two = a range. */
  value?: number[]
  /** Initial value(s) when uncontrolled. */
  defaultValue?: number[]
  /** Fired continuously as the value changes. */
  onValueChange?: (value: number[]) => void
  /** Fired once when the user finishes dragging / keying. */
  onValueCommit?: (value: number[]) => void
  /** Minimum value. Defaults to `0`. */
  min?: number
  /** Maximum value. Defaults to `100`. */
  max?: number
  /** Step increment. Defaults to `1`. */
  step?: number
  /** Minimum distance between thumbs in a range. */
  minStepsBetweenThumbs?: number
  /** Track / range fill colour. Defaults to `primary`. */
  tone?: Tone
  /** Layout orientation. Defaults to `horizontal`. */
  orientation?: 'horizontal' | 'vertical'
  disabled?: boolean
  /** Form field name (one input per thumb is submitted). */
  name?: string
  /** Accessible label applied to every thumb. */
  'aria-label'?: string
  className?: string
  style?: CSSProperties
}

/**
 * Un-opinionated range slider on Radix Slider — a track with one or more draggable
 * thumbs, keyboard- and form-aware. Pass a one-element `value` for a single thumb or a
 * two-element `value` for a range; the filled portion and thumbs paint with `tone`
 * (default `primary`). Controlled via `value` / `onValueChange`, or uncontrolled via
 * `defaultValue`.
 *
 * ```tsx
 * <Slider value={[volume]} onValueChange={([v]) => setVolume(v)} aria-label="Volume" />
 * <Slider value={range} onValueChange={setRange} min={0} max={1000} step={10} />
 * ```
 */
export function Slider({
  value,
  defaultValue,
  onValueChange,
  onValueCommit,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenThumbs,
  tone = 'primary',
  orientation = 'horizontal',
  disabled,
  name,
  className,
  style,
  ...rest
}: SliderProps) {
  // One thumb per value entry; default to a single thumb when neither is given.
  const thumbs = value ?? defaultValue ?? [min]
  return (
    <RadixSlider.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      onValueCommit={onValueCommit}
      min={min}
      max={max}
      step={step}
      minStepsBetweenThumbs={minStepsBetweenThumbs}
      orientation={orientation}
      disabled={disabled}
      name={name}
      className={cn('mrs-slider', className)}
      style={{ ...style, ['--mrs-slider-tone' as string]: TONE_COLOR[tone] }}
    >
      <RadixSlider.Track className="mrs-slider__track">
        <RadixSlider.Range className="mrs-slider__range" />
      </RadixSlider.Track>
      {thumbs.map((_, i) => (
        <RadixSlider.Thumb key={i} className="mrs-slider__thumb" aria-label={rest['aria-label']} />
      ))}
    </RadixSlider.Root>
  )
}
