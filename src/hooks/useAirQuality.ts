import { useState } from 'react'
import type { AirQualityData, HistoryPoint, UserProfile } from '../types/airQuality'
import type { Translation } from '../i18n/translations'
import { generateMockHistory } from '../utils/mockHistory'
import { getRecommendation } from '../utils/recommendations'
import { notifyBadAir } from '../utils/notifications'

interface AirQualityResponse {
  cityName: string
  aqi: number
  components: AirQualityData['components']
}

export function useAirQuality(profile: UserProfile, t: Translation) {
  const [city, setCity] = useState('')
  const [data, setData] = useState<AirQualityData | null>(null)
  const [history, setHistory] = useState<HistoryPoint[]>([])
  const [cityName, setCityName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function search() {
    if (!city.trim()) return
    setLoading(true)
    setError('')
    setData(null)

    try {
      // Cerere către propriul backend (funcție serverless local/Vercel) — cheia
      // OpenWeatherMap nu mai există deloc în codul trimis către browser.
      const res = await fetch(`/api/air-quality?city=${encodeURIComponent(city)}`)

      if (res.status === 404) {
        setError(t.home.errorNotFound)
        return
      }
      if (!res.ok) {
        setError(t.home.errorGeneric)
        return
      }

      const body: AirQualityResponse = await res.json()
      setCityName(body.cityName)
      setData({ aqi: body.aqi, components: body.components })
      setHistory(generateMockHistory(body.aqi, t.home.days))

      // Alertă proactivă: dacă aerul e problematic pentru profilul utilizatorului,
      // trimitem o notificare de browser — nu doar afișăm un status pasiv.
      if (body.aqi >= 3) {
        const rec = getRecommendation(body.aqi, profile, t)
        if (rec.level !== 'ok') {
          notifyBadAir(body.cityName, rec.message)
        }
      }
    } catch {
      setError(t.home.errorGeneric)
    } finally {
      setLoading(false)
    }
  }

  return { city, setCity, data, history, cityName, loading, error, search }
}
