'use client'

import { useEffect, useRef } from 'react'

interface Petal {
  x: number
  y: number
  size: number
  speed: number
  wind: number
  rotation: number
  rotationSpeed: number
  opacity: number
  wobble: number
  wobbleSpeed: number
  wobblePhase: number
  color: string
}

const PETAL_COLORS = [
  'rgba(255, 182, 213, 0.85)',
  'rgba(255, 192, 203, 0.80)',
  'rgba(248, 200, 220, 0.90)',
  'rgba(255, 160, 200, 0.75)',
  'rgba(255, 209, 220, 0.85)',
  'rgba(220, 160, 220, 0.80)',
  'rgba(238, 180, 235, 0.75)',
]

export default function SakuraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let petals: Petal[] = []
    let windShift = 0
    let windTarget = 0.3
    let windTimer = 0

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    function createPetal(): Petal {
      if (!canvas) return {} as Petal
      return {
        x: Math.random() * canvas.width,
        y: -20,
        size: 4 + Math.random() * 8,
        speed: 0.8 + Math.random() * 1.5,
        wind: (Math.random() - 0.5) * 1.2,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.04,
        opacity: 0.5 + Math.random() * 0.5,
        wobble: 0,
        wobbleSpeed: 0.02 + Math.random() * 0.02,
        wobblePhase: Math.random() * Math.PI * 2,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
      }
    }

    // Spawn initial petals
    for (let i = 0; i < 80; i++) {
      const p = createPetal()
      if (canvas) p.y = Math.random() * canvas.height
      petals.push(p)
    }

    function drawPetal(ctx: CanvasRenderingContext2D, p: Petal) {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rotation)
      ctx.globalAlpha = p.opacity

      // Draw cherry blossom petal shape
      ctx.beginPath()
      ctx.fillStyle = p.color
      const s = p.size
      // Petal shape: two bezier curves making a rounded diamond
      ctx.moveTo(0, -s)
      ctx.bezierCurveTo(s * 0.8, -s * 0.4, s * 0.8, s * 0.4, 0, s)
      ctx.bezierCurveTo(-s * 0.8, s * 0.4, -s * 0.8, -s * 0.4, 0, -s)
      ctx.fill()

      // Slight inner glow
      ctx.beginPath()
      ctx.fillStyle = 'rgba(255,255,255,0.3)'
      ctx.moveTo(0, -s * 0.6)
      ctx.bezierCurveTo(s * 0.3, -s * 0.2, s * 0.3, s * 0.1, 0, s * 0.3)
      ctx.bezierCurveTo(-s * 0.3, s * 0.1, -s * 0.3, -s * 0.2, 0, -s * 0.6)
      ctx.fill()

      ctx.restore()
    }

    function drawTree(ctx: CanvasRenderingContext2D, x: number, baseY: number, scale: number, opacity: number) {
      ctx.save()
      ctx.globalAlpha = opacity

      // Trunk
      const gradient = ctx.createLinearGradient(x, baseY, x, baseY - 120 * scale)
      gradient.addColorStop(0, 'rgba(120, 80, 60, 0.6)')
      gradient.addColorStop(1, 'rgba(160, 100, 80, 0.4)')
      ctx.fillStyle = gradient
      ctx.beginPath()
      ctx.moveTo(x - 8 * scale, baseY)
      ctx.lineTo(x + 8 * scale, baseY)
      ctx.lineTo(x + 5 * scale, baseY - 120 * scale)
      ctx.lineTo(x - 5 * scale, baseY - 120 * scale)
      ctx.closePath()
      ctx.fill()

      // Draw main branch clusters
      const branches = [
        { bx: x, by: baseY - 120 * scale, r: 70 * scale },
        { bx: x - 50 * scale, by: baseY - 90 * scale, r: 55 * scale },
        { bx: x + 50 * scale, by: baseY - 90 * scale, r: 55 * scale },
        { bx: x - 30 * scale, by: baseY - 150 * scale, r: 45 * scale },
        { bx: x + 30 * scale, by: baseY - 150 * scale, r: 45 * scale },
        { bx: x, by: baseY - 170 * scale, r: 40 * scale },
      ]

      branches.forEach(b => {
        const g = ctx.createRadialGradient(b.bx, b.by, 0, b.bx, b.by, b.r)
        g.addColorStop(0, 'rgba(255, 182, 213, 0.55)')
        g.addColorStop(0.5, 'rgba(255, 160, 200, 0.4)')
        g.addColorStop(1, 'rgba(255, 182, 213, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(b.bx, b.by, b.r, 0, Math.PI * 2)
        ctx.fill()
      })

      ctx.restore()
    }

    function drawBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
      // Sky gradient: soft pink-white to lavender
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h)
      skyGrad.addColorStop(0, '#FDE8F5')
      skyGrad.addColorStop(0.35, '#F9D5E8')
      skyGrad.addColorStop(0.65, '#EFD6F7')
      skyGrad.addColorStop(1, '#E8D5F5')
      ctx.fillStyle = skyGrad
      ctx.fillRect(0, 0, w, h)

      // Soft ground
      const groundGrad = ctx.createLinearGradient(0, h * 0.75, 0, h)
      groundGrad.addColorStop(0, 'rgba(245, 220, 240, 0)')
      groundGrad.addColorStop(1, 'rgba(230, 200, 240, 0.3)')
      ctx.fillStyle = groundGrad
      ctx.fillRect(0, h * 0.75, w, h * 0.25)

      // Trees (left and right sides)
      drawTree(ctx, -20, h, 1.1, 0.5)
      drawTree(ctx, w * 0.12, h * 0.95, 0.9, 0.6)
      drawTree(ctx, w + 20, h, 1.1, 0.5)
      drawTree(ctx, w * 0.88, h * 0.95, 0.9, 0.6)
      drawTree(ctx, w * 0.5, h * 0.9, 0.7, 0.35)
    }

    function tick() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height

      // Update wind
      windTimer++
      if (windTimer > 180) {
        windTarget = (Math.random() - 0.5) * 0.8
        windTimer = 0
      }
      windShift += (windTarget - windShift) * 0.005

      // Draw background
      drawBackground(ctx, W, H)

      // Spawn petals
      if (petals.length < 100 && Math.random() < 0.4) {
        petals.push(createPetal())
      }

      // Update & draw petals
      petals = petals.filter(p => {
        p.wobblePhase += p.wobbleSpeed
        p.x += p.wind + windShift + Math.sin(p.wobblePhase) * 0.5
        p.y += p.speed
        p.rotation += p.rotationSpeed
        if (p.y > H + 30) return false
        if (p.x < -50 || p.x > W + 50) return false
        drawPetal(ctx, p)
        return true
      })

      animId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full"
      style={{ zIndex: 0, pointerEvents: 'none' }}
    />
  )
}
