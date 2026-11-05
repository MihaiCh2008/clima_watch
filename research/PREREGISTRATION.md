# Pre-registration: local PM2.5 bias correction

Written on **2026-11-05**, **before** any model was evaluated on the data. Datasets were downloaded, but no model had been fitted and no error metric had been computed. Everything below is fixed here; the benchmark script (`research/benchmark.ts`) implements exactly this, and anything it reports beyond this list is labeled *exploratory*.

## Question

Coarse global air-pollution grids (here: OpenWeatherMap's `air_pollution` product) tend to miss local urban PM2.5 behaviour. Can a small model that uses only information available at forecast time (the grid's own pollutant estimates, weather, hour of day) correct that grid toward what local sensors measure?

## Hypotheses

**H1 (accuracy).** Calibrating the gridded PM2.5 with local meteorological and co-pollutant features using gradient-boosted trees reduces the hourly PM2.5 RMSE by **at least 22%** relative to the raw OpenWeatherMap value, over **N ≥ 100** held-out 24-hour windows.

**H2 (health alerts).** The same model reduces the **miss rate of unhealthy-air alerts** (days whose observed mean PM2.5 is ≥ 15 µg/m³, the WHO 2021 24-hour guideline level, the threshold used for asthmatic/sensitive profiles) by **at least 18%** relative to the raw OpenWeatherMap value.

The 22% / 18% thresholds were proposed by the project supervisor as an example target; they were **not** adjusted after seeing any result.

## Decision rule

For each hypothesis, using a 95% day-block bootstrap interval of the relative reduction:

| Outcome | Condition |
|---|---|
| **Supported** | point estimate ≥ threshold **and** interval lower bound > 0 |
| **Partially supported** | interval lower bound > 0, but point estimate < threshold (the improvement is real but smaller than hypothesized) |
| **Not supported** | otherwise |

The result will be reported in the same words whichever row it lands in.

## Data

| | |
|---|---|
| Cities | Chișinău (47.0105 N, 28.8638 E), București (44.4268 N, 26.1025 E) |
| Period | 2026-01-01 to 2026-10-31 (UTC); rows where any input is missing are dropped |
| Ground truth | Median across the city's [Sensor.Community](https://archive.sensor.community/) particulate sensors within 12 km of the center (nearest 8 for Chișinău, nearest 10 for București). An hour counts only if ≥ 2 (Chișinău) / ≥ 3 (București) sensors reported it. |
| Sensor quality control | Drop PM2.5 > 500 or PM10 > 1000 µg/m³, negative values, and pairs where PM2.5 > 1.2 × PM10 + 2; an hourly sensor mean needs ≥ 6 readings |
| Gridded estimate (baseline input) | OpenWeatherMap `air_pollution/history`, hourly, at the city center |
| Weather | Open-Meteo ERA5 archive, hourly: temperature, relative humidity, wind speed and direction, surface pressure, precipitation, boundary-layer height |

**Perfect-prognosis assumption.** OpenWeatherMap does not archive its past forecasts, so the gridded value *for the target hour* stands in for the forecast, and ERA5 stands in for the weather forecast. Real forecasts contain additional error that this setup does not include, in both the baseline and the corrected values. Results therefore describe how well the *calibration step* works, not an end-to-end forecast skill.

**Ground-truth caveat.** Sensor.Community sensors are low-cost optical counters (mostly SDS011). They are noisier than reference instruments and read high in humid air. Mitigations fixed in advance: the median across several sensors, the plausibility filter above, and a sensitivity analysis restricted to hours with relative humidity < 75%.

## Features (identical for every learned model)

OpenWeatherMap PM2.5, PM10; log(1+x) of NO2, O3, CO, SO2, NH3, NO; trailing 24-hour mean of OpenWeatherMap PM2.5; temperature, relative humidity, wind speed, sin/cos of wind direction, surface pressure, log(1+precipitation), log(1+boundary-layer height); sin/cos of hour of day; weekend flag. No observation from the sensors is used as an input.

## Methods compared

| Id | Method |
|---|---|
| `raw` | OpenWeatherMap PM2.5, unchanged (**baseline**) |
| `scaled` | Ablation: least squares on OpenWeatherMap PM2.5 alone (a scale and an offset) |
| `ridge` | Ridge regression on all features; λ chosen from {0.1, 1, 10, 100, 1000} on the latest 20% of the training rows only |
| `gbt` | Gradient-boosted regression trees, written from scratch: 250 trees, depth 4, learning rate 0.05, subsample 0.8, min. leaf 30, L2 1, 48 histogram bins, seed 7. **Not tuned on any test fold.** |

All predictions are clipped at 0 µg/m³. One model per city per fold.

## Evaluation

* **Test window** = one UTC day of one city with at least 18 hours of ground truth.
* **Primary scheme: blocked 6-fold cross-validation** over time, per city. Each fold holds out one contiguous block of days; the 2 days on each side of it are removed from training. Every day is tested exactly once, so all windows of both cities are test windows.
* **Metrics.** Hourly RMSE (primary), MAE, bias, Pearson r; RMSE of daily means; alerts on the daily mean at 15 µg/m³ (primary) and at 35.5 µg/m³ (US EPA "unhealthy for sensitive groups"): confusion matrix, precision, recall, F1, miss rate.
* **Uncertainty.** 2000-resample day-block bootstrap (seed 11), resampling (city, day) windows; 95% percentile intervals of the relative reduction versus `raw`.
* **Inference latency** measured on the full models on the machine that ran the benchmark.

## Planned robustness checks (reported, not part of the decision rule)

1. Relative humidity < 75% subset (sensor-bias sensitivity).
2. Forward-chaining: train on days before 2026-07-01, test on days from 2026-07-01 (no future data in training).
3. Cross-city transfer: train on one city, test on the other.
4. Results by season (Jan–Mar heating season, Apr–May, Jun–Aug, Sep–Oct).
5. GBT feature importance and ridge coefficients.

## What this study cannot show

* Skill against reference-grade (regulatory) stations; none are available in Chișinău through an open, key-free source.
* Skill of a *forecast* issued in advance (see the perfect-prognosis assumption).
* Anything beyond the two cities and the ten months covered.
