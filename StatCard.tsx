'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

export interface StatCardData {
  label: string
  value: string
  image: string
  color: string
  delay: string
  /** Optional extra cinematic taglines cycled after the main stat. */
  taglines?: string[]
}

interface Slide { value: string; label: string }

// Premium animated advertisement-style statistic card.
// The content inside cycles through the headline stat and short cinematic
// taglines: each slide flies in with 3D depth, holds, then fades out while the
// background keeps its slow Ken Burns motion. Loops forever.
export default function StatCard({ stat }: { stat: StatCardData }) {
  // Build the loop: the main stat first, then any premium taglines.
  const slides: Slide[] = [
    { value: stat.value, label: stat.label },
    ...(stat.taglines ?? []).map((t) => ({ value: t, label: stat.label })),
  ]

  const [index, setIndex] = useState(0)
  const [phase, setPhase] = useState<'in' | 'out'>('in')

  useEffect(() => {
    if (slides.length < 2) return
    let outTimer: ReturnType<typeof setTimeout>
    // Hold each slide for a few seconds, fade out, then advance.
    const holdTimer = setTimeout(() => {
      setPhase('out')
      outTimer = setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length)
        setPhase('in')
      }, 620)
    }, 3200)
    return () => { clearTimeout(holdTimer); clearTimeout(outTimer) }
  }, [index, slides.length])

  const current = slides[index]
  const single = slides.length < 2

  return (
    <div
      className="stat-card group relative rounded-2xl overflow-hidden"
      style={{
        minHeight: '150px',
        border: `1px solid ${stat.color}33`,
        boxShadow: `0 10px 40px rgba(0,0,0,0.4)`,
        animation: `float-card 5s ${stat.delay} ease-in-out infinite`,
        ['--stat-glow' as string]: stat.color,
      }}
    >
      {/* Animated background image with slow zoom */}
      <Image
        src={stat.image}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, 25vw"
        className="stat-card-img object-cover"
        aria-hidden
      />

      {/* Color wash + readability gradient */}
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, rgba(13,1,24,0.35), rgba(13,1,24,0.82))` }} />
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 50% 120%, ${stat.color}44, transparent 65%)` }} />

      {/* Moving light sweep */}
      <div className="stat-card-sweep absolute inset-0 pointer-events-none" />

      {/* Under-card neon glow bar */}
      <div className="stat-card-glow absolute -bottom-6 left-1/2 -translate-x-1/2 pointer-events-none" style={{ width: '75%', height: '24px', background: stat.color }} />

      {/* Floating particles */}
      {[
        { l: '18%', t: '28%', d: '0s' },
        { l: '72%', t: '22%', d: '1.3s' },
        { l: '58%', t: '64%', d: '2.1s' },
        { l: '30%', t: '70%', d: '0.7s' },
      ].map((p, i) => (
        <span key={i} className="stat-particle" style={{ left: p.l, top: p.t, animationDelay: p.d, background: stat.color, boxShadow: `0 0 8px ${stat.color}` }} />
      ))}

      {/* Top reflection line */}
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${stat.color}, transparent)` }} />

      {/* Cinematic looping content */}
      <div className="stat-stage relative z-10 h-full flex flex-col items-center justify-center text-center px-3 py-5">
        <div
          key={index}
          className={`stat-slide ${single ? 'stat-slide-static' : phase === 'in' ? 'stat-slide-in' : 'stat-slide-out'}`}
        >
          <div
            className="stat-value stat-3d font-black leading-none mb-1"
            style={{
              fontSize: current.value.length > 8 ? 'clamp(1.05rem, 3.2vw, 1.5rem)' : 'clamp(1.7rem, 4vw, 2.3rem)',
              fontFamily: 'var(--font-nunito), Nunito, sans-serif',
              background: `linear-gradient(135deg, #ffffff, ${stat.color})`,
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              ['--stat-shadow' as string]: `${stat.color}`,
            }}
            translate="no"
          >
            {current.value}
          </div>
          <div className="stat-cap text-xs font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.85)', textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            {current.label}
          </div>
        </div>

        {/* Progress dots for the loop */}
        {!single && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1.5">
            {slides.map((_, i) => (
              <span key={i} className="stat-dot" style={{ background: i === index ? stat.color : 'rgba(255,255,255,0.28)', boxShadow: i === index ? `0 0 6px ${stat.color}` : 'none' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
