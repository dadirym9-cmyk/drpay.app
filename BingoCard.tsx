'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Burst { id: number; x: number; y: number }

// Premium animated BINGO promo card: rainbow neon border, floating balls,
// particles, and a click burst. Links to the BINGO machine.
export default function BingoCard() {
  const [hovered, setHovered] = useState(false)
  const [bursts, setBursts] = useState<Burst[]>([])

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setBursts(b => [...b, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setBursts(b => b.filter(x => x.id !== id)), 700)
  }

  const balls = [
    { c: '#ef4444', n: '75', l: '8%', t: '18%', d: '0s' },
    { c: '#fbbf24', n: '21', l: '78%', t: '22%', d: '0.6s' },
    { c: '#a855f7', n: '46', l: '20%', t: '62%', d: '1.1s' },
    { c: '#3b82f6', n: '09', l: '66%', t: '64%', d: '1.6s' },
  ]

  return (
    <Link
      href="/bingo"
      onClick={onClick}
      className="bingo-card relative rounded-2xl overflow-hidden cursor-pointer block"
      style={{ transform: hovered ? 'translateY(-6px) scale(1.01)' : 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="bingo-card-neon" />
      <div className="relative overflow-hidden" style={{ height: '200px', background: 'radial-gradient(ellipse at 50% 30%, rgba(88,28,135,0.5), rgba(13,1,24,0.95))' }}>
        {/* floating balls */}
        {balls.map((b, i) => (
          <div key={i} className="bingo-card-ball" style={{ left: b.l, top: b.t, ['--bc' as string]: b.c, animationDelay: b.d }}>
            <span translate="no">{b.n}</span>
          </div>
        ))}
        {/* twinkle particles */}
        {[...Array(8)].map((_, i) => (
          <span key={i} className="bingo-card-particle" style={{ left: `${(i * 13 + 6) % 100}%`, top: `${(i * 29 + 10) % 90}%`, animationDelay: `${i * 0.35}s` }} />
        ))}

        {/* NEW badge */}
        <div className="absolute top-3 left-3 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', border: '1px solid rgba(251,191,36,0.6)', color: '#fde68a' }}>
          Win Coupons
        </div>

        {/* center title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 pointer-events-none">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3" style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(10px)' }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18M3 12h18"/></svg>
          </div>
          <h3 className="bingo-card-title font-black leading-none" style={{ fontSize: '2.4rem' }} translate="no">BINGO</h3>
        </div>

        {/* click bursts */}
        {bursts.map(bu => (
          <span key={bu.id} className="bingo-card-burst" style={{ left: bu.x, top: bu.y }}>
            {[...Array(10)].map((_, i) => (
              <span key={i} style={{ ['--a' as string]: `${i * 36}deg`, background: ['#fbbf24', '#f43f5e', '#a855f7', '#34d399', '#38bdf8'][i % 5] }} />
            ))}
          </span>
        ))}
      </div>

      {/* card body */}
      <div className="p-5 flex items-center justify-between gap-4 relative" style={{ background: 'rgba(13,1,24,0.85)' }}>
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-xl leading-tight mb-1 truncate" style={{ color: hovered ? '#f5f3ff' : '#e9d5ff', transition: 'color 0.3s' }}>
            DRPAY Bingo Machine
          </h3>
          <p className="text-sm" style={{ color: 'rgba(196, 181, 253, 0.6)' }}>
            Spin to win real coupons from $0.50 to $100
          </p>
        </div>
        <span className="flex-shrink-0" style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.3rem',
          borderRadius: '9999px', fontWeight: 700, fontSize: '0.88rem', color: 'white',
          background: hovered ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)',
          boxShadow: hovered ? '0 0 20px rgba(251,191,36,0.4), inset 0 1px 0 rgba(255,255,255,0.15)' : 'inset 0 1px 0 rgba(255,255,255,0.08)',
          transition: 'all 0.3s ease', whiteSpace: 'nowrap',
          border: hovered ? '1.5px solid rgba(251,191,36,0.7)' : '1.5px solid rgba(255,255,255,0.15)',
        }}>
          Play Now
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
        </span>
      </div>
    </Link>
  )
}
