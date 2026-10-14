export interface HistoryDay {
  date: string
  aqi: number
  pm2_5: number
}

export type HistoryOutcome =
  | { status: 200; body: { days: HistoryDay[] } }
  | { status: 400 | 500; body: { error: string } }

interface HourlyEntry {
  dt: number
  main: { aqi: number }
  components: { pm2_5: number }
}

interface HistoryResponse {
  list: HourlyEntry[]
}

const SECONDS_PER_DAY = 86_400

/** Groups hourly readings by UTC calendar day and averages AQI and PM2.5 for each day. */
export function aggregateDaily(list: HourlyEntry[]): HistoryDay[] {
  const buckets = new Map<string, { aqiSum: number; pmSum: number; count: number }>()

  for (const entry of list) {
    const date = new Date(entry.dt * 1000).toISOString().slice(0, 10)
    const bucket = buckets.get(date) ?? { aqiSum: 0, pmSum: 0, count: 0 }
    bucket.aqiSum += entry.main.aqi
    bucket.pmSum += entry.components.pm2_5
    bucket.count += 1
    buckets.set(date, bucket)
  }

  return [...buckets.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, b]) => ({
      date,
      aqi: Math.min(5, Math.max(1, Math.round(b.aqiSum / b.count))),
      pm2_5: Math.round((b.pmSum / b.count) * 10) / 10,
    }))
}

function parseCoordinate(raw: string | null, limit: number): number | null {
  if (raw === null || raw.trim() === '') return null
  const value = Number(raw)
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : null
}

/**
 * Real hourly air-quality history for the last 7 days at a coordinate,
 * aggregated into daily averages. Same server-side-key rule as getAirQuality.
 */
export async function getAirHistory(
  latParam: string | null,
  lonParam: string | null,
  apiKey: string | undefined,
  nowMs: number = Date.now()
): Promise<HistoryOutcome> {
  const lat = parseCoordinate(latParam, 90)
  const lon = parseCoordinate(lonParam, 180)
  if (lat === null || lon === null) {
    return { status: 400, body: { error: 'Missing or invalid "lat"/"lon" parameter' } }
  }
  if (!apiKey) {
    return { status: 500, body: { error: 'Server misconfigured: missing WEATHER_API_KEY' } }
  }

  const end = Math.floor(nowMs / 1000)
  const start = end - 7 * SECONDS_PER_DAY
  const res = await fetch(
    `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${lat}&lon=${lon}&start=${start}&end=${end}&appid=${apiKey}`
  )
  const data = (await res.json()) as HistoryResponse
  if (!Array.isArray(data?.list) || data.list.length === 0) {
    return { status: 500, body: { error: 'Upstream air pollution history unavailable' } }
  }

  return { status: 200, body: { days: aggregateDaily(data.list).slice(-7) } }
}
