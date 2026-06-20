# T007 — typed-i18n-keys

**Status:** planning · **Filed:** 2026-06-20

## Problem

The shell's i18n seam (`my-react-shell/i18n`) is **stringly-typed**:
`TFunction = (key: string, params?) => string`. A typo, or a key missing from
the catalog, is caught only **at runtime** — the dev `<MissingTranslationsOverlay>`
plus a console warning — never by the compiler.

evaluering — already a shell consumer (`link:../my-react-shell`) — independently
solved this in `src/i18n/index.ts`: a hand-rolled `DictKey` union (every key is a
string-literal type) and `en: Dict` forcing both locales to declare the same
keys, so a typo or a missing translation is a **compile error** (backed by a
runtime parity test). foundation (SolidJS) is likewise stringly-typed.

So the ecosystem's *strongest* i18n property — compile-time key safety — lives in
a single consumer, while the shared hub is **weaker than what depends on it**. Any
React consumer adopting the shell seam (the documented standard, per the
`react-translation-rules` skill) would **lose** that safety. That is the
i18n-consistency problem: the hub can't offer what its best consumer already has,
so consumers either diverge (keep their own seam) or downgrade to adopt the shell.

## Decision

Lift compile-time key safety **into the shell**, opt-in and fully non-breaking, so
every React consumer gets the shared provider/lifecycle **and** compile-time keys
from one source — making evaluering's typed approach the seam's default rather
than a local exception. Recorded as **D14** in `strategy.md`.

This **supersedes the evaluering "Option B" shim plan** (re-exporting
`useT`/`useLanguage` as local typed wrappers over a stringly hook): with a typed
factory, evaluering binds its `DictKey` to the shell hook **directly** — no local
casts, no compensating shim.

**Hard constraint — non-breaking.** Every public type/hook gains a key type
parameter that **defaults to `string`**. Existing call sites (`useTranslation()`,
`t('any.dotted.key')`, `translateNow('x')`) compile and run **exactly as today**.
The runtime — one `<I18nProvider>`, one context, the pure translator, the
missing-key store — is **unchanged**. This is a type-layer + small-helper addition
only.

## Approach (decided 2026-06-20 → A: factory binds a key union)

A typed **factory** is the ergonomic path, implemented as pure typing sugar over
generic hooks. Three candidates were weighed; **owner picked A**:

| | How a consumer uses it | Verdict |
|---|---|---|
| **A. Factory binding a key union** | `export const { useTranslation, translateNow } = createTypedI18n<DictKey>()` — declared once, every call site typed with zero ceremony | **Recommended** — mirrors react-i18next `createTypedHooks` / TanStack typed router; one declaration, no per-call type args to forget |
| B. Bare generics per call | `useTranslation<DictKey>()` at each of ~64 sites | Verbose; a forgotten type arg silently degrades to `string` (no safety, no error) |
| C. Catalog-derived | `createTypedI18n<typeof catalog>()` deriving keys via `DotPaths<T>` | Most magical; ship `DotPaths<T>` as an *exported utility* so nested-catalog consumers can write `createTypedI18n<DotPaths<typeof en>>()`, but don't force it |

**Decision:** ship **A** (factory takes a key union `K extends string`) **and
export `DotPaths<T>`** so a consumer with a nested catalog can derive `K` from the
catalog type. evaluering passes its existing `DictKey` directly. The factory is
sugar over the generic hooks below — same runtime, types only. (B rejected: a
forgotten per-call type arg silently degrades to `string`. C kept only as the
exported `DotPaths<T>` utility, not the entry point.)

## Shell changes (`src/i18n/`)

- **`i18nContext.ts`** — `TFunction<K extends string = string>`,
  `I18nContextValue<K>`. The runtime context value is unchanged; the narrowing to
  a typed view happens in the hooks/factory.
- **`useTranslation.ts`** — `useTranslation<K extends string = string>(namespace?)`
  returns `UseTranslationResult<K>` with a typed `t`. Runtime identical.
  **Namespaced typed keys:** when `namespace` is given, narrow the key type to the
  suffixes of `K` under that namespace via a template-literal type
  (``K extends `${NS}.${infer Rest}` ? Rest : never``) — ship if it stays clean;
  otherwise document that namespaced `t` is full-key-typed for the first cut.
- **`translateNow.ts`** — `translateNow<K extends string = string>(key: K, …)`;
  the factory re-exports a `K`-bound `translateNow` so imperative callers are typed.
- **`translate.ts`** — export a `DotPaths<T>` recursive type (nested
  `Messages`-shaped object → dotted-path string-literal union). Pure type; no runtime.
- **`createTypedI18n.ts` (new)** — `createTypedI18n<K extends string>()` →
  `{ useTranslation, useT, translateNow }`, all bound to `K`. A thin typed wrapper
  over the existing hooks — **no new context, no new runtime**. `useT()` is the
  no-namespace convenience (returns the bound `t` directly), matching
  foundation/evaluering ergonomics.
- **`I18nProvider.tsx`** — runtime unchanged. *Stretch:* accept a `Catalog` type
  param so `messages` is type-checked to declare the union `K` (catches a
  catalog/key-union mismatch at the provider). Optional; the read-side hooks are
  the priority.
- **`index.ts`** — export `createTypedI18n`, `DotPaths`, and the now-generic types.

## Relationship to evaluering (first consumer / validation)

evaluering proves the seam. Post-ship, evaluering's `src/i18n/index.ts` becomes:

- the provider wired once with
  `resolve={(loc, key, p) => translate(DICTS[loc as Language], key as DictKey, p)}`
  (runtime lookup against its existing **flat** `Dict`, keeping its `{single}`
  placeholders — the shell's `{{double}}` interpolation is bypassed by `resolve`),
  `storageKey="lang"`, `defaultLocale="nb"`, `detectBrowserLocale={false}`, plus a
  `useEffect` preserving `document.documentElement.lang` (the shell provider does
  not set it);
- the typed read side from `createTypedI18n<DictKey>()`; `useT` / `useLanguage`
  kept as **trivial** re-exports so the **64 `useT()` call sites and ~10
  `useLanguage`/toggle sites stay untouched**.

Per the per-repo index convention, **the evaluering changes are consumer-side and
tracked in evaluering's own task index** — this task is the shell seam + its
docs/demo.

## Verification

- `pnpm typecheck` + `pnpm build:lib` (`tsc -p tsconfig.lib.json`) green.
- **Non-breaking proof:** the existing dev-harness i18n usage and all current
  tests compile **unchanged** with no type args.
- **Typed-key tests:** a `*.test-d.ts` (or `@ts-expect-error` cases) asserting a
  bad key and a bad namespaced key are compile errors, and a good key resolves to
  `string`.
- Validate end-to-end against evaluering on the `link:` loop (its 64 call sites
  compile against the bound hook; a deliberately-wrong key errors).

## Open / to confirm

- **Namespaced-key narrowing** — ship the template-literal version if clean, else
  document the first-cut limitation.
- **Provider `messages` typing** against `K` (stretch) — now or later.

(Approach decided → A, above. evaluering adoption filed as **evaluering T032** —
its own consumer task in evaluering's repo, blocked on this shipping.)

## Docs to update on completion

`strategy.md` (**D14**), `concept.md` (i18n module line — note opt-in typed keys),
`docs/guides/i18n.md` (new "Typed keys" section showing `createTypedI18n`), the
**`react-translation-rules` skill** (make the typed factory the documented
standard), `CLAUDE.md` (i18n bullet, if the seam description changes), and the
`my-react-shell-demo` i18n showcase (typed usage).
