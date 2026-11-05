/**
 * Cost and impact model behind the "Research" page and docs/moldsef/. Pure functions, no I/O.
 *
 * Two separate questions, deliberately kept apart:
 *  1. Infrastructure: how many upstream API calls does a given audience cause, with and without the
 *     CDN cache, and does that fit inside the free tiers?
 *  2. Health economics: what is the order of magnitude of avoided asthma episodes if sensitive users
 *     move their outdoor time to cleaner hours? Epidemiological inputs come from the published
 *     studies cited in docs/moldsef/abstract.md; the baseline episode rate is an explicit assumption.
 */

const SECONDS_PER_MONTH = 30 * 24 * 3600

// ---------------------------------------------------------------------------------------------
// 1. Infrastructure
// ---------------------------------------------------------------------------------------------

/** OpenWeatherMap free tier (openweathermap.org/full-price): 60 calls/minute, 1,000,000 calls/month. */
export const OWM_FREE_CALLS_PER_MONTH = 1_000_000
export const OWM_FREE_CALLS_PER_MINUTE = 60
/** Vercel Hobby plan: first 1,000,000 function invocations per month (vercel.com/docs/plans/hobby). */
export const VERCEL_FREE_INVOCATIONS_PER_MONTH = 1_000_000

/** OpenWeatherMap calls one cache miss costs, per endpoint (counted from api/_lib). */
export const UPSTREAM_CALLS = {
  /** /api/cities-air: one air-pollution call for each of the 26 globe cities. */
  globe: 26,
  /** /api/air-quality: geocoding + current air pollution. */
  search: 2,
  /** /api/air-history: one history call by coordinates. */
  history: 1,
  /** /api/air-forecast: geocoding + forecast (the time-zone lookup goes to Open-Meteo, not OpenWeatherMap). */
  planner: 2,
} as const

/** `s-maxage` of each endpoint, seconds (api/*.ts). */
export const CACHE_TTL = { globe: 600, search: 600, history: 3600, planner: 3600 } as const

export interface Traffic {
  users: number
  sessionsPerUserPerMonth: number
  /** Share of sessions in which the user also opens the day planner. */
  plannerShare: number
  /** How many different city queries the audience produces. */
  distinctCities: number
  /** Zipf exponent of city popularity: 0 = every city equally likely, 1 = a few cities dominate. */
  zipfExponent: number
}

/** A school/municipal audience in Moldova and Romania: ~4 visits per month, half of them with the planner. */
export const DEFAULT_TRAFFIC: Traffic = { users: 10_000, sessionsPerUserPerMonth: 4, plannerShare: 0.5, distinctCities: 500, zipfExponent: 1 }

/** Normalized Zipf popularity of `count` distinct keys: weight(rank) ∝ 1 / rank^exponent. */
export function zipfWeights(count: number, exponent: number): number[] {
  const raw = Array.from({ length: count }, (_, i) => 1 / (i + 1) ** exponent)
  const total = raw.reduce((a, b) => a + b, 0)
  return raw.map((w) => w / total)
}

/**
 * Expected number of cache misses in one TTL window that receives `requests` requests spread over keys
 * with the given popularity weights. A key misses once (its first request in the window) if it is requested
 * at all; with Poisson arrivals, P(key requested) = 1 − e^(−requests × weight).
 */
export function expectedMissesPerWindow(requests: number, weights: number[]): number {
  return weights.reduce((sum, w) => sum + (1 - Math.exp(-requests * w)), 0)
}

/** Cache misses over a month for one endpoint (never more than the requests themselves). */
export function monthlyMisses(requestsPerMonth: number, ttlSeconds: number, weights: number[]): number {
  const windows = SECONDS_PER_MONTH / ttlSeconds
  return Math.min(requestsPerMonth, windows * expectedMissesPerWindow(requestsPerMonth / windows, weights))
}

export interface EndpointLoad {
  requests: number
  misses: number
  /** OpenWeatherMap calls if every request reached the origin. */
  callsWithoutCache: number
  callsWithCache: number
}

