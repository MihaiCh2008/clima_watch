import { safeAqi } from '../constants/aqi'
import type { ForecastHour, UserProfile } from '../types/airQuality'

const HOUR_MS = 3_600_000

export interface HourWindow {
  start: number
  length: number
  avgPm: number
}

export function isSensitive(profile: UserProfile): boolean {
  return profile.hasRespiratoryIssue || profile.hasYoungChild
}

/** Sensitive profiles (asthma, young child) get flagged one AQI step earlier than everyone else. */
export function adjustedLevel(aqi: number, profile: UserProfile): 1 | 2 | 3 | 4 | 5 {
  const base = safeAqi(aqi)
  return safeAqi(isSensitive(profile) ? Math.min(5, base + 1) : base)
}

/** The next `count` hours starting with the hour that contains `nowMs`. */
export function upcomingHours(hours: ForecastHour[], nowMs: number, count = 24): ForecastHour[] {
  const start = hours.findIndex((h) => h.dt * 1000 + HOUR_MS > nowMs)
  return start === -1 ? [] : hours.slice(start, start + count)
}

function windows(hours: ForecastHour[], length: number): HourWindow[] {
  if (length < 1 || hours.length < length) return []
  const out: HourWindow[] = []
  for (let start = 0; start + length <= hours.length; start++) {
    const slice = hours.slice(start, start + length)
    out.push({ start, length, avgPm: slice.reduce((sum, h) => sum + h.pm2_5, 0) / length })
  }
  return out
}

/** The contiguous window with the lowest average PM2.5 (earliest wins a tie), or null if there's not enough data. */
export function bestWindow(hours: ForecastHour[], length: number): HourWindow | null {
  return windows(hours, length).reduce<HourWindow | null>((best, w) => (!best || w.avgPm < best.avgPm ? w : best), null)
}

/** The contiguous window with the highest average PM2.5 (earliest wins a tie), or null if there's not enough data. */
export function worstWindow(hours: ForecastHour[], length: number): HourWindow | null {
  return windows(hours, length).reduce<HourWindow | null>((worst, w) => (!worst || w.avgPm > worst.avgPm ? w : worst), null)
}
