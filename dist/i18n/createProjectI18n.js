import { jsx as _jsx } from "react/jsx-runtime";
import { I18nProvider } from './I18nProvider';
import { createTypedI18n } from './createTypedI18n';
import { flattenMessages, interpolate } from './translate';
import commonEn from './locales/common-en.json';
import commonNb from './locales/common-nb.json';
export function createProjectI18n(config) {
    const mergedDicts = {};
    for (const lang of Object.keys(config.localMessages)) {
        const local = config.localMessages[lang];
        // Default to English common if the language isn't nb/no
        const common = lang === 'nb' || lang === 'no' ? commonNb : commonEn;
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
