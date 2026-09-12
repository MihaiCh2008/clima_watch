import type { CSSProperties } from 'react'

const BLOBS: CSSProperties[] = [
  { width: 420, height: 420, top: '-12%', left: '-10%', background: 'radial-gradient(circle, rgba(56,189,248,0.22), transparent 70%)', animationDelay: '0s' },
  { width: 480, height: 480, top: '15%', right: '-18%', background: 'radial-gradient(circle, rgba(96,165,250,0.18), transparent 70%)', animationDelay: '3s' },
  { width: 380, height: 380, bottom: '-14%', left: '28%', background: 'radial-gradient(circle, rgba(45,212,191,0.16), transparent 70%)', animationDelay: '6s' },
]

const PARTICLES = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  left: `${(i * 6.3) % 100}%`,
  size: 8 + ((i * 4) % 12),
  duration: 15 + ((i * 3) % 12),
  delay: -((i * 2) % 20),
  symbol: i % 3 === 0 ? '✦' : i % 3 === 1 ? '•' : '◦',
}))

/** Fundal decorativ: aurora + particule plutitoare. Nu interceptează click-uri. */
export function AuroraBackground() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {BLOBS.map((style, i) => (
        <div key={i} className="aurora-blob" style={style} />
      ))}
      {PARTICLES.map((p) => (
        <span
          key={p.id}
          className="particle text-sky-300/30"
          style={{
            left: p.left,
            fontSize: p.size,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  )
}
