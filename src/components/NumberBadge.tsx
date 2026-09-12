interface NumberBadgeProps {
  n: number | string
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-9 h-9 text-sm',
}

/** Insignă numerotată — folosită în locul emoji-urilor, în tot restul aplicației. */
export function NumberBadge({ n, size = 'md', className = '' }: NumberBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-white/5 border border-white/15 font-bold text-sky-300 ${SIZE_CLASSES[size]} ${className}`}
    >
      {n}
    </span>
  )
}
