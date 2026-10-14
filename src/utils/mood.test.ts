import { describe, expect, it } from 'vitest'
import { lerp, paramsForAqi } from './mood'

describe('paramsForAqi', () => {
  it('uses the calm, clean look when there is no reading yet', () => {
    expect(paramsForAqi(null)).toEqual(paramsForAqi(1))
  })

  it('gets denser, faster and more labored as the air gets worse', () => {
    for (let level = 1; level < 5; level++) {
      const better = paramsForAqi(level)
      const worse = paramsForAqi(level + 1)
      expect(worse.count).toBeGreaterThan(better.count)
      expect(worse.speed).toBeGreaterThan(better.speed)
      expect(worse.breathSeconds).toBeLessThan(better.breathSeconds)
    }
  })

  it('clamps out-of-range values to the nearest valid level', () => {
    expect(paramsForAqi(0)).toEqual(paramsForAqi(1))
    expect(paramsForAqi(9)).toEqual(paramsForAqi(5))
  })
})

describe('lerp', () => {
  it('interpolates between two values', () => {
    expect(lerp(0, 10, 0)).toBe(0)
    expect(lerp(0, 10, 0.5)).toBe(5)
    expect(lerp(0, 10, 1)).toBe(10)
  })
})
