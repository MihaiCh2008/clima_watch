export function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-32 skeleton-shimmer rounded-2xl"></div>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-20 skeleton-shimmer rounded-lg"></div>
        ))}
      </div>
    </div>
  )
}
