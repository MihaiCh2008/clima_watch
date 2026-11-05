import { describe, expect, it } from 'vitest'
import benchmark from '../../research/results/benchmark.json'
import {
  CACHE_TTL, DEFAULT_TRAFFIC, HEALTH_SCENARIOS, OWM_FREE_CALLS_PER_MONTH, UPSTREAM_CALLS,
  attributableFraction, displayFleetCost, estimateHealthImpact, estimateInfra, exposureReduction,
  expectedMissesPerWindow, maxUsersOnFreeTier, monthlyMisses, usersPerAvoidedEpisode, zipfWeights,
} from './economics'

describe('zipfWeights', () => {
  it('sums to 1 and ranks cities by popularity', () => {
    const w = zipfWeights(100, 1)
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 10)
    expect(w[0]).toBeGreaterThan(w[1])
    expect(w[0] / w[1]).toBeCloseTo(2, 10)
  })

  it('is uniform for exponent 0', () => {
    expect(new Set(zipfWeights(4, 0).map((v) => v.toFixed(6)))).toEqual(new Set(['0.250000']))
  })
})

describe('expectedMissesPerWindow', () => {
  it('is one miss at most for a single key, approaching 1 as traffic grows', () => {
    expect(expectedMissesPerWindow(0, [1])).toBe(0)
    expect(expectedMissesPerWindow(1, [1])).toBeCloseTo(1 - Math.exp(-1), 10)
    expect(expectedMissesPerWindow(1000, [1])).toBeCloseTo(1, 6)
  })

  it('never exceeds the number of requests or the number of keys', () => {
    const w = zipfWeights(50, 1)
    for (const requests of [0.5, 5, 50, 5000]) {
      const misses = expectedMissesPerWindow(requests, w)
      expect(misses).toBeLessThanOrEqual(requests + 1e-9)
      expect(misses).toBeLessThanOrEqual(50 + 1e-9)
    }
  })
})

describe('monthlyMisses', () => {
  it('caps at the number of requests when traffic is sparse', () => {
    expect(monthlyMisses(10, 600, [1])).toBeLessThanOrEqual(10)
  })

  it('a longer TTL means fewer misses', () => {
    const w = zipfWeights(200, 1)
    expect(monthlyMisses(100_000, 3600, w)).toBeLessThan(monthlyMisses(100_000, 600, w))
  })
})

describe('estimateInfra', () => {
  it('counts upstream calls per action without a cache', () => {
    const e = estimateInfra({ users: 1000, sessionsPerUserPerMonth: 2, plannerShare: 0.5, distinctCities: 100, zipfExponent: 1 })
    const sessions = 2000
    const expected = sessions * (UPSTREAM_CALLS.globe + UPSTREAM_CALLS.search + UPSTREAM_CALLS.history) + sessions * 0.5 * UPSTREAM_CALLS.planner
    expect(e.callsWithoutCache).toBe(expected)
  })

  it('the cache removes calls, and more of them as the audience grows', () => {
    const small = estimateInfra({ ...DEFAULT_TRAFFIC, users: 1_000 })
    const large = estimateInfra({ ...DEFAULT_TRAFFIC, users: 100_000 })
    expect(small.callsWithCache).toBeLessThan(small.callsWithoutCache)
    expect(large.callsWithCache).toBeLessThan(large.callsWithoutCache)
    expect(large.reduction).toBeGreaterThan(small.reduction)
  })

  it('the globe endpoint is bounded by its refresh rate, independent of audience size', () => {
    const windows = (30 * 24 * 3600) / CACHE_TTL.globe
    const e = estimateInfra({ ...DEFAULT_TRAFFIC, users: 1_000_000 })
    expect(e.endpoints.globe.callsWithCache).toBeLessThanOrEqual(windows * UPSTREAM_CALLS.globe)
  })

  it('10,000 users stay inside the free tiers with the cache but not without it (default assumptions)', () => {
    const e = estimateInfra(DEFAULT_TRAFFIC)
    expect(e.callsWithoutCache).toBeGreaterThan(OWM_FREE_CALLS_PER_MONTH)
    expect(e.callsWithCache).toBeLessThan(OWM_FREE_CALLS_PER_MONTH)
    expect(e.fitsOwmFreeTier).toBe(true)
    expect(e.fitsOwmFreeTierWithoutCache).toBe(false)
    expect(e.fitsVercelFreeTier).toBe(true)
  })

  it('handles an empty audience', () => {
    const e = estimateInfra({ ...DEFAULT_TRAFFIC, users: 0 })
    expect(e.callsWithoutCache).toBe(0)
    expect(e.callsWithCache).toBe(0)
    expect(e.reduction).toBe(0)
  })
})

