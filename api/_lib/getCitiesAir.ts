export interface GlobeCitySeed {
  name: string
  query: string
  lat: number
  lon: number
}

export interface GlobeCity extends GlobeCitySeed {
  aqi: number
  pm2_5: number
}

export type CitiesOutcome =
  | { status: 200; body: { cities: GlobeCity[] } }
  | { status: 500; body: { error: string } }

interface AirPollutionResponse {
  list?: Array<{ main: { aqi: number }; components: { pm2_5: number } }>
}

/** Fixed list so the endpoint costs a known number of upstream calls, and the CDN can cache the result. */
export const GLOBE_CITIES: GlobeCitySeed[] = [
  { name: 'Bucharest', query: 'Bucharest,RO', lat: 44.4268, lon: 26.1025 },
  { name: 'Chisinau', query: 'Chisinau,MD', lat: 47.0105, lon: 28.8638 },
  { name: 'London', query: 'London,GB', lat: 51.5074, lon: -0.1278 },
  { name: 'Paris', query: 'Paris,FR', lat: 48.8566, lon: 2.3522 },
  { name: 'Berlin', query: 'Berlin,DE', lat: 52.52, lon: 13.405 },
  { name: 'Madrid', query: 'Madrid,ES', lat: 40.4168, lon: -3.7038 },
  { name: 'Rome', query: 'Rome,IT', lat: 41.9028, lon: 12.4964 },
  { name: 'Moscow', query: 'Moscow,RU', lat: 55.7558, lon: 37.6173 },
  { name: 'Istanbul', query: 'Istanbul,TR', lat: 41.0082, lon: 28.9784 },
  { name: 'Cairo', query: 'Cairo,EG', lat: 30.0444, lon: 31.2357 },
  { name: 'Lagos', query: 'Lagos,NG', lat: 6.5244, lon: 3.3792 },
  { name: 'Nairobi', query: 'Nairobi,KE', lat: -1.2921, lon: 36.8219 },
  { name: 'Johannesburg', query: 'Johannesburg,ZA', lat: -26.2041, lon: 28.0473 },
  { name: 'Dubai', query: 'Dubai,AE', lat: 25.2048, lon: 55.2708 },
  { name: 'Delhi', query: 'Delhi,IN', lat: 28.6139, lon: 77.209 },
  { name: 'Beijing', query: 'Beijing,CN', lat: 39.9042, lon: 116.4074 },
  { name: 'Tokyo', query: 'Tokyo,JP', lat: 35.6762, lon: 139.6503 },
  { name: 'Seoul', query: 'Seoul,KR', lat: 37.5665, lon: 126.978 },
  { name: 'Bangkok', query: 'Bangkok,TH', lat: 13.7563, lon: 100.5018 },
  { name: 'Jakarta', query: 'Jakarta,ID', lat: -6.2088, lon: 106.8456 },
  { name: 'Sydney', query: 'Sydney,AU', lat: -33.8688, lon: 151.2093 },
  { name: 'New York', query: 'New York,US', lat: 40.7128, lon: -74.006 },
  { name: 'Los Angeles', query: 'Los Angeles,US', lat: 34.0522, lon: -118.2437 },
  { name: 'Mexico City', query: 'Mexico City,MX', lat: 19.4326, lon: -99.1332 },
  { name: 'Lima', query: 'Lima,PE', lat: -12.0464, lon: -77.0428 },
  { name: 'Sao Paulo', query: 'Sao Paulo,BR', lat: -23.5505, lon: -46.6333 },
]

/** Current air quality for a fixed set of world cities, fetched in parallel; cities that fail are skipped. */
export async function getCitiesAir(
  apiKey: string | undefined,
  seeds: GlobeCitySeed[] = GLOBE_CITIES
): Promise<CitiesOutcome> {
  if (!apiKey) {
    return { status: 500, body: { error: 'Server misconfigured: missing WEATHER_API_KEY' } }
  }

  const results = await Promise.allSettled(
    seeds.map(async (seed): Promise<GlobeCity> => {
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${seed.lat}&lon=${seed.lon}&appid=${apiKey}`
      )
      const data = (await res.json()) as AirPollutionResponse
      const entry = data?.list?.[0]
      if (!entry) throw new Error(`No air pollution data for ${seed.name}`)
      return { ...seed, aqi: entry.main.aqi, pm2_5: entry.components.pm2_5 }
    })
  )

  const cities = results.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))
  if (cities.length === 0) {
    return { status: 500, body: { error: 'Upstream air pollution data unavailable' } }
  }
  return { status: 200, body: { cities } }
}
