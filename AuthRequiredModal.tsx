'use client'

import Link from 'next/link'
import { useT } from '@/context/LanguageContext'

interface Props {
  open: boolean
  onClose: () => void
  redirect?: string
  title?: string
  message?: string
}

/**
 * Friendly prompt shown when a visitor tries to perform an action that
 * requires an account (placing an order, paying, wallet, etc.).
 * Browsing stays open — this only appears on gated actions.
 */
export default function AuthRequiredModal({
  open,
  onClose,
  redirect = '/',
  title,
  message,
}: Props) {
  const t = useT()
  if (!open) return null

  const resolvedTitle = title ?? t('modal.signInContinue')
  const resolvedMessage = message ?? t('modal.needAccount')

  const loginHref = `/auth/login?redirect=${encodeURIComponent(redirect)}`
  const registerHref = `/auth/register`

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(20,8,40,0.72)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'float-up 0.25s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-sm rounded-3xl p-8 text-center"
        style={{
          background: 'rgba(30,15,55,0.92)',
          backdropFilter: 'blur(28px)',
          border: '1px solid rgba(167,139,250,0.3)',
          boxShadow: '0 24px 70px rgba(88,28,135,0.6)',
        }}
      >
        <div
          className="mx-auto mb-5 flex items-center justify-center rounded-2xl"
          style={{
            width: 64,
            height: 64,
            background: 'linear-gradient(135deg, #E91E8C, #9B59B6)',
            boxShadow: '0 8px 28px rgba(168,85,247,0.5)',
          }}
        >
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>

        <h2 className="text-xl font-black mb-2" style={{ color: '#f5f3ff' }}>{resolvedTitle}</h2>
        <p className="text-sm mb-6" style={{ color: 'rgba(196,181,253,0.75)', lineHeight: 1.6 }}>{resolvedMessage}</p>

        <div className="flex flex-col gap-3">
          <Link href={loginHref} className="btn-primary w-full py-3 text-base justify-center">
            {t('modal.logIn')}
          </Link>
          <Link
            href={registerHref}
            className="w-full py-3 rounded-2xl font-semibold text-base transition-all duration-300"
            style={{
              background: 'rgba(168,85,247,0.12)',
              border: '1px solid rgba(168,85,247,0.35)',
              color: '#c084fc',
            }}
          >
            {t('modal.createFree')}
          </Link>
          <button
            onClick={onClose}
            className="text-sm font-medium mt-1"
            style={{ color: 'rgba(196,181,253,0.55)', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            {t('modal.keepBrowsing')}
          </button>
        </div>
      </div>
    </div>
  )
}
