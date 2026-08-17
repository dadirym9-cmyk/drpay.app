'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export interface ProductHeroCardProps {
  /** Full-card background image (covers the entire card). */
  image: string
  /** Optional slideshow: when provided (2+), backgrounds auto-rotate. */
  images?: string[]
  /** Small uppercase eyebrow badge (e.g. "Featured brand"). */
  eyebrow: string
  title: string
  description: string
  /** Small pill feature badges shown under the description. */
  features: string[]
  /** Call-to-action label + destination. */
  ctaLabel: string
  href: string
  /** RGBA accent used for the eyebrow badge + glow (brand color). */
  accent?: string
  /** Optional click handler (e.g. for confetti burst). */
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  /** Optional extra layers rendered above the overlay (particles, bursts). */
  children?: React.ReactNode
  /** Minimal homepage style: only a gold shimmer title + single Buy Now CTA. */
  minimal?: boolean
}

// Reusable premium full-width hero card. The provided image fills the whole
// card (cover / center / no-repeat); a dark glass gradient overlay with a
// backdrop blur keeps the text readable. Every product card (Netflix, Bigo
// Live, Games, and future ones) shares this exact layout — only the image,
// copy, and link change.
export default function ProductHeroCard({
  image,
  images,
  eyebrow,
  title,
  description,
  features,
  ctaLabel,
  href,
  accent = 'rgba(251,191,36,0.9)',
  onClick,
  children,
  minimal = false,
}: ProductHeroCardProps) {
  const slides = images && images.length > 1 ? images : [image]
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const id = window.setInterval(() => setActive((p) => (p + 1) % slides.length), 4200)
    return () => window.clearInterval(id)
  }, [slides.length])

  return (
    <Link
      href={href}
      onClick={onClick}
      className="product-hero-card group relative block w-full max-w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
      style={{
        minHeight: minimal ? '13rem' : '17rem',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 22px 60px rgba(0,0,0,0.45)',
      }}
    >
      {/* Full-card background image(s) */}
      {slides.map((src, index) => (
        <div
          key={src}
          aria-hidden
          className={`absolute inset-0 transition-opacity duration-700 ease-out group-hover:scale-[1.06] ${slides.length > 1 && active === index ? 'product-hero-kenburns' : ''}`}
          style={{
            backgroundImage: `url(${src})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: active === index ? 1 : 0,
          }}
        />
      ))}

      {/* Light dark overlay — keep the image the main focus */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background: minimal
            ? 'linear-gradient(180deg, rgba(10,2,20,0.12) 0%, rgba(10,2,20,0.18) 45%, rgba(8,1,16,0.62) 100%)'
            : 'linear-gradient(180deg, rgba(10,2,20,0.35) 0%, rgba(10,2,20,0.62) 55%, rgba(8,1,16,0.9) 100%)',
          backdropFilter: minimal ? undefined : 'blur(2px)',
          WebkitBackdropFilter: minimal ? undefined : 'blur(2px)',
        }}
      />
      {/* Accent glow from the corner */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-60"
        style={{ background: `radial-gradient(circle at 88% 12%, ${accent.replace('0.9', '0.22')}, transparent 42%)` }}
      />

      {children}

      {/* Content above the overlay */}
      {minimal ? (
        <div className="relative z-10 flex h-full flex-col items-center justify-between gap-4 p-5 text-center" style={{ minHeight: '13rem' }}>
          <div className="flex flex-1 items-center justify-center">
            <h2 className="title-gold-purple-shine text-3xl sm:text-4xl font-black leading-tight" translate="no" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.5)' }}>
              {title}
            </h2>
          </div>
          <span className="btn-shimmer-purple">
            <span>{ctaLabel || 'Buy Now'}</span>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </div>
      ) : (
        <div className="relative z-10 flex h-full flex-col justify-end gap-4 p-6 sm:p-8" style={{ minHeight: '17rem' }}>
          <span
            className="inline-flex w-fit rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.24em]"
            style={{ borderColor: accent, background: 'rgba(0,0,0,0.35)', color: '#fde68a', backdropFilter: 'blur(6px)' }}
          >
            {eyebrow}
          </span>

          <div>
            <h2 className="text-3xl sm:text-4xl font-black leading-tight" style={{ color: '#ffffff', textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}>
              {title}
            </h2>
            <p className="mt-3 max-w-xl text-sm sm:text-base leading-7" style={{ color: 'rgba(245,243,255,0.9)', textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}>
              {description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em]">
            {features.map((item) => (
              <span
                key={item}
                className="rounded-full border px-3 py-1"
                style={{ borderColor: 'rgba(255,255,255,0.25)', background: 'rgba(0,0,0,0.35)', color: '#f5f3ff', backdropFilter: 'blur(6px)' }}
              >
                {item}
              </span>
            ))}
          </div>

          <span className="btn-primary mt-1 inline-flex w-fit items-center gap-2">
            {ctaLabel}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </span>
        </div>
      )}
    </Link>
  )
}
