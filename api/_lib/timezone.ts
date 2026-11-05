const TIMEOUT_MS = 3000

/**
 * IANA time zone (e.g. "Europe/Chisinau") of a coordinate, or null if it can't be resolved.
 * OpenWeatherMap's geocoder doesn't return one; Open-Meteo does, with no API key.
 * Failure is never fatal: callers fall back to showing times in the viewer's own zone.
 */
export async function lookupTimezone(lat: number, lon: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`,
      { signal: AbortSignal.timeout(TIMEOUT_MS) }
    )
    const data = (await res.json()) as { timezone?: unknown }
    return typeof data?.timezone === 'string' && data.timezone ? data.timezone : null
  } catch {
    return null
  }
}
