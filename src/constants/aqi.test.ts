import { describe, expect, it } from 'vitest'
import { AQI_COLORS, getAqiColor, safeAqi } from './aqi'

describe('safeAqi', () => {
  it('passes through valid AQI levels unchanged', () => {
    expect(safeAqi(1)).toBe(1)
    expect(safeAqi(3)).toBe(3)
    expect(safeAqi(5)).toBe(5)
  })

  it('falls back to 1 for out-of-range values (e.g. random mock data glitches)', () => {
    expect(safeAqi(0)).toBe(1)
    expect(safeAqi(6)).toBe(1)
    expect(safeAqi(-1)).toBe(1)
  })
})

describe('getAqiColor', () => {
  it('returns the matching color set for each of the 5 AQI levels', () => {
    for (let level = 1; level <= 5; level++) {
      expect(getAqiColor(level)).toEqual(AQI_COLORS[level])
    }
  })

  it('falls back to level 1 colors for an invalid AQI value', () => {
    expect(getAqiColor(99)).toEqual(AQI_COLORS[1])
  })
})
