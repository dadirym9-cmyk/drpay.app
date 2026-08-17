'use client'

import { useState, useRef, useCallback } from 'react'
import { formatUsd } from '@/lib/lotto-types'

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

// Map a cents value to a premium ball/ticket color, mirroring reward tiers.
function tierColor(cents: number, fallback?: string | null): string {
  if (fallback) return fallback
  if (cents >= 10000) return '#ef4444'
  if (cents >= 5000) return '#f59e0b'
  if (cents >= 1000) return '#a855f7'
  if (cents >= 200) return '#3b82f6'
  if (cents >= 100) return '#22c55e'
  return '#38bdf8'
}

// A glossy 3D numbered lottery ball rendered purely with CSS gradients.
function NumberBall({ color, label, size, className, style }: { color: string; label: string; size: number; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`bingo-ball ${className ?? ''}`} style={{ width: size, height: size, ['--ball-color' as string]: color, ...style }}>
      <div className="bingo-ball-face">
        <span className="bingo-ball-num" translate="no">{label}</span>
      </div>
    </div>
  )
}

const SPIN_MS = 3200
const EXIT_MS = 1600

export default function BingoMachine({ rewards, canPlay, playCost, points, requestSpin, onWin }: Props) {
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'selected' | 'exit'>('idle')
  const [error, setError] = useState('')
  const [winner, setWinner] = useState<Won | null>(null)
  const busy = useRef(false)

  // Balls floating inside the main glass sphere.
  const innerBalls = rewards.length
    ? rewards.slice(0, 12)
    : [{ id: 0, label: '', valueCents: 100, color: '#22c55e' }]

  // Coupon tiers shown in the separate glass container below.
  const slots = rewards.slice(0, 6)

  const handlePlay = useCallback(async () => {
    if (busy.current || !canPlay) return
    busy.current = true
    setError('')
    setWinner(null)
    setPhase('spinning')

    const start = Date.now()
    const result = await requestSpin()
    if ('error' in result) {
      setPhase('idle')
      setError(result.error)
      busy.current = false
      return
    }

    const elapsed = Date.now() - start
    if (elapsed < SPIN_MS) await new Promise(r => setTimeout(r, SPIN_MS - elapsed))

    setWinner(result)
    setPhase('selected')
    // Beat while the winning ball is highlighted before it travels the tube.
    await new Promise(r => setTimeout(r, 700))
    setPhase('exit')
    await new Promise(r => setTimeout(r, EXIT_MS))

    setPhase('idle')
    busy.current = false
    onWin(result)
  }, [canPlay, requestSpin, onWin])

  const winColor = winner ? tierColor(winner.reward.valueCents, winner.reward.color) : '#fbbf24'
  const spinning = phase === 'spinning'
  const active = phase !== 'idle'
  const showWin = winner && (phase === 'selected' || phase === 'exit')

  return (
    <div className="bingo-stage">
      {/* soft ambient glow behind the machine */}
      <div className={`bingo-ambient ${active ? 'on' : ''}`} />

      <div className={`bingo-machine ${active ? 'bingo-machine-on' : ''}`}>
        {/* ── Glass chamber holding the tumbling balls ── */}
        <div className="bingo-chamber">
          <div className="bingo-sphere-wrap">
            <div className={`bingo-sphere ${spinning ? 'spin' : ''}`}>
              <div className={`bingo-sphere-inner ${spinning ? 'spin-fast' : ''}`}>
                {innerBalls.map((b, i) => {
                  const c = tierColor(b.valueCents, b.color)
                  const isWinner = phase === 'selected' && winner?.reward.id === b.id && i === innerBalls.findIndex(x => x.id === winner?.reward.id)
                  // Hide the winning ball once it has entered the tube.
                  const hidden = phase === 'exit' && winner?.reward.id === b.id && i === innerBalls.findIndex(x => x.id === winner?.reward.id)
                  return (
                    <NumberBall
                      key={`${b.id}-${i}`}
                      color={c}
                      label={String((i + 1)).padStart(2, '0')}
                      size={i % 3 === 0 ? 38 : 30}
                      className={`bingo-inner-ball ib-${i} ${isWinner ? 'is-winner' : ''} ${hidden ? 'is-hidden' : ''}`}
                    />
                  )
                })}
              </div>
              <div className="bingo-sphere-glass" />
              <div className="bingo-sphere-highlight" />
              {spinning && [...Array(5)].map((_, i) => (
                <span key={i} className="bingo-spark" style={{ left: `${18 + i * 14}%`, animationDelay: `${i * 0.3}s` }} />
              ))}
            </div>

            {/* single exit tube — bottom-right, glass with inner glow */}
            <div className={`bingo-tube ${phase === 'exit' ? 'active' : ''}`}>
              <div className="bingo-tube-glow" />
              {phase === 'exit' && winner && (
                <NumberBall color={winColor} label="" size={26} className="bingo-tube-ball travelling" />
              )}
            </div>
          </div>
        </div>

        {/* ── Metallic mid-body: brand + winner display ── */}
        <div className="bingo-body">
          <div className="bingo-brand">
            <span className="bingo-brand-dr" translate="no">DR</span><span className="bingo-brand-pay" translate="no">PAY</span>
            <span className="bingo-brand-tag">BINGO</span>
          </div>

          <div className={`bingo-display ${showWin ? 'win' : ''}`} style={winner ? { ['--win-color' as string]: winColor } : undefined}>
            {/* winning ball drops into this section then disappears into the machine */}
            {phase === 'exit' && winner && (
              <NumberBall color={winColor} label={formatUsd(winner.reward.valueCents)} size={44} className="bingo-drop-ball" />
            )}
            {showWin ? (
              <div className="flex items-center gap-3 w-full justify-center">
                <div className="text-center leading-tight">
                  <p className="bingo-display-winner">WINNER!</p>
                  <p className="bingo-display-sub" style={{ color: winColor }} translate="no">{formatUsd(winner!.reward.valueCents)} COUPON</p>
                </div>
              </div>
            ) : spinning ? (
              <p className="bingo-display-idle">DRAWING<span className="bingo-dots" /></p>
            ) : (
              <p className="bingo-display-idle">INSERT {playCost} POINTS TO PLAY</p>
            )}
          </div>

          <div className="bingo-base" />
        </div>
      </div>

      {/* ── Separate glass coupon container (gap above) ── */}
      <div className="bingo-coupon-case">
        <div className="bingo-coupon-case-label">PRIZE COUPONS</div>
        <div className="bingo-coupon-grid">
          {(slots.length ? slots : innerBalls).slice(0, 6).map((r, i) => {
            const c = tierColor(r.valueCents, r.color)
            return (
              <div key={r.id ?? i} className="bingo-coupon" style={{ ['--slot-color' as string]: c }}>
                <div className="bingo-coupon-top">
                  <span className="bingo-coupon-num" translate="no">{String(i + 1).padStart(2, '0')}</span>
                  <span className="bingo-coupon-tag">COUPON</span>
                </div>
                <div className="bingo-coupon-value" translate="no">{formatUsd(r.valueCents)}</div>
                <div className="bingo-coupon-bars"><span /><span /><span /><span /></div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Cost + points + Play */}
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
      </div>

      {error && <p className="text-sm font-semibold mb-3 text-center" style={{ color: '#f87171' }}>{error}</p>}

      <button
        onClick={handlePlay}
        disabled={!canPlay || active}
        className="bingo-play-btn"
      >
        {spinning ? (
          <><svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>Drawing...</>
        ) : (
          <><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="9" /><path d="M12 3a9 9 0 0 0 0 18" /></svg>Play — {playCost} Points</>
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
