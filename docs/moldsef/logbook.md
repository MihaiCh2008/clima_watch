# Laboratory logbook — ClimaWatch

**Student:** Mihai Chircu (Grade 12) · **Supervisor:** Azamat Jauysh · **Project:** ClimaWatch, local PM2.5 calibration and cost model

> **How this file was made.** Entries 1–4 were reconstructed on 2026-11-05 from the project's Git history (every hash below is a real commit; dates are the commit dates). Entries 5–6 record work done on 2026-11-05 with the AI coding assistant Claude Code, at the student's direction. The columns *Student check* are **left empty on purpose**: the student must fill them in after personally re-running and reading the item. The student should also check this layout against the official MoldSEF Template B, which was not available when this file was written.

## A. Reconstructed history (from Git)

| # | Date | Commits | Objective | What was done | Result | AI assistance | Student check |
|---|---|---|---|---|---|---|---|
| 1 | 2026-09-12 | `700f716`, `3739039`, `c71c294` | First working version | React + TypeScript front end; serverless proxy that keeps the OpenWeatherMap key off the client; live air quality for a city; profile-based recommendations; browser alerts; global climate strip; CO2 chart; RO/EN/RU; Vitest suite; deployed to Vercel | Live app at clima-watch.vercel.app | Claude Code scaffolded and wrote code and tests from the student's requirements | ☐ |
| 2 | 2026-10-06 | `1d38563`, `aecff87` | Meet the Infomatrix rules | Documentation rewritten in English with the required sections; MIT license; Responsible AI disclosure; English default; fixed a hard-coded Romanian caption and a 404 on direct links to inner pages | Rules checklist met; direct links work | Claude Code drafted text and fixes | ☐ |
| 3 | 2026-10-06 | `931f1f6`, `cfec413`, `a9ec9c0`, `4183a9d`, `3707c7d`, `238f10b`, `fbfd8e0` | Visual redesign | Dark neon look → calm light theme; text spacing; accent green → blue; several heading fonts tried, Space Grotesk kept | Final typography: Space Grotesk + Inter | Claude Code applied the changes; the student chose between options | ☐ |
| 4 | 2026-10-14 | `26be578`, `a373f67` | Interactive features | White borderless UI; canvas globe (d3-geo orthographic); particle background driven by air quality; real 7-day history; two-city comparison; impact lab; hour-by-hour planner; three new backend endpoints with CDN caching; 72 tests; README timeline and screenshots | 72 tests passing at that commit | Claude Code wrote most code; the student specified features and reviewed screenshots | ☐ |

## B. Entries for the competition upgrade (2026-11-05)

Trigger: the supervisor's evaluation of Submission #1 (score 68%, 7/10) asked for a testable hypothesis with a benchmark of at least three methods over N ≥ 100 windows, two accuracy fixes, an economic analysis, and the MoldSEF documents.

### Entry 5 — Accuracy fixes (2026-11-05)

| Item | Detail |
|---|---|
| Objective | (a) Stop averaging OpenWeatherMap's 1–5 integers in the 7-day history; (b) show planner hours in the searched city's time zone |
| Method | (a) New `api/_lib/aqiIndex.ts`: US EPA piecewise-linear AQI, computed from PM2.5, PM10, NO2 (hourly peak) and O3 (8-hour mean) with the EPA breakpoints and truncation rules; the history keeps the 1–5 level (for chart colors) derived from the continuous index, plus `aqiIndex` and the dominant pollutant. (b) New `api/_lib/timezone.ts` (IANA zone from Open-Meteo, 3 s timeout, `null` on failure) and `src/utils/time.ts` (`Intl` formatting with `h23`) |
| Evidence | 34 backend tests, 8 time-zone tests. Live check in the app: for Tokyo the planner shows "Times are in Tokyo local time (Asia/Tokyo, GMT+9)" with the first slot at 01:00 Tokyo time while the browser's own clock showed 19:23 (UTC+3) |
| Failure cases | My hand-computed expected values were wrong three times (EPA index for PM2.5 = 30 is 90, not 94; for 60 it is 154, not 153; 22.25 is truncated to 22.2 before lookup, giving 75, not 76). The tests caught each one; the code was right and the expectations were recomputed from the formula by hand |
| AI assistance | Claude Code wrote the code and tests; the breakpoints are from the EPA technical assistance document (2024 revision) |
| Student check | ☐ re-ran `npm test` ☐ read `aqiIndex.ts` against the EPA table ☐ tried the planner with a city in another time zone |

