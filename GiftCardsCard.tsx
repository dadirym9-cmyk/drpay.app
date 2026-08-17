'use client'

import { useEffect, useState } from 'react'
import ProductHeroCard from '@/components/ProductHeroCard'
import { useT } from '@/context/LanguageContext'

interface Burst { id: number; x: number; y: number }

// Official gift-card artwork rotated as the home hero background slideshow.
const SLIDES = [
  '/gift-cards/home/netflix.jpg',
  '/gift-cards/home/bigo.jpg',
  '/gift-cards/home/likee.jpg',
  '/gift-cards/home/liveme.jpg',
  '/gift-cards/home/temu.jpg',
  '/gift-cards/home/efootball.jpg',
]

export default function GiftCardsCard() {
  const t = useT()
  const [bursts, setBursts] = useState<Burst[]>([])

  // Preload every slide once so background swaps never flash or lag.
  useEffect(() => {
    SLIDES.forEach((src) => {
      const img = new window.Image()
      img.src = src
    })
  }, [])

  function onClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = Date.now()
    setBursts((b) => [...b, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 700)
  }

  return (
    <ProductHeroCard
      minimal
      image={SLIDES[0]}
      images={SLIDES}
      eyebrow={t('home.giftCards.eyebrow')}
      title={t('home.giftCards.title')}
      description=""
      features={[]}
      ctaLabel={t('common.buyNow')}
      href="/gift-cards"
      accent="rgba(251,191,36,0.9)"
      onClick={onClick}
    >
      {bursts.map((bu) => (
        <span key={bu.id} className="bingo-card-burst z-20" style={{ left: bu.x, top: bu.y }}>
          {[...Array(10)].map((_, i) => (
            <span key={i} style={{ ['--a' as string]: `${i * 36}deg`, background: ['#fbbf24', '#f43f5e', '#a855f7', '#34d399', '#38bdf8'][i % 5] }} />
          ))}
        </span>
      ))}
    </ProductHeroCard>
  )
}
