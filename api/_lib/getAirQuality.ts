export interface AirQualityResult {
  cityName: string
  aqi: number
  components: {
    pm2_5: number
    pm10: number
    co: number
    no2: number
    o3: number
  }
}

export type ApiOutcome =
  | { status: 200; body: AirQualityResult }
  | { status: 400 | 404 | 500; body: { error: string } }

interface GeoEntry {
  lat: number
  lon: number
  name: string
}

interface AirPollutionResponse {
  list: Array<{
    main: { aqi: number }
    components: AirQualityResult['components']
  }>
}

/**
 * Backend logic: geocodes the city, then requests air quality from OpenWeatherMap.
 * The API key lives only here, server-side — it never reaches the code shipped to the browser.
 * Used by both the serverless function (api/air-quality.ts) and the local dev
 * middleware (vite-plugins/localApi.ts), so the two behave identically.
 */
export async function getAirQuality(city: string | null, apiKey: string | undefined): Promise<ApiOutcome> {
  if (!city || !city.trim()) {
    return { status: 400, body: { error: 'Missing "city" parameter' } }
  }
  if (!apiKey) {
    return { status: 500, body: { error: 'Server misconfigured: missing WEATHER_API_KEY' } }
  }

  const geoRes = await fetch(
    `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${apiKey}`
  )
  const geoData = (await geoRes.json()) as GeoEntry[]
  if (!Array.isArray(geoData) || geoData.length === 0) {
    return { status: 404, body: { error: 'City not found' } }
  }

  const { lat, lon, name } = geoData[0]
  const airRes = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`
  )
  const airData = (await airRes.json()) as AirPollutionResponse
  const entry = airData?.list?.[0]
  if (!entry) {
    return { status: 500, body: { error: 'Upstream air pollution data unavailable' } }
  }

  return {
    status: 200,
    body: {
      cityName: name,
      aqi: entry.main.aqi,
      components: entry.components,
    },
  }
}
