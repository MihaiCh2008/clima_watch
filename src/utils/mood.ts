export interface ParticleParams {
  count: number
  speed: number
  breathSeconds: number
  rgb: [number, number, number]
  alpha: number
}

const CLEAN: ParticleParams = { count: 40, speed: 0.2, breathSeconds: 7, rgb: [47, 143, 158], alpha: 0.22 }

const BY_LEVEL: Record<1 | 2 | 3 | 4 | 5, ParticleParams> = {
  1: CLEAN,
  2: { count: 75, speed: 0.3, breathSeconds: 5.8, rgb: [92, 140, 140], alpha: 0.26 },
  3: { count: 115, speed: 0.45, breathSeconds: 4.6, rgb: [150, 130, 100], alpha: 0.3 },
  4: { count: 165, speed: 0.65, breathSeconds: 3.6, rgb: [140, 100, 80], alpha: 0.34 },
  5: { count: 220, speed: 0.9, breathSeconds: 2.8, rgb: [105, 75, 85], alpha: 0.38 },
}

/** Cleaner air = few, slow, clear particles and a calm breath; worse air = dense, fast, murky and labored. */
export function paramsForAqi(aqi: number | null): ParticleParams {
  if (aqi === null) return CLEAN
  const level = Math.min(5, Math.max(1, Math.round(aqi))) as 1 | 2 | 3 | 4 | 5
  return BY_LEVEL[level]
}

export function lerp(from: number, to: number, t: number): number {
  return from + (to - from) * t
}
