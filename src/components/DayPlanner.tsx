import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { getAqiColor } from '../constants/aqi'
import { useDayPlanner } from '../hooks/useDayPlanner'
import { useLanguage } from '../i18n/LanguageContext'
import type { ForecastHour, UserProfile } from '../types/airQuality'
import { adjustedLevel, bestWindow, isSensitive, upcomingHours, worstWindow, type HourWindow } from '../utils/planner'
import { ErrorBanner } from './ErrorBanner'

const COLUMNS = { gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }
const HOUR_SECONDS = 3600

function PlannerResults({ cityName, hours, profile }: { cityName: string; hours: ForecastHour[]; profile: UserProfile }) {
  const { t, lang } = useLanguage()
  const [selected, setSelected] = useState(0)
  const [grown, setGrown] = useState(false)
  const [now] = useState(() => Date.now())

  useEffect(() => {
    const id = requestAnimationFrame(() => requestAnimationFrame(() => setGrown(true)))
    return () => cancelAnimationFrame(id)
  }, [])

  const upcoming = useMemo(() => upcomingHours(hours, now, 24), [hours, now])
  if (upcoming.length === 0) return <ErrorBanner message={t.planner.error} />

  const levels = upcoming.map((h) => adjustedLevel(h.aqi, profile))
  const maxPm = Math.max(10, ...upcoming.map((h) => h.pm2_5))
  const best = bestWindow(upcoming, profile.exercisesOutdoors ? 2 : 1)
  const worstRaw = worstWindow(upcoming, 2)
  const worst =
    worstRaw && Math.max(...levels.slice(worstRaw.start, worstRaw.start + worstRaw.length)) >= 3 ? worstRaw : null

  const time = (dt: number) => new Date(dt * 1000).toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', hour12: false })
  const range = (w: HourWindow) => `${time(upcoming[w.start].dt)}–${time(upcoming[w.start].dt + w.length * HOUR_SECONDS)}`

  const current = upcoming[selected]
  const currentLevel = levels[selected]

  return (
    <div className="mt-6 animate-[fadeIn_0.4s_ease-in] space-y-5">
      <div className="rounded-2xl bg-[var(--bg-card)] p-5 sm:p-6">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="label-mono text-sm font-bold uppercase tracking-wide text-[var(--text-muted)]">
            {t.planner.forCity.replace('{city}', cityName)}
          </h3>
          <span className="text-xs text-[var(--text-soft)]">{t.planner.deviceTime}</span>
        </div>

        <div className="grid h-40 items-end gap-[3px]" style={COLUMNS}>
          {upcoming.map((h, i) => (
            <button
              key={h.dt}
              type="button"
              onMouseEnter={() => setSelected(i)}
              onFocus={() => setSelected(i)}
              onClick={() => setSelected(i)}
              aria-label={`${time(h.dt)}: ${t.aqi[levels[i]].text}, PM2.5 ${h.pm2_5.toFixed(1)}`}
              className="flex h-full items-end focus:outline-none"
            >
              <span
                className={`block w-full rounded-t-md ${selected === i ? 'ring-2 ring-[var(--text)]/60' : ''}`}
                style={{
                  height: grown ? `${Math.max(8, (h.pm2_5 / maxPm) * 100)}%` : '0%',
                  background: getAqiColor(levels[i]).hex,
                  opacity: selected === i ? 1 : 0.7,
                  transition: `height 0.7s cubic-bezier(0.2, 0.8, 0.2, 1) ${i * 25}ms, opacity 0.15s ease`,
                }}
              />
            </button>
          ))}
        </div>

        <div className="mt-2 grid gap-[3px]" style={COLUMNS}>
          {best && <div className="h-1.5 rounded-full" style={{ gridColumn: `${best.start + 1} / span ${best.length}`, background: '#1f6f4a' }} />}
        </div>
        <div className="mt-1 grid gap-[3px]" style={COLUMNS}>
          {worst && <div className="h-1.5 rounded-full" style={{ gridColumn: `${worst.start + 1} / span ${worst.length}`, background: '#a8432a' }} />}
        </div>

        <div className="mt-2 grid gap-[3px]" style={COLUMNS}>
          {upcoming.map((h, i) => (
            <span key={h.dt} className="whitespace-nowrap text-[10px] label-mono text-[var(--text-soft)]">
              {i === 0 ? t.planner.now : i % 3 === 0 ? time(h.dt) : ''}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-3 rounded-xl bg-[var(--bg)] p-4">
          <span className="inline-block h-3 w-3 shrink-0 rounded-full" style={{ background: getAqiColor(currentLevel).hex }} />
          <div className="min-w-0">
            <p className="font-bold text-[var(--text)]">
              {selected === 0 ? `${t.planner.now} · ` : ''}
              {time(current.dt)} — {t.aqi[currentLevel].text}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              PM2.5 {current.pm2_5.toFixed(1)} μg/m³ · {t.aqi[currentLevel].advice}
            </p>
          </div>
        </div>
        <p className="mt-2 text-xs text-[var(--text-soft)]">{t.planner.hint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {best && (
          <div className="rounded-2xl p-5" style={{ background: '#e3efe1', color: '#1f6f4a' }}>
            <p className="text-xs font-bold uppercase tracking-wide label-mono">{t.planner.best}</p>
            <p className="heading-font mt-1 text-3xl font-extrabold">{range(best)}</p>
            <p className="mt-1 text-sm opacity-90">{t.planner.pm.replace('{value}', best.avgPm.toFixed(1))}</p>
          </div>
        )}
        {worst ? (
          <div className="rounded-2xl p-5" style={{ background: '#f6dcd4', color: '#8c3a24' }}>
            <p className="text-xs font-bold uppercase tracking-wide label-mono">{t.planner.avoid}</p>
            <p className="heading-font mt-1 text-3xl font-extrabold">{range(worst)}</p>
            <p className="mt-1 text-sm opacity-90">{t.planner.pm.replace('{value}', worst.avgPm.toFixed(1))}</p>
          </div>
        ) : (
          <div className="flex items-center rounded-2xl bg-[var(--accent-soft)] p-5 text-sm font-semibold text-[var(--accent)]">
            {t.planner.allGood}
          </div>
        )}
      </div>

      {(isSensitive(profile) || profile.exercisesOutdoors) && (
        <ul className="space-y-1 text-xs text-[var(--text-muted)]">
          {isSensitive(profile) && <li>{t.planner.sensitiveNote}</li>}
          {profile.exercisesOutdoors && <li>{t.planner.exerciseNote}</li>}
        </ul>
      )}
    </div>
  )
}

/** "Your day, hour by hour": the real hourly forecast for the user's home city, colored for their profile, with the best and worst hours picked out. */
export function DayPlanner({ profile }: { profile: UserProfile }) {
  const { t } = useLanguage()
  const { city, setCity, state, plan } = useDayPlanner()
  const loading = state.status === 'loading'

  function submit(e: FormEvent) {
    e.preventDefault()
    plan()
  }

  return (
    <section className="mt-10">
      <h2 className="mb-1 text-xl font-extrabold heading-font text-[var(--text)]">{t.planner.title}</h2>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{t.planner.subtitle}</p>

      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={t.planner.placeholder}
          aria-label={t.planner.cityLabel}
          className="min-w-0 flex-1 rounded-xl px-4 py-3 glass-card text-[var(--text)] transition-all placeholder:text-[var(--text-soft)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/40"
        />
        <button type="submit" disabled={loading} className="rounded-xl px-6 py-3 font-semibold glow-btn disabled:cursor-not-allowed disabled:opacity-50">
          {loading ? (
            <span className="flex items-center gap-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--accent-ink)] border-t-transparent" />
              {t.planner.planning}
            </span>
          ) : (
            t.planner.button
          )}
        </button>
      </form>

      {state.status === 'loading' && <div className="mt-6 h-72 rounded-2xl skeleton-shimmer" />}
      {state.status === 'error' && (
        <div className="mt-6">
          <ErrorBanner message={state.reason === 'notFound' ? t.planner.notFound : t.planner.error} />
        </div>
      )}
      {state.status === 'ready' && <PlannerResults key={`${state.cityName}-${state.hours[0]?.dt}`} cityName={state.cityName} hours={state.hours} profile={profile} />}
    </section>
  )
}
