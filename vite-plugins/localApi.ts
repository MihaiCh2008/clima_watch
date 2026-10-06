import type { Plugin } from 'vite'
import { getAirQuality } from '../api/_lib/getAirQuality.js'

/**
 * Emulates the /api/air-quality endpoint locally (same code as the serverless
 * function in api/air-quality.ts), so the backend behaves identically in
 * development — no Vercel CLI, account, or deploy needed.
 */
export function localApiPlugin(apiKey: string | undefined): Plugin {
  return {
    name: 'local-api-air-quality',
    configureServer(server) {
      server.middlewares.use('/api/air-quality', async (req, res) => {
        const url = new URL(req.url ?? '', 'http://localhost')
        const city = url.searchParams.get('city')
        const result = await getAirQuality(city, apiKey)
        res.statusCode = result.status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result.body))
      })
    },
  }
}
