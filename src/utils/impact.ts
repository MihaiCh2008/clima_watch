export interface ImpactInputs {
  carKmPerWeek: number
  transitKmPerWeek: number
  meatMealsPerWeek: number
  returnFlightsPerYear: number
}

export interface ImpactBreakdown {
  car: number
  transit: number
  meat: number
  flights: number
  total: number
}

const WEEKS_PER_YEAR = 52

/** Average emission factors (see the README and the "How is this calculated?" note in the UI for sources). */
export const FACTORS = {
  carKgPerKm: 0.17,
  transitKgPerKm: 0.07,
  meatMealExtraKg: 1.13,
  returnFlightKg: 600,
  treeKgPerYear: 21,
} as const

/** A "typical lifestyle" to compare against. */
export const BASELINE: ImpactInputs = {
  carKmPerWeek: 120,
  transitKmPerWeek: 40,
  meatMealsPerWeek: 10,
  returnFlightsPerYear: 1,
}

export const ECO_PLAN: ImpactInputs = {
  carKmPerWeek: 30,
  transitKmPerWeek: 120,
  meatMealsPerWeek: 3,
  returnFlightsPerYear: 0,
}

/** Yearly kg of CO2 for each of the four choices, plus the total. */
export function computeImpact(inputs: ImpactInputs): ImpactBreakdown {
  const car = inputs.carKmPerWeek * WEEKS_PER_YEAR * FACTORS.carKgPerKm
  const transit = inputs.transitKmPerWeek * WEEKS_PER_YEAR * FACTORS.transitKgPerKm
  const meat = inputs.meatMealsPerWeek * WEEKS_PER_YEAR * FACTORS.meatMealExtraKg
  const flights = inputs.returnFlightsPerYear * FACTORS.returnFlightKg
  return { car, transit, meat, flights, total: car + transit + meat + flights }
}

/** How many mature trees would need a full year to absorb this much CO2. */
export function treesNeeded(totalKg: number): number {
  return totalKg <= 0 ? 0 : Math.ceil(totalKg / FACTORS.treeKgPerYear)
}

/** Whole-number percent change versus a baseline total (negative = less CO2). */
export function percentVsBaseline(totalKg: number, baselineKg: number): number {
  if (baselineKg <= 0) return 0
  return Math.round(((totalKg - baselineKg) / baselineKg) * 100)
}
