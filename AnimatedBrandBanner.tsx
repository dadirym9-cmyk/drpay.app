'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

export interface AnimatedBrandBannerProps {
  /** Full-cover background image (official brand artwork). */
  image: string
  /** Accessible label / alt text for the artwork. */
  alt?: string
  /** RGB triplet (e.g. "236,72,153") used to tint particles + glow to the brand. */
  accentRgb?: string
  /** Optional centered title rendered over the banner. */
  title?: string
  /** Height/aspect utility classes for the banner box. */
  className?: string
}

// A few fixed particle definitions so the layout is deterministic (no hydration
// mismatch) yet feels organic. Positions are percentages; delays/durations vary.
const PARTICLES = [
  { left: '8%', top: '68%', size: 6, delay: '0s', dur: '6.5s' },
  { left: '20%', top: '30%', size: 4, delay: '1.4s', dur: '7.5s' },
  { left: '33%', top: '78%', size: 5, delay: '2.6s', dur: '6s' },
  { left: '47%', top: '22%', size: 3, delay: '0.8s', dur: '8s' },
  { left: '58%', top: '60%', size: 6, delay: '3.2s', dur: '7s' },
  { left: '69%', top: '35%', size: 4, delay: '1.9s', dur: '6.8s' },
  { left: '80%', top: '72%', size: 5, delay: '2.2s', dur: '7.6s' },
  { left: '90%', top: '40%', size: 3, delay: '0.4s', dur: '8.4s' },
  { left: '14%', top: '48%', size: 4, delay: '4s', dur: '7.2s' },
  { left: '74%', top: '18%', size: 5, delay: '3.6s', dur: '6.4s' },
]

// Premium animated brand hero banner:
//  • Ken Burns slow zoom on the artwork
//  • gentle left/right parallax that also follows the pointer
//  • soft glowing particles tinted to the brand accent
//  • a moving light-reflection sweep
//  • a 40–60% dark overlay so overlaid text stays readable
// Everything is CSS-driven (GPU transforms), loops seamlessly, is responsive,
// and honors prefers-reduced-motion.
export default function AnimatedBrandBanner({
  image,
  alt = '',
  accentRgb = '168,85,247',
  title,
  className = 'aspect-[16/9] min-h-[190px] sm:aspect-[16/7] sm:min-h-[300px]',
}: AnimatedBrandBannerProps) {
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const [shift, setShift] = useState(0)

  // Subtle pointer parallax (desktop). Falls back to the pure CSS drift on touch.
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let frame = 0
    function onMove(e: PointerEvent) {
      const rect = el!.getBoundingClientRect()
      const rel = (e.clientX - rect.left) / rect.width - 0.5 // -0.5..0.5
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setShift(rel * 18)) // max ±9px
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', () => setShift(0))
    return () => {
      cancelAnimationFrame(frame)
      el.removeEventListener('pointermove', onMove)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      className="brand-banner relative w-full max-w-full overflow-hidden rounded-[1.75rem] sm:rounded-[2rem]"
      style={{ border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 22px 60px rgba(0,0,0,0.45)' }}
    >
      <div className={`relative w-full ${className}`}>
        {/* Artwork: parallax wrapper (pointer) + CSS Ken Burns drift on the image */}
        <div
          className="absolute inset-[-6%] transition-transform duration-500 ease-out"
          style={{ transform: `translate3d(${shift}px,0,0)` }}
          aria-hidden={!!title}
        >
          <Image
            src={image}
            alt={title ? '' : alt}
            fill
            sizes="(max-width: 768px) 100vw, 820px"
            className="brand-banner-kenburns object-cover"
            priority
          />
        </div>

        {/* Brand-tinted glow that softly pulses */}
        <div
          aria-hidden
          className="brand-banner-glow absolute inset-0"
          style={{
            background: `radial-gradient(circle at 22% 24%, rgba(${accentRgb},0.30), transparent 44%), radial-gradient(circle at 82% 80%, rgba(${accentRgb},0.24), transparent 48%)`,
          }}
        />

        {/* Dark readability overlay (≈40–60%) */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(9,2,20,0.40) 0%, rgba(9,2,20,0.48) 55%, rgba(9,2,20,0.60) 100%)',
          }}
        />

        {/* Moving light-reflection sweep */}
        <div aria-hidden className="brand-banner-sweep absolute inset-0" />

        {/* Soft glowing particles */}
        <div aria-hidden className="absolute inset-0 overflow-hidden">
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="brand-banner-particle"
              style={{
                left: p.left,
                top: p.top,
                width: p.size,
                height: p.size,
                animationDelay: p.delay,
                animationDuration: p.dur,
                background: `radial-gradient(circle, rgba(255,255,255,0.95), rgba(${accentRgb},0.85) 60%, transparent 72%)`,
                boxShadow: `0 0 10px 2px rgba(${accentRgb},0.55)`,
              }}
            />
          ))}
        </div>

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
      </div>
    </div>
  )
}
