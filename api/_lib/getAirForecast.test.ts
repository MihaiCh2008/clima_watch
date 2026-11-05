import { afterEach, describe, expect, it, vi } from 'vitest'
import { getAirForecast } from './getAirForecast.js'

function jsonResponse(body: unknown) {
  return { json: async () => body } as Response
}

/** Routes mocked responses by URL, since the forecast and the time-zone lookup run in parallel. */
function routeFetch(routes: { geo?: unknown; forecast?: unknown; timezone?: unknown | Error }) {
  return vi.fn(async (url: string) => {
    if (url.includes('/geo/')) return jsonResponse(routes.geo ?? [])
    if (url.includes('open-meteo')) {
      if (routes.timezone instanceof Error) throw routes.timezone
      return jsonResponse(routes.timezone ?? {})
    }
    return jsonResponse(routes.forecast ?? { list: [] })
  })
}

function entry(dt: number, aqi: number, pm2_5: number) {
  return { dt, main: { aqi }, components: { pm2_5 } }
}

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('getAirForecast', () => {
  it('returns 400 when the city parameter is missing or blank', async () => {
    expect((await getAirForecast(null, 'fake-key')).status).toBe(400)
    expect((await getAirForecast('   ', 'fake-key')).status).toBe(400)
  })

  it('returns 500 when the server has no API key configured', async () => {
    expect((await getAirForecast('Bucharest', undefined)).status).toBe(500)
  })

  it('returns 404 when the geocoding API finds no matching city', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse([])))
    expect((await getAirForecast('Nonexistentville', 'fake-key')).status).toBe(404)
  })

  it('returns 500 when the upstream forecast is empty', async () => {
    vi.stubGlobal('fetch', routeFetch({ geo: [{ lat: 1, lon: 2, name: 'Alpha' }], forecast: { list: [] } }))
    expect((await getAirForecast('Alpha', 'fake-key')).status).toBe(500)
  })

  it('maps entries to dt/aqi/pm2_5, keeps at most 48 hours, and never leaks the API key', async () => {
    const list = Array.from({ length: 96 }, (_, i) => entry(1_700_000_000 + i * 3600, (i % 5) + 1, i))
    vi.stubGlobal(
      'fetch',
      routeFetch({ geo: [{ lat: 44.43, lon: 26.1, name: 'Bucharest' }], forecast: { list }, timezone: { timezone: 'Europe/Bucharest' } })
    )

    const result = await getAirForecast('Bucuresti', 'super-secret-key')

    expect(result.status).toBe(200)
    expect(JSON.stringify(result.body)).not.toContain('super-secret-key')
    if (result.status === 200) {
      expect(result.body.cityName).toBe('Bucharest')
      expect(result.body.timezone).toBe('Europe/Bucharest')
      expect(result.body.hours).toHaveLength(48)
      expect(result.body.hours[0]).toEqual({ dt: 1_700_000_000, aqi: 1, pm2_5: 0 })
    }
  })

  it('still answers, with a null time zone, when the time-zone lookup fails', async () => {
    const list = [entry(1_700_000_000, 2, 12)]
    vi.stubGlobal(
      'fetch',
      routeFetch({ geo: [{ lat: 44.43, lon: 26.1, name: 'Bucharest' }], forecast: { list }, timezone: new Error('offline') })
    )

    const result = await getAirForecast('Bucharest', 'fake-key')

    expect(result.status).toBe(200)
    if (result.status === 200) expect(result.body.timezone).toBeNull()
  })
})
