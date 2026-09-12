import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'
import { localApiPlugin } from './vite-plugins/localApi.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Al treilea argument gol ('') face ca loadEnv să citească ȘI variabilele
  // fără prefixul VITE_ (ex. WEATHER_API_KEY) — acestea rămân doar aici,
  // în procesul Node al serverului de dev, niciodată trimise către browser.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react(), tailwindcss(), localApiPlugin(env.WEATHER_API_KEY)],
  }
})
