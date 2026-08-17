'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '@/context/LanguageContext'

const LANGS = [
  { code: 'en' as const, label: 'English', flag: '🇬🇧' },
  { code: 'ar' as const, label: 'العربية', flag: '🇸🇦' },
]

// Compact EN/AR language switcher for the header. Persists via LanguageContext
// and flips the whole document between LTR and RTL.
export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0]

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Language"
        className="flex items-center gap-1.5 h-9 px-2.5 rounded-xl transition-all duration-200"
        style={{
          color: '#e9d5ff',
          background: 'rgba(168,85,247,0.10)',
          border: '1px solid rgba(167,139,250,0.22)',
        }}
      >
        <span translate="no" style={{ fontSize: 16 }}>{current.flag}</span>
        <span className="text-xs font-bold uppercase" translate="no">{current.code}</span>
      </button>

      {open && (
        <div
          className="absolute z-50 mt-2 w-40 rounded-xl p-1.5 end-0"
          style={{
            background: 'rgba(13,1,24,0.97)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(167,139,250,0.3)',
            boxShadow: '0 16px 44px rgba(88,28,135,0.55)',
          }}
        >
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => { setLang(l.code); setOpen(false) }}
              className="flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                color: lang === l.code ? '#ffffff' : 'rgba(196,181,253,0.85)',
                background: lang === l.code ? 'rgba(168,85,247,0.2)' : 'transparent',
              }}
            >
              <span translate="no" style={{ fontSize: 16 }}>{l.flag}</span>
              <span translate="no">{l.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
