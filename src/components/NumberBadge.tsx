interface NumberBadgeProps {
  n: number | string
  size?: 'sm' | 'md'
  className?: string
}

const SIZE_CLASSES: Record<'sm' | 'md', string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-9 h-9 text-sm',
}

/** Numbered badge — used instead of emoji throughout the rest of the app. */
export function NumberBadge({ n, size = 'md', className = '' }: NumberBadgeProps) {
  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 rounded-full bg-[var(--accent-soft)] border border-[var(--border)] label-mono font-bold text-[var(--accent)] ${SIZE_CLASSES[size]} ${className}`}
    >
      {n}
    </span>
  )
}
