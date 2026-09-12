import { Link } from 'react-router-dom'
import { Reveal } from '../components/Reveal'
import { SideNote } from '../components/SideNote'
import { OrgLinkPanel } from '../components/OrgLinkPanel'
import { NumberBadge } from '../components/NumberBadge'
import { useLanguage } from '../i18n/LanguageContext'

interface FeatureProps {
  n: number
  title: string
  description: string
}

function Feature({ n, title, description }: FeatureProps) {
  return (
    <div className="glass-card rounded-2xl p-6 flex gap-4">
      <NumberBadge n={n} />
      <div>
        <p className="text-lg font-extrabold text-white mb-1 heading-font">{title}</p>
        <p className="text-slate-400 text-sm">{description}</p>
      </div>
    </div>
  )
}

export function SolutionPage() {
  const { t } = useLanguage()
  const s = t.solution

  const features: FeatureProps[] = [
    { n: 1, title: s.feature1Title, description: s.feature1Desc },
    { n: 2, title: s.feature2Title, description: s.feature2Desc },
    { n: 3, title: s.feature3Title, description: s.feature3Desc },
  ]

  return (
    <div>
      <div className="max-w-2xl mx-auto relative space-y-10">
        <SideNote n={1} text={s.sideNote1} wrapperClassName="top-4 right-full mr-10" accent="bg-teal-400/70" />
        <SideNote n={2} text={s.sideNote2} source={s.sideNote2Source} wrapperClassName="top-[34rem] left-full ml-10" accent="bg-blue-400/70" />

        <OrgLinkPanel
          n={1}
          name={s.org1Name}
          description={s.org1Desc}
          url="https://unfccc.int/"
          ctaLabel={s.orgCtaLabel}
          wrapperClassName="top-[15rem] right-full mr-10"
          accent="bg-sky-400/70"
        />
        <OrgLinkPanel
          n={2}
          name={s.org2Name}
          description={s.org2Desc}
          url="https://www.ccacoalition.org/"
          ctaLabel={s.orgCtaLabel}
          wrapperClassName="top-4 left-full ml-10"
          accent="bg-teal-400/70"
        />

        <div className="text-center">
          <p className="text-slate-400 text-base sm:text-lg heading-font">{s.subtitle}</p>
        </div>

        <div className="space-y-4">
          {features.map((f) => (
            <Reveal key={f.n} delay={f.n * 120 - 120}>
              <Feature {...f} />
            </Reveal>
          ))}
        </div>

        <Reveal>
          <div className="glass-card rounded-2xl p-6 sm:p-7">
            <h2 className="text-xl font-extrabold heading-font text-white mb-3">{s.impactTitle}</h2>
            <p className="text-slate-300 text-sm">{s.impactText}</p>
          </div>
        </Reveal>

        <Reveal>
          <div>
            <h2 className="text-xl font-extrabold heading-font text-white mb-4">{s.preventionTitle}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {s.preventionTips.map((tip, i) => (
                <div key={i} className="glass-card rounded-xl p-4 flex gap-3 items-start">
                  <NumberBadge n={i + 1} size="sm" />
                  <p className="text-sm text-slate-300 pt-0.5">{tip}</p>
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-xs mt-4">{s.preventionNote}</p>
          </div>
        </Reveal>

        <Reveal>
          <Link to="/" className="block glass-card rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-teal-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            <p className="relative text-lg font-extrabold heading-font text-sky-300 mb-1">{s.funFactTitle}</p>
            <p className="relative text-slate-300 text-sm">{s.funFactDesc}</p>
          </Link>
        </Reveal>
      </div>
    </div>
  )
}
