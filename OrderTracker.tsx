'use client'

import { useT } from '@/context/LanguageContext'

interface Props {
  status: string
}

const STEPS = [
  {
    key: 'Payment Pending',
    labelKey: 'track.payment',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>
      </svg>
    ),
  },
  {
    key: 'Top-Up In Progress',
    labelKey: 'track.processing',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="m13 2-3 6.5h4L10 22"/>
      </svg>
    ),
  },
  {
    key: 'Top-Up Completed',
    labelKey: 'track.completed',
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M20 6 9 17l-5-5"/>
      </svg>
    ),
  },
]

export default function OrderTracker({ status }: Props) {
  const t = useT()
  const isRejected = status === 'Rejected'

  function getStepStatus(stepKey: string): 'completed' | 'active' | 'pending' {
    const order = STEPS.map(s => s.key)
    const statusIdx = order.indexOf(status)
    const stepIdx = order.indexOf(stepKey)
    if (statusIdx === -1) return 'pending'
    if (stepIdx < statusIdx) return 'completed'
    if (stepIdx === statusIdx) return 'active'
    return 'pending'
  }

  if (isRejected) {
    return (
      <div
        className="flex items-center gap-3 py-3 px-4 rounded-2xl"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'rgba(239,68,68,0.15)', border: '1.5px solid rgba(239,68,68,0.4)', color: '#f87171' }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M18 6 6 18M6 6l12 12"/>
          </svg>
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: '#f87171' }}>{t('track.rejected')}</p>
          <p className="text-xs" style={{ color: 'rgba(248,113,113,0.65)' }}>{t('track.rejectedBody')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center py-3 gap-0">
      {STEPS.map((step, idx) => {
        const state = getStepStatus(step.key)
        return (
          <div key={step.key} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              {/* Circle */}
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all duration-500"
                style={
                  state === 'completed'
                    ? {
                        background: 'rgba(52,211,153,0.2)',
                        borderColor: '#34d399',
                        boxShadow: '0 0 12px rgba(52,211,153,0.4)',
                        color: '#34d399',
                      }
                    : state === 'active'
                    ? {
                        background: 'rgba(251,191,36,0.2)',
                        borderColor: '#fbbf24',
                        boxShadow: '0 0 12px rgba(251,191,36,0.4)',
                        animation: 'pulse-glow 1.5s ease-in-out infinite',
                        color: '#fbbf24',
                      }
                    : {
                        background: 'rgba(255,255,255,0.04)',
                        borderColor: 'rgba(167,139,250,0.2)',
                        color: 'rgba(167,139,250,0.25)',
                      }
                }
              >
                {state === 'completed' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6 9 17l-5-5"/>
                  </svg>
                ) : (
                  step.icon
                )}
              </div>
              {/* Label */}
              <p
                className="text-xs mt-1.5 text-center font-semibold"
                style={{
                  maxWidth: '64px',
                  color:
                    state === 'completed'
                      ? '#34d399'
                      : state === 'active'
                      ? '#fbbf24'
                      : 'rgba(167,139,250,0.4)',
                }}
              >
                {t(step.labelKey)}
              </p>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div
                className="h-0.5 flex-1 mx-1 transition-all duration-500"
                style={{
                  background:
                    getStepStatus(STEPS[idx + 1].key) !== 'pending' || state === 'completed'
                      ? 'linear-gradient(90deg, #34d399, #fbbf24)'
                      : 'rgba(167,139,250,0.12)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
