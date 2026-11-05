/**
 * Gradient-boosted regression trees (squared-error loss), written from scratch.
 *
 * Histogram-based split search as in LightGBM: every feature is cut into at most `bins` quantile
 * buckets once, so each tree node only scans bucket totals instead of sorting its rows.
 * Each round fits a depth-limited tree to the current residuals on a random subsample, and adds it
 * scaled by the learning rate. Leaf value = Σresidual / (n + λ).
 */
import { createRng } from './random.ts'

export interface GbtParams {
  trees: number
  depth: number
  learningRate: number
  /** Fraction of rows used for each tree. */
  subsample: number
  minLeaf: number
  /** L2 regularization on leaf values. */
  lambda: number
  bins: number
  seed: number
}

/** Fixed in advance (research/PREREGISTRATION.md) — never tuned on a test fold. */
export const DEFAULT_GBT: GbtParams = { trees: 250, depth: 4, learningRate: 0.05, subsample: 0.8, minLeaf: 30, lambda: 1, bins: 48, seed: 7 }

/** A tree in flat arrays (compact to store as JSON). Node 0 is the root; `feature[i] === -1` marks a leaf. */
export interface Tree {
  feature: number[]
  threshold: number[]
  left: number[]
  right: number[]
  value: number[]
}

export interface GbtModel {
  base: number
  trees: Tree[]
  /** Total squared-error reduction per feature, summed over all splits. */
  importance: number[]
}

/** Upper bucket edges for one feature: `x` falls in the first bucket `b` with `x <= edges[b]`. */
export function bucketEdges(values: number[], bins: number): number[] {
  const sorted = [...values].sort((a, b) => a - b)
  const unique = sorted.filter((v, i) => i === 0 || v !== sorted[i - 1])
  if (unique.length <= bins) return unique.slice(0, -1)
  const edges: number[] = []
  for (let i = 1; i < bins; i++) {
    const edge = sorted[Math.floor((sorted.length * i) / bins)]
    if (edges.length === 0 || edge > edges[edges.length - 1]) edges.push(edge)
  }
  const max = sorted[sorted.length - 1]
  return edges.filter((e) => e < max)
}

function bucketOf(edges: number[], x: number): number {
  let lo = 0
  let hi = edges.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (x <= edges[mid]) hi = mid
    else lo = mid + 1
  }
  return lo
}

export function predictTree(tree: Tree, x: number[]): number {
  let node = 0
  while (tree.feature[node] !== -1) node = x[tree.feature[node]] <= tree.threshold[node] ? tree.left[node] : tree.right[node]
  return tree.value[node]
}

export function predictGbt(model: GbtModel, x: number[]): number {
  let out = model.base
  for (const tree of model.trees) out += predictTree(tree, x)
  return out
}

export function fitGbt(X: number[][], y: number[], params: GbtParams = DEFAULT_GBT): GbtModel {
  const n = X.length
  const p = X[0].length
  const edges = Array.from({ length: p }, (_, f) => bucketEdges(X.map((row) => row[f]), params.bins))
  const maxBuckets = params.bins + 1
  const binned = new Uint8Array(n * p)
  for (let i = 0; i < n; i++) for (let f = 0; f < p; f++) binned[i * p + f] = bucketOf(edges[f], X[i][f])

  const rng = createRng(params.seed)
  const base = y.reduce((s, v) => s + v, 0) / n
  const prediction = new Array<number>(n).fill(base)
  const residual = new Array<number>(n).fill(0)
  const importance = new Array<number>(p).fill(0)
  const trees: Tree[] = []

  const histSum = new Float64Array(p * maxBuckets)
  const histCount = new Float64Array(p * maxBuckets)

  function grow(tree: Tree, rows: number[], depth: number): number {
    const id = tree.feature.length
    let sum = 0
    for (const r of rows) sum += residual[r]
    tree.feature.push(-1)
    tree.threshold.push(0)
    tree.left.push(-1)
    tree.right.push(-1)
    tree.value.push((params.learningRate * sum) / (rows.length + params.lambda))

    if (depth >= params.depth || rows.length < 2 * params.minLeaf) return id

    histSum.fill(0)
    histCount.fill(0)
    for (const r of rows) {
      const g = residual[r]
      for (let f = 0; f < p; f++) {
        const slot = f * maxBuckets + binned[r * p + f]
        histSum[slot] += g
        histCount[slot] += 1
      }
    }

    const parentScore = (sum * sum) / (rows.length + params.lambda)
    let bestGain = 1e-9
    let bestFeature = -1
    let bestBucket = -1
    for (let f = 0; f < p; f++) {
      let leftSum = 0
      let leftCount = 0
      for (let b = 0; b < edges[f].length; b++) {
        leftSum += histSum[f * maxBuckets + b]
        leftCount += histCount[f * maxBuckets + b]
        const rightCount = rows.length - leftCount
        if (leftCount < params.minLeaf || rightCount < params.minLeaf) continue
        const gain = (leftSum * leftSum) / (leftCount + params.lambda) + ((sum - leftSum) ** 2) / (rightCount + params.lambda) - parentScore
        if (gain > bestGain) {
          bestGain = gain
          bestFeature = f
          bestBucket = b
        }
      }
    }
    if (bestFeature === -1) return id

    const leftRows: number[] = []
    const rightRows: number[] = []
    for (const r of rows) (binned[r * p + bestFeature] <= bestBucket ? leftRows : rightRows).push(r)

    importance[bestFeature] += bestGain
    tree.feature[id] = bestFeature
    tree.threshold[id] = edges[bestFeature][bestBucket]
    tree.left[id] = grow(tree, leftRows, depth + 1)
    tree.right[id] = grow(tree, rightRows, depth + 1)
    return id
  }

  const all = Array.from({ length: n }, (_, i) => i)
  for (let t = 0; t < params.trees; t++) {
    for (let i = 0; i < n; i++) residual[i] = y[i] - prediction[i]
    const rows = params.subsample >= 1 ? all : all.filter(() => rng() < params.subsample)
    const tree: Tree = { feature: [], threshold: [], left: [], right: [], value: [] }
    grow(tree, rows, 0)
    trees.push(tree)
    for (let i = 0; i < n; i++) prediction[i] += predictTree(tree, X[i])
  }
  return { base, trees, importance }
}
