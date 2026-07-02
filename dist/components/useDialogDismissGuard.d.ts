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
export declare function useDialogDismissGuard(open?: boolean): (event: Event) => boolean;
