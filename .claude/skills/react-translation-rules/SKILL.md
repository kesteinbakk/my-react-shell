---
name: react-translation-rules
description: "Translation rules for user-facing text in React projects built on the my-react-shell i18n seam — t() usage, both-language parity, Norwegian character correctness, central-catalog policy.\nTRIGGER when: adding, modifying, removing, or auditing user-facing text / translation keys in a React (my-react-shell) project — labels, buttons, error messages, ARIA labels, placeholders, empty/loading states; or wiring the i18n provider / catalogs.\nDO NOT TRIGGER when: writing code comments, variable names, or log/console messages; or in a SolidJS Zingularis project (use translation-rules)."
---

# React Translations

User-facing text in a React project goes through the **my-react-shell i18n seam**
(`my-react-shell/i18n`): a zero-dependency `<I18nProvider>` + `useTranslation` hook
over a consumer-owned message catalog. Full provider API, props, and bring-your-own-engine
options live in the module's guide — **`~/Developer/my-react-shell/docs/guides/i18n.md`**.
Read it before wiring or changing the provider. This skill is the rules agents get wrong.

## Core Rule

**Never hardcode user-facing text. Always use `t('key')`** against the central catalog —
no inline literals, no per-component string maps.

```tsx
import { useTranslation } from 'my-react-shell/i18n'

function Account({ name }: { name: string }) {
  const { t } = useTranslation()              // or useTranslation('account') → t('title')
  return (
    <>
      <h1>{t('account.title')}</h1>
      <p>{t('account.greeting', { name })}</p>      {/* {{name}} in the catalog */}
      <button>{t('action.save')}</button>
      <input placeholder={t('form.email.placeholder')} />
    </>
  )
}
```

- **Outside React render** (event handlers, toast / error helpers): `translateNow(key, params)` —
  not `useTranslation`, which is hook-only.
- **Interpolation:** double braces `{{param}}` in the catalog; pass `t('key', { param })`.

## Both Languages, at Parity

Every key exists in **both** locales the app exposes (Norwegian + English), added together —
never one language only. Catalogs are consumer-owned nested objects, conventionally
`src/i18n/<code>.ts` (e.g. evaluering's `nb.ts` + `en.ts`); the locale codes are whatever the
app's `<I18nProvider locales={…}>` declares. A key present in one locale but not the other
shows up in the dev `<MissingTranslationsOverlay>` and a console warning — fix it, don't ship it.

## Norwegian Characters (CRITICAL)

Norwegian uses informal "du" form. Always use proper å, ø, æ — never ASCII substitutes.

| Wrong | Correct | Common words |
|-------|---------|--------------|
| `a` | `å` | å, på, må, går, får, år, stå |
| `o` | `ø` | ø, før, nøkkel, søk, høy, første, utløp |
| `ae` | `æ` | være, områder, nær, lærer |

Common mistake patterns:

```
WRONG              CORRECT
"pa nytt"      →   "på nytt"
"ma vaere"     →   "må være"
"nokkel"       →   "nøkkel"
"Sok etter"    →   "Søk etter"
"foresporsler" →   "forespørsler"
"ar gammel"    →   "år gammel"
"Utlopt"       →   "Utløpt"
"nodvendig"    →   "nødvendig"
"enna"         →   "ennå"
"omrader"      →   "områder"
```

Before submitting Norwegian translations: verify å/ø/æ present; infinitive marker is `å` not
`a`; common words include `på, må, få, gå, stå, år, nå, så`.

## Key Structure

Nested by feature so a key's owner is obvious (`account.*`, `nav.*`, `errors.*`); `t()` resolves
the dotted path. Compose a module's base catalog into a consumer's with `mergeMessages(base, override)`
(deep merge, override wins) — don't copy keys.

## What Must Be Translated

Button labels, headings, body text · form labels and placeholders · error / success / info messages ·
ARIA labels · modal content, tooltips · empty states, loading messages.

User-facing error text is translated (`toast.error(t('errors.userNotFound'))`); a technical error
thrown for logs is not (`throw new Error('USER_NOT_FOUND')`).

## Exceptions (hardcode OK)

`console`/log messages · code comments · CSS class names · test descriptions.

## Adding a Locale

Add the catalog (`src/i18n/<code>.ts`), include it in the provider's `messages`, and add
`{ code, label }` to `locales`. `defaultLocale` must be a real `messages` key — it throws
otherwise (no silent default).

## Verify a key resolves — don't just grep

`grep` finds the source literal; it does NOT prove the runtime catalog resolves it — a duplicate
sibling key in the object means the later one wins and the earlier is silently lost. Import the
catalog and read the dotted path, or rely on the dev missing-key overlay, before concluding a key
is present.