export interface InfraEstimate {
  endpoints: Record<keyof typeof UPSTREAM_CALLS, EndpointLoad>
  callsWithoutCache: number
  callsWithCache: number
  /** Share of upstream calls removed by the CDN cache, 0-1. */
  reduction: number
  /** Serverless function runs (a request served from the CDN cache does not run the function). */
  invocationsWithoutCache: number
  invocationsWithCache: number
  fitsOwmFreeTier: boolean
  fitsOwmFreeTierWithoutCache: boolean
  fitsVercelFreeTier: boolean
}

export function estimateInfra(traffic: Traffic): InfraEstimate {
  const sessions = traffic.users * traffic.sessionsPerUserPerMonth
  const oneKey = [1]
  const cities = zipfWeights(Math.max(1, Math.round(traffic.distinctCities)), traffic.zipfExponent)

  const load = (requests: number, ttl: number, weights: number[], callsPerMiss: number): EndpointLoad => {
    const misses = requests === 0 ? 0 : monthlyMisses(requests, ttl, weights)
    return { requests, misses, callsWithoutCache: requests * callsPerMiss, callsWithCache: misses * callsPerMiss }
  }

  const endpoints = {
    globe: load(sessions, CACHE_TTL.globe, oneKey, UPSTREAM_CALLS.globe),
    search: load(sessions, CACHE_TTL.search, cities, UPSTREAM_CALLS.search),
    history: load(sessions, CACHE_TTL.history, cities, UPSTREAM_CALLS.history),
    planner: load(sessions * traffic.plannerShare, CACHE_TTL.planner, cities, UPSTREAM_CALLS.planner),
  }

  const all = Object.values(endpoints)
  const callsWithoutCache = all.reduce((a, e) => a + e.callsWithoutCache, 0)
  const callsWithCache = all.reduce((a, e) => a + e.callsWithCache, 0)
  const invocationsWithoutCache = all.reduce((a, e) => a + e.requests, 0)
  const invocationsWithCache = all.reduce((a, e) => a + e.misses, 0)

  return {
    endpoints,
    callsWithoutCache,
    callsWithCache,
    reduction: callsWithoutCache === 0 ? 0 : 1 - callsWithCache / callsWithoutCache,
    invocationsWithoutCache,
    invocationsWithCache,
    fitsOwmFreeTier: callsWithCache <= OWM_FREE_CALLS_PER_MONTH,
    fitsOwmFreeTierWithoutCache: callsWithoutCache <= OWM_FREE_CALLS_PER_MONTH,
    fitsVercelFreeTier: invocationsWithCache <= VERCEL_FREE_INVOCATIONS_PER_MONTH,
  }
}

/** Largest audience whose monthly OpenWeatherMap calls stay inside the free tier (bisection; with or without the CDN cache). */
export function maxUsersOnFreeTier(traffic: Omit<Traffic, 'users'>, withCache: boolean): number {
  const calls = (users: number) => {
    const e = estimateInfra({ ...traffic, users })
    return withCache ? e.callsWithCache : e.callsWithoutCache
  }
  let low = 0
  let high = 1_000_000_000
  if (calls(high) <= OWM_FREE_CALLS_PER_MONTH) return high
  for (let i = 0; i < 60; i++) {
    const mid = (low + high) / 2
    if (calls(mid) <= OWM_FREE_CALLS_PER_MONTH) low = mid
    else high = mid
  }
  return Math.floor(low)
}

/** Published list prices of commercial air-quality monitors with a display, for the cost comparison. */
export const COMMERCIAL_UNITS = [
  { name: 'IQAir AirVisual Pro', price: 319, currency: 'EUR', source: 'IQAir EU store' },
  { name: 'PurpleAir Flex', price: 289, currency: 'USD', source: 'PurpleAir store' },
  { name: 'PurpleAir Touch', price: 209, currency: 'USD', source: 'PurpleAir store' },
] as const

// ---------------------------------------------------------------------------------------------
// 2. Health economics
// ---------------------------------------------------------------------------------------------

