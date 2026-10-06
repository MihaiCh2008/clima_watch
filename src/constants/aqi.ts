export interface AqiColor {
  color: string
  barColor: string
}

// OpenWeatherMap AQI scale: 1 (Good) .. 5 (Hazardous). Colors are language-independent.
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

/** Normalizes a possibly-invalid AQI (e.g. from mock data) into the valid 1-5 range. */
export function safeAqi(aqi: number): 1 | 2 | 3 | 4 | 5 {
  if (aqi >= 1 && aqi <= 5) return aqi as 1 | 2 | 3 | 4 | 5
  return 1
}
