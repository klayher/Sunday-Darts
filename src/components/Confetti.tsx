import { useEffect, useRef } from 'react'
import { useReducedMotion } from '../useReducedMotion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  rot: number
  vr: number
  color: string
}

/**
 * Lightweight one-shot confetti on a single <canvas>. No dependencies — a few
 * dozen falling rectangles for ~2.6s, then it clears itself and stops. Skipped
 * entirely for reduced-motion users.
 */
export function Confetti() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()

  useEffect(() => {
    if (reduced) return
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let w = (canvas.width = window.innerWidth * dpr)
    let h = (canvas.height = window.innerHeight * dpr)

    const palette = ['#34d399', '#10b981', '#fbbf24', '#f4f5f7', '#60a5fa']
    const count = window.innerWidth < 480 ? 90 : 140
    const parts: Particle[] = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: -Math.random() * h * 0.3,
      vx: (Math.random() - 0.5) * 1.6 * dpr,
      vy: (Math.random() * 2 + 2) * dpr,
      size: (Math.random() * 6 + 4) * dpr,
      rot: Math.random() * Math.PI,
      vr: (Math.random() - 0.5) * 0.3,
      color: palette[Math.floor(Math.random() * palette.length)],
    }))

    const duration = 2600
    const start = performance.now()
    let raf = 0

    const frame = (now: number) => {
      const elapsed = now - start
      ctx.clearRect(0, 0, w, h)
      const fade =
        elapsed > duration - 700 ? Math.max(0, (duration - elapsed) / 700) : 1

      for (const p of parts) {
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.02 * dpr
        p.rot += p.vr
        ctx.save()
        ctx.globalAlpha = fade
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }

      if (elapsed < duration) {
        raf = requestAnimationFrame(frame)
      } else {
        ctx.clearRect(0, 0, w, h)
      }
    }
    raf = requestAnimationFrame(frame)

    const onResize = () => {
      w = canvas.width = window.innerWidth * dpr
      h = canvas.height = window.innerHeight * dpr
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
    }
  }, [reduced])

  if (reduced) return null
  return (
    <canvas
      ref={ref}
      className="pointer-events-none fixed inset-0 z-40 h-full w-full"
      aria-hidden="true"
    />
  )
}
