'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useT } from '@/context/LanguageContext'

const SECTIONS = [
  {
    href: '/dashboard',
    labelKey: 'pnav.myOrders',
    descKey: 'pnav.myOrdersDesc',
    image: '/profile/orders-bg.jpg',
  },
  {
    href: '/dashboard/gift-cards',
    labelKey: 'pnav.giftCards',
    descKey: 'pnav.giftCardsDesc',
    image: '/profile/giftcards-bg.jpg',
  },
  {
    href: '/dashboard/mobile-recharge',
    labelKey: 'pnav.recharge',
    descKey: 'pnav.rechargeDesc',
    image: '/profile/recharge-bg.jpg',
  },
] as const

export default function ProfileOrderNav() {
  const t = useT()
  const pathname = usePathname()

  return (
    <div className="mb-8 flex flex-col gap-6 sm:grid sm:grid-cols-3">
      {SECTIONS.map((section) => {
        const active = pathname === section.href
        return (
          <Link
            key={section.href}
            href={section.href}
            className="group relative block w-full max-w-full overflow-hidden rounded-[28px] transition-all"
            style={{
              minHeight: '9rem',
              border: active ? '1px solid rgba(251,191,36,0.5)' : '1px solid rgba(167,139,250,0.22)',
              boxShadow: active
                ? '0 0 0 1px rgba(251,191,36,0.18), 0 16px 40px rgba(88,28,135,0.35)'
                : '0 14px 34px rgba(0,0,0,0.4)',
            }}
          >
            {/* Full background image */}
            <Image
              src={section.image}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
            {/* Dark overlay so text stays readable */}
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background: active
                  ? 'linear-gradient(160deg, rgba(76,29,149,0.55), rgba(0,0,0,0.5))'
                  : 'rgba(0,0,0,0.45)',
                backdropFilter: 'blur(3px)',
                WebkitBackdropFilter: 'blur(3px)',
              }}
            />
            {/* Text above the image */}
            <div className="relative z-10 flex h-full flex-col justify-end gap-1 p-5" style={{ minHeight: '9rem' }}>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#fcd34d]" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}>
                {t(section.labelKey)}
              </p>
              <p
                className="text-sm font-semibold"
                style={{ color: active ? '#f5f3ff' : 'rgba(245,243,255,0.85)', textShadow: '0 1px 8px rgba(0,0,0,0.6)' }}
              >
                {t(section.descKey)}
              </p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
