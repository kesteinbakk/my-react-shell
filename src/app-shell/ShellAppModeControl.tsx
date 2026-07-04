/**
 * ShellAppModeControl — the app-mode segmented control the shell renders inline in the
 * header's right cluster, left of the actions (header mode), or in its own section under
 * the sidebar brand (menu mode).
 *
 * A soft read of shell context: renders nothing when there is no shell, no `appMode`
 * block, the app-mode is hidden, or fewer than two modes are available (the "only one
 * choice → don't show" rule). When `selectable` is false it renders a read-only
 * indicator — visible, not interactive. Built on the kit `SegmentedControl`, so it
 * inherits the shipped look. No i18n import: the group's accessible name comes from
 * the consumer's optional `ariaLabel` thunk (config), matching the rest of the
 * app-shell chrome labels.
 */

import type { ReactNode } from 'react'
import { SegmentedControl } from '../components'
import { useShellContextOptional } from './shellContext'

export interface ShellAppModeControlProps {
  /** Placement variant — drives the section's layout class. */
  variant: 'header' | 'menu'
}

export function ShellAppModeControl({ variant }: ShellAppModeControlProps): ReactNode {
  const shell = useShellContextOptional()
  if (shell === null) return null
  const runtime = shell.appMode
  const config = shell.config.appMode

  if (runtime === null || config === undefined) return null
  if (!runtime.visible) return null
  // "Only one choice → don't show" — a single (or zero) available mode has nothing
  // to switch between, so the control is omitted (the value is still readable).
  if (runtime.modes.length < 2) return null

  // Menu mode sits in a narrow sidebar column → stretch full-width at the small
  // size; header mode gets its natural width at the default size.
  const menu = variant === 'menu'
  const iconSize = menu ? 14 : 16

  const renderIcon = shell.config.renderIcon
  const options = runtime.modes.map((mode) => {
    const iconKey = config.icon?.(mode)
    return {
      value: mode,
      label: config.label(mode),
      icon: iconKey ? renderIcon(iconKey, iconSize) : undefined,
      iconPosition: config.iconPosition,
      tone: config.tone?.(mode) ?? undefined,
    }
  })

  return (
    <div
      className={`mrs-shell__app-mode mrs-shell__app-mode--${variant}`}
      data-readonly={!runtime.selectable}
    >
      <SegmentedControl
        options={options}
        value={runtime.appMode}
        onChange={runtime.selectable ? runtime.setAppMode : () => {}}
        aria-label={config.ariaLabel?.()}
        size={menu ? 'sm' : 'md'}
        fullWidth={menu}
      />
    </div>
  )
}
