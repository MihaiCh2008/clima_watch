/** Whether the runtime knows this IANA time zone name (e.g. "Europe/Chisinau"). */
export function isValidTimeZone(timeZone: string | null | undefined): timeZone is string {
  if (!timeZone) return false
  try {
    new Intl.DateTimeFormat('en', { timeZone })
    return true
  } catch {
    return false
  }
}

/**
 * "HH:mm" for a UTC timestamp (seconds), in the given IANA time zone — the searched city's — or in the
 * viewer's own zone when none is known. `h23` keeps midnight as "00:00" in every locale.
 */
export function formatClock(dt: number, locale: string, timeZone?: string | null): string {
  return new Date(dt * 1000).toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    ...(isValidTimeZone(timeZone) ? { timeZone } : {}),
  })
}

/** Short zone label such as "GMT+2", for a UTC timestamp (seconds) in the given zone. */
export function zoneLabel(dt: number, locale: string, timeZone: string): string {
  const parts = new Intl.DateTimeFormat(locale, { timeZone, timeZoneName: 'short' }).formatToParts(new Date(dt * 1000))
  return parts.find((p) => p.type === 'timeZoneName')?.value ?? timeZone
}
