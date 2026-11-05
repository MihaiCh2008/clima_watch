export interface CityConfig {
  /** File-safe id. */
  id: string
  name: string
  lat: number
  lon: number
  /** Sensors considered "in the city": within this radius of the center, km. */
  radiusKm: number
  /** Cap on downloaded sensors (nearest to the center first), to bound the download. */
  maxSensors: number
  /** An hour only counts as ground truth if at least this many sensors reported it. */
  minSensors: number
}

export const CITIES: CityConfig[] = [
  { id: 'chisinau', name: 'Chișinău', lat: 47.0105, lon: 28.8638, radiusKm: 12, maxSensors: 8, minSensors: 2 },
  { id: 'bucharest', name: 'București', lat: 44.4268, lon: 26.1025, radiusKm: 12, maxSensors: 10, minSensors: 3 },
]

/** Inclusive UTC date range. The Sensor.Community daily archive starts on 2026-01-01; ERA5 lags real time by ~5 days. */
export const PERIOD = { start: '2026-01-01', end: '2026-10-31' }
