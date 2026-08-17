'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useT } from '@/context/LanguageContext'

interface ChatMessage {
  id: string | number
  role: 'user' | 'support' | 'admin'
  text: string
  time: string
  isRead: boolean
}

function getTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getOrCreateSessionId(): string {
  let id = sessionStorage.getItem('dr_chat_session')
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)
    sessionStorage.setItem('dr_chat_session', id)
  }
  return id
}

const AUTO_RESPONSES: { pattern: RegExp; response: string }[] = [
  { pattern: /hello|hi|hey|salut|مرحبا/i, response: "Welcome to DR Support! How can I help you today?" },
  { pattern: /order|commande|طلب/i, response: "For order issues, please share your Order ID (starting with DR...). You can find it in your dashboard under 'My Orders'." },
  { pattern: /payment|pay|paid|paiement|دفع/i, response: "We accept BaridiMob and Bybit TRC20. After payment, click 'I Paid' on the payment page and we'll process your top-up within minutes." },
  { pattern: /how long|delay|time|combien|متى/i, response: "Top-ups are usually processed within 5–30 minutes after payment confirmation. For faster support, you can also reach us on WhatsApp." },
  { pattern: /pubg|uc/i, response: "For PUBG Mobile top-ups, we use your Player ID to deliver UC directly to your account." },
  { pattern: /free fire|diamond|ff/i, response: "For Free Fire Diamonds, we deliver directly using your Player ID. Fast and secure." },
  { pattern: /yalla|ludo/i, response: "For Yalla Ludo, we need your nickname to deliver the diamonds. Make sure to enter the correct nickname." },
  { pattern: /pool|cash/i, response: "For 8 Ball Pool top-ups, we use your Player ID for secure delivery. Pool Cash arrives quickly." },
  { pattern: /whatsapp|contact|phone/i, response: "You can reach us directly on WhatsApp for faster support! Click the WhatsApp button at the bottom of the page." },
  { pattern: /thank|merci|شكرا/i, response: "You're welcome! Is there anything else I can help you with?" },
  { pattern: /problem|issue|error|problème|مشكلة/i, response: "I'm sorry to hear that! Please describe the issue and share your Order ID if you have one. We'll resolve it as quickly as possible." },
]

const INITIAL_MESSAGE: ChatMessage = {
  id: 'init',
  role: 'support',
  text: "Welcome to DR Support.\n\nI'm here to help with top-ups, payments, and orders. How can I assist you today?",
  time: getTime(),
  isRead: true,
}

