interface PollutantCardProps {
  label: string
  value: number
  unit: string
}

export function PollutantCard({ label, value, unit }: PollutantCardProps) {
  return (
    <div className="glass-card rounded-lg p-4 text-center">
      <p className="text-slate-400 text-sm">{label}</p>
      <p className="text-2xl font-extrabold heading-font text-sky-300">{value.toFixed(1)}</p>
      <p className="text-slate-500 text-xs">{unit}</p>
    </div>
  )
}
