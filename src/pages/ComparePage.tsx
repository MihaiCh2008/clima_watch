import { useEffect, useState } from 'react'
import { ErrorBanner } from '../components/ErrorBanner'
import { getAqiColor, safeAqi } from '../constants/aqi'
import { useCompare } from '../hooks/useCompare'
import { useLanguage } from '../i18n/LanguageContext'
import type { CityAir } from '../types/airQuality'
import { barWidths, compareAir } from '../utils/compare'

const POLLUTANTS = [
  { key: 'pm2_5', label: 'PM2.5' },
  { key: 'pm10', label: 'PM10' },
  { key: 'no2', label: 'NO2' },
  { key: 'o3', label: 'O3' },
  { key: 'co', label: 'CO' },
] as const

const MATCHUPS: Array<[string, string]> = [
  ['Bucharest', 'Delhi'],
  ['London', 'Beijing'],
  ['Chisinau', 'Cairo'],
  ['Sydney', 'Jakarta'],
]

const COLOR_A = 'var(--accent)'
const COLOR_B = 'var(--accent-2)'

function Bar({ width, color, delay }: { width: number; color: string; delay: number }) {
  const [grown, setGrown] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="h-3 overflow-hidden rounded-full bg-[var(--border)]">
      <div
        className="h-full rounded-full"
        style={{
          width: grown ? `${width > 0 ? Math.max(width, 2) : 0}%` : '0%',
          background: color,
          transition: 'width 1.1s cubic-bezier(0.2, 0.8, 0.2, 1)',
          transitionDelay: `${delay}ms`,
        }}
      />
    </div>
  )
}

function CityTile({ city, side, winner }: { city: CityAir; side: 'A' | 'B'; winner: boolean }) {
  const { t } = useLanguage()
  const level = safeAqi(city.aqi)
  return (
    <div
      className={`relative min-w-0 rounded-2xl p-4 text-center text-white transition-transform sm:p-5 ${winner ? 'shadow-xl sm:scale-[1.03]' : 'opacity-90'}`}
      style={{ background: getAqiColor(level).hex }}
    >
      <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-white/25 text-xs font-bold label-mono">{side}</span>
      <p className="break-words pt-4 text-base opacity-90 sm:pt-0">{city.cityName}</p>
      <p className="heading-font my-1 break-words text-xl font-extrabold min-[420px]:text-2xl sm:text-4xl">{t.aqi[level].text}</p>
      <p className="text-xs opacity-90 label-mono">PM2.5 {city.components.pm2_5.toFixed(1)} μg/m³</p>
    </div>
  )
}

function Results({ a, b }: { a: CityAir; b: CityAir }) {
  const { t } = useLanguage()
  const verdict = compareAir(a, b)
  const winner = verdict.winner === 'a' ? a : b
  const loser = verdict.winner === 'a' ? b : a

  return (
    <div className="mt-8 space-y-6 animate-[fadeIn_0.4s_ease-in]">
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <CityTile city={a} side="A" winner={verdict.winner === 'a'} />
        <CityTile city={b} side="B" winner={verdict.winner === 'b'} />
      </div>

      <div className="rounded-2xl bg-[var(--accent-soft)] p-5 text-center">
        {verdict.winner === 'tie' ? (
          <p className="text-[var(--accent)] font-semibold">{t.compare.tie}</p>
        ) : (
          <>
            <p className="heading-font text-xl font-extrabold text-[var(--accent)] sm:text-2xl">{t.compare.winner.replace('{city}', winner.cityName)}</p>
            {verdict.pct > 0 && (
              <p className="mt-1 text-sm text-[var(--text-muted)]">
                {t.compare.winnerDetail.replace('{pct}', String(verdict.pct)).replace('{other}', loser.cityName)}
              </p>
            )}
          </>
        )}
      </div>

      <div className="rounded-2xl bg-[var(--bg-card)] p-5 sm:p-6">
        <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
          <h3 className="label-mono text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">{t.compare.pollutantsTitle}</h3>
          <span className="text-xs text-[var(--text-soft)]">{t.compare.lowerIsBetter}</span>
        </div>
        <div className="mb-5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_A }} />
            {a.cityName}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_B }} />
            {b.cityName}
          </span>
        </div>

        <div className="space-y-5">
          {POLLUTANTS.map(({ key, label }, i) => {
            const valueA = a.components[key]
            const valueB = b.components[key]
            const [widthA, widthB] = barWidths(valueA, valueB)
            return (
              <div key={key}>
                <div className="mb-1.5 flex items-baseline justify-between">
                  <span className="label-mono text-xs font-bold text-[var(--text)]">{label}</span>
                  <span className="text-[10px] text-[var(--text-soft)]">μg/m³</span>
                </div>
                <div className="space-y-1.5">
                  {[
                    { value: valueA, width: widthA, color: COLOR_A, other: valueB, extraDelay: 0 },
                    { value: valueB, width: widthB, color: COLOR_B, other: valueA, extraDelay: 70 },
                  ].map((row, side) => (
                    <div key={side} className="flex items-center gap-3">
                      <div className="flex-1">
                        <Bar width={row.width} color={row.color} delay={i * 140 + row.extraDelay} />
                      </div>
                      <span className={`w-14 text-right text-xs tabular-nums label-mono ${row.value <= row.other ? 'font-bold text-[var(--text)]' : 'text-[var(--text-soft)]'}`}>
                        {row.value.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ComparePage() {
  const { t } = useLanguage()
  const { cityA, setCityA, cityB, setCityB, state, race } = useCompare(t)
  const loading = state.status === 'loading'

  const inputClass =
    'w-full rounded-xl glass-card px-4 py-3 text-[var(--text)] transition-all placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40'

  return (
    <div>
      <div className="relative mx-auto max-w-3xl">
        <p className="mb-8 text-center text-base text-[var(--text-muted)] sm:text-lg heading-font">{t.compare.subtitle}</p>

        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] label-mono">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_A }} />
              {t.compare.labelA}
            </span>
            <input
              type="text"
              value={cityA}
              onChange={(e) => setCityA(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && race()}
              placeholder={t.compare.placeholderA}
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--text-muted)] label-mono">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: COLOR_B }} />
              {t.compare.labelB}
            </span>
            <input
              type="text"
              value={cityB}
              onChange={(e) => setCityB(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && race()}
              placeholder={t.compare.placeholderB}
              className={inputClass}
            />
          </label>
        </div>

        <button
          onClick={() => race()}
          disabled={loading}
          className="mt-4 w-full rounded-xl px-6 py-3 font-semibold glow-btn disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-ink)] border-t-transparent" />
              {t.compare.running}
            </span>
          ) : (
            t.compare.button
          )}
        </button>

        <div className="mt-5 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[var(--text-soft)] label-mono uppercase tracking-wide">{t.compare.examplesTitle}</span>
          {MATCHUPS.map(([x, y]) => (
            <button
              key={`${x}-${y}`}
              onClick={() => race(x, y)}
              disabled={loading}
              className="rounded-full bg-[var(--accent-soft)] px-3 py-1 text-xs font-semibold text-[var(--accent)] transition-colors hover:brightness-95 disabled:opacity-50 label-mono"
            >
              {x} vs {y}
            </button>
          ))}
        </div>

        {state.status === 'error' && (
          <div className="mt-6">
            <ErrorBanner message={state.message} />
          </div>
        )}

        {state.status === 'done' && <Results key={state.runId} a={state.a} b={state.b} />}
      </div>
    </div>
  )
}
