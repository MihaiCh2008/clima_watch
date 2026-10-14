import type { AirQualityData } from '../types/airQuality'

export interface Verdict {
  winner: 'a' | 'b' | 'tie'
  /** How much less PM2.5 the cleaner city has, as a whole percent (0 when not meaningful). */
  pct: number
}

const PM_TIE_THRESHOLD = 0.05

/** Lower AQI wins; if the AQI level is equal, lower PM2.5 wins; otherwise it's a tie. */
export function compareAir(a: AirQualityData, b: AirQualityData): Verdict {
  let winner: Verdict['winner'] = 'tie'
  if (a.aqi !== b.aqi) {
    winner = a.aqi < b.aqi ? 'a' : 'b'
  } else if (Math.abs(a.components.pm2_5 - b.components.pm2_5) > PM_TIE_THRESHOLD) {
    winner = a.components.pm2_5 < b.components.pm2_5 ? 'a' : 'b'
  }

  if (winner === 'tie') return { winner, pct: 0 }

  const winnerPm = (winner === 'a' ? a : b).components.pm2_5
  const loserPm = (winner === 'a' ? b : a).components.pm2_5
  const pct = loserPm > 0 ? Math.max(0, Math.round((1 - winnerPm / loserPm) * 100)) : 0
  return { winner, pct }
}

/** Width (0-100) of each side's bar for one pollutant, scaled so the larger value fills the track. */
export function barWidths(a: number, b: number): [number, number] {
  const max = Math.max(a, b)
  if (max <= 0) return [0, 0]
  return [(a / max) * 100, (b / max) * 100]
}
