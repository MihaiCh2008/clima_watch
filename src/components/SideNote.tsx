import { NumberBadge } from './NumberBadge'

interface SideNoteProps {
  n: number
  text: string
  source?: string
  /** classes for absolute positioning — e.g. "top-16 right-full mr-8" */
  wrapperClassName: string
  accent?: string
}

/**
 * Decorative side note, only visible on wide screens (xl+), where empty
 * space would otherwise remain left/right of the central content column.
 */
export function SideNote({ n, text, source, wrapperClassName, accent = 'bg-[var(--accent)]' }: SideNoteProps) {
  return (
    <div className={`hidden xl:block absolute w-48 ${wrapperClassName}`}>
      <div className="relative glass-card rounded-xl p-4 text-xs text-[var(--text-muted)] shadow-xl overflow-hidden">
        <span className={`absolute top-0 left-0 w-1 h-full ${accent}`} />
        <NumberBadge n={n} size="sm" className="mb-2" />
        <p className="leading-relaxed">{text}</p>
        {source && <p className="mt-2 text-[var(--text-soft)]">{source}</p>}
      </div>
    </div>
  )
}
