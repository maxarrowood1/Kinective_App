import { useEffect, useRef } from 'react'

interface Props {
  onComplete: () => void
}

interface Sparkle {
  x: number
  y: number
  vx: number
  vy: number
  opacity: number
  color: string
  size: number
}

const PALETTE = ['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#ffffff', '#c77dff']
const BALL_RADIUS = 60
const DROP_MS = 1000
const HANG_MS = 5000
const RISE_MS = 1000
const START_Y = -(BALL_RADIUS + 20)
const HANG_Y = 130

function easeOutQuad(t: number) { return 1 - (1 - t) * (1 - t) }
function easeInQuad(t: number) { return t * t }
function rand(min: number, max: number) { return min + Math.random() * (max - min) }

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const outer = (i * Math.PI / 2) - Math.PI / 2
    const inner = outer + Math.PI / 4
    if (i === 0) ctx.moveTo(x + Math.cos(outer) * size, y + Math.sin(outer) * size)
    else ctx.lineTo(x + Math.cos(outer) * size, y + Math.sin(outer) * size)
    ctx.lineTo(x + Math.cos(inner) * size * 0.35, y + Math.sin(inner) * size * 0.35)
  }
  ctx.closePath()
  ctx.fill()
}

function getBallY(elapsed: number): { y: number; phase: 'drop' | 'hang' | 'rise' | 'done' } {
  if (elapsed < DROP_MS) {
    return { y: START_Y + (HANG_Y - START_Y) * easeOutQuad(elapsed / DROP_MS), phase: 'drop' }
  }
  if (elapsed < DROP_MS + HANG_MS) {
    return { y: HANG_Y, phase: 'hang' }
  }
  if (elapsed < DROP_MS + HANG_MS + RISE_MS) {
    const t = easeInQuad((elapsed - DROP_MS - HANG_MS) / RISE_MS)
    return { y: HANG_Y + (START_Y - HANG_Y) * t, phase: 'rise' }
  }
  return { y: START_Y, phase: 'done' }
}

export default function Disco({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const doneRef = useRef(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const w = window.innerWidth
    const h = window.innerHeight
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!

    const ballX = w / 2
    const startTime = Date.now()

    let spinAngle = 0
    let rayAngle = 0
    const rayColors = Array.from({ length: 12 }, () => PALETTE[Math.floor(Math.random() * PALETTE.length)])
    const sparkles: Sparkle[] = []

    function drawBall(by: number) {
      // String
      ctx.save()
      ctx.strokeStyle = 'rgba(160,160,160,0.8)'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(ballX, 0)
      ctx.lineTo(ballX, by - BALL_RADIUS)
      ctx.stroke()
      ctx.restore()

      const tileSize = 8

      // Clip to ball and fill tiles
      ctx.save()
      ctx.beginPath()
      ctx.arc(ballX, by, BALL_RADIUS, 0, Math.PI * 2)
      ctx.clip()

      ctx.fillStyle = '#111'
      ctx.fillRect(ballX - BALL_RADIUS, by - BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2)

      for (let ty = by - BALL_RADIUS; ty < by + BALL_RADIUS; ty += tileSize) {
        for (let tx = ballX - BALL_RADIUS; tx < ballX + BALL_RADIUS; tx += tileSize) {
          const dx = tx + tileSize / 2 - ballX
          const dy = ty + tileSize / 2 - by
          if (dx * dx + dy * dy > BALL_RADIUS * BALL_RADIUS) continue

          const angle = Math.atan2(dy, dx)
          const norm = ((angle + Math.PI + spinAngle) % (Math.PI * 2)) / (Math.PI * 2)
          const colorIdx = Math.floor(norm * PALETTE.length) % PALETTE.length
          // Left darker, right brighter
          const light = 0.3 + 0.7 * ((dx / BALL_RADIUS + 1) / 2)

          ctx.save()
          ctx.translate(tx + tileSize / 2, ty + tileSize / 2)
          ctx.rotate(0.3)
          ctx.globalAlpha = light
          ctx.fillStyle = PALETTE[colorIdx]
          ctx.fillRect(-tileSize / 2 + 1, -tileSize / 2 + 1, tileSize - 2, tileSize - 2)
          ctx.restore()
        }
      }

      ctx.restore()

      // Specular highlight
      ctx.save()
      ctx.beginPath()
      ctx.arc(ballX, by, BALL_RADIUS, 0, Math.PI * 2)
      ctx.clip()
      const grad = ctx.createRadialGradient(
        ballX - BALL_RADIUS * 0.35, by - BALL_RADIUS * 0.4, 0,
        ballX - BALL_RADIUS * 0.35, by - BALL_RADIUS * 0.4, BALL_RADIUS * 0.4,
      )
      grad.addColorStop(0, 'rgba(255,255,255,0.8)')
      grad.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = grad
      ctx.fillRect(ballX - BALL_RADIUS, by - BALL_RADIUS, BALL_RADIUS * 2, BALL_RADIUS * 2)
      ctx.restore()
    }

    function drawRays(by: number) {
      const rStart = BALL_RADIUS
      const rEnd = Math.max(w, h) * 1.5
      ctx.save()
      ctx.globalAlpha = 0.25
      for (let i = 0; i < 12; i++) {
        const angle = rayAngle + (i * Math.PI * 2) / 12
        const sx = ballX + Math.cos(angle) * rStart
        const sy = by + Math.sin(angle) * rStart
        const tx = ballX + Math.cos(angle) * rEnd
        const ty = by + Math.sin(angle) * rEnd
        const px = -Math.sin(angle)
        const py = Math.cos(angle)

        ctx.fillStyle = rayColors[i]
        ctx.beginPath()
        ctx.moveTo(sx + px * 3, sy + py * 3)
        ctx.lineTo(sx - px * 3, sy - py * 3)
        ctx.lineTo(tx, ty)
        ctx.closePath()
        ctx.fill()
      }
      ctx.restore()
    }

    function emitSparkles(by: number) {
      const count = Math.floor(rand(3, 5))
      for (let i = 0; i < count; i++) {
        const angle = rand(0, Math.PI * 2)
        const speed = rand(1.5, 4)
        sparkles.push({
          x: ballX + Math.cos(angle) * BALL_RADIUS * rand(0.8, 1.1),
          y: by + Math.sin(angle) * BALL_RADIUS * rand(0.8, 1.1),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          opacity: rand(0.7, 1.0),
          color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
          size: rand(3, 7),
        })
      }
    }

    function updateAndDrawSparkles() {
      const fadePerFrame = 1 / (0.8 * 60)
      for (let i = sparkles.length - 1; i >= 0; i--) {
        const s = sparkles[i]
        s.x += s.vx
        s.y += s.vy
        s.opacity -= fadePerFrame
        if (s.opacity <= 0) { sparkles.splice(i, 1); continue }
        ctx.save()
        ctx.globalAlpha = s.opacity
        ctx.fillStyle = s.color
        drawStar(ctx, s.x, s.y, s.size)
        ctx.restore()
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h)
      const elapsed = Date.now() - startTime
      const { y: by, phase } = getBallY(elapsed)

      if (phase === 'done') {
        if (!doneRef.current) {
          doneRef.current = true
          onComplete()
        }
        return
      }

      spinAngle += 0.022
      rayAngle += (Math.PI * 2) / (2 * 60)

      drawRays(by)
      drawBall(by)

      if (phase === 'hang') emitSparkles(by)
      updateAndDrawSparkles()

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
