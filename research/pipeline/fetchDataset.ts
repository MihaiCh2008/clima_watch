/**
 * Builds the hourly benchmark dataset for each city:
 *   ground truth  Sensor.Community daily archive (low-cost PM sensors, median across the city's sensors)
 *   gridded model OpenWeatherMap air_pollution/history (needs WEATHER_API_KEY in .env, never logged)
 *   weather       Open-Meteo ERA5 archive (no key)
 *
 *   node research/pipeline/fetchDataset.ts          (Node 24+, runs TypeScript natively)
 *
 * Raw sensor files are cached in research/data/raw/ (git-ignored); the merged hourly CSV and the
 * sensor list are written to research/data/ and committed so the benchmark can be re-run offline.
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { CITIES, PERIOD, type CityConfig } from '../config.ts'
import { writeDataset, type HourRow } from './dataset.ts'
import { cityMedian, discoverSensors, hourlyMeans, loadSensorReadings } from './sensors.ts'
import { fetchRetry, sleep } from './util.ts'

const DATA_DIR = fileURLToPath(new URL('../data/', import.meta.url))

interface OwmEntry {
  dt: number
  main: { aqi: number }
  components: { co: number; no: number; no2: number; o3: number; so2: number; pm2_5: number; pm10: number; nh3: number }
}

/** OpenWeatherMap history, fetched month by month to stay well inside any response-size limit. */
async function fetchOwm(city: CityConfig, apiKey: string): Promise<Map<number, OwmEntry>> {
  const out = new Map<number, OwmEntry>()
  const startMs = Date.parse(`${PERIOD.start}T00:00:00Z`)
  const endMs = Date.parse(`${PERIOD.end}T23:59:59Z`)
  for (let from = startMs; from < endMs; from += 30 * 86_400_000) {
    const to = Math.min(from + 30 * 86_400_000, endMs)
    const url = `https://api.openweathermap.org/data/2.5/air_pollution/history?lat=${city.lat}&lon=${city.lon}&start=${from / 1000}&end=${to / 1000}&appid=${apiKey}`
    const res = await fetchRetry(url)
    if (!res.ok) throw new Error(`OpenWeatherMap history failed with HTTP ${res.status}`)
    const data = (await res.json()) as { list?: OwmEntry[] }
    for (const entry of data.list ?? []) out.set(entry.dt, entry)
    await sleep(1200) // stay far below the free tier's 60 calls/minute
  }
  return out
}

interface MeteoHourly {
  time: string[]
  temperature_2m: number[]
  relative_humidity_2m: number[]
  wind_speed_10m: number[]
  wind_direction_10m: number[]
  surface_pressure: number[]
  precipitation: number[]
  boundary_layer_height: number[]
}

async function fetchMeteo(city: CityConfig): Promise<Map<number, MeteoHourly & { i: number }>> {
  const vars = 'temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,surface_pressure,precipitation,boundary_layer_height'
  const url = `https://archive-api.open-meteo.com/v1/archive?latitude=${city.lat}&longitude=${city.lon}&start_date=${PERIOD.start}&end_date=${PERIOD.end}&hourly=${vars}&wind_speed_unit=ms&timezone=UTC`
  const res = await fetchRetry(url)
  if (!res.ok) throw new Error(`Open-Meteo archive failed with HTTP ${res.status}`)
  const { hourly } = (await res.json()) as { hourly: MeteoHourly }
  const out = new Map<number, MeteoHourly & { i: number }>()
  hourly.time.forEach((iso, i) => out.set(Date.parse(`${iso}:00Z`) / 1000, { ...hourly, i }))
  return out
}

async function buildCity(city: CityConfig, apiKey: string) {
  console.log(`\n== ${city.name}`)
  const sensors = await discoverSensors(city)
  console.log(`sensors: ${sensors.map((s) => `${s.id} (${s.type}, ${s.distanceKm.toFixed(1)} km)`).join(', ')}`)

  const perSensor = []
  const sensorSummary = []
  for (const sensor of sensors) {
    const { readings, daysWithData } = await loadSensorReadings(sensor, PERIOD.start, PERIOD.end, `${DATA_DIR}raw`)
    const hourly = hourlyMeans(readings)
    console.log(`  sensor ${sensor.id}: ${daysWithData} days with data, ${hourly.size} valid hours`)
    perSensor.push(hourly)
    sensorSummary.push({ ...sensor, distanceKm: Number(sensor.distanceKm.toFixed(2)), daysWithData, validHours: hourly.size })
  }
  const truth = cityMedian(perSensor, city.minSensors)

  const [owm, meteo] = await Promise.all([fetchOwm(city, apiKey), fetchMeteo(city)])

  const rows: HourRow[] = []
  for (const [ts, m] of meteo) {
    const o = owm.get(ts)
    if (!o) continue
    const t = truth.get(ts)
    rows.push({
      ts,
      obsPm25: t ? Number(t.pm25.toFixed(2)) : null,
      obsPm10: t ? Number(t.pm10.toFixed(2)) : null,
      sensors: t?.sensors ?? 0,
      owmAqi: o.main.aqi,
      owmCo: o.components.co,
      owmNo: o.components.no,
      owmNo2: o.components.no2,
      owmO3: o.components.o3,
      owmSo2: o.components.so2,
      owmPm25: o.components.pm2_5,
      owmPm10: o.components.pm10,
      owmNh3: o.components.nh3,
      temp: m.temperature_2m[m.i],
      rh: m.relative_humidity_2m[m.i],
      wind: m.wind_speed_10m[m.i],
      windDir: m.wind_direction_10m[m.i],
      pressure: m.surface_pressure[m.i],
      precip: m.precipitation[m.i],
      blh: m.boundary_layer_height[m.i],
    })
  }
  rows.sort((a, b) => a.ts - b.ts)

  // Open-Meteo returns null for the last hours it doesn't have yet; drop incomplete rows.
  const complete = rows.filter((r) => Object.entries(r).every(([key, v]) => (v === null ? key.startsWith('obs') : Number.isFinite(v))))
  const withTruth = complete.filter((r) => r.obsPm25 !== null)
  console.log(`rows: ${complete.length} hours, ${withTruth.length} with ground truth (${((100 * withTruth.length) / complete.length).toFixed(1)}%)`)

  await writeDataset(`${DATA_DIR}dataset-${city.id}.csv`, complete)
  await writeFile(
    `${DATA_DIR}sensors-${city.id}.json`,
    `${JSON.stringify({ city: city.name, center: { lat: city.lat, lon: city.lon }, period: PERIOD, minSensors: city.minSensors, sensors: sensorSummary }, null, 2)}\n`
  )
}

try {
  process.loadEnvFile(new URL('../../.env', import.meta.url))
} catch {
  // no .env file: fall through to the environment variable check below
}
const apiKey = process.env.WEATHER_API_KEY
if (!apiKey) throw new Error('WEATHER_API_KEY is missing (put it in .env at the project root)')

for (const city of CITIES) await buildCity(city, apiKey)
console.log('\ndone')
