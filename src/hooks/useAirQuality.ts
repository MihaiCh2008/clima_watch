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
      // Request to our own backend (local/Vercel serverless function) — the
      // OpenWeatherMap key never exists at all in the code shipped to the browser.
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

      // Proactive alert: if the air is problematic for the user's profile,
      // we send a browser notification — not just a passive status display.
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
