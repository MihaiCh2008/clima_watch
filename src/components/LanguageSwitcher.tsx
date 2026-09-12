import { useLanguage } from '../i18n/LanguageContext'
import type { Lang } from '../i18n/translations'

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ro', label: 'RO' },
  { code: 'en', label: 'EN' },
  { code: 'ru', label: 'RUS' },
]

export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  return (
    <div className="flex gap-1 border border-white/10 rounded-lg p-1 bg-white/[0.03] shrink-0">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`px-2.5 py-1 rounded-md text-xs font-bold tracking-wide transition-colors ${
            lang === l.code ? 'bg-sky-500/25 text-sky-200' : 'text-slate-500 hover:text-white'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
