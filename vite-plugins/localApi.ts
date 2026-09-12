import type { Plugin } from 'vite'
import { getAirQuality } from '../api/_lib/getAirQuality.js'

/**
 * Emulează local endpoint-ul /api/air-quality (același cod ca funcția serverless
 * din api/air-quality.ts), ca backend-ul să funcționeze identic în dezvoltare —
 * fără să fie nevoie de Vercel CLI, cont sau deploy.
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
