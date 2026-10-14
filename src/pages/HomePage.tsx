import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { SearchBar } from '../components/SearchBar'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorBanner } from '../components/ErrorBanner'
import { AqiCard } from '../components/AqiCard'
import { RecommendationBanner } from '../components/RecommendationBanner'
import { PollutantsGrid } from '../components/PollutantsGrid'
import { HistoryChart } from '../components/HistoryChart'
import { SideNote } from '../components/SideNote'
import { GlobalClimateStrip } from '../components/GlobalClimateStrip'
import { useAirMood } from '../context/airMood'
import { useAirQuality } from '../hooks/useAirQuality'
import { useProfile } from '../hooks/useProfile'
import { useLanguage } from '../i18n/LanguageContext'
import type { GlobeCity } from '../types/airQuality'
import { getRecommendation } from '../utils/recommendations'
import { requestNotificationPermission } from '../utils/notifications'

const GlobeSection = lazy(() => import('../components/GlobeSection'))

export function HomePage() {
  const { t } = useLanguage()
  const { profile } = useProfile()
  const { setMood } = useAirMood()
  const { city, setCity, data, history, historyStatus, cityName, loading, error, search } = useAirQuality(profile, t)
  const [globeQuery, setGlobeQuery] = useState<string | null>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  useEffect(() => {
    if (data) setMood({ aqi: data.aqi, pm2_5: data.components.pm2_5, city: cityName })
  }, [data, cityName, setMood])

  function handleGlobeSelect(selected: GlobeCity) {
    setGlobeQuery(selected.query)
    search(selected.query, selected.name)
    searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div>
      <div className="max-w-3xl mx-auto relative">
        <SideNote
          n={1}
          text={t.home.sideNote1}
          source={t.home.sideNote1Source}
          wrapperClassName="top-10 right-full mr-10"
        />
        <SideNote n={2} text={t.home.sideNote2} wrapperClassName="top-96 left-full ml-10" accent="bg-[var(--accent-2)]/70" />

        <p className="text-[var(--text-muted)] text-center mb-8 text-base sm:text-lg heading-font">{t.home.subtitle}</p>

        <GlobalClimateStrip />

        <Suspense fallback={<div className="mb-8 h-96 rounded-2xl skeleton-shimmer" />}>
          <GlobeSection selectedQuery={globeQuery} onSelect={handleGlobeSelect} />
        </Suspense>

        <div ref={searchRef} className="scroll-mt-4">
          <h2 className="text-sm font-bold label-mono text-[var(--text-muted)] uppercase tracking-wide mb-3">
            {t.home.localSignalTitle}
          </h2>

          <SearchBar city={city} onCityChange={setCity} onSearch={() => search()} loading={loading} />

          {loading && <LoadingSkeleton />}
          {error && !loading && <ErrorBanner message={error} />}

          {data && !loading && (
            <div className="space-y-8 animate-[fadeIn_0.4s_ease-in]">
              <AqiCard aqi={data.aqi} cityName={cityName} />
              <RecommendationBanner recommendation={getRecommendation(data.aqi, profile, t)} />
              <PollutantsGrid components={data.components} />
              <HistoryChart days={history} status={historyStatus} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
