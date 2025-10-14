import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import Backend from 'i18next-http-backend';

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: 'vi', // default language
    fallbackLng: 'vi',
    
    // Language detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
    },

    // Backend options
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: '/locales/add/{{lng}}/{{ns}}',
      crossDomain: false,
      withCredentials: false,
      requestOptions: {
        cache: 'default'
      }
    },

    // Namespaces
    ns: ['common', 'numerology', 'disc', 'mbti', 'dashboard'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // react already does escaping
      skipOnVariables: false,
    },

    react: {
      useSuspense: false,
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
      transEmptyNodeValue: '',
      transSupportBasicHtmlNodes: true,
      transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
    },

    // Debug configuration - enable for troubleshooting
    debug: process.env.NODE_ENV === 'development',

    // Load translations eagerly
    preload: ['vi', 'en'],

    // Save missing keys in development
    saveMissing: process.env.NODE_ENV === 'development',

    // Resources for development
    resources: {
      vi: {
        common: {
          loading: 'Đang tải...',
          error: 'Lỗi',
          success: 'Thành công',
        },
      },
      en: {
        common: {
          loading: 'Loading...',
          error: 'Error', 
          success: 'Success',
        },
      },
    },
  });

export default i18n;