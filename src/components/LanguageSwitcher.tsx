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
    <div className="flex gap-1 border border-[var(--border)] rounded-lg p-1 bg-[var(--bg-card)] shrink-0">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          className={`px-2.5 py-1 rounded-md text-xs label-mono font-bold tracking-wide transition-colors ${
            lang === l.code ? 'bg-[var(--accent)] text-[var(--accent-ink)]' : 'text-[var(--text-soft)] hover:text-[var(--text)]'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
