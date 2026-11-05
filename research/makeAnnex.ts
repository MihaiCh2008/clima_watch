/**
 * Builds the one-page visual annex (docs/moldsef/visual-annex.html) from the benchmark results and the
 * cost model, so no number in it is typed by hand.
 *
 *   node research/makeAnnex.ts
 *   chrome --headless --no-pdf-header-footer --print-to-pdf=docs/moldsef/visual-annex.pdf file:///.../visual-annex.html
 */
import { writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import benchmark from './results/benchmark.json' with { type: 'json' }
import {
  COMMERCIAL_UNITS, DEFAULT_TRAFFIC, HEALTH_SCENARIOS, OWM_FREE_CALLS_PER_MONTH,
  displayFleetCost, estimateHealthImpact, estimateInfra, maxUsersOnFreeTier,
} from '../src/utils/economics.ts'

const OUT = fileURLToPath(new URL('../docs/moldsef/visual-annex.html', import.meta.url))
const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
const pct = (x: number, d = 1) => `${fmt(x * 100, d)}%`

const pooled = benchmark.primary.pooled
const models = [
  { id: 'raw', label: 'Raw OWM grid', color: '#8c8c8c' },
  { id: 'scaled', label: 'Scale + offset', color: '#6b8fb0' },
  { id: 'ridge', label: 'Ridge regression', color: '#2f6f96' },
  { id: 'gbt', label: 'Gradient-boosted trees', color: '#1d4f73' },
] as const

// ---- Figure 2: hourly RMSE bars + alert miss rate
const maxRmse = Math.max(...models.map((m) => pooled.hourly[m.id].rmse))
const rmseBars = models
  .map((m, i) => {
    const v = pooled.hourly[m.id].rmse
    const w = (v / maxRmse) * 190
    const change = m.id === 'raw' ? '' : `  (−${pct(pooled.improvementAt15[m.id].rmse.estimate)})`
    const y = 18 + i * 26
    return `<text x="0" y="${y + 12}" font-size="11">${m.label}</text><rect x="125" y="${y}" width="${w.toFixed(1)}" height="16" fill="${m.color}"/><text x="${(129 + w).toFixed(1)}" y="${y + 12}" font-size="11">${fmt(v, 2)}${change}</text>`
  })
  .join('')

const missBars = models
  .map((m, i) => {
    const miss = pooled.daily15.models[m.id].missRate
    const w = miss * 190
    const y = 18 + i * 26
    return `<text x="0" y="${y + 12}" font-size="11">${m.label}</text><rect x="125" y="${y}" width="${w.toFixed(1)}" height="16" fill="${m.color}"/><text x="${(129 + w).toFixed(1)}" y="${y + 12}" font-size="11">${pct(miss, 0)}</text>`
  })
  .join('')

// ---- Figure 3: upstream calls at the default audience
const infra = estimateInfra(DEFAULT_TRAFFIC)
const BAR_X = 80
const scale = 480 / Math.max(infra.callsWithoutCache, OWM_FREE_CALLS_PER_MONTH)
const quotaX = BAR_X + OWM_FREE_CALLS_PER_MONTH * scale
const callBars = [
  { label: 'No cache', value: infra.callsWithoutCache, color: '#8c8c8c' },
  { label: 'CDN cache', value: infra.callsWithCache, color: '#1d4f73' },
]
  .map((b, i) => {
    const y = 14 + i * 28
    return `<text x="0" y="${y + 13}" font-size="11">${b.label}</text><rect x="${BAR_X}" y="${y}" width="${(b.value * scale).toFixed(1)}" height="18" fill="${b.color}"/><text x="${(BAR_X + 4 + b.value * scale).toFixed(1)}" y="${y + 13}" font-size="11">${fmt(b.value)}</text>`
  })
  .join('')
const quotaLine = `<line x1="${quotaX.toFixed(1)}" x2="${quotaX.toFixed(1)}" y1="6" y2="66" stroke="#a8432a" stroke-dasharray="4 3"/><text x="${(quotaX + 4).toFixed(1)}" y="76" font-size="10" fill="#a8432a">free quota 1,000,000</text>`

// ---- cost table
const { users: _users, ...shape } = DEFAULT_TRAFFIC
const hq = (key: 'low' | 'base' | 'high') => estimateHealthImpact(10_000, HEALTH_SCENARIOS[key])
const euros = (n: number) => (n < 10 ? fmt(n, 2) : fmt(n))
const costRows = [
  ['Hardware for 100 sites', `€${fmt(displayFleetCost(100, COMMERCIAL_UNITS[0].price))} (${COMMERCIAL_UNITS[0].name}, list price)`, '€0 (any browser)'],
  ['Hosting and API per month', 'not applicable', '€0 inside the free tiers'],
  ['Users per month inside the free tier', `${fmt(maxUsersOnFreeTier(shape, false))} without cache`, `${fmt(maxUsersOnFreeTier(shape, true))} with cache`],
  [
    'Avoided asthma emergency episodes per 10,000 users a year',
    '—',
    `${fmt(hq('low').avoidedEpisodesPerYear, 3)} – ${fmt(hq('high').avoidedEpisodesPerYear, 2)} (base ${fmt(hq('base').avoidedEpisodesPerYear, 3)})`,
  ],
  ['Estimated health-system saving per 10,000 users a year', '—', `€${euros(hq('low').avoidedCostEurPerYear)} – €${euros(hq('high').avoidedCostEurPerYear)} (base €${euros(hq('base').avoidedCostEurPerYear)})`],
]
  .map(([a, b, c]) => `<tr><td class="l">${a}</td><td>${b}</td><td>${c}</td></tr>`)
  .join('\n')

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>ClimaWatch — visual annex</title>
<style>
  @page { size: A4; margin: 1.6cm 1.8cm; }
  html, body { margin: 0; padding: 0; }
  body { font-family: "Times New Roman", Times, serif; font-size: 12pt; line-height: 1.15; color: #000; }
  h1 { font-size: 13pt; margin: 0 0 4pt; text-align: center; }
  h2 { font-size: 12pt; margin: 9pt 0 3pt; }
  p { margin: 0 0 3pt; }
  svg { width: 100%; height: auto; display: block; font-family: "Times New Roman", Times, serif; }
  .row { display: flex; gap: 14pt; }
  .row svg { width: 100%; }
  .row > div { flex: 1; }
  table { border-collapse: collapse; width: 100%; font-size: 12pt; }
  th, td { border: 0.5pt solid #000; padding: 1pt 4pt; text-align: center; }
  td.l, th.l { text-align: left; }
  .note { font-size: 10pt; }
</style>
</head>
<body>
<h1>ClimaWatch — visual annex</h1>

<h2>Figure 1. Architecture and research pipeline</h2>
<svg viewBox="0 0 700 150" font-size="11">
  <defs><marker id="a" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#333"/></marker></defs>
  <g stroke="#333" fill="#eef2f5">
    <rect x="4" y="10" width="118" height="40" rx="4"/><rect x="170" y="10" width="118" height="40" rx="4"/><rect x="336" y="10" width="118" height="40" rx="4"/><rect x="502" y="10" width="190" height="40" rx="4"/>
    <rect x="4" y="92" width="150" height="40" rx="4"/><rect x="200" y="92" width="150" height="40" rx="4"/><rect x="396" y="92" width="130" height="40" rx="4"/><rect x="572" y="92" width="120" height="40" rx="4"/>
  </g>
  <g text-anchor="middle" fill="#000">
    <text x="63" y="28">Browser (React 19)</text><text x="63" y="43" font-size="10">EN / RO / RU</text>
    <text x="229" y="28">CDN cache</text><text x="229" y="43" font-size="10">s-maxage 600–3600 s</text>
    <text x="395" y="28">Serverless /api/*</text><text x="395" y="43" font-size="10">API key stays here</text>
    <text x="597" y="28">OpenWeatherMap · Open-Meteo</text><text x="597" y="43" font-size="10">air, forecast, history, time zone</text>
    <text x="79" y="110">Sensor.Community</text><text x="79" y="125" font-size="10">ground truth (sensors)</text>
    <text x="275" y="110">research/benchmark.ts</text><text x="275" y="125" font-size="10">ridge · GBT · bootstrap</text>
    <text x="461" y="110">benchmark.json</text><text x="461" y="125" font-size="10">pre-registered</text>
    <text x="632" y="110">Research page</text><text x="632" y="125" font-size="10">in the app</text>
  </g>
  <g stroke="#333" stroke-width="1.4" marker-end="url(#a)" fill="none">
    <line x1="122" y1="30" x2="168" y2="30"/><line x1="288" y1="30" x2="334" y2="30"/><line x1="454" y1="30" x2="500" y2="30"/>
    <line x1="154" y1="112" x2="198" y2="112"/><line x1="350" y1="112" x2="394" y2="112"/><line x1="526" y1="112" x2="570" y2="112"/>
    <path d="M597,50 C597,70 300,70 275,90"/>
  </g>
</svg>

<h2>Figure 2. Benchmark: 576 test windows (13,791 hours), blocked cross-validation</h2>
<div class="row">
  <div>
    <p class="note">Hourly PM2.5 RMSE, µg/m³ (lower is better)</p>
    <svg viewBox="0 0 360 120">${rmseBars}</svg>
  </div>
  <div>
    <p class="note">Unhealthy days missed (of ${pooled.daily15.observedAlertDays}, daily mean ≥ 15 µg/m³)</p>
    <svg viewBox="0 0 360 120">${missBars}</svg>
  </div>
</div>

<h2>Figure 3. Upstream API calls per month for ${fmt(DEFAULT_TRAFFIC.users)} users (${DEFAULT_TRAFFIC.sessionsPerUserPerMonth} visits each)</h2>
<svg viewBox="0 0 720 84">${callBars}${quotaLine}</svg>
<p class="note">The CDN cache removes ${pct(infra.reduction)} of the calls; without it the audience exceeds the free quota.</p>

<h2>Table 1. Cost and impact summary</h2>
<table>
<tr><th class="l">Item</th><th>Dedicated display monitors</th><th>ClimaWatch</th></tr>
${costRows}
</table>
<p class="note">Health figures are an order-of-magnitude model with a stated assumption for the baseline episode rate (see abstract, section 4). Display prices: IQAir EU list price; PurpleAir Flex US$289 and Touch US$209.</p>
</body>
</html>
`

await writeFile(OUT, html)
console.log(`wrote ${OUT}`)
