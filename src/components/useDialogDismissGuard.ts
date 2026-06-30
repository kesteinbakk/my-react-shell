import { useEffect, useRef } from 'react'

/**
 * Is an *interactive, dismissable* Radix popper currently mounted? Select listboxes,
 * dropdown/context menus, and popovers lock outside pointer events (that lock is what causes
 * the surface teardown this hook prevents). A Tooltip is also a popper but is **passive** —
 * it doesn't lock pointer events and the user isn't clicking to dismiss it — so it must NOT
 * count, or a backdrop click that happens while a tooltip shows would be wrongly suppressed.
 * We treat a popper wrapper as interactive when it does not contain tooltip content.
 */
function hasInteractivePopperOpen(): boolean {
  if (typeof document === 'undefined') return false
  const wrappers = document.querySelectorAll('[data-radix-popper-content-wrapper]')
  for (const w of wrappers) {
    if (!w.querySelector('[role="tooltip"]')) return true
  }
  return false
}

/**
 * Guards a Radix-Dialog-based surface (Dialog, Sheet, ConfirmDialog) against a nested Radix
 * popper (Select, DropdownMenu, Popover, Combobox, …) tearing down the whole surface.
 *
 * The failure it prevents: when a popper is open inside the surface, Radix forces the
 * surface content to `pointer-events: none` so the popper owns the layer. A click anywhere
 * inside the surface but outside the popper then lands outside the content. Radix closes the
 * popper on that pointerdown and then re-evaluates the *same gesture* as an outside
 * interaction for the surface — firing `onPointerDownOutside` → `onDismiss` and tearing the
 * surface down (losing the user's in-progress edits). Because that dismissal fires *after*
 * the popper has already closed, a "is a popper open right now?" check is too late.
 *
 * So we judge the gesture by its *start*: a document-level capture listener (active only
 * while the surface is open) records whether a popper was mounted at pointerdown time. If it
 * was, the in-flight outside interaction is the user dismissing the *popper*, never the
 * surface. The flag is refreshed on every pointerdown, so the next genuine backdrop click
 * (no popper open) dismisses the surface normally.
 *
 * Returns a guard to call first from the surface's `onPointerDownOutside` / `onInteractOutside`
 * handlers: it returns `true` (after calling `preventDefault`) when the interaction is really
 * a nested-popper dismissal and the caller should bail out of its own dismiss logic.
 *
 * @param open Whether the surface is currently open. Pass the controlled `open` so the
 *   listener attaches only while open; for an uncontrolled surface pass `undefined` and the
 *   listener attaches for the surface's whole mounted lifetime (the per-pointerdown cost is
 *   a single `querySelector`). Only an explicit `false` skips attaching.
 */
export function useDialogDismissGuard(open?: boolean): (event: Event) => boolean {
  const pointerStartedWithPopperRef = useRef(false)

  useEffect(() => {
    if (open === false || typeof document === 'undefined') return
    const onPointerDown = () => {
      pointerStartedWithPopperRef.current = hasInteractivePopperOpen()
    }
    document.addEventListener('pointerdown', onPointerDown, true)
    return () => document.removeEventListener('pointerdown', onPointerDown, true)
  }, [open])

  return (event: Event): boolean => {
    if (pointerStartedWithPopperRef.current || hasInteractivePopperOpen()) {
      event.preventDefault()
      return true
    }
    return false
  }
}
