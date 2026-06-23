import type { ReactNode } from 'react'
import * as RadixMenu from '@radix-ui/react-dropdown-menu'
import { cn } from './cn'
import type { PopoverAlign, PopoverSide } from './Popover'

/** A plain action row — the default entry. Closes the menu when chosen. */
export interface DropdownMenuActionItem {
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

/**
 * A checkbox row — an independent on/off toggle. Fully controlled: the kit renders
 * the indicator from `checked` and calls `onCheckedChange` with the next state. Keeps
 * the menu open by default (so several can be toggled in one opening); set
 * `closeOnSelect` to close on toggle.
 */
export interface DropdownMenuCheckboxItem {
  type: 'checkbox'
  label: ReactNode
  icon?: ReactNode
  /** Controlled checked state. */
  checked: boolean
  /** Receives the next checked state. */
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  /** Close the menu on toggle. Defaults to `false`. */
  closeOnSelect?: boolean
}

/** One option inside a {@link DropdownMenuRadioGroupItem}. */
export interface DropdownMenuRadioOption {
  value: string
  label: ReactNode
  icon?: ReactNode
  disabled?: boolean
}

/**
 * A mutually-exclusive group — exactly one option marked selected. Fully controlled
 * via `value` + `onValueChange`. Keeps the menu open by default; set `closeOnSelect`
 * to close on pick.
 */
export interface DropdownMenuRadioGroupItem {
  type: 'radio-group'
  /** Optional non-interactive heading rendered above the options. */
  label?: ReactNode
  /** Controlled selected value. */
  value: string
  /** Receives the newly-picked value. */
  onValueChange: (value: string) => void
  options: DropdownMenuRadioOption[]
  /** Close the menu on pick. Defaults to `false`. */
  closeOnSelect?: boolean
}

/**
 * A nested submenu — reveals a further menu of items on hover / arrow-right. `items`
 * is the same union, so submenus nest to arbitrary depth.
 */
export interface DropdownMenuSubmenuItem {
  type: 'submenu'
  label: ReactNode
  icon?: ReactNode
  items: DropdownMenuItem[]
  disabled?: boolean
}

/**
 * One entry in a `DropdownMenu` — a discriminated union over `type`:
 *
 * - `item` (the default): a plain action row (`label`, optional `icon`, `onSelect`,
 *   `disabled`/`danger`); closes the menu when chosen.
 * - `separator`: a divider line.
 * - `label`: a non-interactive section heading.
 * - `checkbox`: an independent on/off toggle (controlled `checked` + `onCheckedChange`).
 * - `radio-group`: a one-of-a-group choice (controlled `value` + `onValueChange`).
 * - `submenu`: a nested menu (recursive `items`).
 */
export type DropdownMenuItem =
  | DropdownMenuActionItem
  | { type: 'separator' }
  | { type: 'label'; label: ReactNode }
  | DropdownMenuCheckboxItem
  | DropdownMenuRadioGroupItem
  | DropdownMenuSubmenuItem

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

/** Leading icon slot — keeps labels aligned whether or not an icon is present. */
function MenuIcon({ icon }: { icon?: ReactNode }) {
  return icon != null ? <span className="mrs-menu__icon">{icon}</span> : null
}

/**
 * Render one entry. Extracted so submenu content can recurse through the same union.
 * `keyPrefix` keeps React keys stable across nesting levels.
 */
function renderItem(item: DropdownMenuItem, key: string) {
  if (item.type === 'separator') {
    return <RadixMenu.Separator key={key} className="mrs-menu__separator" />
  }
  if (item.type === 'label') {
    return (
      <RadixMenu.Label key={key} className="mrs-menu__label">
        {item.label}
      </RadixMenu.Label>
    )
  }
  if (item.type === 'checkbox') {
    return (
      <RadixMenu.CheckboxItem
        key={key}
        className="mrs-menu__item mrs-menu__item--selectable"
        checked={item.checked}
        disabled={item.disabled}
        onCheckedChange={item.onCheckedChange}
        onSelect={(e) => {
          if (item.closeOnSelect !== true) e.preventDefault()
        }}
      >
        <span className="mrs-menu__indicator">
          <RadixMenu.ItemIndicator className="mrs-menu__indicator-glyph">✓</RadixMenu.ItemIndicator>
        </span>
        <MenuIcon icon={item.icon} />
        <span className="mrs-menu__label-text">{item.label}</span>
      </RadixMenu.CheckboxItem>
    )
  }
  if (item.type === 'radio-group') {
    return (
      <RadixMenu.RadioGroup key={key} value={item.value} onValueChange={item.onValueChange}>
        {item.label != null ? (
          <RadixMenu.Label className="mrs-menu__label">{item.label}</RadixMenu.Label>
        ) : null}
        {item.options.map((opt, i) => (
          <RadixMenu.RadioItem
            key={`${key}.${opt.value}.${i}`}
            className="mrs-menu__item mrs-menu__item--selectable"
            value={opt.value}
            disabled={opt.disabled}
            onSelect={(e) => {
              if (item.closeOnSelect !== true) e.preventDefault()
            }}
          >
            <span className="mrs-menu__indicator">
              <RadixMenu.ItemIndicator className="mrs-menu__indicator-glyph">●</RadixMenu.ItemIndicator>
            </span>
            <MenuIcon icon={opt.icon} />
            <span className="mrs-menu__label-text">{opt.label}</span>
          </RadixMenu.RadioItem>
        ))}
      </RadixMenu.RadioGroup>
    )
  }
  if (item.type === 'submenu') {
    return (
      <RadixMenu.Sub key={key}>
        <RadixMenu.SubTrigger
          className="mrs-menu__item mrs-menu__sub-trigger"
          disabled={item.disabled}
        >
          <MenuIcon icon={item.icon} />
          <span className="mrs-menu__label-text">{item.label}</span>
          <span className="mrs-menu__sub-chevron" aria-hidden="true">
            ›
          </span>
        </RadixMenu.SubTrigger>
        <RadixMenu.Portal>
          <RadixMenu.SubContent className="mrs-menu" sideOffset={4} alignOffset={-4}>
            {item.items.map((sub, i) => renderItem(sub, `${key}.${i}`))}
          </RadixMenu.SubContent>
        </RadixMenu.Portal>
      </RadixMenu.Sub>
    )
  }
  return (
    <RadixMenu.Item
      key={key}
      className={cn('mrs-menu__item', item.danger && 'mrs-menu__item--danger')}
      disabled={item.disabled}
      onSelect={() => item.onSelect()}
    >
      <MenuIcon icon={item.icon} />
      <span className="mrs-menu__label-text">{item.label}</span>
    </RadixMenu.Item>
  )
}

/**
 * A data-driven dropdown menu on Radix DropdownMenu — pass an anchor as `trigger`
 * and the rows as `items` (a discriminated union of `item` · `separator` · `label` ·
 * `checkbox` · `radio-group` · `submenu`). Handles keyboard navigation, focus
 * management, outside-click / Esc close, and a portal. Styled with the theme tokens.
 *
 * Checkbox and radio rows are controlled (the kit renders the indicator and reports
 * the next state) and keep the menu open by default so several can be toggled in one
 * opening; pass `closeOnSelect` to close. Submenus nest to arbitrary depth.
 *
 * ```tsx
 * <DropdownMenu
 *   trigger={<Button>Actions</Button>}
 *   items={[
 *     { label: 'Edit', icon: <PencilIcon />, onSelect: edit },
 *     { type: 'checkbox', label: 'Show archived', checked: showArchived, onCheckedChange: setShowArchived },
 *     { type: 'radio-group', value: sortBy, onValueChange: setSortBy, options: [
 *       { value: 'name', label: 'Name' },
 *       { value: 'date', label: 'Date' },
 *     ] },
 *     { type: 'submenu', label: 'Switch tenant', items: tenantItems },
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
          {items.map((item, i) => renderItem(item, String(i)))}
        </RadixMenu.Content>
      </RadixMenu.Portal>
    </RadixMenu.Root>
  )
}
