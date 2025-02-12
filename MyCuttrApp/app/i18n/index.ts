import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import fr from './locales/fr.json';
import nl from './locales/nl.json';
import storage from '../utils/storage'; // ensure this path is correct

export async function initI18n() {
  // First, try to get a stored language from secure storage.
  const storedLang = await storage.getLanguage();
  // If none is stored, fall back to the device’s primary language.
  const lang = storedLang || Localization.getLocales()[0].languageCode;

  await i18n
    .use(initReactI18next)
    .init({
      fallbackLng: 'en',
      lng: lang,
      resources: {
        en: { translation: en },
        fr: { translation: fr },
        nl: { translation: nl },
      },
      interpolation: {
        escapeValue: false,
      },
    });
  return i18n;
}

export default i18n;
