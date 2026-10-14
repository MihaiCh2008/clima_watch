import { describe, expect, it } from 'vitest'
import type { ForecastHour, UserProfile } from '../types/airQuality'
import { adjustedLevel, bestWindow, upcomingHours, worstWindow } from './planner'

const HOUR = 3600
const BASE = 1_700_000_000

function hours(pms: number[], aqi = 1): ForecastHour[] {
  return pms.map((pm2_5, i) => ({ dt: BASE + i * HOUR, aqi, pm2_5 }))
}

const plain: UserProfile = { hasRespiratoryIssue: false, hasYoungChild: false, exercisesOutdoors: false, wantsCarbonTips: false }

describe('adjustedLevel', () => {
  it('leaves the level alone for a non-sensitive profile', () => {
    expect(adjustedLevel(2, plain)).toBe(2)
  })

  it('bumps the level one step for asthma or a young child, capped at 5', () => {
    expect(adjustedLevel(2, { ...plain, hasRespiratoryIssue: true })).toBe(3)
    expect(adjustedLevel(3, { ...plain, hasYoungChild: true })).toBe(4)
    expect(adjustedLevel(5, { ...plain, hasRespiratoryIssue: true })).toBe(5)
  })

  it('does not bump for outdoor exercise alone', () => {
    expect(adjustedLevel(2, { ...plain, exercisesOutdoors: true })).toBe(2)
  })
})

describe('upcomingHours', () => {
  const all = hours([1, 2, 3, 4, 5, 6])

  it('starts with the hour that contains "now"', () => {
    const now = (BASE + 2 * HOUR + 600) * 1000
    expect(upcomingHours(all, now, 3).map((h) => h.pm2_5)).toEqual([3, 4, 5])
  })

  it('returns fewer hours when the forecast runs out', () => {
    const now = (BASE + 4 * HOUR) * 1000
    expect(upcomingHours(all, now, 24).map((h) => h.pm2_5)).toEqual([5, 6])
  })

  it('returns nothing when the whole forecast is in the past', () => {
    expect(upcomingHours(all, (BASE + 100 * HOUR) * 1000)).toEqual([])
  })
})

describe('bestWindow / worstWindow', () => {
  const day = hours([30, 12, 4, 6, 20, 45, 50, 9])

  it('finds the cleanest window of the requested length', () => {
    expect(bestWindow(day, 2)).toEqual({ start: 2, length: 2, avgPm: 5 })
    expect(bestWindow(day, 1)).toEqual({ start: 2, length: 1, avgPm: 4 })
  })

  it('finds the dirtiest window of the requested length', () => {
    expect(worstWindow(day, 2)).toEqual({ start: 5, length: 2, avgPm: 47.5 })
  })

  it('prefers the earliest window on a tie', () => {
    expect(bestWindow(hours([5, 5, 5]), 1)?.start).toBe(0)
  })

  it('returns null when there is not enough data', () => {
    expect(bestWindow(hours([1]), 2)).toBeNull()
    expect(worstWindow([], 1)).toBeNull()
  })
})
