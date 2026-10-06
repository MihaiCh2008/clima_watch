# 🌍 ClimaWatch

**Climate change is global and abstract. The air pollution in your own city is a local, concrete signal of the very same causes.** ClimaWatch connects the two — real climate data, live air quality for any city, and recommendations personalized to you.

Project submitted to Infomatrix, category **Software Development** (Project Contest).

### 🔴 [Try the live app → clima-watch.vercel.app](https://clima-watch.vercel.app)

---

## 1. Project Description

### The problem

- **+1.55°C** above pre-industrial levels — 2024, the hottest year ever recorded ([NASA / Carbon Brief](https://www.carbonbrief.org/state-of-the-climate-2025-in-top-three-hottest-years-on-record-as-ocean-heat-surges/))
- **430 ppm** of CO2 in the atmosphere — the highest level in over 3 million years ([NASA](https://science.nasa.gov/earth/explore/earth-indicators/carbon-dioxide/))
- **+11 cm** sea level rise since 1993 — the rate has nearly doubled since 2012 ([NASA / NOAA](https://climate.nasa.gov/vital-signs/sea-level/))

The problem isn't a lack of data — sensors and public APIs already exist. It's that this data is hard for an average person to interpret, and climate effects are felt slowly, globally, and abstractly — hard to connect to everyday life.

### The solution

ClimaWatch bridges the **global** and the **local**:

1. **Live global climate context** — atmospheric CO2, global warming, years since the Paris Agreement (computed dynamically).
2. **A concrete, local signal** — check real-time air quality for any city, via an external API.
3. **A personal profile** — tell the app if you have asthma, a young child, exercise outdoors, or want carbon-footprint tips, and recommendations adapt to you.
4. **An action recommendation, not just a status** — "avoid running outside today," not just "Moderate air quality."
5. **Proactive alerts** — a browser notification when air quality turns unhealthy for your profile.
6. **An interactive historical chart** — CO2 emissions by country, from 1750 to today (Our World in Data).
7. **Links to real organizations** — UNFCCC, Climate & Clean Air Coalition.

Available in **English, Romanian, and Russian**.

---

## 2. People Involved

| Role | Name |
|---|---|
| Student developer | Mihai Chircu |
| Supervisor | Azamat Jayush |

Team size: 1 student (solo entry), within the category's 1–2 student limit.

---

## 3. Early-Stage Plan & Design Decisions

Before writing code, the project started from one framing question: *how do you make an abstract, global problem (climate change) feel personally relevant to one person, in one city, today?* That question shaped three early decisions that drove the rest of the design:

1. **Pair a global stat strip with a local, searchable signal** — instead of a wall of climate statistics, the homepage opens with a short global context strip, then immediately lets the user check their own city.
2. **Personalize instead of just display** — a flat AQI number means little to most people. A short profile (asthma, young child, outdoor sport, carbon-footprint interest) was planned from the start so the same air-quality reading could produce a different, actionable recommendation for each user.
3. **Never expose the third-party API key in the browser** — since the app would call a paid-tier-capable weather API, the architecture was split into a frontend and a small backend proxy from the first design pass, specifically so the API key would never ship to the client (see [Architecture](#4-architecture) and [Problems Faced](#6-problems-faced--how-they-were-solved) below).

From there the feature set grew iteratively: global context → city search and AQI display → profile-based recommendations → proactive browser alerts → historical emissions chart → multi-language support (RO/EN/RU).

---

## 4. Architecture

```
Browser (React)                    Server (serverless function)
┌─────────────────────┐            ┌──────────────────────────┐
│  useAirQuality.ts    │  fetch     │  api/air-quality.ts       │
│  fetch('/api/        │ ─────────▶ │  (Vercel function format, │
│   air-quality?city')  │            │   deployable for free)    │
└─────────────────────┘            │            │              │
                                    │            ▼              │
                                    │  api/_lib/getAirQuality.ts │
                                    │  (geocoding + air quality) │
                                    └──────────────┼─────────────┘
                                                   │ appid=<hidden key>
                                                   ▼
                                        OpenWeatherMap API
```

- **The API key never reaches the browser** — it lives only in `WEATHER_API_KEY`, a server-side environment variable, without the `VITE_` prefix that would expose it to the client bundle.
- In **production** (Vercel), `api/air-quality.ts` runs as a real serverless function.
- In **local development**, `vite-plugins/localApi.ts` emulates the exact same endpoint through Vite's own dev server — no account, no external CLI, no cost.

---

## 5. Software & Hardware Specifications

| | |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, React Router |
| Backend | Serverless function (Node.js, Vercel function format) |
| Translations | Custom React context (RO/EN/RU), no external library |
| Live data | [OpenWeatherMap](https://openweathermap.org/) (geocoding + air quality) |
| Historical chart | [Our World in Data](https://ourworldindata.org/) (live embed) |
| Video | [TED](https://www.ted.com/) — Katharine Hayhoe |
| Testing | Vitest |
| Hardware | None — ClimaWatch is a web application; it runs in any modern browser on any device with an internet connection (desktop, laptop, tablet, or phone). No dedicated hardware was built or required. |

### Project structure

```
src/
  components/     Reusable UI (cards, side notes, SVG backgrounds, embeds)
  pages/          Problem, Solution, Live check, My profile
  hooks/          useAirQuality, useProfile
  i18n/           RO/EN/RU translations + language context
  utils/          Recommendation logic, mock history
  constants/      AQI thresholds and colors
api/
  air-quality.ts       Serverless function (deployable)
  _lib/getAirQuality.ts  Shared backend logic
vite-plugins/
  localApi.ts     Emulates the backend in local development
```

---

## 6. Problems Faced & How They Were Solved

- **Risk of leaking the API key to the client.** A client-side `fetch` straight to OpenWeatherMap would ship the API key in every browser request, visible to anyone who opens dev tools. *Solution:* the app never calls the third-party API directly from the browser — it calls a same-origin `/api/air-quality` endpoint, and only the server-side code holds the key. This is covered by an automated test (`getAirQuality.test.ts`) that asserts the key never appears anywhere in the response body.
- **No backend during local development.** Serverless functions only run once deployed, which would make local development slow and dependent on a Vercel account. *Solution:* `vite-plugins/localApi.ts` emulates the same `/api/air-quality` route inside Vite's own dev server, so the frontend and backend logic can be developed and tested together with a single `npm run dev`, no deployment needed.
- **Unreliable third-party input.** The air-quality API can be called with a missing city, a blank city, a city that doesn't exist, or without a configured key. *Solution:* each case is handled explicitly and covered by tests — a missing/blank city returns `400`, a missing server key returns `500`, and a city with no geocoding match returns `404`, instead of the app crashing or showing a misleading result.
- **One AQI number means different things to different people.** A "Moderate" air-quality reading isn't equally relevant to everyone. *Solution:* a lightweight local profile (asthma, young child, outdoor sport, carbon-footprint interest) is combined with the live AQI to produce a specific recommendation, tested against every profile × air-quality combination in `recommendations.test.ts`.
- **Reaching an international-style audience in one codebase.** The project needed to work for Romanian, English, and Russian speakers without pulling in a heavy i18n library. *Solution:* a small custom React context (`i18n/LanguageContext.tsx`) holds the active language and a typed translation table, with the saved preference persisted in `localStorage` and English used by default on a first visit.

---

## 7. Responsible AI Usage

AI tools were used during development, in line with the category's rules on citing AI assistance.

- **Tool used:** [Claude Code](https://claude.com/claude-code) (Anthropic), an AI coding assistant built on Claude models, used as a pair-programming tool throughout development.
- **How it was used:** scaffolding the project structure, writing and refactoring frontend/backend TypeScript code, generating the automated test suite, and drafting documentation (including this README) from directions and requirements given by the student.
- **Human oversight:** every piece of generated code was reviewed, run, and tested before being kept in the project. Product decisions — what the app should do, which problem it solves, how recommendations should behave, what the architecture should protect against (see [Problems Faced](#6-problems-faced--how-they-were-solved)) — were directed by the student, not the AI.
- **What was not AI-generated:** the live third-party data (OpenWeatherMap, Our World in Data), the climate statistics and their sources, and the TED video are all real external sources, linked and credited in [Sources](#sources) below — none of it is AI-generated content.

No AI-generated text, image, or code in this project is presented as original human work without this disclosure.

---

## Running locally

```bash
npm install
npm run dev
```

You need a `.env` file at the project root:

```
WEATHER_API_KEY=your_openweathermap.org_key
```

(free key, no credit card required)

## Testing

```bash
npm test
```

Covers the recommendation logic (every profile × air-quality combination) and the backend (`api/_lib/getAirQuality.ts`: missing city, city not found, missing API key, valid response, and that the API key never leaks into the response).

## Deployment

The `api/*.ts` structure is automatically recognized by [Vercel](https://vercel.com) — connect the repo, add `WEATHER_API_KEY` as an environment variable in the dashboard, done. The Hobby tier is free, no credit card required.

## Sources

NASA (climate.nasa.gov), NOAA (noaa.gov), IPCC (ipcc.ch), Carbon Brief, Our World in Data (ourworldindata.org), IQAir World Air Quality Report 2025, EPA (epa.gov), AirNow.gov, TED, UNFCCC (unfccc.int), Climate & Clean Air Coalition (ccacoalition.org).

## License

[MIT](LICENSE) — open source, per Infomatrix competition rules.
