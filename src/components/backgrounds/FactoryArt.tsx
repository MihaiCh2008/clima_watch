export function FactoryArt() {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <defs>
        <linearGradient id="hazeSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#64748b" stopOpacity="0.65" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="factoryBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1e3a8a" />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill="url(#hazeSky)" />
      <circle cx="150" cy="110" r="45" fill="#94a3b8" opacity="0.55" />
      <g fill="url(#factoryBody)">
        <rect x="40" y="360" width="90" height="180" />
        <rect x="140" y="300" width="70" height="240" />
        <rect x="220" y="400" width="60" height="140" />
        <rect x="290" y="260" width="90" height="280" />
        <rect x="580" y="340" width="80" height="200" />
        <rect x="670" y="280" width="70" height="260" />
      </g>
      <rect x="320" y="150" width="20" height="120" fill="#1e293b" />
      <rect x="600" y="200" width="18" height="150" fill="#1e293b" />
      <g fill="#94a3b8" opacity="0.6">
        <ellipse cx="330" cy="140" rx="35" ry="20" />
        <ellipse cx="360" cy="110" rx="45" ry="24" />
        <ellipse cx="310" cy="95" rx="30" ry="18" />
        <ellipse cx="610" cy="190" rx="32" ry="18" />
        <ellipse cx="640" cy="165" rx="40" ry="22" />
      </g>
      <rect x="0" y="500" width="800" height="100" fill="#3b82f6" opacity="0.35" />
    </svg>
  )
}
