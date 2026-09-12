import { createContext, useContext, useState, type ReactNode } from 'react'
import { translations, type Lang, type Translation } from './translations'

interface LanguageContextValue {
  lang: Lang
  setLang: (lang: Lang) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextValue | null>(null)
const STORAGE_KEY = 'airwatch-lang'

function loadLang(): Lang {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'ro' || saved === 'en' || saved === 'ru') return saved
  } catch {
    // localStorage indisponibil — pornim cu limba implicită
  }
  return 'ro'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(loadLang)

  function setLang(next: Lang) {
    setLangState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // ignorăm — preferința rămâne doar pentru sesiunea curentă
    }
  }

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider')
  return ctx
}
