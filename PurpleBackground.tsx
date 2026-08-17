export default function PurpleBackground() {
  return (
    <div
      className="fixed inset-0 w-full h-full"
      style={{
        zIndex: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      {/* Base image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/bg-cosmic.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          animation: 'bg-breathe 24s ease-in-out infinite',
        }}
      />
      {/* Dark overlay — makes content readable without hiding the swirl */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(135deg, rgba(10,1,22,0.72) 0%, rgba(19,0,36,0.60) 40%, rgba(10,1,22,0.68) 100%)',
        }}
      />
      {/* Vignette edges */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at center, transparent 40%, rgba(8,0,16,0.55) 100%)',
        }}
      />
    </div>
  )
}
