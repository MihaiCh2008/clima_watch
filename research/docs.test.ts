import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import benchmark from './results/benchmark.json' with { type: 'json' }
import { estimateInfra, DEFAULT_TRAFFIC, maxUsersOnFreeTier } from '../src/utils/economics.ts'

/** The numbers quoted in the competition abstract must be the numbers the code produces. */
const abstract = readFileSync(new URL('../docs/moldsef/abstract.html', import.meta.url), 'utf8').replace(/&lt;/g, '<')
const pct = (x: number, d = 1) => `${(x * 100).toFixed(d)}%`

describe('docs/moldsef/abstract.html matches the benchmark', () => {
  const p = benchmark.primary.pooled
  const models = ['raw', 'scaled', 'ridge', 'gbt'] as const

  it('quotes every hourly error in Table 1', () => {
    for (const m of models) {
      expect(abstract).toContain(p.hourly[m].rmse.toFixed(2))
      expect(abstract).toContain(p.hourly[m].mae.toFixed(2))
    }
  })

  it('quotes the reductions and the interval of the two hypotheses', () => {
    const g = p.improvementAt15.gbt
    expect(abstract).toContain(`−${pct(g.rmse.estimate)}`)
    expect(abstract).toContain(`${(g.rmse.low * 100).toFixed(1)}–${pct(g.rmse.high)}`)
    expect(abstract).toContain(pct(g.missRate.estimate))
    expect(abstract).toContain(`${(g.missRate.low * 100).toFixed(0)}–${pct(g.missRate.high)}`)
    expect(abstract).toContain(`−${pct(p.improvementAt15.scaled.rmse.estimate)}`)
    expect(abstract).toContain(`−${pct(p.improvementAt15.ridge.rmse.estimate)}`)
  })

  it('quotes the missed alerts of every method and the sample sizes', () => {
    for (const m of models) {
      const c = p.daily15.models[m]
      expect(abstract).toContain(`${c.confusion.fn} (${pct(c.missRate, 0)})`)
      expect(abstract).toContain(c.f1.toFixed(2))
    }
    expect(abstract).toContain(`${p.windows} city-days`)
    expect(abstract).toContain(p.hours.toLocaleString('en-US'))
    expect(abstract).toContain(`${p.daily15.observedAlertDays} unhealthy days`)
  })

  it('quotes the robustness checks and latency', () => {
    expect(abstract).toContain(`(−${pct(benchmark.bySeason.find((s) => s.season.startsWith('Jan'))!.improvementAt15.gbt.rmse.estimate)})`)
    expect(abstract).toContain(`(−${pct(benchmark.dryHoursOnly.improvementAt15.gbt.rmse.estimate)})`)
    expect(abstract).toContain(`−${pct(benchmark.forwardChaining.improvementAt15.gbt.rmse.estimate)}`)
  })

  it('quotes latency within normal run-to-run noise', () => {
    // Timings change by a few percent on every run and on every machine, so unlike the
    // accuracy numbers they are compared with a tolerance instead of exactly.
    const quoted = (re: RegExp) => Number(re.exec(abstract)?.[1])
    const near = (a: number, b: number) => a / b > 0.7 && a / b < 1.4
    const lat = benchmark.latency.perPredictionMicroseconds
    expect(near(quoted(/([\d.]+) µs per prediction for GBT/), lat.gbt)).toBe(true)
    expect(near(quoted(/and ([\d.]+) µs for ridge/), lat.ridge)).toBe(true)
  })

  it('quotes the cost model', () => {
    const e = estimateInfra(DEFAULT_TRAFFIC)
    expect(abstract).toContain(`${Math.round(e.callsWithCache / 1000)},000`)
    expect(abstract).toContain(`−${pct(e.reduction)}`)
    const { users: _users, ...shape } = DEFAULT_TRAFFIC
    expect(abstract).toContain(maxUsersOnFreeTier(shape, false).toLocaleString('en-US'))
    expect(abstract).toContain(maxUsersOnFreeTier(shape, true).toLocaleString('en-US'))
    expect(abstract).toContain(`−${pct(estimateInfra({ ...DEFAULT_TRAFFIC, users: 100_000 }).reduction)}`)
  })
})