### Entry 6 — Hypothesis, data and benchmark (2026-11-05)

| Item | Detail |
|---|---|
| Objective | Test whether a small model corrects OpenWeatherMap's PM2.5 grid toward local sensor measurements (H1: ≥ 22% lower RMSE; H2: ≥ 18% fewer missed unhealthy-air alerts) |
| Pre-registration | `research/PREREGISTRATION.md` was written before any model was evaluated: hypotheses, decision rule, data, features, models, fixed hyper-parameters, validation scheme, metrics, planned robustness checks |
| Data sources tried | OpenAQ API (needs a key → not used); EEA download service (the request failed with a TLS error → not pursued); OpenAQ S3 archive (public, but it has no location metadata, so finding the Chișinău stations was not practical → not pursued); **Sensor.Community** archive (open, no key; daily files exist only from 2026-01-01) → used. OpenWeatherMap history (the project's own key) and Open-Meteo ERA5 for weather |
| Data check | 6,912 hourly rows per city (Jan–Oct 2026). 16 whole days (384 h) are missing in **both** cities; queried OpenWeatherMap directly to confirm the holes are in its own history, not in the pipeline. Mean PM2.5 observed vs. grid: Chișinău 5.35 vs 6.00 µg/m³, București 8.44 vs 6.07 µg/m³ |
| Method | Four models: raw grid, scale + offset, ridge regression, gradient-boosted trees (own implementation, 250 trees, depth 4). Blocked 6-fold cross-validation per city with 2-day gaps; day-block bootstrap (2,000 resamples, seed 11) |
| Result | N = 576 windows / 13,791 hours. RMSE 6.28 → 5.52 (scale) → 5.00 (ridge) → 4.99 (GBT, −20.5%, 95% interval 14.5–26.4%). **H1 partially supported** (target missed by 1.5 points). Miss rate 63% → 47% (−25.8%) but the interval is 0–48.6% with only 49 unhealthy days → **H2 not supported**. Ridge ≈ GBT pooled, better on unseen months (−16.2% vs −2.7%) and ~300× cheaper |
| Failure / surprise cases | (1) The accuracy target was missed; it was **not** adjusted afterwards. (2) A GBT unit test failed at first because 32 histogram buckets cannot resolve a step at exactly 5.0 on a [0, 10) feature; more buckets in the test, the production setting (48 buckets) is unchanged. (3) Forward-chaining and transfer checks showed GBT is unstable across time and cities, which was not expected from the CV result alone |
| Reproduce | `node research/pipeline/fetchDataset.ts` (needs `WEATHER_API_KEY`; ~190 MB of raw downloads cached in the git-ignored `research/data/raw/`), then `node research/benchmark.ts` (~20 s). The committed datasets in `research/data/` allow re-running the benchmark offline |
| AI assistance | Claude Code wrote the pipeline, the models and the tests. Algorithms, thresholds and the decision to report both hypotheses as they came out were fixed in `PREREGISTRATION.md` before the run |
| Student check | ☐ read `PREREGISTRATION.md` ☐ re-ran `node research/benchmark.ts` and got the same numbers ☐ opened `research/results/benchmark.json` |

### Entry 7 — Economic model (2026-11-05)

| Item | Detail |
|---|---|
| Objective | Cost per audience size, comparison with commercial displays, bounded health-economic estimate |
| Method | `src/utils/economics.ts`: upstream calls per request counted from the endpoint code; CDN cache effect from a Poisson/Zipf model of repeated requests inside each cache window; free-tier limits (OpenWeatherMap 60 calls/min and 1,000,000/month; Vercel Hobby 1,000,000 invocations/month); published list prices (IQAir AirVisual Pro €319; PurpleAir Flex US$289, Touch US$209); health model = attributable fraction 1 − RR^(−Δ/10) with relative risks, behavioral shifts and episode costs from six peer-reviewed sources, and the cleanest-2-hours gain measured in our own data |
| Result | 10,000 users × 4 visits: 1.2 M calls without a cache (over the free quota) → 239 k with it (−80.1%; −92.6% at 100,000 users). Free-tier capacity 8,333 → 119,706 users. Health: 0.001–0.63 avoided emergency episodes per 10,000 users a year (€0.22–€655, base €6) |
| Correction of the supervisor's expectation | The suggested ">95% fewer upstream calls" is **not** what the model gives at 10,000 users (80%); it is reported as computed. Two real changes were made to the code so that the model describes the deployed system: `/api/air-quality` had no CDN cache (now 10 min), and history/forecast caches were raised from 15 min to 1 h because the upstream data is hourly; a test (`api/_lib/cacheTtl.test.ts`) keeps the model and the endpoints in agreement |
| Failure cases | A regular-expression escape (`\s`) was lost by my editing script, so city names were being mangled ("Chisinau" → "chi inau"); the new `airApi` test caught it before it ran in the app |
| Limits | The baseline rate of emergency asthma episodes (0.05 / 0.10 / 0.25 per sensitive user per year) has **no source**: it is an explicit assumption to replace with national statistics |
| Student check | ☐ opened the Research page and moved the sliders ☐ checked the cited papers (references 1–6 in the abstract) |

## C. Human verification of AI-assisted code (to be completed by the student)

| Check | Done (date, initials) |
|---|---|
| Ran `npm test`, `npm run lint`, `npm run build` locally and saw them pass | |
| Read `api/_lib/aqiIndex.ts` and compared 3 values with the EPA table by hand | |
| Read `research/ml/gbt.ts` and can explain histogram split search and the leaf formula | |
| Read `research/PREREGISTRATION.md` and agrees that it was written before the run (see Git commit time once committed) | |
| Re-ran the benchmark and obtained the same RMSE values | |
| Opened each of the 6 cited papers and confirmed the number used from it (RR 1.048 and 1.036; 14–35% and 18% behavioral reductions; €214.9, €355.87, €1,041.96 per episode). The values were taken from abstracts found by web search, not from the full texts | |

Commands for the rows about running the tests and re-running the benchmark (run from the project root):

```bash
npm test                    # 146 tests
npm run lint
npm run build
node research/benchmark.ts  # rewrites research/results/benchmark.json in about 20 s; every accuracy value must match the abstract exactly (only the timing fields and the timestamp change, by a few percent, from run to run)
```

**Checks already run by the AI assistant on 2026-11-05** (these do *not* replace the student's own checks above): all 146 tests pass; `tsc -b` is clean; `npm run lint` reports one older warning in `LanguageContext.tsx`; `vite build` succeeds; `abstract.pdf` is 2 pages and `visual-annex.pdf` is 1 page, both set in Times New Roman; the numbers in `abstract.html` are asserted against `benchmark.json` by `research/docs.test.ts`; the Research page and the planner time zone were opened in a browser and showed no console errors.

## D. Planned experiments

| Planned | Why | Hypothesis / success criterion |
|---|---|---|
| Log OpenWeatherMap **forecasts** daily and compare them with sensors a few weeks later | Removes the perfect-prognosis assumption | Calibration still reduces RMSE by ≥ 20% on real forecasts |
| Add 4–6 more cities with dense sensor networks | Too few unhealthy days (49) to judge alerts | Enough alert days that the H2 interval excludes 0 or is clearly centered on 0; any such extension must be registered as an amendment before it is run |
| Compare with reference-grade stations where open data exist | Check low-cost sensor bias | Same ranking of methods |
| Deploy the per-city ridge model in the day planner | It is as accurate as trees and ~300× cheaper | A/B check in the app against the raw value |
