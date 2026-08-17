'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

export interface HeroBannerProps {
  /** Optional title rendered centered over the banner. Omit for an image-only hero. */
  title?: string
  /** One or more full-cover background images. Multiple images auto-rotate as a slideshow. */
  backgroundImages: string[]
  /** Enable the slow Ken-Burns pan/zoom motion. */
  animated?: boolean
  /** Show a dark gradient overlay so the title stays readable. */
  overlay?: boolean
  /** Interval between slides in ms (only when more than one image). */
  intervalMs?: number
  /** Aspect / height utility classes for the banner box. */
  className?: string
}

// Single reusable hero banner used across Gift Cards, Mobile Recharge,
// Digital Currency and Roulette. It is fully responsive: the card never
// overflows on mobile, the image always covers, and the optional title is
// clamped so it can never spill outside the card.
export default function HeroBanner({
  title,
  backgroundImages,
  animated = true,
  overlay = true,
  intervalMs = 4500,
  className = 'aspect-[16/9] min-h-[200px] sm:aspect-[16/7] sm:min-h-[300px]',
}: HeroBannerProps) {
  const images = backgroundImages.length ? backgroundImages : ['/gift-cards/giftcards-bg.jpg']
  const [active, setActive] = useState(0)

  useEffect(() => {
    if (images.length <= 1) return
    const id = window.setInterval(() => {
      setActive((prev) => (prev + 1) % images.length)
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [images.length, intervalMs])

  return (
    <div
      className="relative w-full max-w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
      style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 22px 60px rgba(0,0,0,0.45)' }}
    >
      <div className={`relative w-full ${className}`}>
        {images.map((src, index) => (
          <div
            key={src}
            aria-hidden={index !== active}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: active === index ? 1 : 0 }}
          >
            <Image
              src={src}
              alt={title ? title : ''}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className={`object-cover ${animated ? 'hero-banner-motion' : ''}`}
              priority={index === 0}
            />
          </div>
        ))}

        {/* soft purple glow always present */}
        <div aria-hidden className="gift-hero-glow absolute inset-0" />

        {overlay && (
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(11,3,25,0.12) 0%, rgba(11,3,25,0.35) 55%, rgba(11,3,25,0.72) 100%)',
            }}
          />
        )}

        {title && (
          <div className="absolute inset-0 flex items-center justify-center overflow-hidden p-6 text-center">
            <h1
              className="hero-banner-title title-gold-purple-shine font-black"
              translate="no"
              style={{ textShadow: '0 2px 18px rgba(0,0,0,0.55)' }}
            >
              {title}
            </h1>
          </div>
        )}

        {images.length > 1 && (
          <div className="absolute left-4 right-4 bottom-4 z-10 flex items-center justify-center gap-2">
            {images.map((src, index) => (
              <button
                key={src}
                type="button"
                aria-label={`Show slide ${index + 1}`}
                onClick={() => setActive(index)}
                className="h-2.5 rounded-full border transition-all"
                style={{
                  width: active === index ? 32 : 10,
                  background: active === index ? 'linear-gradient(135deg, #fcd34d, #c084fc)' : 'rgba(255,255,255,0.22)',
                  borderColor: active === index ? 'rgba(251,191,36,0.6)' : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
