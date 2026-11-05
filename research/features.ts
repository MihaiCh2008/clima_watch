import type { HourRow } from './pipeline/dataset.ts'

/** Inputs of the learned models: everything here is known at forecast time (no sensor observation is used). */
export const FEATURE_NAMES = [
  'owm_pm2_5',
  'owm_pm10',
  'log_owm_no2',
  'log_owm_o3',
  'log_owm_co',
  'log_owm_so2',
  'log_owm_nh3',
  'log_owm_no',
  'owm_pm2_5_mean24h',
  'temperature',
  'humidity',
  'wind_speed',
  'wind_dir_sin',
  'wind_dir_cos',
  'pressure',
  'log_precipitation',
  'log_boundary_layer',
  'hour_sin',
  'hour_cos',
  'weekend',
] as const

const HOUR = 3600
const DAY = 86_400

/** Feature matrix for a time-ordered hourly series (rows must be sorted by `ts`). */
export function buildFeatures(rows: HourRow[]): number[][] {
  // trailing 24 h mean of the grid's PM2.5 (the hour itself plus the 23 before it, whatever is present)
  const trailing: number[] = []
  let start = 0
  let sum = 0
  for (let i = 0; i < rows.length; i++) {
    sum += rows[i].owmPm25
    while (rows[start].ts <= rows[i].ts - DAY) {
      sum -= rows[start].owmPm25
      start++
    }
    trailing.push(sum / (i - start + 1))
  }

  return rows.map((r, i) => {
    const date = new Date(r.ts * 1000)
    const hour = date.getUTCHours()
    const weekday = date.getUTCDay()
    const dir = (r.windDir * Math.PI) / 180
    return [
      r.owmPm25,
      r.owmPm10,
      Math.log1p(r.owmNo2),
      Math.log1p(r.owmO3),
      Math.log1p(r.owmCo),
      Math.log1p(r.owmSo2),
      Math.log1p(r.owmNh3),
      Math.log1p(r.owmNo),
      trailing[i],
      r.temp,
      r.rh,
      r.wind,
      Math.sin(dir),
      Math.cos(dir),
      r.pressure,
      Math.log1p(r.precip),
      Math.log1p(r.blh),
      Math.sin((2 * Math.PI * hour) / 24),
      Math.cos((2 * Math.PI * hour) / 24),
      weekday === 0 || weekday === 6 ? 1 : 0,
    ]
  })
}

export const HOURS_PER_DAY = DAY / HOUR
