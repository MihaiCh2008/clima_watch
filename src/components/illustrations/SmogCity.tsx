export function SmogCity() {
  return (
    <svg viewBox="0 0 400 180" className="w-full h-auto" role="img" aria-label="Ilustrație oraș acoperit de smog">
      <defs>
        <linearGradient id="skySmog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#05070f" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="buildingSmog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <rect width="400" height="180" fill="url(#skySmog)" />
      <g fill="url(#buildingSmog)">
        <rect x="8" y="95" width="38" height="85" />
        <rect x="52" y="65" width="32" height="115" />
        <rect x="90" y="105" width="28" height="75" />
        <rect x="124" y="45" width="42" height="135" />
        <rect x="172" y="80" width="35" height="100" />
        <rect x="213" y="60" width="28" height="120" />
        <rect x="245" y="98" width="40" height="82" />
        <rect x="290" y="35" width="34" height="145" />
        <rect x="328" y="72" width="45" height="108" />
      </g>
      <rect x="143" y="22" width="9" height="24" fill="#1e293b" />
      <g opacity="0.9">
        <circle className="smog-particle" cx="147" cy="24" r="9" fill="#fb923c" />
        <circle className="smog-particle" cx="147" cy="24" r="7" fill="#f87171" style={{ animationDelay: '1.3s' }} />
        <circle className="smog-particle" cx="147" cy="24" r="11" fill="#fdba74" style={{ animationDelay: '2.6s' }} />
        <circle className="smog-particle" cx="147" cy="24" r="6" fill="#ef4444" style={{ animationDelay: '3.9s' }} />
      </g>
      {/* pâclă groasă peste orizont */}
      <rect x="0" y="150" width="400" height="30" fill="#7c2d12" opacity="0.18" />
    </svg>
  )
}
