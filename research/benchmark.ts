/**
 * The benchmark described in research/PREREGISTRATION.md.
 *
 *   node research/benchmark.ts
 *
 * Reads research/data/dataset-*.csv, writes research/results/benchmark.json and benchmark.md.
 */
import { writeFile } from 'node:fs/promises'
import { cpus } from 'node:os'
import { fileURLToPath } from 'node:url'
import { CITIES, PERIOD } from './config.ts'
import { buildFeatures, FEATURE_NAMES } from './features.ts'
import {
  alertScores, bias, blockedFolds, bootstrapImprovement, confusion, mae, pearson, rmse,
  type Confusion, type DayStats,
} from './ml/evaluation.ts'
import { DEFAULT_GBT, fitGbt, predictGbt, type GbtModel } from './ml/gbt.ts'
import { fitRidge, fitRidgeSelect, predictRidge, type RidgeModel } from './ml/ridge.ts'
import { readDataset, type HourRow } from './pipeline/dataset.ts'

const MODELS = ['raw', 'scaled', 'ridge', 'gbt'] as const
type ModelId = (typeof MODELS)[number]
type Predictions = Record<ModelId, number>

const FOLDS = 6
const GAP_DAYS = 2
const MIN_HOURS_PER_WINDOW = 18
const BOOTSTRAP = { resamples: 2000, seed: 11 }
const WHO_24H = 15
const EPA_USG = 35.5
const HUMID = 75
const FORWARD_SPLIT = '2026-07-01'

const DATA_DIR = fileURLToPath(new URL('./data/', import.meta.url))
const OUT_DIR = fileURLToPath(new URL('./results/', import.meta.url))

interface Sample {
  city: string
  day: string
  ts: number
  obs: number
  rh: number
  pred: Predictions
}

interface CityData {
  id: string
  name: string
  rows: HourRow[]
  X: number[][]
  /** Row indices that have ground truth, grouped by UTC day (only days with enough hours). */
  days: Map<string, number[]>
}

interface Fitted {
  scaled: RidgeModel
  ridge: RidgeModel
  gbt: GbtModel
}

const dayOf = (ts: number) => new Date(ts * 1000).toISOString().slice(0, 10)
const round = (v: number, d = 3) => Number(v.toFixed(d))

function loadCity(id: string, name: string, rows: HourRow[]): CityData {
  const X = buildFeatures(rows)
  const days = new Map<string, number[]>()
  rows.forEach((r, i) => {
    if (r.obsPm25 === null) return
    const d = dayOf(r.ts)
    days.set(d, [...(days.get(d) ?? []), i])
  })
  for (const [d, idx] of days) if (idx.length < MIN_HOURS_PER_WINDOW) days.delete(d)
  return { id, name, rows, X, days }
}

function trainingSet(city: CityData, trainDays: string[]) {
  const idx = trainDays.flatMap((d) => city.days.get(d) ?? []).sort((a, b) => a - b)
  return { X: idx.map((i) => city.X[i]), y: idx.map((i) => city.rows[i].obsPm25 as number) }
}

function fitAll(X: number[][], y: number[]): Fitted {
  return {
    scaled: fitRidge(X.map((row) => [row[0]]), y, 1e-6),
    ridge: fitRidgeSelect(X, y),
    gbt: fitGbt(X, y, DEFAULT_GBT),
  }
}

function predictAll(fitted: Fitted, x: number[]): Predictions {
  const clip = (v: number) => Math.max(0, v)
  return {
    raw: x[0],
    scaled: clip(predictRidge(fitted.scaled, [x[0]])),
    ridge: clip(predictRidge(fitted.ridge, x)),
    gbt: clip(predictGbt(fitted.gbt, x)),
  }
}

function samplesFor(city: CityData, testDays: string[], fitted: Fitted): Sample[] {
  return testDays.flatMap((d) =>
    (city.days.get(d) ?? []).map((i) => ({
      city: city.id,
      day: d,
      ts: city.rows[i].ts,
      obs: city.rows[i].obsPm25 as number,
      rh: city.rows[i].rh,
      pred: predictAll(fitted, city.X[i]),
    }))
  )
}

const col = (samples: Sample[], m: ModelId) => samples.map((s) => s.pred[m])

