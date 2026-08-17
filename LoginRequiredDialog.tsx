'use client'

import Link from 'next/link'
import { useT } from '@/context/LanguageContext'

// Reusable "Login Required" dialog shown when a guest tries to place an order.
// Kept generic so every gift-card / checkout flow can share the same experience.
export default function LoginRequiredDialog({
  open,
  onClose,
  returnTo,
}: {
  open: boolean
  onClose: () => void
  /** Path to come back to after auth (e.g. /gift-cards/netflix). */
  returnTo?: string
}) {
  const t = useT()
  if (!open) return null

  const redirect = returnTo ? `?redirect=${encodeURIComponent(returnTo)}` : ''

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-0 sm:p-6">
      <button
        type="button"
        aria-label={t('common.close')}
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('modal.loginRequired')}
        className="relative z-10 w-full sm:max-w-md overflow-hidden rounded-t-[1.75rem] sm:rounded-[2rem] border shadow-2xl"
        style={{
          background: 'linear-gradient(180deg, rgba(36,12,68,0.98), rgba(14,4,28,0.99))',
          borderColor: 'rgba(167,139,250,0.28)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
        }}
      >
        <div className="p-6 sm:p-8">
          <div
            className="flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(251,191,36,0.18), rgba(168,85,247,0.22))',
              border: '1px solid rgba(251,191,36,0.3)',
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fcd34d" strokeWidth="2.2">
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>

          <h2 className="mt-5 text-2xl font-black" style={{ color: '#fdf4ff' }}>{t('modal.loginRequired')}</h2>
          <p className="mt-3 text-sm leading-7" style={{ color: 'rgba(221,214,254,0.82)' }}>
            {t('modal.loginRequiredBody')}
          </p>

          <div className="mt-7 flex flex-col gap-3.5">
            <Link href={`/auth/login${redirect}`} className="btn-primary w-full min-h-[3.25rem] justify-center py-3.5">
              {t('modal.signIn')}
            </Link>
            <Link href={`/auth/register${redirect}`} className="btn-secondary w-full min-h-[3.25rem] justify-center py-3.5">
              {t('modal.createAccount')}
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 text-sm font-bold"
              style={{ color: 'rgba(196,181,253,0.7)' }}
            >
              {t('modal.keepBrowsing')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
