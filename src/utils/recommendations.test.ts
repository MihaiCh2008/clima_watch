import { describe, expect, it } from 'vitest'
import { getRecommendation } from './recommendations'
import { translations } from '../i18n/translations'
import type { UserProfile } from '../types/airQuality'

const t = translations.ro

const BASE_PROFILE: UserProfile = {
  hasRespiratoryIssue: false,
  hasYoungChild: false,
  exercisesOutdoors: false,
  wantsCarbonTips: false,
}

describe('getRecommendation', () => {
  it('returns "ok" with the exercise-specific message when air is good and profile exercises outdoors', () => {
    const rec = getRecommendation(1, { ...BASE_PROFILE, exercisesOutdoors: true }, t)
    expect(rec.level).toBe('ok')
    expect(rec.message).toBe(t.rec.okExercise)
  })

  it('returns "ok" with the default message when air is good and profile has no special conditions', () => {
    const rec = getRecommendation(2, BASE_PROFILE, t)
    expect(rec.level).toBe('ok')
    expect(rec.message).toBe(t.rec.okDefault)
  })

  it('prioritizes the sensitive-group message over exercise when both apply at moderate air quality', () => {
    const rec = getRecommendation(3, { ...BASE_PROFILE, hasYoungChild: true, exercisesOutdoors: true }, t)
    expect(rec.level).toBe('warning')
    expect(rec.message).toBe(t.rec.warningSensitive)
  })

  it('returns the exercise-specific warning when only exercise applies at moderate air quality', () => {
    const rec = getRecommendation(3, { ...BASE_PROFILE, exercisesOutdoors: true }, t)
    expect(rec.level).toBe('warning')
    expect(rec.message).toBe(t.rec.warningExercise)
  })

  it('returns the default warning at moderate air quality with no special profile flags', () => {
    const rec = getRecommendation(3, BASE_PROFILE, t)
    expect(rec.level).toBe('warning')
    expect(rec.message).toBe(t.rec.warningDefault)
  })

  it('treats both unhealthy (4) and hazardous (5) as "danger"', () => {
    expect(getRecommendation(4, BASE_PROFILE, t).level).toBe('danger')
    expect(getRecommendation(5, BASE_PROFILE, t).level).toBe('danger')
  })

  it('prioritizes the sensitive-group message over exercise when both apply at dangerous air quality', () => {
    const rec = getRecommendation(5, { ...BASE_PROFILE, hasRespiratoryIssue: true, exercisesOutdoors: true }, t)
    expect(rec.message).toBe(t.rec.dangerSensitive)
  })

  it('returns the exercise-specific danger message when only exercise applies', () => {
    const rec = getRecommendation(4, { ...BASE_PROFILE, exercisesOutdoors: true }, t)
    expect(rec.message).toBe(t.rec.dangerExercise)
  })

  it('returns the default danger message with no special profile flags', () => {
    const rec = getRecommendation(4, BASE_PROFILE, t)
    expect(rec.message).toBe(t.rec.dangerDefault)
  })
})
