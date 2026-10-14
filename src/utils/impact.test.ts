import { describe, expect, it } from 'vitest'
import { BASELINE, ECO_PLAN, FACTORS, computeImpact, percentVsBaseline, treesNeeded } from './impact'

describe('computeImpact', () => {
  it('multiplies each choice by its emission factor, scaled to a year', () => {
    const result = computeImpact({ carKmPerWeek: 100, transitKmPerWeek: 0, meatMealsPerWeek: 0, returnFlightsPerYear: 0 })
    expect(result.car).toBeCloseTo(100 * 52 * FACTORS.carKgPerKm)
    expect(result.total).toBeCloseTo(result.car)
  })

  it('adds flights as a flat amount per return trip', () => {
    const result = computeImpact({ carKmPerWeek: 0, transitKmPerWeek: 0, meatMealsPerWeek: 0, returnFlightsPerYear: 3 })
    expect(result.flights).toBe(3 * FACTORS.returnFlightKg)
  })

  it('sums the four categories into the total', () => {
    const r = computeImpact(BASELINE)
    expect(r.total).toBeCloseTo(r.car + r.transit + r.meat + r.flights)
  })

  it('gives zero for someone who does none of the four', () => {
    const zero = computeImpact({ carKmPerWeek: 0, transitKmPerWeek: 0, meatMealsPerWeek: 0, returnFlightsPerYear: 0 })
    expect(zero.total).toBe(0)
  })

  it('shows the eco plan emitting far less than the typical lifestyle', () => {
    expect(computeImpact(ECO_PLAN).total).toBeLessThan(computeImpact(BASELINE).total * 0.5)
  })
})

describe('treesNeeded', () => {
  it('rounds up so a partial tree still counts', () => {
    expect(treesNeeded(21)).toBe(1)
    expect(treesNeeded(22)).toBe(2)
  })

  it('is zero when there is nothing to offset', () => {
    expect(treesNeeded(0)).toBe(0)
  })
})

describe('percentVsBaseline', () => {
  it('is negative when below the baseline and positive when above', () => {
    expect(percentVsBaseline(50, 100)).toBe(-50)
    expect(percentVsBaseline(150, 100)).toBe(50)
    expect(percentVsBaseline(100, 100)).toBe(0)
  })

  it('does not divide by zero', () => {
    expect(percentVsBaseline(10, 0)).toBe(0)
  })
})
