import type { ReactNode } from 'react'
import * as RadixMenu from '@radix-ui/react-dropdown-menu'
import { cn } from './cn'
import type { PopoverAlign, PopoverSide } from './Popover'

/**
 * One entry in a `DropdownMenu` — a discriminated union over `type`:
 *
 * - `item` (the default): a selectable row with `label`, optional leading `icon`,
 *   an `onSelect` handler, and `disabled` / `danger` flags.
 * - `separator`: a divider line.
 * - `label`: a non-interactive section heading.
 */
export type DropdownMenuItem =
  | {
      type?: 'item'
      /** Row text + accessible name. */
      label: ReactNode
      /** Optional leading glyph (icon / emoji). */
      icon?: ReactNode
      /** Invoked when the item is chosen. */
      onSelect: () => void
      disabled?: boolean
      /** Destructive styling (a delete, etc.). */
      danger?: boolean
    }
  | { type: 'separator' }
  | { type: 'label'; label: ReactNode }

export interface DropdownMenuProps {
  /** The clickable anchor — wrapped in the Radix trigger (`asChild`). */
  trigger: ReactNode
  /** The menu rows, in order. */
  items: DropdownMenuItem[]
  /** Alignment along the trigger edge. Defaults to `center`. */
  align?: PopoverAlign
  /** Side the menu opens toward. Defaults to `bottom`. */
  side?: PopoverSide
  /** Gap (px) between the trigger and the menu. Defaults to `8`. */
  sideOffset?: number
  /** Extra classes on the menu content, merged via `cn()`. */
  className?: string
}

/**
 * A data-driven dropdown menu on Radix DropdownMenu — pass an anchor as `trigger`
 * and the rows as `items` (a discriminated union of `item` · `separator` · `label`).
 * Handles keyboard navigation, focus management, outside-click / Esc close, and a
 * portal. Styled with the theme tokens.
 *
 * ```tsx
 * <DropdownMenu
 *   trigger={<Button>Actions</Button>}
 *   items={[
 *     { label: 'Edit', icon: <PencilIcon />, onSelect: edit },
 *     { type: 'separator' },
 *     { label: 'Delete', danger: true, onSelect: remove },
 *   ]}
 * />
 * ```
 */
export function DropdownMenu({
  trigger,
  items,
  align = 'center',
  side = 'bottom',
  sideOffset = 8,
  className,
}: DropdownMenuProps) {
  return (
    <RadixMenu.Root>
      <RadixMenu.Trigger asChild>{trigger}</RadixMenu.Trigger>
      <RadixMenu.Portal>
        <RadixMenu.Content
          className={cn('mrs-menu', className)}
          align={align}
          side={side}
          sideOffset={sideOffset}
        >
          {items.map((item, i) => {
            if (item.type === 'separator') {
              return <RadixMenu.Separator key={i} className="mrs-menu__separator" />
            }
            if (item.type === 'label') {
              return (
                <RadixMenu.Label key={i} className="mrs-menu__label">
                  {item.label}
                </RadixMenu.Label>
              )
            }
            return (
              <RadixMenu.Item
                key={i}
                className={cn('mrs-menu__item', item.danger && 'mrs-menu__item--danger')}
                disabled={item.disabled}
                onSelect={() => item.onSelect()}
              >
                {item.icon != null ? (
                  <span className="mrs-menu__icon">{item.icon}</span>
                ) : null}
                <span>{item.label}</span>
              </RadixMenu.Item>
            )
          })}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  )
}
