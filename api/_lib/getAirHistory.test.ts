import { afterEach, describe, expect, it, vi } from 'vitest'
import { aggregateDaily, getAirHistory } from './getAirHistory.js'

function jsonResponse(body: unknown) {
  return { json: async () => body } as Response
}

function hour(isoDate: string, hourOfDay: number, aqi: number, pm2_5: number, extra: { pm10?: number; no2?: number; o3?: number } = {}) {
  const dt = Date.parse(`${isoDate}T${String(hourOfDay).padStart(2, '0')}:00:00Z`) / 1000
  return { dt, main: { aqi }, components: { pm2_5, ...extra } }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('aggregateDaily', () => {
  it('builds one entry per UTC day, oldest first, with the mean PM2.5', () => {
    const days = aggregateDaily([hour('2026-03-02', 10, 3, 20), hour('2026-03-01', 6, 1, 4), hour('2026-03-01', 18, 2, 8)])
    expect(days.map((d) => d.date)).toEqual(['2026-03-01', '2026-03-02'])
    expect(days.map((d) => d.pm2_5)).toEqual([6, 20])
  })

  it('computes a continuous EPA index from concentrations instead of averaging the 1-5 integers', () => {
    // Both hours report OpenWeatherMap category 2, but 12 vs 30 µg/m³ are far apart on the EPA scale.
    const calm = aggregateDaily([hour('2026-03-01', 1, 2, 12), hour('2026-03-01', 2, 2, 12)])[0]
    const busy = aggregateDaily([hour('2026-03-02', 1, 2, 30), hour('2026-03-02', 2, 2, 30)])[0]
    expect(calm.aqiIndex).toBe(56)
    expect(busy.aqiIndex).toBe(90)
    expect(busy.aqiIndex).toBeGreaterThan(calm.aqiIndex)
    expect(calm.aqi).toBe(2)
    expect(busy.aqi).toBe(2)
  })

  it('maps the index to the 1-5 scale and reports the dominant pollutant', () => {
    const day = aggregateDaily([hour('2026-03-01', 1, 5, 60, { pm10: 80, no2: 20, o3: 10 })])[0]
    expect(day.aqiIndex).toBe(154)
    expect(day.aqi).toBe(4)
    expect(day.dominant).toBe('pm2_5')
  })

  it('lets another pollutant win when it is the worst one', () => {
    const day = aggregateDaily([hour('2026-03-01', 1, 3, 5, { pm10: 300, no2: 10, o3: 10 })])[0]
    expect(day.dominant).toBe('pm10')
    expect(day.aqiIndex).toBeGreaterThan(150)
  })

  it('rounds PM2.5 averages to one decimal place', () => {
    const days = aggregateDaily([hour('2026-03-01', 1, 1, 1), hour('2026-03-01', 2, 1, 2), hour('2026-03-01', 3, 1, 2)])
    expect(days[0].pm2_5).toBe(1.7)
  })
})

describe('getAirHistory', () => {
  it('returns 400 when coordinates are missing, blank or out of range', async () => {
    expect((await getAirHistory(null, '26', 'fake-key')).status).toBe(400)
    expect((await getAirHistory('44', '  ', 'fake-key')).status).toBe(400)
    expect((await getAirHistory('abc', '26', 'fake-key')).status).toBe(400)
    expect((await getAirHistory('91', '26', 'fake-key')).status).toBe(400)
    expect((await getAirHistory('44', '181', 'fake-key')).status).toBe(400)
  })

  it('returns 500 when the server has no API key configured', async () => {
    const result = await getAirHistory('44.4', '26.1', undefined)
    expect(result.status).toBe(500)
  })

  it('returns 500 when the upstream API has no history for the location', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ list: [] })))
    const result = await getAirHistory('44.4', '26.1', 'fake-key')
    expect(result.status).toBe(500)
  })

  it('requests a 7-day window, returns at most 7 days, and never leaks the API key', async () => {
    const nowMs = Date.parse('2026-03-08T12:00:00Z')
    const list = Array.from({ length: 8 }, (_, i) => hour(`2026-03-0${i + 1}`, 12, 2, 10 + i))
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ list }))
    vi.stubGlobal('fetch', fetchMock)

    const result = await getAirHistory('44.4', '26.1', 'super-secret-key', nowMs)

    const url = fetchMock.mock.calls[0][0] as string
    const end = Math.floor(nowMs / 1000)
    expect(url).toContain(`end=${end}`)
    expect(url).toContain(`start=${end - 7 * 86_400}`)
    expect(result.status).toBe(200)
    expect(JSON.stringify(result.body)).not.toContain('super-secret-key')
    if (result.status === 200) {
      expect(result.body.days).toHaveLength(7)
      expect(result.body.days.at(-1)?.date).toBe('2026-03-08')
    }
  })
})
