import { NumberBadge } from './NumberBadge'

interface OrgLinkPanelProps {
  n: number
  name: string
  description: string
  url: string
  ctaLabel: string
  /** clase pentru poziționare absolută — ex: "top-16 right-full mr-10" */
  wrapperClassName: string
  accent?: string
}

/**
 * Panou lateral mare, cu link real către o organizație care luptă împotriva
 * poluării aerului. Vizibil doar pe ecrane late (xl+), unde umple spațiul gol.
 */
export function OrgLinkPanel({ n, name, description, url, ctaLabel, wrapperClassName, accent = 'bg-sky-400/70' }: OrgLinkPanelProps) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`hidden xl:block absolute w-64 no-underline ${wrapperClassName}`}
    >
      <div className="relative glass-card rounded-2xl p-5 overflow-hidden hover:border-sky-400/50">
        <span className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
        <NumberBadge n={n} />
        <p className="text-lg font-extrabold heading-font text-white mt-3 mb-2">{name}</p>
        <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
        <p className="text-sm font-semibold text-sky-300 mt-4">{ctaLabel}</p>
      </div>
    </a>
  )
}
