import { afterEach, describe, expect, it, vi } from 'vitest'
import { aggregateDaily, getAirHistory } from './getAirHistory.js'

function jsonResponse(body: unknown) {
  return { json: async () => body } as Response
}

function hour(isoDate: string, hourOfDay: number, aqi: number, pm2_5: number) {
  const dt = Date.parse(`${isoDate}T${String(hourOfDay).padStart(2, '0')}:00:00Z`) / 1000
  return { dt, main: { aqi }, components: { pm2_5 } }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('aggregateDaily', () => {
  it('averages hourly readings into one entry per UTC day, oldest first', () => {
    const days = aggregateDaily([
      hour('2026-03-02', 10, 3, 20),
      hour('2026-03-01', 6, 1, 4),
      hour('2026-03-01', 18, 2, 8),
    ])
    expect(days).toEqual([
      { date: '2026-03-01', aqi: 2, pm2_5: 6 },
      { date: '2026-03-02', aqi: 3, pm2_5: 20 },
    ])
  })

  it('keeps the rounded AQI inside the valid 1-5 range', () => {
    const days = aggregateDaily([hour('2026-03-01', 1, 5, 90), hour('2026-03-01', 2, 5, 80)])
    expect(days[0].aqi).toBe(5)
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
