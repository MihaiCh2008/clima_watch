export function PlanetArt() {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <defs>
        <radialGradient id="planetBody" cx="35%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="55%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#0f172a" />
        </radialGradient>
      </defs>
      <circle cx="600" cy="200" r="230" fill="url(#planetBody)" />
      <ellipse cx="600" cy="200" rx="330" ry="80" fill="none" stroke="#7dd3fc" strokeWidth="3" opacity="0.5" transform="rotate(-18 600 200)" />
      <g fill="#e0f2fe">
        <circle cx="80" cy="90" r="2.5" />
        <circle cx="150" cy="220" r="2" />
        <circle cx="60" cy="380" r="2.5" />
        <circle cx="220" cy="480" r="2" />
        <circle cx="330" cy="120" r="2" />
        <circle cx="120" cy="520" r="2.5" />
        <circle cx="700" cy="520" r="2" />
        <circle cx="760" cy="420" r="2.5" />
        <circle cx="40" cy="180" r="2" />
        <circle cx="260" cy="300" r="2" />
      </g>
    </svg>
  )
}
