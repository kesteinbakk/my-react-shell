# Authoring conventions (deltas)

**Maintainer guide — not shipped to consumers.** Most module conventions live in
[docs/concept.md](../../concept.md) → *Module rules*, the per-module guides, the API
reference, and [module-authoring.md](../module-authoring.md). This file carries the
authoring rules that have no other home.

## Input auto-save UX

Settings/config inputs **save themselves** — they do **not** carry manual Save buttons.
Use a debounced auto-save and surface progress through the `saveStatus` prop
(`'idle' | 'pending' | 'saving' | 'saved' | 'error'`): on `'saved'` the border fades
green (~1000 ms), and editing clears it back to `'idle'` (~120 ms). When several inputs
share one `useDebouncedAutoSave` hook, track `lastModifiedField` and bind
`saveStatus={lastModifiedField === fieldKey ? state : 'idle'}` so they don't all flash
green at once. Failures raise an error toast; **never** show a success toast for an
auto-save. Exception: transactional entity-creation dialogs (e.g. "Create Project") keep
their explicit Submit button.
