import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { CACHE_TTL } from '../../src/utils/economics.js'

/** The cost model in src/utils/economics.ts must use the cache lifetimes the endpoints really send. */
function ttlOf(file: string): number {
  const source = readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')
  const match = source.match(/sendJson\(res, result\.status, result\.body, (\d+)\)/)
  if (!match) throw new Error(`no cache lifetime found in ${file}`)
  return Number(match[1])
}

describe('economics model vs. the real endpoints', () => {
  it('uses the same cache lifetimes as the serverless functions', () => {
    expect(ttlOf('cities-air.ts')).toBe(CACHE_TTL.globe)
    expect(ttlOf('air-quality.ts')).toBe(CACHE_TTL.search)
    expect(ttlOf('air-history.ts')).toBe(CACHE_TTL.history)
    expect(ttlOf('air-forecast.ts')).toBe(CACHE_TTL.planner)
  })
})
