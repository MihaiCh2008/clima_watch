import type { Plugin } from 'vite'
import { getAirQuality } from '../api/_lib/getAirQuality.js'
import { getAirForecast } from '../api/_lib/getAirForecast.js'
import { getAirHistory } from '../api/_lib/getAirHistory.js'
import { getCitiesAir } from '../api/_lib/getCitiesAir.js'
import { sendJson } from '../api/_lib/respond.js'

/**
 * Emulates the /api/* endpoints locally (same code as the serverless
 * functions in api/), so the backend behaves identically in
 * development — no Vercel CLI, account, or deploy needed.
 */
export function localApiPlugin(apiKey: string | undefined): Plugin {
  return {
    name: 'local-api-air-quality',
    configureServer(server) {
      server.middlewares.use('/api/air-quality', async (req, res) => {
        const params = new URL(req.url ?? '', 'http://localhost').searchParams
        const result = await getAirQuality(params.get('city'), apiKey)
        sendJson(res, result.status, result.body)
      })

      server.middlewares.use('/api/air-history', async (req, res) => {
        const params = new URL(req.url ?? '', 'http://localhost').searchParams
        const result = await getAirHistory(params.get('lat'), params.get('lon'), apiKey)
        sendJson(res, result.status, result.body)
      })

      server.middlewares.use('/api/air-forecast', async (req, res) => {
        const params = new URL(req.url ?? '', 'http://localhost').searchParams
        const result = await getAirForecast(params.get('city'), apiKey)
        sendJson(res, result.status, result.body)
      })

      server.middlewares.use('/api/cities-air', async (_req, res) => {
        const result = await getCitiesAir(apiKey)
        sendJson(res, result.status, result.body)
      })
    },
  }
}
