# T020 — DropdownMenu: submenus + selectable (checkbox / radio) items

**Status:** finished · **Proposal:** `docs/1-proposals/dropdown-menu-submenu-and-selectable-items.md`

## What shipped

Extended the `my-react-shell/components` `DropdownMenu` `items` union with three new
entry types, built on Radix DropdownMenu's native primitives:

- **`checkbox`** — an independent on/off toggle on `RadixMenu.CheckboxItem`. Controlled
  via `checked` + `onCheckedChange`; the kit renders the ✓ indicator.
- **`radio-group`** — a mutually-exclusive group on `RadixMenu.RadioGroup` / `RadioItem`.
  Controlled via `value` + `onValueChange`, with an `options` list and an optional
  group `label`; the kit renders the ● indicator.
- **`submenu`** — a nested menu on `RadixMenu.Sub` / `SubTrigger` / `SubContent`. Its
  `items` is the same union, so nesting is arbitrary-depth (rendered via a recursive
  `renderItem`).

## Decisions (proposal open questions)

- **Stay-open default.** Checkbox and radio rows keep the menu open on select
  (`onSelect` calls `preventDefault`) so several can be toggled in one opening; plain
  action items still close. Overridable per item via `closeOnSelect`.
- **Nesting depth:** arbitrary (recursion through the shared union).
- **State ownership:** fully consumer-controlled — the kit only renders the indicator —
  consistent with the rest of the kit's controlled inputs.

Additive / non-breaking: existing `item` / `separator` / `label` entries are unchanged.

## Surface

`src/components/DropdownMenu.tsx` (new entry types + recursive render),
`src/components/components.css` (`.mrs-menu__indicator(-glyph)`, `.mrs-menu__label-text`,
`.mrs-menu__sub-trigger`, `.mrs-menu__sub-chevron`), `src/components/index.ts` (type
exports), `docs/specifications/api-reference.md`. Demo: `my-react-shell-demo`
`src/pages/FeedbackOverlaysPage.tsx` (`DropdownMenuShowcase`).
