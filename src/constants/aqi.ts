export interface AqiColor {
  color: string
  barColor: string
}

// Indicii OpenWeatherMap: 1 (Bun) .. 5 (Periculos). Culorile sunt independente de limbă.
export const AQI_COLORS: Record<number, AqiColor> = {
  1: { color: 'bg-green-500', barColor: 'bg-green-400' },
  2: { color: 'bg-yellow-400', barColor: 'bg-yellow-300' },
  3: { color: 'bg-orange-400', barColor: 'bg-orange-300' },
  4: { color: 'bg-red-500', barColor: 'bg-red-400' },
  5: { color: 'bg-purple-700', barColor: 'bg-purple-500' },
}

export function getAqiColor(aqi: number): AqiColor {
  return AQI_COLORS[aqi] ?? AQI_COLORS[1]
}

/** Normalizează un AQI posibil invalid (ex. din date mock) la un interval valid 1-5. */
export function safeAqi(aqi: number): 1 | 2 | 3 | 4 | 5 {
  if (aqi >= 1 && aqi <= 5) return aqi as 1 | 2 | 3 | 4 | 5
  return 1
}
