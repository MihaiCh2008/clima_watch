import { describe, expect, it } from 'vitest'
import benchmark from '../../research/results/benchmark.json'
import { formatChange, formatPercent, formatSmart, hypothesisVerdict } from './research'

describe('hypothesisVerdict', () => {
  it('is supported only when the estimate reaches the target and the interval excludes zero', () => {
    expect(hypothesisVerdict(0.3, 0.1, 0.22)).toBe('supported')
  })

  it('is partial when the improvement is real but below the target', () => {
    expect(hypothesisVerdict(0.18, 0.1, 0.22)).toBe('partial')
  })

  it('is not supported when the interval includes zero, however good the estimate looks', () => {
    expect(hypothesisVerdict(0.5, 0, 0.18)).toBe('notSupported')
    expect(hypothesisVerdict(0.5, -0.2, 0.18)).toBe('notSupported')
  })

  it('applied to the recorded benchmark, reproduces the pre-registered outcome of each hypothesis', () => {
    const g = benchmark.primary.pooled.improvementAt15.gbt
    expect(hypothesisVerdict(g.rmse.estimate, g.rmse.low, 0.22)).toBe('partial')
    expect(hypothesisVerdict(g.missRate.estimate, g.missRate.low, 0.18)).toBe('notSupported')
  })
})

describe('formatting', () => {
  it('formats percentages and signed changes', () => {
    expect(formatPercent(0.2053, 'en')).toBe('20.5%')
    expect(formatChange(0.205, 'en')).toBe('−20.5%')
    expect(formatChange(-0.032, 'en')).toBe('+3.2%')
    expect(formatChange(0, 'en')).toBe('0.0%')
  })

  it('keeps two significant figures across magnitudes', () => {
    expect(formatSmart(0.0170, 'en')).toBe('0.017')
    expect(formatSmart(6.04, 'en')).toBe('6')
    expect(formatSmart(589_109, 'en')).toBe('589,109')
    expect(formatSmart(0, 'en')).toBe('0')
    expect(formatSmart(Infinity, 'en')).toBe('∞')
  })
})
