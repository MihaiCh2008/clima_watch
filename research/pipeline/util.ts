export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Runs `worker` over `items` with at most `limit` in flight at once. */
export async function mapPool<T, R>(items: T[], limit: number, worker: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length)
  let next = 0
  async function run() {
    while (next < items.length) {
      const index = next++
      results[index] = await worker(items[index], index)
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, run))
  return results
}

/** fetch with retries and exponential backoff; resolves to the Response even for 404 (callers decide). */
export async function fetchRetry(url: string, attempts = 4): Promise<Response> {
  let lastError: unknown
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(60_000) })
      if (res.status < 500 && res.status !== 429) return res
      lastError = new Error(`HTTP ${res.status}`)
    } catch (error) {
      lastError = error
    }
    await sleep(1000 * 2 ** i)
  }
  throw lastError
}

export function* eachDate(start: string, end: string): Generator<string> {
  for (let t = Date.parse(`${start}T00:00:00Z`); t <= Date.parse(`${end}T00:00:00Z`); t += 86_400_000) {
    yield new Date(t).toISOString().slice(0, 10)
  }
}

export function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const a = Math.sin(toRad(lat2 - lat1) / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(toRad(lon2 - lon1) / 2) ** 2
  return 2 * 6371 * Math.asin(Math.sqrt(a))
}

export function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = sorted.length >> 1
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}