describe('maxUsersOnFreeTier', () => {
  it('is much larger with the cache and lands exactly on the quota', () => {
    const { users: _users, ...traffic } = DEFAULT_TRAFFIC
    const without = maxUsersOnFreeTier(traffic, false)
    const withCache = maxUsersOnFreeTier(traffic, true)
    expect(withCache).toBeGreaterThan(without * 2)
    expect(estimateInfra({ ...traffic, users: withCache }).callsWithCache).toBeLessThanOrEqual(OWM_FREE_CALLS_PER_MONTH)
    expect(estimateInfra({ ...traffic, users: withCache + 2000 }).callsWithCache).toBeGreaterThan(OWM_FREE_CALLS_PER_MONTH)
  })
})

describe('health economics', () => {
  it('attributable fraction is 0 for no change and grows with the exposure change', () => {
    expect(attributableFraction(1.036, 0)).toBe(0)
    expect(attributableFraction(1.036, 10)).toBeCloseTo(1 - 1 / 1.036, 10)
    expect(attributableFraction(1.036, 20)).toBeGreaterThan(attributableFraction(1.036, 10))
  })

  it('exposure reduction scales with adherence, outdoor hours and the cleaner-window gain', () => {
    const base = HEALTH_SCENARIOS.base
    expect(exposureReduction(base)).toBeCloseTo((0.18 * 2 * 3.2) / 24, 10)
    expect(exposureReduction({ ...base, adherence: 0 })).toBe(0)
  })

  it('orders the scenarios low < base < high and stays small in absolute terms', () => {
    const [low, base, high] = (['low', 'base', 'high'] as const).map((k) => estimateHealthImpact(10_000, HEALTH_SCENARIOS[k]))
    expect(low.avoidedEpisodesPerYear).toBeLessThan(base.avoidedEpisodesPerYear)
    expect(base.avoidedEpisodesPerYear).toBeLessThan(high.avoidedEpisodesPerYear)
    expect(high.avoidedEpisodesPerYear).toBeLessThan(2)
    expect(base.avoidedCostEurPerYear).toBeGreaterThan(0)
  })

  it('reports how large the audience must be for one avoided episode a year', () => {
    expect(usersPerAvoidedEpisode(HEALTH_SCENARIOS.base)).toBeGreaterThan(usersPerAvoidedEpisode(HEALTH_SCENARIOS.high))
    expect(usersPerAvoidedEpisode({ ...HEALTH_SCENARIOS.base, adherence: 0 })).toBe(Infinity)
  })

  it('the planner-gain inputs match what the benchmark actually measured', () => {
    const gains = benchmark.plannerGain as Array<{ meanGainUgm3: number; meanGainOnAlertDaysUgm3: number }>
    const means = gains.map((g) => g.meanGainUgm3)
    expect(HEALTH_SCENARIOS.low.gainUgm3).toBe(Math.min(...means))
    expect(HEALTH_SCENARIOS.base.gainUgm3).toBeCloseTo(means.reduce((a, b) => a + b, 0) / means.length, 1)
    expect(HEALTH_SCENARIOS.high.gainUgm3).toBe(Math.max(...gains.map((g) => g.meanGainOnAlertDaysUgm3)))
  })
})

describe('displayFleetCost', () => {
  it('multiplies sites by the unit price', () => {
    expect(displayFleetCost(100, 319)).toBe(31_900)
    expect(displayFleetCost(-3, 319)).toBe(0)
  })
})
