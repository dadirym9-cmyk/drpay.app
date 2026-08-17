'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  angle: number
  pulse: number
  pulseSpeed: number
  color: string
}

interface Nebula {
  x: number
  y: number
  r: number
  color: string
  alpha: number
  drift: number
  driftPhase: number
}

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  twinkleSpeed: number
  twinklePhase: number
}

const PARTICLE_COLORS = [
  'rgba(167, 139, 250,',   // violet
  'rgba(139, 92, 246,',    // purple
  'rgba(196, 181, 253,',   // lavender
  'rgba(221, 214, 254,',   // light purple
  'rgba(232, 121, 249,',   // pink-purple
  'rgba(192, 132, 252,',   // medium purple
]

export default function CosmicBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let particles: Particle[] = []
    let nebulas: Nebula[] = []
    let stars: Star[] = []
    let energyWavePhase = 0
    let time = 0

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initNebulas()
      initStars()
    }

    function initNebulas() {
      if (!canvas) return
      nebulas = []
      const W = canvas.width
      const H = canvas.height
      const nebulaData = [
        { x: W * 0.15, y: H * 0.25, r: W * 0.3, color: '138, 43, 226', alpha: 0.08 },
        { x: W * 0.85, y: H * 0.7, r: W * 0.28, color: '147, 51, 234', alpha: 0.07 },
        { x: W * 0.5, y: H * 0.5, r: W * 0.35, color: '168, 85, 247', alpha: 0.06 },
        { x: W * 0.75, y: H * 0.15, r: W * 0.22, color: '192, 132, 252', alpha: 0.05 },
        { x: W * 0.2, y: H * 0.8, r: W * 0.25, color: '232, 121, 249', alpha: 0.06 },
        { x: W * 0.6, y: H * 0.3, r: W * 0.2, color: '126, 34, 206', alpha: 0.07 },
      ]
      nebulas = nebulaData.map(n => ({ ...n, drift: 0, driftPhase: Math.random() * Math.PI * 2 }))
    }

    function initStars() {
      if (!canvas) return
      stars = []
      const count = Math.min(180, Math.floor((canvas.width * canvas.height) / 8000))
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: 0.5 + Math.random() * 2,
          opacity: 0.3 + Math.random() * 0.7,
          twinkleSpeed: 0.01 + Math.random() * 0.03,
          twinklePhase: Math.random() * Math.PI * 2,
        })
      }
    }

    function initParticles() {
      if (!canvas) return
      particles = []
      const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 18000))
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(true))
      }
    }

    function createParticle(anywhere = false): Particle {
      if (!canvas) return {} as Particle
      return {
        x: anywhere ? Math.random() * canvas.width : Math.random() * canvas.width,
        y: anywhere ? Math.random() * canvas.height : canvas.height + 10,
        size: 1.5 + Math.random() * 4,
        opacity: 0.2 + Math.random() * 0.6,
        speed: 0.1 + Math.random() * 0.4,
        angle: -Math.PI / 2 + (Math.random() - 0.5) * 0.8,
        pulse: 0,
        pulseSpeed: 0.02 + Math.random() * 0.04,
        color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
      }
    }

    resize()
    initParticles()
    window.addEventListener('resize', () => { resize(); initParticles() })

    function drawBackground() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height

      // Deep cosmic background
      const bg = ctx.createLinearGradient(0, 0, W * 0.3, H)
      bg.addColorStop(0, '#0d0118')
      bg.addColorStop(0.25, '#130024')
      bg.addColorStop(0.5, '#1a0030')
      bg.addColorStop(0.75, '#0f0020')
      bg.addColorStop(1, '#08000f')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Radial deep glow center
      const centerGlow = ctx.createRadialGradient(W * 0.5, H * 0.4, 0, W * 0.5, H * 0.4, W * 0.6)
      centerGlow.addColorStop(0, 'rgba(88, 28, 135, 0.35)')
      centerGlow.addColorStop(0.4, 'rgba(59, 7, 100, 0.2)')
      centerGlow.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = centerGlow
      ctx.fillRect(0, 0, W, H)
    }

    function drawNebulas() {
      if (!ctx) return
      nebulas.forEach(n => {
        n.driftPhase += 0.003
        const driftX = Math.sin(n.driftPhase) * 15
        const driftY = Math.cos(n.driftPhase * 0.7) * 10

        // Animated alpha
        const alpha = n.alpha + Math.sin(n.driftPhase * 1.3) * (n.alpha * 0.3)

        const grad = ctx.createRadialGradient(
          n.x + driftX, n.y + driftY, 0,
          n.x + driftX, n.y + driftY, n.r
        )
        grad.addColorStop(0, `rgba(${n.color}, ${alpha * 2.5})`)
        grad.addColorStop(0.4, `rgba(${n.color}, ${alpha * 1.2})`)
        grad.addColorStop(0.7, `rgba(${n.color}, ${alpha * 0.5})`)
        grad.addColorStop(1, `rgba(${n.color}, 0)`)
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.arc(n.x + driftX, n.y + driftY, n.r, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    function drawStars() {
      if (!ctx) return
      stars.forEach(s => {
        s.twinklePhase += s.twinkleSpeed
        const currentOpacity = s.opacity * (0.5 + 0.5 * Math.sin(s.twinklePhase))

        ctx.save()
        ctx.globalAlpha = currentOpacity
        ctx.fillStyle = '#ffffff'
        ctx.shadowBlur = s.size > 1.5 ? 4 : 2
        ctx.shadowColor = 'rgba(196, 181, 253, 0.8)'
        ctx.beginPath()
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      })
    }

    function drawEnergyWaves() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height
      energyWavePhase += 0.008

      // Horizontal energy lines
      for (let i = 0; i < 3; i++) {
        const y = H * (0.2 + i * 0.3) + Math.sin(energyWavePhase + i * 2.1) * 40
        const alpha = 0.03 + Math.sin(energyWavePhase * 1.5 + i) * 0.02

        const waveGrad = ctx.createLinearGradient(0, y, W, y)
        waveGrad.addColorStop(0, `rgba(167, 139, 250, 0)`)
        waveGrad.addColorStop(0.3, `rgba(167, 139, 250, ${alpha})`)
        waveGrad.addColorStop(0.5, `rgba(192, 132, 252, ${alpha * 1.5})`)
        waveGrad.addColorStop(0.7, `rgba(167, 139, 250, ${alpha})`)
        waveGrad.addColorStop(1, `rgba(167, 139, 250, 0)`)

        ctx.beginPath()
        ctx.strokeStyle = waveGrad
        ctx.lineWidth = 1
        ctx.globalAlpha = 1
        ctx.moveTo(0, y)
        for (let x = 0; x <= W; x += 5) {
          const waveY = y + Math.sin((x / W) * Math.PI * 6 + energyWavePhase * 3 + i) * 8
          ctx.lineTo(x, waveY)
        }
        ctx.stroke()
      }
    }

    function drawParticles() {
      if (!canvas || !ctx) return
      const H = canvas.height

      particles = particles.filter(p => {
        if (p.y < -20) return false
        p.pulse += p.pulseSpeed
        p.x += Math.cos(p.angle) * p.speed
        p.y += Math.sin(p.angle) * p.speed

        const glowSize = p.size * (1 + 0.3 * Math.sin(p.pulse))
        const alpha = p.opacity * (0.7 + 0.3 * Math.sin(p.pulse))

        ctx.save()
        ctx.globalAlpha = alpha
        ctx.shadowBlur = glowSize * 6
        ctx.shadowColor = `${p.color}0.8)`
        ctx.fillStyle = `${p.color}${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        return true
      })

      // Spawn new particles from bottom
      if (particles.length < 60 && Math.random() < 0.25) {
        particles.push(createParticle(false))
      }
    }

    function drawLightBeams() {
      if (!canvas || !ctx) return
      const W = canvas.width
      const H = canvas.height
      time += 0.005

      // Subtle light beams from top
      const beams = [
        { x: W * 0.2, alpha: 0.04 + Math.sin(time) * 0.02 },
        { x: W * 0.6, alpha: 0.03 + Math.sin(time * 1.3 + 1) * 0.015 },
        { x: W * 0.85, alpha: 0.035 + Math.sin(time * 0.8 + 2) * 0.02 },
      ]

      beams.forEach(beam => {
        const grad = ctx.createLinearGradient(beam.x, 0, beam.x, H * 0.7)
        grad.addColorStop(0, `rgba(167, 139, 250, ${beam.alpha * 2})`)
        grad.addColorStop(0.5, `rgba(139, 92, 246, ${beam.alpha})`)
        grad.addColorStop(1, `rgba(139, 92, 246, 0)`)

        ctx.save()
        ctx.globalAlpha = 1
        ctx.fillStyle = grad
        ctx.beginPath()
        ctx.moveTo(beam.x - 80, 0)
        ctx.lineTo(beam.x + 80, 0)
        ctx.lineTo(beam.x + 200, H * 0.7)
        ctx.lineTo(beam.x - 200, H * 0.7)
        ctx.closePath()
        ctx.fill()
        ctx.restore()
      })
    }

    function tick() {
      if (!canvas || !ctx) return
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      drawBackground()
      drawNebulas()
      drawLightBeams()
      drawEnergyWaves()
      drawStars()
      drawParticles()

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
