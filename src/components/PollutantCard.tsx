interface PollutantCardProps {
  label: string
  value: number
  unit: string
}

export function PollutantCard({ label, value, unit }: PollutantCardProps) {
  return (
    <div className="glass-card rounded-lg p-4 text-center">
      <p className="label-mono text-[var(--text-muted)] text-xs uppercase tracking-wide">{label}</p>
      <p className="text-2xl font-extrabold heading-font text-[var(--accent)]">{value.toFixed(1)}</p>
      <p className="text-[var(--text-soft)] text-xs">{unit}</p>
    </div>
  )
}