function hourlyMetrics(samples: Sample[]) {
  const obs = samples.map((s) => s.obs)
  const out = {} as Record<ModelId, { rmse: number; mae: number; bias: number; r: number }>
  for (const m of MODELS) {
    const p = col(samples, m)
    out[m] = { rmse: round(rmse(obs, p)), mae: round(mae(obs, p)), bias: round(bias(obs, p)), r: round(pearson(obs, p)) }
  }
  return out
}

/** One (city, day) window: hourly squared error per model and the day's alert outcome at `threshold`. */
function windows(samples: Sample[], threshold: number): DayStats[] {
  const byWindow = new Map<string, Sample[]>()
  for (const s of samples) byWindow.set(`${s.city}|${s.day}`, [...(byWindow.get(`${s.city}|${s.day}`) ?? []), s])
  return [...byWindow.values()].map((hours) => {
    const meanObs = hours.reduce((a, s) => a + s.obs, 0) / hours.length
    const stats: DayStats = { hours: hours.length, sse: {}, confusion: {} }
    for (const m of MODELS) {
      stats.sse[m] = hours.reduce((a, s) => a + (s.pred[m] - s.obs) ** 2, 0)
      const meanPred = hours.reduce((a, s) => a + s.pred[m], 0) / hours.length
      stats.confusion[m] = confusion([meanObs], [meanPred], threshold)
    }
    return stats
  })
}

function dailyMetrics(samples: Sample[], threshold: number) {
  const wins = windows(samples, threshold)
  const byWindow = new Map<string, Sample[]>()
  for (const s of samples) byWindow.set(`${s.city}|${s.day}`, [...(byWindow.get(`${s.city}|${s.day}`) ?? []), s])
  const groups = [...byWindow.values()]
  const meanObs = groups.map((g) => g.reduce((a, s) => a + s.obs, 0) / g.length)

  const out = {} as Record<ModelId, { dailyRmse: number; dailyMae: number; confusion: Confusion; precision: number; recall: number; f1: number; missRate: number }>
  for (const m of MODELS) {
    const meanPred = groups.map((g) => g.reduce((a, s) => a + s.pred[m], 0) / g.length)
    const c = wins.reduce((acc, w) => ({ tp: acc.tp + w.confusion[m].tp, fp: acc.fp + w.confusion[m].fp, fn: acc.fn + w.confusion[m].fn, tn: acc.tn + w.confusion[m].tn }), { tp: 0, fp: 0, fn: 0, tn: 0 })
    const s = alertScores(c)
    out[m] = {
      dailyRmse: round(rmse(meanObs, meanPred)),
      dailyMae: round(mae(meanObs, meanPred)),
      confusion: c,
      precision: round(s.precision),
      recall: round(s.recall),
      f1: round(s.f1),
      missRate: round(s.missRate),
    }
  }
  return { windows: wins.length, observedAlertDays: wins.filter((w) => w.confusion.raw.tp + w.confusion.raw.fn > 0).length, models: out }
}

function improvement(samples: Sample[], threshold: number) {
  const intervals = bootstrapImprovement(windows(samples, threshold), [...MODELS], 'raw', BOOTSTRAP.resamples, BOOTSTRAP.seed)
  const fmt = (i: { estimate: number; low: number; high: number }) => ({ estimate: round(i.estimate), low: round(i.low), high: round(i.high) })
  return Object.fromEntries(MODELS.filter((m) => m !== 'raw').map((m) => [m, { rmse: fmt(intervals[m].rmse), missRate: fmt(intervals[m].missRate) }]))
}

function summarize(samples: Sample[]) {
  return { windows: new Set(samples.map((s) => `${s.city}|${s.day}`)).size, hours: samples.length, hourly: hourlyMetrics(samples), improvementAt15: improvement(samples, WHO_24H) }
}

/** Blocked K-fold cross-validation per city; returns every held-out prediction. */
function crossValidate(city: CityData): { samples: Sample[]; trainMs: number } {
  const samples: Sample[] = []
  let trainMs = 0
  for (const fold of blockedFolds([...city.days.keys()], FOLDS, GAP_DAYS)) {
    const { X, y } = trainingSet(city, fold.train)
    const started = performance.now()
    const fitted = fitAll(X, y)
    trainMs += performance.now() - started
    samples.push(...samplesFor(city, fold.test, fitted))
  }
  return { samples, trainMs: trainMs / FOLDS }
}

