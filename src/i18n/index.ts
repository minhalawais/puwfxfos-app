import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ur from './locales/ur.json';

const BIDI_WRAPPER_NAME = 'bidi-wrapper';

i18n.use({
  type: 'postProcessor',
  name: BIDI_WRAPPER_NAME,
  process: (value: string) => {
    // Only apply BiDi wrapping when the active language is Urdu
    if (i18n.language?.startsWith('ur') && typeof value === 'string') {
      // React Native (CoreText/HarfBuzz) often ignores LRE/PDF embeddings.
      // The robust mobile fix is to prepend the Right-To-Left Mark (\u200F) to set the base direction,
      // then wrap English words with Left-To-Right Marks (\u200E) and trail them with another \u200F.
      const baseRtl = '\u200F' + value;
      return baseRtl.replace(/([A-Za-z0-9][A-Za-z0-9\s\.\-]*[A-Za-z0-9]|[A-Za-z0-9])/g, '\u200E$1\u200E\u200F');
    }
    return value;
  }
});

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: 'ur',
  fallbackLng: 'en',
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  postProcess: [BIDI_WRAPPER_NAME],
  interpolation: { escapeValue: false },
});

export default i18n;
