import { useEffect } from 'react'
import { SearchBar } from '../components/SearchBar'
import { LoadingSkeleton } from '../components/LoadingSkeleton'
import { ErrorBanner } from '../components/ErrorBanner'
import { AqiCard } from '../components/AqiCard'
import { RecommendationBanner } from '../components/RecommendationBanner'
import { PollutantsGrid } from '../components/PollutantsGrid'
import { HistoryChart } from '../components/HistoryChart'
import { SideNote } from '../components/SideNote'
import { GlobalClimateStrip } from '../components/GlobalClimateStrip'
import { useAirQuality } from '../hooks/useAirQuality'
import { useProfile } from '../hooks/useProfile'
import { useLanguage } from '../i18n/LanguageContext'
import { getRecommendation } from '../utils/recommendations'
import { requestNotificationPermission } from '../utils/notifications'

export function HomePage() {
  const { t } = useLanguage()
  const { profile } = useProfile()
  const { city, setCity, data, history, cityName, loading, error, search } = useAirQuality(profile, t)

  useEffect(() => {
    requestNotificationPermission()
  }, [])

  return (
    <div>
      <div className="max-w-2xl mx-auto relative">
        <SideNote
          n={1}
          text={t.home.sideNote1}
          source={t.home.sideNote1Source}
          wrapperClassName="top-10 right-full mr-10"
        />
        <SideNote n={2} text={t.home.sideNote2} wrapperClassName="top-96 left-full ml-10" accent="bg-teal-400/70" />

        <p className="text-slate-400 text-center mb-8 text-base sm:text-lg heading-font">{t.home.subtitle}</p>

        <GlobalClimateStrip />

        <h2 className="text-sm font-bold heading-font text-slate-400 uppercase tracking-wide mb-3">
          {t.home.localSignalTitle}
        </h2>

        <SearchBar city={city} onCityChange={setCity} onSearch={search} loading={loading} />

        {loading && <LoadingSkeleton />}
        {error && !loading && <ErrorBanner message={error} />}

        {data && !loading && (
          <div className="space-y-8 animate-[fadeIn_0.4s_ease-in]">
            <AqiCard aqi={data.aqi} cityName={cityName} />
            <RecommendationBanner recommendation={getRecommendation(data.aqi, profile, t)} />
            <PollutantsGrid components={data.components} />
            <HistoryChart history={history} />
          </div>
        )}
      </div>
    </div>
  )
}
