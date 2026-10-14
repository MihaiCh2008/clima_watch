export type Lang = 'ro' | 'en' | 'ru'

export interface AqiEntry {
  text: string
  advice: string
}

export interface Translation {
  nav: {
    tagline: string
    problem: string
    solution: string
    live: string
    compare: string
    profile: string
  }
  home: {
    subtitle: string
    searchPlaceholder: string
    searchButton: string
    searching: string
    errorNotFound: string
    errorGeneric: string
    recommendationTitle: string
    historyTitle: string
    historyNote: string
    historyLoading: string
    historyError: string
    sideNote1: string
    sideNote1Source: string
    sideNote2: string
    globalContextTitle: string
    co2Label: string
    co2Source: string
    tempLabel: string
    tempSource: string
    parisLabel: string
    localSignalTitle: string
  }
  globe: {
    title: string
    subtitle: string
    loading: string
    error: string
    hint: string
    idle: string
    ariaLabel: string
  }
  mood: {
    reacts: string
  }
  impact: {
    title: string
    subtitle: string
    car: string
    carUnit: string
    transit: string
    transitUnit: string
    meat: string
    meatUnit: string
    flights: string
    flightsUnit: string
    total: string
    unit: string
    less: string
    more: string
    same: string
    trees: string
    treeUnit: string
    treesZero: string
    ecoPlan: string
    reset: string
    howTitle: string
    howCar: string
    howTransit: string
    howMeat: string
    howFlights: string
    howTrees: string
    baselineNote: string
  }
  planner: {
    title: string
    subtitle: string
    cityLabel: string
    placeholder: string
    button: string
    planning: string
    notFound: string
    error: string
    forCity: string
    best: string
    avoid: string
    allGood: string
    pm: string
    sensitiveNote: string
    exerciseNote: string
    now: string
    deviceTime: string
    hint: string
  }
  compare: {
    subtitle: string
    labelA: string
    labelB: string
    placeholderA: string
    placeholderB: string
    button: string
    running: string
    examplesTitle: string
    lowerIsBetter: string
    pollutantsTitle: string
    winner: string
    winnerDetail: string
    tie: string
    sameCity: string
    missing: string
    notFound: string
  }
  problem: {
    intro: string
    stat1Label: string
    stat1Source: string
    stat2Label: string
    stat2Source: string
    stat3Label: string
    stat3Source: string
    whyTitle: string
    bullet1: string
    bullet2: string
    bullet3: string
    bullet4: string
    historyChartTitle: string
    owidTitle: string
    owidSource: string
    videoTitle: string
    videoCredit: string
    sourcesFooter: string
    sideNote1: string
    sideNote1Source: string
    sideNote2: string
    sideNote2Source: string
    sideNote3: string
    sideNote3Source: string
  }
  solution: {
    subtitle: string
    feature1Title: string
    feature1Desc: string
    feature2Title: string
    feature2Desc: string
    feature3Title: string
    feature3Desc: string
    impactTitle: string
    impactText: string
    preventionTitle: string
    preventionTips: [string, string, string, string, string, string]
    preventionNote: string
    funFactTitle: string
    funFactDesc: string
    sideNote1: string
    sideNote2: string
    sideNote2Source: string
    orgCtaLabel: string
    org1Name: string
    org1Desc: string
    org2Name: string
    org2Desc: string
  }
  profile: {
    subtitle: string
    toggle1Label: string
    toggle1Desc: string
    toggle2Label: string
    toggle2Desc: string
    toggle3Label: string
    toggle3Desc: string
    toggle4Label: string
    toggle4Desc: string
    carbonTipTitle: string
    carbonTipText: string
    footerNote: string
    sideNote1: string
    sideNote1Source: string
  }
  aqi: Record<1 | 2 | 3 | 4 | 5, AqiEntry>
  rec: {
    okExercise: string
    okDefault: string
    warningSensitive: string
    warningExercise: string
    warningDefault: string
    dangerSensitive: string
    dangerExercise: string
    dangerDefault: string
  }
}

