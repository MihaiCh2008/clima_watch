import { NumberBadge } from './NumberBadge'

interface SideNoteProps {
  n: number
  text: string
  source?: string
  /** clase pentru poziționare absolută — ex: "top-16 right-full mr-8" */
  wrapperClassName: string
  accent?: string
}

/**
 * Notiță laterală decorativă, vizibilă doar pe ecrane late (xl+), unde altfel
 * ar rămâne spațiu gol în stânga/dreapta coloanei centrale de conținut.
 */
export function SideNote({ n, text, source, wrapperClassName, accent = 'bg-sky-400/70' }: SideNoteProps) {
  return (
    <div className={`hidden xl:block absolute w-48 ${wrapperClassName}`}>
      <div className="relative glass-card rounded-xl p-4 text-xs text-slate-300 shadow-xl overflow-hidden">
        <span className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
        <NumberBadge n={n} size="sm" className="mb-2" />
        <p className="leading-relaxed">{text}</p>
        {source && <p className="mt-2 text-slate-500">{source}</p>}
      </div>
    </div>
  )
}
