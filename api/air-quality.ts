import type { IncomingMessage, ServerResponse } from 'node:http'
import { getAirQuality } from './_lib/getAirQuality.js'
import { sendJson } from './_lib/respond.js'

interface RequestWithQuery extends IncomingMessage {
  query?: Record<string, string | string[]>
}

/**
 * Serverless function (Vercel format): GET /api/air-quality?city=...
 * Free deploy on Vercel (Hobby tier) — see the README for steps, no paid account needed.
 * Cached at the CDN for 10 minutes per city: OpenWeatherMap air-pollution data has hourly resolution, so a visitor
 * sees data at most 10 minutes older than the source, and repeat searches cost no upstream calls.
 */
export default async function handler(req: RequestWithQuery, res: ServerResponse) {
  const queryCity = req.query?.city
  const city =
    typeof queryCity === 'string'
      ? queryCity
      : new URL(req.url ?? '', 'http://localhost').searchParams.get('city')

  const result = await getAirQuality(city, process.env.WEATHER_API_KEY)

  sendJson(res, result.status, result.body, 600)
}
