import { useRef, useState } from 'react'
import type { AirQualityData, HistoryDay, UserProfile } from '../types/airQuality'
import type { Translation } from '../i18n/translations'
import { fetchAirHistory, fetchAirQuality } from '../utils/airApi'
import { getRecommendation } from '../utils/recommendations'
import { notifyBadAir } from '../utils/notifications'

export type HistoryStatus = 'idle' | 'loading' | 'ready' | 'error'

export function useAirQuality(profile: UserProfile, t: Translation) {
  const [city, setCity] = useState('')
  const [data, setData] = useState<AirQualityData | null>(null)
  const [history, setHistory] = useState<HistoryDay[]>([])
  const [historyStatus, setHistoryStatus] = useState<HistoryStatus>('idle')
  const [cityName, setCityName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const latestRequest = useRef(0)

  /** `query` overrides the text field (e.g. "Lagos,NG" from the globe); `label` is what the field shows afterwards. */
  async function search(query?: string, label?: string) {
    const text = (query ?? city).trim()
    if (!text) return
    if (query !== undefined) setCity(label ?? query)

    const requestId = ++latestRequest.current
    setLoading(true)
    setError('')
    setData(null)
    setHistory([])
    setHistoryStatus('idle')

    const result = await fetchAirQuality(text)
    if (requestId !== latestRequest.current) return

    if (!result.ok) {
      setError(result.reason === 'notFound' ? t.home.errorNotFound : t.home.errorGeneric)
      setLoading(false)
      return
    }

    const body = result.data
    setCityName(body.cityName)
    setData({ aqi: body.aqi, components: body.components })
    setLoading(false)

    // Proactive alert: if the air is problematic for the user's profile,
    // we send a browser notification — not just a passive status display.
    if (body.aqi >= 3) {
      const rec = getRecommendation(body.aqi, profile, t)
      if (rec.level !== 'ok') {
        notifyBadAir(body.cityName, rec.message)
      }
    }

    setHistoryStatus('loading')
    const days = await fetchAirHistory(body.lat, body.lon)
    if (requestId !== latestRequest.current) return
    if (days) {
      setHistory(days)
      setHistoryStatus('ready')
    } else {
      setHistoryStatus('error')
    }
  }

  return { city, setCity, data, history, historyStatus, cityName, loading, error, search }
}
