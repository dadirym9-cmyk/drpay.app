'use client'

import { useState } from 'react'
import ProductHeroCard from '@/components/ProductHeroCard'
import { useT } from '@/context/LanguageContext'

interface Burst { id: number; x: number; y: number }

export default function MobileRechargeCard() {
  const t = useT()
  const [bursts, setBursts] = useState<Burst[]>([])

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setBursts(b => [...b, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setBursts(b => b.filter(x => x.id !== id)), 700)
  }

  return (
    <ProductHeroCard
      minimal
      image="/gift-cards/mobile-bg.jpg"
      eyebrow={t('home.recharge.eyebrow')}
      title={t('home.recharge.title')}
      description=""
      features={[]}
      ctaLabel={t('common.buyNow')}
      href="/mobile-recharge"
      accent="rgba(16,185,129,0.9)"
      onClick={onClick}
    >
      {bursts.map(bu => (
        <span key={bu.id} className="bingo-card-burst z-20" style={{ left: bu.x, top: bu.y }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ ['--a' as string]: `${i * 36}deg`, background: ['#10b981', '#fbbf24', '#a855f7', '#34d399', '#38bdf8'][i % 5] }} />
          ))}
        </span>
      ))}
    </ProductHeroCard>
  )
}
