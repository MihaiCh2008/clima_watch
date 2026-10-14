import { useState, type CSSProperties } from 'react'
import { useCountUp } from '../hooks/useCountUp'
import { useLanguage } from '../i18n/LanguageContext'
import { BASELINE, ECO_PLAN, computeImpact, percentVsBaseline, treesNeeded, type ImpactInputs } from '../utils/impact'

const COLORS = { car: '#1d4f73', transit: '#2f8f9e', meat: '#c99c3c', flights: '#854166' } as const
const MAX_TREE_ICONS = 120
const TREE_SHADES = ['#2f8f63', '#1f6f4a', '#3a9d73']

interface SliderRowProps {
  label: string
  unit: string
  value: number
  min: number
  max: number
  step: number
  color: string
  tonsPerYear: number
  tonsLabel: string
  onChange: (value: number) => void
}

function SliderRow({ label, unit, value, min, max, step, color, tonsPerYear, tonsLabel, onChange }: SliderRowProps) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-3 text-sm">
        <span className="flex items-center gap-2 font-semibold text-[var(--text)]">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
          {label}
        </span>
        <span className="label-mono text-xs text-[var(--text-muted)]">
          <strong className="text-[var(--text)]">{value}</strong> {unit}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider w-full cursor-pointer"
        style={{ '--slider-color': color, '--fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
      <span className="mt-0.5 block text-right text-[11px] text-[var(--text-soft)] label-mono">
        {tonsPerYear.toFixed(2)} {tonsLabel}
      </span>
    </label>
  )
}

