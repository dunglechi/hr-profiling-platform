import i18n from 'i18next';
import viTranslations from './locales/vi.json';
import enTranslations from './locales/en.json';

const resources = {
  vi: {
    translation: viTranslations,
  },
  en: {
    translation: enTranslations,
  },
};

i18n.init({
  resources,
  lng: 'vi', // default language
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false, // not needed for server side
  },
});

// Export function to change language
export const setLanguage = async (lng: string) => {
  await i18n.changeLanguage(lng);
};

export default i18n;