# B002 — pageheader-unstable-thunk-loop

**Status:** open | **Branch:** main
**Filed:** 2026-06-20 — dogfood finding from evaluering's T029 (app-shell adoption).
Caught by live preview verification of the first real `app-shell` consumer; unit
tests miss it because they mock the shell and never mount the band.

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
