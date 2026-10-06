import { getAqiColor, safeAqi } from '../constants/aqi'
import type { HistoryPoint } from '../types/airQuality'
import { useLanguage } from '../i18n/LanguageContext'

export function HistoryChart({ history }: { history: HistoryPoint[] }) {
  const { t } = useLanguage()
  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <h3 className="text-lg font-extrabold heading-font text-[var(--text)] mb-4">{t.home.historyTitle}</h3>
      <div className="flex items-end justify-between gap-2 h-32">
        {history.map((point, i) => {
          const level = safeAqi(point.aqi)
          const visual = getAqiColor(level)
          const heightPercent = 20 + level * 16 // visible minimum + clear variation
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full">
              <div className="flex-1 flex items-end w-full">
                <div
                  className={`w-full ${visual.barColor} rounded-t transition-all hover:brightness-110 shadow-[0_0_10px_-2px_rgba(255,255,255,0.2)]`}
                  style={{ height: `${heightPercent}%` }}
                ></div>
              </div>
              <span className="text-[10px] sm:text-xs label-mono text-[var(--text-soft)] text-center">{point.day}</span>
            </div>
          )
        })}
      </div>
      <p className="text-[var(--text-soft)] text-xs mt-3 italic">{t.home.historyNote}</p>
    </div>
  )
}
