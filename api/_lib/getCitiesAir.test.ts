import { afterEach, describe, expect, it, vi } from 'vitest'
import { GLOBE_CITIES, getCitiesAir } from './getCitiesAir.js'

function jsonResponse(body: unknown) {
  return { json: async () => body } as Response
}

function reading(aqi: number, pm2_5: number) {
  return jsonResponse({ list: [{ main: { aqi }, components: { pm2_5 } }] })
}

const seeds = [
  { name: 'Alpha', query: 'Alpha,AA', lat: 10, lon: 20 },
  { name: 'Beta', query: 'Beta,BB', lat: -10, lon: -20 },
]

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('GLOBE_CITIES', () => {
  it('has unique names and valid coordinates', () => {
    expect(new Set(GLOBE_CITIES.map((c) => c.name)).size).toBe(GLOBE_CITIES.length)
    for (const c of GLOBE_CITIES) {
      expect(Math.abs(c.lat)).toBeLessThanOrEqual(90)
      expect(Math.abs(c.lon)).toBeLessThanOrEqual(180)
    }
  })
})

describe('getCitiesAir', () => {
  it('returns 500 when the server has no API key configured', async () => {
    const result = await getCitiesAir(undefined, seeds)
    expect(result.status).toBe(500)
  })

  it('returns one entry per city with its AQI and PM2.5', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(reading(2, 7.5)).mockResolvedValueOnce(reading(4, 55.1)))
    const result = await getCitiesAir('fake-key', seeds)
    expect(result.status).toBe(200)
    if (result.status === 200) {
      expect(result.body.cities).toEqual([
        { ...seeds[0], aqi: 2, pm2_5: 7.5 },
        { ...seeds[1], aqi: 4, pm2_5: 55.1 },
      ])
    }
  })

  it('skips cities that fail instead of failing the whole batch', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValueOnce(new Error('network down')).mockResolvedValueOnce(reading(3, 20))
    )
    const result = await getCitiesAir('fake-key', seeds)
    expect(result.status).toBe(200)
    if (result.status === 200) {
      expect(result.body.cities.map((c) => c.name)).toEqual(['Beta'])
    }
  })

  it('returns 500 when every city fails, and never leaks the API key', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({})))
    const result = await getCitiesAir('super-secret-key', seeds)
    expect(result.status).toBe(500)
    expect(JSON.stringify(result.body)).not.toContain('super-secret-key')
  })
})
