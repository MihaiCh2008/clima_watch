import type { IncomingMessage, ServerResponse } from 'node:http'
import { getAirForecast } from './_lib/getAirForecast.js'
import { sendJson } from './_lib/respond.js'

/**
 * Serverless function (Vercel format): GET /api/air-forecast?city=...
 * Hourly forecast for the next ~48 hours. Cached at the CDN for 15 minutes.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const params = new URL(req.url ?? '', 'http://localhost').searchParams
  const result = await getAirForecast(params.get('city'), process.env.WEATHER_API_KEY)
  sendJson(res, result.status, result.body, 900)
}
