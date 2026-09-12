import type { IncomingMessage, ServerResponse } from 'node:http'
import { getAirQuality } from './_lib/getAirQuality.js'

interface RequestWithQuery extends IncomingMessage {
  query?: Record<string, string | string[]>
}

/**
 * Funcție serverless (format Vercel): GET /api/air-quality?city=...
 * Deploy gratuit pe Vercel (Hobby tier) — vezi README pentru pași, fără cont plătit necesar.
 */
export default async function handler(req: RequestWithQuery, res: ServerResponse) {
  const queryCity = req.query?.city
  const city =
    typeof queryCity === 'string'
      ? queryCity
      : new URL(req.url ?? '', 'http://localhost').searchParams.get('city')

  const result = await getAirQuality(city, process.env.WEATHER_API_KEY)

  res.statusCode = result.status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(result.body))
}
