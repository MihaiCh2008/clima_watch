import type { HistoryPoint } from '../types/airQuality'

// Temporary mock data — to be replaced with real historical data once a history endpoint exists
export function generateMockHistory(currentAqi: number, dayLabels: readonly string[]): HistoryPoint[] {
  return dayLabels.map((day, i) => {
    if (i === dayLabels.length - 1) return { day, aqi: currentAqi }
    const variation = Math.floor(Math.random() * 3) - 1
    const value = Math.min(5, Math.max(1, currentAqi + variation))
    return { day, aqi: value }
  })
}
