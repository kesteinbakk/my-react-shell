/**
 * ShellPhaseControl — the app-phase segmented control the shell renders in its own
 * section under the app title (header mode) or under the sidebar brand (menu mode).
 *
 * A soft read of shell context: renders nothing when there is no shell, no `phase`
 * block, the phase is hidden, or fewer than two states are available (the "only one
 * choice → don't show" rule). When `selectable` is false it renders a read-only
 * indicator — visible, not interactive. Built on the kit `SegmentedControl`, so it
 * inherits the shipped look. No i18n import: the group's accessible name comes from
 * the consumer's optional `ariaLabel` thunk (config), matching the rest of the
 * app-shell chrome labels.
 */

import type { ReactNode } from 'react'
import { SegmentedControl } from '../components'
import { useShellContextOptional } from './shellContext'

export interface ShellPhaseControlProps {
  /** Placement variant — drives the section's layout class. */
  variant: 'header' | 'menu'
}

export function ShellPhaseControl({ variant }: ShellPhaseControlProps): ReactNode {
  const shell = useShellContextOptional()
  const runtime = shell?.phase ?? null
  const config = shell?.config.phase

  if (runtime === null || config === undefined) return null
  if (!runtime.visible) return null
  // "Only one choice → don't show" — a single (or zero) available state has nothing
  // to switch between, so the control is omitted (the value is still readable).
  if (runtime.states.length < 2) return null

  const options = runtime.states.map((state) => ({
    value: state,
    label: config.label(state),
  }))

  // Menu mode sits in a narrow sidebar column → stretch full-width at the small
  // size; header mode gets its natural width at the default size.
  const menu = variant === 'menu'

  return (
    <div
      className={`mrs-shell__phase mrs-shell__phase--${variant}`}
      data-readonly={!runtime.selectable}
    >
      <SegmentedControl
        options={options}
        value={runtime.phase}
        onChange={runtime.selectable ? runtime.setPhase : () => {}}
        aria-label={config.ariaLabel?.()}
        size={menu ? 'sm' : 'md'}
        fullWidth={menu}
      />
    </div>
  )
}
