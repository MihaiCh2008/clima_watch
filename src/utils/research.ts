export type Verdict = 'supported' | 'partial' | 'notSupported'

/**
 * The decision rule fixed in research/PREREGISTRATION.md, applied to a relative reduction versus the raw grid:
 * supported = point estimate at or above the target AND a 95% interval that excludes zero;
 * partially supported = interval excludes zero but the estimate is below the target;
 * not supported = anything else (including a promising estimate whose interval still includes zero).
 */
export function hypothesisVerdict(estimate: number, low: number, target: number): Verdict {
  if (low > 0) return estimate >= target ? 'supported' : 'partial'
  return 'notSupported'
}

/** 0.2053 → "20.5%" (decimal separator follows the locale). */
export function formatPercent(fraction: number, locale: string, digits = 1): string {
  return `${(fraction * 100).toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })}%`
}

/** A signed relative change: a reduction of 0.205 reads as "−20.5%", an increase as "+3.2%". */
export function formatChange(reduction: number, locale: string, digits = 1): string {
  const sign = reduction > 0 ? '−' : reduction < 0 ? '+' : ''
  return `${sign}${formatPercent(Math.abs(reduction), locale, digits)}`
}

export function formatNumber(value: number, locale: string, digits = 0): string {
  return value.toLocaleString(locale, { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

/** Rounds to two significant figures for display of very different magnitudes ("0.017", "6.0", "590,000"). */
export function formatSmart(value: number, locale: string): string {
  if (!Number.isFinite(value)) return '∞'
  if (value === 0) return '0'
  const magnitude = Math.floor(Math.log10(Math.abs(value)))
  const digits = Math.max(0, 1 - magnitude)
  const rounded = Number(value.toFixed(Math.min(digits, 6)))
  return rounded.toLocaleString(locale, { maximumFractionDigits: Math.min(digits, 6) })
}