export interface HealthScenario {
  /** Share of users who are sensitive (asthma or a young child in the profile). */
  sensitiveShare: number
  /** Acute asthma episodes needing emergency care per sensitive user per year. ASSUMPTION — replace with national statistics. */
  baselineEpisodesPerYear: number
  /** Relative risk of an asthma ED visit per +10 µg/m³ of PM2.5 (children). */
  relativeRisk: number
  /** Share of the outdoor time that users actually move to cleaner hours; taken from the reductions in outdoor activity that studies measure on air-quality alert days. */
  adherence: number
  outdoorHoursPerDay: number
  /** How much cleaner (µg/m³ PM2.5) the best 2-hour stretch of a day is than the day's average (benchmark data). */
  gainUgm3: number
  costPerEpisodeEur: number
}

/**
 * - relativeRisk: 1.028 / 1.036 / 1.048 — Lim et al. 2016 lower CI bound, Fan et al. 2016 (children, ED visits), Lim et al. 2016 pooled.
 * - adherence: 0.14 / 0.18 / 0.35 — Saberian et al. 2017 range of cycling reductions on alert days; Ward & Beatty (18% less vigorous outdoor time).
 * - gainUgm3: 2.5 / 3.2 / 9.2 — measured in research/results/benchmark.json (plannerGain): lowest city mean,
 *   mean of both cities, and the best-case city on days above 15 µg/m³.
 * - costPerEpisodeEur: 214.9 / 355.87 / 1041.96 — Bavbek et al. 2011 (Turkey, adults), Pugliese et al. 2020 (Italy, paediatric ED green and red code).
 */
export const HEALTH_SCENARIOS: Record<'low' | 'base' | 'high', HealthScenario> = {
  low: { sensitiveShare: 0.05, baselineEpisodesPerYear: 0.05, relativeRisk: 1.028, adherence: 0.14, outdoorHoursPerDay: 1, gainUgm3: 2.5, costPerEpisodeEur: 214.9 },
  base: { sensitiveShare: 0.1, baselineEpisodesPerYear: 0.1, relativeRisk: 1.036, adherence: 0.18, outdoorHoursPerDay: 2, gainUgm3: 3.2, costPerEpisodeEur: 355.87 },
  high: { sensitiveShare: 0.1, baselineEpisodesPerYear: 0.25, relativeRisk: 1.048, adherence: 0.35, outdoorHoursPerDay: 4, gainUgm3: 9.2, costPerEpisodeEur: 1041.96 },
}

/** Average cut in daily PM2.5 exposure (µg/m³) from moving outdoor hours to the cleanest window. */
export function exposureReduction(s: HealthScenario): number {
  return (s.adherence * s.outdoorHoursPerDay * s.gainUgm3) / 24
}

/** Share of episodes attributable to a PM2.5 increase of `deltaUgm3`, from a relative risk per +10 µg/m³: 1 − RR^(−Δ/10). */
export function attributableFraction(relativeRisk: number, deltaUgm3: number): number {
  return 1 - relativeRisk ** (-deltaUgm3 / 10)
}

export interface HealthImpact {
  sensitiveUsers: number
  exposureReductionUgm3: number
  avoidedFraction: number
  avoidedEpisodesPerYear: number
  avoidedCostEurPerYear: number
}

export function estimateHealthImpact(users: number, s: HealthScenario): HealthImpact {
  const sensitiveUsers = users * s.sensitiveShare
  const reduction = exposureReduction(s)
  const avoidedFraction = attributableFraction(s.relativeRisk, reduction)
  const avoidedEpisodesPerYear = sensitiveUsers * s.baselineEpisodesPerYear * avoidedFraction
  return {
    sensitiveUsers,
    exposureReductionUgm3: reduction,
    avoidedFraction,
    avoidedEpisodesPerYear,
    avoidedCostEurPerYear: avoidedEpisodesPerYear * s.costPerEpisodeEur,
  }
}

/** Audience size at which the model expects one avoided episode per year. */
export function usersPerAvoidedEpisode(s: HealthScenario): number {
  const perUser = estimateHealthImpact(1, s).avoidedEpisodesPerYear
  return perUser === 0 ? Infinity : 1 / perUser
}

/** Hardware cost of covering `sites` locations with one commercial display each (same currency as `unitPrice`). */
export function displayFleetCost(sites: number, unitPrice: number): number {
  return Math.max(0, Math.round(sites)) * unitPrice
}
