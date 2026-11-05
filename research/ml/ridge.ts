/**
 * Ridge regression (L2-regularized least squares), closed form:
 *   w = (ZᵀZ + λI)⁻¹ Zᵀ(y − ȳ),  Z = standardized features, intercept left unpenalized.
 */
export interface RidgeModel {
  means: number[]
  stds: number[]
  weights: number[]
  intercept: number
  lambda: number
}

/** Solves A x = b for a symmetric positive-definite A (Cholesky decomposition). */
export function solveSpd(a: number[][], b: number[]): number[] {
  const n = b.length
  const l: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0))
  for (let i = 0; i < n; i++) {
    for (let j = 0; j <= i; j++) {
      let sum = a[i][j]
      for (let k = 0; k < j; k++) sum -= l[i][k] * l[j][k]
      if (i === j) {
        if (sum <= 0) throw new Error('Matrix is not positive definite')
        l[i][i] = Math.sqrt(sum)
      } else {
        l[i][j] = sum / l[j][j]
      }
    }
  }
  const z = new Array<number>(n).fill(0)
  for (let i = 0; i < n; i++) {
    let sum = b[i]
    for (let k = 0; k < i; k++) sum -= l[i][k] * z[k]
    z[i] = sum / l[i][i]
  }
  const x = new Array<number>(n).fill(0)
  for (let i = n - 1; i >= 0; i--) {
    let sum = z[i]
    for (let k = i + 1; k < n; k++) sum -= l[k][i] * x[k]
    x[i] = sum / l[i][i]
  }
  return x
}

export function fitRidge(X: number[][], y: number[], lambda: number): RidgeModel {
  const n = X.length
  const p = X[0].length
  const means = new Array<number>(p).fill(0)
  for (const row of X) for (let j = 0; j < p; j++) means[j] += row[j] / n
  const stds = new Array<number>(p).fill(0)
  for (const row of X) for (let j = 0; j < p; j++) stds[j] += (row[j] - means[j]) ** 2 / n
  for (let j = 0; j < p; j++) stds[j] = Math.sqrt(stds[j]) || 1

  const yMean = y.reduce((s, v) => s + v, 0) / n
  const gram: number[][] = Array.from({ length: p }, () => new Array<number>(p).fill(0))
  const rhs = new Array<number>(p).fill(0)
  const z = new Array<number>(p).fill(0)
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) z[j] = (X[i][j] - means[j]) / stds[j]
    for (let j = 0; j < p; j++) {
      rhs[j] += z[j] * (y[i] - yMean)
      for (let k = 0; k <= j; k++) gram[j][k] += z[j] * z[k]
    }
  }
  for (let j = 0; j < p; j++) {
    for (let k = j + 1; k < p; k++) gram[j][k] = gram[k][j]
    gram[j][j] += lambda
  }
  return { means, stds, weights: solveSpd(gram, rhs), intercept: yMean, lambda }
}

export function predictRidge(model: RidgeModel, x: number[]): number {
  let out = model.intercept
  for (let j = 0; j < x.length; j++) out += (model.weights[j] * (x[j] - model.means[j])) / model.stds[j]
  return out
}

export const RIDGE_LAMBDAS = [0.1, 1, 10, 100, 1000]

/**
 * Picks λ on the most recent `validFraction` of the (time-ordered) training rows, then refits on all of them.
 * Only training data is used, so a test fold never influences its own model.
 */
export function fitRidgeSelect(X: number[][], y: number[], lambdas: number[] = RIDGE_LAMBDAS, validFraction = 0.2): RidgeModel {
  const cut = Math.floor(X.length * (1 - validFraction))
  let best = lambdas[0]
  let bestError = Infinity
  for (const lambda of lambdas) {
    const model = fitRidge(X.slice(0, cut), y.slice(0, cut), lambda)
    let sse = 0
    for (let i = cut; i < X.length; i++) sse += (predictRidge(model, X[i]) - y[i]) ** 2
    if (sse < bestError) {
      bestError = sse
      best = lambda
    }
  }
  return fitRidge(X, y, best)
}
