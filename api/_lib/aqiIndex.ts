/**
 * Continuous US EPA Air Quality Index (0-500), computed from pollutant
 * concentrations with the agency's piecewise-linear formula:
 *
 *   I = (I_hi - I_lo) / (C_hi - C_lo) * (C - C_lo) + I_lo
 *
 * Breakpoints: EPA, "Technical Assistance Document for the Reporting of Daily
 * Air Quality" (2024 revision: PM2.5 "Good" ends at 9.0 µg/m³).
 * OpenWeatherMap only returns a coarse 1-5 category; averaging those integers
 * (the previous approach) hides most of the variation inside a category, so
 * daily values are rebuilt from the continuous concentrations instead.
 */

export type AqiPollutant = 'pm2_5' | 'pm10' | 'no2' | 'o3'

interface Breakpoint {
  cLow: number
  cHigh: number
  iLow: number
  iHigh: number
}

const PM2_5: Breakpoint[] = [
  { cLow: 0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 325.4, iLow: 301, iHigh: 500 },
]

const PM10: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
]

/** NO2, 1-hour, ppb. */
const NO2: Breakpoint[] = [
  { cLow: 0, cHigh: 53, iLow: 0, iHigh: 50 },
  { cLow: 54, cHigh: 100, iLow: 51, iHigh: 100 },
  { cLow: 101, cHigh: 360, iLow: 101, iHigh: 150 },
  { cLow: 361, cHigh: 649, iLow: 151, iHigh: 200 },
  { cLow: 650, cHigh: 1249, iLow: 201, iHigh: 300 },
  { cLow: 1250, cHigh: 2049, iLow: 301, iHigh: 500 },
]

/** O3, 8-hour, ppm. Above 0.200 ppm EPA switches to the 1-hour table; the index is simply capped at 300 here. */
const O3: Breakpoint[] = [
  { cLow: 0, cHigh: 0.054, iLow: 0, iHigh: 50 },
  { cLow: 0.055, cHigh: 0.07, iLow: 51, iHigh: 100 },
  { cLow: 0.071, cHigh: 0.085, iLow: 101, iHigh: 150 },
  { cLow: 0.086, cHigh: 0.105, iLow: 151, iHigh: 200 },
  { cLow: 0.106, cHigh: 0.2, iLow: 201, iHigh: 300 },
]

/** µg/m³ → ppb at 25 °C and 1 atm (EPA convention): ppb = µg/m³ × 24.45 / molecular weight. */
const MOLAR_VOLUME = 24.45
const NO2_MOLECULAR_WEIGHT = 46.0055
const O3_MOLECULAR_WEIGHT = 47.9982

export const no2ToPpb = (ugm3: number) => (ugm3 * MOLAR_VOLUME) / NO2_MOLECULAR_WEIGHT
export const o3ToPpm = (ugm3: number) => (ugm3 * MOLAR_VOLUME) / O3_MOLECULAR_WEIGHT / 1000

function truncate(value: number, decimals: number): number {
  const factor = 10 ** decimals
  return Math.floor(value * factor + 1e-9) / factor
}

function subIndex(table: Breakpoint[], concentration: number): number {
  const top = table[table.length - 1]
  if (concentration >= top.cHigh) return top.iHigh
  const band = table.find((b) => concentration <= b.cHigh) ?? top
  const c = Math.max(concentration, band.cLow)
  return Math.round(((band.iHigh - band.iLow) / (band.cHigh - band.cLow)) * (c - band.cLow) + band.iLow)
}

/** Sub-index of one pollutant. PM2.5/PM10 use 24 h means, NO2 a 1 h value (µg/m³ in), O3 an 8 h mean (µg/m³ in). */
export function pollutantIndex(pollutant: AqiPollutant, ugm3: number): number {
  if (!Number.isFinite(ugm3) || ugm3 < 0) return 0
  switch (pollutant) {
    case 'pm2_5':
      return subIndex(PM2_5, truncate(ugm3, 1))
    case 'pm10':
      return subIndex(PM10, truncate(ugm3, 0))
    case 'no2':
      return subIndex(NO2, truncate(no2ToPpb(ugm3), 0))
    case 'o3':
      return subIndex(O3, truncate(o3ToPpm(ugm3), 3))
  }
}

/** EPA AQI value → the app's 1-5 scale (Good, Moderate, Unhealthy for sensitive groups, Unhealthy, Very unhealthy+). */
export function aqiLevel(index: number): 1 | 2 | 3 | 4 | 5 {
  if (index <= 50) return 1
  if (index <= 100) return 2
  if (index <= 150) return 3
  if (index <= 200) return 4
  return 5
}

export interface HourlyComponents {
  dt: number
  pm2_5?: number
  pm10?: number
  no2?: number
  o3?: number
}

const EIGHT_HOURS = 8 * 3600
const MIN_HOURS_IN_8H_WINDOW = 6

function mean(values: number[]): number {
  return values.reduce((a, b) => a + b, 0) / values.length
}

/** Highest running 8-hour mean (needs at least 6 readings in the window, as in the EPA completeness rule). */
export function maxRolling8hMean(entries: Array<{ dt: number; value: number }>): number | null {
  let best: number | null = null
  for (const end of entries) {
    const window = entries.filter((e) => e.dt <= end.dt && e.dt > end.dt - EIGHT_HOURS)
    if (window.length < MIN_HOURS_IN_8H_WINDOW) continue
    const avg = mean(window.map((e) => e.value))
    if (best === null || avg > best) best = avg
  }
  return best
}

export interface DailyIndex {
  /** EPA AQI value, 0-500. */
  index: number
  /** The pollutant that sets the index. */
  dominant: AqiPollutant
}

function values(entries: HourlyComponents[], key: AqiPollutant): Array<{ dt: number; value: number }> {
  return entries
    .filter((e) => typeof e[key] === 'number' && Number.isFinite(e[key]))
    .map((e) => ({ dt: e.dt, value: e[key] as number }))
    .sort((a, b) => a.dt - b.dt)
}

/**
 * Daily AQI for one day of hourly readings: PM2.5 and PM10 from the 24 h mean,
 * NO2 from the highest hourly value, O3 from the highest 8 h mean; the
 * worst sub-index wins. Returns null if none of the four pollutants is present.
 */
export function dailyIndex(entries: HourlyComponents[]): DailyIndex | null {
  const candidates: Array<{ pollutant: AqiPollutant; index: number }> = []

  for (const key of ['pm2_5', 'pm10'] as const) {
    const v = values(entries, key)
    if (v.length > 0) candidates.push({ pollutant: key, index: pollutantIndex(key, mean(v.map((e) => e.value))) })
  }

  const no2 = values(entries, 'no2')
  if (no2.length > 0) candidates.push({ pollutant: 'no2', index: pollutantIndex('no2', Math.max(...no2.map((e) => e.value))) })

  const o3 = maxRolling8hMean(values(entries, 'o3'))
  if (o3 !== null) candidates.push({ pollutant: 'o3', index: pollutantIndex('o3', o3) })

  if (candidates.length === 0) return null
  const worst = candidates.reduce((a, b) => (b.index > a.index ? b : a))
  return { index: worst.index, dominant: worst.pollutant }
}