function season(day: string): string {
  const month = Number(day.slice(5, 7))
  if (month <= 3) return 'Jan–Mar (heating season)'
  if (month <= 5) return 'Apr–May'
  if (month <= 8) return 'Jun–Aug'
  return 'Sep–Oct'
}

function medianTime(fn: () => void, repeats: number): number {
  const times: number[] = []
  for (let i = 0; i < repeats; i++) {
    const t = performance.now()
    fn()
    times.push(performance.now() - t)
  }
  return times.sort((a, b) => a - b)[Math.floor(times.length / 2)]
}

/**
 * Exploratory (not in the pre-registration): how much cleaner is the best 2-hour stretch of a day than the
 * day's average, in the observed data? This is the exposure a planner user can avoid per hour spent outdoors.
 */
function plannerGain(city: CityData) {
  const gains: number[] = []
  const alertDayGains: number[] = []
  for (const idx of city.days.values()) {
    const series = idx.map((i) => city.rows[i].obsPm25 as number)
    const mean = series.reduce((a, v) => a + v, 0) / series.length
    let best = Infinity
    for (let i = 0; i + 1 < series.length; i++) best = Math.min(best, (series[i] + series[i + 1]) / 2)
    gains.push(mean - best)
    if (mean >= WHO_24H) alertDayGains.push(mean - best)
  }
  const avg = (v: number[]) => (v.length ? round(v.reduce((a, x) => a + x, 0) / v.length, 2) : null)
  return { city: city.name, days: gains.length, meanGainUgm3: avg(gains), alertDays: alertDayGains.length, meanGainOnAlertDaysUgm3: avg(alertDayGains) }
}

