import { cn } from './cn'
import { useShellText } from './useShellText'

export type SpinnerSize = 'sm' | 'md' | 'lg'

export interface SpinnerProps {
  /** Visual size. Defaults to `md`. */
  size?: SpinnerSize
  /** Accessible label. Defaults to the built-in, locale-aware `mrs.state.loading`. */
  label?: string
  className?: string
}

/** Inline loading indicator — a rotating ring on the current text color. */
export function Spinner({ size = 'md', label, className }: SpinnerProps) {
  const st = useShellText()
  return (
    <span
      role="status"
      aria-label={label ?? st('mrs.state.loading')}
      className={cn('mrs-spinner', `mrs-spinner--${size}`, className)}
    />
  )
}

export interface SpinnerBlockProps {
  size?: SpinnerSize
  label?: string
  className?: string
}

/** Full-height centered spinner for a page / route loading state. */
export function PageSpinner({ size = 'lg', label, className }: SpinnerBlockProps) {
  return (
    <div className={cn('mrs-spinner-page', className)}>
      <Spinner size={size} label={label} />
    </div>
  )
}

/** Centered spinner for a content section or card body. */
export function SectionSpinner({ size = 'md', label, className }: SpinnerBlockProps) {
  return (
    <div className={cn('mrs-spinner-section', className)}>
      <Spinner size={size} label={label} />
    </div>
  )
}
