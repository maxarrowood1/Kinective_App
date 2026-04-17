import { useEffect, useRef } from 'react'

interface Props {
  onComplete: () => void
}

interface Snowflake {
  x: number
  y: number
  baseX: number
  size: number
  speed: number
  opacity: number
  sinePhase: number
  sineSpeed: number
  amplitude: number
  spawnAt: number
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

export default function Snowstorm({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const flakesRef = useRef<Snowflake[]>([])
  const rafRef = useRef<number>(0)
  const doneRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w
    canvas.height = h

    const isDark = document.documentElement.getAttribute('data-theme') !== 'light'
    const flakeColor = isDark ? '#ffffff' : '#58a6ff'
    const baseOpacity = isDark ? 0.8 : 0.7

    const startTime = Date.now()

    flakesRef.current = Array.from({ length: 120 }, () => {
      const startX = rand(0, w)
      return {
        x: startX,
        y: rand(-20, -5),
        baseX: startX,
        size: rand(1.5, 3.5),
        speed: rand(2, 5),
        opacity: rand(0.6, 1.0) * baseOpacity,
        sinePhase: rand(0, Math.PI * 2),
        sineSpeed: rand(0.015, 0.035),
        amplitude: rand(10, 28),
        spawnAt: rand(0, 4000),
      }
    })

    const ctx = canvas.getContext('2d')!

    function draw() {
      ctx.clearRect(0, 0, w, h)

      const elapsed = Date.now() - startTime
      const flakes = flakesRef.current
      for (let i = flakes.length - 1; i >= 0; i--) {
        const f = flakes[i]

        if (elapsed < f.spawnAt) continue

        f.y += f.speed
        f.sinePhase += f.sineSpeed
        f.x = f.baseX + f.amplitude * Math.sin(f.sinePhase)

        if (f.y > h + f.size) {
          flakes.splice(i, 1)
          continue
        }

        ctx.save()
        ctx.globalAlpha = f.opacity
        ctx.shadowColor = flakeColor
        ctx.shadowBlur = 4
        ctx.fillStyle = flakeColor
        ctx.beginPath()
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      if (flakes.length === 0) {
        if (!doneRef.current) {
          doneRef.current = true
          onComplete()
        }
        return
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)

    return () => cancelAnimationFrame(rafRef.current)
  }, [onComplete])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999,
      }}
    />
  )
}
