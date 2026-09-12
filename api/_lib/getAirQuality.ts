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
 * Logica de backend: geocodifică orașul, apoi cere calitatea aerului la OpenWeatherMap.
 * Cheia API trăiește doar aici, pe server — nu ajunge niciodată în codul trimis către browser.
 * Folosită atât de funcția serverless (api/air-quality.ts), cât și de middleware-ul local
 * de dezvoltare (vite-plugins/localApi.ts), ca cele două să se comporte identic.
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