export const translations: Record<Lang, Translation> = {
  ro: {
    nav: {
      tagline: 'Monitorizare climatică',
      problem: 'Problema',
      solution: 'Soluția',
      live: 'Verifică live',
      compare: 'Compară',
      profile: 'Profilul meu',
    },
    home: {
      subtitle: 'Poluarea locală e un semnal concret al acelorași cauze care alimentează criza climatică — verifică aerul din orașul tău',
      searchPlaceholder: 'Scrie un oraș (ex: Chisinau, Bucuresti)',
      searchButton: 'Caută',
      searching: 'Caut',
      errorNotFound: 'Oraș negăsit. Verifică denumirea și încearcă din nou.',
      errorGeneric: 'A apărut o eroare. Încearcă din nou.',
      recommendationTitle: 'Ce ar trebui să faci azi',
      historyTitle: 'Evoluție ultimele 7 zile',
      historyNote: 'Media zilnică de PM2.5 (μg/m³) — date reale din istoricul OpenWeatherMap.',
      historyLoading: 'Încarc istoricul real…',
      historyError: 'Nu am putut încărca istoricul acum.',
      sideNote1: 'Arderea combustibililor fosili e principala sursă atât pentru poluarea aerului, cât și pentru încălzirea globală.',
      sideNote1Source: 'NASA / IPCC',
      sideNote2: 'Calitatea aerului se poate schimba semnificativ de la o oră la alta — verific-o des.',
      globalContextTitle: 'Contextul climatic global, azi',
      co2Label: 'CO2 în atmosferă',
      co2Source: 'NASA, mai 2025',
      tempLabel: 'peste nivelul preindustrial (2024)',
      tempSource: 'NASA / Carbon Brief',
      parisLabel: 'ani de la Acordul de la Paris',
      localSignalTitle: 'Semnalul local: aerul din orașul tău',
    },
    globe: {
      title: 'Calitatea aerului în lume',
      subtitle: 'Citiri live pentru orașe mari — rotește globul și apasă pe un punct.',
      loading: 'Încarc citirile live…',
      error: 'Nu am putut încărca citirile orașelor.',
      hint: 'Trage ca să rotești · apasă pe un punct ca să verifici orașul',
      idle: 'Treci cu mouse-ul peste un punct ca să vezi aerul live',
      ariaLabel: 'Glob interactiv cu calitatea aerului în orașele lumii',
    },
    mood: {
      reacts: 'Fundalul respiră odată cu aerul din {city}',
    },
    impact: {
      title: 'Laboratorul tău de impact',
      subtitle: 'Mută cursoarele și vezi cum alegerile de zi cu zi îți schimbă CO2 pe an — și câți copaci ar fi nevoie ca să-l absoarbă.',
      car: 'Cu mașina',
      carUnit: 'km / săptămână',
      transit: 'Cu autobuzul sau trenul',
      transitUnit: 'km / săptămână',
      meat: 'Mese cu carne',
      meatUnit: 'mese / săptămână',
      flights: 'Zboruri dus-întors',
      flightsUnit: 'pe an',
      total: 'Amprenta ta anuală din aceste patru alegeri',
      unit: 't CO2 / an',
      less: 'Cu {pct}% mai puțin decât stilul de viață obișnuit',
      more: 'Cu {pct}% mai mult decât stilul de viață obișnuit',
      same: 'La fel ca stilul de viață obișnuit',
      trees: '≈ {n} copaci care lucrează un an întreg ca să absoarbă asta',
      treeUnit: 'Fiecare copac din desen = {k} copaci',
      treesZero: 'Nu mai e nimic de compensat — bravo!',
      ecoPlan: 'Încearcă planul eco',
      reset: 'Resetează',
      howTitle: 'Cum se calculează?',
      howCar: 'Mașină: 0,17 kg CO2 pe km (autoturism mediu, factori de conversie ai guvernului britanic).',
      howTransit: 'Autobuz sau tren: 0,07 kg CO2 pe km (media dintre autobuz ≈ 0,10 și tren ≈ 0,035).',
      howMeat: 'Mese cu carne: cu 1,13 kg CO2 mai mult decât o masă vegetariană (derivat din Scarborough et al., 2014, Climatic Change).',
      howFlights: 'Zboruri: o călătorie dus-întors de 4.000 km la 0,15 kg CO2 pe pasager-km = 600 kg.',
      howTrees: 'Copaci: un copac matur absoarbe în jur de 21 kg CO2 pe an (o medie des citată).',
      baselineNote:
        'Stil de viață obișnuit = 120 km cu mașina, 40 km cu autobuzul sau trenul și 10 mese cu carne pe săptămână, plus un zbor dus-întors pe an. Sunt estimări, nu un audit complet de carbon.',
    },
    planner: {
      title: 'Ziua ta, oră cu oră',
      subtitle: 'Scrie orașul tău și planificăm următoarele 24 de ore în funcție de aerul pe care îl vei respira — adaptat profilului tău.',
      cityLabel: 'Orașul tău',
      placeholder: 'ex: Chisinau',
      button: 'Planifică-mi ziua',
      planning: 'Planific',
      notFound: 'Nu am găsit orașul. Verifică denumirea.',
      error: 'Nu am putut încărca prognoza. Încearcă din nou.',
      forCity: 'Prognoză pentru {city}',
      best: 'Cel mai bun moment ca să ieși afară',
      avoid: 'Orele de evitat',
      allGood: 'Aerul rămâne bun toată ziua — nu sunt ore de evitat.',
      pm: 'PM2.5 {value} μg/m³ în medie',
      sensitiveNote: 'Din cauza profilului tău, nivelurile sunt marcate cu o treaptă mai devreme decât pentru majoritatea oamenilor.',
      exerciseNote: 'Faci sport afară, așa că căutăm cea mai curată fereastră de 2 ore.',
      now: 'Acum',
      deviceTime: 'Orele sunt în fusul orar al dispozitivului tău.',
      hint: 'Treci cu mouse-ul sau atinge o oră pentru detalii.',
    },
    compare: {
      subtitle: 'Alege două orașe și vezi al cui aer e mai curat — live.',
      labelA: 'Orașul A',
      labelB: 'Orașul B',
      placeholderA: 'ex: Bucuresti',
      placeholderB: 'ex: Delhi',
      button: 'Pornește cursa',
      running: 'Cursa începe',
      examplesTitle: 'Încearcă o confruntare',
      lowerIsBetter: 'Mai mic e mai bine',
      pollutantsTitle: 'Poluant cu poluant',
      winner: 'În {city} se respiră mai curat',
      winnerDetail: 'Cu {pct}% mai puțin PM2.5 decât în {other}',
      tie: 'Egalitate — aerul e la fel de curat în ambele orașe.',
      sameCity: 'Alege două orașe diferite.',
      missing: 'Scrie ambele orașe.',
      notFound: 'Nu am găsit „{city}". Verifică denumirea.',
    },
    problem: {
      intro:
        'Schimbările climatice nu sunt un pericol îndepărtat, de mâine — efectele se văd deja azi, în date, în vreme extremă și în orașul tău.',
      stat1Label: 'peste nivelul preindustrial — 2024, cel mai cald an înregistrat vreodată',
      stat1Source: 'NASA / Carbon Brief, 2024',
      stat2Label: 'concentrație de CO2 în atmosferă — cel mai ridicat nivel din ultimii 3+ milioane de ani',
      stat2Source: 'NASA, mai 2025',
      stat3Label: 'creșterea nivelului mării la nivel global din 1993 încoace — ritmul aproape s-a dublat din 2012',
      stat3Source: 'NASA / NOAA, 2025',
      whyTitle: 'De ce e greu de oprit',
      bullet1:
        'Efectele se acumulează lent, pe zeci de ani — o vară mai caldă sau CO2-ul invizibil din aer nu par urgente, deși consecințele pe termen lung sunt ireversibile.',
      bullet2:
        'E o problemă globală, colectivă — o singură persoană sau țară nu poate „rezolva" schimbările climatice, ceea ce descurajează acțiunea individuală.',
      bullet3:
        'Impactul e inegal — comunitățile și țările care au contribuit cel mai puțin la emisii (zone sărace, insule, zone de coastă) suferă cel mai mult, prin secete, inundații și valuri de căldură.',
      bullet4:
        'Datele sunt complexe — grafice, modele climatice și procente în °C nu spun omului obișnuit ce înseamnă practic pentru viața lui de zi cu zi.',
      historyChartTitle: 'Evoluție istorică, pe țară — emisii de CO2',
      owidTitle: 'Emisii anuale de CO2, pe țară',
      owidSource: 'Sursă: Our World in Data — grafic interactiv live, poți alege orice țară din listă',
      videoTitle: 'Video recomandat',
      videoCredit: 'Katharine Hayhoe — TED Talk',
      sourcesFooter:
        'Sursele statisticilor: NASA (climate.nasa.gov), Carbon Brief, NOAA (noaa.gov), IPCC (ipcc.ch) și Our World in Data (ourworldindata.org).',
      sideNote1: 'Transportul rutier și industria generează atât particule poluante, cât și cea mai mare parte din emisiile urbane de CO2.',
      sideNote1Source: 'EPA / IPCC',
      sideNote2: 'Ultimii 10 ani au fost cei mai călduroși din istoria măsurătorilor moderne.',
      sideNote2Source: 'NASA GISS',
      sideNote3: 'Energia din surse regenerabile a devenit mai ieftină decât cărbunele în majoritatea țărilor lumii.',
      sideNote3Source: 'IRENA / Our World in Data',
    },
    solution: {
      subtitle: 'ClimaWatch te ajută să înțelegi legătura dintre aerul de azi și clima de mâine — și ce poți face chiar tu.',
      feature1Title: 'Profil personalizat',
      feature1Desc:
        'Spui o singură dată dacă ai astm, ai un copil mic sau faci sport afară — aplicația se adaptează automat, ca să te protejeze de efectele locale ale poluării legate de aceleași surse care alimentează încălzirea globală.',
      feature2Title: 'Recomandare de acțiune, nu doar un status',
      feature2Desc:
        'În loc de „Aer moderat", primești un sfat concret: „evită alergatul azi", „stați în interior dacă aveți un copil mic", „cea mai bună oră e dimineața devreme".',
      feature3Title: 'Alertă proactivă',
      feature3Desc:
        'Dacă aerul devine nesănătos pentru profilul tău, primești o notificare de browser — nu trebuie să deschizi tu aplicația ca să afli.',
      impactTitle: 'Impact',
      impactText:
        'Scopul nu e doar informarea despre aerul de azi, ci înțelegerea că fiecare alegere — cum te deplasezi, ce energie folosești — are impact atât asupra sănătății tale imediate, cât și asupra climei pe termen lung.',
      preventionTitle: 'Ce poți face chiar tu, azi',
      preventionTips: [
        'Mergi pe jos, cu bicicleta sau cu transportul public pentru trasee scurte — reduci atât emisiile de CO2, cât și poluarea locală.',
        'Nu lăsa motorul pornit în gol — mașinile moderne nu au nevoie să se „încălzească" iarna, iar fiecare minut de mers în gol arde combustibil degeaba.',
        'Susține plantarea de copaci — pădurile absorb CO2 din atmosferă și reduc poluarea la nivel de cartier.',
        'Alege energie regenerabilă sau unelte electrice/pe baterie în loc de cele pe combustibil fosil, acolo unde poți.',
        'Fă carpool sau ia în calcul o mașină electrică/hibridă la următoarea achiziție — transportul e una dintre cele mai mari surse de emisii.',
        'Compostează resturile organice, în loc să le arunci la gunoi — deșeurile organice îngropate produc metan, un gaz cu efect de seră mult mai puternic decât CO2.',
      ],
      preventionNote: 'Recomandări adaptate după NASA, EPA (epa.gov) și Project Drawdown.',
      funFactTitle: 'Fun fact — vezi legătura chiar acum',
      funFactDesc:
        'Deschide verificarea live a calității aerului pentru orice oraș din lume — un semnal concret, local, al acelorași cauze care alimentează criza climatică globală. Apasă aici →',
      sideNote1: 'Chiar și 1-2 zile pe săptămână cu bicicleta în loc de mașină reduc vizibil emisiile personale de CO2.',
      sideNote2: 'Mașinile electrice nu au emisii la eșapament — zero poluare locală și mult mai puțin CO2 pe parcursul vieții lor.',
      sideNote2Source: 'EPA — epa.gov',
      orgCtaLabel: 'Vizitează site-ul →',
      org1Name: 'UNFCCC — ONU Climă',
      org1Desc: 'Organismul ONU care coordonează negocierile climatice globale, inclusiv Acordul de la Paris.',
      org2Name: 'Climate & Clean Air Coalition',
      org2Desc: 'Coaliție de peste 200 de guverne și organizații, sub egida ONU, care luptă pentru un aer și un climat mai curate.',
    },
    profile: {
      subtitle: 'Spune-ne despre tine, ca sfaturile despre aer și climă să fie relevante pentru tine',
      toggle1Label: 'Am astm sau alte probleme respiratorii',
      toggle1Desc: 'Vom fi mai stricți cu pragurile de alertă pentru tine.',
      toggle2Label: 'Am un copil mic în grijă',
      toggle2Desc: 'Copiii sunt mai vulnerabili la poluare decât adulții.',
      toggle3Label: 'Fac sport/alerg des afară',
      toggle3Desc: 'Îți vom recomanda cele mai bune momente ale zilei pentru asta.',
      toggle4Label: 'Vreau sfaturi pentru reducerea amprentei mele de carbon',
      toggle4Desc: 'Primești un sfat climatic suplimentar, dincolo de aerul local.',
      carbonTipTitle: 'Sfatul tău climatic',
      carbonTipText:
        'Alimentele de origine animală, mai ales carnea roșie, au în medie o amprentă de CO2 de câteva ori mai mare decât cele vegetale — chiar și 1-2 mese vegetariene pe săptămână fac o diferență măsurabilă.',
      footerNote:
        'Profilul se salvează automat pe acest dispozitiv. Când aerul devine nesănătos pentru tine, îți trimitem și o notificare — dacă ai permis notificările în browser.',
      sideNote1: 'Copiii inhalează mai mult aer raportat la greutatea corpului decât adulții — de-asta sunt mai vulnerabili.',
      sideNote1Source: 'EPA — epa.gov',
    },
    aqi: {
      1: { text: 'Bun', advice: 'Aer curat, poți face orice activitate afară.' },
      2: { text: 'Acceptabil', advice: 'Aer ok, fără riscuri pentru majoritatea oamenilor.' },
      3: { text: 'Moderat', advice: 'Persoanele sensibile ar trebui să reducă efortul intens afară.' },
      4: { text: 'Nesănătos', advice: 'Evită efortul fizic prelungit în aer liber.' },
      5: { text: 'Periculos', advice: 'Evită ieșirea afară dacă e posibil.' },
    },
    rec: {
      okExercise: 'Aer bun — e o zi potrivită pentru alergat sau sport afară.',
      okDefault: 'Aer bun, nu sunt restricții pentru activitățile de azi.',
      warningSensitive:
        'Aer moderat — dacă ai astm/alergii sau ai un copil mic, limitați timpul petrecut afară în orele aglomerate (de obicei 14:00–19:00).',
      warningExercise: 'Aer moderat — poți face sport, dar preferă dimineața devreme, când poluarea e mai mică.',
      warningDefault: 'Aer moderat — activitățile normale sunt ok, dar evită efortul intens prelungit.',
      dangerSensitive:
        'Aer nesănătos — pentru cineva cu probleme respiratorii sau cu un copil mic, recomandăm să rămâneți în interior azi și să aerisiți scurt, dimineața devreme.',
      dangerExercise: 'Aer nesănătos — amână alergatul/sportul afară pentru altă zi sau mută-l în interior.',
      dangerDefault: 'Aer nesănătos — evită efortul fizic prelungit afară azi.',
    },
  },
  en: {
    nav: {
      tagline: 'Climate monitoring',
      problem: 'Problem',
      solution: 'Solution',
      live: 'Live check',
      compare: 'Compare',
      profile: 'My profile',
    },
    home: {
      subtitle: "Local pollution is a concrete signal of the same causes fueling the climate crisis — check the air in your city",
      searchPlaceholder: 'Type a city (e.g. Chisinau, Bucharest)',
      searchButton: 'Search',
      searching: 'Searching',
      errorNotFound: 'City not found. Check the spelling and try again.',
      errorGeneric: 'Something went wrong. Please try again.',
      recommendationTitle: 'What you should do today',
      historyTitle: 'Trend over the last 7 days',
      historyNote: 'Daily average PM2.5 (μg/m³) — real data from the OpenWeatherMap history.',
      historyLoading: 'Loading real history…',
      historyError: "Couldn't load the history right now.",
      sideNote1: 'Burning fossil fuels is the main source of both air pollution and global warming.',
      sideNote1Source: 'NASA / IPCC',
      sideNote2: 'Air quality can change significantly from hour to hour — check it often.',
      globalContextTitle: "Today's global climate context",
      co2Label: 'CO2 in the atmosphere',
      co2Source: 'NASA, May 2025',
      tempLabel: 'above pre-industrial levels (2024)',
      tempSource: 'NASA / Carbon Brief',
      parisLabel: 'years since the Paris Agreement',
      localSignalTitle: "The local signal: your city's air",
    },
    globe: {
      title: 'Air quality around the world',
      subtitle: 'Live readings for major cities — spin the globe and click a dot.',
      loading: 'Loading live readings…',
      error: "Couldn't load the city readings.",
      hint: 'Drag to rotate · click a dot to check that city',
      idle: 'Hover a dot to see the live air quality',
      ariaLabel: 'Interactive globe showing air quality in cities around the world',
    },
    mood: {
      reacts: 'The background breathes with the air in {city}',
    },
    impact: {
      title: 'Your impact lab',
      subtitle: 'Move the sliders to see how everyday choices change your yearly CO2 — and how many trees it would take to absorb it.',
      car: 'By car',
      carUnit: 'km / week',
      transit: 'By bus or train',
      transitUnit: 'km / week',
      meat: 'Meat-based meals',
      meatUnit: 'meals / week',
      flights: 'Return flights',
      flightsUnit: 'per year',
      total: 'Your yearly footprint from these four choices',
      unit: 't CO2 / year',
      less: '{pct}% less than the typical lifestyle',
      more: '{pct}% more than the typical lifestyle',
      same: 'The same as the typical lifestyle',
      trees: '≈ {n} trees working for a full year to absorb this',
      treeUnit: 'Each tree icon = {k} trees',
      treesZero: 'Nothing left to offset — great job!',
      ecoPlan: 'Try the eco plan',
      reset: 'Reset',
      howTitle: 'How is this calculated?',
      howCar: 'Car: 0.17 kg CO2 per km (average passenger car, UK government conversion factors).',
      howTransit: 'Bus or train: 0.07 kg CO2 per km (average of bus ≈ 0.10 and rail ≈ 0.035).',
      howMeat: 'Meat meals: 1.13 kg CO2 more than a vegetarian meal (derived from Scarborough et al., 2014, Climatic Change).',
      howFlights: 'Flights: a 4,000 km return trip at 0.15 kg CO2 per passenger-km = 600 kg.',
      howTrees: 'Trees: a mature tree absorbs about 21 kg CO2 a year (a widely cited average).',
      baselineNote:
        'Typical lifestyle = 120 km by car, 40 km by bus or train and 10 meat meals a week, plus one return flight a year. These are estimates, not a full carbon audit.',
    },
    planner: {
      title: 'Your day, hour by hour',
      subtitle: 'Enter your home city and we plan the next 24 hours around the air you will actually breathe — adjusted to your profile.',
      cityLabel: 'Home city',
      placeholder: 'e.g. Chisinau',
      button: 'Plan my day',
      planning: 'Planning',
      notFound: 'Could not find that city. Check the spelling.',
      error: "Couldn't load the forecast. Try again.",
      forCity: 'Forecast for {city}',
      best: 'Best time to be outside',
      avoid: 'Hours to avoid',
      allGood: 'The air stays good all day — no hours to avoid.',
      pm: 'PM2.5 {value} μg/m³ on average',
      sensitiveNote: 'Because of your profile, levels are flagged one step earlier than for most people.',
      exerciseNote: 'You exercise outdoors, so we look for the cleanest 2-hour window.',
      now: 'Now',
      deviceTime: 'Times are in your device time zone.',
      hint: 'Hover or tap an hour for details.',
    },
    compare: {
      subtitle: "Pick two cities and see whose air is cleaner — live.",
      labelA: 'City A',
      labelB: 'City B',
      placeholderA: 'e.g. Bucharest',
      placeholderB: 'e.g. Delhi',
      button: 'Start the race',
      running: 'Racing',
      examplesTitle: 'Try a matchup',
      lowerIsBetter: 'Lower is better',
      pollutantsTitle: 'Pollutant by pollutant',
      winner: '{city} breathes cleaner',
      winnerDetail: '{pct}% less PM2.5 than {other}',
      tie: "It's a tie — the air is equally clean in both cities.",
      sameCity: 'Pick two different cities.',
      missing: 'Enter both cities.',
      notFound: 'Could not find "{city}". Check the spelling.',
    },
    problem: {
      intro:
        "Climate change isn't a distant, tomorrow problem — its effects are already visible today, in the data, in extreme weather, and in your own city.",
      stat1Label: 'above pre-industrial levels — 2024, the hottest year ever recorded',
      stat1Source: 'NASA / Carbon Brief, 2024',
      stat2Label: 'CO2 concentration in the atmosphere — the highest level in over 3 million years',
      stat2Source: 'NASA, May 2025',
      stat3Label: 'global sea level rise since 1993 — the rate has nearly doubled since 2012',
      stat3Source: 'NASA / NOAA, 2025',
      whyTitle: "Why it's hard to stop",
      bullet1:
        "The effects build up slowly, over decades — a warmer summer or invisible CO2 in the air don't feel urgent, even though the long-term consequences are irreversible.",
      bullet2:
        "It's a global, collective problem — no single person or country can 'solve' climate change alone, which discourages individual action.",
      bullet3:
        'The impact is unequal — the communities and countries that contributed least to emissions (poorer regions, islands, coastlines) suffer the most, through droughts, floods, and heatwaves.',
      bullet4:
        "The data is complex — graphs, climate models, and percentages in °C don't tell an ordinary person what it practically means for their daily life.",
      historyChartTitle: 'Historical trend by country — CO2 emissions',
      owidTitle: 'Annual CO2 emissions, by country',
      owidSource: 'Source: Our World in Data — live interactive chart, pick any country from the list',
      videoTitle: 'Recommended video',
      videoCredit: 'Katharine Hayhoe — TED Talk',
      sourcesFooter:
        'Sources: NASA (climate.nasa.gov), Carbon Brief, NOAA (noaa.gov), IPCC (ipcc.ch) and Our World in Data (ourworldindata.org).',
      sideNote1: 'Road transport and industry produce both polluting particles and most of the urban CO2 emissions.',
      sideNote1Source: 'EPA / IPCC',
      sideNote2: 'The last 10 years have been the hottest in the history of modern measurements.',
      sideNote2Source: 'NASA GISS',
      sideNote3: 'Renewable energy has become cheaper than coal in most countries in the world.',
      sideNote3Source: 'IRENA / Our World in Data',
    },
    solution: {
      subtitle: "ClimaWatch helps you understand the link between today's air and tomorrow's climate — and what you can actually do.",
      feature1Title: 'Personalized profile',
      feature1Desc:
        'Tell us once whether you have asthma, a young child, or exercise outdoors — the app adapts automatically, protecting you from the local effects of pollution tied to the same sources fueling global warming.',
      feature2Title: 'Action advice, not just a status',
      feature2Desc:
        'Instead of "Moderate air", you get concrete advice: "avoid running today", "stay indoors if you have a young child", "the best time is early morning".',
      feature3Title: 'Proactive alert',
      feature3Desc:
        "If the air becomes unhealthy for your profile, you get a browser notification — you don't need to open the app to find out.",
      impactTitle: 'Impact',
      impactText:
        "The goal isn't just information about today's air, it's understanding that every choice — how you get around, what energy you use — impacts both your immediate health and the climate long-term.",
      preventionTitle: 'What you can do yourself, today',
      preventionTips: [
        'Walk, bike, or take public transit for short trips — you cut both CO2 emissions and local pollution.',
        "Don't leave the engine idling — modern cars don't need to 'warm up' in winter, and every idle minute burns fuel for nothing.",
        'Support tree planting — forests absorb CO2 from the atmosphere and reduce pollution at the neighborhood level.',
        'Choose renewable energy or electric/battery-powered tools instead of fossil-fuel ones, wherever you can.',
        'Carpool, or consider an electric/hybrid car for your next purchase — transportation is one of the biggest sources of emissions.',
        'Compost organic waste instead of throwing it away — buried organic waste produces methane, a greenhouse gas far more potent than CO2.',
      ],
      preventionNote: 'Recommendations adapted from NASA, EPA (epa.gov) and Project Drawdown.',
      funFactTitle: 'Fun fact — see the link right now',
      funFactDesc:
        'Open the live air quality checker for any city in the world — a concrete, local signal of the same causes fueling the global climate crisis. Click here →',
      sideNote1: 'Even 1-2 days a week biking instead of driving visibly cuts your personal CO2 emissions.',
      sideNote2: 'Electric cars have no tailpipe emissions — zero local pollution and far less CO2 over their lifetime.',
      sideNote2Source: 'EPA — epa.gov',
      orgCtaLabel: 'Visit the website →',
      org1Name: 'UNFCCC — UN Climate',
      org1Desc: 'The UN body that coordinates global climate negotiations, including the Paris Agreement.',
      org2Name: 'Climate & Clean Air Coalition',
      org2Desc: 'A UN-hosted coalition of 200+ governments and organizations working for cleaner air and climate.',
    },
    profile: {
      subtitle: 'Tell us about yourself, so advice about air and climate is relevant to you',
      toggle1Label: 'I have asthma or other respiratory issues',
      toggle1Desc: "We'll be stricter with alert thresholds for you.",
      toggle2Label: 'I care for a young child',
      toggle2Desc: 'Children are more vulnerable to pollution than adults.',
      toggle3Label: 'I exercise/run outdoors often',
      toggle3Desc: "We'll recommend the best times of day for that.",
      toggle4Label: 'I want tips for reducing my carbon footprint',
      toggle4Desc: "You'll get an extra climate tip, beyond local air.",
      carbonTipTitle: 'Your climate tip',
      carbonTipText:
        'Animal-based foods, especially red meat, have on average a carbon footprint several times higher than plant-based ones — even 1-2 vegetarian meals a week make a measurable difference.',
      footerNote:
        "Your profile is saved automatically on this device. When the air becomes unhealthy for you, we also send a notification — if you've allowed notifications in your browser.",
      sideNote1: "Children breathe in more air relative to body weight than adults — that's why they're more vulnerable.",
      sideNote1Source: 'EPA — epa.gov',
    },
    aqi: {
      1: { text: 'Good', advice: 'Clean air, you can do any activity outdoors.' },
      2: { text: 'Fair', advice: 'Air is OK, no risk for most people.' },
      3: { text: 'Moderate', advice: 'Sensitive people should reduce intense outdoor effort.' },
      4: { text: 'Unhealthy', advice: 'Avoid prolonged physical effort outdoors.' },
      5: { text: 'Hazardous', advice: 'Avoid going outside if possible.' },
    },
    rec: {
      okExercise: "Good air — it's a fine day for running or exercising outside.",
      okDefault: "Good air, no restrictions for today's activities.",
      warningSensitive:
        'Moderate air — if you have asthma/allergies or a young child, limit outdoor time during busy hours (usually 2–7 PM).',
      warningExercise: 'Moderate air — you can exercise, but prefer early morning, when pollution is lower.',
      warningDefault: "Moderate air — normal activities are fine, but avoid prolonged intense effort.",
      dangerSensitive:
        'Unhealthy air — if you have respiratory issues or a young child, we recommend staying indoors today and airing out briefly, early in the morning.',
      dangerExercise: 'Unhealthy air — postpone running/exercising outside for another day or move it indoors.',
      dangerDefault: 'Unhealthy air — avoid prolonged physical effort outdoors today.',
    },
  },
  ru: {
    nav: {
      tagline: 'Мониторинг климата',
      problem: 'Проблема',
      solution: 'Решение',
      live: 'Проверить сейчас',
      compare: 'Сравнить',
      profile: 'Мой профиль',
    },
    home: {
      subtitle: 'Локальное загрязнение — конкретный сигнал тех же причин, что питают климатический кризис — проверьте воздух в своём городе',
      searchPlaceholder: 'Введите город (напр. Кишинёв, Бухарест)',
      searchButton: 'Найти',
      searching: 'Ищу',
      errorNotFound: 'Город не найден. Проверьте название и попробуйте снова.',
      errorGeneric: 'Произошла ошибка. Попробуйте снова.',
      recommendationTitle: 'Что стоит сделать сегодня',
      historyTitle: 'Динамика за последние 7 дней',
      historyNote: 'Среднесуточный PM2.5 (мкг/м³) — реальные данные из истории OpenWeatherMap.',
      historyLoading: 'Загружаю реальную историю…',
      historyError: 'Сейчас не удалось загрузить историю.',
      sideNote1: 'Сжигание ископаемого топлива — главный источник и загрязнения воздуха, и глобального потепления.',
      sideNote1Source: 'NASA / IPCC',
      sideNote2: 'Качество воздуха может сильно меняться от часа к часу — проверяйте чаще.',
      globalContextTitle: 'Глобальный климатический контекст сегодня',
      co2Label: 'CO2 в атмосфере',
      co2Source: 'NASA, май 2025',
      tempLabel: 'выше доиндустриального уровня (2024)',
      tempSource: 'NASA / Carbon Brief',
      parisLabel: 'лет с момента Парижского соглашения',
      localSignalTitle: 'Локальный сигнал: воздух в вашем городе',
    },
    globe: {
      title: 'Качество воздуха в мире',
      subtitle: 'Данные в реальном времени по крупным городам — вращайте глобус и нажимайте на точки.',
      loading: 'Загружаю данные…',
      error: 'Не удалось загрузить данные по городам.',
      hint: 'Потяните, чтобы вращать · нажмите на точку, чтобы проверить город',
      idle: 'Наведите на точку, чтобы увидеть воздух в реальном времени',
      ariaLabel: 'Интерактивный глобус с качеством воздуха в городах мира',
    },
    mood: {
      reacts: 'Фон «дышит» вместе с воздухом в городе {city}',
    },
    impact: {
      title: 'Лаборатория вашего влияния',
      subtitle: 'Двигайте ползунки и смотрите, как повседневные выборы меняют ваш годовой CO2 — и сколько деревьев нужно, чтобы его поглотить.',
      car: 'На машине',
      carUnit: 'км / неделю',
      transit: 'На автобусе или поезде',
      transitUnit: 'км / неделю',
      meat: 'Приёмы пищи с мясом',
      meatUnit: 'раз / неделю',
      flights: 'Перелёты туда-обратно',
      flightsUnit: 'в год',
      total: 'Ваш годовой след от этих четырёх выборов',
      unit: 'т CO2 / год',
      less: 'На {pct}% меньше, чем при обычном образе жизни',
      more: 'На {pct}% больше, чем при обычном образе жизни',
      same: 'Так же, как при обычном образе жизни',
      trees: '≈ {n} деревьев, работающих целый год, чтобы поглотить это',
      treeUnit: 'Каждое дерево на рисунке = {k} деревьев',
      treesZero: 'Компенсировать нечего — отлично!',
      ecoPlan: 'Попробовать эко-план',
      reset: 'Сбросить',
      howTitle: 'Как это считается?',
      howCar: 'Машина: 0,17 кг CO2 на км (средний легковой автомобиль, коэффициенты правительства Великобритании).',
      howTransit: 'Автобус или поезд: 0,07 кг CO2 на км (среднее между автобусом ≈ 0,10 и поездом ≈ 0,035).',
      howMeat: 'Мясные блюда: на 1,13 кг CO2 больше, чем вегетарианское (на основе Scarborough et al., 2014, Climatic Change).',
      howFlights: 'Перелёты: поездка туда-обратно на 4 000 км при 0,15 кг CO2 на пассажиро-км = 600 кг.',
      howTrees: 'Деревья: зрелое дерево поглощает около 21 кг CO2 в год (широко цитируемая оценка).',
      baselineNote:
        'Обычный образ жизни = 120 км на машине, 40 км на автобусе или поезде и 10 мясных приёмов пищи в неделю, плюс один перелёт туда-обратно в год. Это оценки, а не полный углеродный аудит.',
    },
    planner: {
      title: 'Ваш день по часам',
      subtitle: 'Введите свой город — и мы спланируем ближайшие 24 часа с учётом воздуха, которым вы будете дышать, и вашего профиля.',
      cityLabel: 'Ваш город',
      placeholder: 'напр. Кишинёв',
      button: 'Спланировать день',
      planning: 'Планирую',
      notFound: 'Не удалось найти город. Проверьте название.',
      error: 'Не удалось загрузить прогноз. Попробуйте снова.',
      forCity: 'Прогноз для города {city}',
      best: 'Лучшее время для прогулки',
      avoid: 'Часы, которых лучше избегать',
      allGood: 'Воздух остаётся хорошим весь день — избегать нечего.',
      pm: 'PM2.5 {value} мкг/м³ в среднем',
      sensitiveNote: 'Из-за вашего профиля уровни отмечаются на ступень раньше, чем для большинства людей.',
      exerciseNote: 'Вы занимаетесь спортом на улице, поэтому мы ищем самое чистое двухчасовое окно.',
      now: 'Сейчас',
      deviceTime: 'Время указано в часовом поясе вашего устройства.',
      hint: 'Наведите курсор или коснитесь часа, чтобы увидеть детали.',
    },
    compare: {
      subtitle: 'Выберите два города и узнайте, где воздух чище, — в реальном времени.',
      labelA: 'Город A',
      labelB: 'Город B',
      placeholderA: 'напр. Бухарест',
      placeholderB: 'напр. Дели',
      button: 'Начать гонку',
      running: 'Гонка идёт',
      examplesTitle: 'Попробуйте противостояние',
      lowerIsBetter: 'Чем меньше, тем лучше',
      pollutantsTitle: 'Загрязнитель за загрязнителем',
      winner: 'В городе {city} воздух чище',
      winnerDetail: 'На {pct}% меньше PM2.5, чем в {other}',
      tie: 'Ничья — воздух одинаково чист в обоих городах.',
      sameCity: 'Выберите два разных города.',
      missing: 'Введите оба города.',
      notFound: 'Не удалось найти «{city}». Проверьте название.',
    },
    problem: {
      intro:
        'Изменение климата — не отдалённая угроза «на завтра»: его последствия уже видны сегодня — в данных, в экстремальной погоде и в вашем городе.',
      stat1Label: 'выше доиндустриального уровня — 2024 год, самый жаркий за всю историю наблюдений',
      stat1Source: 'NASA / Carbon Brief, 2024',
      stat2Label: 'концентрация CO2 в атмосфере — самый высокий уровень за более чем 3 миллиона лет',
      stat2Source: 'NASA, май 2025',
      stat3Label: 'рост уровня моря в мире с 1993 года — темпы почти удвоились с 2012 года',
      stat3Source: 'NASA / NOAA, 2025',
      whyTitle: 'Почему это трудно остановить',
      bullet1:
        'Последствия накапливаются медленно, десятилетиями — более тёплое лето или невидимый CO2 в воздухе не кажутся срочными, хотя долгосрочные последствия необратимы.',
      bullet2:
        'Это глобальная, коллективная проблема — ни один человек или страна не может «решить» изменение климата в одиночку, что отбивает желание действовать.',
      bullet3:
        'Воздействие неравномерно — сообщества и страны, внёсшие наименьший вклад в выбросы (бедные регионы, острова, побережья), страдают больше всего от засух, наводнений и волн жары.',
      bullet4:
        'Данные сложны — графики, климатические модели и проценты в °C не говорят обычному человеку, что это значит на практике для его повседневной жизни.',
      historyChartTitle: 'Историческая динамика по странам — выбросы CO2',
      owidTitle: 'Ежегодные выбросы CO2 по странам',
      owidSource: 'Источник: Our World in Data — живой интерактивный график, можно выбрать любую страну из списка',
      videoTitle: 'Рекомендуемое видео',
      videoCredit: 'Кэтрин Хейхоу — выступление TED',
      sourcesFooter:
        'Источники статистики: NASA (climate.nasa.gov), Carbon Brief, NOAA (noaa.gov), IPCC (ipcc.ch) и Our World in Data (ourworldindata.org).',
      sideNote1: 'Дорожный транспорт и промышленность производят как загрязняющие частицы, так и большую часть городских выбросов CO2.',
      sideNote1Source: 'EPA / IPCC',
      sideNote2: 'Последние 10 лет стали самыми жаркими за всю историю современных измерений.',
      sideNote2Source: 'NASA GISS',
      sideNote3: 'Возобновляемая энергия стала дешевле угля в большинстве стран мира.',
      sideNote3Source: 'IRENA / Our World in Data',
    },
    solution: {
      subtitle: 'ClimaWatch помогает понять связь между сегодняшним воздухом и завтрашним климатом — и что вы можете сделать сами.',
      feature1Title: 'Персональный профиль',
      feature1Desc:
        'Один раз укажите, есть ли у вас астма, маленький ребёнок или вы часто занимаетесь спортом на улице — приложение подстроится само, защищая вас от локальных последствий загрязнения, связанного с теми же источниками, что питают глобальное потепление.',
      feature2Title: 'Совет к действию, а не просто статус',
      feature2Desc:
        'Вместо «Умеренный воздух» вы получаете конкретный совет: «не бегайте сегодня», «оставайтесь дома, если у вас маленький ребёнок», «лучшее время — раннее утро».',
      feature3Title: 'Проактивное оповещение',
      feature3Desc:
        'Если воздух станет вредным для вашего профиля, вы получите уведомление браузера — не нужно открывать приложение, чтобы узнать.',
      impactTitle: 'Воздействие',
      impactText:
        'Цель — не просто информация о сегодняшнем воздухе, а понимание того, что каждый выбор — как вы передвигаетесь, какую энергию используете — влияет и на ваше здоровье сейчас, и на климат в долгосрочной перспективе.',
      preventionTitle: 'Что вы можете сделать сами, уже сегодня',
      preventionTips: [
        'Ходите пешком, ездите на велосипеде или общественном транспорте на короткие расстояния — это снижает и выбросы CO2, и местное загрязнение.',
        'Не оставляйте двигатель работать вхолостую — современным машинам не нужно «прогреваться» зимой, а каждая минута холостого хода сжигает топливо впустую.',
        'Поддерживайте посадку деревьев — леса поглощают CO2 из атмосферы и снижают загрязнение в районе.',
        'Выбирайте возобновляемую энергию или электрические/аккумуляторные инструменты вместо тех, что работают на ископаемом топливе, где это возможно.',
        'Пользуйтесь совместными поездками или рассмотрите электро/гибридный автомобиль при следующей покупке — транспорт — один из крупнейших источников выбросов.',
        'Компостируйте органические отходы, а не выбрасывайте их — закопанные органические отходы выделяют метан, парниковый газ, гораздо более мощный, чем CO2.',
      ],
      preventionNote: 'Рекомендации на основе NASA, EPA (epa.gov) и Project Drawdown.',
      funFactTitle: 'Интересный факт — узнайте связь прямо сейчас',
      funFactDesc:
        'Откройте проверку качества воздуха в реальном времени для любого города мира — конкретный, локальный сигнал тех же причин, что питают глобальный климатический кризис. Нажмите здесь →',
      sideNote1: 'Даже 1-2 дня в неделю на велосипеде вместо машины заметно снижают личные выбросы CO2.',
      sideNote2: 'У электромобилей нет выхлопных выбросов — ноль локального загрязнения и намного меньше CO2 за весь срок службы.',
      sideNote2Source: 'EPA — epa.gov',
      orgCtaLabel: 'Посетить сайт →',
      org1Name: 'UNFCCC — Климат ООН',
      org1Desc: 'Орган ООН, координирующий глобальные переговоры по климату, включая Парижское соглашение.',
      org2Name: 'Climate & Clean Air Coalition',
      org2Desc: 'Коалиция из более 200 правительств и организаций при поддержке ООН, борющаяся за более чистый воздух и климат.',
    },
    profile: {
      subtitle: 'Расскажите о себе, чтобы советы о воздухе и климате были для вас актуальны',
      toggle1Label: 'У меня астма или другие проблемы с дыханием',
      toggle1Desc: 'Мы будем строже с порогами оповещений для вас.',
      toggle2Label: 'У меня на попечении маленький ребёнок',
      toggle2Desc: 'Дети более уязвимы к загрязнению, чем взрослые.',
      toggle3Label: 'Я часто занимаюсь спортом/бегаю на улице',
      toggle3Desc: 'Мы порекомендуем лучшее время дня для этого.',
      toggle4Label: 'Хочу советы по снижению моего углеродного следа',
      toggle4Desc: 'Вы получите дополнительный климатический совет, помимо местного воздуха.',
      carbonTipTitle: 'Ваш климатический совет',
      carbonTipText:
        'Продукты животного происхождения, особенно красное мясо, в среднем оставляют углеродный след в несколько раз больше, чем растительные — даже 1-2 вегетарианских приёма пищи в неделю дают заметную разницу.',
      footerNote:
        'Профиль сохраняется автоматически на этом устройстве. Когда воздух станет вредным для вас, мы также отправим уведомление — если вы разрешили уведомления в браузере.',
      sideNote1: 'Дети вдыхают больше воздуха на килограмм веса, чем взрослые — поэтому они более уязвимы.',
      sideNote1Source: 'EPA — epa.gov',
    },
    aqi: {
      1: { text: 'Хорошо', advice: 'Чистый воздух, можно заниматься чем угодно на улице.' },
      2: { text: 'Приемлемо', advice: 'Воздух в норме, риска для большинства людей нет.' },
      3: { text: 'Умеренно', advice: 'Чувствительным людям стоит снизить интенсивные нагрузки на улице.' },
      4: { text: 'Вредно', advice: 'Избегайте длительных физических нагрузок на улице.' },
      5: { text: 'Опасно', advice: 'По возможности не выходите на улицу.' },
    },
    rec: {
      okExercise: 'Хороший воздух — отличный день для пробежки или спорта на улице.',
      okDefault: 'Хороший воздух, никаких ограничений для сегодняшних дел.',
      warningSensitive:
        'Умеренный воздух — если у вас астма/аллергия или маленький ребёнок, ограничьте время на улице в часы пик (обычно 14:00–19:00).',
      warningExercise: 'Умеренный воздух — можно заниматься спортом, но лучше рано утром, когда загрязнение ниже.',
      warningDefault: 'Умеренный воздух — обычные дела в порядке, но избегайте длительных интенсивных нагрузок.',
      dangerSensitive:
        'Вредный воздух — если у вас проблемы с дыханием или маленький ребёнок, рекомендуем остаться дома сегодня и проветривать коротко, рано утром.',
      dangerExercise: 'Вредный воздух — перенесите пробежку/спорт на улице на другой день или займитесь дома.',
      dangerDefault: 'Вредный воздух — избегайте длительных физических нагрузок на улице сегодня.',
    },
  },
}
