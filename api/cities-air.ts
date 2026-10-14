import type { IncomingMessage, ServerResponse } from 'node:http'
import { getCitiesAir } from './_lib/getCitiesAir.js'
import { sendJson } from './_lib/respond.js'

/**
 * Serverless function (Vercel format): GET /api/cities-air
 * Live air quality for a fixed list of world cities, cached at the CDN for
 * 10 minutes so every visitor shares one batch of upstream calls.
 */
export default async function handler(_req: IncomingMessage, res: ServerResponse) {
  const result = await getCitiesAir(process.env.WEATHER_API_KEY)
  sendJson(res, result.status, result.body, 600)
}
