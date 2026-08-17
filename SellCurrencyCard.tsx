'use client'

import ProductHeroCard from '@/components/ProductHeroCard'
import { useT } from '@/context/LanguageContext'

// Digital Currency marketplace card — minimal premium hero banner style.
export default function SellCurrencyCard() {
  const t = useT()
  return (
    <ProductHeroCard
      minimal
      image="/currency/bybit.jpg"
      images={[
        '/currency/bybit.jpg',
        '/currency/binance.jpg',
        '/currency/wise.jpg',
        '/currency/redotpay.jpg',
        '/currency/pyypl.jpg',
        '/currency/visa.jpg',
      ]}
      eyebrow=""
      title={t('home.sell.title')}
      description=""
      features={[]}
      ctaLabel={t('common.buyNow')}
      href="/sell"
      accent="rgba(168,85,247,0.9)"
    />
  )
}
