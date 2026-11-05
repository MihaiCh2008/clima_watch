import { afterEach, describe, expect, it, vi } from 'vitest'
import { fetchAirForecast, fetchAirQuality, normalizeCityQuery } from './airApi'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('normalizeCityQuery', () => {
  it('makes differently typed spellings of one city identical', () => {
    const variants = ['Chisinau', ' chisinau ', 'CHISINAU', 'chisinau\t']
    expect(new Set(variants.map(normalizeCityQuery))).toEqual(new Set(['chisinau']))
  })

  it('collapses inner whitespace and keeps the country code of "City,CC" queries', () => {
    expect(normalizeCityQuery('  New   York ')).toBe('new york')
    expect(normalizeCityQuery('Lagos,NG')).toBe('lagos,ng')
  })
})

describe('API client', () => {
  it('sends the canonical city to the backend so the CDN can share one entry', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)

    await fetchAirQuality('  Chisinau ')
    await fetchAirForecast('CHISINAU')

    expect(fetchMock.mock.calls[0][0]).toBe('/api/air-quality?city=chisinau')
    expect(fetchMock.mock.calls[1][0]).toBe('/api/air-forecast?city=chisinau')
  })
})
