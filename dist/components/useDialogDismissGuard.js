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
 * Did this outside-interaction land inside a *different* Radix Dialog stacked above this surface?
 *
 * Radix routes pointer- and focus-outside through `onInteractOutside` as a `CustomEvent` whose
 * `detail.originalEvent` is the underlying DOM event. Two sibling shell Dialogs (an inner opened
 * on top of an outer, rendered as React siblings — *not* nested in JSX, so Radix's own branch
 * mechanism never links them) leak into each other: interacting with the **inner** dialog fires
 * the **outer**'s dismissable-layer handlers, because the inner's DOM is outside the outer's React
 * tree. Clicking the inner's ✕ produces, on the outer, a `focusOutside` (focus moving onto the
 * inner's fields / ✕) *and* a `pointerDownOutside` (the pointerdown on the ✕) — either of which,
 * ungated, dismisses the outer and tears down whatever it hosts.
 *
 * The tell is the interaction's `target`: it sits inside the **inner** dialog's content
 * (`[role="dialog"]` / `[role="alertdialog"]`). And because Radix only ever calls
 * `onInteractOutside` for targets *outside* the guarded surface, a target that is nonetheless
 * inside *a* dialog can only be inside a **different, stacked** dialog — never this one. So we need
 * no notion of "self": any dialog-interior target reaching here is a nested-dialog interaction, and
 * we suppress it. A genuine backdrop dismissal targets the overlay (a sibling of the content, not
 * inside `[role="dialog"]`), so it is untouched — the inner dialog's own backdrop/Esc/✕ and this
 * surface's genuine backdrop click all still work.
 */
function interactionInsideNestedDialog(event) {
    const original = event.detail?.originalEvent;
    const target = original?.target;
    const el = target instanceof Element ? target : target instanceof Node ? target.parentElement : null;
    return el?.closest('[role="dialog"], [role="alertdialog"]') != null;
}
/**
 * Did this outside-interaction come from focus *falling out to the document root* rather than a
 * real user gesture on this surface? When a nested layer (a stacked Dialog, a popper) unmounts,
 * the browser can drop focus to `<body>`/`<html>`; that late `focusin` fires this surface's
 * `onInteractOutside` after the nested layer is already gone. Focus landing on the document root
 * (or nothing) means the previously-focused element was torn away — never the user intentionally
 * dismissing this surface — so we suppress it. Complements `interactionInsideNestedDialog`, which
 * catches the interaction *before* the nested dialog unmounts (target still inside it); this
 * catches the trailing focus event *after*.
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
 * a Radix popper (Select, DropdownMenu, Popover, Combobox, …) **or a stacked Radix Dialog** —
 * tearing down the whole surface when that nested layer is interacted with or dismissed.
 *
 * Three failure modes, all prevented here:
 *
 * 1. **Nested popper.** When a popper is open inside the surface, Radix forces the surface content
 *    to `pointer-events: none` so the popper owns the layer. A click anywhere inside the surface
 *    but outside the popper then lands outside the content. Radix closes the popper on that
 *    pointerdown and re-evaluates the *same gesture* as an outside interaction for the surface —
 *    firing `onPointerDownOutside` → `onDismiss`, tearing the surface down (losing in-progress
 *    edits). That dismissal fires *after* the popper has closed, so a "is a popper open right now?"
 *    check is too late. We judge the gesture by its *start*: a document-level capture listener
 *    (active only while the surface is open) records whether a popper was mounted at pointerdown
 *    time; if it was, the in-flight outside interaction is the user dismissing the *popper*, never
 *    the surface. The flag refreshes on every pointerdown, so the next genuine backdrop click
 *    (no popper open) dismisses normally.
 *
 * 2. **Stacked Dialog — the interaction.** A second Dialog opened on top (as a React *sibling*,
 *    the case Radix's branch mechanism does not cover) lives outside this surface's React tree, so
 *    interacting with it — clicking its ✕, focusing its fields — fires this surface's
 *    `onInteractOutside`. `interactionInsideNestedDialog` recognises that the interaction's target
 *    is inside another `[role="dialog"]` and suppresses it.
 *
 * 3. **Stacked Dialog — the trailing focus.** After the inner dialog unmounts, focus can fall to
 *    `<body>`, firing one more outside interaction. `focusFellOutToRoot` catches that tail.
 *
 * Returns a guard to call first from the surface's `onPointerDownOutside` / `onInteractOutside`
 * handlers: it returns `true` (after calling `preventDefault`) when the interaction is really a
 * nested-layer interaction/dismissal and the caller should bail out of its own dismiss logic.
 *
 * @param open Whether the surface is currently open. Pass the controlled `open` so the listener
 *   attaches only while open; for an uncontrolled surface pass `undefined` and the listener
 *   attaches for the surface's whole mounted lifetime (the per-pointerdown cost is a single
 *   `querySelector`). Only an explicit `false` skips attaching.
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
            interactionInsideNestedDialog(event) ||
            focusFellOutToRoot(event)) {
            event.preventDefault();
            return true;
        }
        return false;
    };
}
