import { useLanguage } from '../i18n/LanguageContext'

const PARIS_AGREEMENT_DATE = new Date('2015-12-12T00:00:00Z')

function yearsSince(date: Date): string {
  const years = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24 * 365.25)
  return years.toFixed(1)
}

interface ChipProps {
  value: string
  label: string
  source?: string
}

function Chip({ value, label, source }: ChipProps) {
  return (
    <div className="glass-card rounded-xl p-4 text-center flex-1 min-w-[140px]">
      <p className="text-2xl font-extrabold heading-font text-sky-300">{value}</p>
      <p className="text-slate-300 text-xs mt-1">{label}</p>
      {source && <p className="text-slate-500 text-[10px] mt-1">{source}</p>}
    </div>
  )
}

/** Context climatic global — distinct de checker-ul local de aer de mai jos. */
export function GlobalClimateStrip() {
  const { t } = useLanguage()

  return (
    <div className="mb-8">
      <h2 className="text-sm font-bold heading-font text-slate-400 uppercase tracking-wide mb-3">
        {t.home.globalContextTitle}
      </h2>
      <div className="flex flex-wrap gap-3">
        <Chip value="430 ppm" label={t.home.co2Label} source={t.home.co2Source} />
        <Chip value="+1.55°C" label={t.home.tempLabel} source={t.home.tempSource} />
        <Chip value={yearsSince(PARIS_AGREEMENT_DATE)} label={t.home.parisLabel} />
      </div>
    </div>
  )
}
