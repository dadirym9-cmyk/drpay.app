'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { GAMES } from '@/lib/games'

const GAME_BANNERS: Record<string, string> = {
  'pubg-mobile': '/games/pubg-mobile.jpg',
  'free-fire': '/games/free-fire.jpg',
  'yalla-ludo': '/games/yalla-ludo.jpg',
  '8-ball-pool': '/games/8-ball-pool.jpg',
  'call-of-duty-mobile': '/games/call-of-duty-mobile.jpg',
}

const GAME_GLOW: Record<string, string> = {
  'pubg-mobile': '#f97316',
  'free-fire': '#ef4444',
  'yalla-ludo': '#10b981',
  '8-ball-pool': '#6366f1',
  'call-of-duty-mobile': '#f59e0b',
}

const GAME_TAGLINES: Record<string, string> = {
  'pubg-mobile': 'Top up UC instantly',
  'free-fire': 'Get your Diamonds now',
  'yalla-ludo': 'Power up with Diamonds',
  '8-ball-pool': 'Get Pool Cash fast',
  'call-of-duty-mobile': 'Load up on CP instantly',
}

// Games to spotlight as premium featured cards get a richer treatment.
const FEATURED = new Set(['call-of-duty-mobile'])

const SLIDES = GAMES.map(g => ({
  slug: g.slug,
  name: g.name,
  banner: GAME_BANNERS[g.slug],
  glow: GAME_GLOW[g.slug] || '#a855f7',
  tagline: GAME_TAGLINES[g.slug] || 'Top up instantly',
  packages: g.packages.length,
  featured: FEATURED.has(g.slug),
}))

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [prev, setPrev] = useState(-1)
  const [direction, setDirection] = useState<'next' | 'prev'>('next')
  const [animating, setAnimating] = useState(false)
  const [paused, setPaused] = useState(false)

  const goTo = useCallback((idx: number, dir: 'next' | 'prev' = 'next') => {
    if (animating || idx === current) return
    setDirection(dir)
    setPrev(current)
    setAnimating(true)
    setCurrent(idx)
    setTimeout(() => {
      setPrev(-1)
      setAnimating(false)
    }, 600)
  }, [animating, current])

  const next = useCallback(() => {
    goTo((current + 1) % SLIDES.length, 'next')
  }, [current, goTo])

  const prevSlide = useCallback(() => {
    goTo((current - 1 + SLIDES.length) % SLIDES.length, 'prev')
  }, [current, goTo])

  useEffect(() => {
    if (paused) return
    const interval = setInterval(next, 4500)
    return () => clearInterval(interval)
  }, [next, paused])

  const slide = SLIDES[current]

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl"
      style={{
        height: 'clamp(280px, 40vw, 480px)',
        border: '1px solid rgba(167, 139, 250, 0.2)',
        boxShadow: `0 0 60px rgba(88, 28, 135, 0.4), 0 20px 60px rgba(0,0,0,0.5)`,
      }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Slides */}
      {SLIDES.map((s, i) => {
        const isActive = i === current
        const isPrev = i === prev

        return (
          <div
            key={s.slug}
            className="absolute inset-0"
            style={{
              opacity: isActive ? 1 : isPrev ? 1 : 0,
              transform: isActive
                ? 'scale(1) translateX(0)'
                : isPrev
                  ? direction === 'next' ? 'scale(0.96) translateX(-3%)' : 'scale(0.96) translateX(3%)'
                  : direction === 'next' ? 'scale(1.04) translateX(3%)' : 'scale(1.04) translateX(-3%)',
              transition: isActive
                ? 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                : isPrev
                  ? 'all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                  : 'none',
              zIndex: isActive ? 2 : isPrev ? 1 : 0,
            }}
          >
            <Image
              src={s.banner}
              alt={s.name}
              fill
              sizes="100vw"
              style={{ objectFit: 'cover', objectPosition: 'center top' }}
              priority={i === 0}
            />

            {/* Multi-layer overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at bottom left, ${s.glow}22 0%, transparent 60%)`,
              }}
            />
          </div>
        )
      })}

      {/* Premium featured overlays (light sweep + floating particles + glass halo) */}
      {slide.featured && (
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 8 }}>
          <div className="hero-featured-sweep absolute inset-0" />
          <div className="absolute inset-0" style={{ boxShadow: `inset 0 0 90px ${slide.glow}44`, borderRadius: '24px' }} />
          {[
            { l: '12%', t: '30%', d: '0s' }, { l: '84%', t: '24%', d: '1.4s' },
            { l: '68%', t: '70%', d: '2.3s' }, { l: '24%', t: '76%', d: '0.8s' },
            { l: '50%', t: '18%', d: '1.9s' }, { l: '92%', t: '58%', d: '3s' },
          ].map((p, i) => (
            <span key={i} className="hero-particle" style={{ left: p.l, top: p.t, animationDelay: p.d, background: slide.glow, boxShadow: `0 0 10px ${slide.glow}` }} />
          ))}
        </div>
      )}

      {/* Content layer */}
      <div
        className="absolute inset-0 flex flex-col justify-center px-8 sm:px-14"
        style={{ zIndex: 10 }}
      >
        {/* Tag */}
        <div
          className="inline-flex items-center gap-2 mb-4 self-start"
          key={`tag-${current}`}
          style={{
            animation: 'float-up 0.5s 0.1s ease both',
            padding: '4px 14px',
            borderRadius: '999px',
            background: 'rgba(0,0,0,0.4)',
            backdropFilter: 'blur(8px)',
            border: `1px solid ${slide.glow}55`,
            color: slide.glow,
            fontSize: '0.75rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{ background: slide.glow, boxShadow: `0 0 6px ${slide.glow}` }}
          />
          {slide.packages} Packages Available
        </div>

        {/* Featured spotlight badge */}
        {slide.featured && (
          <div
            key={`feat-${current}`}
            className="hero-featured-badge inline-flex items-center gap-1.5 mb-3 self-start"
            style={{
              padding: '4px 12px', borderRadius: '999px',
              background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)',
              border: `1px solid ${slide.glow}`, color: '#fff',
              fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
              boxShadow: `0 0 20px ${slide.glow}66`,
              animation: 'float-up 0.5s 0.15s ease both',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill={slide.glow} stroke="none"><path d="M12 2l2.9 6.3 6.9.7-5.2 4.6 1.5 6.8L12 17.6 5.9 20.4l1.5-6.8L2.2 9l6.9-.7z"/></svg>
            Featured
          </div>
        )}

        {/* Title */}
        <h1
          key={`title-${current}`}
          className="font-black leading-none mb-3"
          style={{
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            color: '#f5f3ff',
            textShadow: `0 0 30px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.8)`,
            animation: 'float-up 0.5s 0.2s ease both',
          }}
        >
          {slide.name}
        </h1>

        {/* Tagline */}
        <p
          key={`tag2-${current}`}
          className="font-medium mb-6"
          style={{
            fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
            color: 'rgba(255,255,255,0.75)',
            animation: 'float-up 0.5s 0.3s ease both',
          }}
        >
          {slide.tagline}
        </p>

        {/* CTA */}
        <div
          key={`cta-${current}`}
          className="flex items-center gap-3"
          style={{ animation: 'float-up 0.5s 0.4s ease both' }}
        >
          <Link
            href={`/games/${slide.slug}`}
            className="btn-glass inline-flex items-center gap-2 font-bold"
            style={{ fontSize: '0.95rem' }}
          >
            Top Up Now
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </Link>
        </div>
      </div>

      {/* Left/Right arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-200 group"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.3rem',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.3)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.5)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.4)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
        }}
      >
        ‹
      </button>
      <button
        onClick={next}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-200"
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          color: 'rgba(255,255,255,0.8)',
          fontSize: '1.3rem',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.3)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(168,85,247,0.5)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.4)'
          ;(e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)'
        }}
      >
        ›
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-20">
        {SLIDES.map((s, i) => (
          <button
            key={i}
            onClick={() => goTo(i, i > current ? 'next' : 'prev')}
            className="transition-all duration-400 rounded-full"
            style={{
              width: i === current ? '28px' : '8px',
              height: '8px',
              background: i === current ? slide.glow : 'rgba(255,255,255,0.35)',
              boxShadow: i === current ? `0 0 10px ${slide.glow}` : 'none',
            }}
          />
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="absolute bottom-0 left-0 h-0.5 z-20"
        style={{
          background: `linear-gradient(90deg, ${slide.glow}, #a855f7)`,
          boxShadow: `0 0 8px ${slide.glow}`,
          animation: paused ? 'none' : 'none',
          width: `${((current + 1) / SLIDES.length) * 100}%`,
          transition: 'width 0.5s ease, background 0.5s ease',
        }}
      />
    </div>
  )
}
