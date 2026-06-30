# B003 — nested-popper-dismisses-dialog

**Status:** awaiting-user-confirmation | **Branch:** main
**Filed:** 2026-06-30 — reported from offansk-ev (admin → Invite member modal): opening
the Role `Select` inside the modal and then clicking anywhere inside the modal but outside
the open dropdown collapsed the **entire dialog**, discarding the user's in-progress form
data. Reproduced and fixed against a controlled repro in `my-react-shell-demo`.

## Symptom

A `Select` (or any Radix popper: `DropdownMenu`, `Popover`, combobox) rendered **inside** a
`Dialog` / `Sheet` / `ConfirmDialog`: open the popper, then click inside the surface but
**outside** the popper (intending to dismiss only the popper). Instead the popper closes
**and the whole dialog/sheet closes too**, losing all entered data.

## Root cause

Not a my-react-shell layout/style bug and **not** the `link:`-consumer Radix-dedup hazard
(ruled out by instrumentation — the live DOM showed a single, unified Radix
`DismissableLayer` context: the dialog content carried an *explicit* inline
`pointer-events: none`, which only the lower-layer branch of a single context sets).

The real mechanism, confirmed from a live call stack:

1. While the popper is open, Radix forces the dialog content to `pointer-events: none` so
   the popper owns the top layer. A click inside the surface but outside the popper falls
   through the content to the backdrop / page.
2. Radix dismisses the popper on that `pointerdown`, then **re-evaluates the same gesture**
   as an outside-interaction for the dialog (now the top layer again) — firing the dialog's
   `onPointerDownOutside` → `onInteractOutside` → `onDismiss` → `onOpenChange(false)`.
3. Crucially this dialog dismissal fires **deferred**, *after* the popper has already
   unmounted (observed ~40ms later, via `flushSync` in `dispatchDiscreteCustomEvent`). So a
   naive guard that asks "is a popper open *right now*?" inside the dialog's outside handler
   is **too late** — the popper is already gone.

Verified call stack:
```
Dialog onOpenChange(false)
 ← onDismiss (@radix-ui/react-dialog)
 ← usePointerDownOutside (@radix-ui/react-dismissable-layer)
 ← handleAndDispatchPointerDownOutsideEvent2 (on HTMLDocument)
```

## Fix (shell-side)

`src/components/useDialogDismissGuard.ts` — a shared hook used by `Dialog`, `Sheet`, and
`ConfirmDialog`. It judges the gesture by its **start**, not its end: a document-level
**capture** `pointerdown` listener (active while the surface is open) records whether a
Radix popper (`[data-radix-popper-content-wrapper]`) was mounted at pointerdown time. The
surface's `onPointerDownOutside` / `onInteractOutside` call the guard first; if the gesture
began with a popper open, it `preventDefault()`s the dialog's dismissal (returning `true` so
the caller bails). The flag is refreshed on every pointerdown, so the next genuine backdrop
click (no popper open) dismisses the surface normally.

Wired into:
- `src/components/Dialog.tsx`
- `src/components/Sheet.tsx` (preserves the existing non-modal `onInteractOutside`
  preventDefault behaviour)
- `src/components/ConfirmDialog.tsx` (accepts arbitrary `children`, so a consumer can put a
  `Select` in it)

`Preview` is intentionally not patched — it renders a PDF, never popper-bearing children.

## Verification (in `my-react-shell-demo`, link loop, single Radix graph)

Repro added: a Role `Select` inside the Dialog (`OverlaysDialogsPage`) and inside the Sheet
form. Confirmed via the browser (chrome-devtools) after rebuild:

- **Bug gesture** (open Select → click dialog/sheet interior outside it): popper closes,
  **surface survives**. ✓ (both Dialog and Sheet)
- **Select an option** (Member → Admin → Owner): surface stays open, value updates. ✓
- **Genuine backdrop click** (no popper open): dialog dismisses normally. ✓
- **Esc**: dialog dismisses normally. ✓

## Consumer impact

- **Production (tag-pinned git-dep):** ships on the next shell tag bump; consumers get it on
  bumping their pin.
- **Dev (`link:` loop, e.g. offansk-ev / the demos):** the rebuilt `dist/` is picked up on
  reload — no install needed.

Closure to `resolved` awaits the user confirming in offansk-ev's real Invite-member modal.
