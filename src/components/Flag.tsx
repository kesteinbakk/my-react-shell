import { cn } from './cn'
import { localeMetaFor } from '../i18n/localeMeta'

export interface FlagProps {
  /** Locale code whose flag to render (e.g. `'nb-NO'`). */
  code: string
  /** Extra classes on the flag box. Defaults to a 3:2 chip. */
  className?: string
}

/**
 * Renders a locale's vendored flag SVG, scaled to fill its box (3:2). The markup is
 * trusted, vendored art from `localeMeta` (no runtime dependency, no user input), so
 * it's injected via `dangerouslySetInnerHTML`. Renders nothing for a locale the shell
 * ships no flag for. Decorative — always paired with the locale's visible name.
 */
export function Flag({ code, className }: FlagProps) {
  const svg = localeMetaFor(code)?.flagSvg
  if (svg === undefined) return null
  return (
    <span
      className={cn('mrs-flag', className)}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
