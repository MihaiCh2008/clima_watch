import { createRng } from './random.ts'

export function rmse(obs: number[], pred: number[]): number {
  let sum = 0
  for (let i = 0; i < obs.length; i++) sum += (pred[i] - obs[i]) ** 2
  return Math.sqrt(sum / obs.length)
}

export function mae(obs: number[], pred: number[]): number {
  let sum = 0
  for (let i = 0; i < obs.length; i++) sum += Math.abs(pred[i] - obs[i])
  return sum / obs.length
}

/** Mean signed error (prediction − observation): negative = under-prediction. */
export function bias(obs: number[], pred: number[]): number {
  let sum = 0
  for (let i = 0; i < obs.length; i++) sum += pred[i] - obs[i]
  return sum / obs.length
}

export function pearson(a: number[], b: number[]): number {
  const n = a.length
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n
  let cov = 0
  let varA = 0
  let varB = 0
  for (let i = 0; i < n; i++) {
    cov += (a[i] - meanA) * (b[i] - meanB)
    varA += (a[i] - meanA) ** 2
    varB += (b[i] - meanB) ** 2
  }
  return cov / Math.sqrt(varA * varB)
}

export interface Confusion {
  tp: number
  fp: number
  fn: number
  tn: number
}

/** An "alert" is a value at or above `threshold`; the observation defines what should have been flagged. */
export function confusion(obs: number[], pred: number[], threshold: number): Confusion {
  const c: Confusion = { tp: 0, fp: 0, fn: 0, tn: 0 }
  for (let i = 0; i < obs.length; i++) {
    const actual = obs[i] >= threshold
    const flagged = pred[i] >= threshold
    if (actual && flagged) c.tp++
    else if (!actual && flagged) c.fp++
    else if (actual && !flagged) c.fn++
    else c.tn++
  }
  return c
}

export interface AlertScores {
  precision: number
  recall: number
  f1: number
  /** Share of real unhealthy days that were NOT flagged (missed alerts). */
  missRate: number
}

export function alertScores(c: Confusion): AlertScores {
  const precision = c.tp + c.fp === 0 ? 0 : c.tp / (c.tp + c.fp)
  const recall = c.tp + c.fn === 0 ? 0 : c.tp / (c.tp + c.fn)
  return {
    precision,
    recall,
    f1: precision + recall === 0 ? 0 : (2 * precision * recall) / (precision + recall),
    missRate: c.tp + c.fn === 0 ? 0 : c.fn / (c.tp + c.fn),
  }
}

export interface Fold {
  /** Index of the contiguous block of days held out. */
  fold: number
  test: string[]
  train: string[]
}

/**
 * Blocked K-fold over time-ordered days: each fold holds out one contiguous block, and the `gapDays`
 * days on each side of it are dropped from training, because neighbouring days are strongly
 * correlated (weather episodes last for days) and would otherwise leak into the test block.
 * Every day is tested exactly once.
 */
export function blockedFolds(days: string[], k: number, gapDays: number): Fold[] {
  const sorted = [...days].sort()
  const folds: Fold[] = []
  for (let f = 0; f < k; f++) {
    const from = Math.floor((sorted.length * f) / k)
    const to = Math.floor((sorted.length * (f + 1)) / k)
    folds.push({
      fold: f,
      test: sorted.slice(from, to),
      train: sorted.filter((_, i) => i < from - gapDays || i >= to + gapDays),
    })
  }
  return folds
}

/** Per-day sufficient statistics, so a bootstrap can resample whole days (the unit of a "test window"). */
export interface DayStats {
  hours: number
  sse: Record<string, number>
  confusion: Record<string, Confusion>
}

export interface Interval {
  estimate: number
  low: number
  high: number
}

function sumStats(days: DayStats[], models: string[]) {
  const total = { hours: 0, sse: {} as Record<string, number>, confusion: {} as Record<string, Confusion> }
  for (const m of models) {
    total.sse[m] = 0
    total.confusion[m] = { tp: 0, fp: 0, fn: 0, tn: 0 }
  }
  for (const d of days) {
    total.hours += d.hours
    for (const m of models) {
      total.sse[m] += d.sse[m]
      for (const key of ['tp', 'fp', 'fn', 'tn'] as const) total.confusion[m][key] += d.confusion[m][key]
    }
  }
  return total
}

/** Relative reduction of a statistic against the baseline: (baseline − model) / baseline. */
export function relativeReduction(baseline: number, model: number): number {
  return baseline === 0 ? 0 : (baseline - model) / baseline
}

/**
 * Day-block bootstrap (resamples days with replacement) of the relative RMSE reduction and the relative
 * reduction of the alert miss rate, of every model against `baseline`. Returns 95% percentile intervals.
 */
export function bootstrapImprovement(
  days: DayStats[],
  models: string[],
  baseline: string,
  resamples: number,
  seed: number
): Record<string, { rmse: Interval; missRate: Interval }> {
  const rng = createRng(seed)
  const statistic = (sample: DayStats[]) => {
    const total = sumStats(sample, models)
    const out: Record<string, { rmse: number; missRate: number }> = {}
    for (const m of models) {
      out[m] = { rmse: Math.sqrt(total.sse[m] / total.hours), missRate: alertScores(total.confusion[m]).missRate }
    }
    return out
  }

  const point = statistic(days)
  const draws: Record<string, { rmse: number[]; missRate: number[] }> = {}
  for (const m of models) draws[m] = { rmse: [], missRate: [] }
  for (let b = 0; b < resamples; b++) {
    const sample = Array.from({ length: days.length }, () => days[Math.floor(rng() * days.length)])
    const s = statistic(sample)
    for (const m of models) {
      draws[m].rmse.push(relativeReduction(s[baseline].rmse, s[m].rmse))
      draws[m].missRate.push(relativeReduction(s[baseline].missRate, s[m].missRate))
    }
  }

  const interval = (values: number[], estimate: number): Interval => {
    const sorted = [...values].sort((a, b) => a - b)
    return { estimate, low: sorted[Math.floor(0.025 * sorted.length)], high: sorted[Math.min(sorted.length - 1, Math.floor(0.975 * sorted.length))] }
  }
  const out: Record<string, { rmse: Interval; missRate: Interval }> = {}
  for (const m of models) {
    out[m] = {
      rmse: interval(draws[m].rmse, relativeReduction(point[baseline].rmse, point[m].rmse)),
      missRate: interval(draws[m].missRate, relativeReduction(point[baseline].missRate, point[m].missRate)),
    }
  }
  return out
}
