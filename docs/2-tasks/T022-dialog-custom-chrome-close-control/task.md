# T022 — Dialog: custom content chrome, header actions, close-source control

**Status:** finished · **Proposal:** `docs/1-proposals/dialog-custom-chrome-and-close-control.md`

## What shipped

Extended the `my-react-shell/components` `Dialog` so it can host dialogs that aren't the
standard padded title/body/footer card, without changing the existing chrome:

- **`bleed`** — full-bleed content mode. The kit drops its own padding/gap and the
  consumer owns the entire inner layout (a sticky header band + a scrolling body, an
  edge-to-edge viewer). `title` stays required and is kept as a **visually-hidden
  accessible name** (`.mrs-sr-only`); the visible header lives in `children`. The
  `footer` slot is ignored in this mode.
- **`size`** (`sm` · `md` · `lg` · `xl` · `full`, default `md`) — outer width. The
  content also caps at `max-height: calc(100dvh - 2rem)` and the **body region scrolls**
  within it while the header/description/footer stay pinned (automatic, additive — a
  strict improvement over today's unbounded height).
- **`titleActions`** — a control rendered on the heading row beside the title (a version
  picker, a score badge). The accessible name is preserved because only `title` is the
  Radix `Title`.
- **`closeOnBackdrop` / `closeOnEsc`** (default `true`) — close-source control via Radix
  `onPointerDownOutside` / `onInteractOutside` / `onEscapeKeyDown`. Set `closeOnBackdrop`
  false to keep an in-progress edit safe while ✕ / footer save / Esc still close.

## Decisions (proposal open questions)

- **Full-bleed model:** a content **mode** (`bleed`) — the consumer owns the inner
  layout — rather than fixed sticky-header/body slots. Least surface, maximum freedom.
- **Viewport-fit + scroll:** automatic (always caps + scrolls the body). Additive; small
  dialogs are unchanged.
- **Close control:** two booleans treating backdrop and Esc as distinct sources — the
  least surface that covers "don't discard unsaved edits" — not a full veto callback.
- **Title slot:** keep `title` as the accessible name; add a separate `titleActions` slot
  rather than letting a node into `title` (which would pollute the accessible name).

Additive / non-breaking. `ConfirmDialog` is unaffected — it reuses the `.mrs-dialog` base
classes only, not the new `__header` wrapper.

## Surface

`src/components/Dialog.tsx`, `src/components/components.css`
(`.mrs-dialog--{sm,md,lg,xl,full}`, `.mrs-dialog--bleed`, `.mrs-dialog__header`,
`.mrs-dialog__title-actions`, body scroll + flex-shrink, `.mrs-sr-only`),
`src/components/index.ts` (`DialogSize` export), `docs/specifications/api-reference.md`.
Demo: `my-react-shell-demo` `src/pages/FeedbackOverlaysPage.tsx` (`DialogAdvancedShowcase`).
