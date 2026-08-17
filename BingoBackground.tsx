// Clean premium gradient background for the BINGO page: dark purple/blue
// with a soft glow behind the machine. No decorative pattern.
export default function BingoBackground() {
  return (
    <div className="fixed inset-0 w-full h-full" style={{ zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {/* deep gradient base */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(165deg, #0b0620 0%, #120a2e 42%, #0a0a24 78%, #070512 100%)' }} />
      {/* soft central glow behind the machine */}
      <div style={{ position: 'absolute', top: '8%', left: '50%', width: '80vw', maxWidth: '820px', height: '60vh', transform: 'translateX(-50%)', background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.28), rgba(168,85,247,0.14) 42%, transparent 70%)', filter: 'blur(60px)' }} />
      {/* subtle vignette for depth */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 45%, rgba(4,2,12,0.6) 100%)' }} />
    </div>
  )
}
