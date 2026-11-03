import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { en } from './en'
import { fr } from './fr'

export const LANGS = ['fr', 'en'] as const
export type Lang = (typeof LANGS)[number]
const STORAGE_KEY = 'wha.lang'

function initialLang(): Lang {
  const saved = globalThis.localStorage?.getItem(STORAGE_KEY)
  if (saved === 'fr' || saved === 'en') return saved
  return globalThis.navigator?.language?.startsWith('fr') === false
    ? 'en'
    : 'fr'
}

void i18n.use(initReactI18next).init({
  resources: { fr: { translation: fr }, en: { translation: en } },
  lng: initialLang(),
  fallbackLng: 'fr',
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  globalThis.localStorage?.setItem(STORAGE_KEY, lng)
  document.documentElement.lang = lng
})

export default i18n
