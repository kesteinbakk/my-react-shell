/**
 * usePageHeader — register a route's page chrome (title / actions / search / tabs /
 * documentTitle / className) onto the shell band.
 *
 * The breadcrumb band itself renders **automatically** from the URL chain — a page
 * does not call this hook just to show breadcrumbs. Call it only to *add* chrome.
 * The hook splits identity from content: a register-once mount effect fixes this
 * contributor's slot under a stable **render-order token** (so the deepest-mounted
 * `usePageHeader` wins — see `shellContext.registerPageHeader`), while a separate
 * effect updates the spec **in place** on any option change — never re-registering,
 * so the winner can't flip at runtime when a component re-renders with fresh inline
 * thunks. The chrome stays reactive while remaining deterministic.
 *
 * **Footgun-proof by design.** The content effect pushes a new spec to the shell
 * band (a `setState`) only when the spec's *resolved values* actually change — never
 * merely because an option's identity did. This matters because pushing a spec
 * re-renders the band, which re-renders this hook's own subtree; if that push fired
 * on every render (as it would for an inline `title: () => t('…')` thunk, a fresh
 * `search: { … }` object, or a fresh `actions: []` array — all recreated each
 * render) the band and the route would re-render each other without end, tripping
 * React's "Maximum update depth exceeded" guard (the loop surfaces at the breadcrumb
 * leaf's Radix Popper anchor, but the engine is the every-render push). By comparing
 * *values* rather than identities, unstable options are tolerated — exactly what a
 * consumer expects — while a title/search/action whose underlying value genuinely
 * changes still updates the band. The band resolves the winning spec's thunks on its
 * own render, so it never needs a fresh thunk *identity* pushed to it, only a fresh
 * value signal.
 *
 * Churn is tolerated, not endorsed: in DEV the content effect warns once per instance
 * (naming the offending field) when an option's identity churns without its value
 * changing, so a consumer can memoize away the wasted per-render work.
 *
 * Replaces foundation's `<ShellPageHeader>` registration component with a hook (the
 * React-idiomatic shape, consistent with the sibling `useDynamicPages`).
 */

import { useEffect, useRef } from 'react'
import type { PageHeaderAction, PageHeaderOptions, ShellPageHeaderSearchSlot, ShellPageHeaderSpec } from './shellContract'
import { useShellAPIContext } from './shellContext'

/**
 * Monotonic, module-wide counter handing each `usePageHeader` instance a token in
 * **render order**. React renders ancestors before descendants, so an ancestor's
 * token is lower than a descendant's — the shell picks the highest (deepest) as the
 * band winner. Mutated during render but guarded by a per-instance ref, so each
 * instance claims exactly one token even under StrictMode's double-invoke.
 */
let nextHeaderOrder = 0

/**
 * Option fields carried as thunks / objects / arrays — the ones whose identity can
 * change across renders without their resolved value changing. The DEV churn check
 * names whichever of these got a fresh identity so the consumer knows what to memoize.
 */
const CHURN_FIELDS = ['title', 'actions', 'search', 'tabs', 'documentTitle'] as const

/* ── Value-signature comparison ──────────────────────────────────────────────
 *
 * Two specs are "equivalent" — pushing the new one would be a no-op the band can't
 * observe — when every field resolves to the same value/structure. Only then do we
 * skip the push. The string thunks (`title`, function-form `documentTitle`, and
 * `search.placeholder`) are pure reads by contract, so calling them here to compare
 * resolved values is safe and is exactly what the band does on its own render.
 *
 * Callbacks (`search.onChange`, action `onClick`/`onChange`) and node-producing
 * thunks (`tabs`, function children in `actions`) are compared by *presence/kind*,
 * not output — their content re-resolves whenever the band next re-renders (a nav,
 * a language flip, or another field's value change), so a churned identity alone
 * never needs to force a push. Consumers with stable callbacks (the common case)
 * see no staleness; the guard's whole purpose is to not treat identity churn as a
 * change. */

function titleKey(title: (() => string) | undefined): string {
  return title ? `t:${title()}` : ''
}

function documentTitleKey(dt: ShellPageHeaderSpec['documentTitle']): string {
  if (dt === undefined) return ''
  return typeof dt === 'function' ? `d:${dt()}` : `m:${dt}`
}

function searchEquivalent(
  a: ShellPageHeaderSearchSlot | undefined,
  b: ShellPageHeaderSearchSlot | undefined,
): boolean {
  if (a === undefined || b === undefined) return a === b
  return a.initialValue === b.initialValue && a.placeholder?.() === b.placeholder?.()
}

/** Signature of one action — scalar props only, callbacks + nodes ignored. */
function actionSignature(item: PageHeaderAction): string {
  if (typeof item === 'function') return 'fn'
  if (typeof item === 'string') return `p:${item}`
  const parts: string[] = []
  for (const [k, v] of Object.entries(item)) {
    const t = typeof v
    if (t === 'string' || t === 'number' || t === 'boolean' || v == null) {
      parts.push(`${k}=${String(v)}`)
    }
    // functions / objects / ReactNodes are intentionally skipped
  }
  return `o:${parts.sort().join('&')}`
}

