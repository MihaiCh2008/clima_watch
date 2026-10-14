import { useRef, useState } from 'react'
import type { Translation } from '../i18n/translations'
import type { CityAir } from '../types/airQuality'
import { fetchAirQuality } from '../utils/airApi'

export type CompareState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'done'; a: CityAir; b: CityAir; runId: number }

export function useCompare(t: Translation) {
  const [cityA, setCityA] = useState('')
  const [cityB, setCityB] = useState('')
  const [state, setState] = useState<CompareState>({ status: 'idle' })
  const latestRun = useRef(0)

  /** Optional overrides let the quick-matchup chips race immediately without waiting for state to update. */
  async function race(overrideA?: string, overrideB?: string) {
    const a = (overrideA ?? cityA).trim()
    const b = (overrideB ?? cityB).trim()
    if (overrideA !== undefined) setCityA(overrideA)
    if (overrideB !== undefined) setCityB(overrideB)

    if (!a || !b) {
      setState({ status: 'error', message: t.compare.missing })
      return
    }
    if (a.toLowerCase() === b.toLowerCase()) {
      setState({ status: 'error', message: t.compare.sameCity })
      return
    }

    const runId = ++latestRun.current
    setState({ status: 'loading' })
    const [resultA, resultB] = await Promise.all([fetchAirQuality(a), fetchAirQuality(b)])
    if (runId !== latestRun.current) return

    const fail = (reason: 'notFound' | 'generic', name: string) =>
      setState({
        status: 'error',
        message: reason === 'notFound' ? t.compare.notFound.replace('{city}', name) : t.home.errorGeneric,
      })

    if (!resultA.ok) return fail(resultA.reason, a)
    if (!resultB.ok) return fail(resultB.reason, b)

    setState({ status: 'done', a: resultA.data, b: resultB.data, runId })
  }

  return { cityA, setCityA, cityB, setCityB, state, race }
}
