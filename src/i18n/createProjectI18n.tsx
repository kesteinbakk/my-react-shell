
import { I18nProvider } from './I18nProvider'
import type { I18nProviderProps } from './I18nProvider'
import { createTypedI18n } from './createTypedI18n'
import { flattenMessages, interpolate } from './translate'
import type { Messages, DotPaths } from './translate'
import commonEn from './locales/common-en.json'
import commonNb from './locales/common-nb.json'

type CommonDictKey = DotPaths<typeof commonEn>

export function createProjectI18n<LocalDict extends Messages>(config: {
  /** Project-specific message catalogs. Locale code -> nested catalog. */
  localMessages: Record<string, LocalDict>
  /** 
   * 'single-brace' uses {name} interpolation. 
   * 'double-brace' (default) uses {{name}} interpolation.
   */
  interpolation?: 'single-brace' | 'double-brace'
  /** The default locale. Must be a key in localMessages. */
  defaultLanguage: string
}) {
  type CombinedKey = DotPaths<LocalDict> | CommonDictKey

  const mergedDicts: Record<string, any> = {}
  for (const lang of Object.keys(config.localMessages)) {
    const local = config.localMessages[lang]
    // Default to English common if the language isn't nb/no
    const common = lang === 'nb' || lang === 'no' ? commonNb : commonEn
    mergedDicts[lang] = { ...flattenMessages(common), ...flattenMessages(local as Messages) }
  }

  const typed = createTypedI18n<CombinedKey>()

  const LanguageProvider = ({ 
    children, 
    ...providerProps 
  }: Omit<I18nProviderProps, 'messages' | 'defaultLocale' | 'resolve'>) => {
    return (
      <I18nProvider
        messages={mergedDicts}
        defaultLocale={config.defaultLanguage}
        resolve={(loc, key, params) => {
          const dict = mergedDicts[loc]
          const template = dict?.[key]
          if (template === undefined) return undefined
          
          if (params === undefined) return template
          
          if (config.interpolation === 'single-brace') {
            return template.replace(/\{([\w.]+)\}/g, (match: string, name: string) => {
              const value = params[name]
              return value === undefined ? match : String(value)
            })
          }
          // Default to double-brace interpolation (foundation standard)
          return interpolate(template, params)
        }}
        {...providerProps}
      >
        {children}
      </I18nProvider>
    )
  }

  return {
    ...typed,
    LanguageProvider,
  }
}
