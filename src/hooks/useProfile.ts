import { useEffect, useState } from 'react'
import type { UserProfile } from '../types/airQuality'

const STORAGE_KEY = 'airwatch-profile'

const DEFAULT_PROFILE: UserProfile = {
  hasRespiratoryIssue: false,
  hasYoungChild: false,
  exercisesOutdoors: false,
  wantsCarbonTips: false,
}

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_PROFILE
    return { ...DEFAULT_PROFILE, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_PROFILE
  }
}

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(loadProfile)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    } catch {
      // localStorage indisponibil (mod privat etc.) — ignorăm, profilul rămâne doar în sesiune
    }
  }, [profile])

  return { profile, setProfile }
}
