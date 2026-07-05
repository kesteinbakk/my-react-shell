/**
 * Shared viewport breakpoint scale — the shell's four responsive tiers.
 *
 * The single source of truth for every responsive decision the shell makes.
 * `mobile` is the **base** tier (unprefixed, 0px); `pad` / `screen` / `wide` are
 * the three `min-width` thresholds above it. Mobile-first: a rule with no tier
 * applies from `mobile` up, and each named tier layers on above its width.
 *
 * Mirrored by `--mrs-breakpoint-*` in styles/base.css — keep the two in sync.
 *
 * ## Why JS reads this constant, not the CSS var
 * CSS custom properties **cannot** be used inside an `@media` condition
 * (`@media (min-width: var(--x))` is invalid in every browser). So the shell's
 * own hand-written `@media` blocks carry the literal px, and the JS breakpoints
 * (Sheet, AppShell) derive their `matchMedia` strings from `BREAKPOINT_PX` here.
 * Both mirror the same numbers — that lockstep is what keeps a JS breakpoint and
 * its CSS counterpart from ever disagreeing.
 *
 * ## Consumer alignment
 * The shell owns this scale; a consumer aligns its own utilities to it rather
 * than the reverse. In Tailwind v4, delete the defaults and redeclare these four
 * names so `pad:` / `screen:` / `wide:` variants match the shell's chrome:
 *
 * ```css
 * @theme {
 *   --breakpoint-*: initial;   // drop Tailwind's sm/md/lg/xl/2xl
 *   --breakpoint-pad: 768px;
 *   --breakpoint-screen: 1024px;
 *   --breakpoint-wide: 1440px;
 * }
 * ```
 */

/** A responsive tier. `mobile` is the base (0px); the rest are min-width thresholds. */
export type Breakpoint = 'mobile' | 'pad' | 'screen' | 'wide'

/**
 * The tiers that map to an actual `min-width` threshold — everything above the
 * base `mobile` tier. These are the values a `min-width` media query can target.
 */
export type MinWidthBreakpoint = Exclude<Breakpoint, 'mobile'>

/** Min-width (px) at which each tier begins. `mobile` is the base tier (0). */
export const BREAKPOINT_PX: Record<Breakpoint, number> = {
  mobile: 0,
  pad: 768,
  screen: 1024,
  wide: 1440,
}

/** The `(min-width: …px)` media-query string for a threshold tier. */
export function minWidthQuery(name: MinWidthBreakpoint): string {
  return `(min-width: ${BREAKPOINT_PX[name]}px)`
}
