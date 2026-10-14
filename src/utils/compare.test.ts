import { describe, expect, it } from 'vitest'
import { barWidths, compareAir } from './compare'

function air(aqi: number, pm2_5: number) {
  return { aqi, components: { pm2_5, pm10: 0, co: 0, no2: 0, o3: 0 } }
}

describe('compareAir', () => {
  it('picks the city with the lower AQI level', () => {
    expect(compareAir(air(2, 50), air(4, 10)).winner).toBe('a')
    expect(compareAir(air(4, 10), air(2, 50)).winner).toBe('b')
  })

  it('breaks an AQI tie with PM2.5', () => {
    expect(compareAir(air(3, 30), air(3, 20)).winner).toBe('b')
  })

  it('calls it a tie when AQI and PM2.5 are effectively equal', () => {
    expect(compareAir(air(2, 10), air(2, 10.02))).toEqual({ winner: 'tie', pct: 0 })
  })

  it('reports how much less PM2.5 the winner has', () => {
    expect(compareAir(air(1, 5), air(3, 20))).toEqual({ winner: 'a', pct: 75 })
  })

  it('never reports a negative percentage when AQI and PM2.5 disagree', () => {
    expect(compareAir(air(1, 40), air(2, 10)).pct).toBe(0)
  })
})

describe('barWidths', () => {
  it('scales the larger value to 100 and the other proportionally', () => {
    expect(barWidths(10, 40)).toEqual([25, 100])
    expect(barWidths(40, 10)).toEqual([100, 25])
  })

  it('returns empty bars when both values are zero', () => {
    expect(barWidths(0, 0)).toEqual([0, 0])
  })
})
