export interface GeoEntry {
  lat: number
  lon: number
  name: string
}

/** Resolves a city name (optionally "City,CC" with an ISO country code) to coordinates, or null if nothing matches. */
export async function geocodeCity(city: string, apiKey: string): Promise<GeoEntry | null> {
  const res = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
  )
  const data = (await res.json()) as GeoEntry[]
  if (!Array.isArray(data) || data.length === 0) return null
  return data[0]
}
