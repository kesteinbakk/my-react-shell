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
 *
 * Header mode (`variant="header"`) additionally renders a mobile-only dropdown
 * switcher — a single "current mode ▾" trigger listing every mode, in place of the
 * segmented control, which doesn't have room to breathe in the narrow header row.
 * Both forms are always in the DOM; only visibility toggles, at the shell's one
 * breakpoint (matching the breadcrumb / page-header-actions mobile collapse). Menu
 * mode keeps the segmented control at every width — it already lives in its own
 * full-width sidebar/drawer column, so it isn't cramped the way the header is.
 */

import type { ReactNode } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
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
  const currentOption = options.find((option) => option.value === runtime.appMode)
  const ariaLabel = config.ariaLabel?.()

  return (
    <div
      className={`mrs-shell__app-mode mrs-shell__app-mode--${variant}`}
      data-readonly={!runtime.selectable}
    >
      <div className="mrs-shell__app-mode-segmented">
        <SegmentedControl
          options={options}
          value={runtime.appMode}
          onChange={runtime.selectable ? runtime.setAppMode : () => {}}
          aria-label={ariaLabel}
          size={menu ? 'sm' : 'md'}
          fullWidth={menu}
        />
      </div>

      {/* Header mode only: a mobile-only dropdown switcher, standing in for the
          segmented control where the header row has no room for it. */}
      {!menu && (
        <div className="mrs-shell__app-mode-dropdown">
          {runtime.selectable ? (
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button type="button" className="mrs-shell__app-mode-trigger" aria-label={ariaLabel}>
                  {currentOption?.icon}
                  <span className="mrs-shell__app-mode-trigger-label">{currentOption?.label}</span>
                  {renderIcon('chevronDown', 16)}
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content className="mrs-shell__app-mode-menu" align="end">
                  {options.map((option) => (
                    <DropdownMenu.Item
                      key={option.value}
                      className="mrs-shell__app-mode-menu-item"
                      data-current={option.value === runtime.appMode}
                      onSelect={() => runtime.setAppMode(option.value)}
                    >
                      {option.icon}
                      {option.label}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          ) : (
            <span className="mrs-shell__app-mode-trigger mrs-shell__app-mode-trigger--static">
              {currentOption?.icon}
              <span className="mrs-shell__app-mode-trigger-label">{currentOption?.label}</span>
            </span>
          )}
        </div>
      )}
    </div>
  )
}
