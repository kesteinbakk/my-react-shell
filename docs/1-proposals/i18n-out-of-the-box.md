# Proposal: Out-of-the-box Support for Synced Translations

## Problem
Currently, whenever a React app within the Zingularis ecosystem subscribes to the centralized `zing-translations` sync (via `dev sync lang`), the project is forced to add significant boilerplate to `src/i18n/index.tsx` to actually consume the synced JSON files:

1. Import `syncedNb` and `syncedEn`.
2. Manually run `flattenMessages` (since synced catalogs are deeply nested while project catalogs use flat keys like `'common.name'`).
3. Manually merge the flattened objects with local dictionaries.
4. Manually combine types using `type CombinedDictKey = DictKey | DotPaths<typeof syncedNb>`.
5. Manually write a `resolve` function override to support single-brace `{name}` interpolation (since the shell's native resolver expects `{{name}}`).

This violates the goal of having `my-react-shell` support shared infrastructure out of the box.

## Proposed Solution: `createProjectI18n` Factory

`my-react-shell/i18n` should expose a new high-level factory, `createProjectI18n`, that completely abstracts away merging, type inference, and custom interpolation logic.

### 1. Consumer Usage (in `offansk/src/i18n/index.tsx`)

The entire `index.tsx` file in consumers can be reduced to this:

```tsx
import { createProjectI18n } from 'my-react-shell/i18n'
import { nb } from './nb'
import { en } from './en'
import syncedNb from '../locales/synced/no.json'
import syncedEn from '../locales/synced/en.json'

export const { 
  useT, 
  useLanguage, 
  LanguageProvider,
  translate 
} = createProjectI18n({
  localMessages: { nb, en },
  syncedMessages: { nb: syncedNb, en: syncedEn },
  interpolation: 'single-brace', // Overrides shell's default {{name}}
  defaultLanguage: 'nb'
})
```

### 2. Implementation in `my-react-shell/i18n`

The factory will handle all the heavy lifting internally:

```tsx
export function createProjectI18n<
  LocalDict extends Record<string, string>,
  SyncedDict extends Record<string, any>
>(config: {
  localMessages: Record<string, LocalDict>
  syncedMessages?: Record<string, SyncedDict>
  interpolation?: 'single-brace' | 'double-brace'
  defaultLanguage: string
}) {
  // 1. Automatic Type Inference
  type CombinedKey = keyof LocalDict | DotPaths<SyncedDict>

  // 2. Automatic Flattening & Merging
  const mergedDicts = {}
  for (const lang of Object.keys(config.localMessages)) {
    const local = config.localMessages[lang]
    const synced = config.syncedMessages?.[lang] || {}
    mergedDicts[lang] = { ...flattenMessages(synced), ...local }
  }

  // 3. Typed hooks
  const typed = createTypedI18n<CombinedKey>()

  // 4. Custom resolve logic generated internally based on interpolation setting
  const LanguageProvider = ({ children }) => {
    return (
      <I18nProvider
        messages={mergedDicts}
        resolve={(loc, key, params) => {
          const dict = mergedDicts[loc]
          const template = dict?.[key]
          if (!template) return undefined
          
          if (!params) return template
          
          if (config.interpolation === 'single-brace') {
            return template.replace(/\{(\w+)\}/g, (match, name) =>
              name in params ? String(params[name]) : match
            )
          }
          // fallback to standard interpolation
          return interpolate(template, params)
        }}
        // ... standard props
      >
        {children}
      </I18nProvider>
    )
  }

  return {
    useT: typed.useT,
    useLanguage: /* ... */,
    LanguageProvider,
    translate: /* ... */
  }
}
```

## Benefits
1. **Zero Boilerplate:** New React projects get type-safe synced translations by simply passing the imported JSON to the factory.
2. **Type Safety Preserved:** The factory automatically infers `CombinedKey` and binds the typed hooks internally, maintaining the strict compile-time checks without requiring the app to manually define union types.
3. **Out-of-the-Box Interpolation:** Standardizes the `{name}` vs `{{name}}` discrepancy behind a simple configuration flag.
