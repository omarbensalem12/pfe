// i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import 'intl-pluralrules';
import enTranslation from './en.json';
import frTranslation from './fr.json';
import arTranslation from './ar.json';

const resources = {
  en: {
    translation: enTranslation,
  },
  ar: {
    translation: arTranslation,
  },
  fr: {
    translation: frTranslation,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en', 
    keySeparator: false, 
    interpolation: {
      escapeValue: false, 
    },
  });

export default i18n;
