import { useState, type ReactNode } from 'react'
import { AirMoodContext, type AirMood } from './airMood'

export function AirMoodProvider({ children }: { children: ReactNode }) {
  const [mood, setMood] = useState<AirMood | null>(null)
  return <AirMoodContext.Provider value={{ mood, setMood }}>{children}</AirMoodContext.Provider>
}
