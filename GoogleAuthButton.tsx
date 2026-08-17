'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { openHappySeedsLogin } from '@/lib/auth-popup'
import { Capacitor } from '@capacitor/core'
import { Browser } from '@capacitor/browser'

export default function GoogleAuthButton({ label = 'Continue with Google', next = '/' }: { label?: string; next?: string }) {
  const router = useRouter()
  const { refresh } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)

    // 📱 إذا كان المستخدم داخل تطبيق الأندرويد، يفتح المتصفح الآمن لكاباسيتور
    if (Capacitor.isNativePlatform()) {
      try {
        const authUrl = `https://drpay.online{encodeURIComponent(next)}`;
        await Browser.open({ url: authUrl });
        
        // استماع لإغلاق المتصفح وعمل تحديث للجلسة
        Browser.addListener('browserFinished', async () => {
          await refresh()
          router.push(next)
          setLoading(false)
        });
      } catch (error) {
        console.error(error)
        setLoading(false)
      }
      return
    }

    // 🌐 إذا كان في موقع الويب العادي، يشتغل الكود القديم تلقائياً
    const popup = openHappySeedsLogin(async () => {
      await refresh()
      setLoading(false)
      router.push(next)
    })

    if (!popup) {
      window.location.href = `https://drpay.online{encodeURIComponent(next)}`
      return
    }

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
        background: 'rgba(255,255,255,0.05)',
        color: '#3c2f2f',
        border: '1px solid rgba(167,139,250,0.3)',
        boxShadow: '0 8px 24px rgba(88,28,135,0.25)',
        opacity: loading ? 0.7 : 1,
        cursor: loading ? 'not-allowed' : 'pointer',
      }}
    >
      {loading ? 'Loading...' : label}
    </button>
  )
}