function actionsEquivalent(
  a: PageHeaderAction[] | undefined,
  b: PageHeaderAction[] | undefined,
): boolean {
  const xa = a ?? []
  const xb = b ?? []
  if (xa.length !== xb.length) return false
  for (let i = 0; i < xa.length; i++) {
    if (actionSignature(xa[i]) !== actionSignature(xb[i])) return false
  }
  return true
}

function specsEquivalent(a: ShellPageHeaderSpec, b: ShellPageHeaderSpec): boolean {
  return (
    titleKey(a.title) === titleKey(b.title) &&
    a.className === b.className &&
    documentTitleKey(a.documentTitle) === documentTitleKey(b.documentTitle) &&
    (a.tabs === undefined) === (b.tabs === undefined) &&
    searchEquivalent(a.search, b.search) &&
    actionsEquivalent(a.actions, b.actions)
  )
}

/** Register page chrome onto the shell band. No-op band-wise if every field is absent. */
export function usePageHeader(options: PageHeaderOptions): void {
  const shell = useShellAPIContext()

  // Claim a render-order token once per instance (ref guard ⇒ StrictMode-safe).
  const orderRef = useRef(-1)
  if (orderRef.current === -1) orderRef.current = nextHeaderOrder++

  const handleRef = useRef<{
    update: (spec: ShellPageHeaderSpec) => void
    unregister: () => void
  } | null>(null)

  // The last spec whose values we propagated to the band. The content effect
  // compares against this (not option identities) to decide whether a push is
  // warranted — the guard that keeps unstable options from looping.
  const lastPushedRef = useRef<ShellPageHeaderSpec | null>(null)

  // DEV churn check: the previous render's `options` (for identity diffing) and a
  // one-shot flag so the warning fires at most once per hook instance.
  const prevOptionsRef = useRef<PageHeaderOptions | null>(null)
  const churnWarnedRef = useRef(false)

  const buildSpec = (): ShellPageHeaderSpec => ({
    title: options.title,
    actions: options.actions,
    search: options.search,
    tabs: options.tabs,
    documentTitle: options.documentTitle,
    className: options.className,
  })

  // Identity — runs once; fixes this contributor's slot + render-order token.
  // `registerPageHeader` is stable (useCallback in AppShell), so this never re-fires.
  useEffect(() => {
    const spec = buildSpec()
    const handle = shell.registerPageHeader(orderRef.current, spec)
    handleRef.current = handle
    lastPushedRef.current = spec
    return () => {
      handle.unregister()
      handleRef.current = null
      lastPushedRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- register once; registerPageHeader + order are stable
  }, [shell.registerPageHeader])

  // Content — re-runs on any option change; updates the spec in place, no re-register.
  // Guards the push on a resolved-VALUE change so unstable option identities (inline
  // thunks / fresh objects / fresh arrays) don't push a new spec every render — which
  // would re-render the band, re-render this subtree, and loop. A genuine value change
  // still propagates. The explicit option deps (not `buildSpec`) are the reactive set.
  useEffect(() => {
    const handle = handleRef.current
    if (handle === null) return
    const next = buildSpec()
    const equivalent =
      lastPushedRef.current !== null && specsEquivalent(lastPushedRef.current, next)

    // DEV nudge: this effect only re-runs when an option's identity changed; if the
    // spec is nonetheless value-equivalent, that identity change was pure churn — an
    // inline thunk / fresh object / new array recreated every render. Tolerated (no
    // push, no loop) but wasteful, so name the churning field(s) once per instance.
    // Skipped on the first run (no previous render to diff against) and on a real
    // value change (which pushes below, never warns).
    const prev = prevOptionsRef.current
    prevOptionsRef.current = options
    if (import.meta.env.DEV && equivalent && !churnWarnedRef.current && prev !== null) {
      const churned = CHURN_FIELDS.filter((k) => prev[k] !== options[k])
      if (churned.length > 0) {
        churnWarnedRef.current = true
        console.warn(
          `[app-shell] usePageHeader: the \`${churned.join('`, `')}\` option(s) get a new ` +
            'identity across renders (an inline thunk, a fresh object, or a new array). The ' +
            'band tolerates this — it updates only on a real value change — but the churn ' +
            're-runs an effect every render. Memoize them (useMemo / useCallback) or hoist ' +
            'them to module scope.',
        )
      }
    }

    if (equivalent) return
    lastPushedRef.current = next
    handle.update(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- explicit option deps are the reactive set
  }, [
    options.title,
    options.actions,
    options.search,
    options.tabs,
    options.documentTitle,
    options.className,
  ])
}
