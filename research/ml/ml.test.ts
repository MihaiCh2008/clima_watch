import { describe, expect, it } from 'vitest'
import { alertScores, blockedFolds, bootstrapImprovement, confusion, mae, bias, pearson, relativeReduction, rmse, type DayStats } from './evaluation.ts'
import { bucketEdges, fitGbt, predictGbt, type GbtParams } from './gbt.ts'
import { createRng } from './random.ts'
import { fitRidge, fitRidgeSelect, predictRidge, solveSpd } from './ridge.ts'

function makeData(n: number, fn: (x: number[]) => number, noise = 0, seed = 1) {
  const rng = createRng(seed)
  const X = Array.from({ length: n }, () => [rng() * 10, rng() * 10, rng() * 10])
  const y = X.map((x) => fn(x) + (rng() - 0.5) * noise)
  return { X, y }
}

describe('createRng', () => {
  it('is deterministic for a seed and stays in [0, 1)', () => {
    const a = createRng(42)
    const b = createRng(42)
    const first = Array.from({ length: 5 }, a)
    expect(Array.from({ length: 5 }, b)).toEqual(first)
    expect(first.every((v) => v >= 0 && v < 1)).toBe(true)
    expect(createRng(43)()).not.toBe(first[0])
  })
})

describe('solveSpd', () => {
  it('solves a small symmetric positive-definite system', () => {
    // [[4,1],[1,3]] x = [1,2]  →  x = [1/11, 7/11]
    const x = solveSpd([[4, 1], [1, 3]], [1, 2])
    expect(x[0]).toBeCloseTo(1 / 11, 10)
    expect(x[1]).toBeCloseTo(7 / 11, 10)
  })

  it('rejects a matrix that is not positive definite', () => {
    expect(() => solveSpd([[1, 2], [2, 1]], [1, 1])).toThrow()
  })
})

describe('ridge', () => {
  it('recovers a linear relationship almost exactly when λ is tiny', () => {
    const { X, y } = makeData(400, ([a, b]) => 3 + 2 * a - 0.5 * b)
    const model = fitRidge(X, y, 1e-6)
    expect(predictRidge(model, [4, 6, 1])).toBeCloseTo(3 + 8 - 3, 4)
  })

  it('shrinks the weights as λ grows', () => {
    const { X, y } = makeData(300, ([a]) => 5 * a, 1)
    const small = fitRidge(X, y, 0.1)
    const large = fitRidge(X, y, 100_000)
    expect(Math.abs(large.weights[0])).toBeLessThan(Math.abs(small.weights[0]) / 10)
  })

  it('copes with a constant column', () => {
    const X = Array.from({ length: 50 }, (_, i) => [i, 7])
    const y = X.map(([a]) => 2 * a)
    const model = fitRidge(X, y, 1e-6)
    expect(predictRidge(model, [10, 7])).toBeCloseTo(20, 3)
  })

  it('chooses λ from the training rows only and returns a usable model', () => {
    const { X, y } = makeData(500, ([a, b]) => a + b, 2)
    const model = fitRidgeSelect(X, y)
    expect([0.1, 1, 10, 100, 1000]).toContain(model.lambda)
    expect(rmse(y, X.map((x) => predictRidge(model, x)))).toBeLessThan(1)
  })
})

describe('gradient-boosted trees', () => {
  const params: GbtParams = { trees: 120, depth: 3, learningRate: 0.1, subsample: 1, minLeaf: 5, lambda: 1, bins: 128, seed: 3 }
  // not representable by a linear model: depends on an interaction and a threshold
  const target = ([a, b]: number[]) => (a > 5 && b > 5 ? 20 : a > 5 ? 8 : 2)

  it('learns an interaction that ridge regression cannot', () => {
    const train = makeData(1500, target, 0, 11)
    const test = makeData(500, target, 0, 12)
    const gbt = fitGbt(train.X, train.y, params)
    const ridge = fitRidge(train.X, train.y, 1)
    const gbtError = rmse(test.y, test.X.map((x) => predictGbt(gbt, x)))
    const ridgeError = rmse(test.y, test.X.map((x) => predictRidge(ridge, x)))
    expect(gbtError).toBeLessThan(1.5)
    expect(gbtError).toBeLessThan(ridgeError / 3)
  })

  it('is deterministic for a given seed, even with subsampling', () => {
    const { X, y } = makeData(300, target, 1, 5)
    const p = { ...params, subsample: 0.7, trees: 20 }
    const a = fitGbt(X, y, p)
    const b = fitGbt(X, y, p)
    expect(X.slice(0, 20).map((x) => predictGbt(a, x))).toEqual(X.slice(0, 20).map((x) => predictGbt(b, x)))
  })

  it('puts the importance on the features that matter', () => {
    const { X, y } = makeData(800, ([a]) => 4 * a, 0.5, 9)
    const model = fitGbt(X, y, { ...params, trees: 40 })
    const [first, second, third] = model.importance
    expect(first).toBeGreaterThan(10 * Math.max(second, third))
  })

  it('does not split below the minimum leaf size and handles a constant target', () => {
    const X = Array.from({ length: 40 }, (_, i) => [i])
    const model = fitGbt(X, new Array<number>(40).fill(5), { ...params, trees: 5 })
    expect(model.trees.every((t) => t.feature.length === 1)).toBe(true)
    expect(predictGbt(model, [3])).toBeCloseTo(5, 6)
  })

  it('bucketEdges returns the distinct values (minus the max) for low-cardinality features', () => {
    expect(bucketEdges([1, 2, 2, 3, 3, 3], 10)).toEqual([1, 2])
    expect(bucketEdges(new Array<number>(50).fill(4), 10)).toEqual([])
  })
})

