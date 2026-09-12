interface StatCardProps {
  stat: string
  label: string
  source: string
  className?: string
}

export function StatCard({ stat, label, source, className = '' }: StatCardProps) {
  return (
    <div className={`glass-card rounded-2xl p-6 text-center ${className}`}>
      <p className="text-3xl sm:text-4xl font-extrabold heading-font text-sky-300 mb-2 whitespace-nowrap">{stat}</p>
      <p className="text-slate-200 text-sm mb-2">{label}</p>
      <p className="text-slate-500 text-xs">{source}</p>
    </div>
  )
}
