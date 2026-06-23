import type { ReactNode } from 'react'
import * as RadixPopover from '@radix-ui/react-popover'
import { cn } from './cn'

/** Side of the trigger the panel opens toward. */
export type PopoverSide = 'top' | 'right' | 'bottom' | 'left'
/** Alignment of the panel along the trigger's edge. */
export type PopoverAlign = 'start' | 'center' | 'end'

export interface PopoverProps {
  /** The clickable anchor — wrapped in the Radix trigger (`asChild`). */
  trigger: ReactNode
  /** Panel content. */
  children: ReactNode
  /** Controlled open state. */
  open?: boolean
  /** Open-state change handler (trigger / Esc / outside-click call this). */
  onOpenChange?: (open: boolean) => void
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean
  /** Alignment along the trigger edge. Defaults to `center`. */
  align?: PopoverAlign
  /** Side the panel opens toward. Defaults to `bottom`. */
  side?: PopoverSide
  /** Gap (px) between the trigger and the panel. Defaults to `8`. */
  sideOffset?: number
  /** Extra classes on the panel content, merged via `cn()`. */
  className?: string
}

/**
 * A simple, opinionated popover on Radix Popover — a floating panel anchored to a
 * trigger, with focus management, outside-click / Esc close, and a portal. Pass the
 * anchor as `trigger` and the panel body as `children`; works controlled (`open` /
 * `onOpenChange`) or uncontrolled (`defaultOpen`). Styled with the theme tokens.
 *
 * ```tsx
 * <Popover trigger={<Button>Options</Button>}>
 *   <p>Anything goes in the panel.</p>
 * </Popover>
 *
 * <Popover open={open} onOpenChange={setOpen} side="right" align="start"
 *   trigger={<Button>Filters</Button>}>
 *   …
 * </Popover>
 * ```
 */
export function Popover({
  trigger,
  children,
  open,
  onOpenChange,
  defaultOpen,
  align = 'center',
  side = 'bottom',
  sideOffset = 8,
  className,
}: PopoverProps) {
  return (
    <RadixPopover.Root open={open} onOpenChange={onOpenChange} defaultOpen={defaultOpen}>
      <RadixPopover.Trigger asChild>{trigger}</RadixPopover.Trigger>
      <RadixPopover.Portal>
        <RadixPopover.Content
          className={cn('mrs-popover', className)}
          align={align}
          side={side}
          sideOffset={sideOffset}
        >
          {children}
        </RadixPopover.Content>
      </RadixPopover.Portal>
    </RadixPopover.Root>
  )
}
