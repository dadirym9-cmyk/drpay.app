'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { openHappySeedsLogin } from '@/lib/auth-popup'

export default function GoogleAuthButton({ label = 'Continue with Google', next = '/' }: { label?: string; next?: string }) {
  const router = useRouter()
  const { refresh } = useAuth()
  const [loading, setLoading] = useState(false)

  function handleClick() {
    setLoading(true)
    const popup = openHappySeedsLogin(async () => {
      await refresh()
      setLoading(false)
      router.push(next)
    }, next)
    // Popup blocked — fall back to full-tab redirect.
    if (!popup) {
      window.location.href = `/api/auth/google/login?next=${encodeURIComponent(next)}`
      return
    }
    // Safety: re-enable if the popup is closed without completing.
    const check = window.setInterval(() => {
      if (popup.closed) {
        window.clearInterval(check)
        setLoading(false)
      }
    }, 600)
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="w-full py-3 rounded-2xl font-semibold text-base flex items-center justify-center gap-3 transition-all duration-300"
      style={{
        background: 'rgba(255,255,255,0.95)',
        color: '#3c2f2f',
        border: '1px solid rgba(167,139,250,0.3)',
        boxShadow: '0 8px 24px rgba(88,28,135,0.25)',
        opacity: loading ? 0.7 : 1,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
        <path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/>
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
      </svg>
      {loading ? 'Opening Google…' : label}
    </button>
  )
}
