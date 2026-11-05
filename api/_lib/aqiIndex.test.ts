import { describe, expect, it } from 'vitest'
import { aqiLevel, dailyIndex, maxRolling8hMean, no2ToPpb, o3ToPpm, pollutantIndex } from './aqiIndex.js'

describe('pollutantIndex', () => {
  it('hits the EPA breakpoint boundaries for PM2.5', () => {
    expect(pollutantIndex('pm2_5', 0)).toBe(0)
    expect(pollutantIndex('pm2_5', 9.0)).toBe(50)
    expect(pollutantIndex('pm2_5', 35.4)).toBe(100)
    expect(pollutantIndex('pm2_5', 55.4)).toBe(150)
    expect(pollutantIndex('pm2_5', 125.4)).toBe(200)
    expect(pollutantIndex('pm2_5', 225.4)).toBe(300)
  })

  it('interpolates linearly inside a band instead of jumping between categories', () => {
    // (100-51)/(35.4-9.1) * (22.2-9.1) + 51 ≈ 75.4 → midway through "Moderate"
    expect(pollutantIndex('pm2_5', 22.2)).toBe(75)
    expect(pollutantIndex('pm2_5', 12)).toBeLessThan(pollutantIndex('pm2_5', 30))
  })

  it('truncates PM2.5 to one decimal and PM10 to an integer before looking up the band', () => {
    expect(pollutantIndex('pm2_5', 9.04)).toBe(50)
    expect(pollutantIndex('pm10', 54.9)).toBe(50)
  })

  it('caps at 500 and ignores invalid input', () => {
    expect(pollutantIndex('pm2_5', 900)).toBe(500)
    expect(pollutantIndex('pm10', 2000)).toBe(500)
    expect(pollutantIndex('pm2_5', -3)).toBe(0)
    expect(pollutantIndex('pm2_5', Number.NaN)).toBe(0)
  })

  it('converts NO2 and O3 from µg/m³ to the units of the EPA tables', () => {
    expect(no2ToPpb(100)).toBeCloseTo(53.14, 1)
    expect(o3ToPpm(100)).toBeCloseTo(0.0509, 3)
    expect(pollutantIndex('no2', 100)).toBe(50)
    expect(pollutantIndex('o3', 100)).toBeGreaterThanOrEqual(46)
    expect(pollutantIndex('o3', 100)).toBeLessThanOrEqual(50)
  })
})

describe('aqiLevel', () => {
  it('maps EPA categories onto the 1-5 scale', () => {
    expect([0, 50, 51, 100, 101, 150, 151, 200, 201, 500].map(aqiLevel)).toEqual([1, 1, 2, 2, 3, 3, 4, 4, 5, 5])
  })
})

describe('maxRolling8hMean', () => {
  const hourly = (values: number[]) => values.map((value, i) => ({ dt: 1_700_000_000 + i * 3600, value }))

  it('returns the highest 8-hour running mean', () => {
    expect(maxRolling8hMean(hourly([0, 0, 0, 0, 0, 0, 0, 0, 80, 80, 80, 80, 80, 80, 80, 80]))).toBe(80)
  })

  it('returns null when no window has at least 6 readings', () => {
    expect(maxRolling8hMean(hourly([10, 20, 30]))).toBeNull()
  })
})

describe('dailyIndex', () => {
  it('uses the 24 h mean for particles, the hourly peak for NO2 and the 8 h mean for O3', () => {
    const entries = Array.from({ length: 24 }, (_, i) => ({ dt: 1_700_000_000 + i * 3600, pm2_5: 10, pm10: 20, no2: i === 5 ? 400 : 5, o3: 20 }))
    const day = dailyIndex(entries)
    expect(day?.dominant).toBe('no2')
    expect(day?.index).toBeGreaterThan(100)
  })

  it('returns null when there is nothing to compute from', () => {
    expect(dailyIndex([])).toBeNull()
    expect(dailyIndex([{ dt: 1 }])).toBeNull()
  })
})
