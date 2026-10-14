import { useCallback, useEffect, useRef, useState } from 'react'
import type { ForecastHour } from '../types/airQuality'
import { fetchAirForecast } from '../utils/airApi'

const STORAGE_KEY = 'airwatch-home-city'

export type PlannerState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; reason: 'notFound' | 'generic' }
  | { status: 'ready'; cityName: string; hours: ForecastHour[] }

function loadCity(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? ''
  } catch {
    // localStorage unavailable — start empty
    return ''
  }
}

function saveCity(city: string) {
  try {
    localStorage.setItem(STORAGE_KEY, city)
  } catch {
    // ignore — the home city only lasts for this session
  }
}

/** Remembers the user's home city and loads its hourly forecast; reloads it automatically on the next visit. */
export function useDayPlanner() {
  const [initialCity] = useState(loadCity)
  const [city, setCity] = useState(initialCity)
  const [state, setState] = useState<PlannerState>(initialCity.trim() ? { status: 'loading' } : { status: 'idle' })
  const latestRequest = useRef(0)

  const load = useCallback(async (text: string) => {
    const requestId = ++latestRequest.current
    const result = await fetchAirForecast(text)
    if (requestId !== latestRequest.current) return
    setState(
      result.ok
        ? { status: 'ready', cityName: result.data.cityName, hours: result.data.hours }
        : { status: 'error', reason: result.reason }
    )
  }, [])

  function plan() {
    const text = city.trim()
    if (!text) return
    saveCity(text)
    setState({ status: 'loading' })
    void load(text)
  }

  useEffect(() => {
    if (initialCity.trim()) void load(initialCity.trim())
  }, [initialCity, load])

  return { city, setCity, state, plan }
}
