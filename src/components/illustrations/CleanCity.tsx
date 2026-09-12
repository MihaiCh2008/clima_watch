export function CleanCity() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-auto" role="img" aria-label="Ilustrație oraș cu aer curat">
      <defs>
        <linearGradient id="skyClean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#05070f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="buildingClean" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#155e63" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <radialGradient id="sunGlow">
          <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="180" fill="url(#skyClean)" />
      <circle cx="325" cy="42" r="48" fill="url(#sunGlow)" />
      <circle cx="325" cy="42" r="15" fill="#a5f3fc" />
      <g fill="url(#buildingClean)">
        <rect x="8" y="95" width="38" height="85" />
        <rect x="52" y="65" width="32" height="115" />
        <rect x="90" y="105" width="28" height="75" />
        <rect x="124" y="45" width="42" height="135" />
        <rect x="172" y="80" width="35" height="100" />
        <rect x="213" y="60" width="28" height="120" />
        <rect x="245" y="98" width="40" height="82" />
      </g>
      {/* geamuri luminate */}
      <g fill="#a5f3fc" opacity="0.55">
        <rect x="16" y="105" width="5" height="5" />
        <rect x="28" y="105" width="5" height="5" />
        <rect x="16" y="120" width="5" height="5" />
        <rect x="132" y="60" width="5" height="5" />
        <rect x="146" y="60" width="5" height="5" />
        <rect x="132" y="78" width="5" height="5" />
        <rect x="221" y="75" width="5" height="5" />
        <rect x="221" y="92" width="5" height="5" />
      </g>
      {/* păsări */}
      <g stroke="#67e8f9" strokeWidth="2" fill="none" opacity="0.75" strokeLinecap="round">
        <path d="M55 28 q6 -9 12 0 q6 -9 12 0" />
        <path d="M95 45 q5 -7 10 0 q5 -7 10 0" />
        <path d="M180 22 q5 -7 10 0 q5 -7 10 0" />
      </g>
    </svg>
  )
}
