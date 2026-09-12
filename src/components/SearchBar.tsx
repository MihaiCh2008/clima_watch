import { useLanguage } from '../i18n/LanguageContext'

interface SearchBarProps {
  city: string
  onCityChange: (city: string) => void
  onSearch: () => void
  loading: boolean
}

export function SearchBar({ city, onCityChange, onSearch, loading }: SearchBarProps) {
  const { t } = useLanguage()
  return (
    <div className="flex gap-2 mb-8">
      <input
        type="text"
        value={city}
        onChange={(e) => onCityChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder={t.home.searchPlaceholder}
        className="flex-1 px-4 py-3 rounded-xl glass-card focus:outline-none focus:border-cyan-400/60 focus:shadow-[0_0_20px_rgba(34,211,238,0.3)] transition-all placeholder:text-slate-500"
      />
      <button
        onClick={onSearch}
        disabled={loading}
        className="px-6 py-3 rounded-xl glow-btn font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            {t.home.searching}
          </span>
        ) : (
          t.home.searchButton
        )}
      </button>
    </div>
  )
}
