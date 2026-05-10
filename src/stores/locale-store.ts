import i18next from 'i18next';
import { create } from 'zustand';

export type AppLocale = 'ur' | 'en';

interface LocaleState {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: 'ur',
  setLocale: (locale) => {
    i18next.changeLanguage(locale).catch(() => undefined);
    set({ locale });
  },
}));

