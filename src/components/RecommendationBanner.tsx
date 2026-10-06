import type { Recommendation } from '../utils/recommendations'
import { useLanguage } from '../i18n/LanguageContext'
import { NumberBadge } from './NumberBadge'

const STYLES: Record<Recommendation['level'], string> = {
  ok: 'bg-[#e3efe1] border-[#1f6f4a]/35 text-[#1f6f4a]',
  warning: 'bg-[#f6ead2] border-[#9c7a22]/40 text-[#7a5f1a]',
  danger: 'bg-[#f6dcd4] border-[#a8432a]/40 text-[#8c3a24] pulse-danger',
}

const NUMBERS: Record<Recommendation['level'], number> = {
  ok: 1,
  warning: 2,
  danger: 3,
}

export function RecommendationBanner({ recommendation }: { recommendation: Recommendation }) {
  const { t } = useLanguage()
  return (
    <div className={`border rounded-2xl p-5 flex gap-4 items-start ${STYLES[recommendation.level]}`}>
      <NumberBadge n={NUMBERS[recommendation.level]} />
      <div>
        <p className="text-lg font-extrabold heading-font mb-1">{t.home.recommendationTitle}</p>
        <p className="text-sm opacity-90">{recommendation.message}</p>
      </div>
    </div>
  )
}
