import { jsx as _jsx } from "react/jsx-runtime";
import { I18nProvider } from './I18nProvider';
import { createTypedI18n } from './createTypedI18n';
import { flattenMessages, interpolate } from './translate';
import commonEnUS from './locales/common-en-US.json';
import { SHELL_CATALOG, DEFAULT_SHELL_LOCALE } from './shellCatalog';
export function createProjectI18n(config) {
    const mergedDicts = {};
    for (const lang of Object.keys(config.localMessages)) {
        const local = config.localMessages[lang];
        // Layer the project catalog over the shell's bundled chrome catalog for this
        // locale (the project wins). A locale the shell doesn't ship falls back to the
        // default-locale chrome so `mrs.*` still resolves.
        const common = SHELL_CATALOG[lang] ?? SHELL_CATALOG[DEFAULT_SHELL_LOCALE];
        mergedDicts[lang] = { ...flattenMessages(common), ...flattenMessages(local) };
    }
    const typed = createTypedI18n();
    const LanguageProvider = ({ children, ...providerProps }) => {
        return (_jsx(I18nProvider, { messages: mergedDicts, defaultLocale: config.defaultLanguage, resolve: (loc, key, params) => {
                const dict = mergedDicts[loc];
                const template = dict?.[key];
                if (template === undefined)
                    return undefined;
                if (params === undefined)
                    return template;
                if (config.interpolation === 'single-brace') {
                    return template.replace(/\{([\w.]+)\}/g, (match, name) => {
                        const value = params[name];
                        return value === undefined ? match : String(value);
                    });
                }
                // Default to double-brace interpolation (foundation standard)
                return interpolate(template, params);
            }, ...providerProps, children: children }));
    };
    return {
        ...typed,
        LanguageProvider,
    };
}
