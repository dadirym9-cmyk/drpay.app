'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Game } from '@/lib/games'
import { useT } from '@/context/LanguageContext'

interface Props {
  game: Game
}

const GAME_BANNERS: Record<string, string> = {
  'pubg-mobile': '/games/pubg-mobile.jpg',
  'free-fire': '/games/free-fire.jpg',
  'yalla-ludo': '/games/yalla-ludo.jpg',
  '8-ball-pool': '/games/8-ball-pool.jpg',
  'call-of-duty-mobile': '/games/call-of-duty-mobile.jpg',
}

const GAME_GLOW: Record<string, string> = {
  'pubg-mobile': 'rgba(251, 146, 60, 0.5)',
  'free-fire': 'rgba(239, 68, 68, 0.5)',
  'yalla-ludo': 'rgba(52, 211, 153, 0.5)',
  '8-ball-pool': 'rgba(99, 102, 241, 0.5)',
  'call-of-duty-mobile': 'rgba(250, 204, 21, 0.5)',
}

const GAME_ACCENT: Record<string, string> = {
  'pubg-mobile': 'linear-gradient(135deg, #f97316, #eab308)',
  'free-fire': 'linear-gradient(135deg, #ef4444, #f97316)',
  'yalla-ludo': 'linear-gradient(135deg, #10b981, #06b6d4)',
  '8-ball-pool': 'linear-gradient(135deg, #6366f1, #3b82f6)',
  'call-of-duty-mobile': 'linear-gradient(135deg, #facc15, #d97706)',
}

export default function GameCard({ game }: Props) {
  const t = useT()
  const [hovered, setHovered] = useState(false)
  const banner = GAME_BANNERS[game.slug]
  const glowColor = GAME_GLOW[game.slug] || 'rgba(168, 85, 247, 0.4)'
  const accent = GAME_ACCENT[game.slug] || 'linear-gradient(135deg, #a855f7, #7c3aed)'

  return (
    <div
      className="card-glow-border relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
      style={{
        background: 'rgba(13, 1, 24, 0.8)',
        '--glow-border': glowColor.replace('0.5', '0.95'),
        border: hovered
          ? `1px solid ${glowColor.replace('0.5', '0.7')}`
          : '1px solid rgba(167, 139, 250, 0.2)',
        boxShadow: hovered
          ? `0 20px 60px ${glowColor}, 0 8px 30px rgba(88, 28, 135, 0.5), inset 0 1px 0 rgba(255,255,255,0.06)`
          : '0 8px 32px rgba(88, 28, 135, 0.3), inset 0 1px 0 rgba(255,255,255,0.04)',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)',
        backdropFilter: 'blur(20px)',
      } as React.CSSProperties}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Banner Image */}
      <div
        className="relative overflow-hidden"
        style={{ height: '200px' }}
      >
        <Image
          src={banner}
          alt={game.name}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
          priority
        />

        {/* Dark overlay gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.5) 100%)',
          }}
        />

        {/* Glow overlay on hover */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            background: `radial-gradient(ellipse at center, ${glowColor.replace('0.5', '0.15')}, transparent 70%)`,
            opacity: hovered ? 1 : 0,
          }}
        />

        {/* Top-right shimmer */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ opacity: hovered ? 1 : 0, transition: 'opacity 0.3s' }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '60%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
              animation: hovered ? 'shimmer 0.8s ease forwards' : 'none',
            }}
          />
        </div>

        {/* Packages badge */}
        <div
          className="absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full"
          style={{
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255,255,255,0.15)',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {t('games.packages', { n: game.packages.length })}
        </div>

        {/* Bottom accent line */}
        <div
          className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500"
          style={{
            background: accent,
            opacity: hovered ? 1 : 0.5,
            boxShadow: hovered ? `0 0 12px ${glowColor}` : 'none',
          }}
        />
      </div>

      {/* Card Body */}
      <div
        className="p-5 flex items-center justify-between gap-4"
        style={{
          background: hovered
            ? 'rgba(255, 255, 255, 0.03)'
            : 'transparent',
          transition: 'background 0.3s',
        }}
      >
        <div className="flex-1 min-w-0">
          <h3
            className="font-black text-xl leading-tight mb-1 truncate"
            style={{
              color: hovered ? '#f5f3ff' : '#e9d5ff',
              transition: 'color 0.3s',
            }}
          >
            {game.name}
          </h3>
          <p
            className="text-sm"
            style={{ color: 'rgba(196, 181, 253, 0.6)' }}
          >
            {t('games.instantSecure')}
          </p>
        </div>

        <Link
          href={`/games/${game.slug}`}
          onClick={e => e.stopPropagation()}
          className="flex-shrink-0"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.6rem 1.3rem',
            borderRadius: '9999px',
            fontWeight: 700,
            fontSize: '0.88rem',
            background: hovered ? `rgba(255,255,255,0.08)` : 'rgba(255,255,255,0.05)',
            color: 'white',
            boxShadow: hovered
              ? `0 0 20px ${glowColor.replace('0.5', '0.4')}, inset 0 1px 0 rgba(255,255,255,0.15)`
              : `inset 0 1px 0 rgba(255,255,255,0.08)`,
            transition: 'all 0.3s ease',
            border: hovered
              ? `1.5px solid ${glowColor.replace('0.5', '0.7')}`
              : '1.5px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(12px)',
            whiteSpace: 'nowrap',
          }}
        >
          {t('games.topUp')}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </Link>
      </div>

      {/* Corner glow accent */}
      <div
        className="absolute top-0 left-0 w-20 h-20 transition-opacity duration-500"
        style={{
          background: `radial-gradient(circle at top left, ${glowColor.replace('0.5', '0.15')}, transparent 70%)`,
          opacity: hovered ? 1 : 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  )
}