function Tree({ shade, visible, delay }: { shade: string; visible: boolean; delay: number }) {
  return (
    <svg
      viewBox="0 0 24 26"
      width="20"
      height="22"
      style={{
        transform: visible ? 'scale(1)' : 'scale(0)',
        transformOrigin: '50% 100%',
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <path d="M12 1 L19 11 H15.5 L21 19 H3 L8.5 11 H5 Z" fill={shade} />
      <rect x="10.8" y="19" width="2.4" height="5" rx="0.8" fill="#8a6a4a" />
    </svg>
  )
}

/** Interactive what-if calculator: four everyday choices → yearly CO2, a breakdown bar, and a forest sized to offset it. */
export function ImpactLab() {
  const { t } = useLanguage()
  const [inputs, setInputs] = useState<ImpactInputs>(BASELINE)

  const impact = computeImpact(inputs)
  const baselineTotal = computeImpact(BASELINE).total
  const pct = percentVsBaseline(impact.total, baselineTotal)
  const tons = useCountUp(impact.total / 1000)

  const trees = treesNeeded(impact.total)
  const treesPerIcon = Math.max(1, Math.ceil(trees / MAX_TREE_ICONS))
  const iconCount = Math.ceil(trees / treesPerIcon)

  const set = (key: keyof ImpactInputs) => (value: number) => setInputs((prev) => ({ ...prev, [key]: value }))
  const share = (kg: number) => (impact.total > 0 ? (kg / impact.total) * 100 : 0)
  const kgTons = (kg: number) => kg / 1000

  const delta =
    pct < 0
      ? { text: t.impact.less.replace('{pct}', String(Math.abs(pct))), style: { background: '#e3efe1', color: '#1f6f4a' } }
      : pct > 0
        ? { text: t.impact.more.replace('{pct}', String(pct)), style: { background: '#f6dcd4', color: '#8c3a24' } }
        : { text: t.impact.same, style: { background: 'var(--accent-soft)', color: 'var(--accent)' } }

  const segments = [
    { key: 'car', label: t.impact.car, kg: impact.car, color: COLORS.car },
    { key: 'transit', label: t.impact.transit, kg: impact.transit, color: COLORS.transit },
    { key: 'meat', label: t.impact.meat, kg: impact.meat, color: COLORS.meat },
    { key: 'flights', label: t.impact.flights, kg: impact.flights, color: COLORS.flights },
  ]

  return (
    <div className="rounded-2xl bg-[var(--bg-card)] p-5 sm:p-7">
      <h2 className="mb-1 text-xl font-extrabold heading-font text-[var(--text)]">{t.impact.title}</h2>
      <p className="mb-6 text-sm text-[var(--text-muted)]">{t.impact.subtitle}</p>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-5">
          <SliderRow label={t.impact.car} unit={t.impact.carUnit} value={inputs.carKmPerWeek} min={0} max={400} step={5} color={COLORS.car} tonsPerYear={kgTons(impact.car)} tonsLabel={t.impact.unit} onChange={set('carKmPerWeek')} />
          <SliderRow label={t.impact.transit} unit={t.impact.transitUnit} value={inputs.transitKmPerWeek} min={0} max={300} step={5} color={COLORS.transit} tonsPerYear={kgTons(impact.transit)} tonsLabel={t.impact.unit} onChange={set('transitKmPerWeek')} />
          <SliderRow label={t.impact.meat} unit={t.impact.meatUnit} value={inputs.meatMealsPerWeek} min={0} max={21} step={1} color={COLORS.meat} tonsPerYear={kgTons(impact.meat)} tonsLabel={t.impact.unit} onChange={set('meatMealsPerWeek')} />
          <SliderRow label={t.impact.flights} unit={t.impact.flightsUnit} value={inputs.returnFlightsPerYear} min={0} max={8} step={1} color={COLORS.flights} tonsPerYear={kgTons(impact.flights)} tonsLabel={t.impact.unit} onChange={set('returnFlightsPerYear')} />
        </div>

        <div className="flex flex-col justify-center">
          <p className="text-xs label-mono uppercase tracking-wide text-[var(--text-muted)]">{t.impact.total}</p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="heading-font text-5xl font-extrabold tabular-nums text-[var(--accent)]">{tons.toFixed(2)}</span>
            <span className="text-sm text-[var(--text-muted)] label-mono">{t.impact.unit}</span>
          </p>
          <p className="mt-2 inline-block self-start rounded-full px-3 py-1 text-xs font-semibold" style={delta.style}>
            {delta.text}
          </p>

          <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-[var(--border)]" role="img" aria-label={segments.map((s) => `${s.label}: ${kgTons(s.kg).toFixed(2)}`).join(', ')}>
            {segments.map((s) => (
              <div key={s.key} style={{ width: `${share(s.kg)}%`, background: s.color, transition: 'width 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)' }} />
            ))}
          </div>
          <ul className="mt-3 space-y-1.5">
            {segments.map((s) => (
              <li key={s.key} className="flex items-center justify-between gap-2 text-xs text-[var(--text-muted)]">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="inline-block h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: s.color }} />
                  <span className="truncate">{s.label}</span>
                </span>
                <span className="label-mono text-[var(--text)]">{kgTons(s.kg).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-7">
        <div className="flex min-h-[5.5rem] flex-wrap content-start gap-0.5" aria-hidden="true">
          {Array.from({ length: MAX_TREE_ICONS }, (_, i) => (
            <Tree key={i} shade={TREE_SHADES[i % TREE_SHADES.length]} visible={i < iconCount} delay={(i % 30) * 12} />
          ))}
        </div>
        <p className="mt-3 text-sm font-semibold text-[var(--text)]">
          {trees === 0 ? t.impact.treesZero : t.impact.trees.replace('{n}', trees.toLocaleString())}
        </p>
        {treesPerIcon > 1 && <p className="text-xs text-[var(--text-soft)]">{t.impact.treeUnit.replace('{k}', String(treesPerIcon))}</p>}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setInputs(ECO_PLAN)} className="rounded-xl px-4 py-2 text-sm font-semibold glow-btn">
          {t.impact.ecoPlan}
        </button>
        <button
          type="button"
          onClick={() => setInputs(BASELINE)}
          className="rounded-xl bg-[var(--accent-soft)] px-4 py-2 text-sm font-semibold text-[var(--accent)] transition-colors hover:brightness-95"
        >
          {t.impact.reset}
        </button>
      </div>

      <details className="mt-5 text-sm text-[var(--text-muted)]">
        <summary className="cursor-pointer font-semibold text-[var(--text)]">{t.impact.howTitle}</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>{t.impact.howCar}</li>
          <li>{t.impact.howTransit}</li>
          <li>{t.impact.howMeat}</li>
          <li>{t.impact.howFlights}</li>
          <li>{t.impact.howTrees}</li>
        </ul>
        <p className="mt-3 text-xs text-[var(--text-soft)]">{t.impact.baselineNote}</p>
      </details>
    </div>
  )
}
