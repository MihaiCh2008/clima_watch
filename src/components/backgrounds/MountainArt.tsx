export function MountainArt() {
  return (
    <svg viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" className="w-full h-full">
      <defs>
        <linearGradient id="mtnBack" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0e7490" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="mtnMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0891b2" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="mtnFront" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#155e75" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <circle cx="640" cy="120" r="60" fill="#7dd3fc" opacity="0.55" />
      <polygon points="0,380 160,180 260,320 340,150 460,380" fill="url(#mtnBack)" />
      <polygon points="200,420 380,220 520,420" fill="url(#mtnMid)" />
      <polygon points="420,440 600,200 760,440" fill="url(#mtnFront)" />
      <g fill="#0f172a">
        <polygon points="60,470 90,410 120,470" />
        <polygon points="100,480 135,405 170,480" />
        <polygon points="620,490 650,430 680,490" />
        <polygon points="660,500 695,425 730,500" />
      </g>
      <rect x="0" y="470" width="800" height="130" fill="#0f172a" />
    </svg>
  )
}
