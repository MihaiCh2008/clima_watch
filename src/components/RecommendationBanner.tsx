import type { Recommendation } from '../utils/recommendations'
import { useLanguage } from '../i18n/LanguageContext'
import { NumberBadge } from './NumberBadge'

const STYLES: Record<Recommendation['level'], string> = {
  ok: 'bg-green-500/10 border-green-400/40 text-green-300',
  warning: 'bg-yellow-400/10 border-yellow-400/40 text-yellow-200',
  danger: 'bg-red-500/10 border-red-400/40 text-red-300 pulse-danger',
}

const NUMBERS: Record<Recommendation['level'], number> = {
  ok: 1,
  warning: 2,
  danger: 3,
}

export function RecommendationBanner({ recommendation }: { recommendation: Recommendation }) {
  const { t } = useLanguage()
  return (
    <div className={`border rounded-2xl p-5 flex gap-4 items-start backdrop-blur-md ${STYLES[recommendation.level]}`}>
      <NumberBadge n={NUMBERS[recommendation.level]} />
      <div>
        <p className="text-lg font-extrabold heading-font mb-1">{t.home.recommendationTitle}</p>
        <p className="text-sm opacity-90">{recommendation.message}</p>
      </div>
    </div>
  )
}
