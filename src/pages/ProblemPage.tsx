import { StatCard } from '../components/StatCard'
import { YoutubeEmbed } from '../components/YoutubeEmbed'
import { OwidEmbed } from '../components/OwidEmbed'
import { Reveal } from '../components/Reveal'
import { SideNote } from '../components/SideNote'
import { NumberBadge } from '../components/NumberBadge'
import { useLanguage } from '../i18n/LanguageContext'

export function ProblemPage() {
  const { t } = useLanguage()
  const p = t.problem

  const bullets = [p.bullet1, p.bullet2, p.bullet3, p.bullet4]

  return (
    <div>
      <div className="max-w-2xl mx-auto relative space-y-10">
        <SideNote n={1} text={p.sideNote1} source={p.sideNote1Source} wrapperClassName="top-4 right-full mr-10" accent="bg-blue-400/70" />
        <SideNote n={2} text={p.sideNote2} source={p.sideNote2Source} wrapperClassName="top-[26rem] left-full ml-10" accent="bg-teal-400/70" />
        <SideNote n={3} text={p.sideNote3} source={p.sideNote3Source} wrapperClassName="top-[50rem] right-full mr-10" accent="bg-sky-400/70" />

        <div className="text-center">
          <p className="text-slate-400 text-base sm:text-lg heading-font">{p.intro}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Reveal delay={0}>
            <StatCard stat="+1.55°C" label={p.stat1Label} source={p.stat1Source} />
          </Reveal>
          <Reveal delay={120}>
            <StatCard stat="430 ppm" label={p.stat2Label} source={p.stat2Source} />
          </Reveal>
          <Reveal delay={240}>
            <StatCard stat="+11 cm" label={p.stat3Label} source={p.stat3Source} />
          </Reveal>
        </div>

        <Reveal>
          <div className="glass-card rounded-2xl p-6 sm:p-7 space-y-5">
            <h2 className="text-xl font-extrabold heading-font text-white">{p.whyTitle}</h2>
            <ul className="space-y-4 text-sm text-slate-300">
              {bullets.map((bullet, i) => (
                <li key={i} className="flex gap-3">
                  <NumberBadge n={i + 1} size="sm" />
                  <span className="pt-0.5">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal>
          <div>
            <h2 className="text-xl font-extrabold heading-font text-white mb-4">{p.historyChartTitle}</h2>
            <OwidEmbed slug="annual-co2-emissions-per-country" title={p.owidTitle} />
          </div>
        </Reveal>

        <Reveal>
          <div>
            <h2 className="text-xl font-extrabold heading-font text-white mb-4">{p.videoTitle}</h2>
            <YoutubeEmbed
              videoId="-BvcToPZCLI"
              title="The most important thing you can do to fight climate change: talk about it"
              credit={p.videoCredit}
            />
          </div>
        </Reveal>

        <p className="text-slate-500 text-xs text-center">{p.sourcesFooter}</p>
      </div>
    </div>
  )
}
