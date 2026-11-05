import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import type { CityConfig } from '../config.ts'
import { eachDate, fetchRetry, haversineKm, mapPool, median } from './util.ts'

export interface SensorInfo {
  id: number
  type: string
  lat: number
  lon: number
  distanceKm: number
}

const PM_TYPES = new Set(['SDS011', 'SPS30', 'PMS5003', 'PMS7003', 'PMS1003', 'PMSx003', 'HPM', 'NextPM'])

interface LiveRow {
  sensor: { id: number; sensor_type: { name: string } }
  location: { latitude: string; longitude: string }
  sensordatavalues: Array<{ value_type: string }>
}

/** Active particulate sensors around a city, nearest first (a live snapshot from the Sensor.Community API). */
export async function discoverSensors(city: CityConfig): Promise<SensorInfo[]> {
  const res = await fetchRetry(`https://data.sensor.community/airrohr/v1/filter/area=${city.lat},${city.lon},${city.radiusKm}`)
  const rows = (await res.json()) as LiveRow[]
  const byId = new Map<number, SensorInfo>()
  for (const row of rows) {
    const type = row.sensor.sensor_type.name
    const reportsPm = row.sensordatavalues.some((v) => v.value_type === 'P2')
    if (!PM_TYPES.has(type) || !reportsPm) continue
    const lat = Number(row.location.latitude)
    const lon = Number(row.location.longitude)
    byId.set(row.sensor.id, { id: row.sensor.id, type, lat, lon, distanceKm: haversineKm(city.lat, city.lon, lat, lon) })
  }
  return [...byId.values()].sort((a, b) => a.distanceKm - b.distanceKm).slice(0, city.maxSensors)
}

/** One reading: UTC hour bucket (epoch seconds) → PM10 / PM2.5. */
export interface Reading {
  hour: number
  pm10: number
  pm25: number
}

/** Plausibility rules for low-cost optical particle counters (thresholds fixed in research/PREREGISTRATION.md, "Data"). */
export function isPlausible(pm10: number, pm25: number): boolean {
  if (!Number.isFinite(pm10) || !Number.isFinite(pm25)) return false
  if (pm25 < 0 || pm10 < 0 || pm25 > 500 || pm10 > 1000) return false
  // PM2.5 is a subset of PM10; allow a little instrument noise but reject clearly inverted pairs
  return pm25 <= pm10 * 1.2 + 2
}

/** Parses one archive CSV (semicolon-separated, header row) into plausible readings. Columns are looked up by name. */
export function parseSensorCsv(csv: string): Reading[] {
  const lines = csv.split('\n')
  const header = lines[0]?.trim().split(';') ?? []
  const iTime = header.indexOf('timestamp')
  const iPm10 = header.indexOf('P1')
  const iPm25 = header.indexOf('P2')
  if (iTime < 0 || iPm10 < 0 || iPm25 < 0) return []

  const out: Reading[] = []
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].trim().split(';')
    if (cells.length <= Math.max(iTime, iPm10, iPm25)) continue
    const ms = Date.parse(`${cells[iTime]}Z`)
    const pm10 = Number(cells[iPm10])
    const pm25 = Number(cells[iPm25])
    if (!Number.isFinite(ms) || !isPlausible(pm10, pm25)) continue
    out.push({ hour: Math.floor(ms / 3_600_000) * 3600, pm10, pm25 })
  }
  return out
}

/** An hourly mean needs at least this many readings (a sensor reports about every 2.5 min). */
const MIN_READINGS_PER_HOUR = 6

/** Hourly means of one sensor: hour (epoch s) → mean PM10 / PM2.5. */
export function hourlyMeans(readings: Reading[]): Map<number, { pm10: number; pm25: number }> {
  const buckets = new Map<number, Reading[]>()
  for (const r of readings) {
    const bucket = buckets.get(r.hour)
    if (bucket) bucket.push(r)
    else buckets.set(r.hour, [r])
  }
  const out = new Map<number, { pm10: number; pm25: number }>()
  for (const [hour, rs] of buckets) {
    if (rs.length < MIN_READINGS_PER_HOUR) continue
    out.set(hour, { pm10: rs.reduce((s, r) => s + r.pm10, 0) / rs.length, pm25: rs.reduce((s, r) => s + r.pm25, 0) / rs.length })
  }
  return out
}

export interface CityHour {
  pm25: number
  pm10: number
  sensors: number
}

/** City-wide ground truth: for each hour, the median across sensors, kept only if enough sensors reported. */
export function cityMedian(perSensor: Array<Map<number, { pm10: number; pm25: number }>>, minSensors: number): Map<number, CityHour> {
  const hours = new Set<number>()
  for (const m of perSensor) for (const h of m.keys()) hours.add(h)
  const out = new Map<number, CityHour>()
  for (const hour of hours) {
    const values = perSensor.map((m) => m.get(hour)).filter((v): v is { pm10: number; pm25: number } => v !== undefined)
    if (values.length < minSensors) continue
    out.set(hour, { pm25: median(values.map((v) => v.pm25)), pm10: median(values.map((v) => v.pm10)), sensors: values.length })
  }
  return out
}

/** Downloads (with an on-disk cache) every daily archive file of one sensor in the date range. An empty file = no data that day. */
export async function loadSensorReadings(sensor: SensorInfo, start: string, end: string, rawDir: string): Promise<{ readings: Reading[]; daysWithData: number }> {
  const dates = [...eachDate(start, end)]
  const perDay = await mapPool(dates, 6, async (date) => {
    const cachePath = `${rawDir}/${sensor.id}/${date}.csv`
    let csv: string
    try {
      csv = await readFile(cachePath, 'utf8')
    } catch {
      const url = `https://archive.sensor.community/${date}/${date}_${sensor.type.toLowerCase()}_sensor_${sensor.id}.csv`
      const res = await fetchRetry(url)
      csv = res.status === 200 ? await res.text() : ''
      await mkdir(dirname(cachePath), { recursive: true })
      await writeFile(cachePath, csv)
    }
    return csv ? parseSensorCsv(csv) : []
  })
  return { readings: perDay.flat(), daysWithData: perDay.filter((r) => r.length > 0).length }
}
