import { useEffect, useRef, useState } from 'react'
import { getAqiColor, safeAqi } from '../constants/aqi'
import { useAirMood } from '../context/airMood'
import { useLanguage } from '../i18n/LanguageContext'
import { lerp, paramsForAqi, type ParticleParams } from '../utils/mood'

const MAX_PARTICLES = 240

interface Particle {
  x: number
  y: number
  seed: number
  size: number
}

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Full-page particle field that "breathes" with the air quality of the last city checked:
 * clean air = a few slow, clear particles and a calm breath; bad air = dense, fast, murky
 * particles, a faint haze, and a short, labored breath. Parameters ease toward each new state.
 */
export function BreathingBackground() {
  const { mood } = useAirMood()
  const { t } = useLanguage()
  const [reduced] = useState(prefersReducedMotion)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const targetRef = useRef<ParticleParams>(paramsForAqi(null))

  useEffect(() => {
    targetRef.current = paramsForAqi(mood ? mood.aqi : null)
  }, [mood])

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (reduced || !canvas || !ctx) return

    const particles: Particle[] = Array.from({ length: MAX_PARTICLES }, () => ({
      x: Math.random(),
      y: Math.random(),
      seed: Math.random() * 1000,
      size: Math.random(),
    }))
    const current: ParticleParams = { ...targetRef.current, rgb: [...targetRef.current.rgb] }
    let width = 0
    let height = 0
    let dpr = 1
    let phase = 0
    let last = performance.now()
    let frame = 0

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = window.innerWidth
      height = window.innerHeight
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now
      const time = now / 1000
      const target = targetRef.current
      const ease = 1 - Math.exp(-dt * 1.6)

      current.count = lerp(current.count, target.count, ease)
      current.speed = lerp(current.speed, target.speed, ease)
      current.breathSeconds = lerp(current.breathSeconds, target.breathSeconds, ease)
      current.alpha = lerp(current.alpha, target.alpha, ease)
      current.rgb = [
        lerp(current.rgb[0], target.rgb[0], ease),
        lerp(current.rgb[1], target.rgb[1], ease),
        lerp(current.rgb[2], target.rgb[2], ease),
      ]

      phase += (dt * Math.PI * 2) / current.breathSeconds
      const breath = 0.5 + 0.5 * Math.sin(phase)
      const [r, g, b] = current.rgb.map(Math.round)
      const murk = Math.max(0, (current.count - 40) / 180)

      ctx!.clearRect(0, 0, width, height)

      if (murk > 0.02) {
        ctx!.fillStyle = `rgba(${r},${g},${b},${murk * 0.1 * (0.6 + 0.4 * breath)})`
        ctx!.fillRect(0, 0, width, height)
      }

      const speedPx = current.speed * 60
      const radiusScale = (0.85 + 0.3 * breath) * (1 + murk * 1.1)
      const visibleCount = Math.ceil(current.count)

      for (let i = 0; i < visibleCount && i < MAX_PARTICLES; i++) {
        const p = particles[i]
        const fade = Math.min(1, Math.max(0, current.count - i))
        const angle = Math.sin(p.x * 5 + time * 0.2 + p.seed) * Math.PI + Math.cos(p.y * 4 - time * 0.15) * Math.PI * 0.5
        p.x += (Math.cos(angle) * speedPx * dt) / width
        p.y += (Math.sin(angle) * speedPx * dt - 6 * dt) / height
        if (p.x < 0) p.x += 1
        else if (p.x > 1) p.x -= 1
        if (p.y < 0) p.y += 1
        else if (p.y > 1) p.y -= 1

        ctx!.beginPath()
        ctx!.arc(p.x * width, p.y * height, (1.4 + p.size * 2.2) * radiusScale, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${r},${g},${b},${current.alpha * (0.7 + 0.3 * breath) * fade})`
        ctx!.fill()
      }

      frame = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    frame = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
    }
  }, [reduced])

  if (reduced) return null

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />
      {mood && (
        <div className="pointer-events-none fixed bottom-4 left-4 z-20 hidden max-w-[min(30rem,calc(100vw-2rem))] items-center gap-2 rounded-full bg-[var(--text)]/90 px-3 py-1.5 text-[11px] text-white shadow-lg sm:flex">
          <span
            className="h-2 w-2 shrink-0 animate-pulse rounded-full"
            style={{ background: getAqiColor(safeAqi(mood.aqi)).hex }}
          />
          <span className="truncate">
            {t.mood.reacts.replace('{city}', mood.city)} · PM2.5 {mood.pm2_5.toFixed(1)}
          </span>
        </div>
      )}
    </>
  )
}
