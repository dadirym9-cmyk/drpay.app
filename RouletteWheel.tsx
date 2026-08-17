'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { formatUsd } from '@/lib/lotto-types'
import { WHEEL_ORDER, pocketColor, couponNumbers, pocketAngle } from '@/lib/roulette'
import { startSpin, stopBall, ballLand, playWin, loadSoundPref, setSoundEnabled } from '@/lib/roulette-sound'

export interface Reward {
  id: number
  label: string
  valueCents: number
  color: string | null
}
export interface Won {
  reward: { id: number; label: string; valueCents: number; color: string | null }
  coupon: { code: string; valueCents: number; expiresAt: string | null }
}

interface Props {
  rewards: Reward[]
  canPlay: boolean
  playCost: number
  points: number
  onWin: (won: Won) => void
  requestSpin: () => Promise<Won | { error: string }>
}

const SPIN_MS = 4200
const SETTLE_MS = 900
const SIZE = 300
const CENTER = SIZE / 2
const R_OUTER = 146
const R_RIM = 124
const R_INNER = 96
const SLICE = 360 / WHEEL_ORDER.length

function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = ((deg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

// Build one pocket wedge path between two radii.
function wedge(startDeg: number, endDeg: number, rOut: number, rIn: number) {
  const p1 = polar(CENTER, CENTER, rOut, startDeg)
  const p2 = polar(CENTER, CENTER, rOut, endDeg)
  const p3 = polar(CENTER, CENTER, rIn, endDeg)
  const p4 = polar(CENTER, CENTER, rIn, startDeg)
  return `M ${p1.x} ${p1.y} A ${rOut} ${rOut} 0 0 1 ${p2.x} ${p2.y} L ${p3.x} ${p3.y} A ${rIn} ${rIn} 0 0 0 ${p4.x} ${p4.y} Z`
}

const COLORS = { red: '#c31432', black: '#1a1a24', green: '#0f7a3d' }

export default function RouletteWheel({ rewards, canPlay, playCost, points, requestSpin, onWin }: Props) {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'won'>('idle')
  const [error, setError] = useState('')
  const [winner, setWinner] = useState<Won | null>(null)
  const [wheelDeg, setWheelDeg] = useState(0)
  const [ballDeg, setBallDeg] = useState(0)
  const [landed, setLanded] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const busy = useRef(false)

  // Load the persisted sound preference on mount.
  useEffect(() => { setSoundOn(loadSoundPref()) }, [])

  const toggleSound = useCallback(() => {
    setSoundOn(prev => {
      const next = !prev
      setSoundEnabled(next)
      return next
    })
  }, [])

  // Coupon tiers shown as luxury golden coupons below the wheel.
  const slots = rewards.slice(0, 6)

  const handlePlay = useCallback(async () => {
    if (busy.current || !canPlay) return
    busy.current = true
    setError('')
    setWinner(null)
    setLanded(false)
    setPhase('spinning')

    const start = Date.now()
    const result = await requestSpin()
    if ('error' in result) {
      setPhase('idle')
      setError(result.error)
      busy.current = false
      return
    }

    // Start the spin whoosh + rolling ball sound once the spin is confirmed.
    startSpin(SPIN_MS)

    // The server chose the reward. Land the ball on that coupon's red number.
    const nums = couponNumbers(result.reward.id)
    const targetAngle = pocketAngle(nums.red)

    // Wheel spins several turns clockwise; ball spins the opposite way and
    // settles so the target pocket ends up under the top pointer.
    const wheelTurns = 6
    const finalWheel = wheelDeg - (wheelDeg % 360) + wheelTurns * 360 + (360 - targetAngle)
    const ballTurns = 9
    const finalBall = ballDeg - (ballDeg % 360) + ballTurns * 360

    // Trigger the CSS transition to the resting position.
    requestAnimationFrame(() => {
      setWheelDeg(finalWheel)
      setBallDeg(finalBall)
    })

    const elapsed = Date.now() - start
    if (elapsed < SPIN_MS) await new Promise(r => setTimeout(r, SPIN_MS - elapsed))
    setLanded(true)
    // Ball drops into the pocket: stop the roll and play the settling clicks.
    stopBall()
    ballLand()
    await new Promise(r => setTimeout(r, SETTLE_MS))

    setWinner(result)
    setPhase('won')
    busy.current = false
    playWin()
    onWin(result)
    // Reset to idle so the player can spin again.
    setTimeout(() => setPhase('idle'), 400)
  }, [canPlay, requestSpin, onWin, wheelDeg, ballDeg])

  const spinning = phase === 'spinning'
  const active = phase !== 'idle'
  const winNums = winner ? couponNumbers(winner.reward.id) : null

  return (
    <div className="roulette-stage">
      <div className={`roulette-ambient ${active ? 'on' : ''}`} />

      {/* ── The wheel ── */}
      <div className="roulette-table">
        <div className="roulette-pointer" aria-hidden />
        <div className="roulette-wheel-wrap">
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="roulette-svg" role="img" aria-label="Roulette wheel">
            <defs>
              <radialGradient id="rlt-rim" cx="50%" cy="42%" r="60%">
                <stop offset="0%" stopColor="#4a3a12" />
                <stop offset="55%" stopColor="#caa14a" />
                <stop offset="78%" stopColor="#fbe58a" />
                <stop offset="100%" stopColor="#8a6a1f" />
              </radialGradient>
              <radialGradient id="rlt-hub" cx="50%" cy="40%" r="60%">
                <stop offset="0%" stopColor="#fce8a0" />
                <stop offset="45%" stopColor="#d4af4f" />
                <stop offset="100%" stopColor="#6e551b" />
              </radialGradient>
              <radialGradient id="rlt-shade" cx="50%" cy="38%" r="70%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.35)" />
                <stop offset="55%" stopColor="rgba(255,255,255,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.5)" />
              </radialGradient>
            </defs>

            {/* golden outer rim */}
            <circle cx={CENTER} cy={CENTER} r={R_OUTER + 4} fill="url(#rlt-rim)" />
            <circle cx={CENTER} cy={CENTER} r={R_OUTER} fill="#0b0b14" />

            {/* rotating wheel group: pockets + numbers + hub */}
            <g style={{ transform: `rotate(${wheelDeg}deg)`, transformOrigin: 'center', transition: spinning || landed ? `transform ${SPIN_MS}ms cubic-bezier(0.16,0.62,0.24,1)` : 'none' }}>
              {WHEEL_ORDER.map((n, i) => {
                const a0 = i * SLICE - SLICE / 2
                const a1 = i * SLICE + SLICE / 2
                const c = pocketColor(n)
                const mid = polar(CENTER, CENTER, (R_RIM + R_INNER) / 2 + 8, i * SLICE)
                return (
                  <g key={n}>
                    <path d={wedge(a0, a1, R_RIM, R_INNER)} fill={COLORS[c]} stroke="#caa14a" strokeWidth={0.6} />
                    <text x={mid.x} y={mid.y} fill="#f5e9c8" fontSize="9" fontWeight="800" textAnchor="middle" dominantBaseline="central" transform={`rotate(${i * SLICE} ${mid.x} ${mid.y})`}>{n}</text>
                  </g>
                )
              })}
              {/* inner cone + hub */}
              <circle cx={CENTER} cy={CENTER} r={R_INNER} fill="#12121c" stroke="#caa14a" strokeWidth={1.5} />
              <circle cx={CENTER} cy={CENTER} r={R_INNER - 6} fill="url(#rlt-hub)" opacity={0.25} />
              <circle cx={CENTER} cy={CENTER} r={34} fill="url(#rlt-hub)" />
              <circle cx={CENTER} cy={CENTER} r={34} fill="url(#rlt-shade)" />
              {/* turret spokes */}
              {[0, 90, 180, 270].map(a => {
                const p = polar(CENTER, CENTER, 30, a)
                return <line key={a} x1={CENTER} y1={CENTER} x2={p.x} y2={p.y} stroke="#8a6a1f" strokeWidth={5} strokeLinecap="round" />
              })}
              <circle cx={CENTER} cy={CENTER} r={9} fill="#fce8a0" />
            </g>

            {/* glassy sheen overlay (static) */}
            <circle cx={CENTER} cy={CENTER} r={R_OUTER} fill="url(#rlt-shade)" opacity={0.5} pointerEvents="none" />
          </svg>

          {/* the ball orbiting the rim */}
          <div
            className={`roulette-ball-orbit ${landed ? 'landed' : ''}`}
            style={{ transform: `rotate(${ballDeg}deg)`, transition: spinning || landed ? `transform ${SPIN_MS}ms cubic-bezier(0.16,0.62,0.24,1)` : 'none' }}
          >
            <span className="roulette-ball" style={{ top: landed ? `${CENTER - R_RIM + 6}px` : `${CENTER - R_OUTER + 4}px` }} />
          </div>
        </div>

        {/* centre status readout */}
        <div className={`roulette-readout ${winner && phase !== 'spinning' ? 'win' : ''}`}>
          {spinning ? (
            <span className="roulette-readout-idle">SPINNING<span className="roulette-dots" /></span>
          ) : winner && winNums ? (
            <div className="roulette-readout-win">
              <span className="roulette-num black" translate="no">{winNums.black}</span>
              <span className="roulette-num red" translate="no">{winNums.red}</span>
              <span className="roulette-readout-value" translate="no">{formatUsd(winner.reward.valueCents)}</span>
            </div>
          ) : (
            <span className="roulette-readout-idle" translate="no">DRPAY ROULETTE</span>
          )}
        </div>
      </div>

      {/* ── Luxury golden coupons ── */}
      <div className="roulette-coupon-case">
        <div className="roulette-coupon-case-label">PRIZE COUPONS · MATCH A NUMBER TO WIN</div>
        <div className="roulette-coupon-grid">
          {(slots.length ? slots : [{ id: 1, label: '', valueCents: 500, color: null }]).map((r, i) => {
            const nums = couponNumbers(r.id)
            return (
              <div key={r.id ?? i} className="gold-coupon">
                <div className="gold-coupon-shine" />
                <div className="gold-coupon-value" translate="no">{formatUsd(r.valueCents)}</div>
                <div className="gold-coupon-label">COUPON</div>
                <div className="gold-coupon-nums">
                  <span className="gc-num gc-black" translate="no">{nums.black}</span>
                  <span className="gc-num gc-red" translate="no">{nums.red}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cost + points + sound toggle */}
      <div className="flex items-center gap-4 mt-6 mb-4">
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(196,181,253,0.5)' }}>Cost</p>
          <p className="font-black text-lg" style={{ color: '#fbbf24' }} translate="no">{playCost} pts</p>
        </div>
        <div className="w-px h-8" style={{ background: 'rgba(167,139,250,0.25)' }} />
        <div className="text-center">
          <p className="text-[11px] uppercase tracking-widest" style={{ color: 'rgba(196,181,253,0.5)' }}>Your Points</p>
          <p className="font-black text-lg" style={{ color: points >= playCost ? '#6ee7b7' : '#f87171' }} translate="no">{points}</p>
        </div>
        <div className="w-px h-8" style={{ background: 'rgba(167,139,250,0.25)' }} />
        <button
          type="button"
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? 'Sound on — click to mute' : 'Sound off — click to enable'}
          className="roulette-sound-btn"
          style={{
            borderColor: soundOn ? 'rgba(251,191,36,0.5)' : 'rgba(167,139,250,0.3)',
            color: soundOn ? '#fbbf24' : 'rgba(196,181,253,0.6)',
            boxShadow: soundOn ? '0 0 16px rgba(251,191,36,0.3)' : 'none',
          }}
        >
          {soundOn ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 5 6 9H2v6h4l5 4z"/><path d="M22 9l-6 6M16 9l6 6"/></svg>
          )}
          <span className="roulette-sound-label">{soundOn ? 'Sound On' : 'Muted'}</span>
        </button>
      </div>

      {error && <p className="text-sm font-semibold mb-3 text-center" style={{ color: '#f87171' }}>{error}</p>}

      <button onClick={handlePlay} disabled={!canPlay || active} className="roulette-play-btn">
        {spinning ? (
          <><svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Spinning...</>
        ) : (
          <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="2" /></svg>Spin — {playCost} Points</>
        )}
      </button>

      {!canPlay && !active && (
        <p className="text-xs mt-3 text-center" style={{ color: 'rgba(196,181,253,0.5)' }}>
          Earn more points from top-ups and currency purchases to play.
        </p>
      )}
    </div>
  )
}
