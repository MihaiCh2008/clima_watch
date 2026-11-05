import { useMemo, useState, type CSSProperties, type ReactNode } from 'react'
import benchmark from '../../research/results/benchmark.json'
import { NumberBadge } from '../components/NumberBadge'
import { Reveal } from '../components/Reveal'
import { useLanguage } from '../i18n/LanguageContext'
import { researchTexts, type ResearchTexts } from '../i18n/research'
import {
  COMMERCIAL_UNITS, DEFAULT_TRAFFIC, HEALTH_SCENARIOS,
  displayFleetCost, estimateHealthImpact, estimateInfra, maxUsersOnFreeTier, usersPerAvoidedEpisode,
} from '../utils/economics'
import { formatChange, formatNumber, formatPercent, formatSmart, hypothesisVerdict, type Verdict } from '../utils/research'

const MODELS = ['raw', 'scaled', 'ridge', 'gbt'] as const

const pooled = benchmark.primary.pooled
const alerts = pooled.daily15
const { users: _defaultUsers, ...TRAFFIC_SHAPE } = DEFAULT_TRAFFIC

const VERDICT_STYLE: Record<Verdict, { background: string; color: string }> = {
  supported: { background: '#e3efe1', color: '#1f6f4a' },
  partial: { background: '#f5ecd0', color: '#7a5a12' },
  notSupported: { background: '#f6dcd4', color: '#8c3a24' },
}

