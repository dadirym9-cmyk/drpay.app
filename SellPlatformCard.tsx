'use client'

import { useState } from 'react'
import Image from 'next/image'
import type { SellPlatform } from '@/lib/sell-platforms'
import { useT } from '@/context/LanguageContext'

interface Props {
  platform: SellPlatform
  selected: boolean
  onSelect: () => void
}

export default function SellPlatformCard({ platform, selected, onSelect }: Props) {
  const t = useT()
  const [hovered, setHovered] = useState(false)
  const active = selected || hovered
  const glowStrong = platform.glow.replace('0.55', '0.95').replace('0.5', '0.95')

  return (
    <button
      type="button"
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="card-glow-border relative rounded-2xl overflow-hidden text-left transition-all duration-400"
      style={{
        '--glow-border': glowStrong,
        background: 'rgba(13,1,24,0.8)',
        border: selected
          ? `1.5px solid ${platform.glow.replace('0.55', '0.85').replace('0.5', '0.85')}`
          : '1px solid rgba(167,139,250,0.2)',
        boxShadow: active
          ? `0 18px 48px ${platform.glow}, inset 0 1px 0 rgba(255,255,255,0.08)`
          : '0 6px 24px rgba(88,28,135,0.28)',
        transform: active ? 'translateY(-5px) scale(1.02)' : 'none',
        cursor: 'pointer',
      } as React.CSSProperties}
    >
      {/* animated image */}
      <div className="relative overflow-hidden" style={{ height: '140px' }}>
        <Image
          src={platform.image}
          alt={platform.name}
          fill
          sizes="(max-width: 640px) 100vw, 33vw"
          className="sell-kenburns"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
            transform: hovered ? 'scale(1.12)' : undefined,
            transition: 'transform 0.7s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />

        {/* animated sheen sweep */}
        <div className="sell-sheen absolute inset-0" style={{ opacity: active ? 1 : 0.5 }} />

        {/* moving particles */}
        <span className="sell-particle" style={{ left: '18%', top: '30%', animationDelay: '0s' }} />
        <span className="sell-particle" style={{ left: '62%', top: '20%', animationDelay: '1.1s' }} />
        <span className="sell-particle" style={{ left: '80%', top: '60%', animationDelay: '2.2s' }} />
        <span className="sell-particle" style={{ left: '40%', top: '70%', animationDelay: '0.6s' }} />

        {/* tint + glow */}
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(13,1,24,0.55))' }} />
        <div className="absolute inset-0 transition-opacity duration-500" style={{ background: `radial-gradient(ellipse at center, ${platform.glow.replace('0.55','0.18').replace('0.5','0.18')}, transparent 70%)`, opacity: active ? 1 : 0 }} />

        {/* accent bar */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-500" style={{ background: platform.accent, opacity: active ? 1 : 0.6, boxShadow: active ? `0 0 12px ${platform.glow}` : 'none' }} />

        {/* selected check */}
        {selected && (
          <div className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 0 14px rgba(16,185,129,0.6)' }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><path d="M20 6 9 17l-5-5" /></svg>
          </div>
        )}
      </div>

      <div className="p-3.5 flex items-center justify-between gap-2" style={{ background: selected ? 'rgba(16,185,129,0.06)' : 'transparent' }}>
        <div className="min-w-0">
          <p className="text-sm font-black truncate" style={{ color: '#f5f3ff' }} translate="no">{platform.name}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: 'rgba(196,181,253,0.55)' }}>{platform.detailLabel}</p>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0" style={{ background: selected ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.12)', color: selected ? '#6ee7b7' : '#c084fc' }}>
          {selected ? t('sell.selected') : t('sell.select')}
        </span>
      </div>
    </button>
  )
}