export default function LiveChat() {
  const { user } = useAuth()
  const t = useT()
  const initialMessage: ChatMessage = { ...INITIAL_MESSAGE, text: t('chat.welcome') }
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage])
  const [input, setInput] = useState('')
  const [unread, setUnread] = useState(0)
  const [typing, setTyping] = useState(false)
  const [floatPhase, setFloatPhase] = useState(0)
  const [sessionId, setSessionId] = useState<string>('')
  const [loaded, setLoaded] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastPollCount = useRef(0)

  // Init session and load history
  useEffect(() => {
    const sid = getOrCreateSessionId()
    setSessionId(sid)
    // Load any existing messages from DB
    fetch(`/api/chat?sessionId=${sid}`)
      .then(r => r.json())
      .then(data => {
        if (data.messages?.length > 0) {
          const mapped: ChatMessage[] = data.messages.map((m: { id: number; role: string; text: string; created_at: string; is_read: boolean }) => ({
            id: m.id,
            role: m.role as 'user' | 'support' | 'admin',
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: m.is_read,
          }))
          setMessages([initialMessage, ...mapped])
          lastPollCount.current = mapped.length
        }
        setLoaded(true)
      })
      .catch(() => setLoaded(true))
  }, [])

  // Floating animation
  useEffect(() => {
    const interval = setInterval(() => setFloatPhase(p => p + 0.05), 50)
    return () => clearInterval(interval)
  }, [])

  // Scroll to bottom
  useEffect(() => {
    if (open && !minimized) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, minimized, typing])

  // Mark as read on open
  useEffect(() => {
    if (open && !minimized) {
      setUnread(0)
      setMessages(prev => prev.map(m => ({ ...m, isRead: true })))
    }
  }, [open, minimized])

  // Poll for admin replies every 3s when chat is open
  useEffect(() => {
    if (!sessionId || !loaded) return
    const poll = async () => {
      try {
        const res = await fetch(`/api/chat?sessionId=${sessionId}`)
        const data = await res.json()
        if (!data.messages) return
        const adminMsgs = data.messages.filter((m: { role: string }) => m.role === 'admin')
        if (adminMsgs.length > lastPollCount.current) {
          // New admin message arrived
          const newMsgs = adminMsgs.slice(lastPollCount.current)
          lastPollCount.current = adminMsgs.length
          const mapped: ChatMessage[] = newMsgs.map((m: { id: number; text: string; created_at: string }) => ({
            id: m.id,
            role: 'admin' as const,
            text: m.text,
            time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isRead: open && !minimized,
          }))
          setMessages(prev => [...prev, ...mapped])
          if (!open || minimized) setUnread(u => u + newMsgs.length)
        }
      } catch {}
    }
    const interval = setInterval(poll, 3000)
    return () => clearInterval(interval)
  }, [sessionId, loaded, open, minimized])

  const saveMessage = useCallback(async (text: string, role: 'user' | 'support') => {
    if (!sessionId) return
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          text,
          role,
          username: user?.username ?? 'Guest',
          email: user?.email ?? '',
        }),
      })
    } catch {}
  }, [sessionId, user])

  const sendAutoResponse = useCallback((userText: string) => {
    setTyping(true)
    let responseText = "Thanks for your message! Our support team will review it and reply shortly. For immediate help, you can also contact us on WhatsApp."
    for (const { pattern, response } of AUTO_RESPONSES) {
      if (pattern.test(userText)) { responseText = response; break }
    }
    const delay = 800 + Math.random() * 1200
    setTimeout(() => {
      setTyping(false)
      const msg: ChatMessage = {
        id: `auto-${Date.now()}`,
        role: 'support',
        text: responseText,
        time: getTime(),
        isRead: false,
      }
      setMessages(prev => [...prev, msg])
      if (!open || minimized) setUnread(u => u + 1)
      saveMessage(responseText, 'support')
    }, delay)
  }, [open, minimized, saveMessage])

  function handleSend() {
    const text = input.trim()
    if (!text) return
    const msg: ChatMessage = { id: `user-${Date.now()}`, role: 'user', text, time: getTime(), isRead: true }
    setMessages(prev => [...prev, msg])
    setInput('')
    saveMessage(text, 'user')
    sendAutoResponse(text)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const floatY = Math.sin(floatPhase) * 5

  return (
    <>
      {/* Floating Button */}
      <div
        className="fixed z-50 select-none"
        style={{ bottom: `calc(24px + ${floatY}px)`, right: '24px', transition: 'bottom 0.1s linear' }}
      >
        <button
          onClick={() => {
            if (!open) { setOpen(true); setMinimized(false) }
            else setMinimized(!minimized)
          }}
          className="relative flex items-center justify-center transition-all duration-300"
          style={{
            width: '58px', height: '58px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #a855f7, #7c3aed, #6d28d9)',
            boxShadow: open
              ? '0 0 30px rgba(168,85,247,0.7), 0 8px 30px rgba(88,28,135,0.6)'
              : '0 0 20px rgba(168,85,247,0.5), 0 6px 20px rgba(88,28,135,0.4)',
            border: '2px solid rgba(255,255,255,0.15)',
            transform: open ? 'scale(1.05)' : 'scale(1)',
          }}
          title={t('chat.liveSupport')}
          aria-label={t('chat.openChat')}
        >
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
            </svg>
          )}
          {!open && unread > 0 && (
            <span
              className="absolute -top-1 -right-1 flex items-center justify-center text-white font-bold"
              style={{
                width: '20px', height: '20px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                fontSize: '0.65rem',
                boxShadow: '0 0 8px rgba(239,68,68,0.7)',
                animation: 'badge-bounce 1s ease-in-out infinite',
              }}
            >
              {unread > 9 ? '9+' : unread}
            </span>
          )}
          <span
            className="absolute inset-0 rounded-full"
            style={{
              border: '2px solid rgba(168,85,247,0.4)',
              animation: 'spin-slow 3s linear infinite',
              opacity: open ? 0 : 0.6,
            }}
          />
        </button>
      </div>

      {/* Chat Window */}
      {open && (
        <div
          className="fixed z-50"
          style={{
            bottom: '100px', right: '24px',
            width: 'min(380px, calc(100vw - 48px))',
            borderRadius: '20px', overflow: 'hidden',
            background: 'rgba(10,1,20,0.97)',
            backdropFilter: 'blur(30px)',
            border: '1px solid rgba(167,139,250,0.3)',
            boxShadow: '0 24px 80px rgba(88,28,135,0.6), 0 8px 32px rgba(0,0,0,0.5)',
            animation: 'fade-in-scale 0.25s ease forwards',
            transformOrigin: 'bottom right',
            display: 'flex', flexDirection: 'column',
            maxHeight: minimized ? '60px' : '520px',
            transition: 'max-height 0.35s cubic-bezier(0.34,1.56,0.64,1)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 flex-shrink-0 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(109,40,217,0.5), rgba(88,28,135,0.4))',
              borderBottom: minimized ? 'none' : '1px solid rgba(167,139,250,0.2)',
            }}
            onClick={() => setMinimized(!minimized)}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 0 12px rgba(168,85,247,0.5)' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                </svg>
              </div>
              <div>
                <div className="font-bold text-sm" style={{ color: '#f5f3ff' }} translate="no">{t('chat.name')}</div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34d399', boxShadow: '0 0 4px #34d399' }} />
                  <span className="text-xs" style={{ color: 'rgba(196,181,253,0.7)' }}>{t('chat.online')}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={e => { e.stopPropagation(); setMinimized(!minimized) }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(196,181,253,0.8)', fontSize: '0.8rem' }}
              >
                {minimized ? '▲' : '▼'}
              </button>
              <button
                onClick={e => { e.stopPropagation(); setOpen(false) }}
                className="w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(196,181,253,0.8)', fontSize: '0.8rem' }}
              >
                ✕
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
                style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(168,85,247,0.3) transparent' }}
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    style={{ animation: 'float-up 0.3s ease forwards' }}
                  >
                    {(msg.role === 'support' || msg.role === 'admin') && (
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 self-end mb-1"
                        style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)', boxShadow: '0 0 8px rgba(168,85,247,0.4)' }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                      </div>
                    )}
                    <div style={{ maxWidth: '78%' }}>
                      {msg.role === 'admin' && (
                        <div className="text-xs mb-1 font-bold" style={{ color: '#a855f7' }} translate="no">{t('chat.name')}</div>
                      )}
                      <div
                        className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed"
                        style={msg.role === 'user' ? {
                          background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
                          color: 'white',
                          borderRadius: '18px 18px 4px 18px',
                          boxShadow: '0 4px 12px rgba(109,40,217,0.3)',
                        } : {
                          background: msg.role === 'admin' ? 'rgba(168,85,247,0.12)' : 'rgba(255,255,255,0.06)',
                          border: msg.role === 'admin' ? '1px solid rgba(168,85,247,0.35)' : '1px solid rgba(167,139,250,0.2)',
                          color: '#e9d5ff',
                          borderRadius: '18px 18px 18px 4px',
                        }}
                      >
                        {msg.text.split('\n').map((line, i, arr) => (
                          <span key={i}>{line.replace(/\*\*(.*?)\*\*/g, '$1')}{i < arr.length - 1 && <br />}</span>
                        ))}
                      </div>
                      <div
                        className={`text-xs mt-1 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}
                        style={{ color: 'rgba(196,181,253,0.4)' }}
                      >
                        {msg.time}
                      </div>
                    </div>
                  </div>
                ))}
                {typing && (
                  <div className="flex justify-start" style={{ animation: 'float-up 0.3s ease forwards' }}>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mr-2 self-end mb-1"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #7c3aed)' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                      </svg>
                    </div>
                    <div
                      className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '18px 18px 18px 4px' }}
                    >
                      {[0, 1, 2].map(i => (
                        <span key={i} className="w-2 h-2 rounded-full" style={{ background: '#a855f7', animation: `badge-bounce 1.2s ${i * 0.2}s ease-in-out infinite`, boxShadow: '0 0 4px rgba(168,85,247,0.5)' }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick replies */}
              <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0" style={{ borderTop: '1px solid rgba(167,139,250,0.1)', scrollbarWidth: 'none' }}>
                {([
                  ['Payment help', t('chat.quickPayment')],
                  ['Order status', t('chat.quickStatus')],
                  ['How long?',    t('chat.quickHowLong')],
                  ['Contact',      t('chat.quickContact')],
                ] as [string, string][]).map(([value, label]) => (
                  <button
                    key={value}
                    onClick={() => { setInput(value); setTimeout(() => inputRef.current?.focus(), 0) }}
                    className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', color: '#c084fc', fontWeight: 600, whiteSpace: 'nowrap' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.2)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'rgba(168,85,247,0.1)'}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="flex items-center gap-2 px-3 pb-3 pt-2 flex-shrink-0" style={{ borderTop: '1px solid rgba(167,139,250,0.1)' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={user ? t('chat.messageAs', { username: user.username }) : t('chat.typeMessage')}
                  className="flex-1 text-sm outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(167,139,250,0.2)',
                    borderRadius: '12px',
                    padding: '0.6rem 0.9rem',
                    color: '#e9d5ff',
                    fontFamily: 'var(--font-poppins), Poppins, sans-serif',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="flex items-center justify-center transition-all duration-200 flex-shrink-0"
                  style={{
                    width: '38px', height: '38px', borderRadius: '10px',
                    background: input.trim() ? 'linear-gradient(135deg, #a855f7, #7c3aed)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(167,139,250,0.2)',
                    color: input.trim() ? 'white' : 'rgba(167,139,250,0.4)',
                    cursor: input.trim() ? 'pointer' : 'default',
                    boxShadow: input.trim() ? '0 0 12px rgba(168,85,247,0.3)' : 'none',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/>
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
