'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/context/LanguageContext'
import LanguageSwitcher from '@/components/LanguageSwitcher'
import DrLogo from '@/components/DrLogo'

const IconMailbox = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 12h-6l-2 3h-4l-2-3H2"/>
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
  </svg>
)

const IconHome = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
)
const IconOrders = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
)
const IconSupport = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
  </svg>
)
const IconSignOut = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16,17 21,12 16,7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)
const IconTicket = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"/><path d="M13 5v14"/>
  </svg>
)

export default function Header() {
  const { user, loading, logout } = useAuth()
  const t = useT()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [unread, setUnread] = useState(0)
  const router = useRouter()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const loadUnread = useCallback(async () => {
    if (!user) { setUnread(0); return }
    try {
      const res = await fetch('/api/inbox/unread', { credentials: 'include' })
      const data = await res.json()
      setUnread(Number(data.unread) || 0)
    } catch { /* ignore */ }
  }, [user])

  useEffect(() => {
    loadUnread()
    if (!user) return
    // Refresh when the inbox updates, on tab focus, and periodically.
    const onUpdated = () => loadUnread()
    const onFocus = () => loadUnread()
    window.addEventListener('inbox:updated', onUpdated)
    window.addEventListener('focus', onFocus)
    const timer = setInterval(loadUnread, 30000)
    return () => {
      window.removeEventListener('inbox:updated', onUpdated)
      window.removeEventListener('focus', onFocus)
      clearInterval(timer)
    }
  }, [user, loadUnread])

  const unreadLabel = unread > 99 ? '99+' : `+${unread}`

  async function handleLogout() {
    setMenuOpen(false)
    await logout()
    router.push('/auth/login')
  }

  const navLinks = [
    { href: '/', label: t('nav.home'), Icon: IconHome, badge: 0 },
    { href: '/inbox', label: t('nav.mailbox'), Icon: IconMailbox, badge: unread },
    { href: '/my-codes', label: t('nav.myCodes'), Icon: IconTicket, badge: 0 },
    { href: '/dashboard', label: t('nav.myOrders'), Icon: IconOrders, badge: 0 },
    { href: '/#support', label: t('nav.support'), Icon: IconSupport, badge: 0 },
  ]

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ paddingTop: scrolled ? '8px' : '12px', paddingBottom: scrolled ? '4px' : '0' }}
      >
        <div
          className="mx-4 rounded-2xl px-5 py-3 flex items-center justify-between transition-all duration-500"
          style={{
            background: scrolled ? 'rgba(13,1,24,0.92)' : 'rgba(19,0,36,0.75)',
            backdropFilter: 'blur(24px) saturate(180%)',
            WebkitBackdropFilter: 'blur(24px) saturate(180%)',
            border: scrolled ? '1px solid rgba(167,139,250,0.35)' : '1px solid rgba(167,139,250,0.2)',
            boxShadow: scrolled
              ? '0 8px 40px rgba(88,28,135,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
              : '0 4px 24px rgba(88,28,135,0.3)',
          }}
        >
          {/* Left: Hamburger menu + Mailbox */}
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-10 h-10 shrink-0 flex flex-col items-center justify-center gap-1.5 rounded-xl transition-all duration-200"
              style={{ background: menuOpen ? 'rgba(168,85,247,0.15)' : 'transparent' }}
              aria-label="Menu"
            >
              <span className="block h-0.5 transition-all duration-300 rounded-full" style={{ width: '20px', background: 'linear-gradient(90deg, #c084fc, #a855f7)', transform: menuOpen ? 'rotate(45deg) translate(2px, 6px)' : '', boxShadow: '0 0 6px rgba(168,85,247,0.5)' }} />
              <span className="block h-0.5 transition-all duration-300 rounded-full" style={{ width: '20px', background: 'linear-gradient(90deg, #a855f7, #7c3aed)', opacity: menuOpen ? 0 : 1 }} />
              <span className="block h-0.5 transition-all duration-300 rounded-full" style={{ width: '20px', background: 'linear-gradient(90deg, #7c3aed, #c084fc)', transform: menuOpen ? 'rotate(-45deg) translate(2px, -6px)' : '' }} />
            </button>

            {user && (
              <Link
                href="/inbox"
                aria-label={`Mailbox${unread > 0 ? `, ${unread} unread` : ''}`}
                className="relative flex items-center gap-1.5 h-10 px-2.5 shrink-0 rounded-xl transition-all duration-200"
                style={{
                  color: '#e9d5ff',
                  background: 'rgba(168,85,247,0.10)',
                  border: '1px solid rgba(167,139,250,0.22)',
                }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.2)'}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.10)'}
              >
                <IconMailbox />
                <span className="hidden sm:block text-sm font-semibold">{t('nav.mailbox')}</span>
                {unread > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full text-[11px] font-black text-white"
                    style={{
                      background: 'linear-gradient(135deg, #f43f5e, #ef4444)',
                      boxShadow: '0 0 10px rgba(239,68,68,0.7)',
                      border: '1.5px solid rgba(19,0,36,0.9)',
                    }}
                    translate="no"
                  >
                    {unreadLabel}
                  </span>
                )}
              </Link>
            )}
          </div>

          {/* Center: DR Logo */}
          <div className="flex items-center gap-2">
            <DrLogo size={44} href="/" />
            <span className="hidden sm:block text-xs font-semibold tracking-widest uppercase" style={{ color: 'rgba(196,181,253,0.7)', letterSpacing: '0.15em' }}>
              {t('common.premium')}
            </span>
          </div>

          {/* Right: Profile or Login */}
          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            {loading ? (
              <div className="w-9 h-9 rounded-full animate-pulse" style={{ background: 'rgba(167,139,250,0.2)' }} />
            ) : user ? (
              <Link href="/dashboard" className="flex items-center gap-2.5 group">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: 'linear-gradient(135deg, #e879f9, #a855f7, #7c3aed)',
                    boxShadow: '0 0 16px rgba(168,85,247,0.5), 0 4px 12px rgba(88,28,135,0.4)',
                    border: '1.5px solid rgba(255,255,255,0.15)',
                  }}
                >
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:block font-semibold text-sm max-w-[100px] truncate" style={{ color: '#c084fc' }}>
                  {user.username}
                </span>
              </Link>
            ) : (
              <Link href="/auth/login" className="btn-primary text-sm px-5 py-2">{t('common.signIn')}</Link>
            )}
          </div>
        </div>
      </header>

      {/* Menu overlay */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
          style={{ animation: 'fade-in-scale 0.2s ease forwards' }}
        >
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }} />
          <div
            className="absolute top-[74px] w-72 rounded-2xl p-4 shadow-2xl header-menu-drawer"
            style={{
              background: 'rgba(13,1,24,0.96)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(167,139,250,0.3)',
              boxShadow: '0 20px 60px rgba(88,28,135,0.6), inset 0 1px 0 rgba(255,255,255,0.05)',
              animation: 'slide-in-left 0.2s ease forwards',
            }}
            onClick={e => e.stopPropagation()}
          >
            {user && (
              <div className="flex items-center gap-3 px-4 py-3 mb-3 rounded-xl" style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: 'linear-gradient(135deg, #e879f9, #a855f7, #7c3aed)' }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#e9d5ff' }}>{user.username}</div>
                </div>
              </div>
            )}

            <nav className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{ color: 'rgba(196,181,253,0.85)', animationDelay: `${i * 0.04}s`, fontWeight: 500 }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.12)'; (e.currentTarget as HTMLElement).style.color = '#e9d5ff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'rgba(196,181,253,0.85)' }}
                >
                  <link.Icon />
                  <span>{link.label}</span>
                  {link.badge > 0 ? (
                    <span
                      className="ml-auto min-w-[22px] h-5 px-1.5 flex items-center justify-center rounded-full text-[11px] font-black text-white"
                      style={{ background: 'linear-gradient(135deg, #f43f5e, #ef4444)', boxShadow: '0 0 8px rgba(239,68,68,0.6)' }}
                      translate="no"
                    >
                      {link.badge > 99 ? '99+' : link.badge}
                    </span>
                  ) : (
                    <span className="ml-auto opacity-40 text-xs nav-arrow-flip">→</span>
                  )}
                </Link>
              ))}

              {user && (
                <>
                  <div className="neon-divider my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 w-full text-left"
                    style={{ color: '#f87171', fontWeight: 500 }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.08)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <IconSignOut />
                    <span>{t('common.signOut')}</span>
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
