import { createContext, useContext } from 'react'

export interface AirMood {
  aqi: number
  pm2_5: number
  city: string
}

export interface AirMoodValue {
  mood: AirMood | null
  setMood: (mood: AirMood | null) => void
}

export const AirMoodContext = createContext<AirMoodValue | null>(null)

export function useAirMood(): AirMoodValue {
  const ctx = useContext(AirMoodContext)
  if (!ctx) throw new Error('useAirMood must be used within an AirMoodProvider')
  return ctx
}
