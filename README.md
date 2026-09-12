# 🌍 ClimaWatch

**Schimbările climatice sunt globale și abstracte. Poluarea aerului din orașul tău e un semnal local, concret, al acelorași cauze.** ClimaWatch leagă cele două — date climatice reale, calitatea aerului live pentru orice oraș, și recomandări personalizate de acțiune.

Proiect realizat pentru categoria **Software Development** (Infomatrix).

---

## Problema

- **+1.55°C** peste nivelul preindustrial — 2024, cel mai cald an înregistrat vreodată ([NASA / Carbon Brief](https://www.carbonbrief.org/state-of-the-climate-2025-in-top-three-hottest-years-on-record-as-ocean-heat-surges/))
- **430 ppm** CO2 în atmosferă — cel mai ridicat nivel din ultimii 3+ milioane de ani ([NASA](https://science.nasa.gov/earth/explore/earth-indicators/carbon-dioxide/))
- **+11 cm** creșterea nivelului mării din 1993 — ritmul aproape s-a dublat din 2012 ([NASA / NOAA](https://climate.nasa.gov/vital-signs/sea-level/))

Problema nu e doar lipsa datelor (există senzori, API-uri publice), ci faptul că sunt greu de interpretat de un om obișnuit, iar efectele climatice se simt lent, global și abstract — greu de conectat la viața de zi cu zi.

## Soluția

ClimaWatch face legătura dintre **global** și **local**:

1. **Context climatic global, live** — CO2 atmosferic, încălzire globală, ani de la Acordul de la Paris (calculat dinamic).
2. **Semnal local, concret** — verifici calitatea aerului din orice oraș, în timp real, via API extern.
3. **Profil personalizat** — spui dacă ai astm, un copil mic, faci sport afară sau vrei sfaturi despre amprenta de carbon — aplicația adaptează recomandările.
4. **Recomandare de acțiune, nu doar un status** — „evită alergatul azi", nu doar „Aer moderat".
5. **Alertă proactivă** — notificare de browser când aerul devine nesănătos pentru profilul tău.
6. **Grafic istoric interactiv** — emisii CO2 pe țară, din 1750 până azi (Our World in Data).
7. **Legături către organizații reale** — UNFCCC, Climate & Clean Air Coalition.

Disponibil în **română, engleză și rusă**.

---

## Arhitectură — Frontend + Backend

```
Browser (React)                    Server (funcție serverless)
┌─────────────────────┐            ┌──────────────────────────┐
│  useAirQuality.ts    │  fetch     │  api/air-quality.ts       │
│  fetch('/api/        │ ─────────▶ │  (format Vercel,          │
│   air-quality?city')  │            │   deployabil gratuit)     │
└─────────────────────┘            │            │              │
                                    │            ▼              │
                                    │  api/_lib/getAirQuality.ts │
                                    │  (geocodare + calitate aer)│
                                    └──────────────┼─────────────┘
                                                   │ appid=<cheie ascunsă>
                                                   ▼
                                        OpenWeatherMap API
```

- **Cheia API nu ajunge niciodată în browser** — trăiește doar în `WEATHER_API_KEY` (variabilă de mediu server-side, fără prefixul `VITE_`).
- În **producție** (Vercel), `api/air-quality.ts` rulează ca funcție serverless reală.
- În **dezvoltare locală**, `vite-plugins/localApi.ts` emulează exact același endpoint prin serverul de dev Vite — zero cont, zero CLI extern, zero cost.

---

## Stack tehnic

| | |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router |
| Backend | Funcție serverless (Node.js, format Vercel) |
| Traduceri | Context React custom (RO/EN/RU), fără librărie externă |
| Date live | [OpenWeatherMap](https://openweathermap.org/) (geocodare + calitate aer) |
| Grafic istoric | [Our World in Data](https://ourworldindata.org/) (embed live) |
| Video | [TED](https://www.ted.com/) — Katharine Hayhoe |
| Teste | Vitest |

## Structura proiectului

```
src/
  components/     UI reutilizabil (carduri, notițe, fundaluri SVG, embed-uri)
  pages/          Problema, Soluția, Verifică live, Profilul meu
  hooks/          useAirQuality, useProfile
  i18n/           traduceri RO/EN/RU + context de limbă
  utils/          logica de recomandare, istoricul mock
  constants/      praguri și culori AQI
api/
  air-quality.ts       funcția serverless (deployabilă)
  _lib/getAirQuality.ts  logica de backend, partajată
vite-plugins/
  localApi.ts     emulează backend-ul în dezvoltare locală
```

## Rulare locală

```bash
npm install
npm run dev
```

Ai nevoie de un fișier `.env` la rădăcina proiectului:

```
WEATHER_API_KEY=cheia_ta_de_la_openweathermap.org
```

(cheie gratuită, cont fără card bancar)

## Teste

```bash
npm test
```

Acoperă logica de recomandare (toate combinațiile profil × calitate aer) și backend-ul (`api/_lib/getAirQuality.ts`: oraș lipsă, oraș negăsit, cheie API lipsă, răspuns valid).

## Deploy (opțional)

Structura `api/*.ts` e recunoscută automat de [Vercel](https://vercel.com) — conectezi repo-ul, adaugi `WEATHER_API_KEY` ca variabilă de mediu în dashboard, gata. Tier-ul Hobby e gratuit, fără card bancar.

## Surse

NASA (climate.nasa.gov), NOAA (noaa.gov), IPCC (ipcc.ch), Carbon Brief, Our World in Data (ourworldindata.org), IQAir World Air Quality Report 2025, EPA (epa.gov), AirNow.gov, TED, UNFCCC (unfccc.int), Climate & Clean Air Coalition (ccacoalition.org).
