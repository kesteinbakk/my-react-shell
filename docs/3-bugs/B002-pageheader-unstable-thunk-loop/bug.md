# B002 — pageheader-unstable-thunk-loop

**Status:** awaiting-user-confirmation | **Branch:** main
**Filed:** 2026-06-20 — dogfood finding from evaluering's T029 (app-shell adoption).
Caught by live preview verification of the first real `app-shell` consumer; unit
tests miss it because they mock the shell and never mount the band.

> **Code moved since filing.** The `<ShellPageHeader>` registration *component* the
> analysis below describes was replaced by the `usePageHeader` *hook* (T016/T017 —
> register-once + update-in-place). The loop survived that refactor, relocated into
> the hook's **content effect**, and is what the resolution fixes. Line/symbol
> references below are as-filed and now stale; see **Resolution**.

## Symptom

Mounting a `<ShellPageHeader>` whose `tabs` / `title` / `actions` prop is a **new
function each render** sends the app into an infinite render loop — React throws
`Maximum update depth exceeded` and the subtree unmounts to the consumer's error
boundary. The idiomatic usage shown in the `PageTabs` docstring triggers it:

```tsx
<ShellPageHeader tabs={() => <PageTabs tabs={tabs} />} />   // fresh thunk every render
```

## Root cause

The registration effect (`src/app-shell/ShellPageHeader.tsx:54-72`) re-registers the
spec whenever a **thunk prop's identity** changes:

```tsx
useEffect(() => {
  const spec = { title: props.title, actions: props.actions, tabs: props.tabs, … }
  return shell.registerPageHeader(spec)
}, [shell.registerPageHeader, props.title, props.actions, props.tabs, …])  // ← thunk identities
```

`registerPageHeader(spec)` sets `pageHeaderSpec` state on `<AppShell>`, which
re-renders the chrome **and** the consumer subtree. If the consumer recreates the
thunk each render, the cycle is:

```
render → new tabs thunk → effect deps changed → registerPageHeader(spec)
       → setState(pageHeaderSpec) → AppShell re-render → consumer re-render → render …
```

— an unbounded setState-per-render loop, independent of any child component.

The docstring actively misleads here (`ShellPageHeader.tsx:8-11`):

> consumers should pass stable thunks … but **correctness does not depend on it:
> re-register is idempotent (pop-old-by-identity, push-new).**

Re-registration is *not* idempotent in effect: each call pushes a **new** spec
object and triggers a state update, so an unstable thunk is fatal, not merely
"churn."

## Fix options (shell-side — pick one)

1. **Make registration idempotent against an equivalent spec.** In
   `registerPageHeader`, bail out of the `setState` when the incoming spec is
   shallow-equal to the current one. Unstable thunks then cost one extra render at
   most, matching what the docstring already promises. *(Preferred — makes the
   documented guarantee real.)*
2. **Decouple the effect from thunk identity.** Keep the latest props in a ref and
   register once (deps = `[shell.registerPageHeader]`), re-registering only on
   genuine spec changes you choose to track.
3. **Documentation + DEV guard.** If stable thunks are to be a hard requirement,
   say so (remove the "correctness does not depend on it" line, mandate
   `useCallback`), and `console.warn` in DEV when a registered thunk's identity
   churns across renders.

## Related — Radix dedup for `link:` consumers

The same integration also required the consumer to dedupe Radix. `app-shell`
imports the individual `@radix-ui/*` packages (its declared peers); a `link:`
consumer resolves them from the shell's **own** `node_modules`, so it ends up with
two physical copies of the Radix ref/slot/context graph. `composeRefs` then loops
(`setRef → dispatchSetState → setRef`) inside the breadcrumb `DropdownMenu`.
Evaluering fixed it with `resolve.dedupe` over the `@radix-ui/*` graph (the same
treatment React already needs in a `link:` setup). This is expected `link:`
behaviour, not a shell defect — but the **distribution-model guide should document
it** (a "link: consumers must dedupe React AND Radix" note), since every app-shell
consumer on the dev-loop will hit it.

## Affected

- `src/app-shell/ShellPageHeader.tsx` — registration effect (lines 54-72) and the
  misleading docstring (lines 8-11).
- `docs/guides/distribution-model.md` — add the `link:`-consumer Radix-dedup note.

## Notes

- Severity: high for consumers (a crash on a whole route class), but the workaround
  is a one-line `useCallback`, so not release-blocking for the shell itself.
- Repro: any consumer that pins `PageTabs` into the band via the documented
  `tabs={() => …}` form without memoizing the thunk.

## Resolution

Fix option 1 — **make the push idempotent against an equivalent spec** — applied in
`src/app-shell/usePageHeader.ts` (where the loop lived post-T016/T017, not in the old
`ShellPageHeader.tsx` registration effect). The hook's **content effect** now guards
`handle.update(spec)` behind a resolved-**value** comparison (`specsEquivalent`)
against the last spec it pushed, held in a `lastPushedRef`:

- String thunks (`title`, function-form `documentTitle`, `search.placeholder`) are
  compared by their **resolved value** (the thunks are called — pure reads by
  contract, exactly what the band does on its own render), not by identity.
- `actions` compare by a per-item **signature** of scalar props (kind + `label` /
  `tone` / `disabled` / …); callbacks and node-producing thunks are ignored.
- `tabs` / `search` presence and `search.initialValue` are compared structurally.

So a fresh `title: () => …` thunk, a brand-new `search: { … }` object, or an
un-memoized `actions` array — recreated every render — no longer push a new spec each
render, which is what re-rendered the band → re-rendered the consumer → looped
(`Maximum update depth exceeded`, surfacing at the breadcrumb leaf's Radix Popper
anchor). A genuine **value** change (a title/placeholder/action whose resolved value
differs) still propagates. The deepest-mounted-wins ordering and in-place spec update
are untouched — only the redundant push is suppressed.

The misleading "correctness does not depend on it" promise is now **true**: unstable
option identities are tolerated. The hook's docstring was rewritten to explain the
guard.

Fix option 3's **DEV warning** was also added (churn is tolerated, not free): the
content effect only re-runs on an identity change, so when the rebuilt spec is
value-equivalent that change was pure churn. The hook then `console.warn`s **once per
instance** (gated on `import.meta.env.DEV`), naming the offending option(s), so a
consumer can memoize the wasted per-render work away. Silent on stable options and on
real value changes.

**Related Radix-dedup note:** already documented — `docs/guides/distribution-model.md`
lists `@radix-ui/react-dialog` / `@radix-ui/react-dropdown-menu` in the `link:`
consumer `resolve.dedupe` set. No further action.

**Verified** in `my-react-shell-demo` via the live preview: a page calling
`usePageHeader({ title: () => …, search: { onChange, placeholder: () => … }, actions:
[…] })` with every option recreated each render mounts with **zero** `Maximum update
depth` errors, and a control that changes the title's underlying value updates the
band's leaf crumb live (`Oslo #0` → `Oslo #4`).
