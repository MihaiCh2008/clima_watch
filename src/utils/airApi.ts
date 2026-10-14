import type { CityAir, ForecastHour, GlobeCity, HistoryDay } from '../types/airQuality'

export type AirQualityResult = { ok: true; data: CityAir } | { ok: false; reason: 'notFound' | 'generic' }

/** Calls our own backend (never OpenWeatherMap directly) — the API key stays on the server. */
export async function fetchAirQuality(city: string): Promise<AirQualityResult> {
  try {
    const res = await fetch(`/api/air-quality?city=${encodeURIComponent(city)}`)
    if (res.status === 404) return { ok: false, reason: 'notFound' }
    if (!res.ok) return { ok: false, reason: 'generic' }
    return { ok: true, data: (await res.json()) as CityAir }
  } catch {
    return { ok: false, reason: 'generic' }
  }
}

/** Real daily history for a coordinate, or null if it can't be loaded. */
export async function fetchAirHistory(lat: number, lon: number): Promise<HistoryDay[] | null> {
  try {
    const res = await fetch(`/api/air-history?lat=${lat}&lon=${lon}`)
    if (!res.ok) return null
    const body = (await res.json()) as { days: HistoryDay[] }
    return body.days
  } catch {
    return null
  }
}

export type ForecastResult =
  | { ok: true; data: { cityName: string; hours: ForecastHour[] } }
  | { ok: false; reason: 'notFound' | 'generic' }

/** Hourly forecast for a city (the next ~48 hours). */
export async function fetchAirForecast(city: string): Promise<ForecastResult> {
  try {
    const res = await fetch(`/api/air-forecast?city=${encodeURIComponent(city)}`)
    if (res.status === 404) return { ok: false, reason: 'notFound' }
    if (!res.ok) return { ok: false, reason: 'generic' }
    return { ok: true, data: (await res.json()) as { cityName: string; hours: ForecastHour[] } }
  } catch {
    return { ok: false, reason: 'generic' }
  }
}

/** Live readings for the world cities shown on the globe, or null if they can't be loaded. */
export async function fetchCitiesAir(): Promise<GlobeCity[] | null> {
  try {
    const res = await fetch('/api/cities-air')
    if (!res.ok) return null
    const body = (await res.json()) as { cities: GlobeCity[] }
    return body.cities
  } catch {
    return null
  }
}
