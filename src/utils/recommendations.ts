import type { UserProfile } from '../types/airQuality'
import type { Translation } from '../i18n/translations'

export interface Recommendation {
  level: 'ok' | 'warning' | 'danger'
  message: string
}

/**
 * Transformă un indice AQI brut + profilul de sănătate al utilizatorului
 * într-un sfat concret de acțiune, tradus în limba curentă. Aici e diferența
 * dintre "afișez date" și "ajut omul să decidă ce face azi".
 */
export function getRecommendation(aqi: number, profile: UserProfile, t: Translation): Recommendation {
  const isSensitive = profile.hasRespiratoryIssue || profile.hasYoungChild

  if (aqi <= 2) {
    return profile.exercisesOutdoors
      ? { level: 'ok', message: t.rec.okExercise }
      : { level: 'ok', message: t.rec.okDefault }
  }

  if (aqi === 3) {
    if (isSensitive) return { level: 'warning', message: t.rec.warningSensitive }
    if (profile.exercisesOutdoors) return { level: 'warning', message: t.rec.warningExercise }
    return { level: 'warning', message: t.rec.warningDefault }
  }

  // aqi 4 sau 5
  if (isSensitive) return { level: 'danger', message: t.rec.dangerSensitive }
  if (profile.exercisesOutdoors) return { level: 'danger', message: t.rec.dangerExercise }
  return { level: 'danger', message: t.rec.dangerDefault }
}
