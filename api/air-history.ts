import type { IncomingMessage, ServerResponse } from 'node:http'
import { getAirHistory } from './_lib/getAirHistory.js'
import { sendJson } from './_lib/respond.js'

/**
 * Serverless function (Vercel format): GET /api/air-history?lat=...&lon=...
 * Real 7-day history as daily averages. Cached at the CDN for 15 minutes.
 */
export default async function handler(req: IncomingMessage, res: ServerResponse) {
  const params = new URL(req.url ?? '', 'http://localhost').searchParams
  const result = await getAirHistory(params.get('lat'), params.get('lon'), process.env.WEATHER_API_KEY)
  sendJson(res, result.status, result.body, 900)
}
