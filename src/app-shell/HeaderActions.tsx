/**
 * HeaderActions — the shell-owned chrome action row (AppHeader banner + AppMenu
 * sidebar footer).
 *
 * ONE trigger primitive, ONE box model. A consumer describes each action as data —
 * a clean registry icon key + label + intent (onClick / menu items / popover panel)
 * — and the shell renders every one through the same `HeaderActionButton`. There is
 * no way to pass a raw button, a wrapper, or a size: uniformity is enforced by the
 * `HeaderAction` type, not by convention. The rare irreducible case (an overlay the
 * declarative shapes can't express — e.g. the `UserPreferences` dialog) uses the
 * `custom` escape hatch, which HANDS the consumer the same uniform trigger to wrap,
 * so even bespoke overlays keep the identical chrome.
 *
 * Empty-safe: an action whose glyph resolves to nothing is skipped, and because the
 * shell owns rendering there is no wrapper element left behind to distort spacing.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { forwardRef } from 'react'
import { DropdownMenu, Popover, CountPill, ICON_BUTTON_GLYPH_PX } from '../components'
import { useShellContextOptional } from './shellContext'
import type {
  HeaderAction,
  HeaderActionTriggerProps,
  ShellIcon,
} from './shellContract'

type TriggerAllProps = HeaderActionTriggerProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'type'>

/**
 * The single header-action trigger chrome. Exported so the `custom` escape hatch can
 * wire it into a bespoke overlay (as a Radix `asChild` trigger — it forwards its ref).
 * Everything in the `actions` row is this one button; that is what guarantees a uniform
 * box model. `icon` is a registry key (resolved via `config.renderIcon`) or a
 * pre-resolved node.
 */
export const HeaderActionButton = forwardRef<HTMLButtonElement, TriggerAllProps>(
  function HeaderActionButton(
    { icon, label, active, tone = 'neutral', badge, hint, size = 'md', className, ...rest },
    ref,
  ) {
    const shell = useShellContextOptional()
    const glyph: ReactNode =
      typeof icon === 'string'
        ? shell?.config.renderIcon(icon as ShellIcon, ICON_BUTTON_GLYPH_PX[size]) ?? null
        : (icon ?? null)
    const showBadge = typeof badge === 'number' && badge > 0
    return (
      <button
        ref={ref}
        type="button"
        className={className ? `mrs-header-action ${className}` : 'mrs-header-action'}
        data-tone={tone}
        data-size={size}
        aria-label={label}
        aria-pressed={active}
        title={hint ?? label}
        {...rest}
      >
        <span className="mrs-header-action__glyph" aria-hidden="true">
          {glyph}
        </span>
        {showBadge ? (
          <CountPill className="mrs-header-action__badge" count={badge} tone="danger" />
        ) : null}
      </button>
    )
  },
)

/** Build the uniform trigger — handed to the `custom` escape hatch. */
function renderTrigger(props: HeaderActionTriggerProps): ReactNode {
  return <HeaderActionButton {...props} />
}

/**
 * Render one chrome action to its shell-owned element. Returns `null` for an empty
 * action (a `custom` thunk that renders nothing, or a menu with no items) so no stray
 * wrapper survives.
 */
function renderHeaderAction(action: HeaderAction, key: string): ReactNode {
  if ('custom' in action && action.custom) {
    const node = action.custom(renderTrigger)
    return node == null ? null : <span key={key}>{node}</span>
  }

  if ('items' in action && action.items) {
    if (action.items.length === 0) return null
    return (
      <DropdownMenu
        key={key}
        align={action.align ?? 'end'}
        trigger={
          <HeaderActionButton
            icon={action.icon}
            label={action.label}
            tone={action.tone}
            badge={action.badge}
          />
        }
        items={action.items}
      />
    )
  }

  if ('panel' in action && action.panel) {
    return (
      <Popover
        key={key}
        align={action.align ?? 'end'}
        trigger={
          <HeaderActionButton
            icon={action.icon}
            label={action.label}
            tone={action.tone}
            badge={action.badge}
          />
        }
      >
        {action.panel()}
      </Popover>
    )
  }

  // Plain / toggle button.
  return (
    <HeaderActionButton
      key={key}
      icon={action.icon}
      label={action.label}
      active={action.active}
      tone={action.tone}
      badge={action.badge}
      hint={action.hint}
      onClick={action.onClick}
    />
  )
}

/**
 * Render the shell's action cluster. Returns the trigger elements only — the caller
 * (AppHeader / AppMenu) supplies the surrounding container so header and sidebar keep
 * their own layout while sharing one action chrome.
 */
export function HeaderActions({ actions }: { actions: HeaderAction[] }): ReactNode {
  return <>{actions.map((action, i) => renderHeaderAction(action, String(i)))}</>
}
