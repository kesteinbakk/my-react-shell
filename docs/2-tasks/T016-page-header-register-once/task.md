# T016 — page header: register once, update in place (deterministic stack)

- **Status:** planning
- **Filed:** 2026-06-22
- **Working branch:** `main` (no worktree — focused edit in `src/app-shell/` + rebuild)
- **Origin:** user question — "agents constantly raise that the shell's header stack
  is last-writer-wins; with `foundation` I never heard this." Investigation confirmed
  the mechanism is an identical 1:1 port in both shells, but React's rendering model
  turns a dormant Solid design into a recurring foot-gun. This task is the **real
  fix** the user picked (over the cheap "just restore the dev warning" option).

## Root cause

Neither shell lets a page set the header directly: a page mounts `<ShellPageHeader>`,
which renders `null` and **registers its spec onto a stack** held by `<AppShell>`; the
shell renders the top of the stack (`headerStack.at(-1)`). "Last-writer-wins" = the
last entry on the stack is the one shown. Both repos share this.

The divergence is *how the registration runs*:

- **Foundation (Solid)** — `src/shell/ShellPageHeader.tsx:216-228`: registers **once**
  in `onMount`, with a spec built from **getters** (`get title() { return props.title }`).
  Components don't re-render, so the effect never re-fires and the spec object is never
  re-pushed. Stack order is frozen at **mount order** (child layouts mount after
  parents → an inline page header lands on top and *stays* there). Prop changes flow
  through the getters into the same stable object — no re-registration. Deterministic,
  invisible. It also warns when two headers mount at once
  (`src/shell/AppShell.tsx:242-248`).

- **my-react-shell (React)** — `src/app-shell/ShellPageHeader.tsx:53-75`: registers in a
  `useEffect` whose **deps are the thunk props** (`title`, `actions`, `search`, `tabs`,
  `documentTitle`, `className`). The idiomatic call shape passes inline thunks
  (`actions={[() => <Btn/>]}`), which get a **new identity every render**, so the effect
  cleanup + re-runs → pops the old spec and **pushes a new one onto the top of the
  stack**. The file comment admits this churn but claims "correctness does not depend on
  it" — true for *one* header, **false the moment two are mounted** (layout header +
  page header): the winner becomes "whichever component re-rendered most recently," not
  "whichever mounted last," so it can flip at runtime with no change to the mount tree.
  React StrictMode's dev double-invoke (mount → cleanup → mount) adds visible churn, and
  the port **dropped Solid's dev warning** (`src/app-shell/AppShell.tsx:99-102` just
  pushes), so an agent hitting the collision gets no signal and rediscovers the stack
  behavior by debugging — every time.

This is the one place the React port **cannot** mirror Solid's idiom literally: React
has no fine-grained reactive getters, so "register once + getters that track" doesn't
translate. The behavioral contract (header updates reactively to prop changes **and** a
deterministic, mount-order stack) is what must be preserved — per root `CLAUDE.md` →
faithful port: the *idiom* changes (signals → hooks), the *behavior* does not.

## Decision / design

**Split identity (stack position) from content (the spec).** Register the slot exactly
once on mount to fix its stack position; update the spec **in place** on prop change
without ever re-pushing. Stack order then equals mount order — stable and deterministic,
matching foundation — while content stays reactive.

### `shellContext.ts` (internal contract)

`registerPageHeader` returns a **handle** instead of a bare unregister:

```ts
registerPageHeader: (spec: ShellPageHeaderSpec) => {
  update: (next: ShellPageHeaderSpec) => void
  unregister: () => void
}
```

Internal only — the sole caller is `<ShellPageHeader>`; `<ShellPageHeader>`'s public
props and the `my-react-shell/app-shell` export surface are unchanged. (Update the
JSDoc on the field accordingly.)

### `AppShell.tsx`

Stack entries carry a stable id so position survives content updates:

```ts
const [headerStack, setHeaderStack] = useState<{ id: symbol; spec: ShellPageHeaderSpec }[]>([])
const pageHeaderSpec = headerStack.at(-1)?.spec ?? null

const registerPageHeader = useCallback((spec: ShellPageHeaderSpec) => {
  const id = Symbol('shell-page-header')
  setHeaderStack((prev) => {
    if (import.meta.env.DEV && prev.length > 0) {
      console.warn(
        '[AppShell] Multiple <ShellPageHeader> instances mounted simultaneously. ' +
          'The most-recently-mounted instance wins. Each page should mount only one.',
      )
    }
    return [...prev, { id, spec }]
  })
  return {
    update: (next: ShellPageHeaderSpec) =>
      setHeaderStack((prev) => prev.map((e) => (e.id === id ? { id, spec: next } : e))),
    unregister: () => setHeaderStack((prev) => prev.filter((e) => e.id !== id)),
  }
}, [])
```

- `update` replaces the entry's spec **in place** (same id, same array position) → React
  re-renders the chrome, but the stack order never changes, so the winner never flips.
- The dev warning restores the foundation parity gap (use the project's existing DEV
  guard idiom — confirm `import.meta.env.DEV` vs an `IS_DEV` constant already in use in
  this module before settling on it).

### `ShellPageHeader.tsx`

Two effects — one for identity, one for content — plus a ref so the spec reads current
props:

```ts
export function ShellPageHeader(props: ShellPageHeaderProps): null {
  const shell = useShellContext()
  const handleRef = useRef<{ update: (s: ShellPageHeaderSpec) => void; unregister: () => void } | null>(null)

  const buildSpec = (): ShellPageHeaderSpec => ({
    title: props.title, actions: props.actions, search: props.search,
    tabs: props.tabs, documentTitle: props.documentTitle, className: props.className,
  })

  // Identity — runs once; fixes this header's stack position. (registerPageHeader is
  // stable via useCallback, so this never re-fires from a dep change.)
  useEffect(() => {
    const handle = shell.registerPageHeader(buildSpec())
    handleRef.current = handle
    return () => { handle.unregister(); handleRef.current = null }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shell.registerPageHeader])

  // Content — re-runs on any prop change; updates in place, no re-push.
  useEffect(() => {
    handleRef.current?.update(buildSpec())
  }, [props.title, props.actions, props.search, props.tabs, props.documentTitle, props.className])

  return null
}
```

On mount React runs effects top-down, so the identity effect sets `handleRef` before the
content effect calls `update` (a harmless same-content update). On prop change only the
content effect runs → in-place update. On unmount the identity cleanup unregisters.

> The `buildSpec`-in-deps lint will want the thunks listed; keeping the **explicit prop
> deps** (not `buildSpec`) is deliberate and correct — that's exactly the reactive set.

## Plan

1. `shellContext.ts` — change `registerPageHeader`'s return type to the `{ update,
   unregister }` handle; update its JSDoc.
2. `AppShell.tsx` — stack of `{ id, spec }`; `registerPageHeader` returns the handle and
   restores the dev warning; `pageHeaderSpec = headerStack.at(-1)?.spec ?? null`.
   Verify the `documentTitle` memo and `ShellPageHeaderUI spec={…}` wiring still read
   `pageHeaderSpec` correctly.
3. `ShellPageHeader.tsx` — two-effect register-once + update-in-place; drop the
   thunk-keyed single registration effect; update the file header comment (the current
   one describes the pop-old/push-new churn this removes).
4. `docs/guides/app-shell.md` — page-header section: note that the stack is
   mount-order-deterministic and **each page should mount exactly one
   `<ShellPageHeader>`** (a second one wins only while mounted and warns in dev).
5. `pnpm build:lib` (rebuild `dist/`; the demos link-consume it). The pre-commit dist
   guard will also rebuild — see the precommit-rebuilds-dist note.
6. **Verify** (user-owned dev server): on a route that mounts a header, confirm the
   title/actions still update live when their thunks change; mount a second
   `<ShellPageHeader>` in a layout + page and confirm the page (last-mounted) wins
   stably across re-renders and that the dev warning fires once. The demo's
   nested-pages / kit routes exercise the header.

## Out of scope

- The **cheap fix** (restore the dev warning *only*, leaving the churn) — folded into
  this task as a sub-item, not a separate path.
- Any change to `findActiveChain`, breadcrumb resolution, or `<ShellPageHeader>`'s
  public props / the `my-react-shell/app-shell` export surface.
- `registerDynamicPages` — it already keys by `registrantId` and merges per parent, so
  it does not have the last-writer churn; untouched.
