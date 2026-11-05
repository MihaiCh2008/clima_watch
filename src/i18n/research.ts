import type { Lang } from './translations'

type ModelId = 'raw' | 'scaled' | 'ridge' | 'gbt'

export interface ResearchTexts {
  title: string
  /** {windows}, {cities} */
  subtitle: string
  hypothesesTitle: string
  ruleNote: string
  h1Title: string
  h1Text: string
  h2Title: string
  h2Text: string
  target: string
  observed: string
  interval: string
  verdict: { supported: string; partial: string; notSupported: string }
  /** {days}, {windows} */
  alertDaysNote: string
  benchmarkTitle: string
  /** {windows}, {hours} */
  benchmarkNote: string
  colMethod: string
  colRmse: string
  colVsRaw: string
  colMae: string
  colBias: string
  colCorr: string
  colSpeed: string
  modelName: Record<ModelId, string>
  modelDesc: Record<ModelId, string>
  alertsTitle: string
  /** {days}, {windows} */
  alertsNote: string
  colTp: string
  colFp: string
  colFn: string
  colPrecision: string
  colRecall: string
  colF1: string
  colMissRate: string
  robustnessTitle: string
  robustnessNote: string
  colCheck: string
  colWindows: string
  colRidge: string
  colTrees: string
  schemes: { cv: string; heating: string; dry: string; forward: string; toChisinau: string; toBucharest: string }
  findingsTitle: string
  /** placeholders are filled from the benchmark data */
  findings: [string, string, string, string]
  economicsTitle: string
  economicsIntro: string
  infraTitle: string
  usersLabel: string
  sessionsLabel: string
  callsWithout: string
  callsWith: string
  callsAvoided: string
  freeTier: string
  fits: string
  exceeds: string
  maxUsersTitle: string
  maxUsersWithout: string
  maxUsersWith: string
  costNow: string
  infraNote: string
  commercialTitle: string
  sitesLabel: string
  commercialNote: string
  commercialOurs: string
  healthTitle: string
  /** {users} */
  healthIntro: string
  scenarioLow: string
  scenarioBase: string
  scenarioHigh: string
  colScenario: string
  colEpisodes: string
  colSaved: string
  colAudience: string
  healthReading: string
  healthNote: string
  limitsTitle: string
  limits: [string, string, string, string]
  repoNote: string
}

