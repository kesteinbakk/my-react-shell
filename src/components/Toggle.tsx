import type { ReactNode } from 'react'
import * as RadixToggle from '@radix-ui/react-toggle'
import { cn } from './cn'

/** Structural style: `ghost` is fill-on-press, `outline` keeps a bordered box. */
export type ToggleVariant = 'ghost' | 'outline'
export type ToggleSize = 'sm' | 'md' | 'lg'

export interface ToggleProps {
  /** Pressed state (controlled). */
  pressed?: boolean
  /** Initial pressed state when uncontrolled. */
  defaultPressed?: boolean
  /** Fired when the pressed state changes. */
  onPressedChange?: (pressed: boolean) => void
  /** Structural style. Defaults to `ghost`. */
  variant?: ToggleVariant
  /** Control size. Defaults to `md`. */
  size?: ToggleSize
  disabled?: boolean
  /** Button contents — typically an icon glyph. */
  children?: ReactNode
  /** Accessible label — required when the contents are icon-only. */
  'aria-label'?: string
  className?: string
}

/**
 * Un-opinionated two-state button on Radix Toggle — a single control that flips between
 * pressed and unpressed, themed against the tokens. The pressed state fills with
 * `--color-primary-bg`; `variant` chooses fill-only (`ghost`) or bordered (`outline`).
 * Controlled via `pressed` / `onPressedChange`, or uncontrolled via `defaultPressed`.
 *
 * ```tsx
 * <Toggle pressed={bold} onPressedChange={setBold} aria-label="Bold"><BoldIcon /></Toggle>
 * ```
 */
export function Toggle({
  pressed,
  defaultPressed,
  onPressedChange,
  variant = 'ghost',
  size = 'md',
  disabled,
  children,
  className,
  ...rest
}: ToggleProps) {
  return (
    <RadixToggle.Root
      pressed={pressed}
      defaultPressed={defaultPressed}
      onPressedChange={onPressedChange}
      disabled={disabled}
      aria-label={rest['aria-label']}
      className={cn('mrs-toggle', `mrs-toggle--${variant}`, `mrs-toggle--${size}`, className)}
    >
      {children}
    </RadixToggle.Root>
  )
}