function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-[var(--bg-card)] p-5 sm:p-6 ${className}`}>{children}</div>
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="mb-3 text-xl font-extrabold heading-font text-[var(--text)]">{children}</h2>
}

function Th({ children, align = 'right' }: { children: ReactNode; align?: 'left' | 'right' }) {
  return <th className={`whitespace-nowrap px-2 py-2 ${align === 'left' ? 'text-left' : 'text-right'} text-[11px] font-bold tracking-wide text-[var(--text-soft)] label-mono`}>{children}</th>
}

function Td({ children, align = 'right', strong = false }: { children: ReactNode; align?: 'left' | 'right'; strong?: boolean }) {
  return <td className={`px-2 py-2 ${align === 'left' ? 'text-left' : 'text-right'} ${strong ? 'font-bold text-[var(--text)]' : 'text-[var(--text-muted)]'}`}>{children}</td>
}

function VerdictChip({ verdict, label }: { verdict: Verdict; label: string }) {
  return (
    <span className="inline-block rounded-full px-3 py-1 text-xs font-bold label-mono uppercase tracking-wide" style={VERDICT_STYLE[verdict]}>
      {label}
    </span>
  )
}

function Hypothesis({ title, text, target, estimate, low, high, r, lang, note }: {
  title: string
  text: string
  target: number
  estimate: number
  low: number
  high: number
  r: ResearchTexts
  lang: string
  note?: string
}) {
  const verdict = hypothesisVerdict(estimate, low, target)
  return (
    <Card>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <p className="heading-font text-lg font-extrabold text-[var(--text)]">{title}</p>
        <VerdictChip verdict={verdict} label={r.verdict[verdict]} />
      </div>
      <p className="mb-4 text-sm text-[var(--text-muted)]">{text}</p>
      <dl className="grid grid-cols-3 gap-3 text-center">
        {[
          [r.target, `≥ ${formatPercent(target, lang, 0)}`],
          [r.observed, formatPercent(estimate, lang)],
          [r.interval, `${formatPercent(low, lang)} … ${formatPercent(high, lang)}`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl bg-[var(--bg)] p-3">
            <dt className="text-[11px] uppercase tracking-wide text-[var(--text-soft)] label-mono">{label}</dt>
            <dd className="heading-font mt-1 text-base font-extrabold text-[var(--text)] sm:text-lg">{value}</dd>
          </div>
        ))}
      </dl>
      {note && <p className="mt-3 text-xs text-[var(--text-soft)]">{note}</p>}
    </Card>
  )
}

function Slider({ label, value, min, max, step, onChange, display }: {
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (v: number) => void
  display: string
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline justify-between gap-2 text-sm">
        <span className="font-semibold text-[var(--text)]">{label}</span>
        <span className="label-mono font-bold text-[var(--accent)]">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-slider w-full cursor-pointer"
        style={{ '--slider-color': 'var(--accent)', '--fill': `${((value - min) / (max - min)) * 100}%` } as CSSProperties}
      />
    </label>
  )
}

function Benchmark({ r, lang }: { r: ResearchTexts; lang: string }) {
  const maxRmse = Math.max(...MODELS.map((m) => pooled.hourly[m].rmse))
  const speed = benchmark.latency.perPredictionMicroseconds
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[40rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <Th align="left">{r.colMethod}</Th>
            <Th>{r.colRmse}</Th>
            <Th>{r.colVsRaw}</Th>
            <Th>{r.colMae}</Th>
            <Th>{r.colBias}</Th>
            <Th>{r.colCorr}</Th>
            <Th>{r.colSpeed}</Th>
          </tr>
        </thead>
        <tbody>
          {MODELS.map((m) => {
            const h = pooled.hourly[m]
            const change = m === 'raw' ? null : pooled.improvementAt15[m].rmse.estimate
            return (
              <tr key={m} className="border-b border-[var(--border)] align-top last:border-0">
                <Td align="left" strong>
                  <span className="block min-w-[14rem]">{r.modelName[m]}</span>
                  <span className="block min-w-[14rem] text-xs font-normal text-[var(--text-soft)]">{r.modelDesc[m]}</span>
                </Td>
                <Td strong>
                  <span className="block">{formatNumber(h.rmse, lang, 2)}</span>
                  <span className="mt-1 block h-1.5 rounded-full bg-[var(--border)]">
                    <span
                      className="block h-1.5 rounded-full"
                      style={{ width: `${(h.rmse / maxRmse) * 100}%`, background: m === 'raw' ? 'var(--text-soft)' : 'var(--accent)' }}
                    />
                  </span>
                </Td>
                <Td strong>{change === null ? '—' : formatChange(change, lang)}</Td>
                <Td>{formatNumber(h.mae, lang, 2)}</Td>
                <Td>{formatNumber(h.bias, lang, 2)}</Td>
                <Td>{formatNumber(h.r, lang, 2)}</Td>
                <Td>{formatSmart(speed[m], lang)}</Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

function Alerts({ r, lang }: { r: ResearchTexts; lang: string }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[34rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <Th align="left">{r.colMethod}</Th>
            <Th>{r.colTp}</Th>
            <Th>{r.colFp}</Th>
            <Th>{r.colFn}</Th>
            <Th>{r.colPrecision}</Th>
            <Th>{r.colRecall}</Th>
            <Th>{r.colF1}</Th>
            <Th>{r.colMissRate}</Th>
          </tr>
        </thead>
        <tbody>
          {MODELS.map((m) => {
            const a = alerts.models[m]
            return (
              <tr key={m} className="border-b border-[var(--border)] last:border-0">
                <Td align="left" strong>{r.modelName[m]}</Td>
                <Td>{a.confusion.tp}</Td>
                <Td>{a.confusion.fp}</Td>
                <Td>{a.confusion.fn}</Td>
                <Td>{formatNumber(a.precision, lang, 2)}</Td>
                <Td>{formatNumber(a.recall, lang, 2)}</Td>
                <Td strong>{formatNumber(a.f1, lang, 2)}</Td>
                <Td>{formatPercent(a.missRate, lang, 0)}</Td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Card>
  )
}

interface Check {
  label: string
  windows: number
  ridge: number
  gbt: { estimate: number; low: number; high: number }
}

function Robustness({ r, lang, checks }: { r: ResearchTexts; lang: string; checks: Check[] }) {
  return (
    <Card className="overflow-x-auto">
      <table className="w-full min-w-[32rem] text-sm">
        <thead>
          <tr className="border-b border-[var(--border)]">
            <Th align="left">{r.colCheck}</Th>
            <Th>{r.colWindows}</Th>
            <Th>{r.colRidge}</Th>
            <Th>{r.colTrees}</Th>
          </tr>
        </thead>
        <tbody>
          {checks.map((c) => (
            <tr key={c.label} className="border-b border-[var(--border)] last:border-0">
              <Td align="left" strong>{c.label}</Td>
              <Td>{c.windows}</Td>
              <Td strong>{formatChange(c.ridge, lang)}</Td>
              <Td>
                <span className="font-bold text-[var(--text)]">{formatChange(c.gbt.estimate, lang)}</span>{' '}
                <span className="text-xs text-[var(--text-soft)]">
                  ({formatChange(c.gbt.high, lang, 0)} … {formatChange(c.gbt.low, lang, 0)})
                </span>
              </Td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

export function ResearchPage() {
  const { lang } = useLanguage()
  const r = researchTexts[lang]
  const [users, setUsers] = useState(DEFAULT_TRAFFIC.users)
  const [sessions, setSessions] = useState(DEFAULT_TRAFFIC.sessionsPerUserPerMonth)
  const [sites, setSites] = useState(100)

  const cities = benchmark.data.map((d) => d.city)
  const gbt = pooled.improvementAt15.gbt
  const ridge = pooled.improvementAt15.ridge
  const alertDays = alerts.observedAlertDays
  const h1 = hypothesisVerdict(gbt.rmse.estimate, gbt.rmse.low, 0.22)
  const h2 = hypothesisVerdict(gbt.missRate.estimate, gbt.missRate.low, 0.18)

  const heating = benchmark.bySeason.find((s) => s.season.startsWith('Jan'))
  const checks: Check[] = [
    { label: r.schemes.cv, windows: pooled.windows, ridge: ridge.rmse.estimate, gbt: gbt.rmse },
    ...(heating ? [{ label: r.schemes.heating, windows: heating.windows, ridge: heating.improvementAt15.ridge.rmse.estimate, gbt: heating.improvementAt15.gbt.rmse }] : []),
    { label: r.schemes.dry, windows: benchmark.dryHoursOnly.windows, ridge: benchmark.dryHoursOnly.improvementAt15.ridge.rmse.estimate, gbt: benchmark.dryHoursOnly.improvementAt15.gbt.rmse },
    { label: r.schemes.forward, windows: benchmark.forwardChaining.windows, ridge: benchmark.forwardChaining.improvementAt15.ridge.rmse.estimate, gbt: benchmark.forwardChaining.improvementAt15.gbt.rmse },
    ...benchmark.transfer.map((t) => ({
      label: t.testedOn === 'Chișinău' ? r.schemes.toChisinau : r.schemes.toBucharest,
      windows: t.windows,
      ridge: t.improvementAt15.ridge.rmse.estimate,
      gbt: t.improvementAt15.gbt.rmse,
    })),
  ]

  const perCity = Object.entries(benchmark.primary.perCity).map(([name, s]) => ({ name, gain: s.improvementAt15.gbt.rmse.estimate }))
  const speedup = benchmark.latency.perPredictionMicroseconds.gbt / benchmark.latency.perPredictionMicroseconds.ridge
  const fill = (text: string, values: Record<string, string>) => text.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? `{${key}}`)

  const findings = [
    fill(r.findings[0], {
      gbt: formatPercent(gbt.rmse.estimate, lang),
      ridge: formatPercent(ridge.rmse.estimate, lang),
      heating: heating ? formatChange(heating.improvementAt15.gbt.rmse.estimate, lang, 0) : '',
      dry: formatChange(benchmark.dryHoursOnly.improvementAt15.gbt.rmse.estimate, lang, 0),
    }),
    fill(r.findings[1], {
      gap: formatNumber((0.22 - gbt.rmse.estimate) * 100, lang, 1),
      days: String(alertDays),
      v1: r.verdict[h1].toLowerCase(),
      v2: r.verdict[h2].toLowerCase(),
    }),
    fill(r.findings[2], {
      ridgeForward: formatChange(benchmark.forwardChaining.improvementAt15.ridge.rmse.estimate, lang, 0),
      gbtForward: formatChange(benchmark.forwardChaining.improvementAt15.gbt.rmse.estimate, lang, 0),
      speedup: formatNumber(Math.round(speedup / 10) * 10, lang),
    }),
    fill(r.findings[3], {
      city1: perCity[0].name,
      c1: formatChange(perCity[0].gain, lang, 0),
      city2: perCity[1].name,
      c2: formatChange(perCity[1].gain, lang, 0),
    }),
  ]

  const infra = useMemo(() => estimateInfra({ ...DEFAULT_TRAFFIC, users, sessionsPerUserPerMonth: sessions }), [users, sessions])
  const maxWith = useMemo(() => maxUsersOnFreeTier({ ...TRAFFIC_SHAPE, sessionsPerUserPerMonth: sessions }, true), [sessions])
  const maxWithout = useMemo(() => maxUsersOnFreeTier({ ...TRAFFIC_SHAPE, sessionsPerUserPerMonth: sessions }, false), [sessions])

  const scenarios = [
    { label: r.scenarioLow, key: 'low' },
    { label: r.scenarioBase, key: 'base' },
    { label: r.scenarioHigh, key: 'high' },
  ] as const

  return (
    <div>
      <div className="mx-auto max-w-3xl space-y-12">
        <header>
          <h1 className="heading-font text-2xl font-extrabold text-[var(--text)] sm:text-3xl">{r.title}</h1>
          <p className="mt-3 text-[var(--text-muted)]">{fill(r.subtitle, { windows: String(pooled.windows), cities: cities.join(' / ') })}</p>
        </header>

        <section>
          <SectionTitle>{r.hypothesesTitle}</SectionTitle>
          <div className="space-y-4">
            <Hypothesis
              title={r.h1Title}
              text={r.h1Text}
              target={0.22}
              estimate={gbt.rmse.estimate}
              low={gbt.rmse.low}
              high={gbt.rmse.high}
              r={r}
              lang={lang}
            />
            <Hypothesis
              title={r.h2Title}
              text={r.h2Text}
              target={0.18}
              estimate={gbt.missRate.estimate}
              low={gbt.missRate.low}
              high={gbt.missRate.high}
              r={r}
              lang={lang}
              note={fill(r.alertDaysNote, { days: String(alertDays), windows: String(pooled.windows) })}
            />
          </div>
          <p className="mt-3 text-xs text-[var(--text-soft)]">{r.ruleNote}</p>
        </section>

        <section>
          <SectionTitle>{r.benchmarkTitle}</SectionTitle>
          <p className="mb-3 text-sm text-[var(--text-muted)]">{fill(r.benchmarkNote, { windows: String(pooled.windows), hours: formatNumber(pooled.hours, lang) })}</p>
          <Benchmark r={r} lang={lang} />
        </section>

        <section>
          <SectionTitle>{r.alertsTitle}</SectionTitle>
          <p className="mb-3 text-sm text-[var(--text-muted)]">{fill(r.alertsNote, { days: String(alertDays), windows: String(alerts.windows) })}</p>
          <Alerts r={r} lang={lang} />
        </section>

        <section>
          <SectionTitle>{r.robustnessTitle}</SectionTitle>
          <p className="mb-3 text-sm text-[var(--text-muted)]">{r.robustnessNote}</p>
          <Robustness r={r} lang={lang} checks={checks} />
        </section>

        <Reveal>
          <section>
            <SectionTitle>{r.findingsTitle}</SectionTitle>
            <div className="space-y-3">
              {findings.map((text, i) => (
                <div key={i} className="flex gap-4 rounded-2xl bg-[var(--bg-card)] p-5">
                  <NumberBadge n={i + 1} />
                  <p className="pt-0.5 text-sm text-[var(--text-muted)]">{text}</p>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <section>
          <SectionTitle>{r.economicsTitle}</SectionTitle>
          <p className="mb-5 text-sm text-[var(--text-muted)]">{r.economicsIntro}</p>

          <Card className="space-y-5">
            <h3 className="heading-font text-lg font-extrabold text-[var(--text)]">{r.infraTitle}</h3>
            <div className="grid gap-5 sm:grid-cols-2">
              <Slider label={r.usersLabel} value={users} min={1000} max={200000} step={1000} onChange={setUsers} display={formatNumber(users, lang)} />
              <Slider label={r.sessionsLabel} value={sessions} min={1} max={12} step={1} onChange={setSessions} display={String(sessions)} />
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-[var(--bg)] p-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-soft)] label-mono">{r.callsWithout}</p>
                <p className="heading-font mt-1 text-2xl font-extrabold text-[var(--text)]">{formatNumber(infra.callsWithoutCache, lang)}</p>
                <p className="mt-1 text-xs font-bold" style={{ color: infra.fitsOwmFreeTierWithoutCache ? '#1f6f4a' : '#8c3a24' }}>
                  {infra.fitsOwmFreeTierWithoutCache ? r.fits : r.exceeds}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--bg)] p-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-soft)] label-mono">{r.callsWith}</p>
                <p className="heading-font mt-1 text-2xl font-extrabold text-[var(--accent)]">{formatNumber(infra.callsWithCache, lang)}</p>
                <p className="mt-1 text-xs font-bold" style={{ color: infra.fitsOwmFreeTier ? '#1f6f4a' : '#8c3a24' }}>
                  {infra.fitsOwmFreeTier ? r.fits : r.exceeds}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--bg)] p-4">
                <p className="text-[11px] uppercase tracking-wide text-[var(--text-soft)] label-mono">{r.callsAvoided}</p>
                <p className="heading-font mt-1 text-2xl font-extrabold text-[var(--text)]">{formatPercent(infra.reduction, lang, 1)}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--text-soft)]">{r.freeTier}</p>

            <div>
              <p className="mb-1 text-sm font-semibold text-[var(--text)]">{r.maxUsersTitle}</p>
              <p className="text-sm text-[var(--text-muted)]">
                <span className="label-mono font-bold text-[var(--text)]">{formatNumber(maxWithout, lang)}</span> {r.maxUsersWithout} →{' '}
                <span className="label-mono font-bold text-[var(--accent)]">{formatNumber(maxWith, lang)}</span> {r.maxUsersWith}
              </p>
            </div>

            <p className="rounded-xl bg-[var(--accent-soft)] px-4 py-3 text-sm font-semibold text-[var(--accent)]">{r.costNow}</p>
            <p className="text-xs text-[var(--text-soft)]">{r.infraNote}</p>
          </Card>

          <Card className="mt-4 space-y-4">
            <h3 className="heading-font text-lg font-extrabold text-[var(--text)]">{r.commercialTitle}</h3>
            <Slider label={r.sitesLabel} value={sites} min={1} max={500} step={1} onChange={setSites} display={formatNumber(sites, lang)} />
            <ul className="space-y-2 text-sm">
              {COMMERCIAL_UNITS.map((u) => (
                <li key={u.name} className="flex items-baseline justify-between gap-3 border-b border-[var(--border)] pb-2">
                  <span className="text-[var(--text-muted)]">
                    {u.name} <span className="text-xs text-[var(--text-soft)]">({formatNumber(u.price, lang)} {u.currency})</span>
                  </span>
                  <span className="label-mono font-bold text-[var(--text)]">
                    {formatNumber(displayFleetCost(sites, u.price), lang)} {u.currency}
                  </span>
                </li>
              ))}
              <li className="flex items-baseline justify-between gap-3">
                <span className="font-semibold text-[var(--accent)]">{r.commercialOurs}</span>
                <span className="label-mono font-bold text-[var(--accent)]">0 €</span>
              </li>
            </ul>
            <p className="text-xs text-[var(--text-soft)]">{r.commercialNote}</p>
          </Card>

          <Card className="mt-4 space-y-4 overflow-x-auto">
            <h3 className="heading-font text-lg font-extrabold text-[var(--text)]">{r.healthTitle}</h3>
            <p className="text-sm text-[var(--text-muted)]">{fill(r.healthIntro, { users: formatNumber(users, lang) })}</p>
            <table className="w-full min-w-[28rem] text-sm">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <Th align="left">{r.colScenario}</Th>
                  <Th>{r.colEpisodes}</Th>
                  <Th>{r.colSaved}</Th>
                  <Th>{r.colAudience}</Th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map(({ label, key }) => {
                  const impact = estimateHealthImpact(users, HEALTH_SCENARIOS[key])
                  return (
                    <tr key={key} className="border-b border-[var(--border)] last:border-0">
                      <Td align="left" strong>{label}</Td>
                      <Td>{formatSmart(impact.avoidedEpisodesPerYear, lang)}</Td>
                      <Td strong>{formatSmart(impact.avoidedCostEurPerYear, lang)}</Td>
                      <Td>{formatSmart(usersPerAvoidedEpisode(HEALTH_SCENARIOS[key]), lang)}</Td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="rounded-xl bg-[var(--bg)] px-4 py-3 text-sm text-[var(--text-muted)]">{r.healthReading}</p>
            <p className="text-xs text-[var(--text-soft)]">{r.healthNote}</p>
          </Card>
        </section>

        <section>
          <SectionTitle>{r.limitsTitle}</SectionTitle>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            {r.limits.map((limit) => (
              <li key={limit} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text-soft)]" />
                <span>{limit}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-[var(--text-soft)]">{r.repoNote}</p>
        </section>
      </div>
    </div>
  )
}