async function main() {
  const cities = await Promise.all(CITIES.map(async (c) => loadCity(c.id, c.name, await readDataset(`${DATA_DIR}dataset-${c.id}.csv`))))
  const result: Record<string, unknown> = {}

  // ---- data summary
  result.data = cities.map((c) => {
    const obs = [...c.days.values()].flat().map((i) => c.rows[i].obsPm25 as number)
    const dailyMeans = [...c.days.values()].map((idx) => idx.reduce((a, i) => a + (c.rows[i].obsPm25 as number), 0) / idx.length)
    return {
      city: c.name,
      hours: c.rows.length,
      hoursWithTruth: obs.length,
      windows: c.days.size,
      firstDay: dayOf(c.rows[0].ts),
      lastDay: dayOf(c.rows[c.rows.length - 1].ts),
      meanObsPm25: round(obs.reduce((a, v) => a + v, 0) / obs.length, 2),
      meanOwmPm25: round(c.rows.reduce((a, r) => a + r.owmPm25, 0) / c.rows.length, 2),
      daysAbove15: dailyMeans.filter((v) => v >= WHO_24H).length,
      daysAbove35_5: dailyMeans.filter((v) => v >= EPA_USG).length,
    }
  })

  // ---- primary: blocked K-fold CV
  const perCity = cities.map((c) => ({ city: c, ...crossValidate(c) }))
  const all = perCity.flatMap((p) => p.samples)
  result.primary = {
    scheme: `blocked ${FOLDS}-fold CV per city, ${GAP_DAYS}-day gap`,
    pooled: { ...summarize(all), daily15: dailyMetrics(all, WHO_24H), daily35_5: dailyMetrics(all, EPA_USG), improvementAt35_5: improvement(all, EPA_USG) },
    perCity: Object.fromEntries(perCity.map((p) => [p.city.name, { ...summarize(p.samples), daily15: dailyMetrics(p.samples, WHO_24H) }])),
  }

  // ---- robustness 1: humid hours removed (low-cost sensors read high in humid air)
  const dry = all.filter((s) => s.rh < HUMID)
  result.dryHoursOnly = { ...summarize(dry), shareOfHours: round(dry.length / all.length), rhBelow: HUMID }

  // ---- robustness 2: forward chaining (train on the past only)
  const forward: Sample[] = []
  for (const c of cities) {
    const days = [...c.days.keys()].sort()
    const trainDays = days.filter((d) => d < FORWARD_SPLIT).slice(0, -GAP_DAYS)
    const testDays = days.filter((d) => d >= FORWARD_SPLIT)
    const { X, y } = trainingSet(c, trainDays)
    forward.push(...samplesFor(c, testDays, fitAll(X, y)))
  }
  result.forwardChaining = { trainBefore: FORWARD_SPLIT, ...summarize(forward), daily15: dailyMetrics(forward, WHO_24H) }

  // ---- robustness 3: cross-city transfer
  result.transfer = cities.map((target) => {
    const source = cities.find((c) => c.id !== target.id) as CityData
    const { X, y } = trainingSet(source, [...source.days.keys()])
    return { trainedOn: source.name, testedOn: target.name, ...summarize(samplesFor(target, [...target.days.keys()], fitAll(X, y))) }
  })

  // ---- robustness 4: by season
  const seasons = [...new Set(all.map((s) => season(s.day)))].sort()
  result.bySeason = seasons.map((name) => {
    const subset = all.filter((s) => season(s.day) === name)
    return { season: name, ...summarize(subset) }
  })

  // ---- robustness 5: what the models learned (full data, per city) + latency
  const fullFits = cities.map((c) => {
    const { X, y } = trainingSet(c, [...c.days.keys()])
    return { city: c, X, fitted: fitAll(X, y) }
  })
  result.featureImportance = fullFits.map(({ city, fitted }) => {
    const totalGain = fitted.gbt.importance.reduce((a, v) => a + v, 0)
    return {
      city: city.name,
      gbtShareOfGain: FEATURE_NAMES.map((name, i) => ({ feature: name, share: round(fitted.gbt.importance[i] / totalGain, 4) })).sort((a, b) => b.share - a.share),
      ridgeStandardizedWeights: FEATURE_NAMES.map((name, i) => ({ feature: name, weight: round(fitted.ridge.weights[i], 3) })).sort((a, b) => Math.abs(b.weight) - Math.abs(a.weight)),
      ridgeLambda: fitted.ridge.lambda,
      gbtTrees: fitted.gbt.trees.length,
      gbtNodes: fitted.gbt.trees.reduce((a, t) => a + t.feature.length, 0),
    }
  })

  const { city: latencyCity, fitted: latencyFit } = fullFits[0]
  const rowsForLatency = latencyCity.X
  // each model's own predictor is timed separately (predictAll would evaluate all four)
  const single: Record<ModelId, (x: number[]) => number> = {
    raw: (x) => x[0],
    scaled: (x) => predictRidge(latencyFit.scaled, [x[0]]),
    ridge: (x) => predictRidge(latencyFit.ridge, x),
    gbt: (x) => predictGbt(latencyFit.gbt, x),
  }
  result.latency = {
    machine: `${cpus()[0].model.trim()} (${cpus().length} threads), Node ${process.version}`,
    predictions: rowsForLatency.length,
    perPredictionMicroseconds: Object.fromEntries(MODELS.map((m) => [m, round((medianTime(() => { for (const x of rowsForLatency) single[m](x) }, 15) / rowsForLatency.length) * 1000, 3)])),
    per24hWindowMilliseconds: Object.fromEntries(MODELS.map((m) => [m, round((medianTime(() => { for (const x of rowsForLatency.slice(0, 24)) single[m](x) }, 200)), 4)])),
    meanTrainingMillisecondsPerFold: round(perCity.reduce((a, p) => a + p.trainMs, 0) / perCity.length, 0),
  }

  result.plannerGain = cities.map(plannerGain)

  result.meta = {
    generatedAt: new Date().toISOString(),
    period: PERIOD,
    folds: FOLDS,
    gapDays: GAP_DAYS,
    minHoursPerWindow: MIN_HOURS_PER_WINDOW,
    bootstrap: BOOTSTRAP,
    gbtParams: DEFAULT_GBT,
    features: FEATURE_NAMES,
    thresholds: { who24h: WHO_24H, epaUsg: EPA_USG },
  }

  await writeFile(`${OUT_DIR}benchmark.json`, `${JSON.stringify(result, null, 2)}\n`)
  console.log(`wrote ${OUT_DIR}benchmark.json`)
}

await main()
