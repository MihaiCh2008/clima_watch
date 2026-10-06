import type { UserProfile } from '../types/airQuality'
import type { Translation } from '../i18n/translations'

export interface Recommendation {
  level: 'ok' | 'warning' | 'danger'
  message: string
}

/**
 * Turns a raw AQI reading + the user's health profile into a concrete action
 * recommendation, translated into the current language. This is the difference
 * between "display data" and "help the person decide what to do today".
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

  // aqi 4 or 5
  if (isSensitive) return { level: 'danger', message: t.rec.dangerSensitive }
  if (profile.exercisesOutdoors) return { level: 'danger', message: t.rec.dangerExercise }
  return { level: 'danger', message: t.rec.dangerDefault }
}
