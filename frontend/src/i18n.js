import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import hi from './locales/hi.json';
import te from './locales/te.json';
import bn from './locales/bn.json';
import ta from './locales/ta.json';
import mr from './locales/mr.json';
import gu from './locales/gu.json';
import kn from './locales/kn.json';
import pa from './locales/pa.json';
import or from './locales/or.json';
import ml from './locales/ml.json';

const resources = {
    en: { translation: en },
    hi: { translation: hi },
    te: { translation: te }, // Telugu
    bn: { translation: bn }, // Bengali
    mr: { translation: mr }, // Marathi
    ta: { translation: ta }, // Tamil
    gu: { translation: gu }, // Gujarati
    kn: { translation: kn }, // Kannada
    pa: { translation: pa }, // Punjabi
    or: { translation: or }, // Odia
    ml: { translation: ml }, // Malayalam
};

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en';

i18n
    .use(initReactI18next)
    .init({
        resources,
        lng: savedLanguage, // Use saved language
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
