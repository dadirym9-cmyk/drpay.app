import Image from 'next/image'
import Link from 'next/link'

interface Props {
  size?: number       // rendered px size
  href?: string       // wrap in Link if set
  className?: string
}

/**
 * DR luxury signature logo.
 * The PNG has a white background; mix-blend-mode:screen makes white
 * completely transparent on dark surfaces, revealing only the purple ink.
 */
export default function DrLogo({ size = 48, href = '/', className = '' }: Props) {
  const img = (
    <span
      className={`inline-flex items-center justify-center flex-shrink-0 ${className}`}
      style={{
        width: size,
        height: size,
        mixBlendMode: 'screen',
        filter: 'drop-shadow(0 0 10px rgba(168,85,247,0.7)) brightness(1.15)',
      }}
    >
      <Image
        src="/dr-logo.png"
        alt="DR"
        width={size}
        height={size}
        style={{ objectFit: 'contain', display: 'block' }}
        priority
      />
    </span>
  )

  if (!href) return img
  return (
    <Link href={href} className="flex items-center select-none" aria-label="DR — Home">
      {img}
    </Link>
  )
}
