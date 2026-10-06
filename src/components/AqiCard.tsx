import { getAqiColor, safeAqi } from '../constants/aqi'
import { useLanguage } from '../i18n/LanguageContext'

export function AqiCard({ aqi, cityName }: { aqi: number; cityName: string }) {
  const { t } = useLanguage()
  const level = safeAqi(aqi)
  const visual = getAqiColor(level)
  const entry = t.aqi[level]
  return (
    <div className={`${visual.color} rounded-2xl p-6 text-center transition-colors text-[var(--accent-ink)] ring-1 ring-black/10 shadow-xl shadow-black/15`}>
      <p className="text-lg opacity-90">{cityName}</p>
      <p className="text-4xl sm:text-5xl font-extrabold heading-font my-2">
        {entry.text}
      </p>
      <p className="opacity-90 text-sm sm:text-base">{entry.advice}</p>
    </div>
  )
}
