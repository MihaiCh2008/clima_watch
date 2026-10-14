import { useState, type PointerEvent } from 'react'
import { getAqiColor, safeAqi } from '../constants/aqi'
import type { HistoryStatus } from '../hooks/useAirQuality'
import { useLanguage } from '../i18n/LanguageContext'
import type { HistoryDay } from '../types/airQuality'
import { areaPath, niceCeiling, smoothLinePath } from '../utils/chartPath'

const WIDTH = 600
const HEIGHT = 230
const PAD = { left: 44, right: 18, top: 18, bottom: 36 }
const PLOT_W = WIDTH - PAD.left - PAD.right
const PLOT_H = HEIGHT - PAD.top - PAD.bottom
const BASE_Y = PAD.top + PLOT_H

function formatDay(date: string, locale: string, options: Intl.DateTimeFormatOptions): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString(locale, { timeZone: 'UTC', ...options })
}

export function HistoryChart({ days, status }: { days: HistoryDay[]; status: HistoryStatus }) {
  const { t, lang } = useLanguage()
  const [active, setActive] = useState<number | null>(null)

  const ceiling = niceCeiling(Math.max(0, ...days.map((d) => d.pm2_5)), 10)
  const xFor = (i: number) => PAD.left + (days.length === 1 ? PLOT_W / 2 : (i / (days.length - 1)) * PLOT_W)
  const yFor = (value: number) => PAD.top + PLOT_H - (value / ceiling) * PLOT_H
  const points = days.map((d, i) => ({ x: xFor(i), y: yFor(d.pm2_5) }))
  const line = smoothLinePath(points, PAD.top, BASE_Y)
  const area = areaPath(line, points, BASE_Y)
  const gridValues = [0, ceiling / 2, ceiling]

  function trackPointer(e: PointerEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * WIDTH
    let nearest = 0
    points.forEach((p, i) => {
      if (Math.abs(p.x - x) < Math.abs(points[nearest].x - x)) nearest = i
    })
    setActive(nearest)
  }

  const activeDay = active !== null ? days[active] : null
  const activeLevel = activeDay ? safeAqi(activeDay.aqi) : 1

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6">
      <h3 className="text-lg font-extrabold heading-font text-[var(--text)] mb-4">{t.home.historyTitle}</h3>

      {status === 'loading' && (
        <div>
          <div className="h-52 skeleton-shimmer rounded-xl" />
          <p className="text-[var(--text-soft)] text-xs mt-3">{t.home.historyLoading}</p>
        </div>
      )}

      {status === 'error' && <p className="text-[var(--text-muted)] text-sm">{t.home.historyError}</p>}

      {status === 'ready' && days.length > 0 && (
        <div className="relative">
          <svg
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="w-full h-auto touch-pan-y select-none"
            role="img"
            aria-label={`${t.home.historyTitle}: ${days.map((d) => `${formatDay(d.date, lang, { weekday: 'long' })} ${d.pm2_5}`).join(', ')}`}
            onPointerMove={trackPointer}
            onPointerDown={trackPointer}
            onPointerLeave={() => setActive(null)}
          >
            <defs>
              <linearGradient id="historyArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" style={{ stopColor: 'var(--accent)', stopOpacity: 0.28 }} />
                <stop offset="100%" style={{ stopColor: 'var(--accent)', stopOpacity: 0 }} />
              </linearGradient>
            </defs>

            {gridValues.map((value) => (
              <g key={value}>
                <line x1={PAD.left} x2={WIDTH - PAD.right} y1={yFor(value)} y2={yFor(value)} className="stroke-[var(--border)]" strokeWidth="1" />
                <text x={PAD.left - 8} y={yFor(value) + 4} textAnchor="end" className="fill-[var(--text-soft)] label-mono" fontSize="11">
                  {value}
                </text>
              </g>
            ))}

            <path d={area} fill="url(#historyArea)" className="chart-area" />
            <path d={line} fill="none" pathLength={1} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="stroke-[var(--accent)] chart-line" />

            {activeDay && (
              <line x1={points[active!].x} x2={points[active!].x} y1={PAD.top} y2={BASE_Y} className="stroke-[var(--text-soft)]" strokeWidth="1" strokeDasharray="3 4" />
            )}

            {days.map((d, i) => (
              <g key={d.date}>
                <circle
                  cx={points[i].x}
                  cy={points[i].y}
                  r={active === i ? 8 : 5.5}
                  fill={getAqiColor(safeAqi(d.aqi)).hex}
                  stroke="#fff"
                  strokeWidth="2.5"
                  className="chart-dot"
                  style={{ animationDelay: `${0.9 + i * 0.1}s`, transition: 'r 0.15s ease' }}
                />
                <text x={points[i].x} y={HEIGHT - 12} textAnchor="middle" fontSize="11" className="fill-[var(--text-muted)] label-mono uppercase">
                  {formatDay(d.date, lang, { weekday: 'short' })}
                </text>
              </g>
            ))}
          </svg>

          {activeDay && active !== null && (
            <div
              className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-xl bg-[var(--text)] px-3 py-2 text-xs text-white shadow-lg whitespace-nowrap"
              style={{ left: `${(points[active].x / WIDTH) * 100}%`, top: `${(points[active].y / HEIGHT) * 100}%`, marginTop: -12 }}
            >
              <p className="label-mono opacity-70">{formatDay(activeDay.date, lang, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
              <p className="font-bold">PM2.5 {activeDay.pm2_5} μg/m³</p>
              <p className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: getAqiColor(activeLevel).hex }} />
                {t.aqi[activeLevel].text}
              </p>
            </div>
          )}
        </div>
      )}

      <p className="text-[var(--text-soft)] text-xs mt-3 italic">{t.home.historyNote}</p>
    </div>
  )
}