export const researchTexts: Record<Lang, ResearchTexts> = {
  en: {
    title: 'Research: can local calibration beat the raw grid?',
    subtitle:
      "A pre-registered test on {windows} city-days from {cities}: can a small model, using only inputs known at forecast time, correct OpenWeatherMap's coarse global PM2.5 grid toward what local sensors measure?",
    hypothesesTitle: 'Hypotheses and verdicts',
    ruleNote: 'Thresholds and the decision rule were written down before any model was run: supported = estimate at or above the target and a 95% interval that excludes 0.',
    h1Title: 'H1 · Accuracy',
    h1Text: 'Gradient-boosted trees reduce hourly PM2.5 error (RMSE) by at least 22% versus the raw grid.',
    h2Title: 'H2 · Health alerts',
    h2Text: 'The same model reduces missed unhealthy-air alerts (days at or above 15 µg/m³) by at least 18%.',
    target: 'Target',
    observed: 'Observed',
    interval: '95% interval',
    verdict: { supported: 'Supported', partial: 'Partially supported', notSupported: 'Not supported' },
    alertDaysNote: 'Only {days} of the {windows} days were unhealthy, so the interval for H2 is wide. The estimate points the right way, but it is not enough evidence.',
    benchmarkTitle: 'Benchmark: four methods, same data',
    benchmarkNote:
      'Hourly PM2.5 error against the median of local Sensor.Community sensors. Blocked 6-fold cross-validation per city: each of the {windows} 24-hour windows ({hours} hours) is tested exactly once.',
    colMethod: 'Method',
    colRmse: 'RMSE (µg/m³)',
    colVsRaw: 'vs. raw',
    colMae: 'MAE',
    colBias: 'Bias',
    colCorr: 'Corr. (r)',
    colSpeed: 'µs / prediction',
    modelName: { raw: 'Raw OpenWeatherMap', scaled: 'Scale + offset', ridge: 'Ridge regression', gbt: 'Gradient-boosted trees' },
    modelDesc: {
      raw: "The baseline: the grid's PM2.5, unchanged.",
      scaled: "One multiplier and one offset on the grid's PM2.5. Shows how much a trivial fix already gives.",
      ridge: 'A linear model on 20 forecast-time features (pollutants, weather, hour of day).',
      gbt: '250 small decision trees on the same features, written from scratch.',
    },
    alertsTitle: 'Unhealthy-air alerts (daily mean at or above 15 µg/m³)',
    alertsNote: 'The WHO 2021 24-hour guideline. {days} of {windows} city-days were above it. "Missed" means an unhealthy day that was not flagged.',
    colTp: 'Caught',
    colFp: 'False alarms',
    colFn: 'Missed',
    colPrecision: 'Precision',
    colRecall: 'Recall',
    colF1: 'F1',
    colMissRate: 'Missed rate',
    robustnessTitle: 'Does it hold up?',
    robustnessNote: 'Checks listed in advance. Change in hourly RMSE versus the raw grid; a minus sign means the error went down.',
    colCheck: 'Check',
    colWindows: 'Windows',
    colRidge: 'Ridge',
    colTrees: 'Trees (95% interval)',
    schemes: {
      cv: 'All windows (main result)',
      heating: 'Heating season, Jan–Mar',
      dry: 'Dry hours only (humidity below 75%)',
      forward: 'Train on Jan–Jun, test on Jul–Oct',
      toChisinau: 'Trained on București, tested on Chișinău',
      toBucharest: 'Trained on Chișinău, tested on București',
    },
    findingsTitle: 'What the data say',
    findings: [
      'Local calibration works: error falls by about {gbt} with trees and {ridge} with ridge regression, and the gain holds in the heating season ({heating}) and on dry hours only ({dry}).',
      'The accuracy target (22%) was missed by {gap} percentage points, and the alert result is inconclusive with only {days} unhealthy days. The verdicts are "{v1}" and "{v2}", reported exactly as the rule dictates, not adjusted afterwards.',
      'Trees did not beat a plain linear model: the pooled gain is the same, ridge held up better on months it had not seen ({ridgeForward} vs {gbtForward}), and it is about {speedup} times cheaper to run.',
      'The size of the gain depends on the city: {city1} {c1}, {city2} {c2}. Calibration should be fitted per place.',
    ],
    economicsTitle: 'Economics: what does it cost, and what is it worth?',
    economicsIntro:
      'Two separate questions. Running cost is computed from the real code (cache lifetimes, calls per request). Health savings are an order-of-magnitude estimate from published studies, with one assumption stated openly.',
    infraTitle: 'Running cost for an audience',
    usersLabel: 'Users per month',
    sessionsLabel: 'Visits per user per month',
    callsWithout: 'Upstream calls without a cache',
    callsWith: 'With the CDN cache',
    callsAvoided: 'avoided',
    freeTier: 'OpenWeatherMap free tier: 1,000,000 calls per month',
    fits: 'Fits',
    exceeds: 'Exceeds',
    maxUsersTitle: 'Largest audience inside the free tier',
    maxUsersWithout: 'without cache',
    maxUsersWith: 'with cache',
    costNow: 'Hardware: €0 · Hosting and API: €0 per month while inside the free tiers',
    infraNote:
      'Assumes visits spread evenly over the month, each with one globe load, one city search and, half the time, the day planner; 500 different cities searched, a few far more often than the rest. Real traffic arrives in bursts, which makes the cache work better than this.',
    commercialTitle: 'Versus dedicated display units',
    sitesLabel: 'Sites to cover (for example schools)',
    commercialNote:
      'List prices of monitors with a screen. They measure one spot directly, which ClimaWatch does not; the comparison is the cost of putting an air-quality advisory in front of people.',
    commercialOurs: 'ClimaWatch',
    healthTitle: 'Health savings: a bounded estimate',
    healthIntro: 'If sensitive users (asthma, young children) move outdoor time to the cleanest hours of the day, how many emergency asthma episodes could that avoid? Per {users} users, per year:',
    scenarioLow: 'Low',
    scenarioBase: 'Base',
    scenarioHigh: 'High',
    colScenario: 'Scenario',
    colEpisodes: 'Avoided episodes',
    colSaved: 'Saved (€)',
    colAudience: 'Users per avoided episode',
    healthReading:
      'Honest reading: at this scale the modelled savings are small and very uncertain. The case for ClimaWatch rests on near-zero cost per user, not on large healthcare savings; one avoided emergency visit (about €215–€1,040) is worth roughly one commercial display (€319).',
    healthNote:
      'Inputs: relative risk 1.028 / 1.036 / 1.048 per +10 µg/m³ (Lim et al. 2016; Fan et al. 2016); 14 / 18 / 35% less outdoor activity on alert days (Saberian et al. 2017; Ward & Beatty); gain from the cleanest 2 hours measured in our data (2.5 / 3.2 / 9.2 µg/m³); €215 / €356 / €1,042 per episode (Bavbek et al. 2011; Pugliese et al. 2020). The baseline rate of emergency episodes (0.05 / 0.10 / 0.25 per sensitive user per year) is an assumption, to be replaced with national statistics.',
    limitsTitle: 'Limits of this study',
    limits: [
      'Ground truth is a network of low-cost sensors (mostly SDS011), not regulatory stations, and they read high in humid air. A dry-hours check is included, but reference-grade data would be better.',
      'OpenWeatherMap does not archive past forecasts, so its value for the target hour stands in for the forecast, and ERA5 for the weather forecast. Real forecasts carry extra error: this tests the calibration step, not forecast skill.',
      'Two cities and ten months (January–October 2026), with 16 days missing from OpenWeatherMap\'s own history.',
      'Few unhealthy days in the data, so every alert result is uncertain.',
    ],
    repoNote: 'Code, data, the pre-registration and the lab logbook are in the repository: research/ and docs/moldsef/.',
  },

  ro: {
    title: 'Cercetare: poate calibrarea locală să bată grila brută?',
    subtitle:
      'Un test preînregistrat pe {windows} zile-oraș din {cities}: poate un model mic, folosind doar date cunoscute la momentul prognozei, să corecteze grila globală grosieră PM2.5 a OpenWeatherMap spre ce măsoară senzorii locali?',
    hypothesesTitle: 'Ipoteze și verdicte',
    ruleNote: 'Pragurile și regula de decizie au fost scrise înainte de rularea oricărui model: susținută = estimare cel puțin egală cu ținta și interval de 95% care exclude 0.',
    h1Title: 'H1 · Acuratețe',
    h1Text: 'Arborii de decizie cu gradient boosting reduc eroarea orară PM2.5 (RMSE) cu cel puțin 22% față de grila brută.',
    h2Title: 'H2 · Alerte de sănătate',
    h2Text: 'Același model reduce alertele ratate de aer nesănătos (zile cu cel puțin 15 µg/m³) cu cel puțin 18%.',
    target: 'Țintă',
    observed: 'Observat',
    interval: 'Interval 95%',
    verdict: { supported: 'Susținută', partial: 'Parțial susținută', notSupported: 'Nesusținută' },
    alertDaysNote: 'Doar {days} din cele {windows} zile au fost nesănătoase, deci intervalul pentru H2 este larg. Estimarea merge în direcția bună, dar nu e destulă dovadă.',
    benchmarkTitle: 'Benchmark: patru metode, aceleași date',
    benchmarkNote:
      'Eroarea orară PM2.5 față de mediana senzorilor locali Sensor.Community. Validare încrucișată pe blocuri, 6 pliuri per oraș: fiecare dintre cele {windows} ferestre de 24 h ({hours} ore) e testată exact o dată.',
    colMethod: 'Metoda',
    colRmse: 'RMSE (µg/m³)',
    colVsRaw: 'față de brut',
    colMae: 'MAE',
    colBias: 'Bias',
    colCorr: 'Corel. (r)',
    colSpeed: 'µs / predicție',
    modelName: { raw: 'OpenWeatherMap brut', scaled: 'Scală + decalaj', ridge: 'Regresie Ridge', gbt: 'Arbori cu gradient boosting' },
    modelDesc: {
      raw: 'Referința: PM2.5 din grilă, nemodificat.',
      scaled: 'Un multiplicator și un decalaj aplicate PM2.5 din grilă. Arată cât aduce deja o corecție banală.',
      ridge: 'Un model liniar pe 20 de variabile cunoscute la momentul prognozei (poluanți, meteo, ora zilei).',
      gbt: '250 de arbori de decizie mici pe aceleași variabile, scriși de la zero.',
    },
    alertsTitle: 'Alerte de aer nesănătos (media zilei de cel puțin 15 µg/m³)',
    alertsNote: 'Valoarea-ghid OMS 2021 pe 24 h. {days} din {windows} zile-oraș au depășit-o. „Ratat” înseamnă o zi nesănătoasă care nu a fost semnalată.',
    colTp: 'Prinse',
    colFp: 'Alarme false',
    colFn: 'Ratate',
    colPrecision: 'Precizie',
    colRecall: 'Recall',
    colF1: 'F1',
    colMissRate: 'Rată ratare',
    robustnessTitle: 'Rezistă la verificări?',
    robustnessNote: 'Verificări stabilite dinainte. Schimbarea RMSE orar față de grila brută; semnul minus înseamnă că eroarea a scăzut.',
    colCheck: 'Verificare',
    colWindows: 'Ferestre',
    colRidge: 'Ridge',
    colTrees: 'Arbori (interval 95%)',
    schemes: {
      cv: 'Toate ferestrele (rezultatul principal)',
      heating: 'Sezonul de încălzire, ian–mar',
      dry: 'Doar orele uscate (umiditate sub 75%)',
      forward: 'Antrenare ian–iun, test iul–oct',
      toChisinau: 'Antrenat pe București, testat pe Chișinău',
      toBucharest: 'Antrenat pe Chișinău, testat pe București',
    },
    findingsTitle: 'Ce spun datele',
    findings: [
      'Calibrarea locală funcționează: eroarea scade cu aproximativ {gbt} cu arbori și {ridge} cu Ridge, iar câștigul se păstrează în sezonul de încălzire ({heating}) și doar pe orele uscate ({dry}).',
      'Ținta de acuratețe (22%) a fost ratată cu {gap} puncte procentuale, iar rezultatul pe alerte este neconcludent, cu doar {days} zile nesănătoase. Verdictele sunt „{v1}” și „{v2}”, raportate exact cum cere regula, fără ajustări ulterioare.',
      'Arborii nu au bătut un model liniar simplu: câștigul total e același, Ridge s-a comportat mai bine pe luni nevăzute ({ridgeForward} față de {gbtForward}) și e de aproximativ {speedup} ori mai ieftin de rulat.',
      'Mărimea câștigului depinde de oraș: {city1} {c1}, {city2} {c2}. Calibrarea trebuie făcută separat pentru fiecare loc.',
    ],
    economicsTitle: 'Economie: cât costă și cât valorează?',
    economicsIntro:
      'Două întrebări separate. Costul de rulare e calculat din codul real (durate de cache, apeluri per cerere). Economiile de sănătate sunt o estimare de ordin de mărime din studii publicate, cu o ipoteză declarată deschis.',
    infraTitle: 'Costul de rulare pentru un public',
    usersLabel: 'Utilizatori pe lună',
    sessionsLabel: 'Vizite per utilizator pe lună',
    callsWithout: 'Apeluri către sursă fără cache',
    callsWith: 'Cu cache-ul CDN',
    callsAvoided: 'evitate',
    freeTier: 'Planul gratuit OpenWeatherMap: 1.000.000 de apeluri pe lună',
    fits: 'Încape',
    exceeds: 'Depășește',
    maxUsersTitle: 'Cel mai mare public în planul gratuit',
    maxUsersWithout: 'fără cache',
    maxUsersWith: 'cu cache',
    costNow: 'Hardware: 0 € · Găzduire și API: 0 € pe lună cât timp rămâne în planurile gratuite',
    infraNote:
      'Presupune vizite distribuite uniform în lună, fiecare cu o încărcare a globului, o căutare de oraș și, jumătate din timp, planificatorul zilei; 500 de orașe diferite căutate, câteva mult mai des decât restul. Traficul real vine în valuri, ceea ce face cache-ul să funcționeze mai bine decât în acest calcul.',
    commercialTitle: 'Față de unitățile dedicate cu afișaj',
    sitesLabel: 'Locuri de acoperit (de exemplu școli)',
    commercialNote:
      'Prețuri de listă pentru monitoare cu ecran. Ele măsoară direct un punct, ceea ce ClimaWatch nu face; comparația e costul de a pune o recomandare despre aer în fața oamenilor.',
    commercialOurs: 'ClimaWatch',
    healthTitle: 'Economii de sănătate: o estimare mărginită',
    healthIntro: 'Dacă utilizatorii sensibili (astm, copii mici) mută timpul petrecut afară în orele cele mai curate ale zilei, câte episoade de urgență de astm s-ar putea evita? La {users} utilizatori, pe an:',
    scenarioLow: 'Scăzut',
    scenarioBase: 'De bază',
    scenarioHigh: 'Ridicat',
    colScenario: 'Scenariu',
    colEpisodes: 'Episoade evitate',
    colSaved: 'Economisit (€)',
    colAudience: 'Utilizatori per episod evitat',
    healthReading:
      'Citire onestă: la această scară economiile modelate sunt mici și foarte nesigure. Argumentul pentru ClimaWatch ține de costul aproape zero per utilizator, nu de economii mari în sănătate; o vizită de urgență evitată (circa 215–1.040 €) valorează cam cât un afișaj comercial (319 €).',
    healthNote:
      'Date de intrare: risc relativ 1,028 / 1,036 / 1,048 la +10 µg/m³ (Lim et al. 2016; Fan et al. 2016); 14 / 18 / 35% mai puțină activitate afară în zilele cu alerte (Saberian et al. 2017; Ward & Beatty); câștigul celor mai curate 2 ore măsurat în datele noastre (2,5 / 3,2 / 9,2 µg/m³); 215 / 356 / 1.042 € per episod (Bavbek et al. 2011; Pugliese et al. 2020). Rata de bază a episoadelor de urgență (0,05 / 0,10 / 0,25 per utilizator sensibil pe an) este o ipoteză, de înlocuit cu statistici naționale.',
    limitsTitle: 'Limitele acestui studiu',
    limits: [
      'Adevărul de teren e o rețea de senzori ieftini (mai ales SDS011), nu stații de reglementare, iar aceștia citesc prea mult în aer umed. Există o verificare doar pe ore uscate, dar date de referință ar fi mai bune.',
      'OpenWeatherMap nu arhivează prognozele trecute, așa că valoarea lui pentru ora țintă ține loc de prognoză, iar ERA5 de prognoză meteo. Prognozele reale au eroare în plus: aceasta testează pasul de calibrare, nu priceperea de prognoză.',
      'Două orașe și zece luni (ianuarie–octombrie 2026), cu 16 zile lipsă din istoricul OpenWeatherMap însuși.',
      'Puține zile nesănătoase în date, deci orice rezultat pe alerte e nesigur.',
    ],
    repoNote: 'Codul, datele, preînregistrarea și caietul de laborator sunt în repository: research/ și docs/moldsef/.',
  },

  ru: {
    title: 'Исследование: может ли локальная калибровка превзойти сырую сетку?',
    subtitle:
      'Предварительно зарегистрированный тест на {windows} городо-днях из {cities}: может ли небольшая модель, использующая только данные, известные на момент прогноза, скорректировать грубую глобальную сетку PM2.5 OpenWeatherMap в сторону того, что измеряют местные датчики?',
    hypothesesTitle: 'Гипотезы и вердикты',
    ruleNote: 'Пороги и правило решения записаны до запуска любой модели: подтверждена = оценка не ниже цели и 95% интервал, не включающий 0.',
    h1Title: 'H1 · Точность',
    h1Text: 'Градиентный бустинг деревьев снижает часовую ошибку PM2.5 (RMSE) не менее чем на 22% по сравнению с сырой сеткой.',
    h2Title: 'H2 · Предупреждения о здоровье',
    h2Text: 'Та же модель снижает пропущенные предупреждения о вредном воздухе (дни от 15 мкг/м³) не менее чем на 18%.',
    target: 'Цель',
    observed: 'Получено',
    interval: '95% интервал',
    verdict: { supported: 'Подтверждена', partial: 'Подтверждена частично', notSupported: 'Не подтверждена' },
    alertDaysNote: 'Лишь {days} из {windows} дней были вредными, поэтому интервал для H2 широкий. Оценка указывает в нужную сторону, но доказательств недостаточно.',
    benchmarkTitle: 'Бенчмарк: четыре метода, одни и те же данные',
    benchmarkNote:
      'Часовая ошибка PM2.5 относительно медианы местных датчиков Sensor.Community. Блочная кросс-валидация на 6 частей по каждому городу: каждое из {windows} 24-часовых окон ({hours} часов) проверяется ровно один раз.',
    colMethod: 'Метод',
    colRmse: 'RMSE (мкг/м³)',
    colVsRaw: 'к сырым',
    colMae: 'MAE',
    colBias: 'Смещение',
    colCorr: 'Корр. (r)',
    colSpeed: 'мкс / прогноз',
    modelName: { raw: 'Сырой OpenWeatherMap', scaled: 'Масштаб + сдвиг', ridge: 'Гребневая регрессия', gbt: 'Градиентный бустинг деревьев' },
    modelDesc: {
      raw: 'Базовый уровень: PM2.5 из сетки без изменений.',
      scaled: 'Один множитель и один сдвиг для PM2.5 из сетки. Показывает, сколько даёт даже тривиальная поправка.',
      ridge: 'Линейная модель на 20 признаках, известных на момент прогноза (загрязнители, погода, час суток).',
      gbt: '250 небольших деревьев решений на тех же признаках, написанных с нуля.',
    },
    alertsTitle: 'Предупреждения о вредном воздухе (среднесуточное значение от 15 мкг/м³)',
    alertsNote: 'Суточная рекомендация ВОЗ 2021 года. {days} из {windows} городо-дней её превысили. «Пропущено» значит вредный день, о котором не предупредили.',
    colTp: 'Поймано',
    colFp: 'Ложные тревоги',
    colFn: 'Пропущено',
    colPrecision: 'Точность',
    colRecall: 'Полнота',
    colF1: 'F1',
    colMissRate: 'Доля пропусков',
    robustnessTitle: 'Выдерживает ли проверки?',
    robustnessNote: 'Проверки, заданные заранее. Изменение часового RMSE относительно сырой сетки; знак минус означает, что ошибка снизилась.',
    colCheck: 'Проверка',
    colWindows: 'Окон',
    colRidge: 'Ridge',
    colTrees: 'Деревья (95% интервал)',
    schemes: {
      cv: 'Все окна (основной результат)',
      heating: 'Отопительный сезон, янв–март',
      dry: 'Только сухие часы (влажность ниже 75%)',
      forward: 'Обучение янв–июнь, тест июль–окт',
      toChisinau: 'Обучено на Бухаресте, проверено на Кишинёве',
      toBucharest: 'Обучено на Кишинёве, проверено на Бухаресте',
    },
    findingsTitle: 'Что говорят данные',
    findings: [
      'Локальная калибровка работает: ошибка падает примерно на {gbt} с деревьями и на {ridge} с гребневой регрессией, а выигрыш сохраняется в отопительный сезон ({heating}) и только на сухих часах ({dry}).',
      'Цель по точности (22%) не достигнута на {gap} процентного пункта, а результат по предупреждениям неубедителен: всего {days} вредных дней. Вердикты: «{v1}» и «{v2}», указаны строго по правилу, без последующих поправок.',
      'Деревья не превзошли простую линейную модель: общий выигрыш одинаков, ridge лучше держалась на неизвестных месяцах ({ridgeForward} против {gbtForward}) и примерно в {speedup} раз дешевле в работе.',
      'Размер выигрыша зависит от города: {city1} {c1}, {city2} {c2}. Калибровку нужно подбирать для каждого места отдельно.',
    ],
    economicsTitle: 'Экономика: сколько это стоит и чего стоит?',
    economicsIntro:
      'Два отдельных вопроса. Стоимость работы считается по реальному коду (время жизни кэша, вызовы на запрос). Экономия на здоровье — оценка порядка величины по опубликованным исследованиям, с одним открыто заявленным допущением.',
    infraTitle: 'Стоимость работы для аудитории',
    usersLabel: 'Пользователей в месяц',
    sessionsLabel: 'Визитов на пользователя в месяц',
    callsWithout: 'Обращения к источнику без кэша',
    callsWith: 'С кэшем CDN',
    callsAvoided: 'избежано',
    freeTier: 'Бесплатный тариф OpenWeatherMap: 1 000 000 вызовов в месяц',
    fits: 'Укладывается',
    exceeds: 'Превышает',
    maxUsersTitle: 'Наибольшая аудитория в рамках бесплатного тарифа',
    maxUsersWithout: 'без кэша',
    maxUsersWith: 'с кэшем',
    costNow: 'Оборудование: 0 € · Хостинг и API: 0 € в месяц, пока в рамках бесплатных тарифов',
    infraNote:
      'Предполагает равномерные визиты в течение месяца, каждый с одной загрузкой глобуса, одним поиском города и, в половине случаев, планировщиком дня; 500 разных городов, несколько из них ищут гораздо чаще остальных. Реальный трафик приходит всплесками, поэтому кэш работает лучше, чем в этом расчёте.',
    commercialTitle: 'По сравнению с готовыми устройствами с дисплеем',
    sitesLabel: 'Мест для охвата (например, школ)',
    commercialNote:
      'Прайс-листы мониторов с экраном. Они напрямую измеряют одну точку, чего ClimaWatch не делает; сравнивается стоимость того, чтобы донести до людей рекомендацию о воздухе.',
    commercialOurs: 'ClimaWatch',
    healthTitle: 'Экономия на здоровье: ограниченная оценка',
    healthIntro: 'Если чувствительные пользователи (астма, маленькие дети) переносят время на улице на самые чистые часы суток, сколько неотложных эпизодов астмы это могло бы предотвратить? На {users} пользователей в год:',
    scenarioLow: 'Низкий',
    scenarioBase: 'Базовый',
    scenarioHigh: 'Высокий',
    colScenario: 'Сценарий',
    colEpisodes: 'Предотвращено эпизодов',
    colSaved: 'Сэкономлено (€)',
    colAudience: 'Пользователей на один эпизод',
    healthReading:
      'Честное прочтение: в таком масштабе смоделированная экономия мала и очень неопределённа. Довод в пользу ClimaWatch — почти нулевая стоимость на пользователя, а не крупная экономия в здравоохранении; один предотвращённый вызов скорой (около 215–1 040 €) стоит примерно как один коммерческий дисплей (319 €).',
    healthNote:
      'Входные данные: относительный риск 1,028 / 1,036 / 1,048 на +10 мкг/м³ (Lim et al. 2016; Fan et al. 2016); на 14 / 18 / 35% меньше активности на улице в дни с предупреждениями (Saberian et al. 2017; Ward & Beatty); выигрыш от самых чистых 2 часов измерен в наших данных (2,5 / 3,2 / 9,2 мкг/м³); 215 / 356 / 1 042 € за эпизод (Bavbek et al. 2011; Pugliese et al. 2020). Базовая частота неотложных эпизодов (0,05 / 0,10 / 0,25 на чувствительного пользователя в год) — допущение, которое нужно заменить национальной статистикой.',
    limitsTitle: 'Ограничения исследования',
    limits: [
      'Эталон — сеть недорогих датчиков (в основном SDS011), а не регуляторные станции, и во влажном воздухе они завышают показания. Есть проверка только по сухим часам, но данные эталонного класса были бы лучше.',
      'OpenWeatherMap не архивирует прошлые прогнозы, поэтому его значение для целевого часа заменяет прогноз, а ERA5 — прогноз погоды. У реальных прогнозов есть дополнительная ошибка: это проверка шага калибровки, а не мастерства прогнозирования.',
      'Два города и десять месяцев (январь–октябрь 2026), 16 дней отсутствуют в самой истории OpenWeatherMap.',
      'В данных мало вредных дней, поэтому любой результат по предупреждениям неопределён.',
    ],
    repoNote: 'Код, данные, предварительная регистрация и лабораторный журнал находятся в репозитории: research/ и docs/moldsef/.',
  },
}
