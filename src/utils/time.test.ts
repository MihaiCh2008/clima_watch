import { describe, expect, it } from 'vitest'
import { formatClock, isValidTimeZone, zoneLabel } from './time'

const toDt = (iso: string) => Date.parse(iso) / 1000

describe('formatClock', () => {
  it('shows the city\'s wall-clock time, not the viewer\'s', () => {
    const dt = toDt('2026-01-15T10:00:00Z')
    expect(formatClock(dt, 'en', 'Europe/Chisinau')).toBe('12:00')
    expect(formatClock(dt, 'en', 'America/New_York')).toBe('05:00')
    expect(formatClock(dt, 'en', 'Asia/Tokyo')).toBe('19:00')
  })

  it('follows daylight-saving changes of the city', () => {
    expect(formatClock(toDt('2026-01-15T10:00:00Z'), 'en', 'Europe/Chisinau')).toBe('12:00')
    expect(formatClock(toDt('2026-07-15T10:00:00Z'), 'en', 'Europe/Chisinau')).toBe('13:00')
  })

  it('writes midnight as 00:00 in every UI language', () => {
    const dt = toDt('2026-03-10T22:00:00Z')
    for (const lang of ['en', 'ro', 'ru']) expect(formatClock(dt, lang, 'Europe/Chisinau')).toBe('00:00')
  })

  it('falls back to the viewer\'s zone for a missing or unknown zone name', () => {
    const dt = toDt('2026-01-15T10:00:00Z')
    expect(formatClock(dt, 'en', null)).toBe(formatClock(dt, 'en', undefined))
    expect(formatClock(dt, 'en', 'Not/AZone')).toBe(formatClock(dt, 'en'))
  })
})

describe('isValidTimeZone', () => {
  it('accepts IANA names and rejects junk', () => {
    expect(isValidTimeZone('Europe/Bucharest')).toBe(true)
    expect(isValidTimeZone('Not/AZone')).toBe(false)
    expect(isValidTimeZone('')).toBe(false)
    expect(isValidTimeZone(null)).toBe(false)
  })
})

describe('zoneLabel', () => {
  it('gives a short offset label for the zone at that moment', () => {
    expect(zoneLabel(toDt('2026-01-15T10:00:00Z'), 'en', 'Europe/Chisinau')).toBe('GMT+2')
    expect(zoneLabel(toDt('2026-07-15T10:00:00Z'), 'en', 'Europe/Chisinau')).toBe('GMT+3')
  })
})
