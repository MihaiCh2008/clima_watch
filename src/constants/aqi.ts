export interface AqiColor {
  color: string
  barColor: string
}

// OpenWeatherMap AQI scale: 1 (Good) .. 5 (Hazardous). Colors are language-independent.
export const AQI_COLORS: Record<number, AqiColor> = {
  1: { color: 'bg-[#1f6f4a]', barColor: 'bg-[#2f8f63]' },
  2: { color: 'bg-[#b3862a]', barColor: 'bg-[#c99c3c]' },
  3: { color: 'bg-[#c17a3d]', barColor: 'bg-[#d4914f]' },
  4: { color: 'bg-[#a8432a]', barColor: 'bg-[#bd5538]' },
  5: { color: 'bg-[#6e3350]', barColor: 'bg-[#854166]' },
}

export function getAqiColor(aqi: number): AqiColor {
  return AQI_COLORS[aqi] ?? AQI_COLORS[1]
}

/** Normalizes a possibly-invalid AQI (e.g. from mock data) into the valid 1-5 range. */
export function safeAqi(aqi: number): 1 | 2 | 3 | 4 | 5 {
  if (aqi >= 1 && aqi <= 5) return aqi as 1 | 2 | 3 | 4 | 5
  return 1
}
