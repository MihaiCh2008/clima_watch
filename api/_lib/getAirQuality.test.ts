import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAirQuality } from './getAirQuality.js'

function jsonResponse(body: unknown) {
  return { json: async () => body } as Response
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getAirQuality', () => {
  it('returns 400 when the city parameter is missing', async () => {
    const result = await getAirQuality(null, 'fake-key')
    expect(result.status).toBe(400)
  })

  it('returns 400 when the city parameter is blank', async () => {
    const result = await getAirQuality('   ', 'fake-key')
    expect(result.status).toBe(400)
  })

  it('returns 500 when the server has no API key configured', async () => {
    const result = await getAirQuality('Bucuresti', undefined)
    expect(result.status).toBe(500)
  })

  it('returns 404 when the geocoding API finds no matching city', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])))
    const result = await getAirQuality('Nonexistentville', 'fake-key')
    expect(result.status).toBe(404)
  })

  it('never leaks the API key into the returned response body', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse([{ lat: 44.43, lon: 26.1, name: 'Bucharest' }]))
      .mockResolvedValueOnce(
        jsonResponse({
          list: [{ main: { aqi: 2 }, components: { pm2_5: 3.7, pm10: 4.3, co: 128.5, no2: 1.2, o3: 89.7 } }],
        })
      )
    vi.stubGlobal('fetch', fetchMock)

    const result = await getAirQuality('Bucuresti', 'super-secret-key')

    expect(result.status).toBe(200)
    expect(JSON.stringify(result.body)).not.toContain('super-secret-key')
    if (result.status === 200) {
      expect(result.body).toEqual({
        cityName: 'Bucharest',
        aqi: 2,
        components: { pm2_5: 3.7, pm10: 4.3, co: 128.5, no2: 1.2, o3: 89.7 },
      })
    }
  })
})
