import { useEffect, useState } from 'react'
import { getAqiColor, safeAqi } from '../constants/aqi'
import { useLanguage } from '../i18n/LanguageContext'
import type { GlobeCity } from '../types/airQuality'
import { fetchCitiesAir } from '../utils/airApi'
import { AirGlobe } from './AirGlobe'

interface GlobeSectionProps {
  selectedQuery: string | null
  onSelect: (city: GlobeCity) => void
}

export default function GlobeSection({ selectedQuery, onSelect }: GlobeSectionProps) {
  const { t } = useLanguage()
  const [cities, setCities] = useState<GlobeCity[]>([])
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [hovered, setHovered] = useState<GlobeCity | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCitiesAir().then((result) => {
      if (cancelled) return
      if (result) {
        setCities(result)
        setStatus('ready')
      } else {
        setStatus('error')
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  const hoveredLevel = hovered ? safeAqi(hovered.aqi) : null

  let caption = t.globe.idle
  if (status === 'loading') caption = t.globe.loading
  else if (status === 'error') caption = t.globe.error
  else if (hovered && hoveredLevel) caption = `${hovered.name} — ${t.aqi[hoveredLevel].text} · PM2.5 ${hovered.pm2_5.toFixed(1)} μg/m³`

  return (
    <section className="mb-8">
      <h2 className="text-sm font-bold label-mono text-[var(--text-muted)] uppercase tracking-wide mb-3">{t.globe.title}</h2>
      <div className="rounded-2xl bg-[var(--bg-card)] p-4 sm:p-6">
        <p className="text-[var(--text-muted)] text-sm text-center mb-3">{t.globe.subtitle}</p>

        <AirGlobe cities={cities} selectedQuery={selectedQuery} ariaLabel={t.globe.ariaLabel} onHover={setHovered} onSelect={onSelect} />

        <p className="mt-3 flex min-h-[1.75rem] items-center justify-center gap-2 text-center text-sm font-semibold text-[var(--text)]" aria-live="polite">
          {hovered && hoveredLevel && (
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: getAqiColor(hoveredLevel).hex }} />
          )}
          {caption}
        </p>

        <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <li key={level} className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: getAqiColor(level).hex }} />
              {t.aqi[level].text}
            </li>
          ))}
        </ul>
        <p className="mt-2 text-center text-xs text-[var(--text-soft)]">{t.globe.hint}</p>

        <ul className="sr-only">
          {cities.map((city) => (
            <li key={city.query}>
              <button type="button" onClick={() => onSelect(city)}>
                {city.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
