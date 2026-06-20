/**
 * Type-level tests for the opt-in typed-key surface (T007).
 *
 * No runtime test framework runs in this repo — these assertions are enforced by
 * the type-checker itself: `pnpm typecheck` (`tsc -b`) and `pnpm build:lib` fail
 * if any assertion below regresses. Each `@ts-expect-error` is self-verifying:
 * if the marked line stops being an error, `@ts-expect-error` becomes an
 * "unused directive" error and the build fails.
 *
 * This file is type-only and excluded from the published `dist/` (see
 * tsconfig.lib.json `exclude`); it exists solely to pin the key-safety contract.
 */

import { createTypedI18n, useTranslation, translateNow } from './index'
import type { DotPaths } from './index'

// A representative bound key union (the shape a consumer passes — flat or derived).
type DictKey = 'nav.home' | 'nav.back' | 'account.title' | 'greeting'

// Compile-time assertion helper. `expectType<Expected>()(value)` only accepts a
// `value` whose type is assignable both ways to `Expected`, so it asserts an
// exact match. Returns void; every call below is a statement, so nothing is
// flagged as an unused local.
type Exact<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false
function expectType<Expected>() {
  return <Actual>(_value: Actual & (Exact<Actual, Expected> extends true ? unknown : never)): void => {
    // type-only — no runtime behavior
  }
}

// ── factory: bound key union ──────────────────────────────────────────────────

const typed = createTypedI18n<DictKey>()

export function typedFactoryAssertions(): void {
  const { t } = typed.useTranslation()

  // A good key resolves to `string`.
  expectType<string>()(t('nav.home'))
  expectType<string>()(t('greeting'))

  // A bad key is a compile error.
  // @ts-expect-error — 'nav.nope' is not a member of DictKey
  t('nav.nope')
  // @ts-expect-error — typo of a real key
  t('greetingg')

  // useT() returns the bound translator directly; a good key is `string`.
  const tt = typed.useT()
  expectType<string>()(tt('account.title'))
  // @ts-expect-error — bad key via useT's bound t
  tt('account.nope')

  // Namespaced narrowing: under 'nav', the sub-keys of DictKey are accepted…
  const { t: navT } = typed.useTranslation('nav')
  expectType<string>()(navT('home'))
  expectType<string>()(navT('back'))
  // …and a key outside that namespace (or a bad sub-key) is a compile error.
  // @ts-expect-error — 'title' belongs to 'account', not 'nav'
  navT('title')
  // @ts-expect-error — 'home' is the valid sub-key; 'nope' is not
  navT('nope')

  // Imperative translateNow, bound to the union.
  expectType<string>()(typed.translateNow('greeting'))
  // @ts-expect-error — bad key for the bound imperative translator
  typed.translateNow('does.not.exist')
}

// ── non-breaking proof: untyped seam, ZERO type args ──────────────────────────

export function untypedSeamAssertions(): void {
  // The default key type is `string`: any dotted key compiles, as today.
  const { t } = useTranslation()
  expectType<string>()(t('literally.anything'))
  expectType<string>()(t(String(Math.random())))

  // translateNow with no type arg accepts any string.
  expectType<string>()(translateNow('whatever.key'))

  // A namespace on the untyped hook still yields a fully-permissive `t`.
  const { t: nsT } = useTranslation('nav')
  expectType<string>()(nsT('anything.here'))
}

// ── DotPaths<T>: nested catalog type → dotted-path union ───────────────────────

type SampleCatalog = {
  nav: { home: string; back: string }
  account: { title: string }
  greeting: string
}

export function dotPathsAssertions(): void {
  // The derived union matches the hand-written one exactly.
  const fromCatalog = createTypedI18n<DotPaths<SampleCatalog>>()
  const { t } = fromCatalog.useTranslation()
  expectType<string>()(t('nav.back'))
  expectType<string>()(t('account.title'))
  expectType<string>()(t('greeting'))
  // @ts-expect-error — not a path of SampleCatalog
  t('account.subtitle')
}

// Assert DotPaths resolves to the expected literal union (order-independent).
type _DotPathsExact = Exact<DotPaths<SampleCatalog>, DictKey> extends true ? true : never
export const _dotPathsUnionMatches: _DotPathsExact = true