describe('error metrics', () => {
  it('computes RMSE, MAE, bias and correlation', () => {
    const obs = [10, 20, 30]
    const pred = [12, 18, 36]
    expect(rmse(obs, pred)).toBeCloseTo(Math.sqrt((4 + 4 + 36) / 3), 10)
    expect(mae(obs, pred)).toBeCloseTo(10 / 3, 10)
    expect(bias(obs, pred)).toBeCloseTo(2, 10)
    expect(pearson(obs, obs.map((v) => 3 * v + 1))).toBeCloseTo(1, 10)
  })

  it('builds a confusion matrix and alert scores at a threshold', () => {
    const obs = [5, 20, 30, 10, 16]
    const pred = [20, 25, 4, 6, 14]
    const c = confusion(obs, pred, 15)
    expect(c).toEqual({ tp: 1, fp: 1, fn: 2, tn: 1 })
    const s = alertScores(c)
    expect(s.precision).toBeCloseTo(0.5, 10)
    expect(s.recall).toBeCloseTo(1 / 3, 10)
    expect(s.missRate).toBeCloseTo(2 / 3, 10)
    expect(s.f1).toBeCloseTo(0.4, 10)
  })

  it('returns zeros instead of NaN when there is nothing to alert on', () => {
    expect(alertScores({ tp: 0, fp: 0, fn: 0, tn: 5 })).toEqual({ precision: 0, recall: 0, f1: 0, missRate: 0 })
  })

  it('relativeReduction is the share of the baseline error removed', () => {
    expect(relativeReduction(10, 7)).toBeCloseTo(0.3, 10)
    expect(relativeReduction(10, 12)).toBeCloseTo(-0.2, 10)
    expect(relativeReduction(0, 0)).toBe(0)
  })
})

describe('blockedFolds', () => {
  const days = Array.from({ length: 100 }, (_, i) => `d${String(i).padStart(3, '0')}`)

  it('tests every day exactly once', () => {
    const folds = blockedFolds(days, 5, 2)
    expect(folds.flatMap((f) => f.test).sort()).toEqual(days)
  })

  it('never trains on a test day or on the gap days next to it', () => {
    for (const fold of blockedFolds(days, 5, 2)) {
      const first = days.indexOf(fold.test[0])
      const last = days.indexOf(fold.test[fold.test.length - 1])
      for (const d of fold.train) {
        const i = days.indexOf(d)
        expect(i < first - 2 || i > last + 2).toBe(true)
      }
    }
  })
})

describe('bootstrapImprovement', () => {
  const day = (sseBase: number, sseModel: number, modelMissed: boolean): DayStats => ({
    hours: 24,
    sse: { base: sseBase, model: sseModel },
    confusion: {
      base: { tp: 0, fp: 0, fn: 1, tn: 0 },
      model: modelMissed ? { tp: 0, fp: 0, fn: 1, tn: 0 } : { tp: 1, fp: 0, fn: 0, tn: 0 },
    },
  })

  it('reports a clear improvement with an interval that excludes zero', () => {
    const days = Array.from({ length: 120 }, (_, i) => day(100 + (i % 7), 36 + (i % 5), i % 4 === 0))
    const result = bootstrapImprovement(days, ['base', 'model'], 'base', 400, 1)
    expect(result.model.rmse.estimate).toBeGreaterThan(0.35)
    expect(result.model.rmse.low).toBeGreaterThan(0.3)
    expect(result.model.rmse.low).toBeLessThanOrEqual(result.model.rmse.estimate)
    expect(result.model.rmse.high).toBeGreaterThanOrEqual(result.model.rmse.estimate)
    expect(result.model.missRate.estimate).toBeCloseTo(0.75, 5)
  })

  it('shows no improvement for a model identical to the baseline', () => {
    const days = Array.from({ length: 80 }, (_, i) => ({
      hours: 24,
      sse: { base: 50 + i, model: 50 + i },
      confusion: { base: { tp: 1, fp: 0, fn: 0, tn: 0 }, model: { tp: 1, fp: 0, fn: 0, tn: 0 } },
    }))
    const result = bootstrapImprovement(days, ['base', 'model'], 'base', 200, 2)
    expect(result.model.rmse).toEqual({ estimate: 0, low: 0, high: 0 })
  })

  it('is reproducible for a seed', () => {
    const days = Array.from({ length: 60 }, (_, i) => day(90 + (i % 9), 50 + (i % 6), i % 3 === 0))
    const a = bootstrapImprovement(days, ['base', 'model'], 'base', 100, 7)
    const b = bootstrapImprovement(days, ['base', 'model'], 'base', 100, 7)
    expect(a).toEqual(b)
  })
})
