import { useEffect, useRef } from 'react';
/**
 * Is an *interactive, dismissable* Radix popper currently mounted? Select listboxes,
 * dropdown/context menus, and popovers lock outside pointer events (that lock is what causes
 * the surface teardown this hook prevents). A Tooltip is also a popper but is **passive** —
 * it doesn't lock pointer events and the user isn't clicking to dismiss it — so it must NOT
 * count, or a backdrop click that happens while a tooltip shows would be wrongly suppressed.
 * We treat a popper wrapper as interactive when it does not contain tooltip content.
 */
function hasInteractivePopperOpen() {
    if (typeof document === 'undefined')
        return false;
    const wrappers = document.querySelectorAll('[data-radix-popper-content-wrapper]');
    for (const w of wrappers) {
        if (!w.querySelector('[role="tooltip"]'))
            return true;
    }
    return false;
}
/**
 * Did this outside-interaction come from focus *falling out to the document root* rather than
 * a real user gesture on this surface?
 *
 * Radix routes both pointer- and focus-outside through `onInteractOutside` as a `CustomEvent`
 * whose `detail.originalEvent` is the underlying DOM event (see @radix-ui/react-dismissable-layer
 * `useFocusOutside` → it dispatches on a `focusin`). When a **nested Radix Dialog** is dismissed
 * by its own ✕, Radix unmounts the inner content and the browser drops focus to `<body>`. That
 * `focusin` on `<body>` is *outside* the still-open parent surface, so the parent's
 * `onInteractOutside` fires and — ungated — the parent dismisses itself (tearing down whatever
 * it was hosting). The nested Dialog is a `[role="dialog"]`, a different Radix primitive than the
 * poppers above, so the popper check never sees it.
 *
 * The pointer-events lock that shields the parent from a nested layer's *pointer* interactions
 * (why the ✕ breaks but a backdrop click doesn't) does not apply to this focus path — so we
 * detect it directly: a focus event whose target is the document `<body>`/`<html>` (or nothing)
 * means the previously-focused element was torn away, the signature of a nested layer collapsing
 * and dropping focus, never the user intentionally dismissing this surface. Gating only *this*
 * exact shape leaves every pointer/backdrop path untouched — so a nested Dialog's own backdrop
 * dismissal, and this surface's genuine backdrop dismissal, both still work.
 */
function focusFellOutToRoot(event) {
    if (typeof document === 'undefined')
        return false;
    const original = event.detail?.originalEvent;
    const isFocusEvent = original != null &&
        (original.type === 'focusin' ||
            (typeof FocusEvent !== 'undefined' && original instanceof FocusEvent));
    if (!isFocusEvent)
        return false;
    const target = original.target;
    return target == null || target === document.body || target === document.documentElement;
}
/**
 * Guards a Radix-Dialog-based surface (Dialog, Sheet, ConfirmDialog) against a nested layer —
 * a Radix popper (Select, DropdownMenu, Popover, Combobox, …) **or a nested Radix Dialog** —
 * tearing down the whole surface when that nested layer is dismissed.
 *
 * Two failure modes, both prevented here:
 *
 * 1. **Nested popper.** When a popper is open inside the surface, Radix forces the surface
 *    content to `pointer-events: none` so the popper owns the layer. A click anywhere inside
 *    the surface but outside the popper then lands outside the content. Radix closes the popper
 *    on that pointerdown and then re-evaluates the *same gesture* as an outside interaction for
 *    the surface — firing `onPointerDownOutside` → `onDismiss` and tearing the surface down
 *    (losing the user's in-progress edits). Because that dismissal fires *after* the popper has
 *    already closed, a "is a popper open right now?" check is too late. So we judge the gesture
 *    by its *start*: a document-level capture listener (active only while the surface is open)
 *    records whether a popper was mounted at pointerdown time. If it was, the in-flight outside
 *    interaction is the user dismissing the *popper*, never the surface. The flag is refreshed on
 *    every pointerdown, so the next genuine backdrop click (no popper open) dismisses normally.
 *
 * 2. **Nested Dialog (focus-teardown).** A stacked Radix Dialog is a `[role="dialog"]`, not a
 *    popper, so (1)'s pointer check never sees it — and its ✕ dismisses via a *focus* path the
 *    pointer-events lock doesn't gate. When the inner content unmounts, focus drops to `<body>`
 *    and the parent's `onInteractOutside` fires. We recognise that shape directly via
 *    `focusFellOutToRoot` and suppress it. See that helper for why gating only the
 *    focus-to-root case leaves all pointer/backdrop dismissals (including the inner Dialog's own
 *    backdrop) working.
 *
 * Returns a guard to call first from the surface's `onPointerDownOutside` / `onInteractOutside`
 * handlers: it returns `true` (after calling `preventDefault`) when the interaction is really a
 * nested-layer dismissal and the caller should bail out of its own dismiss logic.
 *
 * @param open Whether the surface is currently open. Pass the controlled `open` so the
 *   listener attaches only while open; for an uncontrolled surface pass `undefined` and the
 *   listener attaches for the surface's whole mounted lifetime (the per-pointerdown cost is
 *   a single `querySelector`). Only an explicit `false` skips attaching.
 */
export function useDialogDismissGuard(open) {
    const pointerStartedWithPopperRef = useRef(false);
    useEffect(() => {
        if (open === false || typeof document === 'undefined')
            return;
        const onPointerDown = () => {
            pointerStartedWithPopperRef.current = hasInteractivePopperOpen();
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [open]);
    return (event) => {
        if (pointerStartedWithPopperRef.current ||
            hasInteractivePopperOpen() ||
            focusFellOutToRoot(event)) {
            event.preventDefault();
            return true;
        }
        return false;
    };
}
