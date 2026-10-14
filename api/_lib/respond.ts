import type { ServerResponse } from 'node:http'

/** Writes a JSON response; successful responses can opt into CDN caching so we stay inside the free API quota. */
export function sendJson(res: ServerResponse, status: number, body: unknown, cacheSeconds = 0) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  if (status === 200 && cacheSeconds > 0) {
    res.setHeader('Cache-Control', `public, s-maxage=${cacheSeconds}, stale-while-revalidate=${cacheSeconds * 2}`)
  }
  res.end(JSON.stringify(body))
}
