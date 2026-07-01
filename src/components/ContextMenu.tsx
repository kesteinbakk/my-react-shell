import {
  cloneElement,
  isValidElement,
  useState,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
} from 'react'
import { DropdownMenu, type DropdownMenuItem } from './DropdownMenu'

interface ContextMenuBaseProps {
  /** Optional non-interactive heading rendered above the items. */
  title?: ReactNode
  /** The menu rows, in order — same union `DropdownMenu` accepts (item · separator ·
   *  label · checkbox · radio-group · submenu), so dividers and hover/select behavior
   *  come for free. */
  items: DropdownMenuItem[]
  /** Extra classes on the menu content, merged via `cn()`. */
  className?: string
}

/**
 * Wrapping mode — the common case. `children` is a single element; the kit clones it
 * to add the `onContextMenu` handler that captures the pointer position, suppresses
 * the browser's native menu, and opens at the cursor.
 */
interface ContextMenuWrapProps extends ContextMenuBaseProps {
  /** The element that receives the right-click handler. Must accept `onContextMenu`
   *  (any DOM element or a component that forwards it). */
  children: ReactElement
  /** Suppress opening — the wrapped element's native context menu behaves normally. */
  disabled?: boolean
  open?: undefined
  position?: undefined
  onOpenChange?: undefined
}

/**
 * Controlled mode — for triggers that aren't a single DOM node (e.g. one shape among
 * many in an SVG/canvas chart, a virtualized row). The caller owns capturing the
 * pointer position and open state (typically from its own `onContextMenu` handler)
 * and renders no `children`; the kit only renders the floating menu at `position`.
 */
interface ContextMenuControlledProps extends ContextMenuBaseProps {
  children?: undefined
  disabled?: undefined
  /** Controlled open state. */
  open: boolean
  /** Viewport coordinates (`event.clientX/clientY`) to anchor the menu at. */
  position: { x: number; y: number }
  /** Fires when the menu should close (outside click, Esc, item chosen). */
  onOpenChange: (open: boolean) => void
}

export type ContextMenuProps = ContextMenuWrapProps | ContextMenuControlledProps

function menuItems(title: ReactNode | undefined, items: DropdownMenuItem[]): DropdownMenuItem[] {
  return title != null ? [{ type: 'label', label: title }, ...items] : items
}

/**
 * A real cursor-anchored right-click menu, built on `DropdownMenu` — same items
 * union (action rows, separators, an optional label, checkboxes, radio groups,
 * submenus), same hover/keyboard/select behavior and theme styling. Suppresses the
 * browser's native context menu and opens exactly at the pointer.
 *
 * Wrapping mode (the common case) — wrap the trigger element; the kit handles
 * capturing the pointer position and open state:
 *
 * ```tsx
 * <ContextMenu title={t('actions')} items={[
 *   { label: t('rename'), onSelect: rename },
 *   { type: 'separator' },
 *   { label: t('delete'), danger: true, onSelect: remove },
 * ]}>
 *   <div className="card">…</div>
 * </ContextMenu>
 * ```
 *
 * Controlled mode — for a trigger that isn't one DOM node (e.g. a slice in an SVG
 * chart): omit `children`, capture `event.clientX/clientY` in your own
 * `onContextMenu` handler, and drive `open` / `position` / `onOpenChange` yourself:
 *
 * ```tsx
 * <ContextMenu
 *   open={menuNode != null}
 *   position={menuPos}
 *   onOpenChange={(open) => { if (!open) setMenuNode(null) }}
 *   items={itemsFor(menuNode)}
 * />
 * ```
 */
export function ContextMenu(props: ContextMenuProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)
  const [uncontrolledPosition, setUncontrolledPosition] = useState({ x: 0, y: 0 })

  const isControlled = props.open !== undefined

  const open = isControlled ? props.open : uncontrolledOpen
  const position = isControlled ? props.position : uncontrolledPosition
  const onOpenChange = (next: boolean) => {
    if (isControlled) {
      props.onOpenChange(next)
    } else {
      setUncontrolledOpen(next)
    }
  }

  const menu = open ? (
    <DropdownMenu
      open
      onOpenChange={onOpenChange}
      align="start"
      className={props.className}
      trigger={
        <span
          aria-hidden
          style={{ position: 'fixed', left: position.x, top: position.y, width: 0, height: 0 }}
        />
      }
      items={menuItems(props.title, props.items)}
    />
  ) : null

  if (isControlled) {
    return menu
  }

  const { children, disabled } = props
  const child = isValidElement<{ onContextMenu?: (e: MouseEvent) => void }>(children)
    ? children
    : null

  if (!child) return children

  return (
    <>
      {cloneElement(child, {
        onContextMenu: (e: MouseEvent) => {
          child.props.onContextMenu?.(e)
          if (disabled) return
          e.preventDefault()
          setUncontrolledPosition({ x: e.clientX, y: e.clientY })
          setUncontrolledOpen(true)
        },
      })}
      {menu}
    </>
  )
}
