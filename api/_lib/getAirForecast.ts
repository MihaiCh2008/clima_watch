import { geocodeCity } from './geocode.js'

export interface ForecastHour {
  dt: number
  aqi: number
  pm2_5: number
}

export type ForecastOutcome =
  | { status: 200; body: { cityName: string; hours: ForecastHour[] } }
  | { status: 400 | 404 | 500; body: { error: string } }

interface ForecastResponse {
  list?: Array<{ dt: number; main: { aqi: number }; components: { pm2_5: number } }>
}

/** Hourly entries we keep: enough to cover "the next 24 hours" from any point in the current hour. */
const MAX_HOURS = 48

/** Hourly air-quality forecast for a city. Same server-side-key rule as the other endpoints. */
export async function getAirForecast(city: string | null, apiKey: string | undefined): Promise<ForecastOutcome> {
  if (!city || !city.trim()) {
    return { status: 400, body: { error: 'Missing "city" parameter' } }
  }
  if (!apiKey) {
    return { status: 500, body: { error: 'Server misconfigured: missing WEATHER_API_KEY' } }
  }

  const geo = await geocodeCity(city, apiKey)
  if (!geo) {
    return { status: 404, body: { error: 'City not found' } }
  }

  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution/forecast?lat=${geo.lat}&lon=${geo.lon}&appid=${apiKey}`
  )
  const data = (await res.json()) as ForecastResponse
  if (!Array.isArray(data?.list) || data.list.length === 0) {
    return { status: 500, body: { error: 'Upstream air pollution forecast unavailable' } }
  }

  const hours = data.list.slice(0, MAX_HOURS).map((entry) => ({
    dt: entry.dt,
    aqi: entry.main.aqi,
    pm2_5: entry.components.pm2_5,
  }))
  return { status: 200, body: { cityName: geo.name, hours } }
}
